import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Spark } from "@/components/icons";
import { analyzePrompt } from "@/lib/prompt-analysis";

const beforePrompt = "Write a launch email for our new product.";
const afterPrompt = "Draft a launch email announcing our new team analytics dashboard. Existing customers who manage teams of 20–100 people. Lead with the customer benefit, include three features, keep the tone confident, and stay under 180 words. Subject line, preview text, body, and one CTA.";

const steps = [
  { number: "01", title: "Score", text: "Evaluate the goal, context, constraints, output format, and audience." },
  { number: "02", title: "Diagnose", text: "See why the instruction is weak and which information is missing." },
  { number: "03", title: "Clarify", text: "Answer prompt-type-specific questions to fill the important gaps." },
  { number: "04", title: "Generate", text: "Build a structured prompt with deterministic, rule-based templates." },
];

export default function Home() {
  return (
    <>
      <section className="overflow-hidden border-b border-line">
        <div className="container-page grid min-h-[680px] items-center gap-14 py-20 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow mb-6">Prompt quality, made operational</p>
            <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[72px]">
              Clearer instructions.
              <span className="block text-leaf-600">More useful AI output.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-ink/65">
              Most weak AI outputs start with an underspecified instruction. Score your prompt, diagnose what is missing, answer focused clarification questions, and generate a more structured version.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/studio" className="btn-primary">
                Evaluate a prompt <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/methodology" className="btn-secondary">
                View methodology
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink/55">
              {["Rule-based", "Runs in your browser", "No external AI API"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-leaf-600" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 -z-10 rounded-full bg-leaf-100/70 blur-3xl" />
            <div className="panel overflow-hidden shadow-soft">
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <span className="text-sm font-semibold">Prompt assessment</span>
                <span className="rounded-full bg-amber/10 px-3 py-1 text-xs font-semibold text-[#8A6527]">Developing</span>
              </div>
              <div className="grid gap-7 p-6 sm:grid-cols-[112px_1fr]">
                <div className="grid h-28 w-28 place-items-center rounded-full border-[7px] border-line border-r-leaf-500 border-t-leaf-500">
                  <div className="text-center">
                    <p className="text-3xl font-semibold tracking-[-0.05em]">47</p>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink/45">out of 100</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    ["Goal clarity", "72%"],
                    ["Context", "35%"],
                    ["Constraints", "28%"],
                    ["Output format", "40%"],
                  ].map(([label, width]) => (
                    <div key={label}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span>{label}</span><span className="text-ink/45">{width}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-line">
                        <div className="h-full rounded-full bg-leaf-500" style={{ width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-line bg-[#FAFBF8] p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Primary opportunity</p>
                <p className="mt-2 text-sm leading-6 text-ink/70">Define who the response is for, what it should include, and how the final answer should be structured.</p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-soft sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-leaf-50 text-leaf-600"><Spark className="h-4 w-4" /></span>
              <div><p className="text-xs font-semibold">Rule-based analysis</p><p className="text-[11px] text-ink/45">Fast, private, deterministic</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">The quality gap</p>
            <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em]">Most output problems begin before generation.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border-l-2 border-amber pl-6">
              <p className="text-sm font-semibold text-ink/45">Unclear instruction</p>
              <p className="mt-3 text-lg leading-8">When the goal, audience, context, constraints, and format stay implicit, the model has to guess what “good” means.</p>
            </div>
            <div className="border-l-2 border-leaf-500 pl-6">
              <p className="text-sm font-semibold text-ink/45">Structured instruction</p>
              <p className="mt-3 text-lg leading-8">The request becomes a clearer operating brief with explicit context, boundaries, format, and quality criteria.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-24 sm:py-28">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">A repeatable workflow</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">From rough idea to clear instruction.</h2>
          </div>
          <div className="mt-14 grid border-y border-line md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className={`py-8 md:px-7 ${index > 0 ? "border-t border-line md:border-l md:border-t-0" : ""}`}>
                <p className="text-xs font-semibold text-leaf-600">{step.number}</p>
                <h3 className="mt-8 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/55">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-24 sm:py-32">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">See the difference</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">A small shift in structure.</h2>
          </div>
          <Link href="/examples" className="flex items-center gap-2 text-sm font-semibold text-leaf-700">
            Explore more examples <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid overflow-hidden rounded-2xl border border-line bg-white lg:grid-cols-2">
          <div className="p-7 sm:p-10">
            <span className="rounded-full bg-[#F3EEE5] px-3 py-1 text-xs font-semibold text-[#8A6527]">Before · {analyzePrompt(beforePrompt).score}/100</span>
            <p className="mt-8 text-2xl leading-9 tracking-[-0.02em]">“{beforePrompt}”</p>
          </div>
          <div className="border-t border-line bg-[#F8FAF6] p-7 sm:p-10 lg:border-l lg:border-t-0">
            <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-700">After · {analyzePrompt(afterPrompt).score}/100</span>
            <div className="mt-8 space-y-4 text-sm leading-6">
              <p><strong>Task:</strong> Draft a launch email announcing our new team analytics dashboard.</p>
              <p><strong>Audience:</strong> Existing customers who manage teams of 20–100 people.</p>
              <p><strong>Requirements:</strong> Lead with the customer benefit, include three features, keep the tone confident, and stay under 180 words.</p>
              <p><strong>Format:</strong> Subject line, preview text, body, and one CTA.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-24 sm:pb-32">
        <div className="overflow-hidden rounded-3xl bg-leaf-900 px-7 py-14 text-white sm:px-12 sm:py-16">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Ready when you are</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em]">Make your next prompt more precise.</h2>
              <p className="mt-4 max-w-2xl text-white/65">Rule-based and local-first: your prompt is processed in the browser and is not sent to an external AI API.</p>
            </div>
            <Link href="/studio" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-leaf-900 transition hover:bg-leaf-50">
              Open the Studio <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
