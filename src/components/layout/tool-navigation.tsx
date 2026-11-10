"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import type { Lang } from "@/lib/i18n";
import { homeRoute, route } from "@/lib/routes";
import { studioCopy } from "@/lib/studio-copy";
export function ToolNavigation({ lang }: { lang: Lang }) {
  const t = studioCopy[lang];
  const normalize = (value: string) => value.replace(/\/$/, "") || "/";
  const pathname = normalize(usePathname());
  const applicationLinks = [
    { href: homeRoute(lang), label: t.home },
    { href: route(lang, "scoreboard"), label: t.scoreboard },
    { href: route(lang, "leaderboardEditor"), label: t.leaderboard },
    { href: route(lang, "bracketEditor"), label: t.bracket },
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
  const inApplication = applicationPaths.has(pathname);
  const links = inApplication ? applicationLinks : discoveryLinks;
  const showAction =
    !inApplication &&
    (pathname === normalize(homeRoute(lang)) ||
      (["scoreboardIntro", "leaderboards", "brackets"] as const).some(
        (page) => pathname === normalize(route(lang, page)),
      ));
  const productRoute =
    pathname === route(lang, "leaderboards").replace(/\/$/, "")
      ? "leaderboardEditor"
      : pathname === route(lang, "brackets").replace(/\/$/, "")
        ? "bracketEditor"
        : "scoreboard";
  const action =
    productRoute === "leaderboardEditor"
      ? { href: route(lang, productRoute), label: t.openLeaderboards }
      : productRoute === "bracketEditor"
        ? { href: route(lang, productRoute), label: t.openBrackets }
        : { href: route(lang, productRoute), label: t.openScoreboard };
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
          <Link
            href={action.href}
            className="ml-1 inline-flex min-h-11 items-center rounded-lg bg-action px-3 text-sm font-semibold text-on-action transition-[filter,transform] hover:brightness-95 active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none"
          >
            {action.label}
          </Link>
        )}
      </div>
      <div className="order-last lg:hidden">
        <Dropdown
          ariaLabel={t.menu}
          label={
            <>
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span>{t.tools}</span>
            </>
          }
          triggerClassName="!px-3"
        >
          {links.map((link) => (
            <Link
              key={link.href}
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
          ))}
          {showAction && (
            <Link
              href={action.href}
              className="my-1 flex min-h-12 items-center rounded-lg bg-action px-3 py-2 text-base font-semibold text-on-action"
            >
              {action.label}
            </Link>
          )}
        </Dropdown>
      </div>
    </>
  );
}
