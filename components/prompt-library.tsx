"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PROMPT_TYPE_CONFIGS } from "@/lib/prompt-forms";
import {
  deletePrompt,
  getSavedPrompts,
  isPromptLibraryAvailable,
  type SavedPrompt,
} from "@/lib/prompt-library";
import { ArrowRight, Check, CopyIcon } from "./icons";

type CopyStatus = {
  id: string;
  status: "copied" | "error";
} | null;

const formatSavedDate = (createdAt: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));

const preview = (prompt: string) =>
  prompt.length > 220 ? `${prompt.slice(0, 217).trimEnd()}…` : prompt;

export function PromptLibrary() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "unavailable" | "error"
  >("loading");

  useEffect(() => {
    if (!isPromptLibraryAvailable()) {
      setStorageStatus("unavailable");
      return;
    }

    setPrompts(getSavedPrompts());
    setStorageStatus("ready");
  }, []);

  async function copyGeneratedPrompt(prompt: SavedPrompt) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(prompt.generatedPrompt);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = prompt.generatedPrompt;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("Copy unavailable");
      }
      setCopyStatus({ id: prompt.id, status: "copied" });
    } catch {
      setCopyStatus({ id: prompt.id, status: "error" });
    }

    window.setTimeout(() => setCopyStatus(null), 1800);
  }

  function removePrompt(id: string) {
    const result = deletePrompt(id);
    if (result.status === "deleted") {
      setPrompts(result.prompts);
      setExpandedId((current) => (current === id ? null : current));
      return;
    }

    setStorageStatus(
      result.status === "unavailable" ? "unavailable" : "error",
    );
  }

  if (storageStatus === "loading") {
    return (
      <div className="panel grid min-h-64 place-items-center p-8 text-center">
        <p className="text-sm text-ink/50">Loading your local library…</p>
      </div>
    );
  }

  if (storageStatus === "unavailable") {
    return (
      <div className="rounded-2xl border border-amber/40 bg-[#FFF7E9] p-7">
        <h2 className="text-xl font-semibold">Local storage is unavailable.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
          This browser is currently preventing local prompt storage. Your
          Studio still works, but prompts cannot be saved until browser storage
          is enabled.
        </p>
      </div>
    );
  }

  if (!prompts.length) {
    return (
      <div className="panel grid min-h-72 place-items-center p-8 text-center shadow-soft">
        <div className="max-w-md">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-leaf-100 text-leaf-700">
            <span className="text-lg font-semibold">0</span>
          </span>
          <h2 className="mt-5 text-xl font-semibold">No saved prompts yet.</h2>
          <p className="mt-3 text-sm leading-7 text-ink/55">
            Saved prompts will appear here. Generate a prompt in the Studio and
            save it to your local library.
          </p>
          <Link href="/studio" className="btn-primary mt-6">
            Open the Studio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {storageStatus === "error" && (
        <p
          className="rounded-xl border border-amber/40 bg-[#FFF7E9] px-4 py-3 text-sm text-[#7A551F]"
          role="status"
        >
          The library could not update. Check your browser storage settings.
        </p>
      )}

      {prompts.map((prompt) => {
        const isExpanded = expandedId === prompt.id;
        const itemCopyStatus =
          copyStatus?.id === prompt.id ? copyStatus.status : null;

        return (
          <article
            key={prompt.id}
            className="overflow-hidden rounded-2xl border border-line bg-[#FCFCFE] shadow-[0_12px_32px_rgba(49,46,129,0.06)]"
          >
            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-700">
                      {prompt.kind === "follow-up"
                        ? "Follow-up"
                        : PROMPT_TYPE_CONFIGS[prompt.promptType].label}
                    </span>
                    {prompt.score !== undefined && (
                      <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink/55">
                        Score {prompt.score}/100
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 break-words text-xl font-semibold tracking-[-0.025em]">
                    {prompt.title}
                  </h2>
                  <p className="mt-2 text-xs text-ink/40">
                    Saved {formatSavedDate(prompt.createdAt)}
                  </p>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                  <button
                    type="button"
                    onClick={() => copyGeneratedPrompt(prompt)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-xs font-semibold transition hover:border-leaf-500"
                  >
                    {itemCopyStatus === "copied" ? (
                      <Check className="h-4 w-4 text-success-600" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                    {itemCopyStatus === "copied"
                      ? "Copied"
                      : itemCopyStatus === "error"
                        ? "Copy failed"
                        : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : prompt.id)
                    }
                    aria-expanded={isExpanded}
                    aria-controls={`saved-prompt-${prompt.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-leaf-600 px-4 text-xs font-semibold text-white transition hover:bg-leaf-700"
                  >
                    {isExpanded ? "Hide details" : "View details"}
                  </button>
                </div>
              </div>

              {!isExpanded && (
                <p className="mt-5 break-words text-sm leading-7 text-ink/60">
                  {preview(prompt.generatedPrompt)}
                </p>
              )}
            </div>

            {isExpanded && (
              <div
                id={`saved-prompt-${prompt.id}`}
                className="border-t border-[#D9D9F2] bg-[#F7F5FF] p-5 sm:p-7"
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">
                      {prompt.kind === "follow-up" ? "Original goal" : "Original prompt"}
                    </p>
                    <p className="mt-3 break-words rounded-xl border border-line bg-white/80 p-4 text-sm leading-7 text-ink/65">
                      {prompt.originalPrompt}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf-700">
                      Generated prompt
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl border border-[#D7DBF0] bg-white p-4 font-sans text-sm leading-7 text-ink/75">
                      {prompt.generatedPrompt}
                    </pre>
                  </div>
                </div>

                {prompt.changes?.length ? (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">
                      Structure added
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {prompt.changes.map((change) => (
                        <span
                          key={change}
                          className="rounded-full border border-[#DDDCF3] bg-white/80 px-3 py-1.5 text-xs text-ink/60"
                        >
                          {change}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 border-t border-[#DDDCF3] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-ink/45">
                    Saved prompts stay in this browser only.
                  </p>
                  <button
                    type="button"
                    onClick={() => removePrompt(prompt.id)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E6CFCF] bg-white px-4 text-xs font-semibold text-[#9A4040] transition hover:bg-[#FFF7F7]"
                  >
                    Delete prompt
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
