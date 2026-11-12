"use client";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { homeRoute, translatedPath } from "@/lib/routes";
import { Dropdown } from "@/components/ui/dropdown";
import type { Lang } from "@/lib/i18n";
export function LanguageMenu({ lang, languageLabel }: { lang: Lang; languageLabel: string }) {
  const pathname = usePathname() || homeRoute(lang);
  const labels = { bg: "Български", tr: "Türkçe", en: "English" };
  return (
    <Dropdown
      ariaLabel={`${languageLabel}: ${labels[lang]} (${lang.toUpperCase()})`}
      label={
        <>
          <span>{lang.toUpperCase()}</span>
          <ChevronDown aria-hidden="true" className="h-3 w-3" />
        </>
      }
      triggerClassName="!min-w-0 !px-2"
    >
      {(["bg", "tr", "en"] as const).map((l) => (
        <Link
          key={l}
          href={translatedPath(pathname, l)}
          data-preserve-draft
          lang={l}
          hrefLang={l}
          aria-current={lang === l ? "page" : undefined}
          onClick={(event) => {
            if (
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            try {
              localStorage.setItem("scoreboard-language", l);
            } catch {}
          }}
          className={`flex min-h-11 items-center justify-between rounded-lg px-3 text-base hover:bg-forest/5 ${lang === l ? "font-semibold" : ""}`}
        >
          {labels[l]}
        </Link>
      ))}
    </Dropdown>
  );
}
