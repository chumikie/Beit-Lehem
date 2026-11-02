'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');

function canvasWithInheritedStroke(strokeWidth=7.52){
 const saved=[],text=[];
 return {
  lineWidth:strokeWidth,text,
  save(){saved.push(this.lineWidth);},
  restore(){this.lineWidth=saved.pop();},
  translate(){},beginPath(){},ellipse(){},fill(){},arc(){},stroke(){},
  fillText(name){text.push(name);}
 };
}

test('as etiquetas de Jekki e Princesa não herdam traço grosso de ruas e cenários',()=>{
 const start=source.indexOf('function drawStreetPets('),end=source.indexOf('function drawPuddles(',start);
 assert.ok(start>0&&end>start);
 const drawn=[];
 const paint=(c,x,y,width,height,radius,fill,stroke)=>{
  if(stroke==='#b89f7d')drawn.push({width:c.lineWidth,fill,stroke});
 };
 const pets=vm.runInNewContext(source.slice(start,end)+';drawStreetPets',{
  living:{minute:9*60},w:1440,zoom:3.5,reduce:true,skyMode:'sol',player:{x:0,y:0},
  boltCityPoint:()=>({x:0,y:0}),walkingPoint:()=>({x:0,y:0}),boltRestingByGreen:()=>false,
  streetPetBehavior:()=>({bounce:0,resting:true}),streetPetGesture:()=> 'none',
  streetPetGroupOffset:()=>({x:0,y:0}),streetPetCrowdVisible:()=>true,
  streetPetNameplateVisible:pet=>pet.id==='jekki'||pet.id==='princesa',
  streetPetNameplateSlot:()=>-28,drawCozyPetSprite:()=>{},roundRect:paint
 });
 const canvas=canvasWithInheritedStroke();
 pets(canvas,0,{left:-20,right:20,top:-20,bottom:20});
 assert.equal(drawn.length,2,'ambos os animais continuam com seus nomes');
 assert.ok(drawn.every(label=>label.width===.7),'borda fina explícita em vez de 7,52');
 assert.equal(canvas.lineWidth,7.52,'o estado do Canvas anterior é restaurado');
});

test('etiqueta de Bia preserva texto e restaura a largura do Canvas',()=>{
 const start=source.indexOf('const drawNameplates=()=>{for(const label of nameplates){');
 const end=source.indexOf('if(speechOverlays)speechOverlays.push(drawNameplates);else drawNameplates();',start);
 assert.ok(start>0&&end>start);
 const drawn=[];
 const paint=(c,x,y,width,height,radius,fill,stroke)=>{
  if(stroke==='#b4c2a1')drawn.push({width:c.lineWidth,fill,stroke});
 };
 const render=vm.runInNewContext(`(c,nameplates)=>{
  const speechActive=false,speaker=null,speechX=0,speechWidth=0,speechBottom=0;
  ${source.slice(start,end)}
  drawNameplates();
 }`,{roundRect:paint});
 const canvas=canvasWithInheritedStroke();
 render(canvas,[{id:'bia',name:'Bia',x:0,y:0,width:31}]);
 assert.deepEqual(canvas.text,['Bia']);
 assert.equal(drawn.length,1);
 assert.equal(drawn[0].width,.7);
 assert.equal(canvas.lineWidth,7.52,'a borda de Bia não afeta o traço posterior');
});
