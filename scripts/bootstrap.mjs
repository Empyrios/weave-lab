import {createHash} from 'node:crypto';
import {percentile,partitions} from '../site/protocol.mjs';
/** Exact 2,000-sample stratified four-arm block bootstrap, Type-7 percentiles. */
export function bootstrap(manifest,records){
 const byId=new Map(records.map(r=>[r.id,r]));if(byId.size!==1000)throw new Error('Bootstrap requires every scheduled trial, including incomplete rows');
 const cells=partitions().map(p=>Array.from({length:25},(_,i)=>manifest.rows.filter(r=>r.partition===p.partition&&r.replicate==='R'+String(i+1).padStart(2,'0')).map(r=>{const v=byId.get(r.id);if(!v)throw new Error('Missing scheduled trial');const decisive=v.status==='completed'&&['X','Y'].includes(v.winner),battleTeam=r.battleFirstRole==='A'?r.draftFirstTeam:r.draftFirstTeam==='X'?'Y':'X';return {x:Number(v.status==='completed'&&v.winner==='X'),complete:Number(v.status==='completed'),draft:decisive?(v.winner===r.draftFirstTeam?1:-1):0,battle:decisive?(v.winner===battleTeam?1:-1):0}})));
 const samples={winRateXAllScheduled:[],draftEffectAllScheduled:[],battleEffectAllScheduled:[],completionRate:[]};
 for(let b=0;b<2000;b++){let x=0,draft=0,battle=0,complete=0;for(let p=0;p<10;p++)for(let d=0;d<25;d++){const input=`weavelab:v02:bootstrap:20261102:b=${String(b).padStart(4,'0')}:p=P${String(p+1).padStart(2,'0')}:draw=${String(d).padStart(2,'0')}`,buf=createHash('sha256').update(input).digest(),i=Number(buf.readBigUInt64LE(0)%25n);for(const r of cells[p][i]){x+=r.x;draft+=r.draft;battle+=r.battle;complete+=r.complete}}samples.winRateXAllScheduled.push(x/1000);samples.draftEffectAllScheduled.push(draft/1000);samples.battleEffectAllScheduled.push(battle/1000);samples.completionRate.push(complete/1000)}
 return {method:'2000 stratified block resamples; SHA-256 first 8 bytes unsigned LE modulo 25; four arms retained; Type-7 percentiles',intervals:Object.fromEntries(Object.entries(samples).map(([k,v])=>[k,{lower:percentile(v,.025),upper:percentile(v,.975)}]))};
}
