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
 const ctx={save(){},restore(){},translate(){},rotate(){},scale(){},beginPath(){},ellipse(){},arc(){},fill(){},moveTo(){},lineTo(){},stroke(){layers.push({stroke:true});},fillRect(){layers.push({rect:true});},closePath(){}};
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

test('C11: roof, wall and doors stay upright regardless of street direction',()=>{
 const section=source.slice(start,end);
 assert.doesNotMatch(section,/c\.rotate\(b\.angle\)/);
 assert.doesNotMatch(section,/if\(b\.side===1\)c\.scale\(1,-1\)/);
 assert.doesNotMatch(section,/c\.rotate\(roofAngle\)/);
 assert.match(section,/wallHeight=7\+\(b\.seed%4\)/);
 assert.match(section,/frontY\+1\.5/);
});

test('C11: três camadas artísticas ficam verticais enquanto colisão mantém ângulo do lote',()=>{
 const base=source.slice(start,end);
 const studio=fs.readFileSync(require.resolve('../gemini-modules/facade-studio.js'),'utf8');
 const blocks=fs.readFileSync(require.resolve('../gemini-modules/central-blocks.js'),'utf8');
 const collision=source.slice(source.indexOf('function blockedByHouse('),source.indexOf('\nfunction mayAdvanceOnMappedRoute('));
 for(const detail of [base,studio,blocks]){
  assert.doesNotMatch(detail,/\.rotate\((?:b|home)\.angle\)/);
  assert.doesNotMatch(detail,/\.side===1\)c\.scale\(1,-1\)/);
 }
 assert.match(collision,/Math\.cos\(house\.angle\)/);
 assert.match(collision,/Math\.abs\(lx\)<house\.w\/2\+5/);
 // Every visible layer remains upright at horizontal, diagonal and vertical lots.
 for(const zoomLevel of [.65,1.15,1.85,2.85,3.5])for(const angle of [0,Math.PI/6,Math.PI/3,Math.PI/2,-Math.PI/3]){
  const transforms=[];
  const ctx={save(){},restore(){},translate(){},rotate:a=>transforms.push(a),scale(){},
   beginPath(){},ellipse(){},arc(){},fill(){},moveTo(){},lineTo(){},stroke(){},fillRect(){}};
  const draw=vm.runInNewContext(base+';house',{zoom:zoomLevel,detailedFacades:false,roundRect(){}});
  draw(ctx,{x:0,y:0,w:18,h:13,angle,side:1,seed:4,color:2});
  assert.deepEqual(transforms,[],'illustrated house remains screen-upright');
 }
});

test('denser decorative lots preserve the street coordinates and save format',()=>{
 const preprocess=source.slice(source.indexOf('function preprocess('),source.indexOf('function house('));
 const generation=source.slice(source.indexOf('function generateHouseCandidates('),source.indexOf('function selectHouseCandidates('));
 assert.match(preprocess,/treeRoadIndex=prepareTreeRoadIndex\(segments\)/);
 assert.match(preprocess,/generateHouseCandidates\(segments,center,scenicScenes,areas,treeRoadIndex\)/);
 assert.match(preprocess,/houses\.push\(\.\.\.selectHouseCandidates\(candidates,data\)\)/);
 assert.match(generation,/const step=isClovisArea\?17:21/);
 assert.match(generation,/w:13\+r\*7/);
 assert.match(generation,/roadTooClose\(x,y,roadClearance,roadIndex/);
 assert.match(generation,/houseOccupancyTooClose\(x,y,houseClearance,occupancyGrid/);
 assert.match(generation,/nearRoad=nearest<roadClearance/);
 assert.match(generation,/Math\.hypot\(x-p\[0\],y-p\[1\]\)<houseClearance/);
 const house=source.slice(start,end);
 assert.match(house,/edge\+side\*3\.5/);
 assert.doesNotMatch(house,/data\.roads\s*=|localStorage|(?<!\.)save\(/);
});
