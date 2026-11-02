'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const world=require('../gemini-modules/living-world.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const hubs=map.landmarks.filter(h=>['mercado','igreja','rodoviaria'].includes(h.id));

test('amostras das ruas próximas aos três marcos não trocam de componente no meio do trecho',()=>{
 const graph=buildGraph(map.roads);
 let examined=0;
 const anomalies=[];
 for(const road of map.roads){
  for(let i=1;i<road.p.length;i++){
   const a=road.p[i-1],b=road.p[i],length=Math.hypot(a[0]-b[0],a[1]-b[1]);
   if(length<4)continue;
   const component=graph.nearest(a).component;
   if(component!==graph.nearest(b).component)continue;
   for(const fraction of [.25,.5,.75]){
    const at=[a[0]+(b[0]-a[0])*fraction,a[1]+(b[1]-a[1])*fraction];
    if(!hubs.some(h=>Math.hypot(h.p[0]-at[0],h.p[1]-at[1])<220))continue;
    examined++;
    if(graph.nearest(at).component!==component)anomalies.push({at,road:road.tags?.name});
   }
  }
 }
 assert.ok(examined>30,'amostrar caminhos reais, não pontos inventados');
 assert.deepEqual(anomalies,[],'a proteção não deve rejeitar uma mesma via por proximidade a outro componente');
});

test('os cinco moradores mantêm oportunidades de presença nas agendas existentes',()=>{
 const cases=[['damiao','mercado',world],['lucia','igreja',world],['bia','rodoviaria',world],
  ['cica','mercado',neighbors],['nara','igreja',neighbors]];
 for(const [id,hub,api] of cases){
  const def=api.RESIDENTS.find(person=>person.id===id);
  assert.ok(def,id+' existe');
  const visits=[10*60,16*60].map(minute=>{
   const state={day:2,minute};
   return api===world?api.agenda(state,id):api.agenda(state,def);
  });
  assert.ok(visits.some(duty=>duty.present&&duty.hub===hub),id+' mantém uma rotina acessível');
 }
});
