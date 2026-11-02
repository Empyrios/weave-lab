import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
for(const dir of ['site','scripts'])for(const f of await readdir(dir))if(/\.m?js$/.test(f)){const p=spawnSync(process.execPath,['--check',`${dir}/${f}`],{stdio:'inherit'});if(p.status)process.exit(p.status)}
