import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight, Check } from "@/components/icons";

export const metadata: Metadata = {
  title: "Case Study",
  description:
    "How Prompt Quality Studio applies prompt evaluation and AI quality operations principles in a local-first product workflow.",
};

const productFlow = [
  "Paste a rough prompt",
  "Select the task type",
  "Receive a structure score",
  "See missing context",
  "Answer clarification questions",
  "Generate an improved prompt",
  "Review what changed",
  "Copy it into a preferred AI tool",
];

const designDecisions = [
  {
    title: "Local-first, rule-based MVP",
    text: "The first version proves the workflow without API costs, accounts, stored prompt data, or dependence on an external model.",
  },
  {
    title: "Prompt types over one generic flow",
    text: "Business ideas, career documents, product plans, content, and learning requests need different kinds of context.",
  },
  {
    title: "Dynamic clarification",
    text: "Each task type asks focused questions so users add relevant information instead of completing a universal form.",
  },
  {
    title: "Required fields",
    text: "Important inputs must be completed before generation, preventing unfinished prompts with visible placeholders.",
  },
  {
    title: "Type-aware generation",
    text: "Deterministic templates produce meaningfully different instructions for each supported workflow.",
  },
  {
    title: "Explain the transformation",
    text: "The What Changed panel names the structure added so the user can learn from the rewrite rather than only copy it.",
  },
  {
    title: "Teach through examples",
    text: "Realistic before-and-after cases make the framework easier to understand than abstract prompt advice alone.",
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
  "Prompt scoring",
  "Missing-context diagnosis",
  "Type-aware clarification",
  "Generated improved prompts",
  "What Changed explanation",
  "Examples and methodology pages",
  "Privacy-friendly local processing",
  "Regression tests for scoring and generation logic",
];

const limitations = [
  "The system is deterministic and rule-based.",
  "It does not evaluate responses produced by AI models.",
  "It cannot guarantee that a rewritten prompt will produce a better output.",
  "Prompts and user context are not saved.",
  "It does not have semantic model understanding.",
  "The MVP focuses on instruction structure, not full AI-output evaluation.",
];

const roadmap = [
  "Follow-up Prompt Builder",
  "Local Prompt Library",
  "Local Memory and reusable user context",
  "Rubric Linter / Eval Ops Mode",
  "AI Evaluation Lab and interactive calibration practice",
];

const demonstrations = [
  "AI quality operations thinking",
  "Prompt evaluation and instruction design",
  "Human-in-the-loop workflow design",
  "Product thinking for ambiguous AI problems",
  "Privacy-conscious, zero-cost MVP design",
  "Testable rule-based quality logic",
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
            A local-first prompt quality tool for turning vague AI requests
            into structured instructions.
          </p>
          <p className="mt-7 max-w-3xl text-base leading-8 text-ink/60">
            Many weak AI outputs begin with unclear instructions, missing
            context, vague output expectations, or weak success criteria. This
            project explores how AI quality and evaluation principles can help
            users improve prompt structure before they use an AI model.
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
              clarification, generation, and explanation all use local
              rule-based logic.
            </p>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {productFlow.map((step, index) => (
              <li key={step} className="bg-[#FAFBF8] p-5">
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
                <Check className="h-4 w-4 shrink-0 text-leaf-100" />
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
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700">
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
                  className="rounded-full border border-line bg-[#FAFBF8] px-4 py-2 text-xs font-medium text-ink/65"
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
              The project turns an ambiguous AI workflow problem into a
              structured, testable product experience.
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
