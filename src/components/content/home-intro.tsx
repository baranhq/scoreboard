import type {Lang} from '@/lib/i18n';
import {seoContent} from '@/lib/seo-content';

export function HomeIntro({lang}:{lang:Lang}){
 const content=seoContent[lang];
 return <header className="mt-6 mb-5 max-w-4xl px-3 sm:px-4">
  <h1 id="home-title" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{content.heading}</h1>
  <p className="mt-1 max-w-3xl text-base leading-6 text-forest/90">{content.intro}</p>
 </header>;
}
