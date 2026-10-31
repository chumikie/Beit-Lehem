const assert = require('node:assert/strict');
const streets = require('../dist/street-life.js');
const graph = require('../dist/pathfinding.js').buildGraph([
  {p:[[0,0],[15,0],[30,0],[45,0]],tags:{highway:'residential'}},
  {p:[[30,0],[30,18]],tags:{highway:'residential'}}
]);
const path = streets.itinerary(graph,[2,6],0);
assert(path.length >= 2, 'walker receives route vertices');
for (const p of path) assert(graph.nodes.some(n=>n.x===p.x&&n.y===p.y), 'all vertices from actual road graph');
for (const t of [0,2,8,15,29,50,110]) {
  const p = streets.sample(path,t);
  assert(Number.isFinite(p.x)&&Number.isFinite(p.y));
  assert(Math.abs(p.y)<.001,'walker stays on street');
}
assert.equal(streets.itinerary(graph,[900,900]).length,0,'no teleportation to distant street');
const world = require('../dist/living-world.js');
const friday = world.fresh();friday.day = 5;friday.minute = 16*60+40;
for(const resident of world.RESIDENTS){
  const at = world.agenda(friday,resident.id);
  assert.equal(at.hub,'mercado','Friday gathering uses existing mapped reference');
  assert.equal(at.meeting,true);
}
const geology = require('../dist/geology.json');
assert.equal(geology.points.length,14);
for(const p of geology.points){
  assert(Number.isInteger(p.id)&&Number.isFinite(p.p[0])&&Number.isFinite(p.p[1]));
  assert(p.lon>-35.6 && p.lon< -35.4 && p.lat>-6.8 && p.lat< -6.6);
}
console.log('V2.7: road-graph walks, social meeting and 14 SGB GPS observations verified.');
