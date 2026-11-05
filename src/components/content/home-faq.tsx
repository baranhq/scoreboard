import { ChevronDown } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { homeFaq } from "@/lib/home-faq";

export function HomeFaq({ lang }: { lang: Lang }) {
  const content = homeFaq[lang];

  return (
    <section
      aria-labelledby="home-faq-title"
      className="scroll-mt-24 border-b border-forest/15 py-7 sm:py-9"
    >
      <header className="mb-5 max-w-3xl">
        <h2
          id="home-faq-title"
          className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
        >
          {content.title}
        </h2>
      </header>

      <div className="border-t border-forest/15">
        {content.items.map((item) => (
          <details key={item.question} name="home-faq" className="group border-b border-forest/15">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-display text-base font-semibold text-ink transition-colors duration-200 ease-out hover:text-forest motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-forest transition-transform duration-250 ease-out group-open:rotate-180 motion-reduce:transition-none"
                strokeWidth={1.8}
              />
            </summary>
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr] motion-reduce:transition-none">
              <p className="min-h-0 max-w-4xl overflow-hidden pr-8 pb-4 text-base leading-7 text-ink/80">
                {item.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
