"use client";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
export function Checkbox({
  checked,
  change,
  label,
  disabled = false,
  row = false,
}: {
  checked: boolean;
  change: (checked: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
  row?: boolean;
}) {
  return (
    <label
      className={`flex min-h-11 items-center gap-3 text-base select-none ${row ? "w-full flex-row-reverse justify-between" : ""} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => change(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-forest/50 bg-surface text-on-action transition-colors duration-150 peer-checked:border-action peer-checked:bg-action peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-forest motion-reduce:transition-none [&_svg]:scale-90 [&_svg]:opacity-0 [&_svg]:transition-[opacity,transform] [&_svg]:duration-150 peer-checked:[&_svg]:scale-100 peer-checked:[&_svg]:opacity-100 motion-reduce:[&_svg]:transition-none"
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span>{label}</span>
    </label>
  );
}
