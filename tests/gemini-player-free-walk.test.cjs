'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function smoothWalkVelocity(');
const end=source.indexOf('\n}',start)+2;
assert.ok(start>=0&&end>start);
const smooth=new Function(source.slice(start,end)+'\nreturn smoothWalkVelocity;')();

test('walking accelerates and stops progressively, with no lingering drift',()=>{
 let v={x:0,y:0};
 v=smooth(v,{x:67,y:0},.016);
 assert.ok(v.x>0&&v.x<67);
 for(let i=0;i<40;i++)v=smooth(v,{x:67,y:0},.016);
 assert.ok(v.x>66&&v.x<=67);
 const before=v.x;
 v=smooth(v,{x:0,y:0},.016);
 assert.ok(v.x>0&&v.x<before);
 for(let i=0;i<60;i++)v=smooth(v,{x:0,y:0},.016);
 assert.deepEqual(v,{x:0,y:0});
});

test('turning blends direction without reversing instantaneously',()=>{
 const next=smooth({x:67,y:0},{x:0,y:-67},.016);
 assert.ok(next.x>0&&next.x<67);
 assert.ok(next.y<0&&next.y>-67);
});

test('reduced-motion preference changes velocity immediately',()=>{
 assert.deepEqual(smooth({x:67,y:0},{x:0,y:-67},.016,true),{x:0,y:-67});
 assert.deepEqual(smooth({x:12,y:9},{x:0,y:0},.016,true),{x:0,y:0});
});

test('a curva de 90 graus de uma rota não arrasta a corrida para além da esquina',()=>{
 const points=[{x:0,y:30},{x:30,y:30}];
 let position={x:0,y:0},velocity={x:0,y:0},index=0,overshoot=0;
 for(let frame=0;frame<100;frame++){
  let dx=0,dy=0;
  while(index<points.length){
   const p=points[index],distance=Math.hypot(p.x-position.x,p.y-position.y);
   if(distance>3){dx=(p.x-position.x)/distance;dy=(p.y-position.y)/distance;break;}
   index++;
  }
  velocity=smooth(velocity,{x:dx*105,y:dy*105},.016);
  position={x:position.x+velocity.x*.016,y:position.y+velocity.y*.016};
  if(index===1&&position.x<12)overshoot=Math.max(overshoot,Math.abs(position.y-30));
 }
 assert.ok(overshoot<3,'corrida deve contornar a esquina com menos de 3 m de desvio');
 assert.ok(Math.hypot(position.x-30,position.y-30)<4,'a rota ainda termina perto do destino');
});

test('câmera, toque e teclado mantêm suas regras durante e depois da caminhada',()=>{
 const fragment=source.slice(source.indexOf('function cameraFollowBlend('),source.indexOf('let ambientSoundSeconds='));
 const follow=new Function(fragment+';return cameraFollowBlend;')();
 assert.equal(follow(.016,false,true),0,'janela aberta congela a câmera');
 assert.ok(follow(.016,false,false)>0&&follow(.016,false,false)<1);
 assert.equal(follow(.016,true,false),1,'movimento reduzido mantém resposta imediata');
 assert.match(source,/for\(const direction of touches\.values\(\)\)/);
 assert.match(source,/if\(dx\|\|dy\)\{waypoint=null;\}/);
});

test('movement keeps route, keyboard, touch, collisions, bounds and save contract',()=>{
 assert.match(source,/if\(dx\|\|dy\)\{waypoint=null;\}/);
 assert.match(source,/for\(const direction of touches\.values\(\)\)/);
 assert.match(source,/const onMappedRoute=!!waypoint/);
 assert.match(source,/mayAdvanceOnMappedRoute\(xBlocked/);
 assert.match(source,/mayAdvanceOnMappedRoute\(yBlocked/);
 assert.match(source,/Math\.max\(data\.bounds\[0\],Math\.min\(data\.bounds\[2\]/);
 assert.doesNotMatch(source.slice(source.indexOf('function save(){'),source.indexOf('function notify(')),/walkVelocity/);
});
