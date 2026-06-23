import {
  PROMPT_TYPE_CONFIGS,
  PROMPT_TYPES,
  type PromptType,
} from "./prompt-forms";

export type CanonicalLanguage = "id" | "en" | "mixed" | "unknown";
export type CanonicalConfidence = "high" | "medium" | "low";
export type CanonicalFieldSource = "explicit" | "inferred";

export type CanonicalPrompt = {
  language: CanonicalLanguage;
  primaryCategory: PromptType;
  primaryCategoryLabel: string;
  categoryConfidence: CanonicalConfidence;
  possibleCategories: {
    category: PromptType;
    label: string;
    confidence: number;
    reason: string;
  }[];
  intent: {
    goal?: string;
    task?: string;
    audience?: string;
    desiredOutcome?: string;
  };
  extractedFields: {
    label: string;
    value: string;
    source: CanonicalFieldSource;
  }[];
  missingFields: string[];
  constraints: string[];
  desiredFormat?: string;
  tone?: string;
  ambiguityNotes: string[];
  mismatchNote?: string;
};

const indonesianSignals = [
  "ajari",
  "ajarkan",
  "aku",
  "saya",
  "kasih",
  "beri",
  "buatkan",
  "belajar",
  "bisnis",
  "ide",
  "pemula",
  "minggu",
  "jam",
  "rencana",
  "bahasa",
  "bagaimana",
  "untuk",
];

const englishSignals = [
  "help",
  "write",
  "create",
  "please",
  "improve",
  "resume",
  "business",
  "idea",
  "learn",
  "plan",
  "app",
  "for",
  "about",
  "with",
];

const categoryRules: Record<
  PromptType,
  Array<{ pattern: RegExp; reason: string; weight: number }>
> = {
  business_idea: [
    { pattern: /\b(business|bisnis|startup|usaha)\b/i, reason: "mentions a business or venture", weight: 36 },
    { pattern: /\b(idea|ideas|ide|peluang)\b/i, reason: "asks for ideas or opportunities", weight: 24 },
    { pattern: /\b(budget|modal|cashflow|revenue|income|penghasilan)\b/i, reason: "mentions commercial constraints", weight: 18 },
  ],
  content_writing: [
    { pattern: /\b(write|draft|copy|post|caption|artikel|tulis|buatkan)\b/i, reason: "asks for writing or drafting", weight: 24 },
    { pattern: /\b(linkedin|instagram|twitter|blog|email|newsletter)\b/i, reason: "mentions a publishing platform", weight: 28 },
    { pattern: /\b(content|konten|storytelling|tone|cta)\b/i, reason: "mentions content-shaping details", weight: 18 },
  ],
  career_resume: [
    { pattern: /\b(resume|cv|curriculum vitae|cover letter|linkedin summary)\b/i, reason: "mentions career application material", weight: 40 },
    { pattern: /\b(interview|job|role|career|hiring|ats)\b/i, reason: "mentions hiring or workplace context", weight: 24 },
    { pattern: /\b(improve|rewrite|perbaiki|review)\b.*\b(resume|cv|profile)\b/i, reason: "asks to improve career material", weight: 22 },
  ],
  product_planning: [
    { pattern: /\b(app|product|feature|platform|dashboard|tool)\b/i, reason: "mentions a product or app", weight: 32 },
    { pattern: /\b(plan|planning|prd|roadmap|user stories|mvp)\b/i, reason: "asks for a planning artifact", weight: 24 },
    { pattern: /\b(user|problem|metric|launch|scope)\b/i, reason: "mentions product planning inputs", weight: 16 },
  ],
  learning_plan: [
    { pattern: /\b(learn|study|teach|belajar|ajari|ajarkan|mempelajari)\b/i, reason: "asks to learn a topic", weight: 40 },
    { pattern: /\b(beginner|intermediate|advanced|pemula|menengah|lanjutan)\b/i, reason: "mentions learner level", weight: 18 },
    { pattern: /\b(roadmap|weekly plan|learning plan|rencana belajar|minggu|jam per minggu)\b/i, reason: "mentions a learning plan structure", weight: 20 },
  ],
  general: [
    { pattern: /\b(help|bantu|explain|jelaskan|analyze|summarize|prepare)\b/i, reason: "contains a broad task request", weight: 10 },
  ],
};

const categoryLabel = (type: PromptType) => PROMPT_TYPE_CONFIGS[type].label;

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, " ");

const hasPattern = (text: string, pattern: RegExp) => pattern.test(text);

const unique = <T>(values: T[]) => Array.from(new Set(values));

export function detectPromptLanguage(prompt: string): CanonicalLanguage {
  const normalized = prompt.toLowerCase();
  if (!normalized.trim()) return "unknown";

  const idCount = indonesianSignals.filter((signal) =>
    new RegExp(`(?:^|\\W)${signal}(?:$|\\W)`, "i").test(normalized),
  ).length;
  const enCount = englishSignals.filter((signal) =>
    new RegExp(`(?:^|\\W)${signal}(?:$|\\W)`, "i").test(normalized),
  ).length;

  if (idCount > 0 && enCount > 0) return "mixed";
  if (idCount > 0 && enCount === 0) return "id";
  if (enCount > 0 && idCount === 0) return "en";
  if (idCount > enCount) return "id";
  if (enCount > idCount) return "en";
  return "unknown";
}

export function detectPossibleCategories(prompt: string) {
  const text = normalizeWhitespace(prompt);

  return PROMPT_TYPES.map((type) => {
    const matches = categoryRules[type].filter((rule) =>
      hasPattern(text, rule.pattern),
    );
    const confidence = Math.min(
      95,
      matches.reduce((sum, rule) => sum + rule.weight, 0),
    );

    return {
      category: type,
      label: categoryLabel(type),
      confidence,
      reason: matches[0]?.reason ?? "no strong category signal found",
    };
  })
    .filter((item) => item.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);
}

const getConfidenceBand = (
  possibleCategories: ReturnType<typeof detectPossibleCategories>,
  selectedType: PromptType,
): CanonicalConfidence => {
  const selected = possibleCategories.find(
    (item) => item.category === selectedType,
  );
  const confidence = selected?.confidence ?? 0;
  if (confidence >= 40) return "high";
  if (confidence >= 20) return "medium";
  return "low";
};

const extractAfter = (text: string, pattern: RegExp) => {
  const match = text.match(pattern);
  return normalizeWhitespace(match?.[1] ?? "");
};

const stripTopicFillers = (value: string) =>
  normalizeWhitespace(
    value
      .replace(/^(me|about|to|aku|saya|tentang|soal)\s+/i, "")
      .replace(/[.?!]+$/g, ""),
  );

const inferLearningTopic = (prompt: string) => {
  const topic = extractAfter(
    prompt,
    /\b(?:learn|study|teach me|help me learn|belajar|ajari|ajarkan|mempelajari)\b\s+(.+)$/i,
  );
  return stripTopicFillers(topic);
};

const addExplicit = (
  fields: CanonicalPrompt["extractedFields"],
  label: string,
  value: string,
) => {
  if (!value || fields.some((field) => field.label === label)) return;
  fields.push({ label, value, source: "explicit" });
};

const addInferred = (
  fields: CanonicalPrompt["extractedFields"],
  label: string,
  value: string,
) => {
  if (!value || fields.some((field) => field.label === label && field.value === value)) return;
  fields.push({ label, value, source: "inferred" });
};

const getRawPromptFields = (
  prompt: string,
  type: PromptType,
): {
  intent: CanonicalPrompt["intent"];
  extractedFields: CanonicalPrompt["extractedFields"];
  constraints: string[];
  desiredFormat?: string;
  tone?: string;
  ambiguityNotes: string[];
} => {
  const text = normalizeWhitespace(prompt);
  const fields: CanonicalPrompt["extractedFields"] = [];
  const constraints: string[] = [];
  const ambiguityNotes: string[] = [];
  const intent: CanonicalPrompt["intent"] = {};
  let desiredFormat: string | undefined;
  let tone: string | undefined;

  if (/\b(table|tabel)\b/i.test(text)) desiredFormat = "table";
  else if (/\b(checklist)\b/i.test(text)) desiredFormat = "checklist";
  else if (/\b(roadmap|rencana belajar)\b/i.test(text)) desiredFormat = "roadmap";
  else if (/\b(outline|kerangka)\b/i.test(text)) desiredFormat = "outline";
  else if (/\b(list|daftar)\b/i.test(text)) desiredFormat = "list";
  if (desiredFormat) addExplicit(fields, "Output format", desiredFormat);

  const timeline = extractAfter(text, /\b(?:for|selama|within|dalam)\s+(\d+\s*(?:days?|hari|weeks?|minggu|months?|bulan))\b/i);
  if (timeline) {
    addExplicit(fields, "Timeline", timeline);
    constraints.push(`Timeline: ${timeline}`);
  }

  const weeklyTime = extractAfter(text, /\b(\d+\s*(?:hours?|hrs?|jam)(?:\s*(?:per|\/)\s*(?:week|minggu))?)\b/i);
  if (weeklyTime) {
    addExplicit(fields, "Study time", weeklyTime);
    constraints.push(`Study time: ${weeklyTime}`);
  }

  const budget = extractAfter(text, /\b(?:under|below|maximum|maksimal|di bawah)\s+([^,.]+(?:million|juta|rp)[^,.]*)/i);
  if (budget) {
    addExplicit(fields, "Budget", budget);
    constraints.push(`Budget: ${budget}`);
  }

  const toneMatch = text.match(/\b(professional|casual|persuasive|educational|storytelling|confident|concise|executive|natural)\b/i);
  if (toneMatch) {
    tone = toneMatch[1];
    addExplicit(fields, "Tone", tone);
  }

  if (/\b(indonesia|global|local city|jakarta|bandung|surabaya)\b/i.test(text)) {
    const location = text.match(/\b(indonesia|global|local city|jakarta|bandung|surabaya)\b/i)?.[1];
    if (location) addExplicit(fields, "Location", location);
  }

  switch (type) {
    case "learning_plan": {
      intent.task = "learn a topic";
      const topic = inferLearningTopic(text);
      if (topic) addExplicit(fields, "Topic", topic);
      if (/\b(beginner|pemula)\b/i.test(text)) addExplicit(fields, "Current level", "beginner");
      if (/\b(intermediate|menengah)\b/i.test(text)) addExplicit(fields, "Current level", "intermediate");
      if (/\b(advanced|lanjutan)\b/i.test(text)) addExplicit(fields, "Current level", "advanced");
      if (/\b(understand|memahami|ingin)\b/i.test(text)) intent.goal = "understand or build skill in the topic";
      addInferred(fields, "Likely intent", "create a learning plan");
      break;
    }
    case "career_resume": {
      if (/\b(resume|cv|curriculum vitae)\b/i.test(text)) {
        intent.task = "improve resume material";
        addExplicit(fields, "Task", "improve resume");
      } else if (/\b(interview)\b/i.test(text)) {
        intent.task = "prepare interview material";
        addExplicit(fields, "Task", "prepare interview answer");
      } else {
        intent.task = "create career material";
        addInferred(fields, "Likely intent", "career material improvement");
      }
      const role = extractAfter(text, /\b(?:for|as|role)\s+(?:an?\s+)?(.+?)(?:\s+role)?[.?!]?$/i);
      if (role && !/\b(my resume|my cv)\b/i.test(role)) addExplicit(fields, "Target role", role);
      if (/\b(resume|cv|curriculum vitae)\b/i.test(text)) {
        ambiguityNotes.push("Source resume content is needed before a factual rewrite can be produced.");
      }
      break;
    }
    case "business_idea": {
      intent.task = "generate business ideas";
      if (/\b(idea|ideas|ide)\b/i.test(text)) addExplicit(fields, "Task", "generate business ideas");
      addInferred(fields, "Likely intent", "compare practical business opportunities");
      break;
    }
    case "product_planning": {
      intent.task = "plan a product or feature";
      const product = extractAfter(text, /\b(?:plan|build|create|design|help me plan)\s+(?:an?\s+)?(.+)$/i);
      if (product) addExplicit(fields, "Product or feature", stripTopicFillers(product));
      addInferred(fields, "Likely intent", "create a scoped product planning artifact");
      break;
    }
    case "content_writing": {
      intent.task = "create written content";
      const topic = extractAfter(text, /\b(?:about|tentang)\s+(.+)$/i);
      if (topic) addExplicit(fields, "Topic", stripTopicFillers(topic));
      const audience = extractAfter(text, /\bfor\s+(.+)$/i);
      if (audience) {
        intent.audience = stripTopicFillers(audience);
        addExplicit(fields, "Audience", stripTopicFillers(audience));
      }
      addInferred(fields, "Likely intent", "draft or improve content");
      break;
    }
    case "general": {
      intent.task = text || undefined;
      break;
    }
  }

  if (!text) ambiguityNotes.push("Add a raw prompt before reviewing the structured interpretation.");

  return { intent, extractedFields: fields, constraints, desiredFormat, tone, ambiguityNotes };
};

const missingLabelsForType: Record<PromptType, string[]> = {
  business_idea: [
    "business model",
    "starting budget",
    "target location",
    "time commitment",
    "primary business goal",
    "output format",
  ],
  content_writing: [
    "platform",
    "topic",
    "audience",
    "tone",
    "language",
    "length",
  ],
  career_resume: [
    "target role",
    "seniority",
    "career deliverable",
    "tone",
    "ATS preference",
    "source resume or career material",
  ],
  product_planning: [
    "product type",
    "target user",
    "problem to solve",
    "product stage",
    "success metric",
    "planning format",
  ],
  learning_plan: [
    "current level",
    "timeline",
    "weekly study time",
    "preferred learning style",
    "output format",
  ],
  general: ["goal", "context", "audience", "output format"],
};

const removeFoundMissingFields = (
  missingFields: string[],
  extractedFields: CanonicalPrompt["extractedFields"],
) => {
  const foundLabels = extractedFields
    .filter((field) => field.source === "explicit")
    .map((field) => field.label.toLowerCase());

  return missingFields.filter(
    (missing) =>
      !foundLabels.some((label) =>
        missing.toLowerCase().includes(label.replace("study time", "weekly study time")),
      ),
  );
};

export function createCanonicalPrompt(
  prompt: string,
  selectedType: PromptType,
): CanonicalPrompt {
  const possibleCategories = detectPossibleCategories(prompt);
  const selectedPossibleCategory = possibleCategories.find(
    (item) => item.category === selectedType,
  );
  const strongestCategory = possibleCategories[0];
  const primaryCategory = selectedType;
  const rawPromptFields = getRawPromptFields(prompt, primaryCategory);
  const missingFields = removeFoundMissingFields(
    missingLabelsForType[primaryCategory],
    rawPromptFields.extractedFields,
  );

  const mismatchNote =
    strongestCategory &&
    strongestCategory.category !== selectedType &&
    strongestCategory.confidence >= 35
      ? `You selected ${categoryLabel(selectedType)}, but the raw prompt also looks related to ${strongestCategory.label}. Make sure the selected type matches your intent.`
      : undefined;

  return {
    language: detectPromptLanguage(prompt),
    primaryCategory,
    primaryCategoryLabel: categoryLabel(primaryCategory),
    categoryConfidence: selectedPossibleCategory
      ? getConfidenceBand(possibleCategories, selectedType)
      : "low",
    possibleCategories: possibleCategories
      .filter((item) => item.category !== selectedType)
      .slice(0, 3),
    intent: rawPromptFields.intent,
    extractedFields: rawPromptFields.extractedFields,
    missingFields: unique(missingFields),
    constraints: unique(rawPromptFields.constraints),
    desiredFormat: rawPromptFields.desiredFormat,
    tone: rawPromptFields.tone,
    ambiguityNotes: rawPromptFields.ambiguityNotes,
    mismatchNote,
  };
}
