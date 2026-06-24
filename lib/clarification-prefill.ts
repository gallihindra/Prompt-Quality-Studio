import {
  PROMPT_TYPE_CONFIGS,
  type PromptFieldValues,
  type PromptType,
} from "./prompt-forms";

export type ClarificationPrefillResult = {
  values: PromptFieldValues;
  sources: Record<string, "explicit">;
};

const clean = (value: string | undefined) =>
  (value ?? "")
    .replace(/[“”"]/g, "")
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const titleCase = (value: string) =>
  clean(value)
    .split(" ")
    .map((word) =>
      word.length <= 2 ? word : `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`,
    )
    .join(" ");

const setExplicit = (
  result: ClarificationPrefillResult,
  type: PromptType,
  key: string,
  value: string | undefined,
) => {
  const cleaned = clean(value ?? "");
  if (!cleaned) return;
  const fieldExists = PROMPT_TYPE_CONFIGS[type].fields.some(
    (field) => field.key === key,
  );
  if (!fieldExists) return;
  result.values[key] = cleaned;
  result.sources[key] = "explicit";
};

const extractLearningTopic = (prompt: string) => {
  const match = prompt.match(
    /\b(?:ajari|ajarkan|belajar|mempelajari|learn|study|teach me|help me learn)\b\s+(?:aku|saya|me\s+)?(.+?)(?=\s+(?:selama|for|within|untuk|as|from|dalam)\b|[.?!]?$)/i,
  );
  return clean(match?.[1]);
};

const extractTimeline = (prompt: string) => {
  const match = prompt.match(
    /\b(?:selama|for|within|dalam)\s+(\d+\s*(?:hari|day|days|minggu|week|weeks|bulan|month|months))\b/i,
  );
  return clean(match?.[1]);
};

const extractLevel = (prompt: string) => {
  if (/\b(complete beginner|pemula total)\b/i.test(prompt)) return "Complete beginner";
  if (/\b(beginner|pemula)\b/i.test(prompt)) return "Beginner";
  if (/\b(intermediate|menengah)\b/i.test(prompt)) return "Intermediate";
  if (/\b(advanced|lanjutan)\b/i.test(prompt)) return "Advanced";
  if (/\b(rusty|refresher|penyegaran)\b/i.test(prompt)) return "Rusty / need refresher";
  return "";
};

const extractCareerRole = (prompt: string) => {
  const roleMatch = prompt.match(
    /\b(?:for|as|targeting|toward|untuk)\s+(?:an?\s+)?(.+?\s+role|.+?\s+position|.+?\s+job)\b/i,
  );
  const rawRole = roleMatch?.[1]
    ?.replace(/\b(role|position|job)\b/i, "role")
    .replace(/\bmy\b/i, "")
    .trim();
  return rawRole ? titleCase(rawRole) : "";
};

const extractCareerDeliverable = (prompt: string) => {
  if (/\b(outreach|message)\b/i.test(prompt)) return "Outreach message";
  if (/\b(interview|tell me about yourself)\b/i.test(prompt)) return "Interview answer";
  if (/\bcover letter\b/i.test(prompt)) return "Cover letter";
  if (/\blinkedin\b/i.test(prompt)) return "LinkedIn About section";
  if (/\b(resume|cv|curriculum vitae|experience description)\b/i.test(prompt)) {
    return "Resume bullets";
  }
  return "";
};

const extractContentPlatform = (prompt: string) => {
  if (/\blinkedin\b/i.test(prompt)) return "LinkedIn post";
  if (/\binstagram\b/i.test(prompt) && /\b(caption|captioning|keterangan)\b/i.test(prompt)) {
    return "Instagram caption";
  }
  if (/\binstagram\b/i.test(prompt)) return "Instagram caption";
  if (/\b(twitter|x\/twitter|thread)\b/i.test(prompt)) return "X/Twitter thread";
  if (/\bblog|article|artikel\b/i.test(prompt)) return "Blog article";
  if (/\bnewsletter\b/i.test(prompt)) return "Email newsletter";
  if (/\bemail\b/i.test(prompt)) return "Email newsletter";
  if (/\bmemo\b/i.test(prompt)) return "Internal memo";
  if (/\bwebsite|landing page\b/i.test(prompt)) return "Website copy";
  return "";
};

const extractContentTopic = (prompt: string) => {
  const topicMatch = prompt.match(/\b(?:about|tentang|soal)\s+(.+?)(?:[.?!]?$)/i);
  return clean(topicMatch?.[1]);
};

const extractBusinessBudget = (prompt: string) => {
  if (/\b(modal kecil|low[- ]cost|low budget|cheap|murah)\b/i.test(prompt)) {
    return "Low-cost only";
  }
  if (/\b(no budget|tanpa modal)\b/i.test(prompt)) return "No budget";
  if (/\bunder\s*\$?100|di bawah\s*\$?100\b/i.test(prompt)) return "Under $100";
  if (/\bunder\s*\$?500|di bawah\s*\$?500\b/i.test(prompt)) return "Under $500";
  if (/\bunder\s*\$?1,?000|di bawah\s*\$?1,?000\b/i.test(prompt)) return "Under $1,000";
  return "";
};

const extractLocation = (prompt: string) => {
  if (/\bindonesia\b/i.test(prompt)) return "Indonesia";
  if (/\bsoutheast asia|asean\b/i.test(prompt)) return "Southeast Asia";
  if (/\bonline|global\b/i.test(prompt)) return "Online/global";
  if (/\bremote[- ]first\b/i.test(prompt)) return "Remote-first";
  if (/\blocal|neighborhood|sekitar\b/i.test(prompt)) return "Local neighborhood";
  return "";
};

const extractProductStage = (prompt: string) => {
  if (/\bmvp\b/i.test(prompt)) return "MVP planning";
  if (/\bprototype\b/i.test(prompt)) return "Prototype";
  if (/\bbeta\b/i.test(prompt)) return "Beta";
  if (/\bexisting product|launched\b/i.test(prompt)) return "Existing product";
  if (/\bidea\b/i.test(prompt)) return "Idea only";
  return "";
};

const extractProductType = (prompt: string) => {
  const mvpMatch = prompt.match(/\bmvp\s+for\s+(?:an?\s+)?(.+?)(?:[.?!]?$)/i);
  if (mvpMatch?.[1]) return clean(mvpMatch[1]);

  const productMatch = prompt.match(
    /\b(?:plan|build|create|design|develop)\s+(?:an?\s+)?(?:mvp\s+for\s+)?(.+?)(?:[.?!]?$)/i,
  );
  return clean(productMatch?.[1]);
};

const extractGeneralOutputFormat = (prompt: string) => {
  if (/\btable|tabel\b/i.test(prompt)) return "Table";
  if (/\bchecklist\b/i.test(prompt)) return "Checklist";
  if (/\bstep[- ]by[- ]step\b/i.test(prompt)) return "Step-by-step answer";
  if (/\bsummary|ringkasan\b/i.test(prompt)) return "Short summary";
  if (/\bpros and cons|pro kontra\b/i.test(prompt)) return "Pros and cons";
  if (/\bdetailed explanation\b/i.test(prompt)) return "Detailed explanation";
  return "";
};

const extractGeneralConstraints = (prompt: string) => {
  const constraints = [
    /\bkeep it short|keep it concise|singkat|ringkas\b/i.test(prompt) && "Keep it concise",
    /\bsimple language|bahasa sederhana|mudah dipahami\b/i.test(prompt) && "Use simple language",
    /\binclude examples|sertakan contoh\b/i.test(prompt) && "Include examples",
    /\bavoid assumptions|jangan asumsi|tanpa asumsi\b/i.test(prompt) && "Avoid assumptions",
    /\bask clarifying questions\b/i.test(prompt) && "Ask clarifying questions first",
  ].filter(Boolean);

  return constraints.join(", ");
};

export function deriveClarificationPrefillValues(
  rawPrompt: string,
  type: PromptType,
): ClarificationPrefillResult {
  const prompt = clean(rawPrompt);
  const result: ClarificationPrefillResult = { values: {}, sources: {} };
  if (!prompt) return result;

  switch (type) {
    case "career_resume":
      setExplicit(result, type, "targetRole", extractCareerRole(prompt));
      setExplicit(result, type, "goal", extractCareerDeliverable(prompt));
      break;
    case "learning_plan":
      setExplicit(result, type, "topic", extractLearningTopic(prompt));
      setExplicit(result, type, "timeline", extractTimeline(prompt));
      setExplicit(result, type, "currentLevel", extractLevel(prompt));
      break;
    case "content_writing":
      setExplicit(result, type, "platform", extractContentPlatform(prompt));
      setExplicit(result, type, "topic", extractContentTopic(prompt));
      break;
    case "business_idea":
      setExplicit(result, type, "budget", extractBusinessBudget(prompt));
      setExplicit(result, type, "location", extractLocation(prompt));
      break;
    case "product_planning":
      setExplicit(result, type, "stage", extractProductStage(prompt));
      setExplicit(result, type, "productType", extractProductType(prompt));
      if (/\bprd\b/i.test(prompt)) setExplicit(result, type, "outputFormat", "PRD outline");
      if (/\broadmap\b/i.test(prompt)) setExplicit(result, type, "outputFormat", "Roadmap");
      if (/\buser stories\b/i.test(prompt)) setExplicit(result, type, "outputFormat", "User stories");
      break;
    case "general":
      setExplicit(result, type, "outputFormat", extractGeneralOutputFormat(prompt));
      setExplicit(result, type, "constraints", extractGeneralConstraints(prompt));
      break;
  }

  return result;
}

export function applyPrefillToUntouchedFields({
  currentValues,
  prefillValues,
  touchedFields,
}: {
  currentValues: PromptFieldValues;
  prefillValues: PromptFieldValues;
  touchedFields: Set<string>;
}): PromptFieldValues {
  return Object.entries(prefillValues).reduce<PromptFieldValues>(
    (nextValues, [key, value]) => {
      if (!touchedFields.has(key)) {
        nextValues[key] = value;
      }
      return nextValues;
    },
    { ...currentValues },
  );
}
