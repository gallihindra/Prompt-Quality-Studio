import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How Prompt Quality Studio evaluates prompt structure.",
};

const dimensions = [
  { weight: "25", title: "Goal clarity", text: "Is the requested action explicit? Does the prompt define what a successful response should accomplish?", signals: "Action verbs, clear task, intended outcome" },
  { weight: "20", title: "Context", text: "Does the prompt provide the background, source material, or situation needed to answer well?", signals: "Background, inputs, current state, rationale" },
  { weight: "20", title: "Constraints", text: "Are important boundaries and preferences stated so the response stays in scope?", signals: "Length, tone, must-have items, exclusions" },
  { weight: "20", title: "Output format", text: "Is the structure of the expected deliverable clear enough to produce a usable response?", signals: "Tables, sections, bullets, fields, file type" },
  { weight: "15", title: "Audience", text: "Does the AI know who will read or use the response and what level of knowledge they have?", signals: "Role, expertise, needs, decision context" },
];

export default function MethodologyPage() {
  return (
    <div>
      <section className="border-b border-line">
        <div className="container-page py-16 sm:py-20">
          <p className="eyebrow">Scoring methodology</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">A practical measure of instruction quality.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/60">The score estimates how much ambiguity an AI system must resolve before it can complete the task. It is a structural check—not a judgment of your idea.</p>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="eyebrow">Five dimensions</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">What the score measures.</h2>
            <p className="mt-4 text-sm leading-7 text-ink/55">Each dimension has a fixed weight. Together they create a score from 0 to 100.</p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {dimensions.map((item) => (
              <div key={item.title} className="grid gap-4 py-7 sm:grid-cols-[72px_1fr]">
                <div>
                  <span className="text-3xl font-semibold tracking-[-0.05em] text-leaf-600">{item.weight}</span>
                  <span className="text-sm text-ink/35"> pts</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{item.text}</p>
                  <p className="mt-3 text-xs"><span className="font-semibold">Signals:</span> <span className="text-ink/50">{item.signals}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">Rule-based by design.</h2>
            <p className="mt-4 text-base leading-7 text-ink/60">The studio looks for plain-language signals associated with each quality dimension, such as action verbs, format terms, length limits, audience roles, and contextual phrases.</p>
            <p className="mt-4 text-base leading-7 text-ink/60">Before rebuilding a prompt, the Studio also shows a structured interpretation layer. It separates what was found in the original prompt, what was inferred from wording, and what is still missing so users can confirm the intent before generating.</p>
            <p className="mt-4 text-base leading-7 text-ink/60">No prompt is sent to an external service. The assessment runs in your browser and produces the same result for the same input.</p>
          </div>
          <div className="rounded-2xl border border-line bg-[#F7F8FC] p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Score bands</p>
            <div className="mt-6 space-y-5">
              {[
                ["80–100", "Strong", "Clear, specific, and ready to use"],
                ["60–79", "Workable", "Usable with a few targeted additions"],
                ["40–59", "Developing", "Core task is present, but ambiguity remains"],
                ["0–39", "Vague", "Needs more direction before reliable use"],
              ].map(([range, label, text]) => (
                <div key={range} className="grid grid-cols-[70px_90px_1fr] gap-3 text-sm">
                  <span className="font-semibold text-leaf-700">{range}</span>
                  <span className="font-semibold">{label}</span>
                  <span className="text-ink/50">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">Use with judgment</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">A guide, not a guarantee.</h2>
          <p className="mt-4 text-base leading-7 text-ink/60">A higher score means a prompt contains more of the structure commonly associated with useful instructions. It does not measure factual accuracy, subject-matter quality, safety, or whether a model will produce a perfect answer. Some simple tasks genuinely need only a simple prompt.</p>
        </div>
      </section>
    </div>
  );
}
