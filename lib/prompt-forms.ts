export const PROMPT_TYPES = [
  "business_idea",
  "content_writing",
  "career_resume",
  "product_planning",
  "learning_plan",
  "general",
] as const;

export type PromptType = (typeof PROMPT_TYPES)[number];

export type PromptFieldOption = {
  value: string;
  label: string;
};

export type PromptField = {
  key: string;
  label: string;
  helper: string;
  required: boolean;
  placeholder?: string;
  input: "text" | "textarea" | "select";
  options?: PromptFieldOption[];
};

export type PromptTypeConfig = {
  label: string;
  description: string;
  samplePrompt: string;
  fields: PromptField[];
};

const options = (...values: string[]): PromptFieldOption[] =>
  values.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }));

export const PROMPT_TYPE_CONFIGS: Record<PromptType, PromptTypeConfig> = {
  business_idea: {
    label: "Business idea",
    description: "Evaluate or develop a business opportunity around practical operating constraints.",
    samplePrompt: "Suggest a small business I could start in Indonesia.",
    fields: [
      { key: "businessModel", label: "Business model", helper: "How should the business primarily operate?", required: true, input: "select", options: options("online", "offline", "hybrid", "not sure") },
      { key: "budget", label: "Starting budget", helper: "Choose the amount available for initial setup.", required: true, input: "select", options: options("no budget", "under Rp1 million", "Rp1–5 million", "Rp5–20 million", "above Rp20 million") },
      { key: "location", label: "Target location", helper: "Where should the opportunity be viable?", required: true, input: "select", options: options("Indonesia", "local city", "global", "custom") },
      { key: "skills", label: "Relevant skills", helper: "Select the strongest skill base to build around.", required: false, input: "select", options: options("operations", "sales", "content", "tech", "community", "design", "none yet") },
      { key: "timeCommitment", label: "Time commitment", helper: "How much time can you consistently invest?", required: true, input: "select", options: options("weekend only", "1–2 hours per day", "part-time", "full-time") },
      { key: "goal", label: "Primary business goal", helper: "What should the opportunity optimize for?", required: true, input: "select", options: options("side income", "fast cashflow", "scalable startup", "portfolio project") },
      { key: "riskAppetite", label: "Risk appetite", helper: "How much uncertainty and upfront experimentation is acceptable?", required: false, input: "select", options: options("low", "medium", "high") },
      { key: "outputFormat", label: "Preferred output", helper: "Choose how the recommendations should be organized.", required: true, input: "select", options: options("list", "table", "step-by-step plan", "ranked recommendation") },
    ],
  },
  content_writing: {
    label: "Content writing",
    description: "Shape content for a particular platform, audience, tone, and action.",
    samplePrompt: "Write a post about improving team productivity.",
    fields: [
      { key: "platform", label: "Platform", helper: "Where will this content be published?", required: true, input: "select", options: options("LinkedIn", "Instagram", "Twitter/X", "blog", "email") },
      { key: "topic", label: "Topic or message", helper: "State the central idea the content must communicate.", required: true, input: "textarea", placeholder: "e.g. Three ways managers can reduce meeting overload" },
      { key: "audience", label: "Audience", helper: "Identify the people the content should resonate with.", required: true, input: "text", placeholder: "e.g. First-time managers at growing technology companies" },
      { key: "tone", label: "Tone", helper: "Choose the voice the writing should use.", required: true, input: "select", options: options("professional", "casual", "persuasive", "educational", "storytelling") },
      { key: "language", label: "Language", helper: "Select the language for the final content.", required: true, input: "select", options: options("English", "Indonesian", "bilingual") },
      { key: "callToAction", label: "Call to action", helper: "What should the reader do after engaging with the content?", required: false, input: "text", placeholder: "e.g. Download the report or share their experience" },
      { key: "length", label: "Length", helper: "Choose the desired level of detail.", required: true, input: "select", options: options("short", "medium", "long") },
    ],
  },
  career_resume: {
    label: "Career & resume",
    description: "Create career materials aligned to a target role, level, and hiring context.",
    samplePrompt: "Improve my experience description for a customer success role.",
    fields: [
      { key: "targetRole", label: "Target role", helper: "Name the position this material should support.", required: true, input: "text", placeholder: "e.g. Senior Customer Success Manager" },
      { key: "industry", label: "Industry", helper: "Add the sector or company environment being targeted.", required: false, input: "text", placeholder: "e.g. B2B SaaS or financial services" },
      { key: "seniority", label: "Seniority", helper: "Choose the expected responsibility level.", required: true, input: "select", options: options("entry", "mid", "senior", "lead", "manager") },
      { key: "goal", label: "Career deliverable", helper: "Select the exact asset you want produced.", required: true, input: "select", options: options("resume bullet", "LinkedIn summary", "cover letter", "interview answer") },
      { key: "tone", label: "Tone", helper: "Choose how the candidate should come across.", required: true, input: "select", options: options("confident", "concise", "executive", "natural") },
      { key: "atsFocus", label: "ATS focus", helper: "Should the output prioritize applicant tracking system keywords?", required: false, input: "select", options: options("yes", "no") },
    ],
  },
  product_planning: {
    label: "Product planning",
    description: "Turn an early product request into a scoped planning artifact.",
    samplePrompt: "Plan a dashboard that helps managers understand team workload.",
    fields: [
      { key: "productType", label: "Product type", helper: "Describe the product or feature being planned.", required: true, input: "text", placeholder: "e.g. Team analytics dashboard" },
      { key: "targetUser", label: "Target user", helper: "Identify the primary user and their role.", required: true, input: "text", placeholder: "e.g. Operations managers leading teams of 20–100" },
      { key: "problem", label: "Problem to solve", helper: "State the user problem without prescribing the solution.", required: true, input: "textarea", placeholder: "e.g. Managers cannot identify workload risk early enough" },
      { key: "platform", label: "Platform", helper: "Where will the product experience live?", required: false, input: "select", options: options("web", "mobile", "internal tool", "marketplace") },
      { key: "stage", label: "Product stage", helper: "Choose the current maturity of the product.", required: true, input: "select", options: options("idea", "MVP", "launched", "scaling") },
      { key: "successMetric", label: "Success metric", helper: "Define the measurable outcome that indicates value.", required: true, input: "text", placeholder: "e.g. Reduce weekly workload review time by 30%" },
      { key: "outputFormat", label: "Planning format", helper: "Select the product document to generate.", required: true, input: "select", options: options("PRD", "feature brief", "roadmap", "user stories") },
    ],
  },
  learning_plan: {
    label: "Learning plan",
    description: "Build a realistic learning path around a goal, schedule, and preferred method.",
    samplePrompt: "Help me learn data analysis.",
    fields: [
      { key: "topic", label: "Topic", helper: "Name the subject or skill you want to learn.", required: true, input: "text", placeholder: "e.g. Data analysis with spreadsheets and SQL" },
      { key: "currentLevel", label: "Current level", helper: "Choose your starting level.", required: true, input: "select", options: options("beginner", "intermediate", "advanced") },
      { key: "goal", label: "Learning goal", helper: "Describe what you should be able to do at the end.", required: true, input: "textarea", placeholder: "e.g. Analyze an operational dataset and present useful findings" },
      { key: "timeline", label: "Timeline", helper: "How soon should the goal be reached?", required: true, input: "text", placeholder: "e.g. 8 weeks" },
      { key: "timePerWeek", label: "Time per week", helper: "Set a realistic weekly study commitment.", required: true, input: "text", placeholder: "e.g. 5 hours per week" },
      { key: "learningStyle", label: "Learning style", helper: "Choose the approach that helps you learn best.", required: false, input: "select", options: options("practical", "theory-first", "project-based", "structured course") },
      { key: "outputFormat", label: "Plan format", helper: "Choose how the learning plan should be structured.", required: true, input: "select", options: options("roadmap", "weekly plan", "checklist") },
    ],
  },
  general: {
    label: "General",
    description: "Use the standard structure for requests that do not fit a specialist workflow.",
    samplePrompt: "Help me prepare a clear recommendation for my team.",
    fields: [
      { key: "goal", label: "Goal", helper: "What should the response accomplish?", required: true, input: "textarea", placeholder: "e.g. Recommend the best option and explain the trade-offs" },
      { key: "context", label: "Context", helper: "Add the background or source material needed to answer well.", required: true, input: "textarea", placeholder: "e.g. We need to choose between three tools before next quarter" },
      { key: "constraints", label: "Constraints", helper: "Set boundaries such as scope, tone, length, or exclusions.", required: false, input: "textarea", placeholder: "e.g. Keep it concise, use plain language, and avoid unsupported claims" },
      { key: "audience", label: "Audience", helper: "Who will read or use the response?", required: true, input: "text", placeholder: "e.g. Department leaders with limited technical knowledge" },
      { key: "outputFormat", label: "Output format", helper: "Specify the structure of the final deliverable.", required: true, input: "text", placeholder: "e.g. Comparison table followed by a recommendation" },
    ],
  },
};

export type PromptFieldValues = Record<string, string>;

export function createEmptyFieldValues(type: PromptType): PromptFieldValues {
  return Object.fromEntries(PROMPT_TYPE_CONFIGS[type].fields.map((field) => [field.key, ""]));
}

export function getMissingRequiredFields(
  type: PromptType,
  values: PromptFieldValues,
): PromptField[] {
  return PROMPT_TYPE_CONFIGS[type].fields.filter(
    (field) => field.required && !values[field.key]?.trim(),
  );
}
