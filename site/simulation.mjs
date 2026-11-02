// Deliberately simplified, synthetic policy simulator. NEVER claim this is the exact Weave engine.
import {DEFAULT_DRAFT,getLine,PRESETS} from './catalog.mjs';
import {makeBoard,pickProductive,performSwap} from './loom.mjs';
import {makeRng,seed32} from './rng.mjs';
import {resolveDamage,wilson} from './math.mjs';
import {validateTeams} from './draft.mjs';
const living=team=>team.filter(x=>x.hp>0);
const avg=x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:0;
const sum=(arr,key)=>arr.reduce((v,x)=>v+(x[key]||0),0);
function startTeam(ids,side){return ids.map(id=>{const line=getLine(id),base=line.forms[0];return {lineId:id,side,aspect:line.aspect,baseName:base.name,name:base.name,form:0,hp:base.hp,maxHp:base.hp,atk:base.atk,phy:base.phy,spe:base.spe,damageDealt:0,healingDone:0,essenceOverflow:0,capacity:base.essence,essence:0,shield:0,arts:base.arts,casts:0}})}
function reweave(w){const f=getLine(w.lineId).forms[1];const scale=w.hp/w.maxHp;Object.assign(w,{name:f.name,form:1,hp:Math.min(f.hp,Math.max(1,Math.round(f.hp*scale))),maxHp:f.hp,atk:f.atk,phy:f.phy,spe:f.spe,capacity:f.essence,arts:f.arts});}
function actionActor(team,profile,rng){const t=living(team);if(!t.length)return null;const eligible=t.filter(w=>w.arts.some(a=>a.cost<=w.essence));if(!eligible.length)return null;
 if(profile==='economy')return eligible.sort((a,b)=>b.essence-a.essence||a.hp-b.hp)[0];
 return eligible[rng.pick(eligible.length)];}
function chooseArt(actor,profile,rng){const valid=actor.arts.filter(x=>x.cost<=actor.essence);
 const damage=valid.filter(a=>a.power>0);
 if(['defensive','setup'].includes(profile)&&actor.shield<15){const shieldArt=valid.find(x=>x.kind==='shield');if(shieldArt)return shieldArt}
 if(profile==='setup'&&actor.essence<actor.capacity&&!valid.some(a=>a===actor.arts[2]))return null;
 if(!damage.length)return ['control','defensive','setup'].includes(profile)?valid.find(x=>x.kind==='shield')||null:null;
 if(profile==='aggressive')return damage.sort((a,b)=>b.power-b.power)[0];
 if(profile==='economy')return damage.sort((a,b)=>(b.power/b.cost)-(a.power/a.cost))[0];
 return damage[rng.pick(damage.length)];}
function chooseTarget(team,profile,rng){const valid=living(team);if(profile==='aggressive')return [...valid].sort((a,b)=>a.hp-b.hp)[0];if(profile==='economy')return [...valid].sort((a,b)=>b.atk-a.atk)[0];return valid[rng.pick(valid.length)]}
export function simulateMatch(seed=12345,options={}){
 const {ruleset='v0.2',teams=DEFAULT_DRAFT,policyA='balanced',policyB='balanced',apScale=1,constant=50,threadCost,markerChance,maxMoves=400}=options;
 if(!validateTeams(teams))throw new Error('Requires exclusive three-Weaver teams');
 if(!PRESETS[ruleset])throw new Error('Unknown ruleset');
 if(ruleset==='v0.1.2')throw new Error('Synthetic roster simulation requires the v0.2 trial. The released v0.1.2 engine uses a different temporary roster.');
 const preset={...PRESETS[ruleset]};
 for(const k of ['hpScale','atkScale','defScale'])if(options[k]!==undefined&&(!Number.isFinite(options[k])||options[k]<.2||options[k]>3))throw new Error('Invalid stat multiplier');
 const cost=threadCost===undefined?preset.threadCost:threadCost;
 if(!Number.isInteger(cost)||cost<1||cost>6||!Number.isFinite(apScale)||apScale<0.2||apScale>3||!Number.isFinite(constant)||constant<1||constant>500)throw new RangeError('Invalid experiment parameters');
 if(markerChance!==undefined){if(!Number.isFinite(markerChance)||markerChance<0||markerChance>1)throw new RangeError('Invalid refill chance');preset.markerChance=markerChance;}
 const rng=makeRng(seed32(seed)^0x42a9fe1d);const state=makeBoard(seed,preset);const members=[startTeam(teams[0],0),startTeam(teams[1],1)];
 const stats={seed:seed32(seed),winner:null,moves:0,turns:0,cascades:0,bonusMoves:0,threadsGained:0,reweaves:[0,0],casts:[0,0],knockouts:[0,0],essenceGained:0,threadOverflow:0,maxBonusChain:0,invalid:0,modelledSeconds:0,reachedMoveCap:false};
 for(const t of members)for(const w of t){w.hp=w.maxHp=Math.round(w.hp*(options.hpScale||1));w.atk*=options.atkScale||1;w.phy*=options.defScale||1;w.spe*=options.defScale||1}
 const snapshots=[],diagnostics={opportunities:[],bonusChains:[],capacityOverflow:0};
 const held=[0,0];let side=rng.pick(2),remaining=2,bonusChain=0,newTurn=true;const policies=[policyA,policyB];
 const capture=action=>{if(options.trace)snapshots.push({move:stats.moves,turn:stats.turns,action,board:structuredClone(state.board),teams:structuredClone(members),threads:[...held]})};capture('initial state');
 const max=Math.max(20,Math.min(1200,Math.trunc(maxMoves)));
 while(stats.moves<max){if(!living(members[0]).length||!living(members[1]).length)break;
 stats.moves++;if(newTurn){stats.turns++;newTurn=false}
 let used=false,action='swap';
 for(const w of living(members[side]))if(w.form===0&&held[side]>=cost)diagnostics.opportunities.push({move:stats.moves,side,id:w.lineId});
 const mayReweave=living(members[side]).filter(w=>w.form===0);
 if(held[side]>=cost&&mayReweave.length&&((policies[side]==='aggressive'&&rng.next()<0.65)||rng.next()<0.3)){
  const w=mayReweave[rng.pick(mayReweave.length)];reweave(w);w.hp=Math.round(w.hp*(options.hpScale||1));w.maxHp=Math.round(w.maxHp*(options.hpScale||1));w.atk*=options.atkScale||1;w.phy*=options.defScale||1;w.spe*=options.defScale||1;action='reweave '+w.lineId;held[side]-=cost;stats.reweaves[side]++;used=true;
 }
 if(!used){const actor=actionActor(members[side],policies[side],rng);
 const art=actor&&chooseArt(actor,policies[side],rng);
 if(actor&&art&&rng.next()<0.7){action='Art '+actor.lineId+': '+art.name;actor.essence-=art.cost;actor.casts++;stats.casts[side]++;
  if(art.power>0){const targets=living(members[1-side]);const target=chooseTarget(targets,policies[side],rng);
    if(target){let power=art.power;
    if(art.lowHpBonus&&target.hp<=target.maxHp/2)power+=art.lowHpBonus;
    const defense=preset.split?(art.damage==='special'?target.spe:target.phy):(target.phy+target.spe)/2;
    const shield=Math.max(0,target.shield-(art.shieldRemove||0));
    const hit=resolveDamage({ap:power*apScale,atk:actor.atk,def:defense,shield,hp:target.hp,trueDamage:!!art.trueDamage,immune:target.lineId==='craglet',constant,mode:ruleset});
    actor.damageDealt+=hit.hpDamage;target.shield=hit.remainingShield;target.hp=hit.remainingHp;
    // Synthetic multi-hit approximation: independent hits; never used for canonical balance claims.
    const hits=art.hits||1;
    for(let h=1;h<hits&&target.hp>0;h++){const extra=resolveDamage({ap:power*apScale,atk:actor.atk,def:defense,shield:target.shield,hp:target.hp,trueDamage:!!art.trueDamage,immune:target.lineId==='craglet',constant,mode:ruleset});actor.damageDealt+=extra.hpDamage;target.shield=extra.remainingShield;target.hp=extra.remainingHp;}
    if(target.hp<=0){stats.knockouts[side]++;target.essence=0;target.shield=0;}
    }}else if(art.kind==='shield')actor.shield+=art.shield||20;
    used=true;
  }}
 if(!used){const m=pickProductive(state,policies[side]==='aggressive'?'tempo':policies[side]==='economy'?'threads':'balanced');const result=performSwap(state,m.a,m.b);stats.cascades+=result.cascades;
   const award=Math.min(preset.threadCap-held[side],result.threads);held[side]+=award;stats.threadsGained+=award;stats.threadOverflow+=result.threads-award;
   for(const w of living(members[side])){const e=result.essence[w.aspect]||0;const n=Math.min(e,w.capacity-w.essence);w.essence+=n;w.essenceOverflow+=e-n;diagnostics.capacityOverflow+=e-n;stats.essenceGained+=n;}
   if(result.bonus){remaining++;stats.bonusMoves++;diagnostics.bonusChains.push({move:stats.moves,side,chain:bonusChain+1});bonusChain++;stats.maxBonusChain=Math.max(bonusChain,stats.maxBonusChain)}else bonusChain=0;
 }
 // Assumed 18s average human decision, plus 2s per Move. A model parameter, not measured match time.
 capture(action);stats.modelledSeconds+=20;remaining--;
 if(remaining<=0){side=1-side;remaining=2;newTurn=true;}
 }
 if(stats.moves>=max&&living(members[0]).length&&living(members[1]).length)stats.reachedMoveCap=true;
 if(!living(members[0]).length&&!living(members[1]).length)stats.winner='draw';
 else if(!living(members[0]).length)stats.winner=1;else if(!living(members[1]).length)stats.winner=0;
 return {...stats,...(options.trace?{snapshots,diagnostics:{...diagnostics,unrewoven:members.flat().filter(w=>!w.form).map(w=>({id:w.lineId,side:w.side,reason:w.hp<=0?'defeated':diagnostics.opportunities.some(o=>o.id===w.lineId)?'policy skipped or match ended':'no affordable opportunity before match ended'}))}}:{}),teams:members,remainingThreads:held,model:'synthetic-policy-v1.2',ruleset};
}
export function runBatch(settings={}){
 const runs=Math.min(2000,Math.max(1,Math.trunc(settings.runs||100)));
 const seed=seed32(settings.seed??12345),records=[];let a=0,b=0,draws=0,unfinished=0;
 for(let i=0;i<runs;i++){const result=simulateMatch(seed+i,settings);records.push(result);if(result.winner===0)a++;else if(result.winner===1)b++;else if(result.winner==='draw')draws++;else unfinished++;}
 const completed=a+b+draws,lower=wilson(a,Math.max(1,a+b));
 return {schema:'weave-lab-simulation-v1',model:'synthetic-policy-v1.2',settings:{...settings,seed,runs},stats:{runs,completed,unfinished,winsA:a,winsB:b,draws,winRateA:a+b?a/(a+b):null,wilsonA:a+b?lower:null,meanMoves:avg(records.map(x=>x.moves)),meanTurns:avg(records.map(x=>x.turns)),meanBonus:avg(records.map(x=>x.bonusMoves)),meanCascades:avg(records.map(x=>x.cascades)),meanReweavesA:avg(records.map(x=>x.reweaves[0])),meanReweavesB:avg(records.map(x=>x.reweaves[1])),meanEssence:avg(records.map(x=>x.essenceGained)),meanThreadOverflow:avg(records.map(x=>x.threadOverflow))},records:settings.includeRecords?records:records.map(x=>({seed:x.seed,winner:x.winner,moves:x.moves,turns:x.turns,reweaves:x.reweaves,bonusMoves:x.bonusMoves,reachedMoveCap:x.reachedMoveCap}))};
}
export function compareConstants(config={}){return [40,50,65].map(constant=>({constant,summary:runBatch({...config,constant,runs:Math.min(config.runs||50,250)}).stats}));}
