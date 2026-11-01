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
const api=vm.runInNewContext(source+';({nearestRoad,nearestRoadExhaustive,nearestRoadIndexed,prepareNearestRoadIndex})',
 {Math,segments,nearestRoadIndex:null,treeRoadIndex:null});
const index=api.prepareNearestRoadIndex(segments);
const points=[];
for(const hub of [map.start,...map.landmarks.map(p=>p.p)]){
 for(let dx=-200;dx<=200;dx+=23)for(let dy=-160;dy<=160;dy+=29)
  points.push([hub[0]+dx,hub[1]+dy]);
}
// Cell borders, exact segment endpoints/midpoints, and narrow perturbations.
for(const s of segments.filter((_,i)=>i%17===0))for(const t of [0,.5,1]){
 const x=s.ax+s.dx*t,y=s.ay+s.dy*t;
 for(const offset of [0,-1e-8,1e-8])points.push([x+offset,y-offset]);
}
for(let i=-12;i<=12;i++)for(let j=-8;j<=8;j++)points.push([i*64,j*64]);
// Deterministic points outside mapped neighborhoods and near rural references.
for(let i=0;i<1480;i++){
 const x=(((i*7919)%401)-200)*17+(.5*(i%3));
 const y=(((i*3571)%383)-191)*17+(.25*(i%5));
 points.push([x,y]);
}

test('C20.3.4: road index preserves exact segment, distance, projection and tie order',()=>{
 let checked=0;
 for(const [x,y] of points){
  const original=api.nearestRoadExhaustive(x,y),indexed=api.nearestRoadIndexed(x,y,index);
  assert.strictEqual(indexed.s,original.s,`segment at ${x},${y}`);
  for(const property of ['d','x','y','t'])
   assert.equal(indexed[property],original[property],`${property} at ${x},${y}`);
  checked++;
 }
 assert.ok(checked>5000);
 console.info(`C20.3.4: ${checked} deterministic road queries matched exactly across ${segments.length} segments.`);
});

test('C20.3.4: indexed query benchmark is separate from Chromium frames',()=>{
 const sample=points.filter((_,i)=>i%7===0);
 const time=fn=>{
  const start=process.hrtime.bigint();
  let total=0;
  for(const [x,y] of sample)total+=fn(x,y).d;
  return { ms:Number(process.hrtime.bigint()-start)/1e6,total };
 };
 const original=time(api.nearestRoadExhaustive),indexed=time((x,y)=>api.nearestRoadIndexed(x,y,index));
 assert.equal(indexed.total,original.total);
 console.info(`C20.3.4 nearestRoad: ${sample.length} queries exhaustive=${original.ms.toFixed(2)}ms indexed=${indexed.ms.toFixed(2)}ms.`);
});
