import { describe, expect, it } from "vitest";
import {
  generatePrompt,
  getCareerDeliverableWarning,
  formatLearningWeeklyTime,
  normalizeLearningRequest,
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

  it("accepts guided career deliverable and ATS suggestion labels", () => {
    const output = generatePrompt(
      "career_resume",
      "please improve my resume",
      {
        ...careerFields,
        goal: "Resume bullets",
        tone: "Senior but not exaggerated",
        atsFocus: "Balanced ATS and readability",
      },
    );

    expect(output).toContain("resume bullet");
    expect(output).toContain("Senior but not exaggerated voice");
    expect(output).toContain(
      "incorporate role-specific ATS keywords naturally",
    );
    expect(output).not.toContain("undefined");
  });

  it("omits ATS guidance for human-readable ATS suggestions", () => {
    const output = generatePrompt(
      "career_resume",
      "please improve my resume",
      {
        ...careerFields,
        atsFocus: "No ATS focus",
      },
    );

    expect(output).not.toContain("ATS keywords");
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

describe("Learning Plan prompt generation", () => {
  const learningFields = {
    topic: "machine learning",
    currentLevel: "beginner",
    goal: "memahami bagaimana AI bekerja dan bagaimana machine learning digunakan dalam praktik",
    timeline: "4",
    timePerWeek: "5",
    learningStyle: "theory-first",
    outputFormat: "roadmap",
  };

  it("normalizes simple Indonesian learning requests", () => {
    expect(
      normalizeLearningRequest(
        "ajari aku machine learning",
        "machine learning",
        "beginner",
        "id",
      ),
    ).toBe(
      "Bantu saya membuat rencana belajar machine learning untuk level pemula.",
    );
  });

  it("formats bare weekly time values naturally", () => {
    expect(formatLearningWeeklyTime("5", "en")).toBe("5 hours per week");
    expect(formatLearningWeeklyTime("5", "id")).toBe("5 jam per minggu");
    expect(formatLearningWeeklyTime("5 hours per week", "en")).toBe(
      "5 hours per week",
    );
    expect(formatLearningWeeklyTime("5 hours per week", "id")).toBe(
      "5 jam per minggu",
    );
  });

  it("generates a natural Indonesian learning prompt", () => {
    const output = generatePrompt(
      "learning_plan",
      "ajari aku machine learning",
      learningFields,
    );

    expect(output).toContain(
      "Bantu saya membuat rencana belajar machine learning selama 4 minggu untuk level pemula.",
    );
    expect(output).toContain("Saya bisa belajar sekitar 5 jam per minggu");
    expect(output).toContain(
      "Susun rencana belajar dengan pendekatan theory-first",
    );
    expect(output).toContain("Format jawaban");
    expect(output).toContain("Gunakan bahasa yang mudah dipahami");
    expect(output).toContain("1. target mingguan");
    expect(output).toContain(
      "6. tanda bahwa rencana belajar ini sudah selesai",
    );
    expect(output).not.toContain("Bertindak sebagai");
    expect(output).not.toContain("keluaran");
    expect(output).not.toContain("LEARNING REQUEST");
    expect(output).not.toContain("Weekly time: 5");
    expect(output).not.toContain("ajari aku machine learning");
  });

  it("keeps English learning requests in English", () => {
    const output = generatePrompt(
      "learning_plan",
      "help me learn machine learning",
      {
        ...learningFields,
        goal: "understand how machine learning is used in practice",
      },
    );

    expect(output).toContain(
      "Help me learn machine learning from a beginner level.",
    );
    expect(output).toContain("Create a learning plan covering 4 weeks");
    expect(output).toContain("around 5 hours per week");
    expect(output).not.toContain("Bantu saya");
  });

  it("uses guided learning suggestion values in the generated prompt", () => {
    const output = generatePrompt(
      "learning_plan",
      "help me learn machine learning",
      {
        ...learningFields,
        currentLevel: "Complete beginner",
        timeline: "4 weeks",
        timePerWeek: "5 hours/week",
        learningStyle: "Balanced theory and practice",
        outputFormat: "Weekly roadmap",
        goal: "understand how machine learning is used in practice",
      },
    );

    expect(output).toContain("complete beginner level");
    expect(output).toContain("4 weeks");
    expect(output).toContain("5 hours per week");
    expect(output).toContain("balanced theory-and-practice approach");
    expect(output).toContain("week-by-week learning plan");
  });

  it("preserves manual custom Studio values", () => {
    const output = generatePrompt(
      "content_writing",
      "Write about AI adoption",
      {
        platform: "Founder community forum",
        topic: "AI adoption habits for small teams",
        audience: "Non-technical founders",
        tone: "Calm and pragmatic",
        language: "English",
        callToAction: "Ask readers to share one workflow they automated",
        length: "About 650 words",
      },
    );

    expect(output).toContain("Platform: Founder community forum");
    expect(output).toContain("Tone: Calm and pragmatic");
    expect(output).toContain("Length: About 650 words");
  });

  it("recognizes a direct Indonesian teaching request without a pronoun", () => {
    const output = generatePrompt(
      "learning_plan",
      "ajari machine learning",
      learningFields,
    );

    expect(output).toContain(
      "Bantu saya membuat rencana belajar machine learning",
    );
    expect(output).not.toContain("Help me learn");
  });
});
