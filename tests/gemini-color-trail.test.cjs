'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function colorTrailProgress(');
const end=source.indexOf('function renderColorTrail(',start);
assert.ok(start>=0&&end>start,'missão de três vizinhos disponível');
const progress=new Function(source.slice(start,end)+';return colorTrailProgress;')();

test('missão de Rosa, Zeca e Mila deriva do save já existente, sem mutá-lo',()=>{
 const state={seen:['cica','rosa','nara','zeca','teo']},before=JSON.stringify(state);
 assert.equal(progress(state),2);
 assert.equal(progress({...state,seen:[...state.seen,'mila']}),3);
 assert.equal(progress({seen:['rosa','rosa','mila']}),2);
 assert.equal(progress(null),0);
 assert.equal(JSON.stringify(state),before);
});
test('nova missão conserva seu lugar no diário e recompensa no álbum existente',()=>{
 assert.match(source,/list\.insertAdjacentElement\('afterend',panel\)/);
 assert.match(source,/if\(colorTrailProgress\(sideNeighbors\)===3\)/);
 assert.match(source,/if\(!person\)\{notify\(/);
 assert.match(source,/setRoute\(person\.x,person\.y,27\)/);
});
