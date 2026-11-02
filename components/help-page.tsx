import type {Lang} from '@/lib/i18n';
import {help} from '@/lib/help';
import {Frame} from './frame';
export function HelpPage({lang}:{lang:Lang}){
 const content=help[lang];return <Frame lang={lang}><main id="main" className="mx-auto max-w-3xl px-5 py-6"><h1 className="font-display text-3xl font-bold tracking-tight">{content.title}</h1>{content.sections.map(([title,text])=><section key={title} className="mt-5"><h2 className="font-display text-xl font-bold">{title}</h2><p className="mt-2 text-lg leading-8">{text}</p></section>)}</main></Frame>;
}
