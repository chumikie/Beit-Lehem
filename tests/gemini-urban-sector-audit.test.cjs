'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');
const {composeCurrentMap,extractEmbeddedMap}=require('../scripts/current-geodata.cjs');
const sectors=require('../gemini-modules/central-blocks.js');

const root=path.resolve(__dirname,'..');
const osm=JSON.parse(fs.readFileSync(path.join(root,'source/belem-osm-2026.geojson'),'utf8'));
const html=fs.readFileSync(path.join(root,'references/gemini-2026-10-31/experimento-anonimizado.html.txt'),'utf8');
const map=composeCurrentMap(osm,extractEmbeddedMap(html));
const game=fs.readFileSync(path.join(root,'gemini-modules/game.js'),'utf8');

function pointRoadDistance(point,roadNames){
 return sectors.distanceToNamedRoad(point[0],point[1],map,roadNames);
}
function distanceToLine(point,road){
 let best=Infinity;
 for(let i=1;i<road.p.length;i++){
  const a=road.p[i-1],b=road.p[i],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
  if(len2<=0)continue;
  const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/len2));
  best=Math.min(best,Math.hypot(point[0]-a[0]-t*dx,point[1]-a[1]-t*dy));
 }
 return best;
}

test('âncoras dos corredores ficam sobre as vias OSM com nomes literais',()=>{
 const canonicalNames=new Set(map.roads.map(road=>road.tags?.name).filter(Boolean));
 for(const block of sectors.BLOCKS.filter(item=>item.reference.type==='road')){
  for(const roadName of block.reference.names)assert.ok(canonicalNames.has(roadName),'nome OSM ausente: '+roadName);
  const midpoint=sectors.midpointOnNamedRoad(map,block.reference.names);
  assert.ok(midpoint&&midpoint.p.every(Number.isFinite),block.id+' deve ter âncora');
  assert.ok(pointRoadDistance(midpoint.p,block.reference.names)<.02,block.id+' não pode deslocar a âncora do eixo viário');
  const sourceRoad=map.roads.find(road=>road.id===midpoint.roadId);
  assert.ok(sourceRoad&&distanceToLine(midpoint.p,sourceRoad)<.02);
 }
});

test('o corredor Clovis não funde grafias ou vias de nomes diferentes',()=>{
 const clovis=sectors.BLOCKS.find(item=>item.id==='clovis');
 assert.deepEqual(clovis.reference.names,['Rua Clovis Bezerra','Rua Antônio Borges de Lima','Rua Antônio Alfredo Guedes']);
 assert.ok(!clovis.reference.names.includes('Rua Nunes'));
 assert.ok(!clovis.reference.names.includes('Rua Nunes Guedes'));
 assert.ok(!clovis.reference.names.includes('Rua Antônio Alfredo da Silva'));
 assert.ok(map.roads.some(road=>road.tags.name==='Rua Nunes'));
 assert.ok(map.roads.some(road=>road.tags.name==='Rua Antônio Alfredo da Silva'));
});

test('classificação de fachadas não depende de pinos locais sem posição confirmada',()=>{
 const originalLocal=map.landmarks.filter(item=>['sonho_doce','bar_prosa','escola_anita'].includes(item.id))
  .map(item=>({id:item.id,p:item.p.slice()}));
 const houses=sectors.BLOCKS.map((block,index)=>{
  const p=block.reference.type==='road'
   ?sectors.midpointOnNamedRoad(map,block.reference.names).p
   :map.landmarks.find(item=>item.id===block.reference.id).p;
  return{x:p[0]+.2,y:p[1]+.2,w:15,h:12,angle:.4,side:index%2?1:-1,seed:index};
 });
 const houseCoordinates=houses.map(h=>[h.x,h.y,h.w,h.h,h.angle,h.side]);
 const beforeRoads=JSON.stringify(map.roads.map(road=>({id:road.id,p:road.p})));
 const beforeAreas=JSON.stringify(map.areas.map(area=>area.p));
 const blocks=sectors.prepare(map,houses);
 assert.equal(blocks.length,6);
 for(const item of blocks.filter(item=>item.reference.type==='road')){
  assert.ok(item.at.every(Number.isFinite));
  assert.ok(pointRoadDistance(item.at,item.reference.names)<.02);
 }
 assert.deepEqual(houses.map(h=>[h.x,h.y,h.w,h.h,h.angle,h.side]),houseCoordinates);
 assert.equal(JSON.stringify(map.roads.map(road=>({id:road.id,p:road.p}))),beforeRoads);
 assert.equal(JSON.stringify(map.areas.map(area=>area.p)),beforeAreas);
 assert.deepEqual(originalLocal,map.landmarks.filter(item=>['sonho_doce','bar_prosa','escola_anita'].includes(item.id)).map(item=>({id:item.id,p:item.p})));
 const movedReferences=structuredClone(map);
 for(const item of movedReferences.landmarks)if(['sonho_doce','bar_prosa','escola_anita'].includes(item.id))item.p=[9000+item.p[0],9000+item.p[1]];
 const movedHouses=houses.map(h=>({...h}));
 const movedBlocks=sectors.prepare(movedReferences,movedHouses);
 assert.deepEqual(movedBlocks.map(({id,count,at})=>({id,count,at})),
  blocks.map(({id,count,at})=>({id,count,at})),
  'âncoras e contagens dos corredores não podem depender dos pinos locais não confirmados');
});

test('fachada ilustrada gira junto ao rumo viário e aponta para a rua conforme o lado',()=>{
 const start=game.indexOf('function house(c,b)');
 const end=game.indexOf('function houseVisualBounds(b)',start);
 assert.ok(start>=0&&end>start);
 const source=game.slice(start,end);
 const angleFor=vm.runInNewContext(
  'function angleFor(b){return (Number.isFinite(b.angle)?b.angle:0)+(b.side>0?Math.PI:0)};angleFor'
 );
 const heading=.72;
 assert.ok(Math.abs(angleFor({angle:heading,side:-1})-heading)<1e-12);
 assert.ok(Math.abs(angleFor({angle:heading,side:1})-(heading+Math.PI))<1e-12);
 assert.match(source,/c\.rotate\(streetAngle\)/);
 assert.match(source,/c\.rotate\(-streetAngle\)/);
 assert.match(game,/c\.rotate\(\(Number\.isFinite\(b\.angle\)\?b\.angle:0\)\+\(b\.side>0\?Math\.PI:0\)\)/);
});
