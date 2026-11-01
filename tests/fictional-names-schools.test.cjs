const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('novos tratamentos preservam os IDs internos e a intimidade de Dona Rosa', () => {
  const people = require('../gemini-modules/living-world.js').RESIDENTS;
  assert.equal(people.find(p => p.id === 'damiao').name, 'Seu Francisco');
  const secondary = read('gemini-modules/secondary-neighbors.js');
  assert.match(secondary, /id:'rosa',name:'Dona Rosa'/);
  assert.match(secondary, /As crianças me chamam de Tia Rosa/);
});

test('o novo ponto escolar se baseia em coordenadas públicas sem mudar a malha', () => {
  const game = read('gemini-modules/game.js');
  assert.match(game, /id:'escola_felinto'/);
  assert.match(game, /-35\.5373344/);
  assert.match(game, /-6\.6984949/);
  assert.match(game, /osm_public_school_point/);
});
