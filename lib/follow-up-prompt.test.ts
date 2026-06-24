import { describe, expect, it } from "vitest";
import {
  buildFollowUpPrompt,
  getFollowUpFixes,
  normalizeFollowUpInput,
  summarizeSelectedIssues,
  type FollowUpInput,
} from "./follow-up-prompt";

const base: FollowUpInput = {
  originalPrompt: "Help me learn machine learning",
  aiOutput: "Machine learning is a broad field...",
  issues: ["too_generic"],
  desiredImprovement: "Create a practical four-week beginner roadmap",
};

describe("Follow-up prompt builder", () => {
  it("summarizes multiple selected issues", () => {
    expect(summarizeSelectedIssues(["too_generic", "not_actionable"])).toBe(
      "too generic, and not actionable",
    );
  });

  it("requests examples when examples are missing", () => {
    const input: FollowUpInput = { ...base, issues: ["missing_examples"] };
    expect(buildFollowUpPrompt(input)).toContain("missing examples");
    expect(getFollowUpFixes(input)).toContain("Requests concrete examples");
  });

  it("handles a requested-format failure", () => {
    const prompt = buildFollowUpPrompt({
      ...base,
      issues: ["wrong_format"],
      desiredFormat: "A table with weekly milestones",
    });
    expect(prompt).toContain("did not follow the requested format");
    expect(prompt).toContain("Format: A table with weekly milestones");
  });

  it("adds factual caution for resume follow-ups", () => {
    const prompt = buildFollowUpPrompt({
      ...base,
      originalPrompt: "Improve my resume for a product manager role",
      desiredImprovement: "Rewrite the experience bullets",
    });
    expect(prompt).toContain("Do not invent achievements, metrics, employers");
  });

  it("includes desired tone, depth, and constraints", () => {
    const prompt = buildFollowUpPrompt({
      ...base,
      desiredTone: "Direct and encouraging",
      desiredDepth: "Beginner-friendly but detailed",
      constraints: "Keep the plan under five hours per week",
    });
    expect(prompt).toContain("Tone: Direct and encouraging");
    expect(prompt).toContain("Depth: Beginner-friendly but detailed");
    expect(prompt).toContain("Keep the plan under five hours per week");
  });

  it("includes suggestion-style format selections in the generated prompt", () => {
    const prompt = buildFollowUpPrompt({
      ...base,
      desiredFormat: "Step-by-step guide",
    });

    expect(prompt).toContain("Format: Step-by-step guide");
  });

  it("includes suggestion-style tone and depth selections in the generated prompt", () => {
    const prompt = buildFollowUpPrompt({
      ...base,
      desiredTone: "Clear and direct",
      desiredDepth: "Practical guide",
    });

    expect(prompt).toContain("Tone: Clear and direct");
    expect(prompt).toContain("Depth: Practical guide");
  });

  it("preserves multiple selected constraint suggestions", () => {
    const prompt = buildFollowUpPrompt({
      ...base,
      constraints:
        "Keep original goal, Do not invent facts, Use only provided information",
    });

    expect(prompt).toContain(
      "Context or constraints to preserve: Keep original goal, Do not invent facts, Use only provided information",
    );
  });

  it("preserves manual custom values", () => {
    const prompt = buildFollowUpPrompt({
      ...base,
      desiredFormat: "Two sections: quick diagnosis and revised answer",
      desiredTone: "Calm but firm",
      desiredDepth: "Enough detail for a first-time manager",
      constraints: "Keep the example tied to remote onboarding",
    });

    expect(prompt).toContain(
      "Format: Two sections: quick diagnosis and revised answer",
    );
    expect(prompt).toContain("Tone: Calm but firm");
    expect(prompt).toContain("Depth: Enough detail for a first-time manager");
    expect(prompt).toContain("Keep the example tied to remote onboarding");
  });

  it("omits empty optional fields", () => {
    const prompt = buildFollowUpPrompt(base);
    expect(prompt).not.toContain("Format:");
    expect(prompt).not.toContain("Tone:");
    expect(prompt).not.toContain("Depth:");
  });

  it("normalizes duplicate issues and whitespace", () => {
    expect(normalizeFollowUpInput({
      ...base,
      originalPrompt: "  Help   me learn  ",
      issues: ["too_generic", "too_generic"],
    })).toMatchObject({
      originalPrompt: "Help me learn",
      issues: ["too_generic"],
    });
  });

  it("generates natural Indonesian for Indonesian or mixed input", () => {
    const prompt = buildFollowUpPrompt({
      ...base,
      originalPrompt: "ajari aku machine learning untuk pemula",
      issues: ["too_generic", "not_actionable"],
      desiredImprovement: "Buat roadmap 4 minggu dengan latihan sederhana",
      desiredTone: "Santai dan jelas",
    });
    expect(prompt).toContain("Tolong revisi jawaban tersebut");
    expect(prompt).toContain("Nada: Santai dan jelas");
    expect(prompt).not.toContain("Bertindak sebagai");
    expect(prompt).not.toContain("keluaran");
  });
});
