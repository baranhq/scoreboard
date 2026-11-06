import type { Lang } from "@/lib/i18n";
import { messages } from "@/lib/i18n";
import { help } from "@/lib/help";
import { Frame } from "../layout/frame";
import { TopicNavigation } from "./topic-navigation";
import { QuickGuide } from "./quick-guide";

export function HelpPage({ lang }: { lang: Lang }) {
  const content = help[lang];
  const t = messages[lang];
  return (
    <Frame lang={lang} t={t}>
      <main id="main" className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <header className="mb-8 max-w-3xl">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-ink/85">{content.intro}</p>
        </header>
        <div className="grid items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          <TopicNavigation
            label={content.contentsTitle}
            topics={[
              { href: "#quick-guide", title: content.quickGuide.title },
              ...content.sections.map((section) => ({
                href: `#${section.id}`,
                title: section.title,
              })),
            ]}
          />
          <article className="max-w-3xl min-w-0 divide-y divide-forest/15">
            <QuickGuide content={content.quickGuide} t={t} />
            {content.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-24 py-7 first:pt-0"
              >
                <h2
                  id={`${section.id}-title`}
                  className="font-display text-2xl font-bold tracking-tight"
                >
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="mt-3 text-base leading-7 text-ink/85 sm:text-lg sm:leading-8"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.points && (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-ink/85 sm:text-lg sm:leading-8">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </div>
      </main>
    </Frame>
  );
}
