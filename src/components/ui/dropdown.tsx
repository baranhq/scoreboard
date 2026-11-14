"use client";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
export function Dropdown({
  label,
  ariaLabel,
  disabled = false,
  triggerClassName = "",
  panelClassName = "",
  fitViewport = false,
  children,
}: {
  label: ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  triggerClassName?: string;
  panelClassName?: string;
  fitViewport?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);

  const placePanel = useCallback(
    (details: HTMLDetailsElement) => {
      if (!fitViewport) return;
      const trigger = details.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(304, viewportWidth - 32);
      const left = Math.min(Math.max(16, trigger.left), viewportWidth - width - 16);
      const spaceBelow = viewportHeight - trigger.bottom - 16;
      const spaceAbove = trigger.top - 16;
      const openAbove = spaceBelow < 280 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(120, Math.min(384, openAbove ? spaceAbove : spaceBelow));

      setPanelStyle({
        position: "fixed",
        left,
        top: openAbove ? trigger.top - maxHeight - 4 : trigger.bottom + 4,
        width,
        maxHeight,
      });
    },
    [fitViewport],
  );

  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (
        e.target instanceof Node &&
        !ref.current?.contains(e.target) &&
        !panel.current?.contains(e.target) &&
        ref.current
      ) {
        ref.current.open = false;
        setPanelStyle(null);
      }
    };
    const other = (e: Event) => {
      if ((e as CustomEvent).detail !== ref.current && ref.current) {
        ref.current.open = false;
        setPanelStyle(null);
      }
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scoreboard-menu-open", other);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scoreboard-menu-open", other);
    };
  }, []);

  useEffect(() => {
    if (!fitViewport || !panelStyle) return;
    const reposition = () => {
      if (ref.current?.open) placePanel(ref.current);
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [fitViewport, panelStyle, placePanel]);

  return (
    <details
      ref={ref}
      name="scoreboard-menu"
      className="group relative open:z-40"
      onToggle={(e) => {
        if (e.currentTarget.open) {
          window.dispatchEvent(
            new CustomEvent("scoreboard-menu-open", { detail: e.currentTarget }),
          );
          placePanel(e.currentTarget);
        } else {
          setPanelStyle(null);
        }
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
      {fitViewport && panelStyle && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panel}
              onKeyDown={(event) => {
                if (event.key === "Escape" && ref.current) {
                  event.stopPropagation();
                  ref.current.open = false;
                  ref.current.querySelector("summary")?.focus();
                }
              }}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button,a") && ref.current)
                  ref.current.open = false;
              }}
              style={panelStyle}
              className={`z-[100] overflow-y-auto rounded-xl border border-forest/25 bg-paper p-1.5 text-ink shadow-[0_14px_40px_-16px_rgba(17,40,32,0.38)] ring-1 ring-black/5 motion-safe:animate-[appear_150ms_ease-out] ${panelClassName}`}
            >
              {children}
            </div>,
            document.fullscreenElement || document.body,
          )
        : !fitViewport && (
            <div
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button,a") && ref.current)
                  ref.current.open = false;
              }}
              className={`absolute top-full right-0 z-30 mt-1 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-forest/25 bg-paper p-1.5 text-ink shadow-[0_14px_40px_-16px_rgba(17,40,32,0.38)] ring-1 ring-black/5 motion-safe:animate-[appear_150ms_ease-out] ${panelClassName}`}
            >
              {children}
            </div>
          )}
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
