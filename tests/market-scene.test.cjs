const assert=require('node:assert/strict');
const scene=require('../dist/market-scene');
const market=require('../dist/market-morning');
assert.deepEqual(scene.restore(undefined),Array(6).fill(null));
assert.deepEqual(scene.restore(['maca-1','maca-1','fake',null,null,null]),['maca-1',null,null,null,null,null]);
let slots=scene.restore(null),state=market.fresh();market.meet(state);
for(let i=0;i<6;i++){
 const before=slots;slots=scene.place(slots,scene.FRUITS[i].id,5-i,true);
 assert.notEqual(slots,before,'functional state updates do not mutate the caller');
}
assert(scene.complete(slots),'any arrangement is allowed');
assert.equal(new Set(slots).size,6,'six different fruits');
assert.deepEqual(scene.place(slots,'fake',0,true),slots);
assert.deepEqual(scene.place(slots,'maca-1',99,true),slots);
assert.deepEqual(scene.place(slots,'maca-1',0,false),slots,'permission guard blocks changes');
const swapped=scene.place(slots,slots[0],5,true);assert.equal(swapped[5],slots[0]);assert.equal(swapped[0],slots[5]);
const empty=scene.restore(null),first=scene.place(empty,'maca-1',0,true),replaced=scene.place(first,'limao-1',0,true);
assert.equal(replaced[0],'limao-1');assert(!replaced.includes('maca-1'),'replaced fruit goes back to the tray');
market.doWork(state,'frutas');
assert(scene.complete(scene.restore(undefined,state.work.includes('frutas'))),'V2.25 completed fruit task remains complete');
assert(!scene.complete(scene.restore(undefined,false)),'unfinished legacy activity starts with an empty tray');
assert.deepEqual(scene.restore(JSON.parse(JSON.stringify(slots))),slots,'partial or full arrangement survives save serialization');
assert(!market.claim(state),'fruits alone cannot unlock reward');market.doWork(state,'toldo');market.doWork(state,'cestos');
assert(market.claim(state));assert(!market.claim(state),'original one-time reward still controls the activity');
console.log('Market fruit model: migration, unique fruits, swapping, gates and original reward verified');
