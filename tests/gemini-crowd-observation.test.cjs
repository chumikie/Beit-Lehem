'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crowd=require('../gemini-modules/crowd-flow.js');
const {create}=require('../gemini-modules/resident-motion.js');

test('um passante comum observa brevemente e retoma sem novo personagem',()=>{
 const time={day:1,minute:10*60};
 const before=crowd.plan(time,false,10),pause=crowd.plan(time,false,18),after=crowd.plan(time,false,30);
 const id='passeio-2';
 const earlier=before.find(p=>p.id===id),watching=pause.find(p=>p.id===id),later=after.find(p=>p.id===id);
 assert.equal(earlier.localRole,'passeante');
 assert.equal(earlier.pause,false);
 assert.equal(watching.pause,true);
 assert.equal(watching.moment?.kind,'look');
 assert.ok(watching.moment.strength>0);
 assert.equal(watching.activity,'observando o caminho');
 assert.equal(later.pause,false);
 assert.equal(later.moment,null);
 assert.equal(later.activity,'caminhando pelo bairro');
 assert.deepEqual([earlier.hub,watching.hub,later.hub],Array(3).fill('rua:Rua Nunes'));
 assert.equal(before.length,pause.length);
 assert.equal(pause.length,after.length);
});

test('a pausa sustenta os pés e o mesmo percurso retoma ao terminar',()=>{
 const motion=create(null),id='passeio-2';
 motion.resolve({id,x:0,y:0,walking:true},0,1);
 const waiting=motion.resolve({id,x:5,y:0,walking:true,pause:true},.05,1);
 assert.equal(waiting.x,0);
 assert.equal(waiting.walking,false);
 const resumed=motion.resolve({id,x:5,y:0,walking:true,pause:false},.1,1);
 assert.ok(resumed.x>0&&resumed.x<5);
 assert.equal(resumed.walking,true);
});
