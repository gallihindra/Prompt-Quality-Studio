import { describe, expect, it } from "vitest";
import { analyzePrompt, getDimension } from "./prompt-analysis";

const expectMissing = (
  prompt: string,
  dimensions: Array<"context" | "constraints" | "output" | "audience">,
) => {
  const analysis = analyzePrompt(prompt);

  for (const key of dimensions) {
    const dimension = getDimension(analysis, key);
    expect(dimension.score / dimension.max).toBeLessThan(0.65);
  }
};

describe("analyzePrompt", () => {
  describe("very weak prompts", () => {
    it.each([
      "Write something.",
      "kasih ide bisnis",
      "help me",
    ])("keeps %j low and vague", (prompt) => {
      const analysis = analyzePrompt(prompt);

      expect(analysis.score).toBeLessThan(40);
      expect(analysis.label).toBe("Vague");
      expectMissing(prompt, ["context", "output"]);
      expect(analysis.gaps).toContain(
        "State the exact task, desired result, and success criteria.",
      );
    });
  });

  describe("medium prompts", () => {
    it.each([
      "Give me online business ideas for Indonesia with low budget.",
      "Write a LinkedIn post about AI adoption for managers.",
      "Help me improve my resume for an AI operations role.",
    ])("places %j in a middle score band", (prompt) => {
      const analysis = analyzePrompt(prompt);

      expect(analysis.score).toBeGreaterThanOrEqual(40);
      expect(analysis.score).toBeLessThan(80);
      expect(["Developing", "Workable"]).toContain(analysis.label);
      expect(getDimension(analysis, "context").score).toBeGreaterThan(3);
      expect(analysis.signals.successCriteria).toBe(false);
    });

    it("still identifies missing constraints where they are absent", () => {
      const analysis = analyzePrompt(
        "Help me improve my resume for an AI operations role.",
      );

      expect(getDimension(analysis, "constraints").score).toBeLessThan(14);
      expect(analysis.gaps).toContain(
        "Set scope, tone, length, and exclusions.",
      );
    });
  });

  describe("strong prompts", () => {
    it("rewards specific constraints, structure, audience, and evaluation requirements", () => {
      const analysis = analyzePrompt(
        "Act as a business advisor for a first-time founder in Indonesia. Give me 10 online business ideas with starting capital under Rp5 million. Prioritize ideas that can be started from home, require minimal inventory, and generate revenue within 1–3 months. For each idea, include target customer, startup cost, first 3 steps, risks, validation method, and rank them by speed to first revenue.",
      );

      expect(analysis.score).toBeGreaterThanOrEqual(80);
      expect(analysis.label).toBe("Strong");
      expect(getDimension(analysis, "output").score).toBeGreaterThanOrEqual(14);
      expect(getDimension(analysis, "constraints").score).toBeGreaterThanOrEqual(14);
      expect(getDimension(analysis, "audience").score).toBeGreaterThanOrEqual(10);
      expect(analysis.signals.successCriteria).toBe(true);
    });

    it("recognizes a structured learning roadmap as strong", () => {
      const analysis = analyzePrompt(`Act as a structured learning coach.

Help me learn machine learning as a beginner. I want to understand how AI works and how machine learning is used in practice.

Create a 4-week roadmap for someone who can study around 5 hours per week. Use a theory-first approach, but include simple practice activities and one small applied project.

The roadmap should include:
1. weekly milestones
2. key concepts to learn
3. practice activities
4. checkpoints to evaluate progress
5. completion criteria`);

      expect(analysis.score).toBe(93);
      expect(analysis.label).toBe("Strong");
      expect(getDimension(analysis, "context").score).toBeGreaterThanOrEqual(17);
      expect(getDimension(analysis, "output").score).toBeGreaterThanOrEqual(17);
      expect(analysis.signals.successCriteria).toBe(true);
    });
  });

  describe("known false positives", () => {
    it.each([
      "Write a paragraph for a dog.",
      "Make a thing.",
      "Give me ideas for stuff.",
    ])("does not overrate %j", (prompt) => {
      const analysis = analyzePrompt(prompt);

      expect(analysis.score).toBeLessThan(60);
      expect(analysis.label).not.toBe("Strong");
      expect(getDimension(analysis, "context").score).toBeLessThan(14);
      expect(analysis.signals.successCriteria).toBe(false);
      expect(analysis.gaps).toContain(
        "State the exact task, desired result, and success criteria.",
      );
    });
  });

  describe("professional audience phrases", () => {
    it.each([
      "Write a short email for HR leaders about AI training.",
      "Create a presentation outline for product managers.",
    ])("detects the audience in %j", (prompt) => {
      const analysis = analyzePrompt(prompt);

      expect(getDimension(analysis, "audience").score).toBeGreaterThanOrEqual(10);
      expect(analysis.strengths).toContain("Audience");
    });
  });
});
