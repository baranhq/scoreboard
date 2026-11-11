import Link from "next/link";
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
            tool === "leaderboard"
              ? "overflow-hidden bg-[#f5f2e8] text-[#14251b] dark:bg-[#18291e] dark:text-[#f5f2e8]"
              : "overflow-hidden bg-[#14251b] text-[#f5f2e8]"
          }
        >
          <div
            className={`mx-auto max-w-7xl px-5 pt-10 pb-12 sm:px-8 sm:pt-16 ${tool === "leaderboard" ? "grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16" : ""}`}
          >
            <header
              className={
                tool === "bracket"
                  ? "grid items-end gap-6 pb-9 lg:grid-cols-[1.2fr_0.8fr]"
                  : tool === "scoreboard"
                    ? "grid items-end gap-6 pb-7 lg:grid-cols-[1.1fr_0.9fr]"
                    : ""
              }
            >
              <h1
                className={`font-display leading-[0.95] font-bold tracking-[-0.06em] ${tool === "scoreboard" ? "max-w-[17ch] text-[clamp(3.25rem,7.5vw,7rem)]" : "text-[clamp(3rem,6.5vw,6rem)]"}`}
              >
                {content.title}
              </h1>
              <div>
                <p
                  className={`mt-5 max-w-[45ch] text-base leading-7 sm:text-lg ${tool === "leaderboard" ? "text-ink/75" : "text-white/75"}`}
                >
                  {content.description}
                </p>
                <Link
                  href={route(lang, toolEditors[tool])}
                  className={`mt-6 inline-flex min-h-12 items-center gap-3 rounded-full px-6 py-3 font-semibold transition-transform active:scale-95 motion-reduce:transform-none ${tool === "leaderboard" ? "bg-action text-on-action" : "bg-[#ccf86b] text-[#14251b]"}`}
                >
                  {content.action}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </header>
            <div
              className={`min-w-0 ${tool === "bracket" ? "mx-auto max-w-5xl" : tool === "leaderboard" ? "border-t-[6px] border-[#285b35] bg-[#e2e8d7] p-3 sm:p-5 dark:bg-[#263c28]" : "border-t border-white/25"}`}
            >
              <ToolDemo tool={tool} lang={lang} compact />
            </div>
          </div>
        </section>
        <section className="bg-[#ccf86b] text-[#14251b]">
          <ul className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-3 px-5 py-6 sm:px-8">
            {content.features.split(" · ").map((feature) => (
              <li
                key={feature}
                className="font-display text-lg font-semibold tracking-tight sm:text-xl"
              >
                {feature}
              </li>
            ))}
          </ul>
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
