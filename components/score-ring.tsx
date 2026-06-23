export function ScoreRing({ score, size = "large" }: { score: number; size?: "large" | "small" }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const dimensions = size === "large" ? "h-36 w-36" : "h-24 w-24";

  return (
    <div className={`relative ${dimensions}`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E4E7F0" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#6366F1"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className={`${size === "large" ? "text-4xl" : "text-2xl"} font-semibold tracking-[-0.05em]`}>{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/45">out of 100</span>
      </div>
    </div>
  );
}
