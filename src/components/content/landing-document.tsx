import { LandingPage } from "@/components/content/landing-page";
import { Frame } from "@/components/layout/frame";
import { brand } from "@/lib/site";
import { messages, origin, type Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { softwareSchema } from "@/lib/seo-content";

export function LandingDocument({ lang, root = false }: { lang: Lang; root?: boolean }) {
  const schema = softwareSchema(lang, origin, brand);
  const scoreboardPath = root ? "/scoreboard/" : route(lang, "scoreboard");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <script
        id={`legacy-scoreboard-link-${lang}`}
        dangerouslySetInnerHTML={{
          __html: `if (location.hash.startsWith("#share=") || location.hash.startsWith("#board=")) location.replace(${JSON.stringify(scoreboardPath)} + location.search + location.hash);`,
        }}
      />
      <Frame lang={lang} t={messages[lang]}>
        <LandingPage lang={lang} root={root} />
      </Frame>
    </>
  );
}
