const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
const fragment=source.slice(source.indexOf('function nearbyResidentReaction('),source.indexOf('function drawStreetLife('));
const nearbyResidentReaction=new Function(fragment+';return nearbyResidentReaction;')();
const player={x:20,y:0};
const context={living:{people:{damiao:{bond:2},lucia:{bond:1},bia:{bond:1}}},sideNeighbors:{seen:['cica','nara']},worldPause:null};
const resident=(id,extra={})=>({id,def:{id},x:0,y:0,...extra});

test('Francisco, Lúcia e Bia reconhecem o jogador apenas quando há vínculo',()=>{
 for(const id of ['damiao','lucia','bia']){
  const reaction=nearbyResidentReaction(resident(id),player,context);
  assert.equal(reaction.pose,'smile');
  assert.equal(reaction.facing,1);
  assert.equal(reaction.stage,'nearby');
 }
 assert.equal(nearbyResidentReaction(resident('damiao'),player,{...context,living:{people:{damiao:{bond:0}}}}),null);
});

test('Ciça e Nara reconhecem somente quem já conheceram',()=>{
 for(const id of ['cica','nara'])assert.equal(nearbyResidentReaction(resident(id),player,context).pose,'smile');
 assert.equal(nearbyResidentReaction(resident('cica'),player,{...context,sideNeighbors:{seen:[]}}),null);
 assert.equal(nearbyResidentReaction(resident('desconhecido'),player,context),null);
});

test('reconhecimento não interrompe caminhada, encontros nem gestos ocupados',()=>{
 for(const busy of ['walking','arriving','meeting','travel','greeting','moment','crowded']){
  assert.equal(nearbyResidentReaction(resident('damiao',{[busy]:{active:true}}),player,context),null,busy);
 }
 assert.equal(nearbyResidentReaction(resident('damiao',{social:{pose:'wave'}}),player,context),null);
 assert.equal(nearbyResidentReaction(resident('damiao',{def:null}),player,context),null);
 assert.equal(nearbyResidentReaction(resident('damiao'),player,{...context,worldPause:{age:1}}),null);
});

test('expressão diminui com a distância e desaparece ao sair de perto',()=>{
 const near=nearbyResidentReaction(resident('damiao'),{x:6,y:0},context);
 const far=nearbyResidentReaction(resident('damiao'),{x:37,y:0},context);
 assert.ok(near.intensity>far.intensity);
 assert.ok(near.intensity<=.45);
 assert.ok(far.intensity>0);
 assert.equal(nearbyResidentReaction(resident('damiao'),{x:42,y:0},context),null);
 assert.equal(nearbyResidentReaction(resident('damiao'),{x:-8,y:0},context).facing,-1);
});

test('a reação usa os gestos existentes e não altera posição ou progresso',()=>{
 const person=resident('damiao',{pause:{kind:'rest'},routeProgress:.65});
 const snapshot=structuredClone(person);
 const reaction=nearbyResidentReaction(person,player,context);
 assert.deepEqual(person,snapshot);
 assert.deepEqual(Object.keys(reaction).sort(),['facing','intensity','pose','react','stage']);
 assert.match(source,/residentMotion\.present\(person,elapsed,reduce\)/);
});
