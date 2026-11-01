const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const placement = require('../gemini-modules/scenic-placement.js');

const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../dist/map.json'), 'utf8'));

function lineHitsRect(a, b, rect) {
  let start = 0, end = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0]-rect[0]], [dx, rect[2]-a[0]],
    [-dy, a[1]-rect[1]], [dy, rect[3]-a[1]]]) {
    if (Math.abs(p) < 1e-9) { if (q < 0) return false; }
    else {
      const t = q / p;
      if (p < 0) start = Math.max(start, t);
      else end = Math.min(end, t);
      if (start > end) return false;
    }
  }
  return true;
}

test('o cenário do Mercado não ocupa nenhum trecho de rua real', () => {
  const originalRoads = JSON.stringify(source.roads);
  const scenes = placement.layout(source);
  const market = scenes.find(scene => scene.id === 'mercado');
  assert.ok(market, 'o Mercado continua visível');
  const rect = placement.bounds(market, 3);
  for (const road of source.roads) for (let i = 1; i < road.p.length; i++) {
    assert.equal(lineHitsRect(road.p[i-1], road.p[i], rect), false,
      `trecho ${road.id} atravessa o cenário do Mercado`);
  }
  assert.equal(JSON.stringify(source.roads), originalRoads, 'vias não modificadas');
});

test('o ajuste conserva as outras posições de cena na fonte estável', () => {
  const scenes = placement.layout(source);
  assert.deepEqual(scenes.filter(scene => ['igreja', 'rodoviaria', 'praca_6_setembro'].includes(scene.id))
    .map(scene => scene.id), ['igreja', 'rodoviaria', 'praca_6_setembro']);
});
