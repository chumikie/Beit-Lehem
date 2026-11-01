'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const street=require('../dist/street-life.js');
const moments=require('../gemini-modules/street-moments.js');
const crowd=require('../gemini-modules/crowd-flow.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const graph=buildGraph(map.roads);
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const segment=game.slice(game.indexOf('function mappedStreetResidentAnchor('),game.indexOf('function walkingPoint('));
const anchor=vm.runInNewContext(segment+';mappedStreetResidentAnchor',{Math});
const ids=['luma','tobias','marta','gil'];

test('C3 completa 19 vizinhos nomeados mais os 3 protagonistas e até 14 passeantes',()=>{
 assert.equal(neighbors.RESIDENTS.length,19);
 assert.deepEqual(neighbors.RESIDENTS.slice(15).map(p=>p.id),ids);
 assert.equal(new Set(neighbors.RESIDENTS.map(p=>p.id)).size,19);
 assert.equal(new Set(neighbors.RESIDENTS.map(p=>p.variant)).size,19);
 assert.equal(3+neighbors.RESIDENTS.length+crowd.plan({day:1,minute:9*60},false,0).length,36);
 assert.ok(crowd.plan({day:1,minute:23*60},false,0).length===0,'36 é capacidade, não pessoas simultâneas');
});

test('quatro novos roteiros usam ruas nomeadas no mapa e são alcançáveis pelo grafo',()=>{
 for(const id of ids){
  const def=neighbors.RESIDENTS.find(r=>r.id===id);
  assert.ok(def.role&&def.greeting&&def.options.length===2&&moments.GESTURES[id]);
  const p=anchor(map.roads,def.hub);
  assert.ok(p&&p.length===2&&Number.isFinite(p[0]),id+' âncora OSM');
  assert.ok(graph.nearest(p).distance<2,id+' ponto na via');
  assert.ok(graph.route(map.start,p),id+' trecho conectado ao jogador');
  const route=street.itinerary(graph,p,def.variant);
  assert.ok(route.length>=2,id+' caminho independente');
  let prev=null;
  for(let t=0;t<60;t+=.5){
   const at=street.sample(route,t*(.72+def.variant*.07)+def.variant*12);
   if(prev)assert.ok(Math.hypot(at.x-prev.x,at.y-prev.y)<2,id+' sem teleporte');
   prev=at;
  }
 }
 assert.equal(anchor(map.roads,'rua:Rua inventada'),null);
});

test('manhã, tarde, noite e dias diferentes respeitam descanso e encontros sem duplicação',()=>{
 const snapshot=JSON.stringify(neighbors.fresh()),state=neighbors.fresh();
 const periods=[9,13,17,20,23];
 const distribution=periods.map(hour=>neighbors.RESIDENTS.filter(def=>neighbors.agenda({day:1,minute:hour*60},def).present).length);
 assert.ok(distribution[0]>5&&distribution[2]>5,'há vida em diferentes horários');
 assert.ok(distribution.at(-1)===0,'descanso noturno');
 assert.ok(new Set(distribution).size>=3,'há ritmo ao longo do dia');
 for(const id of ids){
  const def=neighbors.RESIDENTS.find(r=>r.id===id);
  const slots=[9,11,15,17,19,20].map(hour=>({minute:hour*60,...neighbors.agenda({day:3,minute:hour*60},def)}));
  assert.ok(slots.some(s=>s.present)&&slots.some(s=>!s.present),id);
  const minute=slots.find(s=>s.present).minute;
  assert.equal(neighbors.interact(state,{day:3,minute},id,def.options[0].id).ok,true);
  assert.equal(neighbors.interact(state,{day:3,minute},id,def.options[1].id).ok,false);
  assert.equal(neighbors.restore(state).choices[id],def.options[0].id);
 }
 assert.notEqual(JSON.stringify(state),snapshot);
 const old=neighbors.restore({seen:['cica','celina','breno'],choices:{cica:'fitas',celina:'sabores',breno:'passos'}});
 assert.deepEqual(old.seen,['cica','celina','breno']);
 assert.equal(old.choices.breno,'passos');
});
