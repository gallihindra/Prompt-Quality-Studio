import { describe, expect, it } from "vitest";
import {
  applyPrefillToUntouchedFields,
  deriveClarificationPrefillValues,
} from "./clarification-prefill";

describe("clarification field prefill", () => {
  it("prefills career target role and deliverable from explicit wording", () => {
    const prefill = deriveClarificationPrefillValues(
      "Improve my experience description for a customer success role.",
      "career_resume",
    );

    expect(prefill.values.targetRole).toContain("Customer Success");
    expect(prefill.values.goal).toBe("Resume bullets");
    expect(prefill.sources).toMatchObject({
      targetRole: "explicit",
      goal: "explicit",
    });
  });

  it("prefills a learning topic from an Indonesian learning prompt", () => {
    const prefill = deriveClarificationPrefillValues(
      "ajari aku machine learning",
      "learning_plan",
    );

    expect(prefill.values).toMatchObject({
      topic: "machine learning",
    });
    expect(prefill.values.timeline).toBeUndefined();
  });

  it("prefills learning topic and timeline when both are explicit", () => {
    const prefill = deriveClarificationPrefillValues(
      "ajari aku machine learning selama 4 minggu",
      "learning_plan",
    );

    expect(prefill.values).toMatchObject({
      topic: "machine learning",
      timeline: "4 minggu",
    });
  });

  it("prefills learning level only when explicitly mentioned", () => {
    const prefill = deriveClarificationPrefillValues(
      "ajari aku machine learning untuk pemula",
      "learning_plan",
    );

    expect(prefill.values).toMatchObject({
      topic: "machine learning",
      currentLevel: "Beginner",
    });
  });

  it("prefills content platform and topic from explicit wording", () => {
    const prefill = deriveClarificationPrefillValues(
      "write a LinkedIn post about AI adoption",
      "content_writing",
    );

    expect(prefill.values).toMatchObject({
      platform: "LinkedIn post",
      topic: "AI adoption",
    });
  });

  it("prefills Indonesian content platform and topic", () => {
    const prefill = deriveClarificationPrefillValues(
      "bikinin caption Instagram tentang turnamen tenis",
      "content_writing",
    );

    expect(prefill.values).toMatchObject({
      platform: "Instagram caption",
      topic: "turnamen tenis",
    });
  });

  it("prefills business budget and location from explicit wording", () => {
    const prefill = deriveClarificationPrefillValues(
      "kasih ide bisnis modal kecil di Indonesia",
      "business_idea",
    );

    expect(prefill.values).toMatchObject({
      budget: "Low-cost only",
      location: "Indonesia",
    });
  });

  it("prefills product stage and product idea from explicit wording", () => {
    const prefill = deriveClarificationPrefillValues(
      "help me plan an MVP for a tournament app",
      "product_planning",
    );

    expect(prefill.values).toMatchObject({
      stage: "MVP planning",
      productType: "tournament app",
    });
    expect(prefill.values.successMetric).toBeUndefined();
  });

  it("prefills general output format and constraints only when explicit", () => {
    const prefill = deriveClarificationPrefillValues(
      "make it a table and keep it short",
      "general",
    );

    expect(prefill.values).toMatchObject({
      outputFormat: "Table",
      constraints: "Keep it concise",
    });
  });

  it("does not prefill inferred-only values", () => {
    const prefill = deriveClarificationPrefillValues(
      "help me",
      "learning_plan",
    );

    expect(prefill.values).toEqual({});
    expect(prefill.sources).toEqual({});
  });

  it("does not overwrite fields the user already touched", () => {
    const nextValues = applyPrefillToUntouchedFields({
      currentValues: {
        targetRole: "Product Manager",
        goal: "",
      },
      prefillValues: {
        targetRole: "Customer Success Role",
        goal: "Resume bullets",
      },
      touchedFields: new Set(["targetRole"]),
    });

    expect(nextValues).toMatchObject({
      targetRole: "Product Manager",
      goal: "Resume bullets",
    });
  });
});
