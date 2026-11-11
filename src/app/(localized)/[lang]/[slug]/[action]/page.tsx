import { notFound } from "next/navigation";
import { BracketEditor } from "@/components/studio/bracket-editor";
import { LeaderboardEditor } from "@/components/studio/leaderboard-editor";
import { Frame } from "@/components/layout/frame";
import { isLang, messages, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { slugs } from "@/lib/routes";

export const dynamicParams = false;

const editorPages = ["leaderboardEditor", "bracketEditor"] as const;
type EditorPage = (typeof editorPages)[number];

function editorForPath(lang: Lang, slug: string, action: string): EditorPage | undefined {
  return editorPages.find((page) => slugs[lang][page] === `${slug}/${action}`);
}

export function generateStaticParams({ params }: { params: { lang: string } }) {
  if (!isLang(params.lang)) notFound();
  const lang = params.lang;
  return editorPages.map((page) => {
    const [slug, action] = slugs[lang][page].split("/");
    return { slug, action };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; action: string }>;
}) {
  const { lang, slug, action } = await params;
  if (!isLang(lang)) notFound();
  const page = editorForPath(lang, slug, action);
  if (!page) notFound();
  return pageMetadata(lang, page);
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string; action: string }>;
}) {
  const { lang, slug, action } = await params;
  if (!isLang(lang)) notFound();
  const page = editorForPath(lang, slug, action);
  if (!page) notFound();

  return (
    <Frame lang={lang} t={messages[lang]}>
      {page === "leaderboardEditor" ? (
        <LeaderboardEditor lang={lang} />
      ) : (
        <BracketEditor lang={lang} />
      )}
    </Frame>
  );
}
