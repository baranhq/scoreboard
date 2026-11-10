import { notFound } from "next/navigation";
import { isLang, messages } from "@/lib/i18n";
import { SavedBoards } from "@/components/scoreboard/saved-boards";
import { Frame } from "@/components/layout/frame";
import { pageMetadata } from "@/lib/page-metadata";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "saved", `/${lang}/scoreboards/`);
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <Frame lang={lang} t={messages[lang]}>
      <SavedBoards lang={lang} t={messages[lang]} />
    </Frame>
  );
}
