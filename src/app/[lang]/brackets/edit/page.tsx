import { notFound } from "next/navigation";
import { Frame } from "@/components/layout/frame";
import { isLang, messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { BracketEditor } from "@/components/studio/bracket-editor";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "bracketEditor");
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <Frame lang={lang} t={messages[lang]}>
      <BracketEditor lang={lang} />
    </Frame>
  );
}
