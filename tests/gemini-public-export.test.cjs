const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'previews/beit-lehem-development.html'),'utf8');
const publicHtml=fs.readFileSync(path.join(root,'publicacao/index.html'),'utf8');
function mapData(html){
 const start='<script type="application/json" id="embedded-map-data">';
 const i=html.indexOf(start),j=html.indexOf('</script>',i+start.length);
 assert.ok(i>=0&&j>i);
 return html.slice(i+start.length,j);
}

const {auditPublicContent}=require('../scripts/build-public-preview.cjs');
test('a edição pública permite contatos fictícios revisados e bloqueia referências residenciais',()=>{
 assert.doesNotThrow(()=>auditPublicContent(source));
 for(const sensitive of ['Casa 849','[136.5,578]','// PRIVATE: residencial']){
  assert.throws(()=>auditPublicContent(source+'\n'+sensitive),/Cópia pública bloqueada/);
 }
 assert.throws(()=>auditPublicContent(source.replace("id: 'familia_varanda'","id: 'pessoa_nao_revisada'")),/revisão de contatos/);
});
test('export público remove metadados e mantém jogo sem externos obrigatórios',()=>{
 assert.ok(!publicHtml.startsWith('<!--'));
 assert.ok(!publicHtml.includes('fonts.googleapis.com'));
 assert.equal((publicHtml.match(/data:image\/jpeg;base64,/g)||[]).length,2);
 assert.ok(!publicHtml.includes('/9j/4Qn8RXhpZg'));
 assert.ok(publicHtml.includes('aria-label="Beit Lehem"'));
 assert.ok(publicHtml.includes("const STORE='roncador-expedition-v2-referencias-gemini'"));
});
test('mapa original é idêntico no pacote público',()=>{
 assert.equal(mapData(publicHtml),mapData(source));
 const map=JSON.parse(mapData(publicHtml));
 assert.equal(map.roads.length,462);
});
test('scripts do pacote público mantêm sintaxe válida',()=>{
 const scripts=[...publicHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
 assert.ok(scripts.length>=30);
 for(const tag of scripts){
  if(/application\/json/.test(tag[1]))JSON.parse(tag[2]);
  else new vm.Script(tag[2]);
 }
});
