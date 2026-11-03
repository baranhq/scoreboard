import type {MetadataRoute} from 'next';
import {languages,origin} from '@/lib/i18n';
import {indexable} from '@/lib/site';
import {localizedAlternates,route,type PageKey} from '@/lib/routes';

export const dynamic='force-static';

const publicPages=['home','privacy','licenses','help'] as const satisfies readonly PageKey[];

export default function sitemap():MetadataRoute.Sitemap {
 if(!indexable)return [];
 return publicPages.flatMap(page=>languages.map(lang=>({
  url:origin+route(lang,page),
  alternates:{languages:localizedAlternates(origin,page)},
 })));
}
