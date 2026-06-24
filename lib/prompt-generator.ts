import type { PromptFieldValues, PromptType } from "./prompt-forms";

const value = (fields: PromptFieldValues, key: string) =>
  fields[key]?.trim() ?? "";

const task = (prompt: string) =>
  prompt.trim();

const optionalLine = (
  fields: PromptFieldValues,
  key: string,
  label: string,
) => {
  const fieldValue = value(fields, key);
  return fieldValue ? `\n- ${label}: ${fieldValue}` : "";
};

const optionalSection = (
  fields: PromptFieldValues,
  key: string,
  heading: string,
) => {
  const fieldValue = value(fields, key);
  return fieldValue ? `\n\n${heading}\n${fieldValue}` : "";
};

type CareerDeliverable =
  | "resume bullet"
  | "LinkedIn summary"
  | "cover letter"
  | "interview answer"
  | "outreach message";

const careerDeliverableTasks: Record<CareerDeliverable, string> = {
  "resume bullet":
    "Review and strengthen the provided experience content as resume bullet points for the selected target role.",
  "LinkedIn summary":
    "Create or improve a LinkedIn summary that positions the candidate for the selected target role.",
  "cover letter":
    "Draft or improve a focused cover letter for the selected target role.",
  "interview answer":
    "Develop a clear, credible interview answer for the selected target role.",
  "outreach message":
    "Draft a concise outreach message that introduces the candidate and supports the selected target role.",
};

const careerDeliverableGuidance: Record<CareerDeliverable, string> = {
  "resume bullet":
    "Use concise, action-led bullet points that communicate scope, contribution, and outcome. Prefer specific evidence already present in the source material.",
  "LinkedIn summary":
    "Write in the first person with a clear professional narrative, relevant strengths, and a natural closing that supports the candidate's positioning.",
  "cover letter":
    "Connect the candidate's relevant experience to the role, avoid repeating the resume line by line, and keep the letter focused and credible.",
  "interview answer":
    "Structure the answer for spoken delivery. Use a clear situation, action, and outcome sequence when the source material supports it, and keep the language natural rather than scripted.",
  "outreach message":
    "Keep the message brief, specific, and easy to respond to. Make the candidate's fit clear without overstating experience.",
};

const normalizeCareerDeliverable = (deliverable: string): CareerDeliverable => {
  const normalized = deliverable.trim().toLowerCase();
  if (/resume|bullet/.test(normalized)) return "resume bullet";
  if (/linkedin|about/.test(normalized)) return "LinkedIn summary";
  if (/cover/.test(normalized)) return "cover letter";
  if (/interview/.test(normalized)) return "interview answer";
  if (/outreach|message/.test(normalized)) return "outreach message";
  return "resume bullet";
};

const careerIntentPatterns: Array<{
  deliverables: CareerDeliverable[];
  pattern: RegExp;
  label: string;
}> = [
  {
    deliverables: ["resume bullet"],
    pattern: /\b(resume|cv|curriculum vitae)\b/i,
    label: "resume or CV",
  },
  {
    deliverables: ["LinkedIn summary"],
    pattern: /\b(linkedin|linkedin summary|about section)\b/i,
    label: "LinkedIn profile",
  },
  {
    deliverables: ["cover letter"],
    pattern: /\bcover letter\b/i,
    label: "cover letter",
  },
  {
    deliverables: ["interview answer"],
    pattern: /\b(interview|interview answer|tell me about yourself)\b/i,
    label: "interview answer",
  },
];

const cleanCareerRequest = (prompt: string) =>
  prompt
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /^(please\s+|can you\s+|could you\s+|would you\s+|help me\s+(?:to\s+)?|i want you to\s+)/i,
      "",
    )
    .replace(/[.?!]+$/, "")
    .trim();

export function normalizeCareerTask(
  prompt: string,
  deliverable: string,
): string {
  const selectedDeliverable = normalizeCareerDeliverable(deliverable);
  const baseTask = careerDeliverableTasks[selectedDeliverable];
  const cleanedRequest = cleanCareerRequest(prompt);
  const hasDeliverableMismatch = Boolean(
    getCareerDeliverableWarning(prompt, selectedDeliverable),
  );

  const isSimpleAssetRequest =
    cleanedRequest.split(/\s+/).length <= 7 &&
    /\b(improve|review|rewrite|update|fix|work on|edit)\b/i.test(
      cleanedRequest,
    ) &&
    /\b(resume|cv|linkedin|cover letter|interview answer)\b/i.test(
      cleanedRequest,
    );

  if (!cleanedRequest || isSimpleAssetRequest || hasDeliverableMismatch) {
    return baseTask;
  }

  const normalizedDetail =
    cleanedRequest.charAt(0).toUpperCase() + cleanedRequest.slice(1);
  return `${baseTask} Address this specific request: ${normalizedDetail}.`;
}

export function getCareerDeliverableWarning(
  prompt: string,
  deliverable: string,
): string | null {
  if (!deliverable) return null;

  const hasMatchingIntent = careerIntentPatterns.some(
    ({ deliverables, pattern }) =>
      deliverables.includes(normalizeCareerDeliverable(deliverable)) &&
      pattern.test(prompt),
  );
  if (hasMatchingIntent) return null;

  const detectedIntent = careerIntentPatterns.find(({ pattern }) =>
    pattern.test(prompt),
  );
  if (
    !detectedIntent ||
    detectedIntent.deliverables.includes(normalizeCareerDeliverable(deliverable))
  ) {
    return null;
  }

  return `Your raw prompt mentions a ${detectedIntent.label}, but the selected deliverable is ${deliverable}. The generated prompt will follow the selected deliverable.`;
}

const formatCareerRole = (seniority: string, targetRole: string) => {
  const roleIncludesSeniority = new RegExp(
    `\\b${seniority.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "i",
  ).test(targetRole);

  return roleIncludesSeniority
    ? targetRole
    : `${seniority}-level ${targetRole}`;
};

const indefiniteArticle = (phrase: string) =>
  /^(?:[aeiou]|honest|hour|MBA|AI\b)/i.test(phrase) ? "an" : "a";

type LearningLanguage = "en" | "id";

const indonesianLearningSignals = [
  "ajari",
  "ajarkan",
  "aku",
  "saya",
  "belajar",
  "mempelajari",
  "ingin",
  "pemula",
  "minggu",
  "jam",
  "per minggu",
  "buatkan",
  "bantu",
  "bagaimana",
];

const isIndonesianLearningInput = (
  prompt: string,
  fields: PromptFieldValues,
) => {
  const source = [
    prompt,
    value(fields, "topic"),
    value(fields, "goal"),
    value(fields, "timeline"),
    value(fields, "timePerWeek"),
  ]
    .join(" ")
    .toLowerCase();

  const hasStrongIndonesianVerb =
    /\b(ajari|ajarkan|buatkan|mempelajari)\b/i.test(source);
  const signalCount = indonesianLearningSignals.filter((signal) =>
    new RegExp(`(?:^|\\W)${signal}(?:$|\\W)`, "i").test(source),
  ).length;

  return hasStrongIndonesianVerb || signalCount >= 2;
};

const formatLearningLevel = (
  level: string,
  language: LearningLanguage,
) => {
  const normalizedLevel = level.toLowerCase();
  if (language === "en") return normalizedLevel;

  return (
    {
      beginner: "pemula",
      "complete beginner": "pemula total",
      intermediate: "menengah",
      advanced: "lanjutan",
      "rusty / need refresher": "pernah belajar sedikit dan perlu penyegaran",
    }[normalizedLevel] ?? level
  );
};

const formatLearningTimeline = (
  timeline: string,
  language: LearningLanguage,
) => {
  const trimmed = timeline.trim();
  const durationMatch = trimmed.match(
    /^(\d+(?:[.,]\d+)?)\s*(day|days|hari|week|weeks|minggu|month|months|bulan)?$/i,
  );
  if (!durationMatch) return trimmed;

  const [, amount, unit = "week"] = durationMatch;
  const normalizedUnit = unit.toLowerCase();
  const unitType =
    ["day", "days", "hari"].includes(normalizedUnit)
      ? "day"
      : ["month", "months", "bulan"].includes(normalizedUnit)
        ? "month"
        : "week";

  if (language === "id") {
    return `${amount} ${{ day: "hari", week: "minggu", month: "bulan" }[unitType]}`;
  }

  const englishUnit = { day: "day", week: "week", month: "month" }[unitType];
  return `${amount} ${englishUnit}${amount === "1" ? "" : "s"}`;
};

export function formatLearningWeeklyTime(
  weeklyTime: string,
  language: LearningLanguage,
): string {
  const trimmed = weeklyTime.trim();
  const timeMatch = trimmed.match(
    /^(\d+(?:[.,]\d+)?)\s*(?:hours?|hrs?|jam)?(?:\s*(?:per|\/)\s*(?:week|minggu))?$/i,
  );
  if (!timeMatch) return trimmed;
  const amount = timeMatch[1];
  return language === "id"
    ? `${amount} jam per minggu`
    : `${amount} hour${amount === "1" ? "" : "s"} per week`;
}

const learningStylePhrase = (
  style: string,
  language: LearningLanguage,
) => {
  const normalizedStyle = style.toLowerCase();
  if (language === "en") {
    return (
      {
        practical: "a practical approach",
        "practice-first": "a practice-first approach",
        "theory-first": "a theory-first approach",
        "project-based": "a project-based approach",
        "balanced theory and practice": "a balanced theory-and-practice approach",
        "visual examples": "an approach with visual examples",
        "structured course": "a structured-course approach",
      }[normalizedStyle] ?? style
    );
  }

  return (
    {
      practical: "pendekatan praktis",
      "practice-first": "pendekatan praktik terlebih dahulu",
      "theory-first": "pendekatan theory-first",
      "project-based": "pendekatan berbasis proyek",
      "balanced theory and practice": "pendekatan yang menyeimbangkan teori dan praktik",
      "visual examples": "pendekatan dengan contoh visual",
      "structured course": "pendekatan kursus yang terstruktur",
    }[normalizedStyle] ?? style
  );
};

const isSimpleLearningRequest = (prompt: string) => {
  const cleaned = prompt
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.?!]+$/, "");

  return (
    cleaned.split(/\s+/).length <= 8 &&
    /\b(learn|teach|study|ajari|ajarkan|belajar|mempelajari)\b/i.test(cleaned)
  );
};

export function normalizeLearningRequest(
  prompt: string,
  topic: string,
  level: string,
  language: LearningLanguage,
): string {
  const formattedLevel = formatLearningLevel(level, language);

  if (language === "id") {
    const baseRequest = `Bantu saya membuat rencana belajar ${topic} untuk level ${formattedLevel}.`;
    return isSimpleLearningRequest(prompt)
      ? baseRequest
      : `${baseRequest} Pertimbangkan juga kebutuhan khusus dalam permintaan awal ini: ${prompt.trim()}`;
  }

  const baseRequest = `Help me learn ${topic} from a ${formattedLevel} level.`;
  return isSimpleLearningRequest(prompt)
    ? baseRequest
    : `${baseRequest} Preserve the specific intent in this original request: ${prompt.trim()}`;
}

const learningOutputInstructions = (
  outputFormat: string,
  language: LearningLanguage,
) => {
  const normalizedFormat = outputFormat.toLowerCase();
  if (language === "id") {
    const formatDescription =
      normalizedFormat.includes("checklist")
        ? "checklist belajar yang jelas"
        : normalizedFormat.includes("weekly")
          ? "rencana belajar mingguan"
          : normalizedFormat.includes("table")
            ? "tabel rencana belajar"
            : normalizedFormat.includes("milestone")
              ? "rencana belajar berbasis milestone"
              : "roadmap belajar";

    return `Format jawaban (${formatDescription}):
1. target mingguan
2. konsep utama yang perlu dipelajari
3. aktivitas latihan
4. checkpoint untuk mengevaluasi progres
5. satu proyek kecil yang aplikatif
6. tanda bahwa rencana belajar ini sudah selesai`;
  }

  const opening =
    normalizedFormat.includes("checklist")
      ? "Structure the result as a clear learning checklist."
      : normalizedFormat.includes("weekly")
        ? "Structure the result as a week-by-week learning plan."
        : normalizedFormat.includes("table")
          ? "Structure the result as a learning-plan table."
          : normalizedFormat.includes("milestone")
            ? "Structure the result as a milestone-based learning plan."
            : "Structure the result as a learning roadmap.";

  return `${opening} It should include:
1. weekly targets
2. key concepts to learn
3. practice activities
4. checkpoints for evaluating progress
5. one small applied project
6. completion criteria`;
};

export function generatePrompt(
  type: PromptType,
  prompt: string,
  fields: PromptFieldValues,
): string {
  switch (type) {
    case "business_idea":
      return `ROLE
Act as a practical business opportunity analyst.

OBJECTIVE
${task(prompt)}

OPERATING PROFILE
- Business model: ${value(fields, "businessModel")}
- Starting budget: ${value(fields, "budget")}
- Target market or location: ${value(fields, "location")}${optionalLine(fields, "skills", "Available skills")}
- Time commitment: ${value(fields, "timeCommitment")}
- Primary goal: ${value(fields, "goal")}${optionalLine(fields, "riskAppetite", "Risk appetite")}

ANALYSIS REQUIREMENTS
Recommend opportunities that fit the operating profile. For each option, explain the customer problem, likely revenue model, startup requirements, first validation step, key risk, and why it fits. Avoid ideas that exceed the stated budget or time commitment.

OUTPUT
Use a ${value(fields, "outputFormat")}. End with one recommended starting option and a concrete seven-day validation action.`;

    case "content_writing":
      return `ROLE
Act as an experienced content strategist and writer.

WRITING TASK
${task(prompt)}

CONTENT BRIEF
- Platform: ${value(fields, "platform")}
- Topic or core message: ${value(fields, "topic")}
- Audience: ${value(fields, "audience")}
- Tone: ${value(fields, "tone")}
- Language: ${value(fields, "language")}${optionalLine(fields, "callToAction", "Call to action")}
- Length: ${value(fields, "length")}

REQUIREMENTS
Adapt the structure and conventions to the selected platform. Lead with a clear hook, maintain one central message, and use language appropriate for the audience.${value(fields, "callToAction") ? " Make the call to action feel natural." : ""} Do not invent facts or statistics.

OUTPUT
Provide publication-ready copy only, followed by two alternative opening lines.`;

    case "career_resume":
      {
        const deliverable = normalizeCareerDeliverable(value(fields, "goal"));
        const targetRole = value(fields, "targetRole");
        const seniority = value(fields, "seniority");
        const tone = value(fields, "tone");
        const industry = value(fields, "industry");
        const positionedRole = formatCareerRole(seniority, targetRole);
        const atsGuidance =
          /^(yes|include|balanced)/i.test(value(fields, "atsFocus"))
            ? " Where relevant, incorporate role-specific ATS keywords naturally without keyword stuffing."
            : "";

        return `Act as an experienced career communications editor. ${normalizeCareerTask(prompt, deliverable)}

Position the candidate for ${indefiniteArticle(positionedRole)} ${positionedRole} role${industry ? ` in ${industry}` : ""}. Produce a polished ${deliverable} in a ${tone} voice.

${careerDeliverableGuidance[deliverable]}

Preserve factual accuracy. Do not invent achievements, employers, responsibilities, metrics, qualifications, or experience that are not present in the source material.${atsGuidance}

Return the finished ${deliverable} first. Then add a brief "Evidence to strengthen" note only if important details or measurable outcomes are missing.`;
      }

    case "product_planning":
      return `ROLE
Act as a pragmatic product manager.

PLANNING REQUEST
${task(prompt)}

PRODUCT CONTEXT
- Product or feature: ${value(fields, "productType")}
- Target user: ${value(fields, "targetUser")}
- User problem: ${value(fields, "problem")}${optionalLine(fields, "platform", "Platform")}
- Stage: ${value(fields, "stage")}
- Success metric: ${value(fields, "successMetric")}
- Deliverable: ${value(fields, "outputFormat")}

PLANNING PRINCIPLES
Keep the scope appropriate for the product stage. Separate user needs from proposed solutions, state assumptions, identify the smallest valuable scope, and include measurable acceptance or success criteria.

OUTPUT
Create the requested product planning document with clear headings, priorities, risks, dependencies, and open questions.`;

    case "learning_plan":
      {
        const language: LearningLanguage = isIndonesianLearningInput(
          prompt,
          fields,
        )
          ? "id"
          : "en";
        const topic = value(fields, "topic");
        const level = value(fields, "currentLevel");
        const learningGoal = value(fields, "goal");
        const timeline = formatLearningTimeline(
          value(fields, "timeline"),
          language,
        );
        const weeklyTime = formatLearningWeeklyTime(
          value(fields, "timePerWeek"),
          language,
        );
        const style = value(fields, "learningStyle");
        const outputFormat = value(fields, "outputFormat");
        if (language === "id") {
          const formattedLevel = formatLearningLevel(level, language);
          const originalRequestNote = isSimpleLearningRequest(prompt)
            ? ""
            : ` Pertimbangkan juga kebutuhan khusus dalam permintaan awal ini: ${prompt.trim()}`;

          return `Bantu saya membuat rencana belajar ${topic} selama ${timeline} untuk level ${formattedLevel}.

Tujuan saya adalah ${learningGoal}. Saya bisa belajar sekitar ${weeklyTime}.${originalRequestNote}

${style ? `Susun rencana belajar dengan ${learningStylePhrase(style, language)}, tetapi tetap sertakan latihan sederhana dan penerapan nyata.` : "Susun rencana belajar yang menyeimbangkan pemahaman konsep, latihan sederhana, dan penerapan nyata."}

${learningOutputInstructions(outputFormat, language)}

Gunakan bahasa yang mudah dipahami dan jaga beban belajarnya tetap realistis. Jangan menambahkan tujuan lanjutan yang tidak saya berikan. Pastikan progres dapat diperiksa sepanjang rencana.`;
        }

        const request = normalizeLearningRequest(
          prompt,
          topic,
          level,
          language,
        );

        return `Act as a structured learning coach.

${request} The learning goal to preserve is: ${learningGoal}.

Create a learning plan covering ${timeline} for someone who can study around ${weeklyTime}.${style ? ` Use ${learningStylePhrase(style, language)}, while still balancing conceptual understanding with simple practice and real application.` : " Balance conceptual understanding with simple practice and real application."}

${learningOutputInstructions(outputFormat, language)}

Keep the workload realistic for the available time. Do not add advanced goals that I did not request. Make each step easy to follow and show how progress can be checked throughout the plan.`;
      }

    case "general":
      return `TASK
${task(prompt)}

GOAL
${value(fields, "goal")}

CONTEXT
${value(fields, "context")}

AUDIENCE
${value(fields, "audience")}${optionalSection(fields, "constraints", "CONSTRAINTS")}

OUTPUT FORMAT
${value(fields, "outputFormat")}

QUALITY CHECK
Before finalizing, verify that the response directly addresses the goal, uses the provided context, follows every constraint, and is useful to the intended audience.`;
  }
}
