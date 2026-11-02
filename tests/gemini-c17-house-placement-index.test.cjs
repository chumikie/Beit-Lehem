'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const scenicPlacement=require('../gemini-modules/scenic-placement.js');

const root=path.resolve(__dirname,'..');
const game=fs.readFileSync(path.join(root,'gemini-modules/game.js'),'utf8');
const map=JSON.parse(fs.readFileSync(path.join(root,'dist/map.json'),'utf8'));
const hashStart=game.indexOf('const hash=');
const hashEnd=game.indexOf('\nfunction affectionSnapshot(',hashStart);
const helperStart=game.indexOf('function pointSegment(');
const helperEnd=game.indexOf('function applyUserPublicPlaceCorrections(',helperStart);
assert.ok(hashStart>=0&&hashEnd>hashStart,'hash atual da geração de casas');
assert.ok(helperStart>=0&&helperEnd>helperStart,'helpers atuais de posicionamento de casas');

const roadSegments=[];
for(const road of map.roads)for(let i=1;i<road.p.length;i++){
 const a=road.p[i-1],b=road.p[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
 if(len<.05)continue;
 roadSegments.push({ax:a[0],ay:a[1],dx,dy,len2:len*len,len,road});
}
const context={
 Math,
 segments:roadSegments,
 treeRoadIndex:null,
 window:{RoncadorScenicPlacement:scenicPlacement}
};
const helpers=vm.runInNewContext(
 game.slice(hashStart,hashEnd)+'\n'+game.slice(helperStart,helperEnd)+
 ';({hash,pointSegment,prepareTreeRoadIndex,roadTooClose,treeRoadTooClose,'+
 'createHouseOccupancyGrid,houseOccupancyTooClose,addHouseOccupancyPoint,'+
 'generateHouseCandidates,selectHouseCandidates})',
 context
);

test('C17: índice de ruas preserva limites estritos, células negativas e fronteiras',()=>{
 const sample=[
  {ax:-96,ay:0,dx:64,dy:0,len2:4096,len:64,road:{tags:{highway:'residential'}}},
  {ax:32,ay:0,dx:64,dy:0,len2:4096,len:64,road:{tags:{highway:'residential'}}}
 ];
 const index=helpers.prepareTreeRoadIndex(sample);
 const cases=[
  [-64,22,22],[-64,21.999,22],[-64,22.001,22],
  [64,11.5,11.5],[64,11.499,11.5],[64,11.501,11.5],
  [-64,14.5,14.5],[-64,14.499,14.5],[-64,14.501,14.5]
 ];
 for(const [x,y,clearance] of cases){
  const exhaustive=sample.some(segment=>helpers.pointSegment(x,y,segment).d<clearance);
  assert.equal(helpers.roadTooClose(x,y,clearance,index),exhaustive,JSON.stringify([x,y,clearance]));
 }
 assert.equal(helpers.treeRoadTooClose(-64,22,index),false);
 assert.equal(helpers.treeRoadTooClose(-64,21.999,index),true);
});

test('C17: grade de ocupação busca células vizinhas e mantém o operador <',()=>{
 const grid=helpers.createHouseOccupancyGrid(32);
 helpers.addHouseOccupancyPoint(grid,31.5,-0.5);
 assert.equal(helpers.houseOccupancyTooClose(32.5,-0.5,14.5,grid),true,
  'casas em células adjacentes devem continuar colidindo');
 assert.equal(helpers.houseOccupancyTooClose(49.5,-0.5,18,grid),false,
  'distância exatamente igual a 18 não é colisão');

 const negative=helpers.createHouseOccupancyGrid(32);
 helpers.addHouseOccupancyPoint(negative,-32.5,-32.5);
 assert.equal(helpers.houseOccupancyTooClose(-31.5,-31.5,14.5,negative),true,
  'floor deve tratar coordenadas negativas sem truncar em direção a zero');

 const exact=helpers.createHouseOccupancyGrid(32);
 helpers.addHouseOccupancyPoint(exact,100,0);
 assert.equal(helpers.houseOccupancyTooClose(114.5,0,14.5,exact),false);
 assert.equal(helpers.houseOccupancyTooClose(114.499,0,14.5,exact),true);
});

test('C17: lista ordenada de candidatos e casas selecionadas é idêntica à busca exaustiva',()=>{
 const index=helpers.prepareTreeRoadIndex(roadSegments);
 const baselineMetrics={roadSegmentChecks:0,occupiedHouseChecks:0};
 const indexedMetrics={roadSegmentChecks:0,occupiedHouseChecks:0};
 const center=map.urbanCenter||map.start;
 const sceneList=scenicPlacement.layout(map);
 const baseline=helpers.generateHouseCandidates(
  roadSegments,center,sceneList,map.areas,index,helpers.hash,false,baselineMetrics
 );
 const indexed=helpers.generateHouseCandidates(
  roadSegments,center,sceneList,map.areas,index,helpers.hash,true,indexedMetrics
 );
 assert.ok(baseline.length>0,'a malha de referência precisa produzir casas');
 assert.equal(JSON.stringify(indexed),JSON.stringify(baseline),
  'ordem, coordenadas, ângulos, seeds e atributos de cada candidato devem permanecer idênticos');

 const baselineHouses=helpers.selectHouseCandidates(baseline,map);
 const indexedHouses=helpers.selectHouseCandidates(indexed,map);
 assert.equal(JSON.stringify(indexedHouses),JSON.stringify(baselineHouses),
  'a lista final selecionada para renderização deve permanecer idêntica');
 assert.ok(indexedMetrics.roadSegmentChecks<baselineMetrics.roadSegmentChecks,
  'o índice deve reduzir cálculos ponto-segmento');
 assert.ok(indexedMetrics.occupiedHouseChecks<baselineMetrics.occupiedHouseChecks,
  'a grade deve reduzir comparações com casas já aceitas');
});
