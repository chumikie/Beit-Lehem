'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const market=require('../dist/market-morning.js');
const lucia=require('../dist/lucia-garden.js');
const bia=require('../dist/bia-letters.js');
const world=require('../gemini-modules/living-world.js');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function chapterConversationFollowup(');
const end=source.indexOf('function renderConversationFollowup(',start);
assert.ok(start>=0&&end>start,'helper de continuidade presente');
const followup=new Function(source.slice(start,end)+';return chapterConversationFollowup;')();

test('uma conversa abre diretamente a atividade correta e nunca salta capítulos',()=>{
 const m=market.fresh(),l=lucia.fresh(),b=bia.fresh();
 assert.equal(followup('damiao',m,l,b),null);
 assert.equal(followup('lucia',m,l,b),null);
 assert.equal(followup('bia',m,l,b),null);
 market.meet(m);
 assert.equal(followup('damiao',m,l,b)?.chapter,'market');
 for(const work of ['toldo','frutas','cestos'])market.doWork(m,work);
 assert.equal(market.claim(m),true);
 assert.equal(followup('damiao',m,l,b),null);
 lucia.meet(l);
 assert.equal(followup('lucia',m,l,b)?.chapter,'lucia');
 assert.equal(followup('bia',m,l,b),null);
 for(const work of lucia.TASKS)lucia.doWork(l,work.id);
 lucia.chooseMemory(l,lucia.MEMORIES[0].id);
 assert.equal(lucia.claim(l),true);
 assert.equal(followup('lucia',m,l,b),null);
 bia.meet(b);
 assert.equal(followup('bia',m,l,b)?.chapter,'bia');
 bia.openNotebook(b);bia.chooseTheme(b,bia.THEMES[0].id);bia.seal(b);
 assert.equal(bia.claim(b),true);
 assert.equal(followup('bia',m,l,b),null);
 assert.deepEqual(market.restore(JSON.parse(JSON.stringify(m))),m);
 assert.deepEqual(lucia.restore(JSON.parse(JSON.stringify(l))),l);
 assert.deepEqual(bia.restore(JSON.parse(JSON.stringify(b))),b);
});

test('continuação depende de presença, não inventa falas ou conclusão fora do horário',()=>{
 for(const id of ['damiao','lucia','bia']){
  const morning=world.fresh();morning.day=2;morning.minute=9*60;
  const late=world.fresh();late.day=2;late.minute=23*60;
  assert.equal(typeof world.agenda(morning,id).present,'boolean');
  assert.equal(world.agenda(late,id).present,false);
 }
 assert.match(source,/renderConversationFollowup\(\);/);
 assert.match(source,/\$\('lifeDialog'\)\.close\(\);[\s\S]*?marketChapterAction\(\)/);
 assert.doesNotMatch(source.slice(start,source.indexOf('function drawResidentPortrait(',start)),/\.claim\(|\.doWork\(|\.meet\(|localStorage\.setItem/);
});
