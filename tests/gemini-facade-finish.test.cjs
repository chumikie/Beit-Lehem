'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function house(c,b){');
const end=source.indexOf('function region(',start);
assert.ok(start>=0&&end>start,'house drawing function must be available');

function paintedHouse(seed,zoom){
 const layers=[];
 const ctx={save(){},restore(){},translate(){},rotate(){},beginPath(){},ellipse(){},arc(){},fill(){},moveTo(){},lineTo(){},stroke(){layers.push({stroke:true});},fillRect(){layers.push({rect:true});},closePath(){}};
 const draw=vm.runInNewContext(source.slice(start,end)+';house',{
  zoom,detailedFacades:false,
  roundRect:(_c,x,y,width,height,radius,fill,stroke)=>layers.push({x,y,width,height,radius,fill,stroke})
 });
 const house={x:37,y:54,w:24,h:16,seed,color:seed%5};
 draw(ctx,house);
 assert.deepEqual([house.x,house.y,house.w,house.h],[37,54,24,16], 'illustration must not change geography');
 return layers;
}

test('wall and roof treatments vary deterministically between nearby houses',()=>{
 const colors=new Set();
 for(let seed=0;seed<12;seed++){
  const before=paintedHouse(seed,1.85),again=paintedHouse(seed,1.85);
  assert.deepEqual(before,again,'same seed must yield the same illustration');
  colors.add(before.find(layer=>layer.width===24&&layer.height>=7&&layer.height<=10)?.fill);
 }
 assert.ok(colors.size>=3,'adjacent houses should not all have the same wall color');
});

test('distant roofs omit small decoration without losing silhouette',()=>{
 const distant=paintedHouse(7,.9),near=paintedHouse(7,1.85);
 assert.ok(near.length>distant.length,'close view provides additional depth detail');
 assert.ok(distant.some(layer=>layer.width===26),'roof remains present from afar');
});

test('roof may follow the parcel but doors and windows remain upright on screen',()=>{
 const section=source.slice(start,end);
 assert.match(section,/c\.rotate\(roofAngle\)/);
 assert.match(section,/Math\.max\(-\.42,Math\.min\(\.42,roofBearing\)\)/);
 assert.doesNotMatch(section,/c\.scale\(1,-1\)/);
 assert.ok(section.indexOf('c.restore();\n // A 7–10 px vertical')>section.indexOf('c.rotate(roofAngle)'),
  'roof transform ends before the front wall');
 assert.match(section,/wallHeight=7\+\(b\.seed%4\)/);
 assert.match(section,/frontY\+1\.5/);
});

test('denser decorative lots preserve the street coordinates and save format',()=>{
 const preprocess=source.slice(source.indexOf('function preprocess('),source.indexOf('function house('));
 assert.match(preprocess,/step=isClovisArea\?17:21/);
 assert.match(preprocess,/w:13\+r\*7/);
 assert.match(preprocess,/nearestRoad\(x,y\)\.d/);
 assert.match(preprocess,/occupied\.some\(/);
 const house=source.slice(start,end);
 assert.match(house,/edge\+side\*3\.5/);
 assert.doesNotMatch(house,/data\.roads\s*=|localStorage|(?<!\.)save\(/);
});
