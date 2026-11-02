import {LINES} from './catalog.mjs';
import {makeRng,seed32} from './rng.mjs';
export const SNAKE_ORDER=[0,1,1,0,0,1];
export function newDraft(seed=12345){const rng=makeRng(seed);return {seed:seed32(seed),firstPick:rng.pick(2),firstBattleTurn:rng.pick(2),picks:[],cursor:0}}
export function nextSide(draft){return draft.cursor>=6?null:(SNAKE_ORDER[draft.cursor]+draft.firstPick)%2}
export function draftPick(draft,lineId){if(draft.cursor>=6)throw new Error('Draft complete');if(!LINES.some(x=>x.id===lineId))throw new Error('Unknown line');if(draft.picks.some(x=>x.id===lineId))throw new Error('Already drafted');const side=nextSide(draft);return {...draft,picks:[...draft.picks,{side,id:lineId,position:draft.cursor+1}],cursor:draft.cursor+1}}
export function autofill(draft){const rng=makeRng(draft.seed^0xa5f375af);let d=structuredClone(draft);while(d.cursor<6){const choices=LINES.map(x=>x.id).filter(x=>!d.picks.some(p=>p.id===x));d=draftPick(d,choices[rng.pick(choices.length)]);}return d}
export function validateTeams(teams){if(!Array.isArray(teams)||teams.length!==2||teams.some(x=>!Array.isArray(x)||x.length!==3))return false;const ids=teams.flat();return new Set(ids).size===6&&ids.every(x=>LINES.some(l=>l.id===x))}
export function draftTeams(draft){if(draft.cursor!==6)throw new Error('Draft incomplete');const teams=[[],[]];for(const pick of draft.picks)teams[pick.side].push(pick.id);if(!validateTeams(teams))throw new Error('Invalid draft');return teams}
