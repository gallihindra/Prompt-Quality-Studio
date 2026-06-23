import { describe, expect, it } from "vitest";

import {
  PROMPT_LIBRARY_STORAGE_KEY,
  createSavedPromptTitle,
  deletePrompt,
  getSavedPrompts,
  sanitizeSavedPrompts,
  savePrompt,
  type StorageLike,
} from "./prompt-library";

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

const input = {
  promptType: "learning_plan" as const,
  originalPrompt: "ajari aku machine learning",
  generatedPrompt: "Bantu saya membuat rencana belajar machine learning.",
  score: 22,
  changes: ["Clarified the task", "Added a realistic schedule"],
};

describe("Local Prompt Library", () => {
  it("saves typed prompt metadata", () => {
    const storage = createMemoryStorage();
    const result = savePrompt(input, storage, {
      id: "prompt-1",
      createdAt: "2026-06-23T10:00:00.000Z",
    });

    expect(result.status).toBe("saved");
    expect(getSavedPrompts(storage)).toEqual([
      {
        id: "prompt-1",
        title: "ajari aku machine learning",
        kind: "initial",
        promptType: "learning_plan",
        originalPrompt: input.originalPrompt,
        generatedPrompt: input.generatedPrompt,
        createdAt: "2026-06-23T10:00:00.000Z",
        score: 22,
        changes: input.changes,
      },
    ]);
  });

  it("does not create duplicate generated prompts", () => {
    const storage = createMemoryStorage();
    savePrompt(input, storage, { id: "prompt-1" });
    const duplicate = savePrompt(input, storage, { id: "prompt-2" });

    expect(duplicate.status).toBe("duplicate");
    expect(getSavedPrompts(storage)).toHaveLength(1);
    expect(duplicate.prompt?.id).toBe("prompt-1");
  });

  it("deletes a saved prompt", () => {
    const storage = createMemoryStorage();
    savePrompt(input, storage, { id: "prompt-1" });

    const result = deletePrompt("prompt-1", storage);

    expect(result.status).toBe("deleted");
    expect(getSavedPrompts(storage)).toEqual([]);
  });

  it("handles malformed stored data", () => {
    const invalidJson = createMemoryStorage({
      [PROMPT_LIBRARY_STORAGE_KEY]: "{not valid json",
    });
    const invalidEntries = [
      null,
      { id: "missing-fields" },
      { ...input, id: "bad-date", title: "Bad date", createdAt: "never" },
    ];

    expect(getSavedPrompts(invalidJson)).toEqual([]);
    expect(sanitizeSavedPrompts(invalidEntries)).toEqual([]);
  });

  it("handles unavailable browser storage without throwing", () => {
    expect(savePrompt(input, null)).toEqual({
      status: "unavailable",
      prompts: [],
    });
    expect(deletePrompt("prompt-1", null)).toEqual({
      status: "unavailable",
      prompts: [],
    });
  });

  it("creates concise titles and a fallback", () => {
    expect(createSavedPromptTitle("", "business_idea")).toBe(
      "Business idea prompt",
    );
    expect(
      createSavedPromptTitle(
        "Create a detailed operating plan for a new internal workflow that improves prompt reviews across the company.",
        "general",
      ),
    ).toBe(
      "Create a detailed operating plan for a new internal workflow…",
    );
  });
});
