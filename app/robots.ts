import type {MetadataRoute} from 'next';
import {indexable,siteOrigin} from '@/lib/site';

export const dynamic='force-static';

const privatePaths=['/admin','/api/','/baranhq_admin'];

export default function robots():MetadataRoute.Robots {
 return {
  rules:indexable?[
   {userAgent:'*',allow:'/',disallow:privatePaths},
   {userAgent:'OAI-SearchBot',allow:'/',disallow:privatePaths},
  ]:[
   {userAgent:'*',disallow:'/'},
   {userAgent:'OAI-SearchBot',disallow:'/'},
  ],
  ...(indexable?{sitemap:`${siteOrigin}/sitemap.xml`}:{}),
 };
}
