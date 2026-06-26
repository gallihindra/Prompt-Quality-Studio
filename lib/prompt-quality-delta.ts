import {
  analyzePrompt,
  getDimension,
  type Analysis,
  type Dimension,
} from "./prompt-analysis";

export type QualityDeltaStatus = "weak" | "developing" | "strong";

export type PromptQualityDelta = {
  originalScore: number;
  improvedScore: number;
  originalStatus: QualityDeltaStatus;
  improvedStatus: QualityDeltaStatus;
  delta: number;
  improvements: {
    label: string;
    description?: string;
  }[];
};

const statusFromScore = (score: number): QualityDeltaStatus => {
  if (score >= 80) return "strong";
  if (score >= 40) return "developing";
  return "weak";
};

const hasFactualityGuardrail = (text: string) =>
  /\b(do not invent|don't invent|do not make up|use only provided|preserve factual|factual accuracy|jangan mengarang|jangan menambahkan)\b/i.test(
    text,
  );

const hasStructuredSections = (text: string) =>
  /(?:^|\n)[A-Z][A-Z /&-]{2,}\n/.test(text) ||
  /(?:^|\n)\s*\d+[.)]\s+\S/m.test(text) ||
  /\b(return|provide|format|include|output)\b/i.test(text);

const dimensionImproved = (
  original: Analysis,
  improved: Analysis,
  key: Dimension["key"],
  minimumScore = 0,
) => {
  const originalDimension = getDimension(original, key);
  const improvedDimension = getDimension(improved, key);
  return (
    improvedDimension.score > originalDimension.score &&
    improvedDimension.score >= minimumScore
  );
};

const addImprovement = (
  improvements: PromptQualityDelta["improvements"],
  label: string,
  description?: string,
) => {
  if (improvements.some((item) => item.label === label)) return;
  improvements.push({ label, description });
};

export function getPromptQualityDelta(
  originalPrompt: string,
  improvedPrompt: string,
): PromptQualityDelta {
  const originalAnalysis = analyzePrompt(originalPrompt);
  const improvedAnalysis = analyzePrompt(improvedPrompt);
  const improvements: PromptQualityDelta["improvements"] = [];

  if (dimensionImproved(originalAnalysis, improvedAnalysis, "goal", 18)) {
    addImprovement(
      improvements,
      "Goal is clearer",
      "The improved prompt frames the task more directly.",
    );
  }
  if (dimensionImproved(originalAnalysis, improvedAnalysis, "context", 14)) {
    addImprovement(
      improvements,
      "Context was added",
      "The instruction gives more background for the response.",
    );
  }
  if (dimensionImproved(originalAnalysis, improvedAnalysis, "output", 14)) {
    addImprovement(
      improvements,
      "Output format is defined",
      "The response structure is easier to follow.",
    );
  }
  if (dimensionImproved(originalAnalysis, improvedAnalysis, "constraints", 14)) {
    addImprovement(
      improvements,
      "Constraints are stronger",
      "The prompt sets clearer boundaries and requirements.",
    );
  }
  if (dimensionImproved(originalAnalysis, improvedAnalysis, "audience", 10)) {
    addImprovement(
      improvements,
      "Audience is clearer",
      "The prompt gives the response a more specific reader or user.",
    );
  }
  if (
    !hasFactualityGuardrail(originalPrompt) &&
    hasFactualityGuardrail(improvedPrompt)
  ) {
    addImprovement(
      improvements,
      "Factuality risk is reduced",
      "The improved prompt includes a guardrail against invented details.",
    );
  }
  if (
    !originalAnalysis.signals.successCriteria &&
    improvedAnalysis.signals.successCriteria
  ) {
    addImprovement(
      improvements,
      "Success criteria are clearer",
      "The prompt includes ways to evaluate or prioritize the answer.",
    );
  }
  if (!hasStructuredSections(originalPrompt) && hasStructuredSections(improvedPrompt)) {
    addImprovement(
      improvements,
      "Structure is stronger",
      "The improved prompt is organized into clearer sections or steps.",
    );
  }

  return {
    originalScore: originalAnalysis.score,
    improvedScore: improvedAnalysis.score,
    originalStatus: statusFromScore(originalAnalysis.score),
    improvedStatus: statusFromScore(improvedAnalysis.score),
    delta: improvedAnalysis.score - originalAnalysis.score,
    improvements: improvements.slice(0, 5),
  };
}
