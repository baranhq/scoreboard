import {spawnSync} from 'node:child_process';
import {existsSync, realpathSync, statSync} from 'node:fs';
import {homedir} from 'node:os';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import nextEnv from '@next/env';

const {loadEnvConfig}=nextEnv;
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
process.env.NODE_ENV='production';

function isInside(directory, path) {
  const rel=relative(directory,path);
  return rel===''||(!rel.startsWith(`..${sep}`)&&rel!=='..'&&!isAbsolute(rel));
}

const explicitEnv=process.env.APACHE_ENV_FILE?.trim();
const candidates=explicitEnv?[explicitEnv]:[
  join(homedir(),'scoreboard-private','.env'),
  resolve(root,'..','scoreboard-private','.env'),
];
let privateEnvFile='';
for (const candidate of [...new Set(candidates)]) {
  if (!existsSync(candidate)) {
    if (explicitEnv) throw new Error('The configured private environment file is unavailable.');
    continue;
  }
  const actual=realpathSync(candidate);
  const info=statSync(actual);
  if (!info.isFile()) throw new Error('The configured private environment file is not a regular file.');
  if (isInside(root,actual)) throw new Error('The private environment file must be outside the project directory.');
  if ((info.mode&0o077)!==0) throw new Error('The private environment file must exclude group and other permissions (chmod 600).');
  privateEnvFile=actual;
  break;
}

if (privateEnvFile) {
  process.loadEnvFile(privateEnvFile);
  if (!process.env.APACHE_ENV_FILE?.trim()) process.env.APACHE_ENV_FILE=privateEnvFile;
}

loadEnvConfig(root,false);
process.env.ADMIN_PATH=process.env.ADMIN_PATH?.trim()||'/admin';
process.env.NEXT_PUBLIC_SITE_URL=process.env.NEXT_PUBLIC_SITE_URL?.trim()||'https://scoreboard.baranhq.com';
process.env.NEXT_PUBLIC_INDEXABLE=process.env.NEXT_PUBLIC_INDEXABLE?.trim()||'false';

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
