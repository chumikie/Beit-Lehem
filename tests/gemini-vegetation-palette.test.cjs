'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','gemini-modules','game.js'),'utf8');
const script=source.slice(source.indexOf('function drawTree('),source.indexOf('function drawRuralShrub('))+
 '\n'+source.slice(source.indexOf('function drawGroundedFlora('),source.indexOf('function drawClovisNeighborhoodScene('));
const points=[{x:0,y:0,kind:'canopy',seed:5},{x:25,y:0,kind:'shade',seed:4},
 {x:50,y:0,kind:'meadow',seed:6},{x:75,y:0,kind:'underbrush',seed:8},
 {x:100,y:0,kind:'flowerbed',seed:2}];
function render(phase){
 const ops=[],c={};
 for(const name of ['save','restore','translate','beginPath','ellipse','arc','fill','stroke','fillRect','moveTo','lineTo','quadraticCurveTo'])
  c[name]=(...args)=>ops.push([name,...args]);
 const roundRect=(ctx,x,y,w,h,r,fill)=>{ctx.beginPath();ctx.fillStyle=fill;ctx.fill();};
 const draw=new Function('lightPhase','roundRect','showGroundedFlora','floraLayer','verifiedWater',script+'return drawGroundedFlora;')
  (phase,roundRect,true,{points},[]);
 draw(c,{left:-5,right:150,top:-5,bottom:30},0);
 return ops;
}
test('flora preserva quantidade e geometria ao variar tons de manhã, tarde e noite',()=>{
 const morning=render('manha'),afternoon=render('tarde'),night=render('anoitecer');
 assert.equal(morning.length,148);
 assert.equal(afternoon.length,morning.length);
 assert.equal(night.length,morning.length);
 assert.equal(morning.filter(x=>x[0]==='translate').length,3,'apenas as três touceiras existentes recebem translação');
 assert.ok(source.includes("tone==='shade'"),'sombra tem paleta própria');
 assert.ok(source.includes("tone==='canopy'"),'copa tem paleta própria');
});
