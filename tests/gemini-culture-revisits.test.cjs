const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'gemini-modules/game.js'),'utf8');
const map=JSON.parse(fs.readFileSync(path.join(root,'dist/map.json'),'utf8'));
const cultures=source.slice(source.indexOf('const CULTURE={'),source.indexOf('function culturePlace('));
const CULTURE=new Function(cultures+';return CULTURE;')();
const fragment=source.slice(source.indexOf('function cultureChoiceStatus('),source.indexOf('function syncMarketToggle('));
const cultureChoiceStatus=new Function(fragment+';return cultureChoiceStatus;')();

test('Mercado, Matriz e Rodoviária já têm atividades ancoradas nos marcos do mapa',()=>{
 for(const id of ['mercado','igreja','rodoviaria']){
  assert.ok(map.landmarks.some(place=>place.id===id&&Array.isArray(place.p)),id);
  assert.equal(CULTURE[id].choices.length,3,id);
  assert.ok(CULTURE[id].description.length>80,id);
 }
});

test('primeira visita, retorno e mudança de escolha têm estados distintos',()=>{
 for(const id of ['mercado','igreja','rodoviaria']){
  const [first,second]=CULTURE[id].choices,notes={};
  assert.equal(cultureChoiceStatus(notes,id,first),'new');
  notes[id]=first;
  assert.equal(cultureChoiceStatus(notes,id,first),'recorded');
  assert.equal(cultureChoiceStatus(notes,id,second),'updated');
  assert.deepEqual(notes,{[id]:first});
 }
});

test('cartão indica opção registrada e impede falso anúncio de memória nova',()=>{
 assert.match(source,/button\.textContent=status==='recorded'\?'✓ '\+choice\+' · no caderno'/);
 assert.match(source,/button\.disabled=!reachable\|\|status==='recorded'/);
 assert.match(source,/if\(visit==='recorded'\)return;cultureNotes\[id\]=choice/);
 assert.match(source,/visit==='new'\?'Uma nova memória de Belém foi guardada no caderno!':'Seu registro de Belém foi atualizado no caderno\.'/);
 assert.match(source,/cultureNotes\[id\]=choice;chapterUI\(\);if\(id==='mercado'\)recordFairQuest\('mercado'\)/);
});

test('reabrir em outro dia mantém a escolha sem criar uma segunda lembrança',()=>{
 const notes={};
 for(const id of ['mercado','igreja','rodoviaria']){
  const first=CULTURE[id].choices[0],other=CULTURE[id].choices[1];
  assert.equal(cultureChoiceStatus(notes,id,first),'new');
  notes[id]=first;
  for(const day of [2,3,7]){
   assert.equal(cultureChoiceStatus(notes,id,first),'recorded',id+' dia '+day);
   assert.equal(cultureChoiceStatus(notes,id,other),'updated',id+' dia '+day);
   assert.equal(notes[id],first);
  }
 }
 assert.equal(Object.keys(notes).length,3);
});
