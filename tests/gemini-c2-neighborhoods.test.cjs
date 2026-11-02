'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const street=require('../dist/street-life.js');
const moments=require('../gemini-modules/street-moments.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const added=['breno','amelia','nina','otavio','rute'];
const graph=buildGraph(map.roads);
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');

test('C2 acrescenta cinco personagens a regiões já documentadas, sem mover os 10 anteriores',()=>{
 assert.equal(neighbors.RESIDENTS.length,19);
 assert.deepEqual(neighbors.RESIDENTS.slice(0,10).map(r=>r.id),['cica','nara','rosa','zeca','mila','teo','celina','davi','iris','noel']);
 assert.deepEqual(neighbors.RESIDENTS.slice(10,15).map(r=>r.id),added);
 assert.equal(new Set(neighbors.RESIDENTS.map(r=>r.id)).size,19);
 for(const id of added){
  const def=neighbors.RESIDENTS.find(p=>p.id===id);
  assert.ok(def.name&&def.role&&def.greeting&&def.options.length>=2&&moments.GESTURES[id]);
  assert.match(def.hub,/^missao:[012]$/);
  const anchor=map.missions[Number(def.hub.slice(7))].p;
  assert.ok(graph.nearest(anchor).distance<30,id+' âncora junto à via');
  const route=street.itinerary(graph,anchor,def.variant);
  assert.ok(route.length>=2,id+' usa trecho roteável existente');
  let previous=null;
  for(let t=0;t<45;t+=.5){
   const point=street.sample(route,t*(.72+def.variant*.07)+def.variant*12);
   assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));
   if(previous)assert.ok(Math.hypot(point.x-previous.x,point.y-previous.y)<2,id+' sem teleporte');
   previous=point;
  }
 }
});

test('C2 tem horários distintos, uma atividade diária e save antigo íntegro',()=>{
 const old=neighbors.restore({seen:['cica','celina'],lastHelp:{cica:4,celina:3},choices:{cica:'fitas',celina:'sabores'}});
 assert.deepEqual(old.seen,['cica','celina']);
 assert.deepEqual(old.choices,{cica:'fitas',celina:'sabores'});
 const state=neighbors.fresh();
 for(const id of added){
  const def=neighbors.RESIDENTS.find(r=>r.id===id);
  const slots=[7,9,11,13,16,18,21].map(h=>({minute:h*60,...neighbors.agenda({day:2,minute:h*60},def)}));
  assert.ok(slots.some(s=>s.present)&&slots.some(s=>!s.present),id+' alterna presença');
  assert.equal(neighbors.agenda({day:2,minute:23*60},def).present,false);
  const minute=slots.find(s=>s.present).minute;
  assert.equal(neighbors.interact(state,{day:2,minute},id,def.options[0].id).ok,true);
  assert.equal(neighbors.interact(state,{day:2,minute},id,def.options[1].id).ok,false);
  assert.equal(neighbors.restore(state).choices[id],def.options[0].id);
 }
});

test('sem vaga o recém-chegado não se sobrepõe; o diário só oferece rota para quem está presente',()=>{
 assert.match(game,/else if\(def\.variant>=14\)continue/);
 assert.match(game,/const offsets=\[63,90,117,145,180,220\]/);
 assert.match(game,/button\.textContent=position\?'⌖ Encontrar':duty\.present\?'☾ Trecho ocupado':'☾ Descansando'/);
 assert.match(game,/button\.disabled=!position\|\|!active/);
});
