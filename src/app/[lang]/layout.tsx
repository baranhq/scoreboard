import { notFound } from "next/navigation";
import { isLang, languages, origin } from "@/lib/i18n";
import { indexable, brand } from "@/lib/site";
import { localizedAlternates, route } from "@/lib/routes";
import { seoContent } from "@/lib/seo-content";
import type { Metadata } from "next";
import Script from "next/script";
export const dynamicParams = false;
export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const content = seoContent[lang];
  const title = `${content.title} | ${brand}`;
  const url = `${origin}${route(lang, "home")}`;
  const alternates = localizedAlternates(origin, "home");
  return {
    robots: { index: indexable, follow: indexable },
    metadataBase: new URL(origin),
    title,
    description: content.description,
    alternates: { canonical: url, languages: alternates },
    openGraph: {
      type: "website",
      siteName: brand,
      title,
      description: content.description,
      locale: content.openGraphLocale,
      url,
      images: [{ url: `${origin}/social.png`, width: 1200, height: 630, alt: content.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: content.description,
      images: [{ url: `${origin}/social.png`, alt: content.imageAlt }],
    },
    icons: { icon: "/icon.png" },
  };
}
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang === "en" ? "en-GB" : lang} suppressHydrationWarning>
      <head>
        <Script src="/theme-4940c847476b.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
