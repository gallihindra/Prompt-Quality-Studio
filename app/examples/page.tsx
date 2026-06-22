import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { analyzePrompt } from "@/lib/prompt-analysis";

export const metadata: Metadata = {
  title: "Examples",
  description: "Before-and-after examples of stronger AI prompts.",
};

const examples = [
  {
    category: "Marketing",
    before: "Write a LinkedIn post about our new report.",
    after: "Write a 150-word LinkedIn post for HR leaders announcing our 2026 workplace trends report. Open with one surprising finding, explain why it matters, and end with a direct invitation to download the report. Use a confident, evidence-led tone. Avoid hype and emojis.",
    improvements: ["Clear audience", "Defined length", "Tone and exclusions", "Specific structure"],
  },
  {
    category: "Analysis",
    before: "Analyze this customer feedback.",
    after: "Analyze the customer feedback below for a product manager preparing the Q3 roadmap. Group comments into 5–7 themes, estimate each theme’s frequency, include two representative quotes, and distinguish urgent defects from feature requests. Return a table followed by three prioritized recommendations.",
    improvements: ["Decision context", "Taxonomy", "Evidence requirement", "Usable output"],
  },
  {
    category: "Operations",
    before: "Make an onboarding plan.",
    after: "Create a 30-day onboarding plan for a newly hired customer success manager at a B2B SaaS company. Organize it by week with goals, core activities, owner, and evidence of completion. Include product training, call shadowing, account review, and a final readiness check. Format as a concise table.",
    improvements: ["Role and setting", "Time horizon", "Required content", "Completion criteria"],
  },
];

export default function ExamplesPage() {
  return (
    <div className="container-page py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">Prompt patterns</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">Clearer inputs, more useful outputs.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/60">See how practical details transform a loose request into an instruction an AI system can reliably follow.</p>
      </div>

      <div className="mt-16 space-y-8">
        {examples.map((example, index) => (
          <article key={example.category} className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-leaf-600">0{index + 1}</span>
                <h2 className="font-semibold">{example.category}</h2>
              </div>
              <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-700">
                Score {analyzePrompt(example.before).score} → {analyzePrompt(example.after).score}
              </span>
            </div>
            <div className="grid lg:grid-cols-2">
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9A6E29]">Before</p>
                <p className="mt-5 text-xl leading-8 tracking-[-0.015em]">“{example.before}”</p>
              </div>
              <div className="border-t border-line bg-[#F8FAF6] p-6 sm:p-8 lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-leaf-600">After</p>
                <p className="mt-5 text-sm leading-7 text-ink/80">{example.after}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {example.improvements.map((item) => (
                    <span key={item} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink/60">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl bg-leaf-900 p-8 text-white sm:flex-row sm:items-center">
        <div><h2 className="text-2xl font-semibold">Have a prompt of your own?</h2><p className="mt-2 text-sm text-white/60">Score it and build a structured version in the Studio.</p></div>
        <Link href="/studio" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-leaf-900">Try the Studio <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}
