"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { homeRoute, translatedPath } from "@/lib/routes";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
export function LanguageMenu({ lang, languageLabel }: { lang: Lang; languageLabel: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname() || homeRoute(lang);
  const router = useRouter();
  const labels = { bg: "Български", tr: "Türkçe", en: "English" };
  useEffect(() => {
    const other = (e: Event) => {
      if ((e as CustomEvent).detail !== "language") setOpen(false);
    };
    window.addEventListener("scoreboard-menu-open", other);
    const outside = (e: PointerEvent) => {
      if (e.target instanceof Node && !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scoreboard-menu-open", other);
    };
  }, []);
  return (
    <div
      ref={ref}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
        if (e.key === "ArrowDown" && !open) {
          e.preventDefault();
          setOpen(true);
          queueMicrotask(() => ref.current?.querySelector<HTMLAnchorElement>("a")?.focus());
        }
      }}
    >
      <button
        ref={trigger}
        aria-label={`${languageLabel}: ${labels[lang]} (${lang.toUpperCase()})`}
        aria-expanded={open}
        aria-controls="language-options"
        onClick={() => {
          if (!open)
            window.dispatchEvent(new CustomEvent("scoreboard-menu-open", { detail: "language" }));
          setOpen(!open);
        }}
        className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-base transition-colors duration-150 hover:bg-forest/5 motion-reduce:transition-none"
      >
        <span>{lang.toUpperCase()}</span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={`h-3 w-3 fill-none stroke-current transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          id="language-options"
          className="absolute top-full right-0 z-50 mt-1 min-w-36 rounded-xl border border-forest/20 bg-paper p-1 shadow-sm motion-safe:animate-[appear_160ms_ease-out]"
        >
          {(["bg", "tr", "en"] as const).map((l) => (
            <Link
              key={l}
              href={translatedPath(pathname, l)}
              lang={l}
              hrefLang={l}
              aria-current={lang === l ? "page" : undefined}
              onClick={(event) => {
                try {
                  localStorage.setItem("scoreboard-language", l);
                } catch {}
                if (location.hash) {
                  event.preventDefault();
                  router.push(`${translatedPath(pathname, l)}${location.hash}`);
                }
              }}
              className={`flex min-h-11 items-center justify-between rounded-lg px-3 text-base hover:bg-forest/5 ${lang === l ? "font-semibold" : ""}`}
            >
              {labels[l]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
