"use client";

import { useMemo, useRef, useState } from "react";
import {
  FOLLOW_UP_ISSUES,
  buildFollowUpPrompt,
  getFollowUpFixes,
  type FollowUpInput,
  type FollowUpIssue,
} from "@/lib/follow-up-prompt";
import { savePrompt } from "@/lib/prompt-library";
import { applySuggestionValue, SuggestionChips } from "./suggestion-chips";
import { Bookmark, Check, CopyIcon, Spark } from "./icons";

const emptyForm: FollowUpInput = {
  originalPrompt: "",
  aiOutput: "",
  issues: [],
  desiredImprovement: "",
  desiredFormat: "",
  desiredTone: "",
  desiredDepth: "",
  constraints: "",
};

const examples = [
  {
    category: "Learning",
    original: "ajari aku machine learning",
    issue: "Too generic, missing roadmap, not actionable",
    excerpt: "Tolong revisi jawaban tersebut menjadi roadmap pemula selama 4 minggu yang praktis, lengkap dengan milestone dan latihan sederhana.",
  },
  {
    category: "Career",
    original: "improve my resume",
    issue: "Too generic, contains assumptions, not tailored",
    excerpt: "Please revise the resume bullets using only the information I provided. Do not invent achievements, metrics, employers, or responsibilities.",
  },
  {
    category: "Product planning",
    original: "help me plan an app",
    issue: "Too high-level, missing MVP scope and tradeoffs",
    excerpt: "Please turn this into a practical MVP plan with must-have features, nice-to-have features, risks, assumptions, and next steps.",
  },
];

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition placeholder:text-ink/28 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100";

const suggestionGroups = {
  desiredImprovement: [
    "Make it more practical",
    "Add structure",
    "Add examples",
    "Make it shorter",
    "Make it more detailed",
    "Turn it into an action plan",
    "Make it easier to understand",
    "Make it more specific",
    "Adapt it to my context",
    "Custom",
  ],
  desiredFormat: [
    "Step-by-step guide",
    "Checklist",
    "Table",
    "Weekly plan",
    "Short summary",
    "Comparison",
    "Action plan",
    "Email/message draft",
    "Resume bullets",
    "Custom",
  ],
  desiredTone: [
    "Clear and direct",
    "Friendly",
    "Professional",
    "Beginner-friendly",
    "Concise",
    "Persuasive",
    "Warm",
    "Neutral",
    "Custom",
  ],
  desiredDepth: [
    "Short overview",
    "Practical guide",
    "Detailed explanation",
    "Beginner-friendly",
    "Advanced",
    "Executive summary",
    "Step-by-step",
    "Custom",
  ],
  constraints: [
    "Keep original goal",
    "Do not invent facts",
    "Use only provided information",
    "Preserve my tone",
    "Keep it beginner-friendly",
    "Add local context",
    "Avoid advanced assumptions",
    "Keep it concise",
    "Custom",
  ],
} as const;

type SuggestionField =
  | "desiredImprovement"
  | "desiredFormat"
  | "desiredTone"
  | "desiredDepth"
  | "constraints";

export function FollowUpBuilder() {
  const [form, setForm] = useState<FollowUpInput>(emptyForm);
  const [generated, setGenerated] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saved" | "duplicate" | "unavailable" | "error"
  >("idle");
  const inputRefs = {
    desiredImprovement: useRef<HTMLTextAreaElement>(null),
    desiredFormat: useRef<HTMLInputElement>(null),
    desiredTone: useRef<HTMLInputElement>(null),
    desiredDepth: useRef<HTMLInputElement>(null),
    constraints: useRef<HTMLInputElement>(null),
  };

  const canGenerate =
    form.originalPrompt.trim() &&
    form.aiOutput.trim() &&
    form.issues.length > 0 &&
    form.desiredImprovement.trim();
  const fixes = useMemo(
    () => generated ? getFollowUpFixes(form) : [],
    [form, generated],
  );

  function updateField(
    key: Exclude<keyof FollowUpInput, "issues">,
    value: string,
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setGenerated("");
    setCopyStatus("idle");
    setSaveStatus("idle");
  }

  function applySuggestion(field: SuggestionField, option: string) {
    if (option === "Custom") {
      updateField(field, "");
      window.setTimeout(() => inputRefs[field].current?.focus(), 0);
      return;
    }

    if (field === "desiredImprovement") {
      updateField(field, applySuggestionValue(form.desiredImprovement, option, "append"));
      return;
    }

    if (field === "constraints") {
      updateField(field, applySuggestionValue(form.constraints ?? "", option, "multi"));
      return;
    }

    updateField(field, option);
  }

  function toggleIssue(issue: FollowUpIssue) {
    setForm((current) => ({
      ...current,
      issues: current.issues.includes(issue)
        ? current.issues.filter((item) => item !== issue)
        : [...current.issues, issue],
    }));
    setGenerated("");
    setCopyStatus("idle");
    setSaveStatus("idle");
  }

  function generate() {
    if (!canGenerate) return;
    setGenerated(buildFollowUpPrompt(form));
    setSaveStatus("idle");
  }

  async function copyPrompt() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generated);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = generated;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("Copy unavailable");
      }
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1800);
  }

  function saveFollowUp() {
    const result = savePrompt({
      kind: "follow-up",
      promptType: "general",
      originalPrompt: form.originalPrompt,
      generatedPrompt: generated,
      changes: fixes,
    });
    setSaveStatus(result.status);
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">Stage 2 · Refine the response</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          Follow-up Prompt Builder
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/60">
          Turn a generic or incomplete AI answer into a clearer next instruction.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/50">
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-success-600" /> Rule-based</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-success-600" /> Runs locally</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-success-600" /> No external AI API</span>
        </div>
      </div>

      <section className="panel mt-10 overflow-hidden shadow-soft">
        <div className="border-b border-line p-6 sm:p-8">
          <div className="mb-7">
            <p className="eyebrow">Context</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Show what happened.</h2>
            <p className="mt-2 text-sm leading-6 text-ink/50">
              Nothing you enter here leaves your browser.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <label htmlFor="original-prompt" className="block">
              <span className="mb-2 block text-sm font-semibold">Original prompt <span className="text-leaf-700">*</span></span>
              <textarea
                id="original-prompt"
                value={form.originalPrompt}
                onChange={(event) => updateField("originalPrompt", event.target.value)}
                placeholder="What did you originally ask?"
                className={`min-h-40 p-4 leading-7 ${fieldClass}`}
              />
            </label>
            <label htmlFor="ai-output" className="block">
              <span className="mb-2 block text-sm font-semibold">AI output received <span className="text-leaf-700">*</span></span>
              <textarea
                id="ai-output"
                value={form.aiOutput}
                onChange={(event) => updateField("aiOutput", event.target.value)}
                placeholder="Paste the answer you want to improve..."
                className={`min-h-40 p-4 leading-7 ${fieldClass}`}
              />
            </label>
          </div>
        </div>

        <div className="border-b border-line bg-[#F8F9FD] p-6 sm:p-8">
          <fieldset>
            <legend className="text-sm font-semibold">What is wrong with the answer? <span className="text-leaf-700">*</span></legend>
            <p className="mt-1 text-xs leading-5 text-ink/45">Select every issue that applies.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FOLLOW_UP_ISSUES.map((issue) => {
                const selected = form.issues.includes(issue.id);
                return (
                  <button
                    key={issue.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleIssue(issue.id)}
                    className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                      selected
                        ? "border-leaf-500 bg-leaf-600 text-white shadow-sm"
                        : "border-line bg-white text-ink/60 hover:border-leaf-500 hover:text-leaf-700"
                    }`}
                  >
                    {selected && <Check className="mr-1 inline h-3.5 w-3.5" />}
                    {issue.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-7">
            <p className="eyebrow">Direction</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Define the better version.</h2>
          </div>
          <label htmlFor="desired-improvement" className="block">
            <span className="mb-2 block text-sm font-semibold">Desired improvement <span className="text-leaf-700">*</span></span>
            <SuggestionChips
              label="Start from a common revision goal"
              options={suggestionGroups.desiredImprovement}
              value={form.desiredImprovement}
              onSelect={(option) => applySuggestion("desiredImprovement", option)}
            />
            <textarea
              id="desired-improvement"
              ref={inputRefs.desiredImprovement}
              value={form.desiredImprovement}
              onChange={(event) => updateField("desiredImprovement", event.target.value)}
              placeholder="For example: Turn it into a practical 4-week roadmap with milestones and exercises."
              className={`mt-3 min-h-28 p-4 leading-7 ${fieldClass}`}
            />
          </label>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label htmlFor="desiredFormat" className="block">
              <span className="mb-2 block text-sm font-semibold">Desired format <span className="font-normal text-ink/40">(Optional)</span></span>
              <SuggestionChips
                label="Choose a structure"
                options={suggestionGroups.desiredFormat}
                value={form.desiredFormat ?? ""}
                onSelect={(option) => applySuggestion("desiredFormat", option)}
              />
              <input
                id="desiredFormat"
                ref={inputRefs.desiredFormat}
                value={form.desiredFormat ?? ""}
                onChange={(event) => updateField("desiredFormat", event.target.value)}
                placeholder="For example: table, checklist, weekly plan"
                className={`mt-3 h-12 ${fieldClass}`}
              />
            </label>

            <label htmlFor="desiredTone" className="block">
              <span className="mb-2 block text-sm font-semibold">Desired tone <span className="font-normal text-ink/40">(Optional)</span></span>
              <SuggestionChips
                label="Choose a voice"
                options={suggestionGroups.desiredTone}
                value={form.desiredTone ?? ""}
                onSelect={(option) => applySuggestion("desiredTone", option)}
              />
              <input
                id="desiredTone"
                ref={inputRefs.desiredTone}
                value={form.desiredTone ?? ""}
                onChange={(event) => updateField("desiredTone", event.target.value)}
                placeholder="For example: direct, warm, professional"
                className={`mt-3 h-12 ${fieldClass}`}
              />
            </label>

            <label htmlFor="desiredDepth" className="block">
              <span className="mb-2 block text-sm font-semibold">Desired depth <span className="font-normal text-ink/40">(Optional)</span></span>
              <SuggestionChips
                label="Choose detail level"
                options={suggestionGroups.desiredDepth}
                value={form.desiredDepth ?? ""}
                onSelect={(option) => applySuggestion("desiredDepth", option)}
              />
              <input
                id="desiredDepth"
                ref={inputRefs.desiredDepth}
                value={form.desiredDepth ?? ""}
                onChange={(event) => updateField("desiredDepth", event.target.value)}
                placeholder="For example: concise overview or detailed beginner guide"
                className={`mt-3 h-12 ${fieldClass}`}
              />
            </label>

            <label htmlFor="constraints" className="block">
              <span className="mb-2 block text-sm font-semibold">Constraints or context to preserve <span className="font-normal text-ink/40">(Optional)</span></span>
              <SuggestionChips
                label="Select one or more guardrails"
                options={suggestionGroups.constraints}
                value={form.constraints ?? ""}
                mode="multi"
                onSelect={(option) => applySuggestion("constraints", option)}
              />
              <input
                id="constraints"
                ref={inputRefs.constraints}
                value={form.constraints ?? ""}
                onChange={(event) => updateField("constraints", event.target.value)}
                placeholder="Facts, limits, audience, local context, or boundaries"
                className={`mt-3 h-12 ${fieldClass}`}
              />
            </label>
          </div>
          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={generate}
              disabled={!canGenerate}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Build follow-up prompt <Spark className="h-4 w-4" />
            </button>
            {!canGenerate && (
              <p className="text-xs leading-5 text-ink/45">
                Add both prompts, select at least one issue, and describe the improvement.
              </p>
            )}
          </div>
        </div>

        {generated && (
          <>
            <div className="border-t border-line bg-[#EEF1FF] p-6 sm:p-8">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-leaf-700/70">Next instruction</p>
                  <h2 className="mt-1 text-xl font-semibold">Ready to paste</h2>
                </div>
                <div className="grid w-full gap-2 sm:flex sm:w-auto">
                  <button
                    type="button"
                    onClick={saveFollowUp}
                    disabled={saveStatus === "saved" || saveStatus === "duplicate"}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#C9CDEA] bg-white px-4 text-xs font-semibold text-leaf-700 transition hover:border-leaf-500 disabled:cursor-default disabled:border-success-100 disabled:bg-success-50 disabled:text-success-700"
                  >
                    {saveStatus === "saved" || saveStatus === "duplicate" ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {saveStatus === "saved" ? "Saved" : saveStatus === "duplicate" ? "Already saved" : "Save follow-up"}
                  </button>
                  <button
                    type="button"
                    onClick={copyPrompt}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold text-white transition ${
                      copyStatus === "copied" ? "bg-success-600" : "bg-leaf-600 hover:bg-leaf-700"
                    }`}
                  >
                    {copyStatus === "copied" ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    {copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy prompt"}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap break-words rounded-xl border border-[#D7DBF0] bg-white p-5 font-sans text-sm leading-7 text-ink/80 shadow-[0_12px_32px_rgba(49,46,129,0.08)]">
                {generated}
              </pre>
              <p className="mt-3 text-xs leading-5 text-ink/45" aria-live="polite">
                {saveStatus === "saved"
                  ? "Saved to your local library."
                  : saveStatus === "duplicate"
                    ? "This follow-up is already saved."
                    : saveStatus === "unavailable"
                      ? "Local saving is unavailable in this browser."
                      : saveStatus === "error"
                        ? "The follow-up could not be saved."
                        : "The builder structures your request; it does not verify the previous answer’s factual accuracy."}
              </p>
            </div>

            <section className="border-t border-[#D9D9F2] bg-[#F7F5FF] p-6 sm:p-8" aria-labelledby="follow-up-fixes">
              <p className="eyebrow">Revision logic</p>
              <h2 id="follow-up-fixes" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">What this follow-up fixes</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {fixes.map((fix) => (
                  <div key={fix} className="flex items-center gap-3 rounded-xl border border-[#DDDCF3] bg-white/80 p-4">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-leaf-100 text-leaf-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm font-semibold">{fix}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </section>

      <section className="mt-16 sm:mt-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Follow-up patterns</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Three common second turns.</h2>
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {examples.map((example, index) => (
            <article key={example.category} className="panel p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-leaf-600">0{index + 1}</span>
                <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-700">{example.category}</span>
              </div>
              <p className="mt-5 text-sm font-semibold">“{example.original}”</p>
              <p className="mt-3 text-xs leading-5 text-ink/45">{example.issue}</p>
              <p className="mt-5 border-t border-line pt-5 text-sm leading-7 text-ink/65">{example.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
