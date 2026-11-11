"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";
import { Fragment } from "react";
import { Dropdown } from "@/components/ui/dropdown";
import type { Lang } from "@/lib/i18n";
import { homeRoute, route } from "@/lib/routes";
import { studioCopy } from "@/lib/studio-copy";
export function ToolNavigation({ lang }: { lang: Lang }) {
  const t = studioCopy[lang];
  const normalize = (value: string) => value.replace(/\/$/, "") || "/";
  const pathname = normalize(usePathname());
  const toolDestinations = [
    { href: route(lang, "scoreboard"), label: t.scoreboard },
    { href: route(lang, "leaderboardEditor"), label: t.leaderboard },
    { href: route(lang, "bracketEditor"), label: t.bracket },
  ];
  const actionDestinations = [
    { href: route(lang, "scoreboard"), label: t.makeScoreboard },
    { href: route(lang, "leaderboardEditor"), label: t.makeLeaderboard },
    { href: route(lang, "bracketEditor"), label: t.makeBracket },
  ];
  const applicationLinks = [
    { href: homeRoute(lang), label: t.home },
    ...toolDestinations,
    { href: route(lang, "saved"), label: t.saved },
  ];
  const discoveryLinks = [
    { href: homeRoute(lang), label: t.home },
    { href: route(lang, "scoreboardIntro"), label: t.scoreboard },
    { href: route(lang, "leaderboards"), label: t.leaderboard },
    { href: route(lang, "brackets"), label: t.bracket },
  ];
  const applicationPaths = new Set(applicationLinks.map((link) => normalize(link.href)));
  applicationPaths.add("/scoreboard");
  const inApplication = pathname !== normalize(homeRoute(lang)) && applicationPaths.has(pathname);
  const isEditor =
    pathname === "/scoreboard" ||
    toolDestinations.some((tool) => normalize(tool.href) === pathname);
  const links = inApplication ? (isEditor ? toolDestinations : applicationLinks) : discoveryLinks;
  const showAction =
    !inApplication &&
    (pathname === normalize(homeRoute(lang)) ||
      (["scoreboardIntro", "leaderboards", "brackets"] as const).some(
        (page) => pathname === normalize(route(lang, page)),
      ));
  const stateClass = (href: string) =>
    pathname === normalize(href) ||
    (pathname === "/scoreboard" && href === route(lang, "scoreboard"))
      ? "bg-action/10 text-action"
      : "hover:bg-forest/10";
  return (
    <>
      <div className="hidden items-center gap-0.5 lg:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors motion-reduce:transition-none ${stateClass(link.href)}`}
            aria-current={
              pathname === normalize(link.href) ||
              (pathname === "/scoreboard" && link.href === route(lang, "scoreboard"))
                ? "page"
                : undefined
            }
          >
            {link.label}
          </Link>
        ))}
        {showAction && (
          <Dropdown
            ariaLabel={t.makeA}
            label={
              <>
                {t.makeA}
                <ChevronDown className="size-4" aria-hidden="true" />
              </>
            }
            triggerClassName="ml-1 !min-h-11 !shrink-0 !rounded-lg !bg-action !px-3 !text-sm !font-semibold !text-on-action whitespace-nowrap hover:!brightness-95"
            panelClassName="!w-[min(22rem,calc(100vw-2rem))] !border-[#72927a] !bg-[#30583d] !p-2"
          >
            <p className="px-3 py-2 text-sm font-semibold text-white/75">{t.tools}</p>
            {actionDestinations.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-2 text-base font-semibold transition-colors hover:bg-forest/10"
              >
                {tool.label}
                <ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-forest/70" />
              </Link>
            ))}
          </Dropdown>
        )}
      </div>
      <div className="order-last lg:hidden">
        <Dropdown
          ariaLabel={t.menu}
          label={
            <>
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">{t.tools}</span>
            </>
          }
          triggerClassName="!px-3"
        >
          {links.map((link, index) => (
            <Fragment key={link.href}>
              {!inApplication && index === 1 && (
                <p className="px-3 pt-2 pb-1 text-sm font-semibold text-ink/65">{t.tools}</p>
              )}
              <Link
                href={link.href}
                className={`flex min-h-12 items-center rounded-lg px-3 py-2 text-base font-semibold ${stateClass(link.href)}`}
                aria-current={
                  pathname === normalize(link.href) ||
                  (pathname === "/scoreboard" && link.href === route(lang, "scoreboard"))
                    ? "page"
                    : undefined
                }
              >
                {link.label}
              </Link>
            </Fragment>
          ))}
          {showAction && (
            <>
              <p className="px-3 pt-2 pb-1 text-sm font-semibold text-ink/65">{t.makeA}</p>
              {actionDestinations.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex min-h-12 items-center rounded-lg px-3 py-2 text-base font-semibold hover:bg-forest/10"
                >
                  {tool.label}
                </Link>
              ))}
            </>
          )}
        </Dropdown>
      </div>
    </>
  );
}
