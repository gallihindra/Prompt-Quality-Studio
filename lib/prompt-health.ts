import type { CanonicalPrompt } from "./canonical-prompt";
import type { Analysis } from "./prompt-analysis";
import {
  PROMPT_TYPE_CONFIGS,
  getMissingRequiredFields,
  type PromptFieldValues,
  type PromptType,
} from "./prompt-forms";

export type PromptHealthTone = "risk" | "missing" | "good" | "info";
export type PromptHealthSeverity = "low" | "medium" | "high";

export type PromptHealth = {
  status: "weak" | "developing" | "strong";
  badges: {
    label: string;
    tone: PromptHealthTone;
    description?: string;
  }[];
  risks: {
    title: string;
    description: string;
    severity: PromptHealthSeverity;
  }[];
  nextBestField?: {
    fieldId: string;
    label: string;
    reason: string;
  };
  strengths: {
    title: string;
    description: string;
  }[];
};

type PromptHealthInput = {
  rawPrompt: string;
  promptType: PromptType;
  analysis: Analysis;
  canonicalPrompt: CanonicalPrompt;
  fields: PromptFieldValues;
};

type FieldPriority = {
  fieldId: string;
  reason: string;
};

const value = (fields: PromptFieldValues, key: string) =>
  fields[key]?.trim() ?? "";

const hasValue = (fields: PromptFieldValues, key: string) =>
  Boolean(value(fields, key));

const hasAnyText = (...values: string[]) => values.some((item) => item.trim());

const hasSourceMaterial = (rawPrompt: string) =>
  rawPrompt.split(/\s+/).filter(Boolean).length >= 35 ||
  /(?:\n\s*[-*•]|\d+[.)]\s+|\bexperience\b.+\bmanaged\b|\bachieved\b|\bled\b|\bresponsible for\b)/i.test(
    rawPrompt,
  );

const hasFactualGuardrail = (rawPrompt: string, fields: PromptFieldValues) =>
  /do not invent|don't invent|use only provided|jangan mengarang|jangan menambahkan|preserve factual|factual accuracy/i.test(
    `${rawPrompt} ${Object.values(fields).join(" ")}`,
  );

const addBadge = (
  badges: PromptHealth["badges"],
  label: string,
  tone: PromptHealthTone,
  description?: string,
) => {
  if (badges.some((badge) => badge.label === label)) return;
  badges.push({ label, tone, description });
};

const addRisk = (
  risks: PromptHealth["risks"],
  title: string,
  description: string,
  severity: PromptHealthSeverity = "medium",
) => {
  if (risks.some((risk) => risk.title === title)) return;
  risks.push({ title, description, severity });
};

const addStrength = (
  strengths: PromptHealth["strengths"],
  title: string,
  description: string,
) => {
  if (strengths.some((strength) => strength.title === title)) return;
  strengths.push({ title, description });
};

const fieldLabel = (type: PromptType, fieldId: string) =>
  PROMPT_TYPE_CONFIGS[type].fields.find((field) => field.key === fieldId)
    ?.label ?? fieldId;

const nextBestField = (
  type: PromptType,
  fields: PromptFieldValues,
  priorities: FieldPriority[],
) => {
  const missingRequired = getMissingRequiredFields(type, fields);
  const requiredPriority = priorities.find((priority) =>
    missingRequired.some((field) => field.key === priority.fieldId),
  );
  const selectedPriority =
    requiredPriority ??
    priorities.find((priority) => !hasValue(fields, priority.fieldId));

  if (!selectedPriority) return undefined;

  return {
    fieldId: selectedPriority.fieldId,
    label: fieldLabel(type, selectedPriority.fieldId),
    reason: selectedPriority.reason,
  };
};

const priorityByType: Record<PromptType, FieldPriority[]> = {
  career_resume: [
    { fieldId: "targetRole", reason: "Add the target role first. This helps tailor the career rewrite." },
    { fieldId: "goal", reason: "Choose the career deliverable next so the output matches the asset you need." },
    { fieldId: "seniority", reason: "Add seniority so the language matches the responsibility level." },
    { fieldId: "tone", reason: "Choose a tone so the career material sounds intentional." },
  ],
  learning_plan: [
    { fieldId: "topic", reason: "Add the topic first so the plan has a clear learning target." },
    { fieldId: "currentLevel", reason: "Add current level next so the explanation depth matches the learner." },
    { fieldId: "timeline", reason: "Add timeline next so the plan has realistic pacing." },
    { fieldId: "timePerWeek", reason: "Add weekly study time next. This keeps the learning plan realistic." },
    { fieldId: "goal", reason: "Add the learning goal next so the plan aims at a concrete outcome." },
    { fieldId: "outputFormat", reason: "Define the output format next. This reduces generic responses." },
  ],
  business_idea: [
    { fieldId: "budget", reason: "Add budget first so the ideas stay realistic." },
    { fieldId: "location", reason: "Add market or location next so ideas fit the user’s context." },
    { fieldId: "businessModel", reason: "Choose a business model to narrow the opportunity space." },
    { fieldId: "timeCommitment", reason: "Add time commitment so recommendations match the available operating capacity." },
    { fieldId: "outputFormat", reason: "Define the output format next. This makes recommendations easier to compare." },
    { fieldId: "riskAppetite", reason: "Add risk appetite to separate safer ideas from experimental ones." },
  ],
  content_writing: [
    { fieldId: "platform", reason: "Add platform first so the format fits where it will be published." },
    { fieldId: "topic", reason: "Add the topic so the message has a clear center." },
    { fieldId: "audience", reason: "Add audience next so the writing can be targeted." },
    { fieldId: "tone", reason: "Choose tone so the style matches the intended voice." },
    { fieldId: "length", reason: "Add length so the response lands at the right depth." },
    { fieldId: "callToAction", reason: "Add a call to action if the content should guide the reader." },
  ],
  product_planning: [
    { fieldId: "productType", reason: "Add the product or feature first so the plan has a clear object." },
    { fieldId: "targetUser", reason: "Add target user next so the plan does not become generic." },
    { fieldId: "problem", reason: "Add the problem so the plan stays anchored in user need." },
    { fieldId: "stage", reason: "Add product stage so the scope stays realistic." },
    { fieldId: "successMetric", reason: "Add success metric so the plan defines what good looks like." },
    { fieldId: "outputFormat", reason: "Choose the planning format so the output is usable." },
  ],
  general: [
    { fieldId: "goal", reason: "Add the goal first so the response has a clear job." },
    { fieldId: "context", reason: "Add context next so the response can use the right background." },
    { fieldId: "audience", reason: "Add audience so the answer is pitched at the right level." },
    { fieldId: "outputFormat", reason: "Define the output format next. This reduces generic paragraphs." },
    { fieldId: "constraints", reason: "Add constraints to reduce assumptions and keep the answer in scope." },
  ],
};

const statusFrom = (
  analysis: Analysis,
  risks: PromptHealth["risks"],
  missingRequiredCount: number,
): PromptHealth["status"] => {
  if (
    analysis.score >= 75 &&
    missingRequiredCount === 0 &&
    !risks.some((risk) => risk.severity === "high")
  ) {
    return "strong";
  }
  if (analysis.score >= 45 || missingRequiredCount <= 2) return "developing";
  return "weak";
};

export function getPromptHealth({
  rawPrompt,
  promptType,
  analysis,
  canonicalPrompt,
  fields,
}: PromptHealthInput): PromptHealth {
  const badges: PromptHealth["badges"] = [];
  const risks: PromptHealth["risks"] = [];
  const strengths: PromptHealth["strengths"] = [];
  const missingRequired = getMissingRequiredFields(promptType, fields);

  if (canonicalPrompt.extractedFields.some((field) => field.label === "Topic")) {
    addBadge(badges, "Good topic clarity", "good");
    addStrength(strengths, "Topic is clear", "The prompt gives the response a subject to work from.");
  }
  if (analysis.dimensions.some((dimension) => dimension.key === "constraints" && dimension.score / dimension.max >= 0.65)) {
    addBadge(badges, "Strong constraints", "good");
    addStrength(strengths, "Constraints are present", "The prompt includes boundaries that can reduce drift.");
  }
  if (hasFactualGuardrail(rawPrompt, fields)) {
    addBadge(badges, "Guardrail added", "good");
    addStrength(strengths, "Factuality guardrail is present", "The prompt warns against inventing unsupported details.");
  }

  switch (promptType) {
    case "career_resume":
      if (hasValue(fields, "targetRole")) {
        addBadge(badges, "Target role defined", "good");
        addStrength(strengths, "Target role is defined", "The rewrite can be aimed at a specific hiring context.");
      } else {
        addBadge(badges, "Missing target role", "missing");
        addRisk(risks, "Target role is missing", "Target role is missing, so the rewrite may become too generic.", "medium");
      }
      if (/\b(resume|cv|experience description|linkedin|cover letter)\b/i.test(rawPrompt) && !hasSourceMaterial(rawPrompt)) {
        if (hasFactualGuardrail(rawPrompt, fields)) {
          addStrength(strengths, "Factuality risk is controlled", "The prompt includes a guardrail against invented career details.");
        } else {
          addBadge(badges, "Factuality risk", "risk");
          addRisk(
            risks,
            "Source material is missing",
            "This asks for career rewriting, but no source material was provided. The AI may invent details unless you provide the original content.",
            "high",
          );
        }
      } else if (hasSourceMaterial(rawPrompt)) {
        addStrength(strengths, "Source material is provided", "The prompt includes material the rewrite can preserve.");
      }
      break;

    case "learning_plan":
      if (hasValue(fields, "topic")) {
        addBadge(badges, "Good topic clarity", "good");
        addStrength(strengths, "Topic is clear", "The plan has a defined learning subject.");
      }
      if (hasValue(fields, "timeline")) {
        addBadge(badges, "Timeline defined", "good");
        addStrength(strengths, "Timeline is defined", "The plan can be paced against a concrete duration.");
      } else if (hasValue(fields, "topic")) {
        addBadge(badges, "Missing timeline", "missing");
        addRisk(risks, "Timeline is missing", "Timeline is missing. Without it, the plan may become too broad.", "medium");
      }
      if (hasValue(fields, "timePerWeek")) {
        addStrength(strengths, "Study time is defined", "The plan can fit the available weekly capacity.");
      } else {
        addBadge(badges, "Missing study time", "missing");
        addRisk(risks, "Weekly study time is missing", "Weekly study time is missing, so the plan may not be realistic.", "medium");
      }
      if (!hasValue(fields, "currentLevel")) {
        addRisk(risks, "Current level is missing", "Current level is missing, so the explanation depth may not match the learner.", "medium");
      }
      break;

    case "business_idea":
      if (hasValue(fields, "budget")) {
        addStrength(strengths, "Budget is defined", "The ideas can stay within a realistic starting constraint.");
      } else {
        addBadge(badges, "Missing budget", "missing");
        addRisk(risks, "Budget is missing", "Budget is missing. Business ideas may become unrealistic without a budget constraint.", "high");
      }
      if (hasValue(fields, "location")) {
        addStrength(strengths, "Market is defined", "The recommendations can fit a specific location or market.");
      } else {
        addRisk(risks, "Market/location is missing", "Market/location is missing, so ideas may not fit the user’s context.", "medium");
      }
      if (!hasValue(fields, "riskAppetite")) {
        addRisk(risks, "Risk appetite is missing", "Risk appetite is missing, so the output may mix safe and experimental ideas.", "low");
      }
      break;

    case "content_writing":
      if (hasValue(fields, "platform")) {
        addBadge(badges, "Platform defined", "good");
        addStrength(strengths, "Platform is defined", "The content can follow the conventions of the channel.");
      } else {
        addRisk(risks, "Platform is missing", "Platform is missing, so the format may not fit where it will be published.", "medium");
      }
      if (hasValue(fields, "audience")) {
        addBadge(badges, "Audience defined", "good");
        addStrength(strengths, "Audience is defined", "The writing can speak to a specific reader.");
      } else {
        addBadge(badges, "Missing audience", "missing");
        addRisk(risks, "Audience is missing", "Audience is missing, so the writing may not be targeted.", "medium");
      }
      if (!hasValue(fields, "tone")) {
        addRisk(risks, "Tone is missing", "Tone is missing, so the style may not match the intended voice.", "medium");
      }
      if (!hasValue(fields, "callToAction")) {
        addRisk(risks, "Call to action is missing", "Call to action is missing, so the content may not guide the reader clearly.", "low");
      }
      break;

    case "product_planning":
      if (hasValue(fields, "targetUser")) {
        addStrength(strengths, "Target user is defined", "The plan can be framed around a real user group.");
      } else {
        addBadge(badges, "Missing target user", "missing");
        addRisk(risks, "Target user is missing", "Target user is missing, so the plan may be too generic.", "medium");
      }
      if (hasValue(fields, "stage")) {
        addStrength(strengths, "Product stage is defined", "The scope can match the current maturity of the product.");
      } else {
        addRisk(risks, "Product stage is missing", "Product stage is missing, so the scope may be unrealistic.", "medium");
      }
      if (hasValue(fields, "successMetric")) {
        addBadge(badges, "Success metric defined", "good");
        addStrength(strengths, "Success metric is defined", "The plan can describe what good looks like.");
      } else {
        addRisk(risks, "Success metric is missing", "Success metric is missing, so the plan may not define what good looks like.", "high");
      }
      break;

    case "general":
      if (hasValue(fields, "outputFormat")) {
        addBadge(badges, "Format defined", "good");
        addStrength(strengths, "Output format is selected", "The response can use a clear structure.");
      } else {
        addBadge(badges, "Missing output format", "missing");
        addRisk(risks, "Output format is missing", "Output format is missing, so the answer may come back as generic paragraphs.", "medium");
      }
      if (hasValue(fields, "constraints")) {
        addStrength(strengths, "Constraints are present", "The response has boundaries to stay in scope.");
      } else {
        addRisk(risks, "Constraints are missing", "Constraints are missing, so the answer may make assumptions.", "low");
      }
      break;
  }

  if (missingRequired.length > 0) {
    addBadge(badges, "Missing required fields", "missing", `${missingRequired.length} required field${missingRequired.length === 1 ? "" : "s"} still need attention.`);
  }
  if (canonicalPrompt.mismatchNote) {
    addBadge(badges, "Ambiguous intent", "risk");
    addRisk(risks, "Prompt type may need confirmation", canonicalPrompt.mismatchNote, "low");
  }
  if (hasAnyText(value(fields, "outputFormat"), value(fields, "goal"))) {
    addBadge(badges, "Format or deliverable defined", "info");
  }

  return {
    status: statusFrom(analysis, risks, missingRequired.length),
    badges,
    risks,
    nextBestField: nextBestField(
      promptType,
      fields,
      priorityByType[promptType],
    ),
    strengths,
  };
}
