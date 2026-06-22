import { getDimension, type Analysis } from "./prompt-analysis";
import type { PromptFieldValues, PromptType } from "./prompt-forms";

export type PromptChange = {
  title: string;
  description: string;
};

const hasValue = (fields: PromptFieldValues, key: string) =>
  Boolean(fields[key]?.trim());

const hasAnyValue = (fields: PromptFieldValues, keys: string[]) =>
  keys.some((key) => hasValue(fields, key));

export function getPromptChanges(
  promptType: PromptType,
  analysis: Analysis,
  fields: PromptFieldValues,
): PromptChange[] {
  const changes: PromptChange[] = [];

  const addChange = (title: string, description: string) => {
    if (!changes.some((change) => change.title === title)) {
      changes.push({ title, description });
    }
  };

  const goal = getDimension(analysis, "goal");
  const context = getDimension(analysis, "context");
  const output = getDimension(analysis, "output");

  if (goal.score < goal.max * 0.65) {
    addChange(
      "Clarified the task",
      "The instruction now states a more explicit objective.",
    );
  }

  if (
    promptType === "general" &&
    context.score < context.max * 0.65 &&
    hasAnyValue(fields, [
      "context",
      "topic",
      "industry",
      "location",
      "targetUser",
      "currentLevel",
    ])
  ) {
    addChange(
      "Missing context filled",
      "Relevant background from the clarification form is now included.",
    );
  }

  switch (promptType) {
    case "business_idea":
      if (hasValue(fields, "businessModel")) {
        addChange(
          "Defined the business model",
          "The request now reflects how the business should operate.",
        );
      }
      if (hasValue(fields, "budget")) {
        addChange(
          "Added a budget constraint",
          "Recommendations must fit the selected starting budget.",
        );
      }
      if (hasValue(fields, "location")) {
        addChange(
          "Added market context",
          "Ideas are grounded in the selected location or market.",
        );
      }
      if (hasAnyValue(fields, ["timeCommitment", "riskAppetite"])) {
        addChange(
          "Added operating constraints",
          "Available time and risk tolerance now shape the recommendation.",
        );
      }
      addChange(
        "Added validation criteria",
        "Each idea must include a practical way to test demand.",
      );
      break;

    case "content_writing":
      if (hasValue(fields, "platform")) {
        addChange(
          "Specified the platform",
          "The content can now match the selected publishing context.",
        );
      }
      if (hasValue(fields, "audience")) {
        addChange(
          "Added the target audience",
          "The instruction now identifies who the content is for.",
        );
      }
      if (hasValue(fields, "tone")) {
        addChange(
          "Defined the tone",
          "The desired voice is stated instead of left to interpretation.",
        );
      }
      if (hasValue(fields, "callToAction")) {
        addChange(
          "Added a call to action",
          "The content now has a clearer intended response.",
        );
      }
      if (hasAnyValue(fields, ["length", "language"])) {
        addChange(
          "Added delivery constraints",
          "Length and language expectations are now explicit.",
        );
      }
      break;

    case "career_resume":
      if (hasValue(fields, "targetRole")) {
        addChange(
          "Added the target role",
          "The career content is now tailored to a specific role.",
        );
      }
      if (hasValue(fields, "seniority")) {
        addChange(
          "Defined the seniority level",
          "Positioning now reflects the selected career level.",
        );
      }
      if (hasValue(fields, "goal")) {
        addChange(
          "Specified the deliverable",
          "The instruction clearly states what career asset to produce.",
        );
      }
      if (hasValue(fields, "tone")) {
        addChange(
          "Defined the tone",
          "The requested professional voice is now explicit.",
        );
      }
      addChange(
        "Added factuality guardrails",
        "The instruction prohibits invented achievements, metrics, or qualifications.",
      );
      if (fields.atsFocus === "yes") {
        addChange(
          "Added ATS guidance",
          "Relevant keyword alignment is included without keyword stuffing.",
        );
      }
      break;

    case "product_planning":
      if (hasAnyValue(fields, ["targetUser", "problem"])) {
        addChange(
          "Defined the user problem",
          "The plan is grounded in a target user and a specific need.",
        );
      }
      if (hasAnyValue(fields, ["platform", "stage"])) {
        addChange(
          "Added product context",
          "Platform and product stage now shape the planning request.",
        );
      }
      if (hasValue(fields, "successMetric")) {
        addChange(
          "Added a success metric",
          "The output now has a concrete measure of success.",
        );
      }
      break;

    case "learning_plan":
      if (hasAnyValue(fields, ["topic", "currentLevel"])) {
        addChange(
          "Defined the learning starting point",
          "The topic and current level now anchor the plan.",
        );
      }
      if (hasValue(fields, "goal")) {
        addChange(
          "Clarified the learning goal",
          "The roadmap now works toward a stated outcome.",
        );
      }
      if (hasAnyValue(fields, ["timeline", "timePerWeek"])) {
        addChange(
          "Added a realistic schedule",
          "The plan now reflects the timeline and weekly study time.",
        );
      }
      if (hasValue(fields, "learningStyle")) {
        addChange(
          "Added the learning approach",
          "The roadmap now follows the preferred learning style.",
        );
      }
      addChange(
        "Added progress checkpoints",
        "Milestones and checkpoints make progress easier to evaluate.",
      );
      addChange(
        "Added completion criteria",
        "The instruction now asks for a clear definition of completion.",
      );
      break;

    case "general":
      if (hasValue(fields, "context")) {
        addChange(
          "Missing context filled",
          "Relevant background is now included in the instruction.",
        );
      }
      if (hasValue(fields, "constraints")) {
        addChange(
          "Added constraints",
          "Important boundaries are now stated explicitly.",
        );
      }
      if (hasValue(fields, "audience")) {
        addChange(
          "Added the target audience",
          "The instruction now identifies who the output is for.",
        );
      }
      addChange(
        "Added success criteria",
        "The output is asked to satisfy explicit quality requirements.",
      );
      break;
  }

  if (
    output.score < output.max * 0.65 &&
    hasValue(fields, "outputFormat")
  ) {
    addChange(
      "Specified the output format",
      "The expected structure is now clear and directly usable.",
    );
  }

  return changes.slice(0, 7);
}
