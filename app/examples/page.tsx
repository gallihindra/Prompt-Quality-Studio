import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Examples",
  description: "Before-and-after examples of stronger AI prompts.",
};

const examples = [
  {
    category: "Business idea",
    before: "kasih ide bisnis",
    missing: [
      "Starting budget and target market",
      "Business model and available time",
      "Risk tolerance and validation method",
    ],
    after:
      "Act as a practical business advisor. Recommend five online business ideas for a first-time founder in Indonesia with starting capital under Rp5 million, part-time availability, and low risk. Rank them by speed to first revenue. For each idea, include the target customer, estimated startup cost, first validation step, and key risk.",
    improvements: [
      "Added market and budget context",
      "Defined operating constraints",
      "Added ranking and validation criteria",
    ],
  },
  {
    category: "Career / resume",
    before: "please improve my resume",
    missing: [
      "Target role and seniority",
      "The resume section or deliverable",
      "Tone and factuality boundaries",
    ],
    after:
      "Act as an experienced career editor. Review and strengthen my resume content for a mid-level AI Operations role. Rewrite the supplied experience as concise, confident bullets that emphasize scope, actions, and outcomes already present. Do not invent employers, metrics, qualifications, or achievements. Return the revised bullets first, then identify any missing evidence I should add.",
    improvements: [
      "Added role and seniority context",
      "Specified the resume deliverable",
      "Added factuality guardrails",
    ],
  },
  {
    category: "Learning plan",
    before: "ajari aku machine learning",
    missing: [
      "Current level and learning goal",
      "Timeline and weekly study time",
      "Milestones and completion criteria",
    ],
    after:
      "Bantu saya membuat rencana belajar machine learning selama 4 minggu untuk pemula. Tujuan saya adalah memahami cara kerja AI dan bagaimana machine learning digunakan secara nyata. Saya bisa belajar sekitar 5 jam per minggu. Susun rencana belajar dengan pendekatan theory-first, tetapi tetap sertakan latihan sederhana, checkpoint progres, dan satu proyek kecil yang aplikatif.",
    improvements: [
      "Added level, goal, and schedule",
      "Defined the learning approach",
      "Added checkpoints and completion criteria",
    ],
  },
];

export default function ExamplesPage() {
  return (
    <div className="container-page py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">Prompt patterns</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
          Clearer inputs, more useful outputs.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/60">
          See how focused clarification turns a short request into a more
          specific, usable instruction—without calling an external AI model.
        </p>
      </div>

      <div className="mt-16 space-y-8">
        {examples.map((example, index) => (
          <article key={example.category} className="panel overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-leaf-600">
                  0{index + 1}
                </span>
                <h2 className="font-semibold">{example.category}</h2>
              </div>
              <span className="w-fit rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-700">
                Weak → structured
              </span>
            </div>
            <div className="grid lg:grid-cols-2">
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9A6E29]">
                  Original weak prompt
                </p>
                <p className="mt-5 text-xl leading-8 tracking-[-0.015em]">
                  “{example.before}”
                </p>
                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-sm font-semibold">What is missing</p>
                  <ul className="mt-3 space-y-2">
                    {example.missing.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm leading-6 text-ink/55"
                      >
                        <span
                          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="border-t border-line bg-[#F5F6FD] p-6 sm:p-8 lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-leaf-600">
                  Improved prompt excerpt
                </p>
                <p className="mt-5 text-sm leading-7 text-ink/80">
                  {example.after}
                </p>
                <p className="mt-7 text-sm font-semibold">What changed</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {example.improvements.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl bg-leaf-900 p-8 text-white sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Have a prompt of your own?</h2>
          <p className="mt-2 text-sm text-white/60">
            Score it and build a structured version in the Studio.
          </p>
        </div>
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-leaf-900"
        >
          Try the Studio <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
