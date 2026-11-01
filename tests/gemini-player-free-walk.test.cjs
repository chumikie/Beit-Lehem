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

test('movement keeps route, keyboard, touch, collisions, bounds and save contract',()=>{
 assert.match(source,/if\(dx\|\|dy\)\{waypoint=null;\}/);
 assert.match(source,/for\(const direction of touches\.values\(\)\)/);
 assert.match(source,/const onMappedRoute=!!waypoint/);
 assert.match(source,/mayAdvanceOnMappedRoute\(xBlocked/);
 assert.match(source,/mayAdvanceOnMappedRoute\(yBlocked/);
 assert.match(source,/Math\.max\(data\.bounds\[0\],Math\.min\(data\.bounds\[2\]/);
 assert.doesNotMatch(source.slice(source.indexOf('function save(){'),source.indexOf('function notify(')),/walkVelocity/);
});
