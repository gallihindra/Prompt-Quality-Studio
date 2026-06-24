import { describe, expect, it } from "vitest";
import { createCanonicalPrompt } from "./canonical-prompt";
import { analyzePrompt } from "./prompt-analysis";
import { createEmptyFieldValues, type PromptFieldValues, type PromptType } from "./prompt-forms";
import { getPromptHealth } from "./prompt-health";

function healthFor(
  rawPrompt: string,
  promptType: PromptType,
  fields: PromptFieldValues,
) {
  return getPromptHealth({
    rawPrompt,
    promptType,
    fields,
    analysis: analyzePrompt(rawPrompt),
    canonicalPrompt: createCanonicalPrompt(rawPrompt, promptType),
  });
}

describe("Prompt Health Coach", () => {
  it("flags career source material risk when target role exists but source content is missing", () => {
    const health = healthFor(
      "Improve my experience description for a customer success role.",
      "career_resume",
      {
        ...createEmptyFieldValues("career_resume"),
        targetRole: "Customer Success Role",
        goal: "Resume bullets",
      },
    );

    expect(health.risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Source material is missing",
          severity: "high",
        }),
      ]),
    );
    expect(health.strengths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Target role is defined" }),
      ]),
    );
  });

  it("treats career source material and target role as strengths when present", () => {
    const health = healthFor(
      "Improve my resume for a customer success role. Experience: managed onboarding for 20 enterprise accounts, led renewal check-ins, improved documentation, achieved faster handoffs, and supported customer health reviews using only the details provided.",
      "career_resume",
      {
        ...createEmptyFieldValues("career_resume"),
        targetRole: "Customer Success Role",
        goal: "Resume bullets",
        seniority: "mid",
        tone: "Professional",
      },
    );

    expect(health.risks).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Source material is missing" }),
      ]),
    );
    expect(health.strengths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Source material is provided" }),
        expect.objectContaining({ title: "Target role is defined" }),
      ]),
    );
  });

  it("flags missing learning timeline and study time when topic exists", () => {
    const health = healthFor("ajari aku machine learning", "learning_plan", {
      ...createEmptyFieldValues("learning_plan"),
      topic: "machine learning",
    });

    expect(health.risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Timeline is missing" }),
        expect.objectContaining({ title: "Weekly study time is missing" }),
      ]),
    );
    expect(health.nextBestField?.fieldId).toBe("currentLevel");
  });

  it("moves learning guidance after timeline and study time are filled", () => {
    const health = healthFor("ajari aku machine learning", "learning_plan", {
      ...createEmptyFieldValues("learning_plan"),
      topic: "machine learning",
      currentLevel: "Beginner",
      timeline: "4 weeks",
      timePerWeek: "5 hours/week",
    });

    expect(health.risks).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Timeline is missing" }),
        expect.objectContaining({ title: "Weekly study time is missing" }),
      ]),
    );
    expect(health.strengths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Timeline is defined" }),
        expect.objectContaining({ title: "Study time is defined" }),
      ]),
    );
    expect(health.nextBestField?.fieldId).toBe("goal");
  });

  it("flags business idea budget and location gaps", () => {
    const health = healthFor("kasih ide bisnis", "business_idea", {
      ...createEmptyFieldValues("business_idea"),
    });

    expect(health.risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Budget is missing" }),
        expect.objectContaining({ title: "Market/location is missing" }),
      ]),
    );
    expect(health.nextBestField?.fieldId).toBe("budget");
  });

  it("flags content writing audience and platform gaps", () => {
    const health = healthFor("write about AI adoption", "content_writing", {
      ...createEmptyFieldValues("content_writing"),
      topic: "AI adoption",
    });

    expect(health.risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Platform is missing" }),
        expect.objectContaining({ title: "Audience is missing" }),
      ]),
    );
    expect(health.nextBestField?.fieldId).toBe("platform");
  });

  it("flags product planning target user and success metric gaps", () => {
    const health = healthFor("help me plan an app", "product_planning", {
      ...createEmptyFieldValues("product_planning"),
      productType: "app",
      stage: "MVP planning",
      problem: "Users need a simpler way to manage events",
    });

    expect(health.risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Target user is missing" }),
        expect.objectContaining({ title: "Success metric is missing" }),
      ]),
    );
  });

  it("flags general output format gap", () => {
    const health = healthFor("Help me prepare a recommendation", "general", {
      ...createEmptyFieldValues("general"),
      goal: "Prepare a recommendation",
      context: "We are choosing between tools",
      audience: "Operations leaders",
    });

    expect(health.risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Output format is missing" }),
      ]),
    );
    expect(health.nextBestField?.fieldId).toBe("outputFormat");
  });

  it("changes next best field after a high-priority field is filled", () => {
    const before = healthFor("write about AI adoption", "content_writing", {
      ...createEmptyFieldValues("content_writing"),
      topic: "AI adoption",
    });
    const after = healthFor("write about AI adoption", "content_writing", {
      ...createEmptyFieldValues("content_writing"),
      platform: "LinkedIn post",
      topic: "AI adoption",
    });

    expect(before.nextBestField?.fieldId).toBe("platform");
    expect(after.nextBestField?.fieldId).toBe("audience");
  });

  it("only shows output format strength when the field is present", () => {
    const withoutFormat = healthFor("Help me compare options", "general", {
      ...createEmptyFieldValues("general"),
      goal: "Compare options",
      context: "We are choosing a tool",
      audience: "Team leads",
    });
    const withFormat = healthFor("Help me compare options", "general", {
      ...createEmptyFieldValues("general"),
      goal: "Compare options",
      context: "We are choosing a tool",
      audience: "Team leads",
      outputFormat: "Table",
    });

    expect(withoutFormat.strengths).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Output format is selected" }),
      ]),
    );
    expect(withFormat.strengths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Output format is selected" }),
      ]),
    );
  });
});
