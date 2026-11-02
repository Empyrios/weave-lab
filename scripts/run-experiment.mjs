#!/usr/bin/env node
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {bootstrap} from './bootstrap.mjs';
import {gzipSync} from 'node:zlib';
import {readiness,buildManifest,verifyManifest,canonical,hash,proposal} from '../site/protocol.mjs';
import {summarize,validateResult} from '../site/analysis.mjs';
import {exportCSV} from '../site/evidence.mjs';
const args=process.argv.slice(2),get=k=>args.includes(k)?args[args.indexOf(k)+1]:null,out=resolve(get('--out')||'runs/latest');await mkdir(out,{recursive:true});
const save=async(name,value)=>{const path=join(out,name),text=typeof value==='string'||value instanceof Uint8Array?value:JSON.stringify(value,null,2);await writeFile(path+'.tmp',text);await rename(path+'.tmp',path)};
let adapter=null;if(get('--adapter'))adapter=(await import(pathToFileURL(resolve(get('--adapter'))).href)).default;
const gate=readiness(adapter);
if(!gate.ready){await save('readiness.json',gate);if(args.includes('--proposal'))await save('schedule-proposal.json',await proposal());console.log(gate.run_status+': '+gate.errors.join('; '));process.exitCode=2;}else{
 let manifest;try{manifest=JSON.parse(await readFile(join(out,'experiment-manifest.json'),'utf8'));await verifyManifest(manifest);if(canonical(manifest.engine)!==canonical(adapter.metadata))throw new Error('Resume adapter metadata mismatch')}catch(e){if(e.code!=='ENOENT')throw e;manifest=await buildManifest(adapter);await save('experiment-manifest.json',manifest)}
 let checkpoint={manifestDigest:manifest.digest,records:[],reports:[],events:[]};try{const v=JSON.parse(await readFile(join(out,'checkpoint.json'),'utf8'));const {digest,...payload}=v;if(digest!==await hash(payload)||v.manifestDigest!==manifest.digest)throw new Error('Checkpoint integrity mismatch');checkpoint=payload;summarize(manifest,checkpoint.records)}catch(e){if(e.code!=='ENOENT')throw e}
 let interrupted=false;process.on('SIGINT',()=>{interrupted=true});process.on('SIGTERM',()=>{interrupted=true});
 const done=new Set(checkpoint.records.map(r=>r.id));
 for(const row of manifest.rows){if(done.has(row.id)||interrupted)continue;
  let r,report=null,events=[];
  try{const result=await adapter.play({row,maxAcceptedMoves:2000,policyVersion:adapter.metadata.policyVersion});report=result.report;events=result.events;
   if(!report||!Array.isArray(events)||!result.finalSnapshot||result.seed!==row.seed||result.rulesetFingerprint!==manifest.engine.rulesetFingerprint||result.engineCommit!==manifest.engine.commit)throw new Error('Invalid report, seed or engine provenance');
   r={...result.metrics,id:row.id,seed:row.seed,status:result.status,winner:result.winner,moves:result.moves,turns:result.turns,qaPassed:result.qaPassed===true,replayPassed:false};validateResult(r);if(r.moves>2000)throw new Error('Exceeded laboratory action limit');if(r.status==='completed'&&r.moves===0)throw new Error('Empty completed battle');
   if(events.some(e=>!e||typeof e.kind!=='string'||!['0','1'].includes(String(e.ownerSide))||typeof e.sourceId!=='string'))throw new Error('Missing typed event source attribution');
   const replay=await adapter.replay({row,report});r.replayPassed=canonical(replay.finalSnapshot)===canonical(result.finalSnapshot)&&canonical(replay.events)===canonical(events);
   if(!r.replayPassed){r.originalStatus=r.status;r.originalWinner=r.winner;r.status='replay_mismatch';r.winner=null;r.qaPassed=false;}
  }catch(e){r={id:row.id,seed:row.seed,status:'engine_error',winner:null,moves:r?.moves||0,turns:r?.turns||0,qaPassed:false,replayPassed:false,error:String(e.message)}}
  if(!Array.isArray(events))events=[];
  checkpoint.records.push(r);checkpoint.reports.push({id:row.id,engineCommit:manifest.engine.commit,rulesetFingerprint:manifest.engine.rulesetFingerprint,report});checkpoint.events.push(...events.map((event,index)=>({id:row.id,index,event})));
  await save('checkpoint.json',{...checkpoint,digest:await hash(checkpoint)});console.log(`${checkpoint.records.length}/1000 ${r.status}`);
 }
 const summary=summarize(manifest,checkpoint.records);if(checkpoint.records.length===1000)summary.bootstrap=bootstrap(manifest,checkpoint.records);await save('summary.json',summary);
 await save('match-results.csv',exportCSV(checkpoint.records.map(r=>({...manifest.rows.find(t=>t.id===r.id),...r,teamX:manifest.rows.find(t=>t.id===r.id).teamX.join('/'),teamY:manifest.rows.find(t=>t.id===r.id).teamY.join('/')})),['id','partition','replicate','arm','teamX','teamY','draftFirstTeam','battleFirstRole','seed','status','winner','moves','turns','qaPassed','replayPassed','error']));
 const jsonl=rows=>rows.map(canonical).join('\n')+'\n';await save('battle-reports.jsonl.gz',gzipSync(jsonl(checkpoint.reports)));await save('match-events.jsonl.gz',gzipSync(jsonl(checkpoint.events)));
 await save('replay-verification.json',{attempted:checkpoint.records.filter(r=>r.replayPassed||r.status==='replay_mismatch').length,successful:checkpoint.records.filter(r=>r.replayPassed).length,failed:checkpoint.records.filter(r=>r.status==='replay_mismatch').map(r=>r.id)});
 await save('qa-report.md',`# Weave Lab QA\n\nStatus: ${interrupted?'PAUSED':summary.qaStatus}\n\nCompleted: ${summary.completed}/1000. ${summary.reliability}.\n\nEngine: ${manifest.engine.commit}\nManifest SHA-256: ${manifest.digest}\n\nAdapter fixture evidence is attested by its author; inspect the pinned engine checks before interpreting results.\n`);
 await save('balance-report.md',`# Weave Lab findings\n\n${summary.qaStatus}. Completed ${summary.completed}/1000.\n\nRead summary.json for denominators and matchup distributions. Greedy-policy evidence alone cannot approve balance or estimate human match duration. No numeric game changes were made.\n`);
 if(summary.qaStatus!=='VERIFIED')process.exitCode=2;
}
