const assert=require('node:assert/strict');
const {choose,GESTURES}=require('../dist/street-moments.js');
const {create}=require('../dist/resident-motion.js');
const {openSlot}=require('../dist/crowd-flow.js');
const scene=require('../dist/encounter-choreography.js');
const community=require('../dist/street-community.js');

const day={day:1,minute:10*60};
for(const [id,config] of Object.entries(GESTURES)){
 const moment=choose({id},(33-config.offset+1)%33,day);
 assert.equal(moment.kind,config.kind,`${id} has a distinct daily gesture`);
 assert(moment.strength>.5,'body pose gently appears');
 assert.equal(choose({id,meeting:true},1,day),null,'meetings take priority over ambient poses');
 assert.equal(choose({id,travel:true},1,day),null,'travel must not pause for decoration');
}
assert.equal(choose({id:'nara'},10,{day:1,minute:22*60}),null,'night remains quiet');
const motion=create(null),actor=(x,pause=false)=>({id:'damiao',x,y:0,walking:true,pause});
motion.resolve(actor(0),0,1);
const held=motion.resolve(actor(5,true),.2,1);
assert.equal(held.x,0,'a roadside pause does not advance the character');
assert.equal(held.walking,false,'feet stop while the gesture happens');
const resumed=motion.resolve(actor(5),.3,1);
assert(resumed.x>0&&resumed.x<5,'walking resumes progressively from the same location');

const occupied=[{x:0,y:0},{x:14,y:0}];
const clear=openSlot(shift=>({x:shift,y:0}),occupied,[{x:-14,y:0}],12);
assert.equal(clear.x,29,'choose an open section of the original route and avoid a corner');
assert.equal(openSlot(shift=>({x:shift,y:0}),[],[],12).x,0,'do not displace solitary walkers');
assert.equal(openSlot(()=>null,[],[]),null,'no invented off-road fallback');

const event={...community.EVENTS[0],phase:'visit'};
const at=p=>scene.timeline({minute:event.start+event.approach+event.visit*p},event);
assert.equal(at(.89).farewellPose,'look');
assert.equal(at(.94).farewellPose,'wave');
assert.equal(at(.99).farewellPose,'turn');
const people=[{id:event.host,x:0,y:0,walking:false,heading:Math.PI},{id:event.visitor,x:35,y:0,walking:false,heading:0}];
scene.apply(people,{minute:event.start+event.approach+event.visit*.94},event);
assert.equal(people[0].social.pose,'wave','wave is visible before departure');
scene.apply(people,{minute:event.start+event.approach+event.visit*.99},event);
assert.equal(people[0].social.pose,'smile','arm lowers before turning away');
assert.equal(people[0].social.facing,-1,'final gaze follows the next walk rather than snapping to partner');
console.log('V2.24: daily pauses, resumed walking, clear street slots and farewell timing OK');
