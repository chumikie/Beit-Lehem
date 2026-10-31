const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const community = require('../dist/street-community.js');
const graphAPI = require('../dist/pathfinding.js');
const road = require('../dist/street-life.js');
const encounters = require('../dist/street-encounters.js');
globalThis.RoncadorStreetCommunity = community;
require('../dist/secondary-neighbors.js');

assert.equal(community.EVENTS.length, 5);
assert.equal(new Set(community.EVENTS.map(e => e.id)).size, 5);
const monday = {day:1,minute:8*60+30};
let scene = community.current(monday);
assert.equal(scene.id,'fitas-de-bom-dia');
assert.equal(scene.phase,'visit');
assert.equal(community.agenda(monday,'damiao').activity,'recebendo um laço de Ciça');
assert.equal(community.agenda(monday,'cica').activity,'escolhendo fitas para Damião');
assert.equal(community.agenda(monday,'teo'),null);
assert.equal(community.current({day:1,minute:9*60+11}),null);
assert.equal(community.next({day:1,minute:9*60+11}).id,'caderno-compartilhado');
assert.equal(community.current({day:3,minute:15*60+11}).phase,'approach');
assert.equal(community.current({day:3,minute:15*60+30}).phase,'visit');
assert.equal(community.current({day:3,minute:16*60+7}).phase,'return');
assert.equal(community.agenda({day:3,minute:15*60+30},'bia').meeting,true);
assert.equal(community.agenda({day:3,minute:15*60+15},'bia').travel,true);
assert.equal(community.agenda({day:3,minute:15*60+30},'nara').meeting,true);
assert.equal(community.agenda({day:4,minute:10*60+30},'lucia').meeting,true);
assert.equal(community.agenda({day:4,minute:10*60+30},'nara').meeting,true);
assert.equal(community.agenda({day:6,minute:10*60+35},'teo').meeting,true);
assert.equal(community.agenda({day:7,minute:16*60+40},'bia').meeting,true);
assert.notEqual(community.line(monday,scene),community.line({day:1,minute:8*60+46},scene));

const observed=community.fresh();
assert.deepEqual(community.observe(observed,scene,false),{ok:false});
assert.deepEqual(community.observe(observed,scene,true),{ok:true,count:1,unlocked:false});
assert.deepEqual(community.observe(observed,scene,true),{ok:false});
scene=community.current({day:3,minute:15*60+30});
assert.deepEqual(community.observe(observed,scene,true),{ok:true,count:2,unlocked:false});
scene=community.current({day:4,minute:10*60+30});
assert.deepEqual(community.observe(observed,scene,true),{ok:true,count:3,unlocked:true});
assert.deepEqual(community.observe(observed,scene,true),{ok:false});
assert.deepEqual(community.restore(['fitas-de-bom-dia','invalid','fitas-de-bom-dia','memorias-do-jardim']),['fitas-de-bom-dia','memorias-do-jardim']);
assert.deepEqual(community.restore(null),[]);
assert.deepEqual(community.restore({seen:['fitas-de-bom-dia']}),[]);

// All hubs and walking segments reuse the unchanged mapped graph.
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','dist','map.json'),'utf8'));
const graph=graphAPI.buildGraph(data.roads);
for(const hub of ['mercado','igreja','rodoviaria']){
 const anchor=data.landmarks.find(p=>p.id===hub)?.p;
 assert(anchor,`Missing OSM reference ${hub}`);
 const itinerary=road.itinerary(graph,anchor,3,145);
 assert(itinerary.length>=2,`Missing mapped sidewalk route ${hub}`);
 const first=road.sample(itinerary,9),second=road.sample(itinerary,44);
 const separation=Math.hypot(first.x-second.x,first.y-second.y);
 assert(separation>=25&&separation<=65,`${hub}: characters should not overlap or stand far apart (${separation})`);
}
for(const [from,to] of [['rodoviaria','igreja'],['rodoviaria','mercado']]){
 const point=key=>data.landmarks.find(p=>p.id===key).p;
 const route=graph.route(point(from),point(to));
 assert(route&&route.roadMetres>0,`Missing street route ${from} to ${to}`);
 for(const fraction of [0,.23,.51,.9,1]){
  const location=encounters.alongRoad(route.points.slice(0,-1),fraction);
  const near=graph.nearest([location.x,location.y]);
  assert(near.distance<90,`Travel must remain near mapped streets: ${from} to ${to}`);
 }
}
console.log('Community: 5 weekly scenes, timing, dialogue, walkable duos, 3 unique memories and legacy-safe save restoration verified.');
