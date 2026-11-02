import type {MetadataRoute} from 'next';
import {indexable,siteOrigin} from '@/lib/site';

export const dynamic='force-static';

const adminPath=process.env.ADMIN_PATH?.trim()||'/admin';
if(!/^\/[a-z0-9][a-z0-9_-]{0,63}$/.test(adminPath)||['/api','/bg','/en','/tr'].includes(adminPath))throw new Error('ADMIN_PATH must be one available URL segment.');
const privatePaths=[...new Set(['/admin','/admin/','/api/','/baranhq_admin',adminPath,`${adminPath}/`])];

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
