import Script from "next/script";
import type { Metadata } from "next";
import { LandingDocument } from "@/components/content/landing-document";
import { landingMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = landingMetadata("en");

export default function Page() {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <Script src="/theme-4940c847476b.js" strategy="beforeInteractive" />
      </head>
      <body>
        <LandingDocument lang="en" root />
      </body>
    </html>
  );
}
