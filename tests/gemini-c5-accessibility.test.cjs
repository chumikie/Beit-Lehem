'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const street=require('../dist/street-life.js');
const crowd=require('../gemini-modules/crowd-flow.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const graph=buildGraph(map.roads);
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const source=game.slice(game.indexOf('function mappedStreetResidentAnchor('),game.indexOf('\nfunction encounterRoadPoint('));
const streetPaths=new Map();
const context={Math,roads:map.roads,data:map,missions:map.missions,pathfinder:graph,
 streetPaths,elapsed:140,window:{RoncadorStreetLife:street}};
const walkingPoint=vm.runInNewContext(source+';walkingPoint',context);

test('C5: os três vizinhos legados têm pontos reais e não desaparecem antes da conversa',()=>{
 for(const id of ['rosa','zeca','mila']){
  const def=neighbors.RESIDENTS.find(person=>person.id===id);
  assert.ok(def);
  const point=walkingPoint(def.id,def.hub,def.variant);
  assert.ok(point&&Number.isFinite(point.x)&&Number.isFinite(point.y),id+' deve aparecer na rua');
  assert.ok(graph.nearest([point.x,point.y]).distance<120,id+' permanece próximo da malha mapeada');
  assert.ok(streetPaths.get(id+':'+def.hub)?.length>=2,id+' tem itinerário real');
 }
});

test('C5: sete dias oferecem encontros de todos os 19 vizinhos e 14 passeantes',()=>{
 const seen=new Set(),rested=new Set(),busyCounts=[];
 let plannedPassers=0,accessiblePassers=0;
 for(let day=1;day<=7;day++)for(const minute of [7,9,11,13,16,18,21,23].map(h=>h*60)){
  const world={day,minute};
  let visible=0;
  for(const def of neighbors.RESIDENTS){
   if(!neighbors.agenda(world,def).present){rested.add(def.id);continue;}
   const at=walkingPoint(def.id,def.hub,def.variant);
   assert.ok(at,`dia ${day}, ${minute}: ${def.id} inacessível`);
   seen.add(def.id);visible++;
  }
  const passers=crowd.plan(world,false,140+day);
  plannedPassers+=passers.length;
  const occupied=neighbors.RESIDENTS.filter(def=>neighbors.agenda(world,def).present)
   .map(def=>walkingPoint(def.id,def.hub,def.variant)).filter(Boolean);
  for(const p of passers){
   const at=crowd.openSlot(offset=>walkingPoint(p.id,p.hub,p.variant,offset),occupied,[],23,[],null,NaN,[]);
   if(!at)continue;
   assert.ok(occupied.every(other=>Math.hypot(other.x-at.x,other.y-at.y)>=23));
   occupied.push(at);accessiblePassers++;
  }
  if(minute===9*60||minute===18*60)busyCounts.push(visible+occupied.length);
 }
 assert.equal(seen.size,19,'todos os vizinhos têm ao menos um turno acessível');
 assert.equal(rested.size,19,'todos também têm descanso');
 assert.ok(accessiblePassers>0&&plannedPassers>=accessiblePassers);
 assert.ok(busyCounts.every(n=>n>=6),'manhã e fim de tarde não ficam sem vida');
 console.info(`C5: passeantes planejados ${plannedPassers}, posições desobstruídas ${accessiblePassers}, bloqueios ${plannedPassers-accessiblePassers}; vizinhos acessíveis ${seen.size}/19.`);
});

test('C5.1: camada real de vizinhos não esconde sistematicamente morador escalado',()=>{
 const start=game.indexOf('function secondaryInStreets('),end=game.indexOf('\nfunction drawSocialGesture(',start);
 const code=game.slice(start,end);
 let world={day:1,minute:9*60},elapsed=140;
 const context={Math,window:{RoncadorSecondaryNeighbors:neighbors,RoncadorStreetLife:street,
  RoncadorStreetMoments:{choose:()=>null}},streetPaths,
  get living(){return world;},get elapsed(){return elapsed;},skyMode:'sol',walkingPoint,
  communityMeetingPoint:()=>null,encounterRoadPoint:()=>null,
  residentMotion:{resolve:person=>person}};
 const distribute=vm.runInNewContext('('+code+')',context);
 const planned=new Map(),rendered=new Map();
 for(let day=1;day<=7;day++)for(const minute of [7,9,11,13,16,18,21].map(hour=>hour*60)){
  world={day,minute};elapsed=140+day*37+minute/43;
  const actual=distribute([]);
  assert.equal(new Set(actual.map(person=>person.id)).size,actual.length,'sem duplicar vizinhos');
  for(const def of neighbors.RESIDENTS){
   if(!neighbors.agenda(world,def).present)continue;
   planned.set(def.id,(planned.get(def.id)||0)+1);
   if(actual.some(person=>person.id===def.id))rendered.set(def.id,(rendered.get(def.id)||0)+1);
  }
 }
 const absent=neighbors.RESIDENTS.filter(def=>!rendered.has(def.id)).map(def=>def.id);
 assert.deepEqual(absent,[],'ninguém pode ficar invisível em todos os turnos');
 const blocked=[...planned].reduce((sum,[id,count])=>sum+count-(rendered.get(id)||0),0);
 console.info(`C5.1: ${[...planned.values()].reduce((a,b)=>a+b,0)} turnos previstos, ${[...rendered.values()].reduce((a,b)=>a+b,0)} posições renderizadas, ${blocked} sem posição; invisíveis persistentes ${absent.length}.`);
});
