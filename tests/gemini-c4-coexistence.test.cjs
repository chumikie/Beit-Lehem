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
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const graph=buildGraph(map.roads);
const anchorCode=game.slice(game.indexOf('function mappedStreetResidentAnchor('),game.indexOf('function walkingPoint('));
const anchor=vm.runInNewContext(anchorCode+';mappedStreetResidentAnchor',{Math});

function hubPoint(hub){
 if(hub.startsWith('rua:'))return anchor(map.roads,hub);
 if(hub.startsWith('missao:'))return map.missions[Number(hub.slice(7))]?.p;
 return map.landmarks.find(place=>place.id===hub)?.p;
}

test('sete dias: nenhum dos 14 passeantes planejados perde a âncora de caminhada',()=>{
 const observed=new Set();
 for(let day=1;day<=7;day++)for(const minute of [7*60,9*60,13*60,17*60,21*60]){
  const people=crowd.plan({day,minute},false,90);
  for(const person of people){
   const p=hubPoint(person.hub);
   assert.ok(p,`dia ${day} ${minute}: ${person.id} sem âncora ${person.hub}`);
   assert.ok(graph.nearest(p).distance<120,person.hub+' ao alcance do roteador');
   assert.ok(street.itinerary(graph,p,person.variant).length>=2,person.hub+' caminho possível');
   observed.add(person.hub);
  }
 }
 assert.ok(observed.size>=14,'os passeantes cobrem regiões diferentes');
});

test('sete dias: moradores novos têm turnos e rotas conectadas; nenhum fica sempre ausente',()=>{
 const expected=['celina','davi','iris','noel','breno','amelia','nina','otavio','rute','luma','tobias','marta','gil'];
 for(const id of expected){
  const def=neighbors.RESIDENTS.find(r=>r.id===id);
  assert.ok(def,id+' existe');
  const p=hubPoint(def.hub);
  assert.ok(p&&graph.route(map.start,p),id+' alcançável pela malha');
  let present=0,absent=0;
  for(let day=1;day<=7;day++)for(const minute of [7*60,9*60,11*60,13*60,16*60,18*60,21*60,23*60]){
   const duty=neighbors.agenda({day,minute},def);
   if(duty.present)present++;else absent++;
  }
  assert.ok(present>=7&&absent>=7,id+' tem presença e descanso reais');
 }
});

test('simulação de calçadas protege os recém-chegados de sobreposição e usa destinos reais',()=>{
 const start=game.indexOf('function secondaryInStreets('),end=game.indexOf('\nfunction drawSocialGesture(',start);
 const source=game.slice(start,end);
 const itineraries=new Map(),streetPaths=new Map();
 let living={day:1,minute:9*60},elapsed=130;
 const walkingPoint=(id,hub,variant,shift=0)=>{
  const key=id+':'+hub,p=hubPoint(hub);
  if(!p)return null;
  if(!itineraries.has(key)){
   const route=street.itinerary(graph,p,variant);
   itineraries.set(key,route);streetPaths.set(key,route);
  }
  return street.sample(itineraries.get(key),elapsed*(.72+variant*.07)+variant*12+shift);
 };
 const context={Math,window:{RoncadorSecondaryNeighbors:neighbors,RoncadorStreetLife:street,RoncadorStreetMoments:{choose:()=>null}},
  get living(){return living;},get elapsed(){return elapsed;},skyMode:'sol',streetPaths,walkingPoint,
  communityMeetingPoint:()=>null,encounterRoadPoint:()=>null,residentMotion:{resolve:p=>p}};
 const distribute=vm.runInNewContext('('+source+')',context);
 let encounters=0;
 for(let day=1;day<=7;day++)for(const minute of [9*60,11*60,16*60,18*60]){
  living={day,minute};elapsed=130+(day-1)*29+(minute-9*60)/60*17;
  const people=distribute([]);
  for(const person of people){
   if(person.variant<14)continue;
   encounters++;
   const others=people.filter(p=>p.id!==person.id);
   assert.ok(others.every(p=>Math.hypot(p.x-person.x,p.y-person.y)>=22),person.id+' sem sobreposição');
  }
 }
 assert.ok(encounters>40,'recém-chegados têm presença distribuída durante a semana');
});
