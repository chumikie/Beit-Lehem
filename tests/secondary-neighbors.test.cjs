const assert=require('node:assert/strict');
require('../dist/secondary-neighbors.js');
const {RESIDENTS,fresh,restore,agenda,interact}=global.RoncadorSecondaryNeighbors;
assert.equal(RESIDENTS.length,3);
assert.equal(new Set(RESIDENTS.map(r=>r.hub)).size,3,'Each character lives in a distinct existing hub');
assert.deepEqual(RESIDENTS.map(r=>r.hub),['mercado','igreja','rodoviaria']);
for(const def of RESIDENTS){
 assert(agenda({day:1,minute:8*60+30},def).present,'Opening morning should have visible neighbors');
 assert(!agenda({day:1,minute:23*60},def).present,'Characters rest at night');
 assert.equal(def.options.length,2);
}
const state=fresh(),clock={day:1,minute:8*60+30};
for(const def of RESIDENTS){
 const result=interact(state,clock,def.id,def.options[0].id);
 assert(result.ok&&result.first,'A first daily interaction should make a memory');
 assert.equal(interact(state,clock,def.id,def.options[1].id).ok,false,'Cannot farm repeats in one day');
}
assert.equal(state.seen.length,3);
assert.equal(restore(JSON.parse(JSON.stringify(state))).seen.length,3,'Save/restore preserves memories');
assert.equal(interact(state,{day:2,minute:9*60},'cica','cores').ok,true,'New day enables a new greeting');
assert.equal(interact(state,clock,'teo','unknown').ok,false,'Invalid choices cannot change progress');
assert.deepEqual(restore({seen:['cica','intruder'],lastHelp:{cica:999999999999},choices:{cica:'hack'}}),{seen:['cica'],lastHelp:{},choices:{}},'Legacy or hostile saves are sanitized');
assert.deepEqual(restore(undefined),fresh(),'Older V2.17 save with missing section restores cleanly');
console.log('Secondary neighbors: 3 schedules, actions, daily limits, unlock and save migration verified.');
