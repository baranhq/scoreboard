import type { Metadata } from "next";
import Script from "next/script";
import { Scoreboard } from "@/components/scoreboard/scoreboard";
import { Frame } from "@/components/layout/frame";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata("en", "scoreboard");

export default function Page() {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <Script src="/theme-4940c847476b.js" strategy="beforeInteractive" />
      </head>
      <body>
        <Frame lang="en" t={messages.en}>
          <Scoreboard lang="en" t={messages.en} />
        </Frame>
      </body>
    </html>
  );
}
