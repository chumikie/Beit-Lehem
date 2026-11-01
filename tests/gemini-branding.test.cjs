const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('marca exibida nas prévias é Beit Lehem',()=>{
 const files=['gemini-preview.html','beit-lehem-development.html','beit-lehem-development-mobile.html'];
 for(const name of files){
  const html=fs.readFileSync(path.join(root,'previews',name),'utf8');
  assert.ok(html.includes('aria-label="Beit Lehem"'));
  assert.ok(html.includes('<span>BEIT<span class="brand-sub">LEHEM</span></span>'));
  assert.ok(html.includes('<title>Beit Lehem</title>'));
  assert.ok(html.includes("document.title = 'Beit Lehem';"));
  assert.ok(html.includes("document.querySelector('.edition').textContent = '☼ BEIT LEHEM · PRÉVIA';"));
  assert.ok(html.includes("const STORE='roncador-expedition-v2-referencias-gemini'"));
 }
});
test('geografia real mantém o nome Belém/PB',()=>{
 const source=fs.readFileSync(path.join(root,'references/gemini-2026-10-31/experimento-anonimizado.html.txt'),'utf8');
 assert.ok(source.includes('embedded-map-data'));
 assert.ok(source.includes('Belém'));
});
