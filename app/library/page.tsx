import type { Metadata } from "next";

import { PromptLibrary } from "@/components/prompt-library";

export const metadata: Metadata = {
  title: "Local Prompt Library",
  description:
    "Revisit prompts saved locally in your browser. No account, database, or server-side prompt storage.",
};

export default function LibraryPage() {
  return (
    <div className="container-page py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="eyebrow">Local prompt library</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Your saved prompt workspace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/60">
            Revisit, inspect, and copy the structured prompts you choose to
            keep.
          </p>
        </div>
        <div className="rounded-2xl border border-[#D9D9F2] bg-[#F7F5FF] p-5 lg:max-w-xs">
          <p className="text-sm font-semibold text-leaf-700">
            Saved prompts stay in this browser only.
          </p>
          <p className="mt-2 text-xs leading-5 text-ink/50">
            No account, no database, and no server-side prompt storage.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <PromptLibrary />
      </div>
    </div>
  );
}
