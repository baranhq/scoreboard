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
      <main id="main" data-campaign={tool === "leaderboard" ? "light" : "dark"}>
        <section
          className={
            tool === "scoreboard"
              ? "overflow-hidden bg-campaign text-campaign-ink"
              : tool === "leaderboard"
                ? "overflow-hidden bg-paper text-ink"
                : "overflow-hidden bg-campaign text-campaign-ink"
          }
        >
          <div
            className={`mx-auto max-w-7xl px-5 pt-10 pb-12 sm:px-8 sm:pt-16 sm:pb-16 ${tool === "leaderboard" ? "grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start" : ""}`}
          >
            <header
              className={
                tool === "scoreboard"
                  ? "grid gap-7 pb-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end"
                  : tool === "bracket"
                    ? "flex flex-wrap items-end justify-between gap-8 pb-10"
                    : ""
              }
            >
              <div>
                <p
                  className={`mb-6 font-display text-xl font-semibold ${tool === "leaderboard" ? "text-action" : "text-lime"}`}
                >
                  {t[tool]}
                </p>
                <h1 className="max-w-[18ch] font-display text-[clamp(3rem,6.5vw,6rem)] leading-[0.94] font-bold tracking-[-0.04em] text-balance whitespace-pre-line motion-safe:animate-[preview-intro_600ms_ease-out_both]">
                  {campaignCopy[lang].headlines[tool]}
                </h1>
              </div>
              <div className={tool === "bracket" ? "max-w-sm" : ""}>
                <p
                  className={`mt-6 max-w-[45ch] text-lg leading-8 ${tool === "leaderboard" ? "text-ink/75" : "text-white/80"}`}
                >
                  {content.description}
                </p>
                <Link
                  href={route(lang, toolEditors[tool])}
                  className={`mt-6 inline-flex min-h-12 items-center gap-3 px-6 py-3 font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime active:translate-y-0 motion-reduce:transform-none ${tool === "leaderboard" ? "bg-action text-on-action" : "bg-lime text-campaign"}`}
                >
                  {content.action}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </header>
            <div
              className={`min-w-0 ${tool === "leaderboard" ? "border-t-[6px] border-action bg-forest/5 p-3 sm:p-6 lg:mt-14" : tool === "bracket" ? "border-y border-white/25 py-6" : ""}`}
            >
              <ToolDemo tool={tool} lang={lang} compact hideHeading={tool === "bracket"} />
            </div>
            {tool !== "leaderboard" && (
              <p className="mt-6 max-w-4xl text-sm leading-7 text-white/75">{content.features}</p>
            )}
          </div>
        </section>
        <ProductDetails tool={tool} lang={lang} />
        <div className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
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
