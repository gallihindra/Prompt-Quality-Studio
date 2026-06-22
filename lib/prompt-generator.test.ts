import { describe, expect, it } from "vitest";
import {
  generatePrompt,
  getCareerDeliverableWarning,
  normalizeCareerTask,
} from "./prompt-generator";

const careerFields = {
  targetRole: "AI Operations Manager",
  industry: "B2B SaaS",
  seniority: "manager",
  goal: "resume bullet",
  tone: "confident",
  atsFocus: "no",
};

describe("Career/Resume prompt generation", () => {
  it("normalizes a simple resume request into a clear task", () => {
    expect(
      normalizeCareerTask("please improve my resume", "resume bullet"),
    ).toBe(
      "Review and strengthen the provided experience content as resume bullet points for the selected target role.",
    );
  });

  it("generates a natural, directly usable career prompt", () => {
    const output = generatePrompt(
      "career_resume",
      "please improve my resume",
      careerFields,
    );

    expect(output).toContain(
      "Act as an experienced career communications editor.",
    );
    expect(output).toContain(
      "Position the candidate for an AI Operations Manager role in B2B SaaS.",
    );
    expect(output).toContain(
      "Do not invent achievements, employers, responsibilities, metrics, qualifications, or experience",
    );
    expect(output).not.toContain("CAREER TASK");
    expect(output).not.toContain("TARGET POSITIONING");
    expect(output).not.toContain("please improve my resume");
    expect(output).not.toContain("ATS focus: no");
  });

  it("includes ATS guidance only when ATS focus is yes", () => {
    const withoutAts = generatePrompt(
      "career_resume",
      "improve my resume",
      careerFields,
    );
    const withAts = generatePrompt(
      "career_resume",
      "improve my resume",
      { ...careerFields, atsFocus: "yes" },
    );

    expect(withoutAts).not.toContain("ATS");
    expect(withAts).toContain(
      "incorporate role-specific ATS keywords naturally",
    );
  });

  it("warns when the raw prompt and selected deliverable conflict", () => {
    expect(
      getCareerDeliverableWarning(
        "Please improve my CV",
        "interview answer",
      ),
    ).toBe(
      "Your raw prompt mentions a resume or CV, but the selected deliverable is interview answer. The generated prompt will follow the selected deliverable.",
    );
  });

  it("does not repeat conflicting raw asset wording in the generated prompt", () => {
    const output = generatePrompt(
      "career_resume",
      "Please improve my CV and make the achievements clearer",
      {
        ...careerFields,
        goal: "interview answer",
        tone: "natural",
      },
    );

    expect(output).toContain(
      "Develop a clear, credible interview answer for the selected target role.",
    );
    expect(output).not.toContain("improve my CV");
  });

  it("does not warn when the raw prompt matches the selected deliverable", () => {
    expect(
      getCareerDeliverableWarning("Please improve my CV", "resume bullet"),
    ).toBeNull();
  });
});
