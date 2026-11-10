import { notFound } from "next/navigation";
import { Frame } from "@/components/layout/frame";
import { isLang, messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { LeaderboardEditor } from "@/components/studio/leaderboard-editor";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "leaderboardEditor");
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <Frame lang={lang} t={messages[lang]}>
      <LeaderboardEditor lang={lang} />
    </Frame>
  );
}
