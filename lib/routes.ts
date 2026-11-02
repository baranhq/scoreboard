import type {Lang} from './i18n';
export const slugs={bg:{home:'',saved:'zapazeni-igri',privacy:'poveritelnost',licenses:'licenzi'},tr:{home:'',saved:'kayitli-oyunlar',privacy:'gizlilik',licenses:'lisanslar'},en:{home:'',saved:'scoreboards',privacy:'privacy',licenses:'licenses'}} as const;
export type PageKey=keyof typeof slugs.en;
export function route(lang:Lang,page:PageKey='home'):string{return `/${lang}/${slugs[lang][page]}${slugs[lang][page]?'/':''}`;}
export function pageForPath(path:string):PageKey|undefined {
 for(const lang of ['bg','tr','en'] as const)for(const page of ['home','saved','privacy','licenses'] as const)if(path.replace(/\/?$/,'/')===route(lang,page))return page;
 if(/^\/tr\/kayitli-tabelalar\/?$/.test(path))return 'saved';
 const alias=/^\/(bg|tr|en)\/(scoreboards|privacy|licenses)\/?$/.exec(path);return alias?(alias[2]==='scoreboards'?'saved':alias[2] as PageKey):undefined;
}
export function translatedPath(path:string,lang:Lang):string{return route(lang,pageForPath(path)||'home');}
