import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import path from 'node:path';
const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
const allowed=new Set(['MIT','ISC','BSD-2-Clause','BSD-3-Clause','Apache-2.0','MPL-2.0','CC-BY-4.0','OFL-1.1','LGPL-3.0-or-later','0BSD','CC0-1.0','(MIT OR Apache-2.0)']);
const rows=[];const notices=[];const projectNotices=new Map();
function collect(directory,label,recursive=false){
 for(const entry of readdirSync(directory,{withFileTypes:true})){
  if(entry.name==='node_modules')continue;
  const file=path.join(directory,entry.name);
  if(entry.isDirectory()){if(recursive)collect(file,label,true);continue;}
  if(/^(licen[cs]e|copying|notice)([._-].*)?$/i.test(entry.name)){
   const content=readFileSync(file,'utf8');if(content.includes('\u0000'))throw new Error(`Non-text notice: ${file}`);
   notices.push({name:`${label} — ${path.relative(directory,file)}`,source:file,text:content});
  }
 }
}
for(const [directory,item] of Object.entries(lock.packages)){
 if(!directory||!existsSync(`${directory}/package.json`))continue;
 const pkg=JSON.parse(readFileSync(`${directory}/package.json`,'utf8'));const license=pkg.license||item.license;
 if(!allowed.has(license))throw new Error(`Review license for ${pkg.name}: ${license}`);
 const source=typeof pkg.repository==='string'?pkg.repository:pkg.repository?.url||pkg.homepage||`https://www.npmjs.com/package/${pkg.name}`;
 const before=notices.length;collect(directory,`${pkg.name}@${pkg.version}`);
 if(notices.length===before && pkg.name.startsWith('@img/sharp-libvips-')){notices.push({name:`${pkg.name}@${pkg.version} — optional build-only native binary (not distributed in out or Docker runtime)`,source:`${directory}/README.md`,text:readFileSync(`${directory}/README.md`,'utf8')+'\nSource for the prebuilt bundle: https://github.com/lovell/sharp-libvips/tree/v'+pkg.version+'\nThis optional build-host tool is not included in the deployed static application. Redistribution of its native binaries requires compliance with every bundled library license, including LGPL source/relinking requirements. Obtain originals with notices from the upstream distribution; do not copy node_modules into the website or runtime image.\n'});}
 if(notices.length===before && pkg.name.startsWith('@next/'))notices.push({name:`${pkg.name}@${pkg.version}`,source:'node_modules/next/license.md',text:readFileSync('node_modules/next/license.md','utf8')});
 if(notices.length===before && pkg.name==='client-only')notices.push({name:'client-only (React marker package)',source:'node_modules/react/LICENSE',text:readFileSync('node_modules/react/LICENSE','utf8')});
 if(notices.length===before)throw new Error(`Missing license text: ${pkg.name}`);
 projectNotices.set(`${pkg.name}@${pkg.version}`,notices.slice(before));
 rows.push({name:pkg.name,version:pkg.version,license,source:source.replace(/^git\+/,'').replace(/\.git$/,''),development:!!item.dev});
}
// Next includes vendored tools; preserve their original notices as well.
const compiledStart=notices.length;collect('node_modules/next/dist/compiled','Next.js vendored software',true);
const next=rows.find(row=>row.name==='next');if(next)projectNotices.get(`${next.name}@${next.version}`).push(...notices.slice(compiledStart));
mkdirSync('public/licenses',{recursive:true});
for(const row of rows){const file=`${row.name.replace('@','').replaceAll('/','-')}-${row.version}.json`;row.noticePath='/licenses/'+file;writeFileSync('public/licenses/'+file,JSON.stringify({name:row.name,version:row.version,license:row.license,source:row.source,notices:projectNotices.get(`${row.name}@${row.version}`)},null,2)+'\n');}
const unique=[...new Map(notices.map(n=>[n.source,n])).values()];
const overview='# Third-party licenses\n\nOriginal Baran\'s Scoreboard application code: MIT, Copyright (c) 2026 Baran Ahmedov. See [LICENSE](LICENSE). Third-party components retain their own licenses and copyright notices. MIT permits commercial use and redistribution while retaining its notices; it does not require visible interface attribution.\n\nThis inventory is generated from the installed npm lockfile, including build tools and installed platform packages. Optional platform packages in the lockfile may vary by build machine. Regenerate with `npm ci && npm run licenses` on the distribution builder. Full verbatim license and copyright notices, including vendored Next.js notices, are in [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) and deployed at `/THIRD-PARTY-NOTICES.txt`. The favicon at public/icon.png and wordmark at public/wordmark.png were supplied by the project owner for this MIT-licensed project. The original social preview image is an MIT-licensed application asset. Inter and Inter Tight static font subsets retain OFL-1.1; they are bundled with the app and are not sold separately. No remote fonts, photos, or unlicensed stock assets are used. PHP, Apache, MySQL/MariaDB, Node.js and optional Docker are separately installed runtimes; their upstream distributions carry their own notices. Docker service images retain their upstream licenses. Cloudflare is optional external performance analytics, not a required software dependency.\n\n| Package | Version | License | Upstream |\n| --- | --- | --- | --- |\n'+rows.sort((a,b)=>a.name.localeCompare(b.name)).map(r=>`| ${r.name} | ${r.version} | ${r.license} | ${r.source} |`).join('\n')+'\n';
writeFileSync('LICENSES.md',overview);
const full=unique.map(n=>`${'='.repeat(72)}\n${n.name}\n${n.source}\n${'='.repeat(72)}\n${n.text}`).join('\n\n');
writeFileSync('THIRD-PARTY-NOTICES.txt',full+'\n');mkdirSync('public',{recursive:true});
copyFileSync('THIRD-PARTY-NOTICES.txt','public/THIRD-PARTY-NOTICES.txt');writeFileSync('public/dependencies.json',JSON.stringify(rows,null,2)+'\n');
console.log(`Preserved ${unique.length} notice files for ${rows.length} installed packages and vendored tools.`);
