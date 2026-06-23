import {
  PROMPT_TYPES,
  PROMPT_TYPE_CONFIGS,
  type PromptType,
} from "./prompt-forms";

export const PROMPT_LIBRARY_STORAGE_KEY = "prompt-quality-studio-library";

export type SavedPrompt = {
  id: string;
  title: string;
  kind: "initial" | "follow-up";
  promptType: PromptType;
  originalPrompt: string;
  generatedPrompt: string;
  createdAt: string;
  score?: number;
  changes?: string[];
};

export type SavePromptInput = Omit<
  SavedPrompt,
  "id" | "title" | "createdAt" | "kind"
> & {
  title?: string;
  kind?: SavedPrompt["kind"];
};

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type SaveOptions = {
  id?: string;
  createdAt?: string;
};

export type SavePromptResult = {
  status: "saved" | "duplicate" | "unavailable" | "error";
  prompt?: SavedPrompt;
  prompts: SavedPrompt[];
};

export type DeletePromptResult = {
  status: "deleted" | "not_found" | "unavailable" | "error";
  prompts: SavedPrompt[];
};

const isPromptType = (value: unknown): value is PromptType =>
  typeof value === "string" &&
  (PROMPT_TYPES as readonly string[]).includes(value);

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));

const optionalScore = (value: unknown) =>
  typeof value === "number" && value >= 0 && value <= 100
    ? Math.round(value)
    : undefined;

const optionalChanges = (value: unknown) => {
  if (!Array.isArray(value)) return undefined;
  const changes = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
  return changes.length ? changes : undefined;
};

export function sanitizeSavedPrompts(value: unknown): SavedPrompt[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const candidate = item as Record<string, unknown>;
    const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
    const title =
      typeof candidate.title === "string" ? candidate.title.trim() : "";
    const originalPrompt =
      typeof candidate.originalPrompt === "string"
        ? candidate.originalPrompt.trim()
        : "";
    const generatedPrompt =
      typeof candidate.generatedPrompt === "string"
        ? candidate.generatedPrompt.trim()
        : "";
    const createdAt =
      typeof candidate.createdAt === "string" ? candidate.createdAt : "";

    if (
      !id ||
      !title ||
      !originalPrompt ||
      !generatedPrompt ||
      !isPromptType(candidate.promptType) ||
      !isValidDate(createdAt)
    ) {
      return [];
    }

    return [
      {
        id,
        title,
        kind: candidate.kind === "follow-up" ? "follow-up" : "initial",
        promptType: candidate.promptType,
        originalPrompt,
        generatedPrompt,
        createdAt,
        score: optionalScore(candidate.score),
        changes: optionalChanges(candidate.changes),
      },
    ];
  });
}

export function createSavedPromptTitle(
  originalPrompt: string,
  promptType: PromptType,
): string {
  const normalized = originalPrompt
    .replace(/\s+/g, " ")
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .trim();

  if (!normalized) {
    return `${PROMPT_TYPE_CONFIGS[promptType].label} prompt`;
  }

  const firstSentence = normalized.split(/[.!?](?:\s|$)/)[0]?.trim();
  const title = firstSentence || normalized;
  return title.length > 64 ? `${title.slice(0, 61).trimEnd()}…` : title;
}

function resolveStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage !== undefined) return storage;
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getSavedPrompts(storage?: StorageLike | null): SavedPrompt[] {
  const target = resolveStorage(storage);
  if (!target) return [];

  try {
    const rawValue = target.getItem(PROMPT_LIBRARY_STORAGE_KEY);
    if (!rawValue) return [];
    return sanitizeSavedPrompts(JSON.parse(rawValue));
  } catch {
    return [];
  }
}

export function isPromptLibraryAvailable(
  storage?: StorageLike | null,
): boolean {
  const target = resolveStorage(storage);
  if (!target) return false;

  try {
    target.getItem(PROMPT_LIBRARY_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export function savePrompt(
  input: SavePromptInput,
  storage?: StorageLike | null,
  options: SaveOptions = {},
): SavePromptResult {
  const target = resolveStorage(storage);
  if (!target) return { status: "unavailable", prompts: [] };

  const prompts = getSavedPrompts(target);
  const duplicate = prompts.find(
    (item) =>
      item.promptType === input.promptType &&
      item.generatedPrompt === input.generatedPrompt.trim(),
  );

  if (duplicate) {
    return { status: "duplicate", prompt: duplicate, prompts };
  }

  const prompt: SavedPrompt = {
    id: options.id ?? createId(),
    kind: input.kind ?? "initial",
    title:
      input.title?.trim() ||
      createSavedPromptTitle(input.originalPrompt, input.promptType),
    promptType: input.promptType,
    originalPrompt: input.originalPrompt.trim(),
    generatedPrompt: input.generatedPrompt.trim(),
    createdAt: options.createdAt ?? new Date().toISOString(),
    score: optionalScore(input.score),
    changes: optionalChanges(input.changes),
  };

  const nextPrompts = [prompt, ...prompts];

  try {
    target.setItem(
      PROMPT_LIBRARY_STORAGE_KEY,
      JSON.stringify(nextPrompts),
    );
    return { status: "saved", prompt, prompts: nextPrompts };
  } catch {
    return { status: "error", prompts };
  }
}

export function deletePrompt(
  id: string,
  storage?: StorageLike | null,
): DeletePromptResult {
  const target = resolveStorage(storage);
  if (!target) return { status: "unavailable", prompts: [] };

  const prompts = getSavedPrompts(target);
  const nextPrompts = prompts.filter((prompt) => prompt.id !== id);

  if (nextPrompts.length === prompts.length) {
    return { status: "not_found", prompts };
  }

  try {
    if (nextPrompts.length) {
      target.setItem(
        PROMPT_LIBRARY_STORAGE_KEY,
        JSON.stringify(nextPrompts),
      );
    } else {
      target.removeItem(PROMPT_LIBRARY_STORAGE_KEY);
    }
    return { status: "deleted", prompts: nextPrompts };
  } catch {
    return { status: "error", prompts };
  }
}
