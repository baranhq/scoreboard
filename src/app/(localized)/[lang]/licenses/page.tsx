import { readFileSync } from "node:fs";
import { notFound } from "next/navigation";
import { isLang, messages } from "@/lib/i18n";
import { brand, repo } from "@/lib/site";
import { pageMetadata } from "@/lib/page-metadata";
import { Frame } from "@/components/layout/frame";
import { LicenceDisclosure, type Dependency } from "@/components/content/licence-disclosure";
import { ChevronDown } from "lucide-react";
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "licenses", `/${lang}/licenses/`);
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = messages[lang];
  const rows = JSON.parse(readFileSync("public/dependencies.json", "utf8")) as Dependency[];
  const disclosureLabels = {
    upstream: t.upstream,
    loadingNotices: t.loadingNotices,
    noticesError: t.noticesError,
    downloadNotices: t.downloadNotices,
  };
  return (
    <Frame lang={lang} t={t}>
      <main id="main" className="mx-auto max-w-5xl px-5 py-7">
        <h1 className="font-display text-3xl font-bold">{t.licenses}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8">{t.licenseIntro}</p>
        <div className="mt-3 flex flex-wrap gap-x-5">
          <a
            href="/LICENSE.txt"
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            MIT License
          </a>
          <a
            href="/THIRD-PARTY-NOTICES.txt"
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            {t.downloadNotices}
          </a>
          <a
            href={`${repo}/blob/HEAD/LICENSES.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            LICENSES.md
          </a>
        </div>
        <details name="scoreboard-menu" className="group mt-5 border-y border-forest/20">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-3 py-4 font-display text-xl font-bold transition-colors duration-150 select-none hover:bg-forest/5 motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
            <span>{brand} · MIT License</span>
            <ChevronDown
              aria-hidden="true"
              className="h-5 w-5 shrink-0 transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <pre className="px-3 pb-5 text-base leading-7 break-words whitespace-pre-wrap motion-safe:animate-[appear_150ms_ease-out]">
            {readFileSync("LICENSE", "utf8")}
          </pre>
        </details>
        <h2 className="mt-7 mb-3 font-display text-2xl font-bold">{t.dependencies}</h2>
        {rows.map((row) => (
          <LicenceDisclosure
            key={`${row.name}-${row.version}`}
            dependency={row}
            labels={disclosureLabels}
          />
        ))}
      </main>
    </Frame>
  );
}
