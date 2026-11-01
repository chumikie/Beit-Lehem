const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','gemini-modules/game.js'),'utf8');
const storyData=source.slice(source.indexOf('const EVERYDAY_STORIES='),source.indexOf('let everydayMemories=[];'));
const functions=source.slice(source.indexOf('function restoreEverydayMemories('),source.indexOf('function nextStreetVignette('));
const map=JSON.parse(fs.readFileSync(path.join(__dirname,'..','dist/map.json'),'utf8'));
const closestNamedRoad=(roads,point,name)=>{
 let best=null;
 for(const road of roads.filter(road=>road.tags?.name===name))for(const p of road.p){
  const d=Math.hypot(p[0]-point.x,p[1]-point.y);
  if(!best||d<best.d)best={d};
 }
 return best;
};
const {stories,restoreEverydayMemories,everydayConversationCandidate,everydayStreetCandidate}=new Function('closestNamedRoad',storyData+functions+';return {stories:EVERYDAY_STORIES,restoreEverydayMemories,everydayConversationCandidate,everydayStreetCandidate};')(closestNamedRoad);

test('seis histórias refletem apenas vias e moradores já existentes',()=>{
 assert.equal(Object.keys(stories).length,6);
 for(const street of ['Rua Clovis Bezerra','Rua Nunes','Rua Antônio Borges de Lima'])assert.ok(map.roads.some(road=>road.tags?.name===street),street);
});

test('Damião só relembra um cuidado de outro dia, não uma ajuda inventada',()=>{
 const state={day:6,marketClaimed:true,careDay:5};
 assert.equal(everydayConversationCandidate('damiao',state),'damiao-cestos');
 assert.equal(everydayConversationCandidate('damiao',{...state,marketClaimed:false}),null);
 assert.equal(everydayConversationCandidate('damiao',{...state,careDay:6}),null);
 assert.equal(everydayConversationCandidate('damiao',{...state,careDay:0}),null);
});

test('Lúcia e Bia dependem da muda e da visita realmente presenciada',()=>{
 const state={day:10,gardenClaimedDay:7,gardenStage:1,letterClaimed:true,witnessedVisitDays:[8]};
 assert.equal(everydayConversationCandidate('lucia',state),'lucia-tempo');
 assert.equal(everydayConversationCandidate('lucia',{...state,day:8}),null);
 assert.equal(everydayConversationCandidate('lucia',{...state,gardenStage:0}),null);
 assert.equal(everydayConversationCandidate('bia',state),'bia-reencontro');
 assert.equal(everydayConversationCandidate('bia',{...state,witnessedVisitDays:[]}),null);
 assert.equal(everydayConversationCandidate('bia',{...state,letterClaimed:false}),null);
 assert.equal(everydayConversationCandidate('bia',{...state,witnessedVisitDays:[10]}),null);
});

test('ruas residenciais exigem presença em via mapeada e entardecer',()=>{
 const road=map.roads.find(road=>road.tags?.name==='Rua Clovis Bezerra');
 const point={x:road.p[0][0],y:road.p[0][1]};
 assert.equal(everydayStreetCandidate(map.roads,point,17*60+30,[]),'rua-clovis-tarde');
 assert.equal(everydayStreetCandidate(map.roads,point,12*60,[]),null);
 assert.equal(everydayStreetCandidate(map.roads,{x:1e6,y:1e6},17*60+30,[]),null);
 assert.equal(everydayStreetCandidate(map.roads,point,17*60+30,[{id:'rua-clovis-tarde',day:2}]),null);
});

test('salvamentos antigos não recebem cenas novas nem aceitam duplicatas',()=>{
 const known={id:'damiao-cestos',day:3};
 assert.deepEqual(restoreEverydayMemories(undefined,8),[]);
 assert.deepEqual(restoreEverydayMemories([known,known,{id:'outra-casa',day:2},{id:'lucia-tempo',day:9}],8),[known]);
 assert.match(source,/everydayMemories=restoreEverydayMemories\(saved\.everydayMemories,living\.day\)/);
 assert.match(source,/if\(observeRuaNovaPath\(\)\)return;\s*if\(observeEverydayStreet\(\)\)return;/);
});
