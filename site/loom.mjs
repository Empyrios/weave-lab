import {ASPECTS} from './catalog.mjs';
import {makeRng} from './rng.mjs';
export const SIZE=7, CELLS=49;
export const cloneBoard=board=>board.map(c=>({...c}));
export function adjacent(a,b){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&a<CELLS&&b<CELLS&&Math.abs(Math.floor(a/SIZE)-Math.floor(b/SIZE))+Math.abs(a%SIZE-b%SIZE)===1}
export function swap(board,a,b){if(!adjacent(a,b))throw new RangeError('Only adjacent swaps');[board[a],board[b]]=[board[b],board[a]];return board}
export function matchGroups(board){if(board.length!==CELLS)throw new Error('Bad Loom size');const runs=[];
 for(let axis=0;axis<2;axis++)for(let fixed=0;fixed<SIZE;fixed++){
 let start=0;while(start<SIZE){const idx=n=>axis===0?fixed*SIZE+n:n*SIZE+fixed;
 let end=start+1;while(end<SIZE&&board[idx(end)].aspect===board[idx(start)].aspect)end++;
 if(end-start>=3)runs.push(Array.from({length:end-start},(_,i)=>idx(start+i)));
 start=end;}}
 const sets=[];for(const run of runs){const set=new Set(run),matched=[];sets.forEach((prev,i)=>{if([...prev].some(x=>set.has(x)))matched.push(i)});for(const index of matched.reverse()){for(const x of sets[index])set.add(x);sets.splice(index,1)}sets.push(set)}
 return sets.map(s=>[...s].sort((a,b)=>a-b));
}
export function opportunities(board){const moves=[];for(let a=0;a<CELLS;a++)for(const b of [a+1,a+SIZE])if(adjacent(a,b)){swap(board,a,b);const g=matchGroups(board);swap(board,a,b);if(g.length)moves.push({a,b,groups:g.length,strands:new Set(g.flat()).size,bonus:g.some(x=>x.length>=4)})}return moves}
export function makeBoard(seed=1234,rules){const rng=makeRng(seed);let serial=0;const create=()=>({id:++serial,aspect:ASPECTS[rng.pick(ASPECTS.length)],thread:false});
 let board;
 for(let attempt=0;attempt<10000;attempt++){board=Array.from({length:CELLS},create);if(!matchGroups(board).length&&opportunities(board).length)break;}
 if(!board||matchGroups(board).length||!opportunities(board).length)throw new Error('Unable to create stable starting Loom');
 const indices=rng.shuffle(Array.from({length:CELLS},(_,i)=>i));for(const idx of indices.slice(0,rules.startingMarkers))board[idx].thread=true;
 return {board,rng,serial,seed,step:0,history:[],rules:{...rules}};
}
export function reshuffle(state){const {rng}=state;let board=state.board;
 for(let i=0;i<10000;i++){
  const shuffled=rng.shuffle(board);if(!matchGroups(shuffled).length&&opportunities(shuffled).length){state.board=shuffled;return true;}
 }
 throw new Error('Loom reshuffle failed');}
export function resolveMatches(state){const {rules,rng}=state;let matched=0,threads=0,cascades=0,bonus=false,shuffles=0;const essence=Object.fromEntries(ASPECTS.map(x=>[x,0]));const groups=[];
 while(true){const hits=matchGroups(state.board);if(!hits.length)break;if(++cascades>100)throw new Error('Cascade safety limit');
 if(hits.some(g=>g.length>=4))bonus=true;
 const removed=new Set(hits.flat());const perCascade=[];
 for(const g of hits){const aspect=state.board[g[0]].aspect;perCascade.push({aspect,size:g.length});}
 groups.push(...perCascade);for(const i of removed){const cell=state.board[i];essence[cell.aspect]++;matched++;if(cell.thread)threads++;}
 let threaded=state.board.reduce((n,cell,index)=>n+Number(cell.thread&&!removed.has(index)),0);
 const newBoard=Array(CELLS);
 for(let c=0;c<SIZE;c++){
  const kept=[];for(let r=SIZE-1;r>=0;r--)if(!removed.has(r*SIZE+c))kept.push(state.board[r*SIZE+c]);
  for(let r=SIZE-1;r>=0;r--){const oldIndex=SIZE-1-r;let cell=kept[oldIndex];if(!cell){cell={id:++state.serial,aspect:ASPECTS[rng.pick(ASPECTS.length)],thread:false};if(threaded<rules.markerCap&&rng.next()<rules.markerChance){cell.thread=true;threaded++}}newBoard[r*SIZE+c]=cell;}
 }
 state.board=newBoard;
 }
 if(rules.markerFloor>0){let count=state.board.filter(c=>c.thread).length;if(count<rules.markerFloor){const free=rng.shuffle(Array.from({length:CELLS},(_,i)=>i).filter(i=>!state.board[i].thread));for(const index of free.slice(0,rules.markerFloor-count)){state.board[index].thread=true;}}}
 if(!opportunities(state.board).length){reshuffle(state);shuffles++;}
 return {strands:matched,threads,essence,bonus,cascades,shuffles,groups};
}
export function performSwap(state,a,b){if(!adjacent(a,b))throw new RangeError('Not an adjacent swap');swap(state.board,a,b);const result=resolveMatches(state);state.step++;state.history.push({step:state.step,a,b,...result});return result;}
export function pickProductive(state,profile='balanced'){
 const legal=opportunities(state.board);if(!legal.length)throw new Error('No legal productive swaps');
 if(profile==='random')return legal[state.rng.pick(legal.length)];
 const scores=legal.map(v=>({...v,score:profile==='threads'?(v.strands+4*Number(v.bonus)):profile==='tempo'?(v.strands+10*Number(v.bonus)):v.strands+3*Number(v.bonus)}));
 const highest=Math.max(...scores.map(x=>x.score));const best=scores.filter(x=>x.score===highest);return best[state.rng.pick(best.length)];}
export function loomMetrics(state){return {step:state.step,markers:state.board.filter(c=>c.thread).length,opportunities:opportunities(state.board).length,aspectCount:Object.fromEntries(ASPECTS.map(x=>[x,state.board.filter(c=>c.aspect===x).length]))}}
// Developer-only synthetic Loom benchmark. No game Arts or live opponents are modelled.
export function runLoomStudy({seed=12345,count=100,moves=20,rules,policy='balanced'}={}){
 if(!rules||!Number.isInteger(count)||count<1||count>2000||!Number.isInteger(moves)||moves<1||moves>200)throw new RangeError('Invalid Loom study');
 const results=[];
 for(let n=0;n<count;n++){
  const state=makeBoard((seed+n)>>>0,rules),record={seed:(seed+n)>>>0,steps:0,strands:0,threads:0,bonuses:0,cascades:0,shuffles:0,threadOverflow:0,markerMin:Infinity,markerMax:0};let held=0;
  for(let i=0;i<moves;i++){
   const choice=pickProductive(state,policy);const result=performSwap(state,choice.a,choice.b);record.steps++;record.strands+=result.strands;record.cascades+=result.cascades;record.bonuses+=Number(result.bonus);record.shuffles+=result.shuffles;record.threads+=result.threads;
   const accepted=Math.min(rules.threadCap-held,result.threads);held+=accepted;record.threadOverflow+=result.threads-accepted;
   // Spending a Reweave when possible is a defined synthetic policy, not an actual Battle.
   if(held>=rules.threadCost)held-=rules.threadCost;
   const markers=state.board.filter(c=>c.thread).length;record.markerMin=Math.min(record.markerMin,markers);record.markerMax=Math.max(record.markerMax,markers);
  }
  results.push(record);
 }
 const sums=keys=>Object.fromEntries(keys.map(k=>[k,results.reduce((a,r)=>a+r[k],0)/(count*moves)]));
 const means=sums(['strands','threads','bonuses','cascades','shuffles','threadOverflow']);
 return {schema:'weave-lab-loom-study-v1',seed:seed>>>0,count,moves,policy,ruleset:rules.id,metrics:{meanStrandsPerMove:means.strands,meanThreadsPerMove:means.threads,bonusRate:means.bonuses,meanCascadesPerMove:means.cascades,shuffleRate:means.shuffles,meanOverflowPerMove:means.threadOverflow,lowestMarkers:Math.min(...results.map(r=>r.markerMin)),highestMarkers:Math.max(...results.map(r=>r.markerMax))},records:results};
}
