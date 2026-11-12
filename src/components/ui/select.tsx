"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Check, ChevronDown } from "lucide-react";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

function firstEnabled(options: SelectOption[], start: number, direction: 1 | -1) {
  for (let offset = 0; offset < options.length; offset += 1) {
    const index = (start + offset * direction + options.length) % options.length;
    if (!options[index].disabled) return index;
  }
  return -1;
}

function nextEnabled(options: SelectOption[], start: number, direction: 1 | -1) {
  for (let offset = 1; offset <= options.length; offset += 1) {
    const index = (start + offset * direction + options.length) % options.length;
    if (!options[index].disabled) return index;
  }
  return start;
}

function getMenuPosition(trigger: HTMLButtonElement, optionCount: number): CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const edge = 8;
  const gap = 6;
  const width = Math.min(rect.width, window.innerWidth - edge * 2);
  const left = Math.min(Math.max(edge, rect.left), window.innerWidth - width - edge);
  const desiredHeight = Math.min(320, optionCount * 44 + 12);
  const below = window.innerHeight - rect.bottom - gap - edge;
  const above = rect.top - gap - edge;
  const opensBelow = below >= Math.min(desiredHeight, 180) || below >= above;
  const available = Math.max(80, Math.min(desiredHeight, opensBelow ? below : above));
  const top = opensBelow ? rect.bottom + gap : Math.max(edge, rect.top - gap - available);

  return {
    position: "fixed",
    top,
    left,
    width,
    maxHeight: available,
  };
}

export function Select({
  label,
  value,
  options,
  change,
  triggerClassName = "",
  disabled = false,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  change: (value: string) => void;
  triggerClassName?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState<CSSProperties | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  };

  const show = (initialIndex = selectedIndex) => {
    if (disabled || options.length === 0) return;
    const index =
      initialIndex >= 0 && !options[initialIndex]?.disabled
        ? initialIndex
        : firstEnabled(options, 0, 1);
    setFocusIndex(index);
    if (trigger.current) setMenuPosition(getMenuPosition(trigger.current, options.length));
    window.dispatchEvent(new CustomEvent("scoreboard-menu-open", { detail: root.current }));
    setOpen(true);
  };

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (root.current?.contains(event.target) || menu.current?.contains(event.target)) return;
      setOpen(false);
    };
    const closeOtherMenus = (event: Event) => {
      if ((event as CustomEvent).detail !== root.current) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("scoreboard-menu-open", closeOtherMenus);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("scoreboard-menu-open", closeOtherMenus);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      if (trigger.current) setMenuPosition(getMenuPosition(trigger.current, options.length));
    };
    document.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);
    return () => {
      document.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open || focusIndex < 0) return;
    const frame = window.requestAnimationFrame(() => {
      const item = items.current[focusIndex];
      item?.focus({ preventScroll: true });
      item?.scrollIntoView({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusIndex, open]);

  const moveFocus = (index: number, direction: 1 | -1) => {
    const enabledIndex = options[index]?.disabled ? nextEnabled(options, index, direction) : index;
    setFocusIndex(enabledIndex);
  };

  const moveTabFocus = (backward: boolean) => {
    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !menu.current?.contains(element));
    const index = focusable.indexOf(trigger.current!);
    const next = focusable[index + (backward ? -1 : 1)];
    close();
    window.requestAnimationFrame(() => (next || trigger.current)?.focus());
  };

  return (
    <div ref={root} className="relative w-full">
      <button
        ref={trigger}
        id={`${id}-trigger`}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          const direction = event.key === "ArrowDown" ? 1 : -1;
          const start =
            selectedIndex >= 0 ? selectedIndex : direction === 1 ? 0 : options.length - 1;
          show(options[start]?.disabled ? firstEnabled(options, start, direction) : start);
        }}
        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-forest/25 bg-paper px-3 py-2 text-left text-base text-ink transition-colors duration-150 hover:bg-forest/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${triggerClassName}`}
      >
        <span className="min-w-0 truncate">{selectedOption?.label ?? ""}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open &&
        menuPosition &&
        createPortal(
          <div
            ref={menu}
            id={`${id}-listbox`}
            role="listbox"
            aria-label={label}
            aria-labelledby={`${id}-trigger`}
            style={menuPosition}
            className="z-[1000] overflow-y-auto overscroll-contain rounded-xl border border-forest/25 bg-paper p-1.5 text-ink shadow-lg motion-safe:animate-[appear_150ms_ease-out]"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                close(true);
              } else if (event.key === "Tab") {
                event.preventDefault();
                moveTabFocus(event.shiftKey);
              }
            }}
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                ref={(element) => {
                  items.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={value === option.value}
                disabled={option.disabled}
                tabIndex={focusIndex === index ? 0 : -1}
                onClick={() => {
                  change(option.value);
                  close(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    moveFocus(
                      nextEnabled(options, index, event.key === "ArrowDown" ? 1 : -1),
                      event.key === "ArrowDown" ? 1 : -1,
                    );
                  } else if (event.key === "Home" || event.key === "End") {
                    event.preventDefault();
                    const start = event.key === "Home" ? 0 : options.length - 1;
                    setFocusIndex(firstEnabled(options, start, event.key === "Home" ? 1 : -1));
                  }
                }}
                className={`flex min-h-11 w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-base transition-colors duration-150 hover:bg-forest/8 focus-visible:outline-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${value === option.value ? "font-semibold text-forest" : ""}`}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {value === option.value && (
                  <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
