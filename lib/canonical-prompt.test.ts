import { describe, expect, it } from "vitest";
import {
  createCanonicalPrompt,
  detectPromptLanguage,
} from "./canonical-prompt";

describe("canonical prompt interpretation", () => {
  it("interprets a short Indonesian learning prompt without treating inferred intent as explicit", () => {
    const canonical = createCanonicalPrompt(
      "ajari aku machine learning",
      "learning_plan",
    );

    expect(canonical.language).toBe("id");
    expect(canonical.primaryCategory).toBe("learning_plan");
    expect(canonical.primaryCategoryLabel).toBe("Learning plan");
    expect(canonical.categoryConfidence).toBe("high");
    expect(canonical.extractedFields).toEqual(
      expect.arrayContaining([
        { label: "Topic", value: "machine learning", source: "explicit" },
        {
          label: "Likely intent",
          value: "create a learning plan",
          source: "inferred",
        },
      ]),
    );
    expect(canonical.missingFields).toEqual(
      expect.arrayContaining([
        "current level",
        "timeline",
        "weekly study time",
        "preferred learning style",
        "output format",
      ]),
    );
    expect(
      canonical.extractedFields.find(
        (field) =>
          field.label === "Likely intent" &&
          field.value === "create a learning plan",
      )?.source,
    ).toBe("inferred");
  });

  it("interprets an English resume prompt and flags source material ambiguity", () => {
    const canonical = createCanonicalPrompt(
      "please improve my resume",
      "career_resume",
    );

    expect(canonical.language).toBe("en");
    expect(canonical.primaryCategory).toBe("career_resume");
    expect(canonical.extractedFields).toEqual(
      expect.arrayContaining([
        { label: "Task", value: "improve resume", source: "explicit" },
      ]),
    );
    expect(canonical.missingFields).toEqual(
      expect.arrayContaining([
        "target role",
        "seniority",
        "career deliverable",
        "tone",
        "ATS preference",
        "source resume or career material",
      ]),
    );
    expect(canonical.ambiguityNotes).toEqual(
      expect.arrayContaining([
        "Source resume content is needed before a factual rewrite can be produced.",
      ]),
    );
  });

  it("interprets an Indonesian business prompt as business ideation", () => {
    const canonical = createCanonicalPrompt(
      "kasih ide bisnis",
      "business_idea",
    );

    expect(canonical.language).toBe("id");
    expect(canonical.primaryCategory).toBe("business_idea");
    expect(canonical.extractedFields).toEqual(
      expect.arrayContaining([
        {
          label: "Task",
          value: "generate business ideas",
          source: "explicit",
        },
        {
          label: "Likely intent",
          value: "compare practical business opportunities",
          source: "inferred",
        },
      ]),
    );
    expect(canonical.missingFields).toEqual(
      expect.arrayContaining([
        "business model",
        "starting budget",
        "target location",
        "time commitment",
        "primary business goal",
        "output format",
      ]),
    );
  });

  it("interprets a product planning prompt and extracts the product idea", () => {
    const canonical = createCanonicalPrompt(
      "help me plan an app",
      "product_planning",
    );

    expect(canonical.language).toBe("en");
    expect(canonical.primaryCategory).toBe("product_planning");
    expect(canonical.extractedFields).toEqual(
      expect.arrayContaining([
        {
          label: "Product or feature",
          value: "app",
          source: "explicit",
        },
        {
          label: "Likely intent",
          value: "create a scoped product planning artifact",
          source: "inferred",
        },
      ]),
    );
    expect(canonical.missingFields).toEqual(
      expect.arrayContaining([
        "target user",
        "problem to solve",
        "product stage",
        "success metric",
        "planning format",
      ]),
    );
  });

  it("surfaces mixed-language prompts and category mismatch notes", () => {
    expect(detectPromptLanguage("help me buatkan resume")).toBe("mixed");

    const canonical = createCanonicalPrompt(
      "help me buatkan resume",
      "learning_plan",
    );

    expect(canonical.language).toBe("mixed");
    expect(canonical.primaryCategory).toBe("learning_plan");
    expect(canonical.mismatchNote).toContain("Career & resume");
    expect(
      canonical.extractedFields.filter((field) => field.source === "explicit"),
    ).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Likely intent" }),
      ]),
    );
  });
});
