'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function streetPetBehavior('),end=source.indexOf('function drawStreetPets(',start);
assert.ok(start>=0&&end>start);
const behavior=new Function('boltRestingByGreen',source.slice(start,end)+';return streetPetBehavior;')(()=>false);
test('Bolt mantém passeio vivo e pausa sem trocar de coordenadas',()=>{
 const walking=behavior({bolt:true,cat:false},{x:5,y:8,walking:true},9*60,'sol');
 const waiting=behavior({bolt:true,cat:false},{x:5,y:8,walking:false},9*60,'chuvisco');
 assert.equal(walking.resting,false);assert.equal(waiting.resting,true);
 assert.ok(walking.bounce>waiting.bounce);
});
test('gato fica tranquilo à noite e retomada de caminhada preserva movimento',()=>{
 const cat={bolt:false,cat:true},at={x:2,y:3,walking:false};
 const night=behavior(cat,at,22*60,'sol');
 assert.equal(night.resting,true);
 assert.equal(behavior(cat,{...at,walking:true},22*60,'sol').resting,false);
});
