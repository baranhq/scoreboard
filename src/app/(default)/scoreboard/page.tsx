import type { Metadata } from "next";
import { Scoreboard } from "@/components/scoreboard/scoreboard";
import { Frame } from "@/components/layout/frame";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata("en", "scoreboard");

export default function Page() {
  return (
    <Frame lang="en" t={messages.en}>
      <Scoreboard lang="en" t={messages.en} />
    </Frame>
  );
}
