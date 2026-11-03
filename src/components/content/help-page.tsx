import type {Lang} from '@/lib/i18n';
import {messages} from '@/lib/i18n';
import {help} from '@/lib/help';
import {Frame} from '../layout/frame';
import {HelpDemo} from './help-demo';
export function HelpPage({lang}:{lang:Lang}){
 const content=help[lang];const t=messages[lang];return <Frame lang={lang}><main id="main" className="mx-auto max-w-6xl px-5 py-8 sm:py-12"><header className="mb-8 max-w-3xl"><h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{content.title}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-forest/90">{t.how}</p></header><HelpDemo lang={lang} copy={{demoTitle:content.demoTitle,demoNote:content.demoNote,guide:content.guide,guideStep:content.guideStep,guideOf:content.guideOf,guideBack:content.guideBack,guideNext:content.guideNext,guideRestart:content.guideRestart}}/><div className="mt-8 grid gap-4 md:grid-cols-2">{content.sections.map(([title,text],index)=><section key={title} className={'rounded-2xl border border-forest/15 bg-surface p-5 shadow-sm sm:p-6 '+(index===content.sections.length-1?'md:col-span-2':'')}><div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-sm font-bold tabular-nums text-forest">{String(index+1).padStart(2,'0')}</span><h2 className="font-display text-xl font-bold">{title}</h2></div><p className="mt-3 text-base leading-7 text-forest/90 sm:text-lg sm:leading-8">{text}</p></section>)}</div></main></Frame>;
}
