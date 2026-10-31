const assert=require('node:assert/strict'),map=require('../dist/map.json'),{buildGraph}=require('../dist/pathfinding.js');
const graph=buildGraph(map.roads);assert(graph.nodes.length>900);assert(graph.edgeCount>=1000);assert(graph.components.length>1);assert.equal(Math.max(...graph.components.map(c=>c.size)),4241);
for(const mission of map.missions){const route=graph.route(map.start,mission.p);assert(route,'no route to '+mission.name);assert(route.points.length>=2);assert(route.distance>=Math.hypot(map.start[0]-mission.p[0],map.start[1]-mission.p[1])-1);assert.equal(route.componentId,graph.nearest(map.start).component);assert.equal(route.usedSharedComponentFallback,false);const end=route.points.at(-1);assert(Math.hypot(end.x-mission.p[0],end.y-mission.p[1])<.01);}
const zeroRoute=graph.route(map.start,map.start);
assert(zeroRoute&&zeroRoute.points.length>=1,'a zero-length route may contain a single road vertex');
assert.equal(zeroRoute.distance,0);assert.equal(buildGraph([]).route([0,0],[10,10]),null);
const fallback=buildGraph([{id:'way/1',p:[[0,0],[100,0]]},{id:'way/2',p:[[100,10],[0,10]]},{id:'way/3',p:[[0,5],[100,5]]}]).route([0,0],[100,10],{maxSnapMetres:20});assert(fallback&&fallback.usedSharedComponentFallback);assert(fallback.fromRoadMetres<=20&&fallback.toRoadMetres<=20);
assert.equal(buildGraph([{id:'way/1',p:[[0,0],[100,0]]},{id:'way/2',p:[[100,10],[0,10]]},{id:'way/3',p:[[0,5],[100,5]]}]).route([0,0],[100,10],{maxSnapMetres:4}),null,'snap distance limit must not be bypassed');
const disconnected=buildGraph([{id:'way/1',p:[[0,0],[10,0]]},{id:'way/2',p:[[200,0],[210,0]]}]);assert.equal(disconnected.route([0,0],[200,0],{maxSnapMetres:20}),null);assert(disconnected.route([0,1],[9,1])!==null);
console.log(`Routing: ${graph.nodes.length} nodes, ${graph.edgeCount} edges, ${graph.components.length} components; missions and safe snapping verified.`);
