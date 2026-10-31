const assert = require('node:assert/strict');
const map = require('../dist/map.json');
const { buildGraph } = require('../dist/pathfinding.js');

const graph = buildGraph(map.roads);
assert(graph.nodes.length > 900, 'expected mapped road vertices');
assert(graph.edgeCount >= 1000, 'expected street connections');

for (const mission of map.missions) {
  const route = graph.route(map.start, mission.p);
  assert(route, `no street route to ${mission.name}`);
  assert(route.points.length >= 2, `empty route to ${mission.name}`);
  assert(route.distance >= Math.hypot(map.start[0] - mission.p[0], map.start[1] - mission.p[1]) - 1);
  const end = route.points.at(-1);
  assert(Math.hypot(end.x - mission.p[0], end.y - mission.p[1]) < .01);
}

assert.equal(graph.route(map.start, map.start).points.length >= 2, true);
assert.equal(buildGraph([]).route([0, 0], [10, 10]), null);
console.log(`Routing: ${graph.nodes.length} nodes, ${graph.edgeCount} road edges and six connected missions verified.`);
