const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
const fragment=source.slice(source.indexOf('function nearbyResidentReaction('),source.indexOf('function drawStreetLife('));
const nearbyResidentReaction=new Function(fragment+';return nearbyResidentReaction;')();
const createPlayerPresenceGestures=new Function('nearbyResidentReaction',fragment+';return createPlayerPresenceGestures;')(nearbyResidentReaction);
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

test('chegada e permanência mantêm o sorriso sem pausar o trajeto',()=>{
 const gesture=createPlayerPresenceGestures(),person=resident('damiao',{routeProgress:.4});
 for(const seconds of [10,10.4,12.2]){
  const reaction=gesture(person,player,context,seconds);
  assert.equal(reaction.pose,'smile');
  assert.equal(reaction.stage,'nearby');
 }
 assert.equal(person.routeProgress,.4);
});

test('despedida curta só surge após permanência e saída gradual',()=>{
 const gesture=createPlayerPresenceGestures(),person=resident('cica');
 assert.equal(gesture(person,player,context,10).pose,'smile');
 assert.equal(gesture(person,player,context,12).pose,'smile');
 const outside={x:52,y:0};
 const farewell=gesture(person,outside,context,12.1);
 assert.equal(farewell.pose,'wave');
 assert.equal(farewell.stage,'farewell');
 assert.ok(farewell.intensity>0&&farewell.intensity<=.38);
 assert.ok(gesture(person,outside,context,12.6).intensity<farewell.intensity);
 assert.equal(gesture(person,outside,context,13.1),null);
 assert.equal(gesture(person,outside,context,14),null);
 assert.equal(gesture(person,{x:65,y:0},context,14.1),null);
 assert.equal(gesture(person,player,context,15).pose,'smile');
});

test('passagem rápida e distância grande não provocam despedida',()=>{
 const gesture=createPlayerPresenceGestures(),person=resident('nara');
 assert.equal(gesture(person,player,context,2).pose,'smile');
 assert.equal(gesture(person,{x:53,y:0},context,2.5),null);
 assert.equal(gesture(person,{x:80,y:0},context,2.6),null);
 assert.equal(gesture(person,player,context,3).pose,'smile');
 assert.equal(gesture(person,{x:80,y:0},context,5),null);
});

test('atividade prioritária cancela uma despedida e não cria dado de save',()=>{
 const gesture=createPlayerPresenceGestures(),person=resident('bia');
 gesture(person,player,context,20);
 gesture(person,player,context,22);
 const snapshot=structuredClone(person);
 assert.equal(gesture({...person,moment:{pose:'read'}},{x:52,y:0},context,22.1),null);
 assert.equal(gesture(person,{x:52,y:0},context,22.3),null);
 assert.deepEqual(person,snapshot);
 assert.doesNotMatch(source,/playerPresenceGestures[,:]\s*(?:save|saved|JSON\.stringify)/);
});
