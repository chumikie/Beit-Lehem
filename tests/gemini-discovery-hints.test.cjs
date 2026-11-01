const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'gemini-modules/game.js'),'utf8');
const map=JSON.parse(fs.readFileSync(path.join(root,'dist/map.json'),'utf8'));
const fragment=source.slice(source.indexOf('function cultureInteractionHint('),source.indexOf('function interactAction('));
const cultureInteractionHint=new Function(fragment+';return cultureInteractionHint;')();

test('três marcos reais oferecem visita (E) e observação (F) sem novo botão',()=>{
 for(const id of ['mercado','igreja','rodoviaria']){
  const landmark=map.landmarks.find(place=>place.id===id);
  assert.ok(landmark?.name,id);
  const hint=cultureInteractionHint(landmark,false,null,null,-1);
  assert.match(hint,/Visitar .* \(E\)/);
  assert.match(hint,/F ou o botão Observar/);
 }
 assert.match(source,/\$\('interact'\)\.onclick=interactAction;\$\('observe'\)\.onclick=observe/);
});

test('missão, guia ou conversa têm prioridade e não recebem dica de visita',()=>{
 const market={name:'Mercado Público de Belém'};
 for(const args of [[true,null,null,-1],[false,{id:'damiao'},null,-1],[false,null,{id:'cica'},-1],[false,null,null,0]]){
  assert.equal(cultureInteractionHint(market,...args),'');
 }
 assert.equal(cultureInteractionHint(null,false,null,null,-1),'');
});

test('ajuda acessível reutiliza os botões existentes sem alterar ação ou save',()=>{
 assert.match(source,/const visitHint=cultureInteractionHint\(nearCulture,nearGuide,nearResident,nearSecondary,near\)/);
 assert.match(source,/\$\('interact'\)\.setAttribute\('aria-label',visitHint\|\|\$\('interact'\)\.textContent\.trim\(\)\)/);
 assert.match(source,/\$\('observe'\)\.title=nearCulture\?'Observar os arredores de '/);
 assert.match(source,/if\(nearResident\)\{talkResident\(nearResident\.id\);return;\}/);
 assert.match(source,/if\(near>=0\)\{collect\(\);return;\}/);
 assert.match(source,/if\(nearCulture\)\{showCulture\(nearCulture\.id\);return;\}/);
});
