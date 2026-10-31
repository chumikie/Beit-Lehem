const assert=require('node:assert/strict');
const atmosphere=require('../dist/cozy-atmosphere.js');
const bonds=require('../dist/neighborhood-quest.js');
const world=require('../dist/living-world.js');

assert.deepEqual(atmosphere.MODES,['sol','nuvens','chuvisco']);
assert.equal(atmosphere.restore('chuvisco'),'chuvisco');
assert.equal(atmosphere.restore('chuva real'),'sol');
assert.equal(atmosphere.next('sol'),'nuvens');
assert.equal(atmosphere.next('nuvens'),'chuvisco');
assert.equal(atmosphere.next('chuvisco'),'sol');

let water=atmosphere.waterGarden(2,3,'chuvisco');
assert.deepEqual(water,{step:2,accrued:3,watered:false});
water=atmosphere.waterGarden(water.step,5,'sol',water.accrued);
assert.deepEqual(water,{step:2,accrued:3,watered:false},'a clear sky must not grant rain watering');
water=atmosphere.waterGarden(water.step,5,'chuvisco',water.accrued);
assert.deepEqual(water,{step:3,accrued:0,watered:true});
assert.deepEqual(atmosphere.waterGarden(0,100,'chuvisco',5),{step:0,accrued:0,watered:false},'soil cannot skip planting');

const life=world.fresh();
assert.equal(bonds.progress(life),0);
assert.equal(bonds.next(life,[{id:'bia'}]),'bia');
for (const id of bonds.IDS){
  world.talk(life,id);
  world.talk(life,id);
  assert.equal(life.people[id].bond,1,'only one friendship point per day');
}
assert.equal(bonds.unlocked(life),false);
assert.equal(bonds.next(life,[]),null,'do not route to someone already spoken to today');
world.tomorrow(life);
for(const id of bonds.IDS)world.talk(life,id);
assert.equal(bonds.progress(life),3);
assert.equal(bonds.unlocked(life),true);
assert.equal(bonds.next(life,[]),null);
const restored=world.restore(JSON.parse(JSON.stringify(life)));
assert.equal(bonds.unlocked(restored),true,'old save format still carries bonds');
console.log('V2.11: fictional sky, rain-care timing, three friendships and restored reward verified.');
