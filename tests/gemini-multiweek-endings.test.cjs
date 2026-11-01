'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function storyEndingFor('),end=source.indexOf('function closestNamedRoad(',start);
assert.ok(start>=0&&end>start);
const {storyEndingFor,restoreStoryEndings}=new Function(source.slice(start,end)+';return {storyEndingFor,restoreStoryEndings};')();
const traditions=[
 {key:'damiao:feira-fita',day:8},{key:'cica:feira-fita',day:9},
 {key:'zeca:flor',day:11},{key:'teo:recados',day:12}
];
const context={friendshipTraditions:traditions,cityConsequences:['lucia-flor','bia-carta-retorno']};

test('a história da feira exige lembranças de Damião e Ciça e mais uma semana',()=>{
 assert.equal(storyEndingFor('damiao',{...context,day:15}),null);
 assert.equal(storyEndingFor('damiao',{...context,day:16}).id,'feira-que-volta');
 assert.equal(storyEndingFor('cica',{...context,day:16}).id,'feira-que-volta');
 assert.equal(storyEndingFor('damiao',{...context,day:20,friendshipTraditions:traditions.filter(r=>r.key!=='cica:feira-fita')}),null);
 assert.equal(storyEndingFor('damiao',{...context,day:20,friendshipTraditions:[{key:'damiao:feira-fita',day:8},{key:'cica:feira-conversa',day:9}]}),null);
});

test('jardim e cartas exigem acontecimentos distintos e conversa posterior',()=>{
 assert.equal(storyEndingFor('lucia',{...context,day:17}),null);
 assert.equal(storyEndingFor('zeca',{...context,day:18}).id,'jardim-que-fica');
 assert.equal(storyEndingFor('bia',{...context,day:18}),null);
 assert.equal(storyEndingFor('teo',{...context,day:19}).id,'cartas-que-voltam');
 assert.equal(storyEndingFor('lucia',{...context,day:20,cityConsequences:[]}),null);
 assert.equal(storyEndingFor('bia',{...context,day:20,cityConsequences:['lucia-flor']}),null);
});

test('saves antigos e desfechos forjados não recebem conquistas automáticas',()=>{
 const saved=[{id:'feira-que-volta',day:16},{id:'feira-que-volta',day:16},
  {id:'jardim-que-fica',day:18},{id:'cartas-que-voltam',day:19},{id:'inventado',day:19},
  {id:'cartas-que-voltam',day:30}];
 assert.deepEqual(restoreStoryEndings(saved,{...context,living:{day:20}}),[
  {id:'feira-que-volta',day:16},{id:'jardim-que-fica',day:18},{id:'cartas-que-voltam',day:19}
 ]);
 assert.deepEqual(restoreStoryEndings(null,{...context,living:{day:20}}),[]);
 assert.deepEqual(restoreStoryEndings(saved,{friendshipTraditions:[],cityConsequences:[],living:{day:20}}),[]);
 assert.match(source,/storyEndings\.push\(\{id:ending.id,day:living.day\}\)/);
});
