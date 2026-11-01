'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');

test('um HTML principal e duas cópias de compatibilidade são idênticos',()=>{
 const canonical=fs.readFileSync(path.join(root,'previews/beit-lehem-development.html'));
 for(const name of ['beit-lehem-development-mobile.html','gemini-preview.html']){
  assert.deepEqual(fs.readFileSync(path.join(root,'previews',name)),canonical,name);
 }
 assert.match(canonical.toString('utf8'),/const STORE='roncador-expedition-v2-referencias-gemini'/);
});

test('o exportador público aponta somente para o HTML principal',()=>{
 const builder=fs.readFileSync(path.join(root,'scripts/build-public-preview.cjs'),'utf8');
 assert.match(builder,/previews\/beit-lehem-development\.html/);
 assert.doesNotMatch(builder,/previews\/gemini-preview\.html/);
});
