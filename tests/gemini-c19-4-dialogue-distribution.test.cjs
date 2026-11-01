'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const source = fs.readFileSync(path.resolve(__dirname, '../gemini-modules/game.js'), 'utf8');

test('C19.4: resident replies scroll into the open notebook and remain keyboard reachable', () => {
  assert.match(source, /if\(near\)\{careResidentId=def\.id;meetResident\(def\.id\);renderLife\(\);requestAnimationFrame/);
  assert.match(source, /response\.scrollIntoView\(\{block:'center'/);
  assert.match(source, /response\.focus\(\{preventScroll:true\}\)/);
  assert.match(source, /if\(setRoute\(streetPerson\.x,streetPerson\.y\)\)notify\('Indo até '/);
});

test('C19.4: exactly 13 existing pets inhabit four established street hubs, with companion pairs together', () => {
  const segment = source.slice(source.indexOf('function drawStreetPets('), source.indexOf('function drawPuddles('));
  const pets = [...segment.matchAll(/\{id:'([^']+)'[^\n]*?hub:'([^']+)'/g)]
    .map(match => ({ id: match[1], hub: match[2] }));
  const ids = new Map(pets.map(pet => [pet.id, pet.hub]));
  assert.equal(pets.length, 13);
  assert.equal(ids.size, 13);
  assert.deepEqual([...new Set(ids.values())].sort(), ['igreja', 'inicio', 'mercado', 'rodoviaria']);
  const perHub = Object.groupBy(pets, pet => pet.hub);
  assert.ok(Object.values(perHub).every(group => group.length <= 4));
  for (const [one, two] of [['bolt', 'bethowen'], ['catito', 'artemis'], ['mimi', 'hani'], ['bob', 'princesa']]) {
    assert.equal(ids.get(one), ids.get(two), `${one} e ${two} continuam no mesmo entorno`);
  }
  assert.match(segment, /walkingPoint\(pet\.id,pet\.hub,pet\.variant\)/);
});

test('C19.4: scheduled neighbors retain close, distinct samples on the existing road itinerary', () => {
  const match = source.match(/const offset=\{([^}]+)\}\[id\]\|\|9;/);
  assert.ok(match);
  const offsets = Object.fromEntries([...match[1].matchAll(/(\w+):(\d+)/g)].map(m => [m[1], Number(m[2])]));
  assert.deepEqual(Object.keys(offsets).sort(), ['bia', 'cica', 'damiao', 'lucia', 'nara', 'teo']);
  const positions = Object.values(offsets);
  assert.equal(new Set(positions).size, positions.length);
  assert.ok(Math.max(...positions) - Math.min(...positions) < 82);
  assert.match(source, /sample\(streetPaths\.get\(key\),offset\)/);
  assert.match(source, /const separation=schedule\.encounter\?\.cast\?13\+i\*27:13\+i\*15/);
});
