'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const street=require('../dist/street-life.js');
const moments=require('../gemini-modules/street-moments.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const ids=['celina','davi','iris','noel'];
const graph=buildGraph(map.roads);

test('C1 acrescenta quatro identidades fictícias aos seis vizinhos preservados',()=>{
 assert.equal(neighbors.RESIDENTS.length,19);
 assert.deepEqual(neighbors.RESIDENTS.slice(0,6).map(p=>p.id),['cica','nara','rosa','zeca','mila','teo']);
 assert.deepEqual(neighbors.RESIDENTS.slice(6,10).map(p=>p.id),ids);
 assert.equal(new Set(neighbors.RESIDENTS.map(p=>p.variant)).size,19);
 for(const id of ids){
  const def=neighbors.RESIDENTS.find(person=>person.id===id);
  assert.ok(def.name&&def.role&&def.greeting&&def.options.length===2&&moments.GESTURES[id]);
  assert.ok(map.landmarks.some(place=>place.id===def.hub),'âncora mapeada: '+id);
 }
});

test('os novos caminham em vias conectadas, sem ponto inventado nem teletransporte',()=>{
 for(const id of ids){
  const def=neighbors.RESIDENTS.find(p=>p.id===id);
  const anchor=map.landmarks.find(p=>p.id===def.hub).p;
  const itinerary=street.itinerary(graph,anchor,def.variant);
  assert.ok(itinerary.length>1,id+' tem caminho existente');
  let previous=null;
  for(let t=0;t<70;t+=.5){
   const point=street.sample(itinerary,t*(.72+def.variant*.07)+def.variant*12);
   assert.ok(Number.isFinite(point?.x)&&Number.isFinite(point?.y),id+' ponto válido');
   if(previous)assert.ok(Math.hypot(point.x-previous.x,point.y-previous.y)<2,id+' sem salto');
   previous=point;
  }
 }
});

test('horários independentes, encontros no máximo uma vez por dia e restauração legada',()=>{
 const save=neighbors.fresh();
 const old=neighbors.restore({seen:['cica','nara'],lastHelp:{cica:2},choices:{cica:'fitas'}});
 assert.deepEqual(old.seen,['cica','nara']);
 assert.equal(old.lastHelp.cica,2);
 for(const id of ids){
  const hours=[7,9,13,16,21],def=neighbors.RESIDENTS.find(p=>p.id===id),open=hours.map(hour=>neighbors.agenda({day:1,minute:hour*60},def));
  assert.ok(open.some(a=>a.present)&&open.some(a=>!a.present),id+' alterna presença');
  assert.equal(neighbors.agenda({day:1,minute:23*60},def).present,false);
  const minute=hours[open.findIndex(a=>a.present)]*60;
  const first=neighbors.interact(save,{day:1,minute},id,def.options[0].id);
  assert.equal(first.ok,true,id+' conversa acessível');
  assert.equal(neighbors.interact(save,{day:1,minute},id,def.options[1].id).ok,false,id+' sem recompensa repetida');
  assert.equal(neighbors.restore(save).choices[id],def.options[0].id,id+' recorda opção');
 }
});
