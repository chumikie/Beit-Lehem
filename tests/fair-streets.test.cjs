const assert=require('node:assert/strict');
const map=require('../dist/map.json');
const scenic=require('../dist/scenic-placement.js');
const fair=require('../dist/fair-streets.js');
const world=require('../dist/living-world.js');

const monday=world.fresh();
assert.equal(world.isMarketMorning(monday),true,'opening scene is a fictional Monday market');
world.advance(monday,6*60);
assert.equal(world.isMarketMorning(monday),false,'the illustrative market winds down');
world.tomorrow(monday);
assert.equal(world.isMarketMorning(monday),false,'Tuesday does not automatically host the traditional Monday scene');
world.advance(monday,6*1440);
assert.equal(world.isMarketMorning(monday),true,'the cycle returns next Monday');

const before=JSON.stringify(map);
const scenes=scenic.layout(map);
const stalls=fair.layout(map,scenes);
assert(stalls.length>=3&&stalls.length<=10,'a modest number of illustrated stands should be visible');
const market=map.landmarks.find(p=>p.id==='mercado');
for(const [i,stall] of stalls.entries()){
  assert(fair.STREET_NAMES.test(stall.road),`stall ${i} must reference a recognised OSM street`);
  assert(Math.hypot(stall.p[0]-market.p[0],stall.p[1]-market.p[1])<160,'a stall must stay near the market');
  assert(stall.p.every(Number.isFinite));
  assert(map.missions.every(m=>Math.hypot(m.p[0]-stall.p[0],m.p[1]-stall.p[1])>=23),'no stall on a mission marker');
  assert(scenes.every(s=>!(Math.abs(s.at[0]-stall.p[0])<58*s.scale+9&&Math.abs(s.at[1]-stall.p[1])<75*s.scale+9)),'no overlapping landmark artwork');
}
assert.equal(JSON.stringify(map),before,'fair placement must never mutate OSM geometry');
console.log(`Feira V2.9: ${stalls.length} illustrative stalls tied to named OSM roads, Monday calendar, no altered GPS.`);
