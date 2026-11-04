import {ChevronDown} from 'lucide-react';
import type {Lang} from '@/lib/i18n';
import {homeFaq} from '@/lib/home-faq';

export function HomeFaq({lang}:{lang:Lang}){
 const content=homeFaq[lang];
 return <section aria-labelledby="home-faq-title" className="mb-10 mt-12 max-w-5xl px-3 sm:px-4">
  <header className="mb-5 max-w-3xl">
   <h2 id="home-faq-title" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{content.title}</h2>
   <p className="mt-2 font-sans text-base leading-7 text-forest/90">{content.intro}</p>
  </header>
  <div className="grid gap-3 sm:grid-cols-2">
   {content.items.map(item=><details key={item.question} className="group rounded-xl border border-forest/15 p-4 transition-colors duration-150 hover:border-forest/35 motion-reduce:transition-none">
    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-sans text-base font-semibold text-forest transition-colors duration-150 hover:text-forest/80 dark:text-[#8bd69a] dark:hover:text-white motion-reduce:transition-none">
     <span>{item.question}</span><ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"/>
    </summary>
    <p className="mt-2 max-w-3xl font-sans text-base leading-7 text-forest/90">{item.answer}</p>
   </details>)}
  </div>
 </section>;
}
