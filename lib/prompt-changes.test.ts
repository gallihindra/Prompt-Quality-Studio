import { describe, expect, it } from "vitest";

import { analyzePrompt } from "./prompt-analysis";
import { getPromptChanges } from "./prompt-changes";

describe("getPromptChanges", () => {
  it("explains business constraints and validation", () => {
    const changes = getPromptChanges(
      "business_idea",
      analyzePrompt("kasih ide bisnis"),
      {
        businessModel: "online",
        budget: "under Rp1 million",
        location: "Indonesia",
        timeCommitment: "part-time",
        riskAppetite: "low",
      },
    );

    const titles = changes.map((change) => change.title);
    expect(titles).toContain("Added a budget constraint");
    expect(titles).toContain("Added market context");
    expect(titles).toContain("Added validation criteria");
  });

  it("includes career factuality and conditional ATS guidance", () => {
    const analysis = analyzePrompt("please improve my resume");
    const baseFields = {
      targetRole: "AI operations manager",
      seniority: "manager",
      goal: "resume bullet",
      tone: "confident",
    };

    const withoutAts = getPromptChanges("career_resume", analysis, {
      ...baseFields,
      atsFocus: "no",
    });
    const withAts = getPromptChanges("career_resume", analysis, {
      ...baseFields,
      atsFocus: "yes",
    });

    expect(withoutAts.map((change) => change.title)).toContain(
      "Added factuality guardrails",
    );
    expect(withoutAts.map((change) => change.title)).not.toContain(
      "Added ATS guidance",
    );
    expect(withAts.map((change) => change.title)).toContain(
      "Added ATS guidance",
    );
  });

  it("explains learning schedules and progress criteria", () => {
    const changes = getPromptChanges(
      "learning_plan",
      analyzePrompt("ajari aku machine learning"),
      {
        topic: "machine learning",
        currentLevel: "beginner",
        goal: "understand practical uses",
        timeline: "4 weeks",
        timePerWeek: "5",
        learningStyle: "theory-first",
        outputFormat: "roadmap",
      },
    );

    const titles = changes.map((change) => change.title);
    expect(titles).toContain("Added a realistic schedule");
    expect(titles).toContain("Added progress checkpoints");
    expect(titles).toContain("Added completion criteria");
  });
});
