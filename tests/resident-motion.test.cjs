const assert=require('node:assert/strict');
const {buildGraph}=require('../dist/pathfinding.js');
const {create}=require('../dist/resident-motion.js');

// An intersection forces a visible corner rather than a straight-line jump
// across a block or a map coordinate switch.
const graph=buildGraph([{p:[[0,0],[0,30],[90,30],[90,0]]}]);
const motion=create(graph);
const actor=(x,y,extra={})=>({id:'cica',x,y,walking:true,variant:1,...extra});
const start=motion.resolve(actor(0,0),0,1);
assert.deepEqual([start.x,start.y],[0,0]);
const entering=motion.resolve(actor(90,0,{travel:true,meeting:true}),.08,1);
assert(entering.arriving,'large position change must become an arrival transition');
assert(entering.x<3&&entering.y>0&&entering.y<10,'first movement must follow the source street, not jump over a house');
let current=entering,last=entering;
for(let i=2;i<90;i++){
 current=motion.resolve(actor(90,0,{travel:true,meeting:true}),i*.08,1);
 assert(Math.hypot(current.x-last.x,current.y-last.y)<=4,'no per-frame teleportation on encounter route');
 last=current;
}
assert(Math.hypot(current.x-90,current.y)<.1,'resident must eventually arrive at a conversation');
assert.equal(current.arriving,false,'arrival animation must finish');
assert(Number.isFinite(current.heading)&&current.stridePhase>0,'visible facing and foot rhythm follow travelled distance');
const dayReset=motion.resolve(actor(20,0),9,2);
assert.equal(dayReset.x,20,'new day resumes at the scheduled street without carrying old transitions');
// No crossing an unconnected street gap by snapping or direct walking.
const separated=buildGraph([{p:[[0,0],[0,20]]},{p:[[100,0],[100,20]]}]);
const disconnectedMotion=create(separated);
disconnectedMotion.resolve(actor(0,0),0,1);
for(let i=1;i<=20;i++){
 const frame=disconnectedMotion.resolve(actor(100,0,{travel:true}),i*.08,1);
 assert.deepEqual([frame.x,frame.y],[0,0],'disconnected roads must not teleport or cut across a block');
 assert.equal(frame.walking,false,'blocked resident remains visibly stationary');
}
motion.clear();
assert.equal(motion.snapshot().length,0);
console.log('V2.23 movement: road-corner approach, frame continuity, arrival, gaze, day change OK');
