import { notFound } from "next/navigation";
import { Frame } from "@/components/layout/frame";
import { HelpPage } from "@/components/content/help-page";
import { ProductPage } from "@/components/content/product-page";
import { Scoreboard } from "@/components/scoreboard/scoreboard";
import { isLang, messages, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { slugs, type PageKey } from "@/lib/routes";
import Privacy from "../privacy/page";
import Licenses from "../licenses/page";
import Saved from "../scoreboards/page";

export const dynamicParams = false;

const generatedPages = [
  "scoreboard",
  "scoreboardIntro",
  "leaderboards",
  "brackets",
  "saved",
  "privacy",
  "licenses",
  "help",
] as const satisfies readonly Exclude<PageKey, "home">[];

const staticSlugs = new Set([
  "scoreboard",
  "leaderboards",
  "brackets",
  "scoreboards",
  "privacy",
  "licenses",
]);

export function generateStaticParams({ params }: { params: { lang: string } }) {
  if (!isLang(params.lang)) notFound();
  const lang = params.lang;
  return generatedPages.flatMap((page) => {
    const slug = slugs[lang][page];
    return !slug || slug.includes("/") || staticSlugs.has(slug) ? [] : [{ slug }];
  });
}

function pageKey(lang: Lang, slug: string) {
  return generatedPages.find((page) => slugs[lang][page] === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const key = pageKey(lang, slug);
  if (!key) notFound();
  return pageMetadata(lang, key);
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const key = pageKey(lang, slug);
  if (!key) notFound();

  if (key === "scoreboard")
    return (
      <Frame lang={lang} t={messages[lang]}>
        <Scoreboard lang={lang} t={messages[lang]} />
      </Frame>
    );
  if (key === "scoreboardIntro") return <ProductPage lang={lang} tool="scoreboard" />;
  if (key === "leaderboards") return <ProductPage lang={lang} tool="leaderboard" />;
  if (key === "brackets") return <ProductPage lang={lang} tool="bracket" />;
  if (key === "help") return <HelpPage lang={lang} />;

  const DetailPage = key === "saved" ? Saved : key === "privacy" ? Privacy : Licenses;
  return <DetailPage params={Promise.resolve({ lang })} />;
}
