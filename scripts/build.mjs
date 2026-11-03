import {spawnSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadBuildEnv} from './build-env.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
loadBuildEnv(root);
console.log(`Search indexing: ${process.env.NEXT_PUBLIC_INDEXABLE==='true'?'enabled':'disabled'} (${process.env.NEXT_PUBLIC_SITE_URL}).`);

const steps=[
  ['scripts/fonts.mjs'],
  ['scripts/social.mjs'],
  ['scripts/licenses.mjs'],
  ['scripts/policies.mjs'],
  ['node_modules/next/dist/bin/next','build','--webpack'],
  ['scripts/package-backend.mjs'],
];
for (const [entry,...args] of steps) {
  const result=spawnSync(process.execPath,[entry,...args],{cwd:root,env:process.env,stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status!==0) process.exit(result.status??1);
}
