'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { extractEmbeddedMap } = require('../scripts/current-geodata.cjs');
const { buildGraph } = require('../dist/pathfinding.js');
const street = require('../dist/street-life.js');
const world = require('../gemini-modules/living-world.js');
const crowd = require('../gemini-modules/crowd-flow.js');
require('../gemini-modules/secondary-neighbors.js');
const secondary = globalThis.RoncadorSecondaryNeighbors;

const html = fs.readFileSync(path.resolve(__dirname, '../previews/beit-lehem-development.html'), 'utf8');
const map = extractEmbeddedMap(html);
const graph = buildGraph(map.roads);
const game = fs.readFileSync(path.resolve(__dirname, '../gemini-modules/game.js'), 'utf8');
const part = game.slice(game.indexOf('function mappedStreetResidentAnchor('), game.indexOf('function encounterRoadPoint('));
function sampleFor(elapsed) {
  const context = { Math, data: map, roads: map.roads, missions: map.missions,
    streetPaths: new Map(), pathfinder: graph, elapsed, window: { RoncadorStreetLife: street } };
  return vm.runInNewContext(part + ';walkingPoint', context);
}

function inventory(day, hour, elapsed) {
  const state = { day, minute: hour * 60 }, sample = sampleFor(elapsed);
  const main = world.RESIDENTS.flatMap((p, i) => {
    const agenda = world.agenda(state, p.id);
    if (!agenda.present || !agenda.hub || agenda.travel || agenda.meeting) return [];
    const point = sample(p.id, agenda.hub, i);
    return point ? [{ id: p.id, hub: agenda.hub, ...point }] : [];
  });
  const neighbors = secondary.RESIDENTS.flatMap(p => {
    const agenda = secondary.agenda(state, p);
    if (!agenda.present || !agenda.hub || agenda.travel || agenda.meeting) return [];
    const point = sample(p.id, agenda.hub, p.variant);
    return point ? [{ id: p.id, hub: agenda.hub, ...point }] : [];
  });
  const passers = crowd.plan(state, false, elapsed).flatMap(p => {
    const point = sample(p.id, p.hub, p.variant);
    return point ? [{ id: p.id, hub: p.hub, ...point }] : [];
  });
  return { state, main, neighbors, passers, all: [...main, ...neighbors, ...passers] };
}

function crowdedPairs(people, threshold) {
  const pairs = [];
  for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) {
    const d = Math.hypot(people[i].x - people[j].x, people[i].y - people[j].y);
    if (d < threshold) pairs.push({ ids: [people[i].id, people[j].id], distance: +d.toFixed(1) });
  }
  return pairs.sort((a, b) => a.distance - b.distance);
}

test('C20: audit 36 fictional people across existing scheduled periods and streets', () => {
  assert.equal(world.RESIDENTS.length + secondary.RESIDENTS.length + crowd.plan({ day: 1, minute: 9 * 60 }, false, 0).length, 36);
  const snapshots = [6, 9, 13, 17, 20, 23].map(hour => {
    const group = inventory(1, hour, hour * 10);
    return { hour, known: group.all.length,
      hubs: new Set(group.all.map(p => p.hub)).size,
      tight: crowdedPairs(group.all, 12).slice(0, 6) };
  });
  console.log('C20_SPATIAL_AUDIT=' + JSON.stringify(snapshots));
  assert.ok(snapshots.some(s => s.known >= 25));
  assert.equal(snapshots.at(-1).known, 0);
  assert.ok(snapshots.find(s => s.hour === 9).hubs >= 10);
});
