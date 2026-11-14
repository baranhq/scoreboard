"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, FolderOpen, Menu } from "lucide-react";
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
    { href: route(lang, "scoreboard"), label: t.openScoreboard },
    { href: route(lang, "leaderboardEditor"), label: t.openLeaderboards },
    { href: route(lang, "bracketEditor"), label: t.openBrackets },
  ];
  const savedDestination = { href: route(lang, "saved"), label: t.saved };
  const applicationLinks = [
    { href: homeRoute(lang), label: t.home },
    ...toolDestinations,
    savedDestination,
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
  const links = inApplication
    ? isEditor
      ? [...toolDestinations, savedDestination]
      : applicationLinks
    : discoveryLinks;
  const showAction =
    !inApplication &&
    (pathname === normalize(homeRoute(lang)) ||
      (["scoreboardIntro", "leaderboards", "brackets"] as const).some(
        (page) => pathname === normalize(route(lang, page)),
      ));
  const isCurrent = (href: string) =>
    pathname === normalize(href) ||
    (pathname === "/scoreboard" && href === route(lang, "scoreboard"));
  const isSavedLink = (href: string) => normalize(href) === normalize(savedDestination.href);
  const stateClass = (href: string) => {
    if (isSavedLink(href)) {
      return isCurrent(href)
        ? "border border-action/40 bg-action/10 text-action"
        : "border border-forest/25 bg-forest/5 hover:bg-forest/10";
    }

    return isCurrent(href) ? "bg-action/10 text-action" : "hover:bg-forest/10";
  };
  const renderMobileLink = (link: { href: string; label: string }, showArrow = false) => (
    <Link
      key={link.href}
      href={link.href}
      className={`flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-2 text-base leading-snug font-semibold ${isSavedLink(link.href) ? "mt-2" : ""} ${stateClass(link.href)}`}
      aria-current={isCurrent(link.href) ? "page" : undefined}
    >
      <span className="flex min-w-0 items-center gap-2">
        {isSavedLink(link.href) && <FolderOpen size={16} aria-hidden="true" />}
        {link.label}
      </span>
      {showArrow && (
        <ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-forest/70" />
      )}
    </Link>
  );
  return (
    <>
      <div className="hidden items-center gap-0.5 lg:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors motion-reduce:transition-none ${isSavedLink(link.href) ? "ml-1" : ""} ${stateClass(link.href)}`}
            aria-current={isCurrent(link.href) ? "page" : undefined}
          >
            {isSavedLink(link.href) && <FolderOpen size={16} aria-hidden="true" />}
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
              <span className="text-xs sm:text-sm">{t.tools}</span>
            </>
          }
          triggerClassName="!gap-1 !px-2 sm:!px-3"
        >
          <nav aria-label={t.menu} className="grid gap-1">
            {inApplication ? (
              links.map((link) => renderMobileLink(link))
            ) : (
              <>
                {renderMobileLink(discoveryLinks[0])}
                <section className="mt-2 border-t border-forest/20 pt-2">
                  <h2 className="px-3 py-2 text-sm font-semibold text-ink/65">{t.explore}</h2>
                  <div className="grid gap-0.5">
                    {discoveryLinks.slice(1).map((link) => renderMobileLink(link))}
                  </div>
                </section>
                {showAction && (
                  <section className="mt-2 border-t border-forest/20 pt-2">
                    <h2 className="px-3 py-2 text-sm font-semibold text-ink/65">{t.chooseTool}</h2>
                    <div className="grid gap-0.5">
                      {actionDestinations.map((link) => renderMobileLink(link, true))}
                    </div>
                  </section>
                )}
              </>
            )}
          </nav>
        </Dropdown>
      </div>
    </>
  );
}
