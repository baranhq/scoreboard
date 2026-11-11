import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";
import { productDetails } from "@/lib/product-details";
import { route } from "@/lib/routes";
import { toolContent, toolEditors } from "./landing-page";
import type { Tool } from "./tool-demo";
import { ProductThemeShowcase } from "./product-theme-showcase";

export function ProductDetails({ tool, lang }: { tool: Tool; lang: Lang }) {
  const locale = productDetails[lang];
  const copy = locale.products[tool];
  const t = studioCopy[lang];
  const content = toolContent(lang, tool);
  return (
    <>
      <section
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20"
        aria-labelledby="capability-title"
      >
        <header
          className={`grid gap-5 ${tool === "scoreboard" ? "lg:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-2"} lg:items-end`}
        >
          <h2
            id="capability-title"
            className="max-w-[20ch] font-display text-4xl leading-[1.02] font-bold tracking-[-0.045em] sm:text-5xl"
          >
            {copy.capability[0]}
          </h2>
          <p className="max-w-[50ch] text-lg leading-8 text-ink/75">{copy.capability[1]}</p>
        </header>
        <div
          className={
            tool === "bracket"
              ? "mt-9 border-l border-forest/30 pl-5 sm:ml-6 sm:pl-10"
              : "mt-9 border-t border-forest/25"
          }
        >
          {copy.stories.map(([title, text], index) => (
            <article
              key={title}
              className={`grid gap-3 py-6 ${tool === "bracket" ? "relative before:absolute before:top-8 before:-left-6 before:size-2 before:rounded-full before:bg-action sm:before:-left-11" : "border-b border-forest/20"} ${tool === "leaderboard" ? "md:grid-cols-[0.9fr_1.1fr]" : "md:grid-cols-[1fr_1.25fr]"} md:gap-10`}
            >
              <h3 className="font-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
                {title}
              </h3>
              <p className="max-w-[65ch] leading-7 text-ink/75">{text}</p>
              <span className="sr-only">{index + 1}</span>
            </article>
          ))}
        </div>
      </section>
      <section
        className={tool === "bracket" ? "bg-[#e4ecd7] dark:bg-[#24392a]" : "bg-forest/5"}
        aria-labelledby="theme-showcase-title"
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <header className="mb-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <h2
              id="theme-showcase-title"
              className="font-display text-4xl leading-[1.02] font-bold tracking-[-0.045em] sm:text-5xl"
            >
              {copy.themes[0]}
            </h2>
            <p className="max-w-[65ch] leading-7 text-ink/75">{copy.themes[1]}</p>
          </header>
          <div className={tool === "leaderboard" ? "mx-auto max-w-4xl" : "min-w-0"}>
            <ProductThemeShowcase tool={tool} lang={lang} hint={locale.themeHint} />
          </div>
        </div>
      </section>
      <section
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20"
        aria-labelledby="workflow-title"
      >
        <h2
          id="workflow-title"
          className="mb-8 font-display text-4xl leading-tight font-bold tracking-[-0.04em] sm:text-5xl"
        >
          {locale.workflow}
        </h2>
        <div
          className={`grid items-start gap-10 ${tool === "leaderboard" ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-2"}`}
        >
          <ol className="divide-y divide-forest/20">
            {copy.steps.map(([title, text], index) => (
              <li key={title} className="grid grid-cols-[2rem_1fr] gap-4 py-5 first:pt-0">
                <span className="pt-1 font-display text-lg font-bold text-action tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 max-w-[52ch] leading-7 text-ink/75">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <figure
            className={`min-w-0 bg-forest/5 p-3 sm:p-5 ${tool === "leaderboard" ? "lg:order-first" : ""}`}
          >
            <div
              className="max-w-full overflow-auto overscroll-contain"
              tabIndex={0}
              aria-label={t.exploreGraphic}
            >
              <Image
                unoptimized
                src={`/product-views/${tool}-${lang}.webp`}
                width="640"
                height={tool === "scoreboard" ? 230 : tool === "leaderboard" ? 490 : 470}
                alt={`${t.editing}: ${t[tool]}`}
                loading="lazy"
                className="h-auto w-full min-w-[34rem] border border-forest/15 lg:min-w-0"
              />
            </div>
            <figcaption className="mt-3 text-sm text-ink/65">
              {t.editing} · {t[tool]}
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="bg-[#14251b] text-[#f5f2e8]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <h2 className="max-w-[22ch] font-display text-4xl leading-[1.02] font-bold tracking-[-0.045em] sm:text-5xl">
            {copy.advanced[0]}
          </h2>
          <div>
            <p className="leading-8 text-white/80">{copy.advanced[1]}</p>
            <h3 className="mt-8 text-lg font-semibold text-[#ccf86b]">{locale.useCases}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {copy.uses.map((use) => (
                <li key={use} className="border border-white/25 px-3 py-2 text-sm">
                  {use}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20"
        aria-labelledby="product-faq-title"
      >
        <h2
          id="product-faq-title"
          className="mb-7 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl"
        >
          {locale.questions}
        </h2>
        <div className="border-t border-forest/25">
          {copy.faq.map(([question, answer], index) => (
            <details key={question} name="product-faq" className="group border-b border-forest/20">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                <span>{question}</span>
                <ChevronDown
                  className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p id={`answer-${index}`} className="max-w-4xl pb-6 leading-8 text-ink/75">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>
      <section className="bg-[#ccf86b] text-[#14251b]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-7 px-5 py-10 sm:px-8 sm:py-14">
          <h2 className="max-w-[24ch] font-display text-4xl leading-[1.02] font-bold tracking-[-0.045em] sm:text-5xl">
            {copy.close}
          </h2>
          <Link
            href={route(lang, toolEditors[tool])}
            className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#14251b] px-6 py-3 font-semibold text-[#f5f2e8] transition-transform active:scale-95 motion-reduce:transform-none"
          >
            {content.action}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
