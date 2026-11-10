import Link from "next/link";
import { Menu } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import type { Lang } from "@/lib/i18n";
import { homeRoute, route } from "@/lib/routes";
import { studioCopy } from "@/lib/studio-copy";
export function ToolNavigation({ lang }: { lang: Lang }) {
  const t = studioCopy[lang];
  const links = [
    { href: homeRoute(lang), label: t.home },
    { href: route(lang, "scoreboardIntro"), label: t.scoreboard },
    { href: route(lang, "leaderboards"), label: t.leaderboard },
    { href: route(lang, "brackets"), label: t.bracket },
    { href: route(lang, "saved"), label: t.saved },
  ];
  return (
    <>
      <div className="hidden items-center gap-0.5 lg:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold whitespace-nowrap hover:bg-forest/10"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="order-last lg:hidden">
        <Dropdown ariaLabel={t.menu} label={<Menu className="h-5 w-5" />} triggerClassName="!px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-12 items-center rounded-lg px-3 py-2 text-base font-semibold hover:bg-forest/10"
            >
              {link.label}
            </Link>
          ))}
        </Dropdown>
      </div>
    </>
  );
}
