import {runLoomStudy} from './loom.mjs';
import {runBatch,compareConstants} from './simulation.mjs';
self.onmessage=event=>{const {id,type,config}=event.data||{};try{const payload=type==='sensitivity'?compareConstants(config):type==='loom-study'?runLoomStudy(config):runBatch(config);self.postMessage({id,ok:true,payload});}catch(e){self.postMessage({id,ok:false,error:e.message||String(e)})}};
