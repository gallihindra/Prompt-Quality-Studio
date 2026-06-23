import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-[#FCFCFE]">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
        <p>Prompt Quality Studio — a rule-based prompt design toolkit.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/follow-up" className="hover:text-ink">Follow-up</Link>
          <Link href="/library" className="hover:text-ink">Library</Link>
          <Link href="/case-study" className="hover:text-ink">Case Study</Link>
          <Link href="/examples" className="hover:text-ink">Examples</Link>
          <Link href="/methodology" className="hover:text-ink">Methodology</Link>
        </div>
      </div>
    </footer>
  );
}
