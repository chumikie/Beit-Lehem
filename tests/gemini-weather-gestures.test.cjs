'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const moments=require('../gemini-modules/street-moments.js');

const clock={day:1,minute:10*60};
const atGesture=id=>(33-moments.GESTURES[id].offset+1)%33;

test('chuvisco ilustrativo muda apenas gestos cotidianos com papel ou tecido',()=>{
 for(const [id,normal] of [['bia','read'],['nara','sketch'],['cica','ribbon'],['teo','letter']]){
  const person={id};
  assert.equal(moments.choose(person,atGesture(id),clock,'sol')?.kind,normal);
  assert.equal(moments.choose(person,atGesture(id),clock,'chuvisco')?.kind,'look');
  assert.equal(moments.choose(person,atGesture(id),clock,'nublado')?.kind,normal);
 }
 assert.equal(moments.choose({id:'lucia'},atGesture('lucia'),clock,'chuvisco')?.kind,'flower');
});

test('clima não altera prioridades dos encontros ou horários e é propagado aos dois grupos',()=>{
 const person={id:'bia'};
 for(const blocked of ['meeting','travel','arriving','community','encounter']){
  assert.equal(moments.choose({...person,[blocked]:true},atGesture('bia'),clock,'chuvisco'),null);
 }
 assert.equal(moments.choose(person,atGesture('bia'),{day:1,minute:22*60},'chuvisco'),null);
 const code=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 assert.equal((code.match(/RoncadorStreetMoments\.choose\([^\n]+,elapsed,living,skyMode\)/g)||[]).length,2);
});
