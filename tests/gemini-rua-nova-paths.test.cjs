'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const data=require('../dist/map.json');
const graph=require('../dist/pathfinding.js').buildGraph(data.roads);
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function restoreRuaNovaPaths('),end=source.indexOf('function observeRuaNovaPath(',start);
assert.ok(start>=0&&end>start);
const stories={
 'Rua da Cruz':{resident:'bia'},'Rua Ramiro Alves':{resident:'lucia'},'Rua Independência':{resident:'damiao'}
};
const buildHelpers=(paths=['Rua da Cruz','Rua Independência'],knowledge={},links=[],living={day:5,notes:[]})=>new Function('RUA_NOVA_ROADS','RUA_NOVA_STORIES','ruaNovaPaths','ruaNovaDays','cityKnowledge','cityLinks','living',source.slice(start,end)+';return {restoreRuaNovaPaths,restoreRuaNovaDays,restoreCityKnowledge,restoreCityLinks,rememberCityStory,cityConsequenceFor,restoreCityConsequences,closestNamedRoad};')(['Rua da Cruz','Rua Ramiro Alves','Rua Independência'],stories,paths,{'Rua da Cruz':3,'Rua Independência':5},knowledge,links,living);
const helpers=buildHelpers();

test('três nomes constam da malha OSM e são acessíveis por vias conectadas',()=>{
 for(const name of ['Rua da Cruz','Rua Ramiro Alves','Rua Independência']){
  const segments=data.roads.filter(r=>r.tags.name===name);
  assert.ok(segments.length>0,name);
  const anchor=segments[0].p[Math.floor(segments[0].p.length/2)];
  const route=graph.route(data.start,anchor);
  assert.ok(route&&route.points.length>=2,name);
  assert.ok(route.toRoadMetres<1,name);
 }
});
test('amostra de via utiliza somente geometrias já mapeadas',()=>{
 const reference={x:data.start[0],y:data.start[1]};
 const result=helpers.closestNamedRoad(data.roads,reference,'Rua da Cruz');
 assert.ok(result&&result.d>0);
 assert.equal(helpers.closestNamedRoad(data.roads,reference,'Rua fictícia inexistente'),null);
});
test('save sanitiza observações sem aceitar ruas inventadas',()=>{
 const result=helpers.restoreRuaNovaPaths(['Rua Independência','Rua inventada','Rua da Cruz','Rua da Cruz']);
 assert.deepEqual(result,['Rua da Cruz','Rua Independência']);
 assert.deepEqual(helpers.restoreRuaNovaPaths(null),[]);
 assert.match(source,/if\(observeRuaNovaPath\(\)\)return;/);
 assert.match(source,/if\(!route\)\{notify\('Não foi encontrada uma rota conectada/);
});
test('dias de descoberta só são restaurados para caminhos realmente registrados',()=>{
 assert.deepEqual(helpers.restoreRuaNovaDays({'Rua da Cruz':3,'Rua inventada':5,'Rua Ramiro Alves':2,'Rua Independência':-1},['Rua da Cruz']),{'Rua da Cruz':3});
 assert.deepEqual(helpers.restoreRuaNovaDays(null,['Rua da Cruz']),{});
 assert.deepEqual(helpers.restoreRuaNovaDays({'Rua da Cruz':'3'},['Rua da Cruz']),{});
});
test('moradores só conhecem os caminhos que o jogador lhes contou e recordam dias depois',()=>{
 const knowledge={};const dialog=buildHelpers(['Rua da Cruz','Rua Independência'],knowledge);
 assert.match(dialog.rememberCityStory('bia',3).text,/Você conta a Bia/);
 assert.match(dialog.rememberCityStory('bia',4).text,/depois de outro dia/);
 assert.match(dialog.rememberCityStory('damiao',6).text,/Você compartilha/);
 assert.equal(dialog.rememberCityStory('lucia',10).text,'');
 assert.equal(knowledge.bia['Rua da Cruz'],3);
 assert.equal(knowledge.damiao['Rua Independência'],6);
 assert.match(source,/ruaNovaDays=restoreRuaNovaDays\(saved.ruaNovaDays,ruaNovaPaths\)/);
});
test('conversas conectadas exigem conhecimento anterior e não repetem registros',()=>{
 const knowledge={},links=[],living={day:8,notes:[]};
 const dialog=buildHelpers(['Rua da Cruz','Rua Ramiro Alves','Rua Independência'],knowledge,links,living);
 dialog.rememberCityStory('lucia',2);
 assert.deepEqual(links,[]);
 dialog.rememberCityStory('bia',3);
 assert.deepEqual(links,[]);
 const next=dialog.rememberCityStory('lucia',4);
 assert.match(next.text,/conversa anterior com Bia/);
 assert.deepEqual(links,['bia-lucia']);
 dialog.rememberCityStory('lucia',5);
 assert.deepEqual(links,['bia-lucia']);
 dialog.rememberCityStory('damiao',6);
 assert.deepEqual(links,['bia-lucia','lucia-damiao']);
 assert.equal(living.notes.length,2);
});
test('restauração de saves antigos não inventa quem sabia de cada história',()=>{
 const paths=['Rua da Cruz','Rua Ramiro Alves'];
 assert.deepEqual(helpers.restoreCityKnowledge(undefined,paths,9),{});
 assert.deepEqual(helpers.restoreCityKnowledge({bia:{'Rua da Cruz':3},lucia:{'Rua Ramiro Alves':15},damiao:{'Rua Independência':2}},paths,9),{bia:{'Rua da Cruz':3}});
 assert.deepEqual(helpers.restoreCityLinks(['bia-lucia','lucia-damiao'],{bia:{'Rua da Cruz':3}}),[]);
 assert.deepEqual(helpers.restoreCityLinks(['bia-lucia','bia-lucia'],{bia:{'Rua da Cruz':3},lucia:{'Rua Ramiro Alves':4}}),['bia-lucia']);
});
test('Lúcia menciona somente o estágio verdadeiro da muda e uma descoberta contada',()=>{
 const context={cityKnowledge:{lucia:{'Rua Ramiro Alves':2}},luciaGarden:{claimed:true},biaLetters:{},sideNeighbors:{},marketMorning:{},fairMorning:false,day:6,growthStage:2};
 assert.match(helpers.cityConsequenceFor('lucia',context).text,/botão de flor/);
 assert.equal(helpers.cityConsequenceFor('lucia',{...context,growthStage:3}).key,'lucia-flor');
 assert.equal(helpers.cityConsequenceFor('lucia',{...context,growthStage:0}),null);
 assert.equal(helpers.cityConsequenceFor('lucia',{...context,cityKnowledge:{}}),null);
});
test('Damião só comenta gentileza numa manhã real de feira e sem duplicar sua consequência',()=>{
 const context={cityKnowledge:{damiao:{'Rua Independência':2}},luciaGarden:{},biaLetters:{},sideNeighbors:{marketLegacy:{kind:'fita',day:2}},marketMorning:{claimed:true},fairMorning:true,day:6,growthStage:0};
 assert.match(helpers.cityConsequenceFor('damiao',context).text,/Passaram-se dias/);
 assert.equal(helpers.cityConsequenceFor('damiao',{...context,fairMorning:false}),null);
 assert.equal(helpers.cityConsequenceFor('damiao',{...context,sideNeighbors:{marketLegacy:{kind:null}}}),null);
 assert.deepEqual(helpers.restoreCityConsequences(['damiao-feira-fita','damiao-feira-fita'],context),['damiao-feira-fita']);
 assert.deepEqual(helpers.restoreCityConsequences(['damiao-feira-fita'],{...context,cityKnowledge:{}}),[]);
});
test('Bia respeita o tema realmente selado da carta e não inventa despedidas',()=>{
 const context={cityKnowledge:{bia:{'Rua da Cruz':2}},luciaGarden:{},biaLetters:{claimed:true,theme:'retorno'},sideNeighbors:{},marketMorning:{},fairMorning:false,day:5,growthStage:0};
 assert.match(helpers.cityConsequenceFor('bia',context).text,/caminho de volta/);
 assert.equal(helpers.cityConsequenceFor('bia',{...context,biaLetters:{claimed:false,theme:'retorno'}}),null);
 assert.equal(helpers.cityConsequenceFor('bia',{...context,cityKnowledge:{}}),null);
 assert.deepEqual(helpers.restoreCityConsequences(['bia-carta-retorno','lucia-flor'],context),['bia-carta-retorno']);
});
