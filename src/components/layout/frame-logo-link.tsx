"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/site";
import { homeRoute, isApplicationPath, route } from "@/lib/routes";
import type { Lang, Messages } from "@/lib/i18n";

export function FrameLogoLink({ lang, t }: { lang: Lang; t: Messages }) {
  const pathname = usePathname() || "";
  const application = isApplicationPath(pathname, lang);
  const href = application ? route(lang, "saved") : homeRoute(lang);
  const destination = application ? t.saved : t.home;

  return (
    <Link
      href={href}
      aria-label={`${brand}: ${destination}`}
      className="inline-flex min-h-11 shrink-0 items-center rounded-lg"
    >
      <img
        src="/wordmark-62157c899159.webp"
        srcSet="/wordmark-128-492516610722.webp 128w, /wordmark-256-aaadf7f18229.webp 256w"
        sizes="128px"
        width="315"
        height="83"
        alt={brand}
        className="h-auto w-24 sm:w-32 dark:brightness-0 dark:invert"
      />
    </Link>
  );
}
