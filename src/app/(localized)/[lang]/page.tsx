import { notFound } from "next/navigation";
import { LandingDocument } from "@/components/content/landing-document";
import { isLang } from "@/lib/i18n";
import { landingMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return landingMetadata(lang);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <LandingDocument lang={lang} />;
}
