import { ChevronDown } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { homeFaq } from "@/lib/home-faq";

export function HomeFaq({ lang }: { lang: Lang }) {
  const content = homeFaq[lang];

  return (
    <section aria-labelledby="home-faq-title" className="scroll-mt-24 py-5 sm:py-9">
      <header className="mb-4 max-w-3xl sm:mb-5">
        <h2
          id="home-faq-title"
          className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
        >
          {content.title}
        </h2>
      </header>

      <div className="border-y border-forest/15">
        {content.items.map((item) => (
          <details
            key={item.question}
            name="home-faq"
            data-reveal="rise"
            className="group border-b border-forest/15 last:border-0 [&:nth-child(2)]:delay-75 [&:nth-child(3)]:delay-150 [&:nth-child(4)]:delay-200 [&:nth-child(5)]:delay-[250ms] [&:nth-child(6)]:delay-300 [&:nth-child(7)]:delay-[350ms]"
          >
            <summary className="-mx-2 flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-md px-2 py-3 font-display text-base font-semibold text-ink transition-[color,background-color] duration-200 ease-out group-open:bg-forest/5 group-open:font-bold group-open:text-forest hover:bg-forest/5 hover:text-forest motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-forest transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:scale-110 group-open:rotate-180 motion-reduce:transition-none"
                strokeWidth={1.8}
              />
            </summary>
            <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:grid-rows-[1fr] group-open:opacity-100 motion-reduce:transition-none">
              <div className="min-h-0 overflow-hidden">
                <p className="max-w-4xl translate-y-1 pr-8 pb-4 text-base leading-7 text-ink/75 transition-transform duration-300 ease-out group-open:translate-y-0 group-open:delay-75 motion-reduce:transition-none">
                  {item.answer}
                </p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
