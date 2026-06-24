"use client";

import { useEffect, useMemo, useState } from "react";
import { createCanonicalPrompt } from "@/lib/canonical-prompt";
import {
  applyPrefillToUntouchedFields,
  deriveClarificationPrefillValues,
} from "@/lib/clarification-prefill";
import { analyzePrompt } from "@/lib/prompt-analysis";
import { getPromptHealth } from "@/lib/prompt-health";
import {
  createEmptyFieldValues,
  getMissingRequiredFields,
  PROMPT_TYPE_CONFIGS,
  PROMPT_TYPES,
  type PromptFieldValues,
  type PromptType,
} from "@/lib/prompt-forms";
import { getPromptChanges } from "@/lib/prompt-changes";
import {
  generatePrompt,
  getCareerDeliverableWarning,
} from "@/lib/prompt-generator";
import { savePrompt } from "@/lib/prompt-library";
import { ArrowRight, Bookmark, Check, CopyIcon, Spark } from "./icons";
import { ScoreRing } from "./score-ring";
import { applySuggestionValue, SuggestionChips } from "./suggestion-chips";

const badgeClasses = {
  good: "border-success-100 bg-success-50 text-success-700",
  info: "border-[#D7DBF0] bg-[#EEF1FF] text-leaf-700",
  missing: "border-[#F0D8AC] bg-[#FFF8EB] text-[#7A551F]",
  risk: "border-[#F0C9A7] bg-[#FFF3E8] text-[#8A4D1F]",
} as const;

const severityClasses = {
  low: "bg-[#EEF1FF] text-leaf-700",
  medium: "bg-[#FFF8EB] text-[#7A551F]",
  high: "bg-[#FFF1ED] text-[#9A3412]",
} as const;

export function StudioTool() {
  const [promptType, setPromptType] = useState<PromptType>("general");
  const [prompt, setPrompt] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [fields, setFields] = useState<PromptFieldValues>(() => createEmptyFieldValues("general"));
  const [rewritten, setRewritten] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saved" | "duplicate" | "unavailable" | "error"
  >("idle");
  const [touchedFields, setTouchedFields] = useState<Set<string>>(
    () => new Set(),
  );

  const analysis = useMemo(() => analyzePrompt(prompt), [prompt]);
  const canonicalPrompt = useMemo(
    () => createCanonicalPrompt(prompt, promptType),
    [prompt, promptType],
  );
  const prefill = useMemo(
    () => deriveClarificationPrefillValues(prompt, promptType),
    [prompt, promptType],
  );
  const promptHealth = useMemo(
    () =>
      getPromptHealth({
        rawPrompt: prompt,
        promptType,
        analysis,
        canonicalPrompt,
        fields,
      }),
    [analysis, canonicalPrompt, fields, prompt, promptType],
  );
  const promptConfig = PROMPT_TYPE_CONFIGS[promptType];
  const missingRequiredFields = useMemo(
    () => getMissingRequiredFields(promptType, fields),
    [fields, promptType],
  );
  const canGenerate = missingRequiredFields.length === 0;
  const careerDeliverableWarning = useMemo(
    () =>
      promptType === "career_resume"
        ? getCareerDeliverableWarning(prompt, fields.goal ?? "")
        : null,
    [fields.goal, prompt, promptType],
  );
  const promptChanges = useMemo(
    () => (rewritten ? getPromptChanges(promptType, analysis, fields) : []),
    [analysis, fields, promptType, rewritten],
  );

  useEffect(() => {
    setFields((currentFields) => {
      const nextFields = applyPrefillToUntouchedFields({
        currentValues: currentFields,
        prefillValues: prefill.values,
        touchedFields,
      });
      const changed = Object.keys(nextFields).some(
        (key) => nextFields[key] !== currentFields[key],
      );
      return changed ? nextFields : currentFields;
    });
  }, [prefill.values, touchedFields]);

  function changePromptType(type: PromptType) {
    setPromptType(type);
    setFields(createEmptyFieldValues(type));
    setTouchedFields(new Set());
    setRewritten("");
    setCopyStatus("idle");
    setSaveStatus("idle");
  }

  function runAnalysis() {
    if (!prompt.trim()) return;
    setHasRun(true);
    setRewritten("");
    setSaveStatus("idle");
  }

  function createRewrite() {
    if (!canGenerate) return;
    setRewritten(generatePrompt(promptType, prompt, fields));
    setSaveStatus("idle");
  }

  function updateField(key: string, value: string) {
    setTouchedFields((current) => new Set(current).add(key));
    setFields((currentFields) => ({ ...currentFields, [key]: value }));
    setRewritten("");
    setCopyStatus("idle");
    setSaveStatus("idle");
  }

  function applyFieldSuggestion(key: string, option: string, mode: "single" | "append" | "multi" = "single") {
    updateField(key, applySuggestionValue(fields[key] ?? "", option, mode));
  }

  async function copyOutput() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(rewritten);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = rewritten;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("Copy command was unavailable.");
      }
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1600);
  }

  function saveCurrentPrompt() {
    const result = savePrompt({
      promptType,
      originalPrompt: prompt,
      generatedPrompt: rewritten,
      score: analysis.score,
      changes: promptChanges.map((change) => change.title),
    });
    setSaveStatus(result.status);
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">Prompt workspace</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Build a stronger prompt.</h1>
        <p className="mt-4 text-base leading-7 text-ink/60">Start with what you have. The studio will assess its structure and guide you through the missing details.</p>
      </div>

      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
        {["1  Score", "2  Diagnose", "3  Clarify", "4  Rewrite"].map((step, index) => {
          const active = index === 0 || hasRun;
          return (
            <div key={step} className={`whitespace-pre rounded-full border px-4 py-2 text-xs font-semibold ${active ? "border-leaf-100 bg-leaf-100 text-leaf-700" : "border-line bg-white/70 text-ink/35"}`}>
              {step}
            </div>
          );
        })}
      </div>

      <section className="panel overflow-hidden shadow-soft">
        <div className="border-b border-line p-5 sm:p-7">
          <div className="mb-6 grid gap-3 sm:grid-cols-[220px_1fr] sm:items-end">
            <label htmlFor="prompt-type" className="block">
              <span className="mb-2 block text-sm font-semibold">Prompt type</span>
              <select
                id="prompt-type"
                value={promptType}
                onChange={(event) => changePromptType(event.target.value as PromptType)}
                className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
              >
                {PROMPT_TYPES.map((type) => (
                  <option key={type} value={type}>{PROMPT_TYPE_CONFIGS[type].label}</option>
                ))}
              </select>
            </label>
            <p className="text-sm leading-6 text-ink/50">{promptConfig.description}</p>
          </div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <label htmlFor="prompt" className="text-sm font-semibold">Your raw prompt</label>
            <button
              onClick={() => {
                setPrompt(promptConfig.samplePrompt);
                setTouchedFields(new Set());
                setHasRun(false);
                setRewritten("");
                setSaveStatus("idle");
              }}
              className="text-xs font-semibold text-leaf-700 hover:underline"
            >
              Use a {promptConfig.label.toLowerCase()} example
            </button>
          </div>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setHasRun(false);
              setRewritten("");
              setSaveStatus("idle");
            }}
            placeholder="Paste or write your prompt here..."
            className="min-h-44 w-full rounded-xl border border-line bg-[#F9FAFD] p-4 text-base leading-7 outline-none transition placeholder:text-ink/30 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
          />
          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-ink/40">{prompt.trim().split(/\s+/).filter(Boolean).length} words · analyzed locally</p>
            <button onClick={runAnalysis} disabled={!prompt.trim()} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40">
              Assess prompt <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!hasRun ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-leaf-50 text-leaf-600"><Spark className="h-5 w-5" /></span>
              <h2 className="mt-4 font-semibold">Your assessment will appear here</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-ink/50">We’ll look for a clear goal, context, constraints, output format, and audience.</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[220px_1fr]">
              <div className="flex flex-col items-center justify-center rounded-xl border border-leaf-100 bg-leaf-50/70 p-6 text-center">
                <ScoreRing score={analysis.score} />
                <span className="mt-3 rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-700">{analysis.label}</span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Quality breakdown</h2>
                  <span className="text-xs text-ink/40">Weighted score</span>
                </div>
                <div className="mt-6 space-y-5">
                  {analysis.dimensions.map((dimension) => {
                    const percent = Math.round((dimension.score / dimension.max) * 100);
                    return (
                      <div key={dimension.key}>
                        <div className="mb-2 flex items-end justify-between gap-4">
                          <div><p className="text-sm font-semibold">{dimension.label}</p><p className="mt-0.5 text-xs text-ink/45">{dimension.note}</p></div>
                          <p className="shrink-0 text-sm font-semibold">{dimension.score}<span className="font-normal text-ink/35">/{dimension.max}</span></p>
                        </div>
                        <div className="h-1.5 rounded-full bg-line"><div className="h-full rounded-full bg-leaf-500 transition-all duration-700" style={{ width: `${percent}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-line bg-[#F8F9FD] p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">What is working</p>
                  <div className="mt-3 space-y-2">
                    {(analysis.strengths.length ? analysis.strengths : ["A starting task is present"]).map((item) => (
                      <p key={item} className="flex items-center gap-2 text-sm"><span className="grid h-5 w-5 place-items-center rounded-full bg-success-100 text-success-700"><Check className="h-3 w-3" /></span>{item}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Priority improvements</p>
                  <div className="mt-3 space-y-2">
                    {(analysis.gaps.length ? analysis.gaps : ["No major structural gaps detected."]).slice(0, 3).map((item, i) => (
                      <p key={item} className="flex items-start gap-2 text-sm"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#FFF3DF] text-[10px] font-bold text-[#98621D]">{i + 1}</span>{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <section className="border-t border-line bg-white p-6 sm:p-8" aria-labelledby="structured-interpretation-heading">
              <details className="group rounded-2xl border border-[#DADDF0] bg-[#F7F8FC] p-5 shadow-[0_12px_30px_rgba(49,46,129,0.05)]" open>
                <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="eyebrow">Structured interpretation</p>
                    <h2 id="structured-interpretation-heading" className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                      How the tool reads your original prompt
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/50">
                      This rule-based view separates what was found, what was inferred, and what still needs confirmation before the prompt is rebuilt.
                    </p>
                  </div>
                  <span className="rounded-full border border-[#C9CDEA] bg-white px-3 py-1.5 text-xs font-semibold text-leaf-700 group-open:hidden">
                    Show
                  </span>
                  <span className="rounded-full border border-[#C9CDEA] bg-white px-3 py-1.5 text-xs font-semibold text-leaf-700 group-open:inline hidden">
                    Hide
                  </span>
                </summary>

                <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Detected signals</p>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-ink/50">Language</dt>
                        <dd className="font-semibold capitalize">{canonicalPrompt.language}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-ink/50">Primary category</dt>
                        <dd className="font-semibold">{canonicalPrompt.primaryCategoryLabel}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-ink/50">Confidence</dt>
                        <dd className="font-semibold capitalize">{canonicalPrompt.categoryConfidence}</dd>
                      </div>
                    </dl>
                    {canonicalPrompt.possibleCategories.length > 0 && (
                      <div className="mt-4 border-t border-line pt-4">
                        <p className="text-xs font-semibold text-ink/45">May also relate to</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {canonicalPrompt.possibleCategories.map((category) => (
                            <span key={category.category} className="rounded-full bg-leaf-50 px-2.5 py-1 text-xs font-semibold text-leaf-700">
                              {category.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-line bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Found in prompt</p>
                      <div className="mt-3 space-y-2">
                        {canonicalPrompt.extractedFields.filter((field) => field.source === "explicit").length > 0 ? (
                          canonicalPrompt.extractedFields.filter((field) => field.source === "explicit").map((field) => (
                            <p key={`${field.label}-${field.value}`} className="text-sm leading-6">
                              <span className="font-semibold">{field.label}:</span>{" "}
                              <span className="text-ink/60">{field.value}</span>
                            </p>
                          ))
                        ) : (
                          <p className="text-sm leading-6 text-ink/50">No strong structured fields detected yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Inferred from wording</p>
                      <div className="mt-3 space-y-2">
                        {canonicalPrompt.extractedFields.filter((field) => field.source === "inferred").length > 0 ? (
                          canonicalPrompt.extractedFields.filter((field) => field.source === "inferred").map((field) => (
                            <p key={`${field.label}-${field.value}`} className="text-sm leading-6">
                              <span className="font-semibold">{field.label}:</span>{" "}
                              <span className="text-ink/60">{field.value}</span>
                            </p>
                          ))
                        ) : (
                          <p className="text-sm leading-6 text-ink/50">No extra intent inferred beyond the selected type.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-[#F0D8AC] bg-[#FFF8EB] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6128]">Still missing from the original prompt</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {canonicalPrompt.missingFields.map((field) => (
                        <span key={field} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#7A551F] ring-1 ring-[#F0D8AC]">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Confirmation notes</p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-ink/60">
                      {canonicalPrompt.mismatchNote && (
                        <p className="rounded-lg bg-[#FFF8EB] px-3 py-2 text-[#7A551F]">
                          {canonicalPrompt.mismatchNote}
                        </p>
                      )}
                      {canonicalPrompt.ambiguityNotes.map((note) => (
                        <p key={note}>{note}</p>
                      ))}
                      {!canonicalPrompt.mismatchNote && canonicalPrompt.ambiguityNotes.length === 0 && (
                        <p>The selected type looks usable. Confirm the missing details below before generating.</p>
                      )}
                    </div>
                  </div>
                </div>
              </details>
            </section>

            <section className="border-t border-line bg-[#F8F9FD] p-6 sm:p-8" aria-labelledby="prompt-health-heading">
              <div className="rounded-2xl border border-[#DADDF0] bg-white p-5 shadow-[0_12px_30px_rgba(49,46,129,0.05)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="eyebrow">Prompt Health</p>
                    <h2 id="prompt-health-heading" className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                      What to improve next
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/50">
                      A rule-based coach that updates as you fill the clarification fields.
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-[#D7DBF0] bg-[#EEF1FF] px-3 py-1.5 text-xs font-semibold capitalize text-leaf-700">
                    {promptHealth.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {promptHealth.badges.slice(0, 8).map((badge) => (
                    <span
                      key={badge.label}
                      title={badge.description}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${badgeClasses[badge.tone]}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="rounded-xl border border-[#D7DBF0] bg-[#F7F8FC] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Best next step</p>
                    {promptHealth.nextBestField ? (
                      <div className="mt-3">
                        <p className="text-sm font-semibold">{promptHealth.nextBestField.label}</p>
                        <p className="mt-1 text-sm leading-6 text-ink/55">{promptHealth.nextBestField.reason}</p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-ink/55">
                        The required structure is filled. Review optional details before generating.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#F0D8AC] bg-[#FFF8EB] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6128]">Risks and ambiguity</p>
                      <div className="mt-3 space-y-3">
                        {promptHealth.risks.length > 0 ? (
                          promptHealth.risks.slice(0, 3).map((risk) => (
                            <div key={risk.title}>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${severityClasses[risk.severity]}`}>
                                  {risk.severity}
                                </span>
                                <p className="text-sm font-semibold">{risk.title}</p>
                              </div>
                              <p className="mt-1 text-xs leading-5 text-ink/55">{risk.description}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm leading-6 text-ink/55">No major risk flags from the current form state.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-success-100 bg-success-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-success-700/75">Already strong</p>
                      <div className="mt-3 space-y-3">
                        {promptHealth.strengths.length > 0 ? (
                          promptHealth.strengths.slice(0, 3).map((strength) => (
                            <div key={strength.title} className="flex gap-2">
                              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-100 text-success-700">
                                <Check className="h-3 w-3" />
                              </span>
                              <div>
                                <p className="text-sm font-semibold">{strength.title}</p>
                                <p className="mt-1 text-xs leading-5 text-ink/55">{strength.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm leading-6 text-ink/55">Fill one or two key fields to surface strengths here.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-line p-6 sm:p-8">
              <div className="mb-6">
                <p className="eyebrow">Clarify</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Add {promptConfig.label.toLowerCase()} details.</h2>
                <p className="mt-2 text-sm text-ink/50">Complete the required fields to generate a finished instruction. Optional details are included only when provided.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {promptConfig.fields.map((field) => {
                  const fieldId = `${promptType}-${field.key}`;
                  const helperId = `${fieldId}-helper`;
                  const sharedClasses = "w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition placeholder:text-ink/28 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100";
                  const hasSuggestions = Boolean(field.suggestions?.length);
                  const prefilledFromPrompt =
                    prefill.sources[field.key] === "explicit" &&
                    fields[field.key] === prefill.values[field.key];

                  return (
                    <label key={field.key} htmlFor={fieldId} className="block">
                      <span className="mb-1 block text-sm font-semibold">
                        {field.label}
                        <span className={field.required ? "ml-1 text-leaf-700" : "ml-1 font-normal text-ink/40"}>
                          {field.required ? "*" : "(Optional)"}
                        </span>
                      </span>
                      <span id={helperId} className="mb-2 block text-xs leading-5 text-ink/45">
                        {field.helper}
                        {prefilledFromPrompt && (
                          <span className="mt-1 block font-semibold text-leaf-700">
                            Extracted from your prompt. You can edit it.
                          </span>
                        )}
                      </span>
                      {hasSuggestions && (
                        <SuggestionChips
                          label="Suggested options"
                          options={field.suggestions ?? []}
                          value={fields[field.key] ?? ""}
                          mode={field.suggestionMode ?? "single"}
                          onSelect={(option) =>
                            applyFieldSuggestion(
                              field.key,
                              option,
                              field.suggestionMode ?? "single",
                            )
                          }
                        />
                      )}
                      {field.input === "select" && !hasSuggestions ? (
                        <select
                          id={fieldId}
                          aria-describedby={helperId}
                          aria-required={field.required}
                          required={field.required}
                          value={fields[field.key] ?? ""}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          className={`h-12 ${sharedClasses}`}
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : field.input === "textarea" ? (
                        <textarea
                          id={fieldId}
                          aria-describedby={helperId}
                          aria-required={field.required}
                          required={field.required}
                          value={fields[field.key] ?? ""}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          placeholder={field.placeholder}
                          className={`min-h-28 py-3.5 leading-6 ${hasSuggestions ? "mt-3" : ""} ${sharedClasses}`}
                        />
                      ) : (
                        <input
                          id={fieldId}
                          aria-describedby={helperId}
                          aria-required={field.required}
                          type="text"
                          required={field.required}
                          value={fields[field.key] ?? ""}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          placeholder={field.placeholder ?? "Choose a suggestion or type your own"}
                          className={`h-12 ${hasSuggestions ? "mt-3" : ""} ${sharedClasses}`}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={createRewrite}
                  disabled={!canGenerate}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Generate improved prompt <Spark className="h-4 w-4" />
                </button>
                {missingRequiredFields.length > 0 && (
                  <p className="text-xs leading-5 text-ink/50" aria-live="polite">
                    Still required: {missingRequiredFields.map((field) => field.label).join(", ")}.
                  </p>
                )}
              </div>
              {careerDeliverableWarning && (
                <p
                  className="mt-3 rounded-lg border border-amber/40 bg-[#FFF7E9] px-3.5 py-2.5 text-xs leading-5 text-[#7A551F]"
                  role="status"
                >
                  {careerDeliverableWarning}
                </p>
              )}
            </div>

            {rewritten && (
              <>
                <div className="border-t border-line bg-[#EEF1FF] p-6 sm:p-8">
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-leaf-700/70">Structured prompt</p><h2 className="mt-1 text-xl font-semibold text-ink">Ready to use</h2></div>
                    <div className="grid w-full gap-2 sm:flex sm:w-auto">
                      <button
                        onClick={saveCurrentPrompt}
                        disabled={saveStatus === "saved" || saveStatus === "duplicate"}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#C9CDEA] bg-white px-4 py-2 text-xs font-semibold text-leaf-700 transition hover:border-leaf-500 disabled:cursor-default disabled:border-success-100 disabled:bg-success-50 disabled:text-success-700"
                      >
                        {saveStatus === "saved" || saveStatus === "duplicate" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                        {saveStatus === "saved"
                          ? "Saved"
                          : saveStatus === "duplicate"
                            ? "Already saved"
                            : "Save prompt"}
                      </button>
                      <button onClick={copyOutput} aria-live="polite" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${copyStatus === "copied" ? "bg-success-600 hover:bg-success-700 focus:ring-success-600" : "bg-leaf-600 hover:bg-leaf-700 focus:ring-leaf-500"}`}>
                        {copyStatus === "copied" ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                        {copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy prompt"}
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap break-words rounded-xl border border-[#D7DBF0] bg-white p-5 font-sans text-sm leading-7 text-ink/80 shadow-[0_12px_32px_rgba(49,46,129,0.08)]">{rewritten}</pre>
                  <div className="mt-3 flex flex-col gap-1 text-xs leading-5 text-ink/50 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Saved prompts stay in this browser only—no account,
                      database, or server-side storage.
                    </p>
                    <p aria-live="polite">
                      {saveStatus === "saved"
                        ? "Saved to your local library."
                        : saveStatus === "duplicate"
                          ? "This prompt is already in your local library."
                          : saveStatus === "unavailable"
                            ? "Local saving is unavailable in this browser."
                            : saveStatus === "error"
                              ? "Prompt could not be saved. Check browser storage settings."
                              : ""}
                    </p>
                  </div>
                </div>

                <section className="border-t border-[#D9D9F2] bg-[#F7F5FF] p-6 sm:p-8" aria-labelledby="what-changed-heading">
                  <div className="max-w-2xl">
                    <p className="eyebrow">Structure added</p>
                    <h2 id="what-changed-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em]">What changed</h2>
                    <p className="mt-2 text-sm leading-6 text-ink/50">
                      The generated instruction fills gaps and makes the request more specific. It does not guarantee a particular model response.
                    </p>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {promptChanges.map((change) => (
                      <div key={change.title} className="flex gap-3 rounded-xl border border-[#DDDCF3] bg-white/80 p-4 shadow-[0_6px_18px_rgba(76,70,160,0.05)]">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-leaf-100 text-leaf-700">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold">{change.title}</h3>
                          <p className="mt-1 text-xs leading-5 text-ink/50">{change.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
