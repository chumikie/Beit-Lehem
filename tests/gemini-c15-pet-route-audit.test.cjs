'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const street=require('../gemini-modules/street-life.js');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const petSource=source.slice(source.indexOf('function drawStreetPets('),source.indexOf('function drawPuddles('));
const pets=(petSource.match(/\{id:'[^']+'[^}]+\}/g)||[]).map(s=>({
 id:/id:'([^']+)'/.exec(s)[1],hub:/hub:'([^']+)'/.exec(s)[1],
 variant:Number(/variant:(\d+)/.exec(s)[1]),bolt:s.includes('bolt:true')
}));
const graph=buildGraph(map.roads);
const vm=require('node:vm');
const offsetSource=source.slice(source.indexOf('function streetPetVisualOffset('),source.indexOf('function drawCozyPetSprite('));
const groupOffset=vm.runInNewContext(offsetSource+';streetPetGroupOffset',{Math});
const anchors=new Map([['inicio',map.start],...map.landmarks.map(p=>[p.id,p.p])]);
const paths=new Map(pets.filter(p=>!p.bolt).map(p=>[p.id,street.itinerary(graph,anchors.get(p.hub),p.variant)]));
const boltRoute=graph.route(map.start,map.landmarks.find(p=>p.id==='mercado').p)?.points?.slice(0,-1);

function boltPoint(minute){
 if(!boltRoute||boltRoute.length<2)return street.sample(street.itinerary(graph,map.start,5),minute);
 const lengths=boltRoute.slice(1).map((p,i)=>Math.hypot(p.x-boltRoute[i].x,p.y-boltRoute[i].y));
 const total=lengths.reduce((s,n)=>s+n,0);
 const going=minute>=480&&minute<555,returning=minute>=600&&minute<675;
 let remaining=(going?(minute-480)/75:returning?1-(minute-600)/75:minute>=555&&minute<600?1:0)*total;
 for(let i=1;i<boltRoute.length;i++){
  const len=lengths[i-1],a=boltRoute[i-1],b=boltRoute[i];
  if(remaining<=len||i===boltRoute.length-1){const t=len?Math.min(1,remaining/len):0;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
  remaining-=len;
 }
 return boltRoute[0];
}
function point(p,elapsed,minute,phaseStep=12){return p.bolt?boltPoint(minute):street.sample(paths.get(p.id),elapsed*(.72+p.variant*.07)+p.variant*phaseStep);}

test('C15.4: compara espaçamentos de fase sem alterar o caminho de qualquer pet',()=>{
 const results=[];
 for(const phaseStep of [12,23,37,53,71,97,137]){
  let close=0,visualClose=0;
  for(let day=0;day<7;day++)for(let t=0;t<=720;t+=3){
   const minute=420+t,elapsed=day*1037+t*5;
   const positions=pets.map(p=>point(p,elapsed,minute,phaseStep));
   const companions=pets.map((pet,i)=>({id:pet.id,at:positions[i]}));
   const visual=positions.map((at,i)=>{const d=groupOffset(pets[i],at,companions,[]);return{x:at.x+d.x,y:at.y+d.y};});
   for(let i=0;i<pets.length;i++)for(let j=i+1;j<pets.length;j++){
    if(Math.hypot(positions[i].x-positions[j].x,positions[i].y-positions[j].y)<7)close++;
    if(Math.hypot(visual[i].x-visual[j].x,visual[i].y-visual[j].y)<7)visualClose++;
   }
  }
  results.push([phaseStep,close,visualClose]);
 }
 console.info('C15.4 comparativo <7 unidades:',results);
 assert.ok(results.every(([,count])=>Number.isInteger(count)));
 assert.ok(results[0][2]<results[0][1],'afastamento visual diminui aglomeração sem alterar rotas');
});

test('C15.4: deslocamento de desenho é contínuo, limitado e não muda posição mapeada',()=>{
 const pet={id:'goku',variant:17},at={x:20,y:30,walking:true},original=JSON.stringify(at);
 for(let d=0;d<=18;d+=.25){
  const companions=[{id:'goku',at},{id:'princesa',at:{x:20+d,y:30}}];
  const offset=groupOffset(pet,at,companions,[]);
  assert.ok(Math.hypot(offset.x,offset.y)<=9.00001);
  assert.ok(Number.isFinite(offset.x)&&Number.isFinite(offset.y));
 }
 assert.equal(JSON.stringify(at),original);
 assert.equal(JSON.stringify(groupOffset(pet,at,[{id:'goku',at}],[])),JSON.stringify({x:0,y:0}));
});
function distanceToRoute(point,route){
 let closest=Infinity;
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i],dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;
  const t=len2?Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/len2)):0;
  closest=Math.min(closest,Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy));
 }
 return closest;
}

test('C15.4: os 13 pets mantêm caminhos reais e continuidade, com amostragem de 7 dias',()=>{
 assert.equal(pets.length,13);
 let samples=0,near=0,veryNear=0,invalid=0,maxStep=0;const closePairs=new Map();
 for(const p of pets.filter(p=>!p.bolt)){
  const route=paths.get(p.id);
  assert.ok(route.length>=2,p.id+' tem itinerário OSM');
  assert.ok(route.every(n=>graph.nearest([n.x,n.y]).distance<.01),p.id+' itinerário conectado');
 }
 for(let day=0;day<7;day++){
 let previous=null;
 for(let t=0;t<=720;t+=3){
  const minute=420+t,elapsed=day*1037+t*5;
  const positions=pets.map(p=>point(p,elapsed,minute));
  for(let i=0;i<positions.length;i++){
   const p=positions[i];assert.ok(p&&Number.isFinite(p.x)&&Number.isFinite(p.y),pets[i].id+' coordenada válida');
   const route=pets[i].bolt?boltRoute:paths.get(pets[i].id);
   if(distanceToRoute(p,route)>.01)invalid++;
   if(previous)maxStep=Math.max(maxStep,Math.hypot(p.x-previous[i].x,p.y-previous[i].y));
   for(let j=i+1;j<positions.length;j++){
    const d=Math.hypot(p.x-positions[j].x,p.y-positions[j].y);
    if(d<15)near++;if(d<7){veryNear++;const key=pets[i].id+' / '+pets[j].id;closePairs.set(key,(closePairs.get(key)||0)+1);}
   }
  }
  previous=positions;
  samples++;
 }
 }
 assert.equal(invalid,0,'nenhum pet abandona o corredor viário');
 console.info(`C15.4: ${samples} instantes, ${near} pares <15 unidades, ${veryNear} pares <7 unidades, passo máximo ${maxStep.toFixed(1)} unidades/3 min; ${pets.length} pets.`);
 console.info('C15.4 pares próximos:',[...closePairs.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8));
 assert.ok(maxStep<45,'continuidade por amostra de três minutos');
});
