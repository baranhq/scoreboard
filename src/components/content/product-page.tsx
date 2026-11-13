import Link from "next/link";
import { campaignCopy } from "@/lib/campaign-copy";
import { ProductDetails } from "./product-details";
import { ArrowUpRight } from "lucide-react";
import { Frame } from "@/components/layout/frame";
import { messages, type Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";
import { route } from "@/lib/routes";
import { siteOrigin, brand, repo } from "@/lib/site";
import { ToolDemo, type Tool } from "./tool-demo";
import { toolContent, toolEditors, toolPages } from "./landing-page";
export function ProductPage({ lang, tool }: { lang: Lang; tool: Tool }) {
  const t = studioCopy[lang];
  const content = toolContent(lang, tool);
  const isScoreboard = tool === "scoreboard";
  const previewFrameClass = isScoreboard
    ? "h-[clamp(24rem,46svh,35rem)] lg:min-h-0"
    : tool === "leaderboard"
      ? "h-[25rem] rounded-2xl border border-white/15 bg-white/[0.035] p-2 sm:h-[32rem] sm:p-3 lg:h-[min(72svh,44rem)]"
      : "h-[24rem] rounded-2xl border border-white/15 bg-white/[0.035] p-2 sm:h-[30rem] sm:p-3 lg:h-[min(70svh,44rem)]";
  const heroLayoutClass = isScoreboard
    ? "flex flex-col py-5 lg:h-[calc(100svh-4rem)] lg:overflow-hidden lg:py-3"
    : "grid gap-x-8 gap-y-6 pt-8 pb-10 sm:pt-12 sm:pb-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:content-center lg:items-center lg:py-7";
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
      <main id="main" data-campaign="dark">
        <section className="bg-campaign text-campaign-ink lg:min-h-[calc(100svh-4rem)]">
          <div className={`mx-auto max-w-7xl px-5 sm:px-8 ${heroLayoutClass}`}>
            <header
              className={
                tool === "scoreboard"
                  ? "grid gap-5 pb-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"
                  : tool === "bracket"
                    ? "flex flex-col items-start justify-center gap-4 lg:pb-0"
                    : ""
              }
            >
              <div>
                <p className="mb-3 font-display text-lg font-semibold text-lime">{t[tool]}</p>
                <h1 className="max-w-[18ch] font-display text-[clamp(2.75rem,5vw,5rem)] leading-[0.94] font-bold tracking-[-0.04em] text-balance whitespace-pre-line motion-safe:animate-[text-enter_360ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none">
                  {campaignCopy[lang].headlines[tool]}
                </h1>
              </div>
              <div className={tool === "bracket" ? "max-w-sm" : ""}>
                <p className="mt-3 max-w-[45ch] text-base leading-6 text-white/80">
                  {content.description}
                </p>
                <Link
                  href={route(lang, toolEditors[tool])}
                  className="mt-4 inline-flex min-h-11 items-center gap-3 bg-lime px-5 py-2.5 font-semibold text-campaign transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime active:translate-y-0 motion-reduce:transform-none"
                >
                  {content.action}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </header>
            <div className={`min-w-0 ${previewFrameClass}`}>
              <ToolDemo
                tool={tool}
                lang={lang}
                compact
                readOnly
                showPreviewLabel={!isScoreboard}
                fillPreview={!isScoreboard}
                showReadOnlyControls
                showResultControls={false}
                showFullscreenControl={!isScoreboard}
              />
            </div>
            {isScoreboard ? (
              <p className="mt-4 max-w-4xl text-sm leading-6 text-white/75 lg:col-span-2">
                {content.features}
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-sm leading-5 text-white/80 min-[480px]:grid-cols-2 sm:grid-cols-4 lg:col-span-2">
                {content.features.split(" · ").map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <ProductDetails tool={tool} lang={lang} />
        <div className="bg-campaign text-campaign-ink">
          <div className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
            <nav
              aria-label={t.tools}
              className="flex flex-wrap gap-3 border-t border-white/20 pt-6"
            >
              {(["scoreboard", "leaderboard", "bracket"] as const)
                .filter((key) => key !== tool)
                .map((key) => (
                  <Link
                    key={key}
                    href={route(lang, toolPages[key])}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/25 px-4 text-base font-semibold text-campaign-ink transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime motion-reduce:transition-none"
                  >
                    {t[key]}
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
            </nav>
          </div>
        </div>
      </main>
    </Frame>
  );
}
