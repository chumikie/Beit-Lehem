const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'gemini-modules/game.js'),'utf8');
const map=JSON.parse(fs.readFileSync(path.join(root,'dist/map.json'),'utf8'));
const extract=source.slice(source.indexOf('function restoreWorldMoments('),source.indexOf('function closestNamedRoad('));
const {restoreWorldMoments,worldMomentAt}=new Function('WORLD_MOMENTS','inside',extract+';return {restoreWorldMoments,worldMomentAt};')(
 {mercado:{},igreja:{},rodoviaria:{},mato:{}},()=>false
);

test('pausas usam apenas os três marcos existentes no mapa',()=>{
 for(const id of ['mercado','igreja','rodoviaria']){
  const landmark=map.landmarks.find(item=>item.id===id);
  assert.ok(landmark,id);
  assert.equal(worldMomentAt(map,{x:landmark.p[0],y:landmark.p[1]}),id);
 }
 assert.equal(worldMomentAt(map,{x:100000,y:100000}),null);
});

test('a pausa verde se ancora na geometria existente do Mato',()=>{
 const area=map.areas.find(item=>item.tags?.leisure==='park'&&item.tags?.name==='Mato');
 assert.ok(area);
 const [x,y]=area.p[0][0];
 assert.equal(worldMomentAt(map,{x,y}),'mato');
});

test('salvamentos antigos e duplicados não inventam lembranças',()=>{
 assert.deepEqual(restoreWorldMoments(undefined,8),[]);
 assert.deepEqual(restoreWorldMoments([
  {id:'mercado',day:2},{id:'mercado',day:3},{id:'igreja',day:9},
  {id:'inventado',day:1},{id:'rodoviaria',day:-1},{id:'mato',day:4}
 ],8),[{id:'mercado',day:2},{id:'mato',day:4}]);
});

test('o comando observar preserva descobertas e aceita pausas depois delas',()=>{
 assert.match(source,/if\(observeRuaNovaPath\(\)\)return;/);
 assert.match(source,/if\(observations\.has\(key\)\)\{if\(observeWorldMoment\(\)\)return;/);
 assert.match(source,/worldMoments=restoreWorldMoments\(saved\.worldMoments,living\.day\)/);
 assert.match(source,/lastJournalDay=1;worldMoments=\[\]/);
});

test('expressões adicionais respeitam as fases sociais',()=>{
 for(const state of ['surprised','shy','farewell'])assert.match(source,new RegExp('const '+state+'='));
});

const commentBody=source.slice(source.indexOf('function pauseNeighborComment('),source.indexOf('function beginWorldPause('));
const pauseNeighborComment=new Function(commentBody+';return pauseNeighborComment;')();

test('um morador só comenta lembranças comprovadas, estando próximo e com vínculo',()=>{
 const player={x:0,y:0};
 const people=[{id:'damiao',x:25,y:10}];
 const context={marketClaimed:true,bonds:{damiao:2}};
 assert.match(pauseNeighborComment('mercado',people,player,context),/Francisco/);
 assert.equal(pauseNeighborComment('mercado',people,player,{marketClaimed:false,bonds:{damiao:2}}),null);
 assert.equal(pauseNeighborComment('mercado',people,player,{marketClaimed:true,bonds:{damiao:0}}),null);
 assert.equal(pauseNeighborComment('mercado',[{id:'damiao',x:80,y:0}],player,context),null);
 assert.equal(pauseNeighborComment('igreja',people,player,context),null);
 assert.equal(pauseNeighborComment('rodoviaria',[{id:'bia',x:4,y:2}],player,{letterClaimed:false,bonds:{bia:3}}),null);
});

test('pausa é transitória e não inventa assentos nem impede cancelar a caminhada',()=>{
 assert.match(source,/let worldPause=null/);
 assert.match(source,/skyMode==='chuvisco'\?2\.8:4\.3/);
 assert.match(source,/if\(dx\|\|dy\)\{worldPause=null;waypoint=null;/);
 assert.match(source,/if\(contemplative\)/);
 assert.doesNotMatch(source,/worldMoments,worldPause/);
});

const storiesSource=source.slice(source.indexOf('function restoreStreetVignettes('),source.indexOf('function worldMomentAt('));
const stories=new Function('STREET_VIGNETTES',storiesSource+';return {restoreStreetVignettes,nextStreetVignette};')({
 'mercado-escuta':{},'mercado-sorda':{},'mercado-cuidado':{},'igreja-memoria':{},'igreja-folhas':{},'igreja-flor':{},
 'rodoviaria-cartas':{},'mato-chuvisco':{},'mato-claridade':{}
});

test('cenas novas exigem acontecimentos vividos e não se repetem',()=>{
 const day=8,context={marketClaimed:false,gardenStage:0,letterClaimed:false,raining:false};
 assert.equal(stories.nextStreetVignette('mercado',[],context),'mercado-escuta');
 assert.equal(stories.nextStreetVignette('mercado',[{id:'mercado-escuta',day:2}],context),'mercado-sorda');
 assert.equal(stories.nextStreetVignette('mercado',[{id:'mercado-escuta',day:2},{id:'mercado-sorda',day:3}],context),null);
 assert.equal(stories.nextStreetVignette('mercado',[{id:'mercado-escuta',day:2},{id:'mercado-sorda',day:3}],{...context,marketClaimed:true}),'mercado-cuidado');
 assert.equal(stories.nextStreetVignette('igreja',[],context),null);
 assert.equal(stories.nextStreetVignette('igreja',[],{...context,churchKnown:true}),'igreja-memoria');
 assert.equal(stories.nextStreetVignette('igreja',[],{...context,gardenStage:1}),'igreja-folhas');
 assert.equal(stories.nextStreetVignette('igreja',[{id:'igreja-folhas',day:4}],{...context,gardenStage:3}),'igreja-flor');
 assert.equal(stories.nextStreetVignette('rodoviaria',[],context),null);
 assert.equal(stories.nextStreetVignette('rodoviaria',[],{...context,letterClaimed:true}),'rodoviaria-cartas');
 assert.equal(stories.nextStreetVignette('mato',[],context),'mato-claridade');
 assert.equal(stories.nextStreetVignette('mato',[],{...context,raining:true}),'mato-chuvisco');
 assert.deepEqual(stories.restoreStreetVignettes([{id:'igreja-flor',day:7},{id:'igreja-flor',day:8},{id:'inventada',day:1},{id:'mato-chuvisco',day:9}],day),[{id:'igreja-flor',day:7}]);
 assert.deepEqual(stories.restoreStreetVignettes(undefined,day),[]);
});

test('gestos de companhia dependem de presença, vínculo e uma pausa real',()=>{
 assert.match(source,/worldPause&&worldPause\.age>\.4/);
 assert.match(source,/!person\.arriving&&!person\.walking&&!person\.social&&!person\.meeting/);
 assert.match(source,/living\.people\[person\.id\]\?\.bond>0/);
 assert.match(source,/streetVignettes=restoreStreetVignettes\(saved\.streetVignettes,living\.day\)/);
 assert.match(source,/streetVignettes=\[\];everydayMemories=\[\];saoPedroTales=\[\];breadStories=\[\];morningEncounters=\[\];waterMemories=\[\];waterTalks=\[\];seasonalMemories=\[\];camucaStories=\[\];worldPause=null/);
});
