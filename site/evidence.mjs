import {ASPECTS,PRESETS,LINES} from './catalog.mjs';
export const REPORT_SCHEMA='weave-lab-evidence-v1';
export function textSafe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function simpleHash(input){let h=2166136261;for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0');}
export function verifyBattleReport(input){
 const value=typeof input==='string'?JSON.parse(input):input;
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Report must be an object');
 if(value.schemaVersion!==1)throw new Error('Unsupported Weave Battle Report schema');
 if(!Number.isSafeInteger(value.seed)||value.seed<0||value.seed>0xffffffff)throw new Error('Invalid Battle seed');
 if(!Array.isArray(value.rosters)||value.rosters.length!==2||value.rosters.some(x=>!Array.isArray(x)||x.length!==3))throw new Error('Invalid team rosters');
 if(!Array.isArray(value.actions)||value.actions.length>50000||!value.actions.every(a=>a&&typeof a==='object'&&['swap','cast','reweave','traitChoice','timeout','surrender'].includes(a.kind)))throw new Error('Invalid action history');
 if(!Array.isArray(value.events)||value.events.length>200000||!value.events.every(e=>e&&typeof e==='object'&&!Array.isArray(e)&&typeof e.kind==='string'))throw new Error('Invalid events');
 if(!Number.isSafeInteger(value.turnCount)||value.turnCount<0||value.turnCount>100000)throw new Error('Invalid turn count');
 if(![0,1,'draw',null].includes(value.result))throw new Error('Invalid result');
 const counts=Object.fromEntries(['swap','cast','reweave','traitChoice','timeout','surrender'].map(kind=>[kind,value.actions.filter(a=>a.kind===kind).length]));
 const events=Object.fromEntries(['bonusMove','timeoutSwap'].map(kind=>[kind,value.events.filter(a=>a&&a.kind===kind).length]));
 const warnings=[];
 if(value.weaveVersion!=='0.1.2')warnings.push('Report version differs from the released v0.1.2 baseline.');
 if(!value.engineRevision||!value.rulesetFingerprint)warnings.push('Cannot verify engine revision or ruleset fingerprint.');
 if(value.result===null)warnings.push('Report was captured before Battle completion.');
 if(value.actions.length===0)warnings.push('No actions recorded.');
 if(value.actions.some(x=>x.kind==='surrender'))warnings.push('Contains a surrender action from an older prototype; newer canonical design prohibits voluntary surrender.');
 return {source:'Weave engine Battle Report',weaveVersion:String(value.weaveVersion||'unknown'),engineRevision:String(value.engineRevision||'unknown'),rulesetFingerprint:String(value.rulesetFingerprint||'unknown'),seed:value.seed,rosters:value.rosters,turnCount:value.turnCount,result:value.result,actions:value.actions.length,events:value.events.length,actionCounts:counts,eventCounts:events,warnings,confidence:'metadata-only',note:'Structural analysis only: this Lab does not re-run or cryptographically authenticate game reports.'};
}
export function makeEvidence({kind,settings,output,notes='',source='synthetic',ruleset='v0.2'}){
 if(!['damage','loom','simulation','experiment','report'].includes(kind))throw new Error('Unknown evidence kind');
 if(!PRESETS[ruleset])throw new Error('Unknown ruleset');
 const payload={schema:REPORT_SCHEMA,kind,model:source==='game-report'?'game-report-structure':'synthetic-or-mathematical',ruleset,recordedAt:new Date().toISOString(),source,settings,output,notes:String(notes).slice(0,2000),provenance:{repository:'Empyrios/weave',rulesetSources:['Combat System','Core Loom Rules','Balance Constants'],rosterProvisional:true,engineIntegrated:false}};
 payload.checksum=simpleHash(JSON.stringify(payload));return payload;
}
export function validateEvidence(v){if(!v||typeof v!=='object'||v.schema!==REPORT_SCHEMA||!['damage','loom','simulation','experiment','report'].includes(v.kind)||!PRESETS[v.ruleset]||!v.provenance)throw new Error('Unsupported evidence');return true}
export function exportCSV(rows,columns){const escape=v=>{let s=String(v??'');if(/^[\s]*[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};return [columns.map(escape).join(','),...rows.map(r=>columns.map(k=>escape(r[k])).join(','))].join('\r\n')+'\r\n';}
export function auditRules(){return [
 {rule:'7×7 Loom; six Aspects',status:'approved',versions:'both'},
 {rule:'Four or more unique Strands grants at most one Bonus Move per resolution',status:'approved',versions:'both'},
 {rule:'Two mandatory Moves, 30-second decision windows',status:'approved',versions:'both'},
 {rule:'Single Defence and legacy denominator',status:'released-legacy',versions:'v0.1.2'},
 {rule:'PHY.DEF, SP.DEF and AP × ATK / (50 + relevant DEF)',status:'approved-trial',versions:'v0.2'},
 {rule:'Rapid Reweaving, four Threads and one Move',status:'approved-trial',versions:'v0.2'},
 {rule:'Eight starting markers; 14 cap; 35% refill; minimum six',status:'approved-trial',versions:'v0.2'},
 {rule:'8–10-minute Battles and all-six Rewoven by about minute six',status:'aspirational',versions:'v0.2'},
 {rule:'Synthetic policy simulations are not observed PvP results',status:'lab-limit',versions:'both'}
 ];}
