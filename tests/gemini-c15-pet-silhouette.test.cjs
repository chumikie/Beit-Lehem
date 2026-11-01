'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const groupOffsetSource=game.slice(game.indexOf('function streetPetGroupOffset('),game.indexOf('function drawCozyPetSprite('));
const petSource=game.slice(game.indexOf('function drawCozyPetSprite('),game.indexOf('function drawPuddles('));

test('C15.3: preserva os quatro pets originais e identifica nove animais personalizados',()=>{
 const candidates=petSource.match(/\{id:'[^']+'[^}]+\}/g)||[];
 assert.equal(candidates.length,13);
 assert.equal(candidates.filter(p=>p.includes('cat:true')).length,6);
 assert.equal(candidates.filter(p=>p.includes('cat:false')).length,7);
 for(const name of ['catito','artemis','mimi','hani','jekki','bethowen','bob','goku','princesa'])assert.match(petSource,new RegExp("id:'"+name+"'"));
 assert.match(petSource,/if\(coat==='artemis'\)/);
 assert.match(petSource,/const paws=/);
 assert.match(petSource,/if\(coat==='jekki'&&!far\)/);
 assert.match(petSource,/if\(coat==='bethowen'\)/);
 assert.match(petSource,/coat==='bob'\?\.78/);
 assert.match(petSource,/if\(far\)/);
 assert.match(petSource,/far\|\|reduce\|\|behavior\.resting/);
});

test('C15: nomes dos pets não competem pelo mesmo espaço visual',()=>{
 const helpers=vm.runInNewContext(groupOffsetSource+';({streetPetNameplateVisible,streetPetNameplateSlot})');
 assert.equal(helpers.streetPetNameplateVisible({name:'Bolt',bolt:true},1.3),true);
 assert.equal(helpers.streetPetNameplateVisible({name:'Catito'},1.3),false);
 assert.equal(helpers.streetPetNameplateVisible({name:'Catito'},2.2),true);
 const occupied=[];
 const first=helpers.streetPetNameplateSlot({x:0,y:0},60,occupied);
 const second=helpers.streetPetNameplateSlot({x:10,y:0},60,occupied);
 const third=helpers.streetPetNameplateSlot({x:20,y:0},60,occupied);
 assert.notEqual(first,second,'placas vizinhas devem ocupar faixas diferentes');
 assert.notEqual(second,third,'a terceira placa não deve cobrir as anteriores');
 for(let i=0;i<occupied.length;i++)for(let j=i+1;j<occupied.length;j++){
  const a=occupied[i],b=occupied[j];
  assert.equal(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top,false,
   'retângulos ocupados não podem se sobrepor');
 }
 const far=helpers.streetPetNameplateSlot({x:500,y:0},60,occupied);
 assert.equal(far,-28,'uma placa distante pode reutilizar a primeira faixa livre');
});

test('C15: sombra permanece no chão antes da oscilação do corpo',()=>{
 const operations=[],ctx={
  save(){operations.push(['save']);},restore(){operations.push(['restore']);},scale(){},rotate(){},
  translate(x,y){operations.push(['translate',x,y]);},
  beginPath(){},ellipse(x,y,rx,ry){operations.push(['ellipse',x,y,rx,ry]);},
  fill(){},stroke(){},arc(){},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},closePath(){},
  roundRect(){},fillText(){}
 };
 const scope={Math,w:1440,zoom:20,reduce:false,living:{minute:600},skyMode:'sol',player:{x:100,y:100},
  boltCityPoint:()=>({x:10,y:20}),walkingPoint:()=>({x:10,y:20}),boltRestingByGreen:()=>false,
  streetPetBehavior:()=>({resting:false,bounce:.78,tailRate:3.2,curious:false,observing:false}),
  streetPetVisualOffset:()=>({x:0,y:0}),streetPetCrowdVisible:()=>true,
  streetPetGesture:()=> 'none',roundRect:()=>{}};
 const draw=vm.runInNewContext(groupOffsetSource+'\n'+petSource+';drawStreetPets',scope);
 const queue=[];draw(ctx,1,{left:-100,right:100,top:-100,bottom:100},[],queue);
 assert.equal(queue.length,13);
 for(const item of queue){
  operations.length=0;item.draw();
  const firstMove=operations.findIndex(op=>op[0]==='translate');
  const shadow=operations.findIndex(op=>op[0]==='ellipse'&&op[3]===8&&op[4]===2.3);
  const bounce=operations.findIndex((op,i)=>i>firstMove&&op[0]==='translate');
  assert.ok(firstMove>=0&&shadow>firstMove&&bounce>shadow);
  assert.ok(Math.hypot(operations[firstMove][1]-10,operations[firstMove][2]-20)<=9.01,
   'o deslocamento visual entre pets não pode ultrapassar nove unidades');
  assert.equal(operations[bounce][1],0);
 }
});

test('C15.3: reações são determinísticas, próximas e não alteram coordenadas',()=>{
 const gestureSource=game.slice(game.indexOf('function streetPetGesture('),game.indexOf('function streetPetVisualOffset('));
 const gesture=vm.runInNewContext(gestureSource+';streetPetGesture');
 const at={x:10,y:20,walking:false},friend={id:'bolt',at:{x:20,y:20}},snapshot=JSON.stringify(at);
 assert.equal(gesture({coat:'bethowen'},at,[friend],600,'sol',null),'friend');
 assert.equal(gesture({coat:'bethowen'},at,[{id:'bolt',at:{x:100,y:100}}],600,'sol',null),'none');
 assert.equal(gesture({coat:'bob'},at,[],600,'sol',null),'sniff');
 assert.equal(gesture({coat:'artemis'},at,[{id:'catito',at:{x:12,y:20}}],600,'sol',null),'play');
 assert.equal(gesture({coat:'hani'},at,[],600,'sol',null),'sleep');
 assert.equal(gesture({coat:'jekki'},at,[],600,'sol',{x:14,y:20}),'greet');
 assert.equal(gesture({coat:'goku'},at,[],600,'sol',{x:14,y:20}),'shy');
 assert.equal(gesture({coat:'goku'},at,[],600,'chuvisco',{x:14,y:20}),'none');
 assert.equal(gesture({coat:'princesa'},at,[{id:'bob',at:{x:12,y:20}}],600,'sol',null),'play');
 assert.equal(gesture({coat:'artemis'},{...at,walking:true},[{id:'catito',at}],600,'sol',null),'none');
 assert.equal(JSON.stringify(at),snapshot);
});

test('C15.5: densidade de pets é decluttered em pixels sem mover pontos de rota',()=>{
 const helpers=vm.runInNewContext(groupOffsetSource+
  ';({streetPetCrowdVisible,streetPetNameplateVisible})',{Math});
 const original={x:12,y:24},snapshot=JSON.stringify(original),placed=[];
 assert.equal(helpers.streetPetCrowdVisible(original,placed,1,390),true);
 assert.equal(helpers.streetPetCrowdVisible({x:20,y:24},placed,1,390),false,
  'silhuetas a menos de 44 px não são empilhadas em viewport móvel');
 assert.equal(helpers.streetPetCrowdVisible({x:50,y:24},placed,1,390),true);
 assert.equal(helpers.streetPetCrowdVisible({x:20,y:24},[],1,1440),true,
  'a densidade desktop mantém o intervalo menor');
 assert.equal(helpers.streetPetCrowdVisible({x:20,y:24},[],2,390),true,
  'em zoom alto a distância mínima em unidades do mundo diminui');
 assert.equal(JSON.stringify(original),snapshot,'o ponto original nunca é alterado');
 assert.equal(placed.length,2);
 assert.equal(helpers.streetPetNameplateVisible({name:'Bolt',bolt:true},1.5,true),false);
 assert.equal(helpers.streetPetNameplateVisible({name:'Bolt',bolt:true},2.1,true),true);
 assert.equal(helpers.streetPetNameplateVisible({name:'Catito'},2.5,true),false);
 assert.equal(helpers.streetPetNameplateVisible({name:'Catito'},3.5,true),false,\n  'no celular os nomes dos demais pets permanecem no diário, sem disputar a câmera');
});

test('C15.5: a câmera usa a largura real do canvas para ativar o perfil compacto',()=>{
 const source=game.slice(game.indexOf('function drawStreetPets('),game.indexOf('function drawPuddles('));
 assert.match(source,/const compactViewport=w<=600/);
 assert.match(source,/streetPetCrowdVisible\(visualCenter,drawnPetCenters,zoom,w\)/);
});

test('C15.5: nomes de moradores ficam limitados a uma placa no mobile',()=>{
 const source=game.slice(game.indexOf('function layoutResidentNameplates('),
  game.indexOf('function drawDistantResident('));
 assert.match(source,/const limit=phone\?1:marketCrowd\?2:3/);
});
