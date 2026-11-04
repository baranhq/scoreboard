"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { homeFaq } from "@/lib/home-faq";

export function HomeFaq({ lang }: { lang: Lang }) {
  const content = homeFaq[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="home-faq-title"
      className="mx-auto mb-12 mt-10 max-w-6xl px-4 sm:px-6"
    >
      <header className="mb-5 max-w-3xl sm:mb-6">
        <h2
          id="home-faq-title"
          className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]"
        >
          {content.title}
        </h2>
        <p className="mt-2 font-sans text-base leading-7 text-forest/90">
          {content.intro}
        </p>
      </header>

      <div className="space-y-3">
        {content.items.map((item, index) => {
          const expanded = openIndex === index;
          const triggerId = `home-faq-${lang}-${index}-trigger`;
          const answerId = `home-faq-${lang}-${index}-answer`;

          return (
            <div
              key={item.question}
              className={`overflow-hidden rounded-xl border bg-surface transition-[border-color,background-color] duration-150 ${
                expanded
                  ? "border-forest/35"
                  : "border-forest/15 hover:border-forest/30"
              } motion-reduce:transition-none`}
            >
              <h3>
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={answerId}
                  onClick={() =>
                    setOpenIndex((current) =>
                      current === index ? null : index,
                    )
                  }
                  className={`group flex min-h-14 w-full items-center justify-between gap-4 rounded-xl px-4 py-3.5 text-left font-sans text-base font-semibold text-ink transition-colors duration-150 hover:bg-forest/5 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-forest motion-reduce:transition-none ${
                    expanded ? "bg-forest/5" : ""
                  }`}
                >
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/20 bg-paper text-forest transition-[background-color,border-color,color,transform] duration-200 group-hover:border-forest/35 group-hover:bg-forest/5 motion-reduce:transition-none ${
                      expanded
                        ? "rotate-180 border-forest/35 bg-forest/10"
                        : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" strokeWidth={2} />
                  </span>
                </button>
              </h3>

              <div
                id={answerId}
                role="region"
                aria-labelledby={triggerId}
                aria-hidden={!expanded}
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                  expanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                } motion-reduce:transition-none`}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="border-t border-forest/10 px-4 pb-4 pt-3 font-sans text-base leading-7 text-ink/85">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
