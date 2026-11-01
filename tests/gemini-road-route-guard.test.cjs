'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const begin=source.indexOf('function mayAdvanceOnMappedRoute(');
const end=source.indexOf('\nfunction ',begin+9);
assert.ok(begin>=0&&end>begin,'road-route collision guard must exist');
const mayAdvance=vm.runInNewContext(source.slice(begin,end)+';mayAdvanceOnMappedRoute');

test('an unblocked step is always available',()=>{
 assert.equal(mayAdvance(false,false,120,120),true);
 assert.equal(mayAdvance(false,true,120,120),true);
});
test('C13.1: manual walking follows the road center under an illustrative house',()=>{
 assert.equal(mayAdvance(true,false,0,0),true);
 assert.equal(mayAdvance(true,false,3.9,3.9),true);
 assert.equal(mayAdvance(true,false,4.1,0),false);
 assert.equal(mayAdvance(true,false,0,4.1),false);
 assert.equal(mayAdvance(true,false,7,7),false);
});
test('auto-walking continues on a mapped road beneath an illustrative footprint',()=>{
 assert.equal(mayAdvance(true,true,0,0),true);
 assert.equal(mayAdvance(true,true,8.5,8.5),true);
});
test('a marked route cannot tunnel into houses away from mapped roads',()=>{
 assert.equal(mayAdvance(true,true,10,0),false);
 assert.equal(mayAdvance(true,true,0,10),false);
 assert.equal(mayAdvance(true,true,100,100),false);
});
test('both axes call the same guard without changing the player save schema',()=>{
 const movement=source.slice(source.indexOf('const onMappedRoute=!!waypoint;'),source.indexOf('if(dx)player.dir=',source.indexOf('const onMappedRoute=!!waypoint;')));
 assert.equal(movement.match(/mayAdvanceOnMappedRoute\(/g)?.length,2);
 assert.match(source,/player:\{x:player.x,y:player.y\}/);
});
