import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight, Check } from "@/components/icons";

export const metadata: Metadata = {
  title: "Case Study",
  description:
    "How Prompt Quality Studio applies prompt evaluation and AI quality operations principles in a local-first product workflow.",
};

const productFlow = [
  "Raw prompt",
  "Score / diagnosis",
  "Structured interpretation",
  "Prompt Health Coach",
  "Smart prefill",
  "Guided clarification",
  "Improved prompt",
  "Before / After Quality Delta",
  "What Changed",
  "Save to Library",
  "Follow-up Builder",
];

const designDecisions = [
  {
    title: "Local-first, rule-based MVP",
    text: "The product proves the workflow without API costs, accounts, server-side prompt storage, or dependence on an external model.",
  },
  {
    title: "Prompt types over one generic flow",
    text: "Business ideas, career documents, product plans, content, and learning requests need different kinds of context.",
  },
  {
    title: "Explicit vs inferred information",
    text: "The Structured Interpretation layer separates what the prompt actually says from what the tool infers, so assumptions are not treated as facts.",
  },
  {
    title: "Guidance before generation",
    text: "Prompt Health explains risks, strengths, and the next best field before the user generates a rewritten prompt.",
  },
  {
    title: "Smart prefill with user control",
    text: "Only explicit information from the raw prompt can prefill fields, and users can always edit or override the result.",
  },
  {
    title: "Suggestion-assisted clarification",
    text: "Guided chips reduce blank-canvas friction while preserving manual input for custom context.",
  },
  {
    title: "Explain the transformation",
    text: "The What Changed panel names the structure added so users can learn from the rewrite rather than only copy it.",
  },
  {
    title: "Local saving without accounts",
    text: "The Local Prompt Library uses browser storage so users can save useful prompts without a database or login.",
  },
];

const qualityDimensions = [
  "Task clarity",
  "Context",
  "Constraints",
  "Audience",
  "Output format",
  "Success criteria",
  "Guardrails",
  "Source material when relevant",
];

const capabilities = [
  "Prompt Scoring and Diagnosis",
  "Prompt Type Selection",
  "Dynamic Clarification Forms",
  "Guided Suggestion Chips",
  "Structured Interpretation / Canonical View",
  "Smart Prefill from explicit prompt fields",
  "Prompt Health Coach",
  "Improved Prompt Generator",
  "Before / After Quality Delta",
  "What Changed Panel",
  "Local Prompt Library",
  "Follow-up Prompt Builder",
  "Examples and Methodology Pages",
];

const limitations = [
  "The system is deterministic and rule-based.",
  "It does not evaluate responses produced by AI models.",
  "It cannot guarantee that a rewritten prompt will produce a better output.",
  "Saved prompts use browser localStorage only, with no cloud sync or account-based access.",
  "It does not have semantic model understanding.",
  "The MVP focuses on instruction structure, not full AI-output evaluation.",
];

const roadmap = [
  "Prompt quality progress timeline",
  "Output style presets",
  "Local user preferences / profile",
  "Export / import prompt library",
  "Rubric Linter / Eval Ops Mode",
  "Optional Semantic Assist for ambiguous prompts, while keeping local rule-based mode as the default",
];

const demonstrations = [
  "AI quality operations thinking applied to a practical product",
  "Ambiguity reduction as a usable workflow",
  "Human-in-the-loop clarification systems",
  "Explainable AI-support tooling",
  "Deterministic guidance before relying on LLMs",
  "Privacy-friendly, zero-cost product architecture",
];

const promptHealthExamples = [
  "Career / Resume: source material and target role risks",
  "Learning Plan: missing timeline, level, or weekly study time",
  "Business Idea: missing budget or market",
  "Content Writing: missing audience, platform, or tone",
  "Product Planning: missing target user, stage, or success metric",
];

export default function CaseStudyPage() {
  return (
    <div>
      <section className="border-b border-line">
        <div className="container-page py-16 sm:py-24">
          <p className="eyebrow">Product case study</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Building Prompt Quality Studio
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-leaf-700">
            A local-first prompt quality workflow tool for diagnosing vague AI
            requests and building clearer instructions through structured
            guidance.
          </p>
          <p className="mt-7 max-w-3xl text-base leading-8 text-ink/60">
            Many weak AI outputs start before the model responds. The request
            may have an unclear goal, missing context, weak constraints, no
            output format, no audience, missing source material, or unresolved
            factuality risk. Prompt Quality Studio turns that ambiguity into an
            explainable, human-in-the-loop workflow.
          </p>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="eyebrow">The problem</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Better model use starts with better instruction design.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-ink/60">
            <p>
              Users often blame the model when the underlying request leaves
              too much open to interpretation. Vague prompts commonly omit
              context, constraints, audience, output format, success criteria,
              or factuality guardrails.
            </p>
            <p>
              The issue is not only that the prompt is short. The deeper
              problem is that the system has to infer too much: what the user
              wants, what source material matters, what “good” means, and what
              assumptions are unsafe.
            </p>
            <p>
              Generic prompt generators may produce a longer rewrite without
              showing why it is structurally stronger. That makes the result
              difficult to inspect and does little to improve the user&apos;s
              own instruction-design skills.
            </p>
            <p className="font-medium text-ink">
              The product premise is simple: prompt quality should be
              teachable, inspectable, and structured.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="eyebrow">Product concept</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              A guided workflow before model interaction.
            </h2>
            <p className="mt-5 text-base leading-7 text-ink/60">
              Prompt Quality Studio separates prompt preparation from model
              generation. It does not call an external AI API; scoring,
              interpretation, guidance, clarification, generation, saving, and
              explanation all use local rule-based logic.
            </p>
            <p className="mt-4 text-base leading-7 text-ink/60">
              The workflow diagnoses the prompt, interprets what it explicitly
              says, separates inferred intent from facts, surfaces missing
              fields and ambiguity risks, guides the next best clarification,
              generates a clearer prompt, explains what changed, and supports
              local saving plus follow-up refinement.
            </p>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {productFlow.map((step, index) => (
              <li key={step} className="bg-[#F8F9FD] p-5">
                <span className="text-xs font-semibold text-leaf-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm font-semibold">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">Design decisions</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Decisions that shaped the MVP.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {designDecisions.map((decision) => (
            <article key={decision.title} className="panel p-6 sm:p-7">
              <h3 className="text-lg font-semibold">{decision.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/55">
                {decision.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page grid gap-6 py-16 sm:py-20 lg:grid-cols-3">
          <article className="rounded-2xl border border-line bg-[#F8F9FD] p-6 sm:p-7">
            <p className="eyebrow">Structured interpretation</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">
              Show how the prompt is read.
            </h2>
            <p className="mt-4 text-sm leading-7 text-ink/60">
              Before users fill the form, the Studio shows detected language,
              selected or detected category, explicit fields, inferred intent,
              missing fields, and ambiguity notes.
            </p>
            <p className="mt-4 text-sm font-medium leading-6 text-ink">
              The key principle: inferred information is never presented as
              fact.
            </p>
          </article>

          <article className="rounded-2xl border border-line bg-[#F8F9FD] p-6 sm:p-7">
            <p className="eyebrow">Smart prefill</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">
              Reduce redundant typing.
            </h2>
            <p className="mt-4 text-sm leading-7 text-ink/60">
              Explicit information from the original prompt can prefill
              relevant clarification fields. For example, “Improve my
              experience description for a customer success role” can prefill
              the target role as Customer Success.
            </p>
            <p className="mt-4 text-sm font-medium leading-6 text-ink">
              Only explicit information is prefilled. Inferred information
              stays in the interpretation layer.
            </p>
          </article>

          <article className="rounded-2xl border border-line bg-[#F8F9FD] p-6 sm:p-7">
            <p className="eyebrow">Prompt Health Coach</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">
              Guide the next best clarification.
            </h2>
            <p className="mt-4 text-sm leading-7 text-ink/60">
              Prompt Health explains what is missing, what is risky or
              ambiguous, what field to fill next, why that field matters, and
              what is already strong.
            </p>
            <ul className="mt-4 space-y-2">
              {promptHealthExamples.map((example) => (
                <li key={example} className="text-xs leading-5 text-ink/55">
                  • {example}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="border-y border-line bg-leaf-900 text-white">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Quality framework
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Structure made visible.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              The tool looks for practical signals that reduce ambiguity and
              make an instruction easier to act on.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {qualityDimensions.map((dimension) => (
              <div
                key={dimension}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5"
              >
                <Check className="h-4 w-4 shrink-0 text-[#C7D2FE]" />
                <span className="text-sm font-medium">{dimension}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Current capabilities</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              What the MVP does today.
            </h2>
            <ul className="mt-7 space-y-3">
              {capabilities.map((capability) => (
                <li
                  key={capability}
                  className="flex gap-3 text-sm leading-6 text-ink/65"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-100 text-success-700">
                    <Check className="h-3 w-3" />
                  </span>
                  {capability}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-[#F3EEE5] p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6527]">
              Limitations
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Intentionally narrow.
            </h2>
            <ul className="mt-7 space-y-3">
              {limitations.map((limitation) => (
                <li
                  key={limitation}
                  className="flex gap-3 text-sm leading-6 text-ink/65"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9A6E29]"
                    aria-hidden="true"
                  />
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Local-first architecture</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Privacy-friendly by default.
            </h2>
            <p className="mt-5 text-sm leading-7 text-ink/60">
              The product is designed as a zero-cost workflow prototype:
              rule-based, deterministic, and usable without external model
              calls or backend infrastructure.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Prompts are processed locally by default",
              "No external AI API is used",
              "No server-side prompt storage",
              "No login required",
              "No database or analytics",
              "Local Library uses browser localStorage",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-line bg-[#F8F9FD] p-4 text-sm font-medium leading-6"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Future roadmap</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Possible next directions.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-ink/55">
              These are potential extensions, not current product
              capabilities.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {roadmap.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-line bg-[#F8F9FD] px-4 py-2 text-xs font-medium text-ink/65"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Portfolio perspective</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              What this project demonstrates.
            </h2>
            <p className="mt-4 text-sm leading-7 text-ink/55">
              The project applies AI quality operations thinking to a practical
              product: reducing ambiguity before generation, making guidance
              explainable, and keeping humans in control of the final
              instruction.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {demonstrations.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-line p-4 text-sm font-medium leading-6"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="rounded-3xl bg-leaf-900 px-7 py-12 text-white sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
            Explore the product
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            See the workflow, examples, and scoring framework.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/studio"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-leaf-900"
            >
              Try the Studio <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/examples"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              View Examples
            </Link>
            <Link
              href="/methodology"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              Read Methodology
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
