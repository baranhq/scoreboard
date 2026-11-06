import type { Metadata } from "next";
import Script from "next/script";
import { Scoreboard } from "@/components/scoreboard/scoreboard";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata("en", "scoreboard");

export default function Page() {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <Script src="/theme.js" strategy="beforeInteractive" />
      </head>
      <body>
        <Scoreboard lang="en" t={messages.en} />
      </body>
    </html>
  );
}
