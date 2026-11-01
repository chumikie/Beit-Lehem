const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
const fragment=source.slice(source.indexOf('function residentGestureWarmth('),source.indexOf('function drawStreetLife('));
const {nearbyResidentReaction,residentGestureWarmth,recordedInteractionGapDays}=new Function(fragment+';return {nearbyResidentReaction,residentGestureWarmth,recordedInteractionGapDays};')();
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

test('afeto cresce apenas com os níveis de vínculo existentes',()=>{
 const weak={...context,living:{people:{damiao:{bond:1}}}};
 const strong={...context,living:{people:{damiao:{bond:4}}}};
 assert.equal(residentGestureWarmth('damiao',weak),.7);
 assert.equal(residentGestureWarmth('damiao',strong),1);
 assert.ok(nearbyResidentReaction(resident('damiao'),player,strong).intensity>
  nearbyResidentReaction(resident('damiao'),player,weak).intensity);
 assert.equal(residentGestureWarmth('damiao',{...context,living:{people:{damiao:{bond:0}}}}),0);
});

test('Ciça e Nara distinguem apresentação de escolha realmente registrada',()=>{
 const introduced={...context,sideNeighbors:{seen:['cica','nara'],choices:{}}};
 const shared={...context,sideNeighbors:{seen:['cica','nara'],choices:{cica:'fitas',nara:'janela'}}};
 for(const id of ['cica','nara']){
  assert.equal(residentGestureWarmth(id,introduced),.68);
  assert.equal(residentGestureWarmth(id,shared),.88);
  assert.ok(nearbyResidentReaction(resident(id),player,shared).intensity>
   nearbyResidentReaction(resident(id),player,introduced).intensity);
 }
 assert.equal(residentGestureWarmth('cica',{...context,sideNeighbors:{seen:[],choices:{cica:'fitas'}}}),0);
});

test('despedida fica mais calorosa com vínculo, mas conserva duração',()=>{
 const weak={...context,living:{people:{bia:{bond:1}}}};
 const strong={...context,living:{people:{bia:{bond:4}}}};
 const measure=ctx=>{
  const gesture=createPlayerPresenceGestures(),person=resident('bia');
  gesture(person,player,ctx,1);
  gesture(person,player,ctx,3);
  return {wave:gesture(person,{x:52,y:0},ctx,3.1),end:gesture(person,{x:52,y:0},ctx,4.1)};
 };
 const one=measure(weak),four=measure(strong);
 assert.equal(one.wave.pose,'wave');
 assert.ok(four.wave.intensity>one.wave.intensity);
 assert.equal(one.end,null);
 assert.equal(four.end,null);
});

test('reencontro usa somente conversa, cuidado ou gentileza com data comprovada',()=>{
 const dated={living:{day:9,people:{damiao:{bond:2,lastConversationDay:5,lastCareDay:8},lucia:{bond:2,lastConversationDay:4,lastCareDay:0},bia:{bond:1,lastConversationDay:9,lastCareDay:2}}},sideNeighbors:{seen:['cica','nara'],lastHelp:{cica:6,nara:8},choices:{}}};
 assert.equal(recordedInteractionGapDays('damiao',dated),1);
 assert.equal(recordedInteractionGapDays('lucia',dated),5);
 assert.equal(recordedInteractionGapDays('bia',dated),0);
 assert.equal(recordedInteractionGapDays('cica',dated),3);
 assert.equal(recordedInteractionGapDays('nara',dated),1);
});

test('saves antigos e datas inválidas não inventam reencontros',()=>{
 const legacy={living:{day:9,people:{damiao:{bond:1,lastConversationDay:0,lastCareDay:20}}},sideNeighbors:{seen:['cica'],lastHelp:{cica:'5'},choices:{}}};
 assert.equal(recordedInteractionGapDays('damiao',legacy),0);
 assert.equal(recordedInteractionGapDays('cica',legacy),0);
 assert.equal(recordedInteractionGapDays('desconhecido',legacy),0);
});

test('reconhecimento de reencontro é breve e limitado a uma chegada por dia',()=>{
 const gesture=createPlayerPresenceGestures();
 const dated={living:{day:7,people:{lucia:{bond:2,lastConversationDay:3,lastCareDay:0}}},sideNeighbors:{seen:[],choices:{},lastHelp:{}}};
 const person=resident('lucia');
 const arrival=gesture(person,player,dated,20);
 assert.equal(arrival.pose,'smile');
 assert.equal(arrival.stage,'reunion');
 const staying=gesture(person,player,dated,21);
 assert.equal(staying.stage,'nearby');
 assert.ok(arrival.intensity>staying.intensity);
 gesture(person,{x:80,y:0},dated,22);
 assert.equal(gesture(person,player,dated,24).stage,'nearby');
 assert.equal(person.walking,undefined);
});

test('o reencontro não vence atividades nem cria nova fala ou campo de save',()=>{
 const gesture=createPlayerPresenceGestures();
 const dated={living:{day:10,people:{}},sideNeighbors:{seen:['nara'],lastHelp:{nara:3},choices:{nara:'janela'}}};
 const occupied=resident('nara',{moment:{pose:'draw'}});
 assert.equal(gesture(occupied,player,dated,1),null);
 assert.equal(gesture(resident('nara'),player,dated,2).stage,'reunion');
 assert.doesNotMatch(source,/reunionDays,|reunionUntil,\s*sideNeighbors/);
});
