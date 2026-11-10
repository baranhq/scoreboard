import Link from "next/link";
import { ScoreboardPreview } from "./scoreboard-preview";
import { LandingFeatures } from "./landing-sections";
import { HomeFaq } from "./home-faq";
import { landingContent } from "@/lib/landing-content";
import { ArrowUpRight, Check } from "lucide-react";
import { Frame } from "@/components/layout/frame";
import { messages, type Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";
import { route } from "@/lib/routes";
import { siteOrigin, brand, repo } from "@/lib/site";
import { ToolDemo, type Tool } from "./tool-demo";
import { primaryLinkClass, toolContent, toolEditors, toolPages } from "./landing-page";
export function ProductPage({ lang, tool }: { lang: Lang; tool: Tool }) {
  const t = studioCopy[lang];
  const content = toolContent(lang, tool);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${siteOrigin}/#${tool}`,
    name: `${t[tool]} | ${brand}`,
    url: siteOrigin + route(lang, toolPages[tool]),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "JavaScript and IndexedDB",
    inLanguage: lang,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
    description: content.description,
    featureList: content.features.split(" · "),
    license: `${repo}/blob/main/LICENSE`,
    publisher: { "@id": `${siteOrigin}/#developer` },
    potentialAction: { "@type": "UseAction", target: siteOrigin + route(lang, toolEditors[tool]) },
  };
  return (
    <Frame lang={lang} t={messages[lang]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <main id="main">
        <section className="bg-[#edf1e8] dark:bg-[#213027]">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="min-w-0">
                <h1 className="font-display text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl">
                  {content.title}
                </h1>
                <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-ink/80">
                  {content.description}
                </p>
                <Link href={route(lang, toolEditors[tool])} className={`${primaryLinkClass} mt-6`}>
                  {content.action}
                  <ArrowUpRight size={18} />
                </Link>
                <p className="mt-4 text-sm font-semibold text-forest">
                  {t.free} · {t.local}
                </p>
              </div>
              {tool === "scoreboard" ? (
                <ScoreboardPreview
                  copy={landingContent[lang].preview}
                  labels={{
                    ...messages[lang],
                    save: messages[lang].saveBoardShort,
                    addTeam: messages[lang].add,
                    fineTuneSizes: messages[lang].enableTextSizeSlider,
                    editParticipant: t.editParticipant,
                    increase: t.increase,
                    decrease: t.decrease,
                    resetDemo: t.resetDemo,
                  }}
                />
              ) : (
                <ToolDemo tool={tool} lang={lang} />
              )}
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <section className="grid gap-7 border-b border-forest/20 py-10 md:grid-cols-2">
            <h2 className="max-w-[16ch] text-3xl leading-tight font-bold tracking-tight">
              {t.more}
            </h2>
            <ul className="grid gap-4">
              {content.features.split(" · ").map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-lg">
                  <Check size={18} className="shrink-0 text-forest" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>
          <section className="grid gap-7 py-10 md:grid-cols-2">
            <h2 className="max-w-[16ch] text-3xl leading-tight font-bold tracking-tight">
              {t.ownership}
            </h2>
            <p className="max-w-prose text-base leading-8 text-ink/80">{t.ownershipText}</p>
          </section>
          {tool === "scoreboard" && (
            <>
              <LandingFeatures copy={landingContent[lang].features} />
              <HomeFaq lang={lang} />
            </>
          )}
          <nav aria-label={t.tools} className="flex flex-wrap gap-3 border-t border-forest/20 pt-6">
            {(["scoreboard", "leaderboard", "bracket"] as const)
              .filter((key) => key !== tool)
              .map((key) => (
                <Link
                  key={key}
                  href={route(lang, toolPages[key])}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-forest/25 px-4 text-base font-semibold"
                >
                  {t[key]}
                  <ArrowUpRight size={16} />
                </Link>
              ))}
          </nav>
        </div>
      </main>
    </Frame>
  );
}
