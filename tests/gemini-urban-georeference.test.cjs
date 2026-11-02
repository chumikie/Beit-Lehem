'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');
const {composeCurrentMap,extractEmbeddedMap,projectCoordinate}=require('../scripts/current-geodata.cjs');

const root=path.resolve(__dirname,'..');
const osm=JSON.parse(fs.readFileSync(path.join(root,'source/belem-osm-2026.geojson'),'utf8'));
const templateHtml=fs.readFileSync(path.join(root,'references/gemini-2026-10-31/experimento-anonimizado.html.txt'),'utf8');
const map=composeCurrentMap(osm,extractEmbeddedMap(templateHtml));
const game=fs.readFileSync(path.join(root,'gemini-modules/game.js'),'utf8');

function nearestRoadDistance(point){
 let nearest=Infinity;
 for(const road of map.roads)for(let i=1;i<road.p.length;i++){
  const a=road.p[i-1],b=road.p[i],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
  if(len2<=0)continue;
  const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/len2));
  nearest=Math.min(nearest,Math.hypot(point[0]-a[0]-t*dx,point[1]-a[1]-t*dy));
 }
 return nearest;
}

test('projeção direta e GPS inverso mantêm o mesmo sinal de Y',()=>{
 const project=(lat,lon)=>projectCoordinate([lon,lat],map.projection);
 const gameFunction=game.slice(game.indexOf('function gpsFor(p)'),game.indexOf('\nfunction locationLinks',game.indexOf('function gpsFor(p)')));
 assert.match(gameFunction,/originLat-p\[1\]\/proj\.metersPerDegreeLat/);
 const gpsFor=vm.runInNewContext(gameFunction+';gpsFor',{data:{projection:map.projection}});
 for(const [lat,lon] of [[-6.6984919,-35.5472188],[-6.7129197,-35.5237656]]){
  const projected=project(lat,lon),restored=gpsFor(projected);
  assert.ok(Math.abs(restored.lat-lat)<1e-7);
  assert.ok(Math.abs(restored.lon-lon)<1e-7);
 }
 const pedra=project(-6.6984919,-35.5472188);
 const parque=project(-6.7129197,-35.5237656);
 assert.ok(pedra[1]>0&&parque[1]>0,'latitudes ao sul da origem produzem Y positivo');
 assert.ok(Math.abs(pedra[0]-(-1134.22))<.02);
 assert.ok(Math.abs(pedra[1]-192.80)<.02);
 assert.ok(Math.abs(parque[0]-1458.78)<.02);
 assert.ok(Math.abs(parque[1]-1798.90)<.02);
});

test('distâncias aos eixos OSM detectam a alternativa espelhada incorreta',()=>{
 const pedra=projectCoordinate([-35.5472188,-6.6984919],map.projection);
 const parque=projectCoordinate([-35.5237656,-6.7129197],map.projection);
 const pedraInverted=[pedra[0],-pedra[1]],parqueInverted=[parque[0],-parque[1]];
 assert.ok(nearestRoadDistance(pedra)>640&&nearestRoadDistance(pedra)<660);
 assert.ok(nearestRoadDistance(pedraInverted)>790&&nearestRoadDistance(pedraInverted)<815);
 assert.ok(nearestRoadDistance(parque)>330&&nearestRoadDistance(parque)<350);
 assert.ok(nearestRoadDistance(parqueInverted)<1);
});

test('a composição e a auditoria não alteram as coordenadas OSM de ruas e áreas',()=>{
 const sourceRoads=new Map(osm.features.filter(f=>f.geometry?.type==='LineString'&&f.properties?.highway)
  .map(f=>[f.properties['@id'],f]));
 for(const road of map.roads){
  const source=sourceRoads.get(road.id);assert.ok(source);
  for(let i=0;i<road.p.length;i++){
   const projected=projectCoordinate(source.geometry.coordinates[i],map.projection);
   assert.deepEqual(road.p[i],projected);
  }
 }
 assert.equal(map.roads.length,462);
 assert.equal(map.areas.length,20);
 assert.equal(map.points.length,9);
});
