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
 assert.equal((publicHtml.match(/data:image\/jpeg;base64,/g)||[]).length,0);
 assert.ok(!publicHtml.includes('/9j/4Qn8RXhpZg'));
 assert.ok(publicHtml.includes('aria-label="Beit Lehem"'));
 assert.ok(publicHtml.includes("const STORE='roncador-expedition-v2-referencias-gemini'"));
});
test('a cidade ficcional não expõe links documentais e fotos de Belém na interface',()=>{
 assert.ok(!source.includes('data:image/jpeg;base64,'));
 assert.match(source, /id="fictional-world-ui"/);
 assert.ok(!source.includes('Ver referência histórica ↗'));
 assert.ok(source.includes('Ateliê'));
});
test('snapshot público mantém a geometria, sem ser confundido com o mapa ativo ainda não regenerado',()=>{
 const publicMap=JSON.parse(mapData(publicHtml));
 const activeMap=JSON.parse(mapData(source));
 assert.equal(publicMap.roads.length,462);
 assert.equal(activeMap.roads.length,462);
 assert.deepEqual(publicMap.roads.map(road=>({id:road.id,p:road.p})),
  activeMap.roads.map(road=>({id:road.id,p:road.p})));
 assert.deepEqual(publicMap.areas.map(area=>area.p),activeMap.areas.map(area=>area.p));
 assert.equal(activeMap.points.length,9,'o mapa ativo contém apenas pontos OSM canônicos');
 assert.equal(activeMap.localPlaces.length,9,'POIs autorais ficam em camada separada');
 assert.notEqual(mapData(publicHtml),mapData(source),
  'o HTML público é um snapshot anterior e não deve ser tratado como exportação atual');
});
test('scripts do pacote público mantêm sintaxe válida',()=>{
 const scripts=[...publicHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
 assert.ok(scripts.length>=30);
 for(const tag of scripts){
  if(/application\/json/.test(tag[1]))JSON.parse(tag[2]);
  else new vm.Script(tag[2]);
 }
});
