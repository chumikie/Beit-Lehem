'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const map=require('../dist/map.json');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const segments=[];
for(const road of map.roads)for(let i=1;i<road.p.length;i++){
 const a=road.p[i-1],b=road.p[i],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
 if(len2>=.0025)segments.push({ax:a[0],ay:a[1],dx,dy,len2,len:Math.sqrt(len2),road});
}
const source=game.slice(game.indexOf('function pointSegment('),game.indexOf('function inside('));
const context={Math,segments,treeRoadIndex:null};
const api=vm.runInNewContext(source+';({nearestRoad,prepareTreeRoadIndex,treeRoadTooClose})',context);
const index=api.prepareTreeRoadIndex(segments);

test('C10: índice preserva exatamente a reserva de 22 unidades em todo o território',()=>{
 let checked=0;
 for(const hub of [map.start,...map.landmarks.map(l=>l.p)])for(let x=hub[0]-450;x<hub[0]+450;x+=31)for(let y=hub[1]-320;y<hub[1]+320;y+=29){
  assert.equal(api.treeRoadTooClose(x,y,index),api.nearestRoad(x,y).d<22,`posição ${x},${y}`);checked++;
 }
 for(const s of segments.filter((_,i)=>i%103===0))for(const offset of [-22.1,-22,-21.9,0,21.9,22,22.1]){
  const x=s.ax+s.dx*.5-s.dy/s.len*offset,y=s.ay+s.dy*.5+s.dx/s.len*offset;
  assert.equal(api.treeRoadTooClose(x,y,index),api.nearestRoad(x,y).d<22,`limite ${offset}`);checked++;
 }
 assert.ok(checked>2000);
});

test('C10: custo do zoom distante reduz consultas sem alterar desenho ou salvamento',()=>{
 const points=[],center=map.start,zoom=.65;
 for(let gx=Math.floor((center[0]-1280/(2*zoom))/45);gx<(center[0]+1280/(2*zoom))/45;gx++)
  for(let gy=Math.floor((center[1]-800/(2*zoom))/45);gy<(center[1]+800/(2*zoom))/45;gy++)points.push([gx*45,gy*45]);
 const timed=fn=>{const start=process.hrtime.bigint();let n=0;for(const p of points)if(fn(...p))n++;return {n,ms:Number(process.hrtime.bigint()-start)/1e6};};
 const original=timed((x,y)=>api.nearestRoad(x,y).d<22);
 const indexed=timed((x,y)=>api.treeRoadTooClose(x,y,index));
 assert.equal(indexed.n,original.n);
 assert.ok(index.cells.size>0);
 assert.match(game,/treeRoadIndex=prepareTreeRoadIndex\(segments\)/);
 assert.match(game,/!treeRoadTooClose\(x,y\)/);
 console.info(`C10: ${points.length} células, ${segments.length} segmentos, busca completa ${original.ms.toFixed(1)}ms, índice ${indexed.ms.toFixed(1)}ms (mesmas ${indexed.n} reservas).`);
});
