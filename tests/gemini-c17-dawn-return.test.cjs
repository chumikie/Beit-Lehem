const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
require('../gemini-modules/secondary-neighbors.js');
const api=globalThis.RoncadorSecondaryNeighbors;
const clock=minute=>({day:2,minute});
const trio=['cica','nara','teo'];

assert.equal(api.RESIDENTS.length,19,'C17 reuses the existing secondary cast');
for(const id of trio){
 const def=api.RESIDENTS.find(person=>person.id===id);
 assert.ok(def?.hub,'Dawn actors must already have mapped hubs');
 for(const minute of [350,354,389,409]){
  const duty=api.agenda(clock(minute),def);
  assert.equal(duty.present,true,`${id} present at ${minute}`);
  assert.equal(duty.hub,def.hub,`${id} keeps the original OSM itinerary`);
  assert.equal(duty.dawn,true);
  assert.match(duty.activity,/festa|amanhecer/);
  assert.match(api.dawnReturn(clock(minute),id).line,/festa|céu|cinco/);
 }
 for(const minute of [0,349,410,1439]){
  assert.equal(api.dawnReturn(clock(minute),id),null,`${id} outside the vignette at ${minute}`);
  assert.equal(api.agenda(clock(minute),def).present,false,`${id} resumes their normal rest at ${minute}`);
 }
 assert.equal(api.agenda(clock(8*60+30),def).present,true,'Normal morning remains intact');
}
for(const def of api.RESIDENTS.filter(person=>!trio.includes(person.id))){
 assert.equal(api.agenda(clock(354),def).present,false,`${def.id} keeps existing schedule`);
}
const game=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
assert.match(game,/dawnReturn\(living,def\.id\)/,'Nearby dialogue uses C17 lines');
assert.match(game,/Alvorada das 05h54/,'C17 can be discovered in the street encounter hint');
