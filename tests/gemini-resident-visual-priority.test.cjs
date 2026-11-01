const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../gemini-modules/game.js'), 'utf8');
function loadFunction(name, nextName) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(`function ${nextName}(`, start);
  assert.ok(start >= 0 && end > start, `${name} exists`);
  return vm.runInNewContext(`${source.slice(start, end)};${name}`);
}

const nameplates = loadFunction('layoutResidentNameplates', 'drawDistantResident');
const conversation = loadFunction('chooseConversationLayer', 'drawStreetLife');

test('nearby names do not cover another character face or each other', () => {
  const people = [
    { id: 'a', x: 0, y: 0, def: { name: 'Lia' } },
    { id: 'b', x: 6, y: -10, def: { name: 'Bia' } },
    { id: 'c', x: 45, y: 0, def: { name: 'Nara' } },
  ];
  const labels = nameplates(people, { x: 0, y: 15 }, 1.85, false);
  assert.ok(labels.length <= 3);
  for (const label of labels) {
    for (const person of people.filter(p => p.id !== label.id)) {
      const intersects = label.x - label.width / 2 < person.x + 12 &&
        label.x + label.width / 2 > person.x - 12 &&
        label.y - 7 < person.y - 6 && label.y + 7 > person.y - 34;
      assert.equal(intersects, false, `${label.name} must avoid ${person.id}'s face`);
    }
  }
  assert.equal(nameplates(people, { x: 0, y: 15 }, 1.1, true).length, 0);
});

test('a greeting takes precedence over a redundant name', () => {
  const people = [{ id: 'lia', x: 0, y: 0, def: { name: 'Lia' }, greeting: { stage: 'wave' } }];
  assert.equal(nameplates(people, { x: 0, y: 0 }, 1.85, true).length, 0);
});

test('nomes opcionais não atravessam fachadas ou marcadores da Matriz e Mercado',()=>{
 const start=source.indexOf('function layoutResidentNameplates(');
 const end=source.indexOf('function drawDistantResident(',start);
 const context={data:{landmarks:[{id:'mercado',p:[0,0]}]},houses:[{x:75,y:-34,w:18,h:18}]};
 const layout=vm.runInNewContext(`${source.slice(start,end)};layoutResidentNameplates`,context);
 const labels=layout([{id:'a',x:75,y:0,def:{name:'Francisco'}}],{x:75,y:0},2.3,false);
 for(const label of labels)assert.ok(label.x+label.width/2<=64||label.x-label.width/2>=86||label.y+7<=-48||label.y-7>=-20,'nome não cruza fachada');
 const marker=layout([{id:'b',x:0,y:30,def:{name:'Lúcia'}}],{x:0,y:30},2.3,false);
 for(const label of marker)assert.ok(label.x+label.width/2<=-16||label.x-label.width/2>=16||label.y+7<=-23||label.y-7>=12,'nome não cruza marcador');
});

test('escala central suaviza silhuetas sem alterar posições ou porte fora dos núcleos',()=>{
 const start=source.indexOf('const WORLD_FACADE_HEIGHT=');
 const end=source.indexOf('// Screen-space clutter',start);
 const evaluate=vm.runInNewContext(`${source.slice(start,end)};({x,y})=>centralCharacterScale(x,y)`,{
  zoom:2.3,data:{landmarks:[{id:'mercado',p:[0,0]},{id:'igreja',p:[250,0]}]}
 });
 assert.equal(evaluate({x:0,y:0}),.86);
 assert.equal(evaluate({x:250,y:0}),.86);
 assert.equal(evaluate({x:900,y:900}),1);
 assert.ok(evaluate({x:125,y:130})>.86&&evaluate({x:125,y:130})<1);
});

test('nearer conversation has visual priority without changing its state', () => {
  const people = [
    { id: 'a', x: 0, y: 0 }, { id: 'b', x: 10, y: 0 },
    { id: 'c', x: 100, y: 0 }, { id: 'd', x: 110, y: 0 },
  ];
  const street = { phase: 'visit', host: 'a', visitor: 'b' };
  const community = { phase: 'visit', host: 'c', visitor: 'd' };
  assert.equal(conversation(street, community, people, { x: 20, y: 0 }), 'street');
  assert.equal(conversation(street, community, people, { x: 100, y: 0 }), 'community');
  assert.equal(conversation(street, null, people, { x: 100, y: 0 }), 'street');
});

test('player, guide and residents use the same facade-relative world scale', () => {
  const start = source.indexOf('const WORLD_FACADE_HEIGHT=');
  const end = source.indexOf('// Screen-space clutter', start);
  assert.ok(start > 0 && end > start);
  const values = vm.runInNewContext(`${source.slice(start, end)};({
    facade:WORLD_FACADE_HEIGHT,
    character:WORLD_CHARACTER_HEIGHT,
    player:characterDrawScale(WORLD_CHARACTER_HEIGHT/34)*34,
    resident:residentDrawScale(WORLD_CHARACTER_HEIGHT/31)*31,
    guide:characterDrawScale(WORLD_CHARACTER_HEIGHT/38)*38
  })`, { zoom: 1.85 });
  assert.equal(values.facade, 14);
  assert.ok(values.character / values.facade >= 1.5 && values.character / values.facade <= 1.8);
  assert.ok(Math.abs(values.player - values.guide) < .1);
  assert.ok(Math.abs(values.player - values.resident) < 3);
});

test('illustrative home and terminal refinements preserve geography and have coherent shadows', () => {
  const landmarks = fs.readFileSync(path.join(__dirname, '../gemini-modules/landmarks.js'), 'utf8');
  assert.match(source, /const roofType=b\.seed%3,doorLeft=b\.seed%2===0/);
  assert.match(source, /c\.lineWidth=width\+2/);
  assert.match(landmarks, /rounded\(c, -31, -13, 66, 39, 5, '#425f4930'\)/);
  assert.doesNotMatch(source.slice(source.indexOf('function house('), source.indexOf('function region(')), /houses\.push|\.at\s*=/);
});
