import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Scoreboard } from "@/components/scoreboard/scoreboard";
import { Frame } from "@/components/layout/frame";
import { isLang, messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "scoreboard");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <Frame lang={lang} t={messages[lang]}>
      <Scoreboard lang={lang} t={messages[lang]} />
    </Frame>
  );
}
