import { LandingPage } from "@/components/content/landing-page";
import { brand } from "@/lib/site";
import { origin, type Lang } from "@/lib/i18n";
import { softwareSchema } from "@/lib/seo-content";

export function LandingDocument({ lang, root = false }: { lang: Lang; root?: boolean }) {
  const schema = softwareSchema(lang, origin, brand);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <LandingPage lang={lang} root={root} />
    </>
  );
}
