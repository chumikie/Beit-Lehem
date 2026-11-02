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

test('arte: pets ficam menores que moradores sem perder porte relativo nem cores próprias',()=>{
 const source=game.slice(game.indexOf('function drawCozyPetSprite('),game.indexOf('function drawStreetPets('));
 const draw=vm.runInNewContext(source+';drawCozyPetSprite',{Math,roundRect(){}});
 const sizes={};
 for(const [coat,cat] of [['bolt',false],['catito',true],['artemis',true],['mimi',true],
  ['hani',true],['jekki',false],['bethowen',false],['bob',false],['goku',false],['princesa',false]]){
  const ctx={save(){},restore(){},scale(x,y){assert.equal(x,y);sizes[coat]=x;},beginPath(){},
   moveTo(){},lineTo(){},quadraticCurveTo(){},ellipse(){},arc(){},fill(){},stroke(){}};
  draw(ctx,{coat,cat},0,{},true);
  assert.ok(sizes[coat]>=.45&&sizes[coat]<=.8,`${coat} deve ocupar menos mundo ilustrado`);
 }
 assert.ok(sizes.princesa>sizes.goku,'o porte relativo dos cães permanece reconhecível');
 assert.ok(sizes.catito>sizes.artemis,'o porte relativo dos gatos permanece reconhecível');
 assert.match(source,/Colored inner ears/,'orelhas felinas devem conservar desenho próprio');
 assert.doesNotMatch(source,/localStorage|walkingPoint|pet\.x\s*=|pet\.y\s*=/,
  'o refinamento de sprite não muda posição, rota ou save');
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
 const draw=vm.runInNewContext(groupOffsetSource+'\n'+petSource+'\nstreetPetCrowdVisible=()=>true;drawStreetPets',scope);
 const queue=[];draw(ctx,1,{left:-100,right:100,top:-100,bottom:100},[],queue);
 assert.equal(queue.length,13);
 for(const item of queue){
  operations.length=0;item.draw();
  const firstMove=operations.findIndex(op=>op[0]==='translate');
  const shadow=operations.findIndex(op=>op[0]==='ellipse'&&[4,5.5].includes(op[3])&&op[4]===1.5);
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
 const helpers=vm.runInNewContext(groupOffsetSource+';({streetPetCrowdVisible,streetPetNameplateVisible})',{Math});
 const original={x:12,y:24},snapshot=JSON.stringify(original),placed=[];
 assert.equal(helpers.streetPetCrowdVisible(original,placed,1,390),true);
 assert.equal(helpers.streetPetCrowdVisible({x:20,y:24},placed,1,390),false,
  'silhuetas a menos de 104 px não são empilhadas em viewport móvel');
 assert.equal(helpers.streetPetCrowdVisible({x:110,y:24},placed,1,390),false,
  'o corpo ilustrado ainda precisa de respiro maior no mobile');
 assert.equal(helpers.streetPetCrowdVisible({x:120,y:24},placed,1,390),true);
 const desktopPlaced=[{x:12,y:24}];
 assert.equal(helpers.streetPetCrowdVisible({x:80,y:24},desktopPlaced,1,1440),false,
  'o desktop respeita o intervalo visual de 80 px');
 assert.equal(helpers.streetPetCrowdVisible({x:100,y:24},desktopPlaced,1,1440),true);
 const highZoomPlaced=[{x:12,y:24}];
 assert.equal(helpers.streetPetCrowdVisible({x:40,y:24},highZoomPlaced,2,390),false,
  'em zoom alto o limite convertido para unidades do mundo continua consistente');
 assert.equal(helpers.streetPetCrowdVisible({x:70,y:24},highZoomPlaced,2,390),true);
 assert.equal(JSON.stringify(original),snapshot,'o ponto original nunca é alterado');
 assert.equal(placed.length,2);
 assert.equal(helpers.streetPetNameplateVisible({name:'Bolt',bolt:true},1.5,true),false);
 assert.equal(helpers.streetPetNameplateVisible({name:'Bolt',bolt:true},2.1,true),true);
 assert.equal(helpers.streetPetNameplateVisible({name:'Catito'},2.5,true),false);
 assert.equal(helpers.streetPetNameplateVisible({name:'Catito'},3.5,true),false,
  'no celular os nomes dos demais pets permanecem no diário, sem disputar a câmera');
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
test('C15.6: o limite das placas reaproveita o slot de colisão existente',()=>{
 const helpers=vm.runInNewContext(groupOffsetSource+';({streetPetNameplateVisible,streetPetNameplateSlot})',{Math});
 const occupied=[],wide=[{x:0,y:0},{x:100,y:0},{x:200,y:0},{x:300,y:0}];
 assert.equal(helpers.streetPetNameplateVisible({name:'Bolt',bolt:true},2.2,false),true);
 assert.equal(helpers.streetPetNameplateVisible({name:'Catito'},2.2,false),true);
 assert.equal(helpers.streetPetNameplateVisible({name:'Catito'},2.2,true),false);
 for(let i=0;i<3;i++)assert.notEqual(helpers.streetPetNameplateSlot(wide[i],40,occupied,3),null);
 assert.equal(helpers.streetPetNameplateSlot(wide[3],40,occupied,3),null,
  'a quarta placa não deve disputar o mesmo enquadramento desktop');
 assert.equal(occupied.length,3);
 const compact=[];
 assert.equal(helpers.streetPetNameplateSlot(wide[0],40,compact,1,true),-40,
  'a placa móvel usa a faixa mais alta para não ficar sob o direcional');
 assert.equal(helpers.streetPetNameplateSlot(wide[1],40,compact,1,true),null,
  'o slot compacto conserva apenas a identificação prioritária já existente');
});
test('C15.7: o cartão de destino existente não corta o título em telas de 320 px',()=>{
 const hud=game.slice(game.indexOf('function setupMobileWalkingHud()'),game.indexOf('setupMobileWalkingHud();'));
 assert.match(hud,/@media\(max-width:360px\)[\s\S]*\.destination>div\{min-width:0;flex:1\}/);
 assert.match(hud,/\.destination small\{font-size:6px;letter-spacing:.45px;white-space:nowrap\}/);
 assert.match(hud,/\.destination strong\{font-size:9px;line-height:1\.15;white-space:nowrap\}/);
 assert.match(hud,/\.destination #distance\{font-size:8px;margin-left:0;white-space:nowrap\}/);
});
