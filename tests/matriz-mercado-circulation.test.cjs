'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const street=require('../dist/street-life.js');
const previewStreet=require('../gemini-modules/street-life.js');
const world=require('../gemini-modules/living-world.js');
require('../gemini-modules/secondary-neighbors.js');
const secondary=global.RoncadorSecondaryNeighbors;

const graph=buildGraph(map.roads);
const cases=[
 {hub:'mercado',primary:'damiao',secondary:'cica',variant:0},
 {hub:'igreja',primary:'lucia',secondary:'nara',variant:1},
 {hub:'rodoviaria',primary:'bia',secondary:'teo',variant:2}
];
const length=path=>path.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-path[i].x,p.y-path[i].y),0);
const points=path=>JSON.stringify(path);

test('moradores do mesmo núcleo percorrem ramos distintos do grafo OSM existente',()=>{
 for(const {hub,primary,secondary:friend,variant} of cases){
  const anchor=map.landmarks.find(p=>p.id===hub)?.p;
  const def=secondary.RESIDENTS.find(p=>p.id===friend);
  assert.ok(anchor&&def,hub);
  const first=street.itinerary(graph,anchor,variant),other=street.itinerary(graph,anchor,def.variant);
  const geminiFirst=previewStreet.itinerary(graph,anchor,variant),geminiOther=previewStreet.itinerary(graph,anchor,def.variant);
  assert.ok(length(geminiFirst)>=58,`${hub}: protagonista percorre pelo menos 58 m no Gemini`);
  assert.ok(length(geminiOther)>=58,`${hub}: vizinho percorre pelo menos 58 m no Gemini`);
  assert.notDeepEqual(geminiFirst,geminiOther,`${hub}: trajetos Gemini independentes`);
  assert.ok(first.length>=2&&other.length>=2,hub);
  assert.notEqual(points(first),points(other),`${primary} e ${friend} não devem repetir a mesma polilinha`);
  for(const path of [first,other]){
   assert.ok(length(path)<=95.001,`${hub}: percurso permanece no limite local`);
   for(let i=1;i<path.length;i++){
    const a=graph.nearest([path[i-1].x,path[i-1].y]),b=graph.nearest([path[i].x,path[i].y]);
    assert.ok(a.distance<.01&&b.distance<.01,`${hub}: vértices devem ser ruas reais`);
    assert.ok(graph.nodes[a.id].neighbours.some(e=>e.id===b.id),`${hub}: nenhuma ligação inventada`);
   }
  }
  for(const path of [geminiFirst,geminiOther]){
   assert.ok(length(path)<=95.001,`${hub}: Gemini permanece no limite local`);
   for(let i=1;i<path.length;i++){
    const a=graph.nearest([path[i-1].x,path[i-1].y]),b=graph.nearest([path[i].x,path[i].y]);
    assert.ok(a.distance<.01&&b.distance<.01,`${hub}: vértices Gemini nas ruas`);
    assert.ok(graph.nodes[a.id].neighbours.some(e=>e.id===b.id),`${hub}: ligação Gemini pertence ao grafo`);
   }
  }
 }
});

test('movimento amostrado permanece contínuo e respeita pausas de retorno',()=>{
 for(const {hub,secondary:friend} of cases){
  const def=secondary.RESIDENTS.find(p=>p.id===friend),anchor=map.landmarks.find(p=>p.id===hub).p;
  const path=street.itinerary(graph,anchor,def.variant),metres=length(path);
  for(let phase=0;phase<2*metres+18;phase+=.3){
   const a=street.sample(path,phase),b=street.sample(path,phase+.1);
   assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.11,`${friend}: sem salto na caminhada`);
  }
  assert.equal(street.sample(path,0).walking,false);
  assert.equal(street.sample(path,5).walking,false);
 }
});

test('a mudança de itinerário não modifica horários nem campos salvos',()=>{
 const snapshot=JSON.stringify(world.fresh());
 for(const id of ['damiao','lucia','bia']){
  const clock=world.fresh();clock.minute=9*60;
  assert.equal(typeof world.agenda(clock,id).present,'boolean');
 }
 assert.equal(JSON.stringify(world.fresh()),snapshot);
});
