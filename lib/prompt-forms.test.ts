import { describe, expect, it } from "vitest";
import {
  PROMPT_TYPE_CONFIGS,
  createEmptyFieldValues,
  getMissingRequiredFields,
} from "./prompt-forms";

describe("prompt form guided suggestions", () => {
  it("adds Studio suggestions to high-friction prompt types", () => {
    expect(
      PROMPT_TYPE_CONFIGS.content_writing.fields.find(
        (field) => field.key === "platform",
      )?.suggestions,
    ).toContain("LinkedIn post");
    expect(
      PROMPT_TYPE_CONFIGS.learning_plan.fields.find(
        (field) => field.key === "timeline",
      )?.suggestions,
    ).toContain("4 weeks");
    expect(
      PROMPT_TYPE_CONFIGS.business_idea.fields.find(
        (field) => field.key === "outputFormat",
      )?.suggestions,
    ).toContain("Validation plan");
    expect(
      PROMPT_TYPE_CONFIGS.career_resume.fields.find(
        (field) => field.key === "targetRole",
      )?.suggestions,
    ).toContain("AI Operations Manager");
    expect(
      PROMPT_TYPE_CONFIGS.product_planning.fields.find(
        (field) => field.key === "successMetric",
      )?.suggestions,
    ).toContain("Quality improvement");
    expect(
      PROMPT_TYPE_CONFIGS.general.fields.find(
        (field) => field.key === "constraints",
      )?.suggestions,
    ).toContain("Avoid assumptions");
  });

  it("keeps required-field validation based on final field values", () => {
    const values = createEmptyFieldValues("learning_plan");
    expect(getMissingRequiredFields("learning_plan", values).length).toBeGreaterThan(0);

    const completedValues = {
      ...values,
      topic: "machine learning",
      currentLevel: "Complete beginner",
      goal: "understand how machine learning works in practice",
      timeline: "4 weeks",
      timePerWeek: "5 hours/week",
      outputFormat: "Weekly roadmap",
    };

    expect(getMissingRequiredFields("learning_plan", completedValues)).toEqual([]);
  });

  it("allows optional guided fields to remain empty", () => {
    const values = {
      ...createEmptyFieldValues("general"),
      goal: "Help me compare options",
      context: "We are choosing a workflow tool",
      audience: "Operations leaders",
      outputFormat: "Pros and cons",
      constraints: "",
    };

    expect(getMissingRequiredFields("general", values)).toEqual([]);
  });
});
