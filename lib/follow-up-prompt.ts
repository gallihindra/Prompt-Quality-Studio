export const FOLLOW_UP_ISSUES = [
  { id: "too_generic", label: "Too generic", labelId: "Terlalu umum" },
  { id: "too_long", label: "Too long", labelId: "Terlalu panjang" },
  { id: "too_short", label: "Too short", labelId: "Terlalu singkat" },
  { id: "not_actionable", label: "Not actionable", labelId: "Belum bisa langsung diterapkan" },
  { id: "missing_examples", label: "Missing examples", labelId: "Kurang contoh" },
  { id: "missing_structure", label: "Missing structure", labelId: "Kurang terstruktur" },
  { id: "wrong_tone", label: "Wrong tone", labelId: "Nada kurang sesuai" },
  { id: "too_advanced", label: "Too advanced", labelId: "Terlalu rumit" },
  { id: "too_basic", label: "Too basic", labelId: "Terlalu dasar" },
  { id: "wrong_format", label: "Did not follow the requested format", labelId: "Tidak mengikuti format yang diminta" },
  { id: "needs_steps", label: "Needs step-by-step explanation", labelId: "Perlu penjelasan langkah demi langkah" },
  { id: "needs_comparison", label: "Needs a table or comparison", labelId: "Perlu tabel atau perbandingan" },
  { id: "needs_tradeoffs", label: "Needs risks or tradeoffs", labelId: "Perlu risiko atau trade-off" },
  { id: "needs_local_context", label: "Needs local context", labelId: "Perlu konteks lokal" },
  { id: "missing_next_actions", label: "Missing next actions", labelId: "Belum ada langkah berikutnya" },
  { id: "contains_assumptions", label: "Contains assumptions", labelId: "Mengandung asumsi" },
  { id: "needs_factual_caution", label: "Needs stronger factual caution", labelId: "Perlu kehati-hatian faktual" },
] as const;

export type FollowUpIssue = (typeof FOLLOW_UP_ISSUES)[number]["id"];

export type FollowUpInput = {
  originalPrompt: string;
  aiOutput: string;
  issues: FollowUpIssue[];
  desiredImprovement: string;
  desiredFormat?: string;
  desiredTone?: string;
  desiredDepth?: string;
  constraints?: string;
};

export type NormalizedFollowUpInput = {
  originalPrompt: string;
  aiOutput: string;
  issues: FollowUpIssue[];
  desiredImprovement: string;
  desiredFormat: string;
  desiredTone: string;
  desiredDepth: string;
  constraints: string;
};

const issueIds = new Set<string>(FOLLOW_UP_ISSUES.map((issue) => issue.id));

const normalizeText = (value: string | undefined) =>
  (value ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();

const compactGoal = (value: string, maxLength = 520) => {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxLength
    ? `${compact.slice(0, maxLength - 1).trimEnd()}…`
    : compact;
};

export function normalizeFollowUpInput(
  input: FollowUpInput,
): NormalizedFollowUpInput {
  return {
    originalPrompt: normalizeText(input.originalPrompt),
    aiOutput: normalizeText(input.aiOutput),
    issues: Array.from(new Set(input.issues)).filter((issue) => issueIds.has(issue)),
    desiredImprovement: normalizeText(input.desiredImprovement),
    desiredFormat: normalizeText(input.desiredFormat),
    desiredTone: normalizeText(input.desiredTone),
    desiredDepth: normalizeText(input.desiredDepth),
    constraints: normalizeText(input.constraints),
  };
}

export function isLikelyIndonesian(...values: string[]): boolean {
  const text = values.join(" ").toLowerCase();
  const markers = [
    " aku ", " saya ", " tolong ", " bantu ", " agar ", " untuk ", " dengan ",
    " yang ", " dari ", " ini ", " itu ", " jangan ", " lebih ", " kurang ",
    " buat ", " jelaskan ", " rencana ", " contoh ", " langkah ",
  ];
  const padded = ` ${text.replace(/[^a-z0-9]+/gi, " ")} `;
  return markers.filter((marker) => padded.includes(marker)).length >= 2;
}

export function summarizeSelectedIssues(
  issues: FollowUpIssue[],
  language: "en" | "id" = "en",
): string {
  const labels = FOLLOW_UP_ISSUES
    .filter((issue) => issues.includes(issue.id))
    .map((issue) => language === "id" ? issue.labelId.toLowerCase() : issue.label.toLowerCase());

  if (!labels.length) return "";
  if (labels.length === 1) return labels[0];
  const conjunction = language === "id" ? "dan" : "and";
  return `${labels.slice(0, -1).join(", ")}, ${conjunction} ${labels.at(-1)}`;
}

const hasCareerContext = (input: NormalizedFollowUpInput) =>
  /\b(resume|résumé|cv|curriculum vitae|cover letter|linkedin|lamaran|riwayat hidup)\b/i
    .test(`${input.originalPrompt} ${input.desiredImprovement}`);

export function buildFollowUpPrompt(input: FollowUpInput): string {
  const normalized = normalizeFollowUpInput(input);
  const language = isLikelyIndonesian(
    normalized.originalPrompt,
    normalized.desiredImprovement,
    normalized.constraints,
  ) ? "id" : "en";
  const issueSummary = summarizeSelectedIssues(normalized.issues, language);
  const careerCaution = hasCareerContext(normalized);
  const assumptionCaution =
    normalized.issues.includes("contains_assumptions") ||
    normalized.issues.includes("needs_factual_caution") ||
    careerCaution;

  if (language === "id") {
    const requirements = [
      normalized.desiredFormat && `Format: ${normalized.desiredFormat}`,
      normalized.desiredTone && `Nada: ${normalized.desiredTone}`,
      normalized.desiredDepth && `Kedalaman: ${normalized.desiredDepth}`,
      normalized.constraints && `Konteks atau batasan yang harus dipertahankan: ${normalized.constraints}`,
    ].filter(Boolean);

    const lines = [
      `Jawaban sebelumnya masih ${issueSummary || "perlu diperbaiki agar lebih sesuai dengan kebutuhan saya"}.`,
      "",
      `Tolong revisi jawaban tersebut dengan fokus pada hal berikut: ${normalized.desiredImprovement}`,
      "",
      `Tetap berpegang pada tujuan awal: “${compactGoal(normalized.originalPrompt)}”`,
    ];

    if (requirements.length) {
      lines.push("", "Gunakan panduan berikut:", ...requirements.map((item) => `- ${item}`));
    }
    if (assumptionCaution) {
      lines.push(
        "",
        careerCaution
          ? "Gunakan hanya informasi yang sudah saya berikan. Jangan mengarang pengalaman, pencapaian, angka, perusahaan, tanggung jawab, atau kualifikasi."
          : "Jangan menganggap informasi yang belum diberikan sebagai fakta. Tandai ketidakpastian atau minta klarifikasi jika diperlukan.",
      );
    }
    lines.push("", "Berikan versi revisinya langsung, tanpa mengulang penjelasan yang tidak perlu.");
    return lines.join("\n");
  }

  const requirements = [
    normalized.desiredFormat && `Format: ${normalized.desiredFormat}`,
    normalized.desiredTone && `Tone: ${normalized.desiredTone}`,
    normalized.desiredDepth && `Depth: ${normalized.desiredDepth}`,
    normalized.constraints && `Context or constraints to preserve: ${normalized.constraints}`,
  ].filter(Boolean);

  const lines = [
    `The previous answer is still ${issueSummary || "not aligned closely enough with what I need"}.`,
    "",
    `Please revise it with this improvement in mind: ${normalized.desiredImprovement}`,
    "",
    `Preserve the original goal: “${compactGoal(normalized.originalPrompt)}”`,
  ];

  if (requirements.length) {
    lines.push("", "Use these guidelines:", ...requirements.map((item) => `- ${item}`));
  }
  if (assumptionCaution) {
    lines.push(
      "",
      careerCaution
        ? "Use only the information I provided. Do not invent achievements, metrics, employers, responsibilities, experience, or qualifications."
        : "Do not present unstated assumptions as facts. Flag uncertainty or ask for clarification where needed.",
    );
  }
  lines.push("", "Provide the revised answer directly and avoid repeating unnecessary background.");
  return lines.join("\n");
}

export function getFollowUpFixes(input: FollowUpInput): string[] {
  const normalized = normalizeFollowUpInput(input);
  const fixes = [
    "Clarifies the expected revision",
    "Preserves the original goal",
  ];

  if (normalized.issues.some((issue) =>
    ["missing_structure", "needs_steps", "needs_comparison", "wrong_format"].includes(issue)
  )) fixes.push("Addresses missing structure");
  if (normalized.desiredFormat || normalized.issues.includes("wrong_format")) fixes.push("Adds requested format");
  if (normalized.desiredTone || normalized.desiredDepth) fixes.push("Adds tone and depth guidance");
  if (normalized.constraints) fixes.push("Preserves important context and constraints");
  if (
    normalized.issues.includes("contains_assumptions") ||
    normalized.issues.includes("needs_factual_caution") ||
    hasCareerContext(normalized)
  ) fixes.push("Adds safeguards against unsupported assumptions");
  if (normalized.issues.includes("missing_examples")) fixes.push("Requests concrete examples");
  if (normalized.issues.includes("missing_next_actions") || normalized.issues.includes("not_actionable")) {
    fixes.push("Makes the response more actionable");
  }

  return Array.from(new Set(fixes));
}
