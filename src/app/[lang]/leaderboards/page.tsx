import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { ProductPage } from "@/components/content/product-page";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "leaderboards");
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <ProductPage lang={lang} tool="leaderboard" />;
}
