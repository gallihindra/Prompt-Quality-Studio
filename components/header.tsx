import Link from "next/link";
import { ArrowUpRight } from "./icons";

const nav = [
  { href: "/studio", label: "Studio" },
  { href: "/examples", label: "Examples" },
  { href: "/methodology", label: "Methodology" },
];

export function Header() {
  return (
    <header className="relative z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Prompt Quality Studio home">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-leaf-500/30 bg-leaf-900 text-[11px] font-bold tracking-tight text-white shadow-sm">
            PQ
          </span>
          <span className="hidden text-sm font-semibold tracking-[-0.01em] min-[360px]:inline sm:text-base">Prompt Quality Studio</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-ink/65 transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/studio" className="btn-primary shrink-0 !px-4 !py-2.5">
          Open Studio
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
