"use client";
import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from "react";
export function Dropdown({
  label,
  ariaLabel,
  disabled = false,
  triggerClassName = "",
  panelClassName = "",
  children,
}: {
  label: ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  triggerClassName?: string;
  panelClassName?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (e.target instanceof Node && !ref.current?.contains(e.target) && ref.current)
        ref.current.open = false;
    };
    const other = (e: Event) => {
      if ((e as CustomEvent).detail !== ref.current && ref.current) ref.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scoreboard-menu-open", other);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scoreboard-menu-open", other);
    };
  }, []);
  return (
    <details
      ref={ref}
      name="scoreboard-menu"
      className="group relative open:z-40"
      onToggle={(e) => {
        if (e.currentTarget.open)
          window.dispatchEvent(
            new CustomEvent("scoreboard-menu-open", { detail: e.currentTarget }),
          );
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current) {
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        onClick={(event) => {
          if (disabled) event.preventDefault();
        }}
        className={`flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-3 text-base font-medium transition-colors duration-150 hover:bg-forest/10 active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none ${disabled ? "pointer-events-none opacity-60" : ""} ${triggerClassName}`}
      >
        <span className="contents [&_svg]:transition-transform [&_svg]:duration-150 group-open:[&_svg]:rotate-180 motion-reduce:[&_svg]:transition-none">
          {label}
        </span>
      </summary>
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button,a") && ref.current)
            ref.current.open = false;
        }}
        className={`absolute top-full right-0 z-30 mt-1 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-forest/25 bg-paper p-1.5 text-ink shadow-[0_14px_40px_-16px_rgba(17,40,32,0.38)] ring-1 ring-black/5 motion-safe:animate-[appear_150ms_ease-out] ${panelClassName}`}
      >
        {children}
      </div>
    </details>
  );
}
export function MenuItem({
  danger = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      {...props}
      className={`flex min-h-11 w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2 text-left text-base transition-colors duration-150 disabled:opacity-50 motion-reduce:transition-none ${danger ? "text-[#a32d28] hover:bg-red-500/10 dark:text-[#ffb7b2]" : "text-ink hover:bg-forest/8"} ${className}`}
    />
  );
}
