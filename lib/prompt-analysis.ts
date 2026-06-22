export type Dimension = {
  key: "goal" | "context" | "constraints" | "output" | "audience";
  label: string;
  score: number;
  max: number;
  note: string;
};

export type Analysis = {
  score: number;
  label: string;
  dimensions: Dimension[];
  strengths: string[];
  gaps: string[];
  signals: {
    successCriteria: boolean;
  };
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasAny = (text: string, terms: string[]) =>
  terms.some((term) =>
    new RegExp(`(?:^|\\W)${escapeRegExp(term)}(?:$|\\W)`, "i").test(text),
  );

const hasNumberedList = (text: string) =>
  /(?:^|\n)\s*\d+[.)]\s+\S/m.test(text);

export function getDimension(
  analysis: Analysis,
  key: Dimension["key"],
): Dimension {
  const dimension = analysis.dimensions.find((item) => item.key === key);
  if (!dimension) throw new Error(`Unknown scoring dimension: ${key}`);
  return dimension;
}

export function analyzePrompt(prompt: string): Analysis {
  const text = prompt.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((part) => part.trim().length > 0);

  const goalSignals = /^(write|create|draft|analyze|summarize|compare|explain|design|develop|generate|review|plan|help|act|give|suggest|recommend|make)\b/i.test(text) ||
    hasAny(text, ["your task", "objective", "goal"]);
  const specificGoalSignals = hasAny(text, ["improve", "prioritize", "rank", "validate"]);
  const learningContextSignals =
    hasAny(text, ["beginner", "intermediate", "advanced", "learning goal", "study time", "hours per week", "hour per week", "used in practice", "use in practice", "practical use case"]) ||
    /\b\d+\s*[- ]?(?:day|week|month|year)s?\b/i.test(text);
  const contextSignals =
    hasAny(text, ["because", "background", "context", "currently", "we are", "our company", "indonesia", "role", "linkedin"]) ||
    learningContextSignals;
  const constraintSignals = hasAny(text, ["must", "avoid", "do not", "limit", "within", "under", "maximum", "minimum", "tone", "include", "exclude", "low budget", "short", "minimal inventory", "require"]);
  const outputSignals = hasAny(text, [
    "format",
    "roadmap",
    "plan",
    "checklist",
    "table",
    "bullet",
    "bullets",
    "numbered list",
    "section",
    "json",
    "outline",
    "email",
    "memo",
    "list",
    "paragraph",
    "post",
    "resume",
    "presentation",
    "ideas",
    "for each",
    "rank",
    "steps",
    "risks",
    "validation method",
    "should include",
    "include:",
    "provide:",
    "output as",
    "format as",
  ]);
  const structuredOutputSignals =
    hasNumberedList(text) ||
    hasAny(text, ["bullets", "numbered list", "should include", "include:", "provide:", "output as", "format as", "heading", "columns", "steps"]);
  const audienceSignals = hasAny(text, ["audience", "reader", "readers", "customer", "customers", "executive", "executives", "beginner", "beginners", "expert", "experts", "team", "teams", "stakeholder", "stakeholders", "client", "clients", "leader", "leaders", "manager", "managers", "founder", "founders"]);
  const successCriteriaSignals = hasAny(text, [
    "milestone",
    "milestones",
    "checkpoint",
    "checkpoints",
    "completion criteria",
    "validation method",
    "evaluation criteria",
    "success criteria",
    "acceptance criteria",
    "success means",
    "prioritize",
    "rank",
    "evaluate",
    "evaluation",
    "revenue within",
  ]);

  const goal = Math.min(25, (goalSignals ? 15 : 5) + (words.length >= 8 || specificGoalSignals ? 5 : 0) + (text.includes("?") || sentences.length > 1 ? 5 : 0));
  const context = Math.min(20, (contextSignals ? 12 : 3) + (words.length >= 25 ? 5 : 0) + (words.length >= 60 ? 3 : 0));
  const constraints = Math.min(20, (constraintSignals ? 12 : 2) + (/\d/.test(text) ? 4 : 0) + (hasAny(text, ["tone", "style", "length"]) ? 4 : 0));
  const output = Math.min(
    20,
    (outputSignals ? 14 : 3) +
      (structuredOutputSignals ? 3 : 0) +
      (/\d/.test(text) && !structuredOutputSignals ? 3 : 0),
  );
  const audience = Math.min(15, (audienceSignals ? 11 : 2) + (hasAny(text, ["knowledge", "needs", "decision", "understand"]) ? 4 : 0));

  const dimensions: Dimension[] = [
    { key: "goal", label: "Goal clarity", score: goal, max: 25, note: goal >= 18 ? "The requested action is specific." : "State the exact task, desired result, and success criteria." },
    { key: "context", label: "Context", score: context, max: 20, note: context >= 14 ? "Relevant background is present." : "Add situational background and inputs." },
    { key: "constraints", label: "Constraints", score: constraints, max: 20, note: constraints >= 14 ? "Boundaries and preferences are defined." : "Set scope, tone, length, and exclusions." },
    { key: "output", label: "Output format", score: output, max: 20, note: output >= 14 ? "The deliverable format is clear." : "Specify structure and format." },
    { key: "audience", label: "Audience", score: audience, max: 15, note: audience >= 10 ? "The intended reader is identified." : "Identify who will use the answer." },
  ];

  const score = dimensions.reduce((sum, item) => sum + item.score, 0);
  const strengths = dimensions.filter((item) => item.score / item.max >= 0.65).map((item) => item.label);
  const gaps = dimensions.filter((item) => item.score / item.max < 0.65).map((item) => item.note);

  return {
    score,
    label: score >= 80 ? "Strong" : score >= 60 ? "Workable" : score >= 40 ? "Developing" : "Vague",
    dimensions,
    strengths,
    gaps,
    signals: {
      successCriteria: successCriteriaSignals,
    },
  };
}
