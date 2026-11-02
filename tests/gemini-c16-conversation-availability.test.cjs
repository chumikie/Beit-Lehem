'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const world=require('../gemini-modules/living-world.js');
require('../gemini-modules/secondary-neighbors.js');
const secondary=globalThis.RoncadorSecondaryNeighbors;
const crowd=require('../gemini-modules/crowd-flow.js');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const street=require('../gemini-modules/street-life.js');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const speakerSource=source.slice(source.indexOf('function closestReachableSpeaker('),source.indexOf('function interactAction('));
const roadAnchorSource=source.slice(source.indexOf('function mappedStreetResidentAnchor('),source.indexOf('function walkingPoint('));
const roadAnchor=vm.runInNewContext(roadAnchorSource+';mappedStreetResidentAnchor',{Math});
const graph=buildGraph(map.roads);
const hubs=['mercado','igreja','rodoviaria'];
function anchor(hub){
 if(!hub)return null;
 if(hub.startsWith('rua:'))return roadAnchor(map.roads,hub);
 if(hub.startsWith('missao:'))return map.missions[Number(hub.slice(7))]?.p;
 if(hub==='inicio')return map.start;
 return map.landmarks.find(p=>p.id===hub)?.p;
}

test('C16: os 36 personagens se dividem em 22 conversas e 14 cumprimentos',()=>{
 const passers=crowd.plan({day:1,minute:8*60},false,140);
 const all=[...world.RESIDENTS,...secondary.RESIDENTS,...passers];
 assert.equal(all.length,36);
 assert.equal(new Set(all.map(p=>p.id)).size,36);
 const hours=[8,11,14,17,19,21];const totals=Object.fromEntries(hours.map(h=>[h,0]));
 const seen=new Set();
 for(let day=1;day<=7;day++)for(const hour of hours){
  const living={day,minute:hour*60};
  const present=[...world.RESIDENTS.filter(p=>world.agenda(living,p.id).present),
   ...secondary.RESIDENTS.filter(p=>secondary.agenda(living,p).present),...crowd.plan(living,false,140)];
  totals[hour]+=present.length;for(const p of present)seen.add(p.id);
 }
 console.info('C16: presenças totais em 7 dias por horário (8/11/14/17/19/21h):',totals);
 assert.equal(seen.size,36,'todos têm ao menos uma oportunidade ao longo da semana');
 assert.equal(world.RESIDENTS.length+secondary.RESIDENTS.length,22);
 assert.equal(passers.length,14);
});

test('C16: mede oportunidades de aproximação até 120 unidades nos três marcos',()=>{
 const totals=Object.fromEntries(hubs.map(h=>[h,{within120:0,present:0}]));
 for(let day=1;day<=7;day++)for(const minute of [8*60,11*60,14*60,17*60,19*60]){
  const living={day,minute};
  const people=[...world.RESIDENTS.map((p,i)=>({...p,variant:i,duty:world.agenda(living,p.id)})),
   ...secondary.RESIDENTS.map(p=>({...p,duty:secondary.agenda(living,p)})),
   ...crowd.plan(living,false,minute).map(p=>({...p,duty:{present:true,hub:p.hub}}))]
   .filter(p=>p.duty.present);
  for(const person of people){
   const start=anchor(person.duty.hub||person.hub);if(!start)continue;
   const route=street.itinerary(graph,start,person.variant);
   const at=street.sample(route,day*120+minute*.8+person.variant*12);
   if(!at)continue;
   for(const hub of hubs){
    totals[hub].present++;
    const landmark=map.landmarks.find(p=>p.id===hub);
    if(Math.hypot(at.x-landmark.p[0],at.y-landmark.p[1])<=120)totals[hub].within120++;
   }
  }
 }
 console.info('C16: oportunidades perto dos marcos (distância <=120 unidades, 35 horários):',totals);
 assert.ok(hubs.every(h=>totals[h].within120>0));
});

test('C16: botão e tecla escolhem a mesma pessoa mais próxima, sem priorizar elenco',()=>{
 const position={x:0,y:0};
 const scope={Math,player:position,speakerWithinReach:p=>Math.hypot(p.x-position.x,p.y-position.y)<43};
 const choose=vm.runInNewContext(speakerSource+';closestReachableSpeaker',scope);
 const first=[{id:'francisco',x:30,y:0},{id:'lucia',x:40,y:0}];
 const second=[{id:'cica',secondary:true,x:12,y:0},{id:'teo',secondary:true,x:50,y:0}];
 assert.equal(choose(first,second).person.id,'cica');
 position.x=35;
 assert.equal(choose(first,second).person.id,'francisco');
 // The E action must no longer use the 150 ms-old nearResident/nearSecondary snapshot.
 const action=source.slice(source.indexOf('function interactAction(){'),source.indexOf('function renderMissions(){'));
 assert.match(action,/const speaker=closestReachableSpeaker\(\)/);
 assert.doesNotMatch(action,/if\(nearResident\)/);
});

test('C16: janela de atualização representa até 15,75 unidades ao correr',()=>{
 assert.equal(105*.15,15.75);
 assert.ok(Math.abs(67*.15-10.05)<1e-9);
 assert.match(source,/if\(uiClock>\.15\)\{updateUI\(\);uiClock=0;\}/);
 assert.match(source,/keys\.has\('shift'\)\?105:67/);
});
