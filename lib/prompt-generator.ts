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
      return `ROLE
Act as a career communications editor.

CAREER TASK
${task(prompt)}

TARGET POSITIONING
- Target role: ${value(fields, "targetRole")}${optionalLine(fields, "industry", "Industry")}
- Seniority: ${value(fields, "seniority")}
- Deliverable: ${value(fields, "goal")}
- Tone: ${value(fields, "tone")}${optionalLine(fields, "atsFocus", "ATS focus")}

REQUIREMENTS
Preserve factual accuracy and do not invent achievements, employers, metrics, or qualifications. Emphasize relevant scope, actions, outcomes, and transferable strengths.${value(fields, "atsFocus") === "yes" ? " Incorporate role-relevant ATS keywords naturally without keyword stuffing." : ""}

OUTPUT
Produce the requested career deliverable in a polished, ready-to-edit form. Add a short note listing any missing evidence or metrics that would make it stronger.`;

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
      return `ROLE
Act as a structured learning coach.

LEARNING REQUEST
${task(prompt)}

LEARNER PROFILE
- Topic: ${value(fields, "topic")}
- Current level: ${value(fields, "currentLevel")}
- Target capability: ${value(fields, "goal")}
- Timeline: ${value(fields, "timeline")}
- Weekly time: ${value(fields, "timePerWeek")}${optionalLine(fields, "learningStyle", "Learning style")}
- Plan format: ${value(fields, "outputFormat")}

PLAN REQUIREMENTS
Create a realistic progression from the current level to the target capability. Prioritize practice, feedback, and evidence of progress. Keep the workload within the stated weekly time and include checkpoints for adjusting the plan.

OUTPUT
Provide the plan as a ${value(fields, "outputFormat")}. Include milestones, practice activities, a small applied project, and completion criteria.`;

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
