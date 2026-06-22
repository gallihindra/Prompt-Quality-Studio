import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
        <p>Prompt Quality Studio — a rule-based prompt design toolkit.</p>
        <div className="flex gap-5">
          <Link href="/examples" className="hover:text-ink">Examples</Link>
          <Link href="/methodology" className="hover:text-ink">Methodology</Link>
        </div>
      </div>
    </footer>
  );
}
