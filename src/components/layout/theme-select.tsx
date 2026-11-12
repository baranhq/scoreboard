"use client";
import { useLayoutEffect, useState } from "react";
import type { Messages } from "@/lib/i18n";
import { Select } from "@/components/ui/select";
export function useSiteThemeMode() {
  const [theme, setTheme] = useState("system");
  const [dark, setDark] = useState(false);
  useLayoutEffect(() => {
    const sync = () => {
      const root = document.documentElement;
      let saved = "system";
      try {
        const value = localStorage.getItem("scoreboard-theme");
        if (value === "light" || value === "dark" || value === "system") saved = value;
      } catch {}
      const shouldDark =
        saved === "dark" ||
        (saved === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
      if (root.dataset.theme !== saved) root.dataset.theme = saved;
      if (root.classList.contains("dark") !== shouldDark) root.classList.toggle("dark", shouldDark);
      setTheme(saved);
      setDark(shouldDark);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  const change = (next: string) =>
    window.dispatchEvent(new CustomEvent("scoreboard-theme", { detail: next }));
  return { theme, dark, change };
}
export function ThemeSelect({ t }: { t: Messages }) {
  const { theme, change } = useSiteThemeMode();
  return (
    <label className="flex min-h-11 items-center justify-between gap-4 text-base">
      {t.theme}
      <div className="w-36 max-w-[55%] shrink-0">
        <Select
          label={t.theme}
          value={theme}
          change={change}
          triggerClassName="!bg-paper"
          options={[
            { value: "light", label: t.light },
            { value: "dark", label: t.dark },
            { value: "system", label: t.system },
          ]}
        />
      </div>
    </label>
  );
}
export function ThemeToggle({ t }: { t: Messages }) {
  const { dark } = useSiteThemeMode();
  return (
    <button
      type="button"
      aria-label={`${t.theme}: ${dark ? t.light : t.dark}`}
      title={`${t.theme}: ${dark ? t.light : t.dark}`}
      data-theme-toggle
      data-theme-label={t.theme}
      data-theme-light-label={t.light}
      data-theme-dark-label={t.dark}
      className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-forest/5 active:bg-forest/10 motion-reduce:transition-none"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <g className="origin-center opacity-100 transition-opacity duration-200 ease-out motion-reduce:transition-none dark:opacity-0">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
        </g>
        <path
          d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5a8.5 8.5 0 1 0 10.6 10.6Z"
          className="origin-center opacity-0 transition-opacity duration-200 ease-out motion-reduce:transition-none dark:opacity-100"
        />
      </svg>
    </button>
  );
}
