import { Check } from "./icons";

export type SuggestionMode = "single" | "append" | "multi";

export function includesSuggestion(value: string | undefined, suggestion: string) {
  return (value ?? "").toLowerCase().includes(suggestion.toLowerCase());
}

export function applySuggestionValue(
  currentValue: string,
  suggestion: string,
  mode: SuggestionMode = "single",
) {
  if (suggestion === "Custom") return "";

  if (mode === "append") {
    const trimmed = currentValue.trim();
    if (!trimmed) return suggestion;
    if (includesSuggestion(trimmed, suggestion)) return trimmed;
    return `${trimmed}\n${suggestion}`;
  }

  if (mode === "multi") {
    const items = currentValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const exists = items.some(
      (item) => item.toLowerCase() === suggestion.toLowerCase(),
    );
    const nextItems = exists
      ? items.filter((item) => item.toLowerCase() !== suggestion.toLowerCase())
      : [...items, suggestion];

    return nextItems.join(", ");
  }

  return suggestion;
}

export function isSuggestionSelected(
  value: string,
  suggestion: string,
  mode: SuggestionMode = "single",
) {
  if (suggestion === "Custom") return false;

  if (mode === "multi") {
    return value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .includes(suggestion.toLowerCase());
  }

  if (mode === "append") return includesSuggestion(value, suggestion);

  return value.trim().toLowerCase() === suggestion.toLowerCase();
}

export function SuggestionChips({
  label,
  options,
  value,
  mode = "single",
  onSelect,
}: {
  label: string;
  options: readonly string[];
  value: string;
  mode?: SuggestionMode;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-semibold text-ink/45">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = isSuggestionSelected(value, option, mode);

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(option)}
              className={`min-h-10 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                selected
                  ? "border-leaf-500 bg-leaf-600 text-white shadow-sm"
                  : "border-[#DADDF0] bg-white text-ink/60 hover:border-leaf-500 hover:text-leaf-700"
              }`}
            >
              {selected && <Check className="mr-1 inline h-3.5 w-3.5" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
