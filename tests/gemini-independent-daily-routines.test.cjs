'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const living=require('../gemini-modules/living-world.js');
const {create}=require('../gemini-modules/resident-motion.js');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');

test('Ciça e Nara variam manhã e tarde entre dias sem mudar horas ou local',()=>{
 for(const id of ['cica','nara']){
  const def=neighbors.RESIDENTS.find(p=>p.id===id);
  const morning=[1,2,3].map(day=>neighbors.agenda({day,minute:9*60},def));
  const afternoon=[1,2,3].map(day=>neighbors.agenda({day,minute:15*60},def));
  assert.equal(new Set(morning.map(d=>d.activity)).size,3,id+' manhã');
  assert.equal(new Set(afternoon.map(d=>d.activity)).size,3,id+' tarde');
  for(const duty of [...morning,...afternoon]){
   assert.equal(duty.present,true);
   assert.equal(duty.hub,def.hub);
  }
  assert.equal(neighbors.agenda({day:2,minute:7*60},def).present,false);
  assert.equal(neighbors.agenda({day:2,minute:18*60},def).present,false);
 }
 assert.equal(neighbors.agenda({day:7,minute:9*60},neighbors.RESIDENTS.find(p=>p.id==='cica')).present,false);
});

test('pausa da agenda impede deslizamento e caminhada recomeça no mesmo caminho',()=>{
 const motion=create(null);
 motion.resolve({id:'cica',x:0,y:0,walking:true},0,1);
 const pause=motion.resolve({id:'cica',x:7,y:0,walking:false,pause:true},.05,1);
 assert.equal(pause.x,0);
 assert.equal(pause.walking,false);
 const moving=motion.resolve({id:'cica',x:7,y:0,walking:true,pause:false},.10,1);
 assert.ok(moving.x>0&&moving.x<7);
 assert.equal(moving.walking,true);
 assert.match(game,/const scheduledRest=!duty\.walking&&!duty\.travel&&!duty\.meeting&&!duty\.community&&!smallWalk/);
 assert.match(game,/pause:!!moment\|\|!!smallWalk\?\.paused\|\|scheduledRest/);
});

test('rotinas não acrescentam campos ao save nem alteram o mundo principal',()=>{
 const world=living.fresh(),neighborsSave=neighbors.fresh();
 const old=JSON.parse(JSON.stringify({world,neighborsSave}));
 for(const day of [1,2,3])for(const id of ['cica','nara']){
  neighbors.agenda({day,minute:9*60},neighbors.RESIDENTS.find(p=>p.id===id));
 }
 assert.deepEqual({world,neighborsSave},old);
 assert.deepEqual(neighbors.restore(neighborsSave),neighborsSave);
});
