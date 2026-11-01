'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const street=require('../dist/street-life.js');
const {prepare}=require('../dist/road-details.js');
const greeting=require('../gemini-modules/street-greetings.js');
const moments=require('../gemini-modules/street-moments.js');

const graph=buildGraph(map.roads),junctions=prepare(map.roads,graph).junctions;
const pairs=[
 ['mercado','damiao',0,'cica',6,28],
 ['igreja','lucia',1,'nara',7,20],
 ['rodoviaria','bia',2,'teo',8,22]
];
const closeToJunction=(point,radius)=>junctions.some(j=>Math.hypot(j.x-point.x,j.y-point.y)<radius);
function positions(hub,idA,variantA,idB,variantB,shift,t){
 const anchor=map.landmarks.find(l=>l.id===hub).p;
 const a=street.itinerary(graph,anchor,variantA),b=street.itinerary(graph,anchor,variantB);
 return [
  {...street.sample(a,t*(.72+variantA*.07)+variantA*12+shift),id:idA,def:{name:idA}},
  {...street.sample(b,t*(.72+variantB*.07)+variantB*12),id:idB,def:{name:idB}}
 ];
}
function eligible(a,b,radius){
 const d=Math.hypot(a.x-b.x,a.y-b.y);
 if(d<23||d>64||closeToJunction(a,radius)||closeToJunction(b,radius))return false;
 const route=graph.route([a.x,a.y],[b.x,b.y]);
 return !!route&&Number.isFinite(route.distance)&&route.distance<=d*1.3+3;
}

test('malha real: o raio antigo bloqueava todos os encontros válidos nos três núcleos',()=>{
 for(const [hub,idA,vA,idB,vB,shift] of pairs){
  let old=0,accessible=0;
  for(let t=0;t<1000;t++){
   const [a,b]=positions(hub,idA,vA,idB,vB,shift,t);
   if(eligible(a,b,22))old++;
   if(eligible(a,b,12))accessible++;
  }
  assert.equal(old,0,`${hub}: reproduz o bloqueio por 22 m`);
  assert.ok(accessible>0,`${hub}: 12 m libera encontros conectados fora das esquinas`);
 }
});

test('cumprimentos surgem em ruas conectadas e preservam olhar, conversa e despedida',()=>{
 for(const [hub,idA,vA,idB,vB,shift] of pairs){
  const flow=greeting.create(graph);flow.setJunctions(junctions);
  let seen=false,stages=new Set();
  for(let t=0;t<1000;t+=.1){
   const people=positions(hub,idA,vA,idB,vB,shift,t);
   const ids=flow.apply(people,t,{day:1,minute:9*60+Math.floor(t/5)});
   if(ids.length){
    if(!seen)for(const p of people)assert.ok(!closeToJunction(p,12),`${hub}: encontro inicia fora do cruzamento protegido`);
    seen=true;
    for(const p of people){
     assert.ok(p.greeting&&p.social,`${hub}: gestos atribuídos aos dois moradores`);
     stages.add(p.greeting.stage);
    }
   }
  }
  assert.ok(seen,`${hub}: encontro espontâneo possível no grafo real`);
  assert.ok(stages.has('chat')&&stages.has('wave')&&stages.has('turn'),`${hub}: conversa e despedida completas`);
 }
});

test('pares próximos por linha reta mas separados por vias não recebem saudação',()=>{
 const flow=greeting.create(graph);flow.setJunctions([]);
 const people=[{id:'damiao',x:0,y:0,def:{name:'Francisco'}},{id:'cica',x:30,y:0,def:{name:'Ciça'}}];
 const separate=greeting.create({route:()=>({distance:400})});separate.setJunctions([]);
 assert.deepEqual(separate.apply(people,20,{day:1,minute:540}),[]);
 assert.equal(flow.snapshot(),null);
});

test('aglomeração impede conversa e mudança de horário não altera o relógio de cooldown',()=>{
 const straight={route:(from,to)=>({distance:Math.hypot(from[0]-to[0],from[1]-to[1])})};
 const flow=greeting.create(straight);flow.setJunctions([]);
 const pair=[{id:'damiao',x:0,y:0,def:{name:'Francisco'}},{id:'cica',x:38,y:0,def:{name:'Ciça'}}];
 assert.deepEqual(flow.apply([...pair,{id:'teo',x:19,y:0}],1,{day:1,minute:17*60}),[],
  'não iniciar conversa onde um terceiro morador ocupa a passagem');
 assert.deepEqual(flow.apply(pair,2,{day:1,minute:8*60+30}).slice().sort(),['cica','damiao'],
  'trocar a hora fictícia mantendo o tempo de simulação não bloqueia novos encontros');
 assert.ok(flow.snapshot());
 assert.deepEqual(flow.apply(pair,3,{day:2,minute:8*60+30}).slice().sort(),['cica','damiao'],
  'dia novo renova a elegibilidade sem reaproveitar encontro antigo');
});

test('um gesto cotidiano em andamento termina antes do cumprimento espontâneo',()=>{
 const graph={route:(a,b)=>({distance:Math.hypot(a[0]-b[0],a[1]-b[1])})};
 const flow=greeting.create(graph);flow.setJunctions([]);
 const pair=[{id:'damiao',x:0,y:0,def:{name:'Francisco'}},
  {id:'cica',x:38,y:0,def:{name:'Ciça'}}];
 assert.deepEqual(flow.apply([{...pair[0],pause:true,moment:{kind:'look'}},pair[1]],1,{day:1,minute:540}),[]);
 assert.equal(flow.snapshot(),null,'não interrompe a pausa para conversar');
 assert.deepEqual(flow.apply([pair[0],{...pair[1],moment:{kind:'ribbon'}}],1.5,{day:1,minute:540}),[]);
 assert.deepEqual(flow.apply(pair,2,{day:1,minute:540}).slice().sort(),['cica','damiao']);
 const stages=new Set();
 for(let t=2.1;t<8;t+=.1){
  const people=pair.map(p=>({...p}));flow.apply(people,t,{day:1,minute:540});
  for(const person of people)if(person.greeting)stages.add(person.greeting.stage);
 }
 assert.ok(stages.has('wave')&&stages.has('turn'),'despedida permanece completa');
 assert.deepEqual(flow.apply(pair,9,{day:1,minute:540}),[],'libera a dupla depois da despedida');
});

test('pausas naturais não eliminam todos os encontros das três duplas na malha real',()=>{
 for(const [hub,idA,vA,idB,vB,shift] of pairs){
  let free=0,available=0;
  for(let t=0;t<1000;t++){
   const people=positions(hub,idA,vA,idB,vB,shift,t);
   if(!eligible(people[0],people[1],12))continue;
   free++;
   const clock={day:1,minute:9*60+Math.floor(t/5)};
   if(people.every(p=>!moments.choose({...p,hub},t,clock)))available++;
  }
  assert.ok(free>0,hub+' tem posições conectadas antes do filtro de pausa');
  assert.ok(available>0,hub+' mantém oportunidades após respeitar gestos');
  assert.ok(available<=free);
 }
});
