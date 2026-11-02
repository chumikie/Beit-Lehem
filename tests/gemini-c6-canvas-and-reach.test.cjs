'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const projection=game.slice(game.indexOf('function canvasWorldPoint('),game.indexOf('\nfunction clickWorld('));
const canvasWorldPoint=vm.runInNewContext(projection+';canvasWorldPoint',{Math});
const reachSource=game.slice(game.indexOf('function speakerWithinReach('),game.indexOf('\nfunction gpsFor('));

test('C6: clique acompanha a escala exibida durante zoom out e zoom in',()=>{
 const rect={left:14,top:27},camera={x:120,y:-65},w=390,h=844;
 for(const displayed of [.65,.82,1.4,2.3,3.5]){
  const desired={x:171,y:-24};
  const screen={x:rect.left+w/2+(desired.x-camera.x)*displayed,
   y:rect.top+h/2+(desired.y-camera.y)*displayed};
  const point=canvasWorldPoint(screen.x,screen.y,rect,w,h,camera,displayed);
  assert.ok(Math.hypot(point.x-desired.x,point.y-desired.y)<1e-8);
 }
 // At a zoom-animation midpoint, the previous target-zoom formula misses.
 const desired=171,screen=rect.left+w/2+(desired-camera.x)*1.4;
 assert.ok(Math.abs((screen-rect.left-w/2)/.65+camera.x-desired)>20);
});

test('C6: conversa respeita limite, componente desconectado e fachada',()=>{
 let player={x:0,y:0},blocked=false,component=1;
 const context={Math,get player(){return player;},
  pathfinder:{nearest:p=>({component:p[0]>10?component:1})},
  blockedByHouse:()=>blocked,nearestRoad:()=>({d:20})};
 const reach=vm.runInNewContext(reachSource+';speakerWithinReach',context);
 assert.equal(reach({x:9,y:0,secondary:true}),true);
 assert.equal(reach({x:44,y:0,secondary:true}),false);
 component=2;
 assert.equal(reach({x:20,y:0,secondary:true}),false);
 component=1;blocked=true;
 assert.equal(reach({x:20,y:0,secondary:true}),false);
 blocked=false;
 assert.equal(reach({x:20,y:0,secondary:true}),true);
});
