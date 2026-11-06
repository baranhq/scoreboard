import { notFound } from "next/navigation";
import { isLang, languages, origin } from "@/lib/i18n";
import type { Metadata } from "next";
import Script from "next/script";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  icons: { icon: "/icon.png" },
};
export const dynamicParams = false;
export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
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
