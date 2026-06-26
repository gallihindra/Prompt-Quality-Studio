import { describe, expect, it } from "vitest";
import { getPromptQualityDelta } from "./prompt-quality-delta";

const structuredPrompt = `Act as a practical business advisor.

Help me evaluate online business ideas for a first-time founder in Indonesia.

Use these constraints:
- starting budget under Rp5 million
- can be started from home
- minimal inventory
- realistic path to revenue within 1–3 months

Output format:
Provide a ranked table with 10 ideas. For each idea, include target customer, startup cost, first 3 steps, key risks, validation method, and reason for ranking.

Do not invent facts or assume resources I did not provide.`;

describe("prompt quality delta", () => {
  it("shows a positive score delta for a vague prompt compared with a structured prompt", () => {
    const delta = getPromptQualityDelta("kasih ide bisnis", structuredPrompt);

    expect(delta.improvedScore).toBeGreaterThan(delta.originalScore);
    expect(delta.delta).toBeGreaterThan(0);
    expect(delta.originalStatus).toBe("weak");
    expect(delta.improvedStatus).toBe("strong");
  });

  it("detects output format improvements", () => {
    const delta = getPromptQualityDelta(
      "Give me business ideas",
      structuredPrompt,
    );

    expect(delta.improvements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Output format is defined" }),
      ]),
    );
  });

  it("detects stronger constraints", () => {
    const delta = getPromptQualityDelta(
      "Give me business ideas",
      structuredPrompt,
    );

    expect(delta.improvements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Constraints are stronger" }),
      ]),
    );
  });

  it("detects factuality guardrails added by the improved prompt", () => {
    const delta = getPromptQualityDelta(
      "please improve my resume",
      "Act as a career editor. Improve the resume bullets for a product operations role. Do not invent achievements, employers, responsibilities, metrics, qualifications, or experience. Return concise resume bullets.",
    );

    expect(delta.improvements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Factuality risk is reduced" }),
      ]),
    );
  });

  it("handles an empty improved prompt without throwing", () => {
    const delta = getPromptQualityDelta("help me", "");

    expect(delta.improvedScore).toBeGreaterThanOrEqual(0);
    expect(delta.delta).toBeLessThanOrEqual(0);
    expect(delta.improvements).toEqual([]);
  });

  it("returns a concise improvement list", () => {
    const delta = getPromptQualityDelta("help me", structuredPrompt);

    expect(delta.improvements.length).toBeLessThanOrEqual(5);
  });
});
