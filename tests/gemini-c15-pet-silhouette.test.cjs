'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const petSource=game.slice(game.indexOf('function drawCozyPetSprite('),game.indexOf('function drawPuddles('));

test('C15.2: preserva os quatro pets originais e identifica os sete animais personalizados',()=>{
 const candidates=petSource.match(/\{id:'[^']+'[^}]+\}/g)||[];
 assert.equal(candidates.length,11);
 assert.equal(candidates.filter(p=>p.includes('cat:true')).length,6);
 assert.equal(candidates.filter(p=>p.includes('cat:false')).length,5);
 for(const name of ['catito','artemis','mimi','hani','jekki','bethowen','bob'])assert.match(petSource,new RegExp("id:'"+name+"'"));
 assert.match(petSource,/if\(coat==='artemis'\)/);
 assert.match(petSource,/const paws=/);
 assert.match(petSource,/if\(coat==='jekki'&&!far\)/);
 assert.match(petSource,/if\(coat==='bethowen'\)/);
 assert.match(petSource,/coat==='bob'\?\.78/);
 assert.match(petSource,/if\(far\)/);
 assert.match(petSource,/far\|\|reduce\|\|behavior\.resting/);
});

test('C15: sombra permanece no chão antes da oscilação do corpo',()=>{
 const operations=[],ctx={
  save(){operations.push(['save']);},restore(){operations.push(['restore']);},scale(){},
  translate(x,y){operations.push(['translate',x,y]);},
  beginPath(){},ellipse(x,y,rx,ry){operations.push(['ellipse',x,y,rx,ry]);},
  fill(){},stroke(){},arc(){},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},closePath(){},
  roundRect(){},fillText(){}
 };
 const scope={Math,zoom:2.35,reduce:false,living:{minute:600},skyMode:'sol',player:{x:100,y:100},
  boltCityPoint:()=>({x:10,y:20}),walkingPoint:()=>({x:10,y:20}),boltRestingByGreen:()=>false,
  streetPetBehavior:()=>({resting:false,bounce:.78,tailRate:3.2,curious:false,observing:false}),
  streetPetVisualOffset:()=>({x:0,y:0}),roundRect:()=>{}};
 const draw=vm.runInNewContext(petSource+';drawStreetPets',scope);
 const queue=[];draw(ctx,1,{left:-100,right:100,top:-100,bottom:100},[],queue);
 assert.equal(queue.length,11);
 for(const item of queue){
  operations.length=0;item.draw();
  const firstMove=operations.findIndex(op=>op[0]==='translate');
  const shadow=operations.findIndex(op=>op[0]==='ellipse'&&op[3]===8&&op[4]===2.3);
  const bounce=operations.findIndex((op,i)=>i>firstMove&&op[0]==='translate');
  assert.ok(firstMove>=0&&shadow>firstMove&&bounce>shadow);
  assert.deepEqual(operations[firstMove],['translate',10,20]);
  assert.equal(operations[bounce][1],0);
 }
});
