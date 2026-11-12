"use client";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { route } from "@/lib/routes";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";

export function DemoTeamLimit({ lang, close }: { lang: Lang; close: () => void }) {
  const t = studioCopy[lang];
  return (
    <div
      role="status"
      className="absolute top-full right-0 z-30 mt-2 w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-forest/25 bg-paper p-4 text-ink shadow-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-6">{t.demoTeamLimit}</p>
        <button
          type="button"
          aria-label={t.close}
          onClick={close}
          className="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-forest"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <Link
        href={route(lang, "scoreboard")}
        className="mt-3 inline-flex min-h-10 items-center gap-2 font-semibold text-action underline underline-offset-4"
      >
        {t.scoreAction}
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
