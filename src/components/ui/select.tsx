"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
export function Select({
  label,
  value,
  options,
  change,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  change: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (e.target instanceof Node && !root.current?.contains(e.target)) setOpen(false);
    };
    const other = (e: Event) => {
      if ((e as CustomEvent).detail !== root.current) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    window.addEventListener("scoreboard-menu-open", other);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("scoreboard-menu-open", other);
    };
  }, []);
  const show = () => {
    const rect = root.current?.getBoundingClientRect();
    setUp(
      !!rect &&
        innerHeight - rect.bottom < Math.min(300, options.length * 44 + 16) &&
        rect.top > innerHeight - rect.bottom,
    );
    window.dispatchEvent(new CustomEvent("scoreboard-menu-open", { detail: root.current }));
    setOpen(true);
  };
  return (
    <div ref={root} className="relative w-full">
      <button
        ref={trigger}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (open) setOpen(false);
          else show();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            show();
            queueMicrotask(() =>
              items.current[options.findIndex((option) => option.value === value)]?.focus(),
            );
          }
        }}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-forest/25 bg-paper px-3 py-2 text-left text-base transition-colors duration-150 hover:bg-forest/5 motion-reduce:transition-none"
      >
        <span>{options.find((option) => option.value === value)?.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={`absolute left-0 z-40 max-h-72 min-w-full overflow-y-auto rounded-xl border border-forest/25 bg-paper p-1.5 shadow-sm motion-safe:animate-[appear_150ms_ease-out] ${up ? "bottom-full mb-1" : "top-full mt-1"}`}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(el) => {
                items.current[index] = el;
              }}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                change(option.value);
                setOpen(false);
                trigger.current?.focus();
              }}
              onKeyDown={(e) => {
                let next = index;
                if (e.key === "ArrowDown") next = (index + 1) % options.length;
                else if (e.key === "ArrowUp") next = (index + options.length - 1) % options.length;
                else if (e.key === "Home") next = 0;
                else if (e.key === "End") next = options.length - 1;
                else if (e.key === "Escape") {
                  setOpen(false);
                  trigger.current?.focus();
                  return;
                } else if (e.key === "Tab") {
                  setOpen(false);
                  return;
                } else return;
                e.preventDefault();
                items.current[next]?.focus();
              }}
              className={`flex min-h-11 w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-base transition-colors duration-150 hover:bg-forest/8 motion-reduce:transition-none ${value === option.value ? "font-semibold text-forest" : ""}`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
