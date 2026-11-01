'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function streetPetNameplateVisible(');
const end=source.indexOf('function streetPetNameplateSlot(',start);
assert.ok(start>=0&&end>start,'nameplate helpers must remain a distinct rendering section');
const helpers=vm.runInNewContext(source.slice(start,end)+';({streetPetNameplateVisible,streetPetNameplateSelection})',{Math});

const pets=[
 {id:'bolt',name:'Bolt',bolt:true,variant:5},
 {id:'catito',name:'Catito',variant:10},
 {id:'artemis',name:'Ártemis',variant:11},
 {id:'mimi',name:'Mimi',variant:12},
 {id:'hani',name:'Hani',variant:13},
 {id:'jekki',name:'Jekki',variant:14}
];
const companions=[
 {at:{x:80,y:80}},
 {at:{x:6,y:0}},
 {at:{x:1,y:0}},
 {at:{x:9,y:0}},
 {at:{x:16,y:0}},
 {at:{x:24,y:0}}
];
const view={left:-100,right:100,top:-100,bottom:100};
const player={x:0,y:0};

test('C15.6: desktop keeps Bolt plus the two nearest named pets, with a strict three-label budget',()=>{
 const snapshot=JSON.stringify({pets,companions});
 const selected=helpers.streetPetNameplateSelection(pets,companions,view,player,2.5,false,true);
 assert.deepEqual(Array.from(selected),['bolt','artemis','catito']);
 assert.equal(selected.length,3);
 assert.equal(JSON.stringify({pets,companions}),snapshot,'ranking must not mutate candidates or route points');
});

test('C15.6: compact composition shows only Bolt, never a chain of pet nameplates',()=>{
 const selected=helpers.streetPetNameplateSelection(pets,companions,view,player,2.5,true,true);
 assert.deepEqual(Array.from(selected),['bolt']);
 assert.equal(helpers.streetPetNameplateSelection(pets,companions,view,player,1.9,true,true).length,0);
});

test('C15.6: off-screen animals cannot consume the label budget',()=>{
 const points=companions.map((entry,index)=>index===0?{at:{x:500,y:500}}:entry);
 const selected=helpers.streetPetNameplateSelection(pets,points,view,player,2.5,false,true);
 assert.deepEqual(Array.from(selected),['artemis','catito','mimi']);
});

test('C15.6: the existing night draw rule still suppresses named pets outside the night walker',()=>{
 const selected=helpers.streetPetNameplateSelection(pets,companions,view,player,3,false,false);
 assert.deepEqual(Array.from(selected),[]);
});

test('C15.6: mobile encounter card is compact but keeps its notebook action',()=>{
 const hud=source.slice(source.indexOf('function setupMobileWalkingHud()'),source.indexOf('setupMobileWalkingHud();'));
 assert.match(hud,/\.street-pulse #streetResidentsHint,\.street-pulse #streetMomentHint,[\s\S]*\.street-pulse \.street-pulse-avatars\{display:none\}/);
 assert.match(hud,/\.street-pulse\{width:min\(176px,calc\(100vw - 30px\)\)/);
 assert.match(source,/\\$\\('streetPulse'\\)\\.onclick=showLife;/);
 assert.match(source,/function showLife\\(\\)\\{[\\s\\S]*?showDialog\\('lifeDialog'\\)/);
});
