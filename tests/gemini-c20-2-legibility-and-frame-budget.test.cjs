'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const landmarks=fs.readFileSync(require.resolve('../gemini-modules/landmarks.js'),'utf8');

function pureFunction(name,after){
 const start=game.indexOf('function '+name+'('),end=game.indexOf(after,start);
 assert.ok(start>=0&&end>start,'função '+name+' presente');
 return vm.runInNewContext(game.slice(start,end)+'\n'+name);
}
const speechCardRect=pureFunction('speechCardRect','function drawScreenSpeechCard(');
const scenicCaptionFitsHud=pureFunction('scenicCaptionFitsHud','function drawScenicLayer(');
const mobileFrameInterval=pureFunction('mobileFrameInterval','let lastPaint=');

test('balões permanecem dentro do espaço de leitura no celular estreito e normal',()=>{
 for(const [width,height] of [[320,640],[390,844]]){
  for(const [x,y] of [[-40,-100],[width/2,height/2],[width+45,height+30]]){
   const card=speechCardRect(x,y,Math.min(248,width-24),108,width,height,true);
   assert.ok(card.left>=12&&card.left+card.width<=width-12);
   assert.ok(card.top>=Math.min(310,height*.44),'balão não deve cobrir os cartões superiores do HUD');
   assert.ok(card.top+card.height<=height-Math.min(116,height*.21));
  }
 }
});

test('rótulos extensos não invadem as bordas ou HUD móvel',()=>{
 assert.equal(scenicCaptionFitsHud(320,640,160,500,210,true),true);
 assert.equal(scenicCaptionFitsHud(320,640,160,560,210,true),false);
 assert.equal(scenicCaptionFitsHud(320,640,160,210,210,true),false);
 assert.equal(scenicCaptionFitsHud(320,640,160,275,210,true,18),false);
 assert.equal(scenicCaptionFitsHud(390,844,55,400,120,true),false);
 assert.equal(scenicCaptionFitsHud(390,844,200,400,120,true),true);
 assert.match(landmarks,/labelOptions\.allowCaption !== false/);
 assert.match(game,/scenicCaptionFitsHud\(w,h,signX,signY,68\*zoom,w<=600,6\*zoom\)/);
});

test('os três balões usam coordenadas CSS e cedem espaço à fala prioritária',()=>{
 const drawCard=game.slice(game.indexOf('function drawScreenSpeechCard('),game.indexOf('function drawStreetEncounter('));
 assert.match(drawCard,/c\.getTransform\(\)/);
 assert.match(drawCard,/c\.setTransform\(dpr,0,0,dpr,0,0\)/);
 assert.match(game,/drawScreenSpeechCard\(c,speechX,speechBottom,null,phrase/);
 assert.match(game,/drawScreenSpeechCard\(c,cx,cy-45,who,spoken/);
 assert.match(game,/drawScreenSpeechCard\(c,cx,cy-45\+bounce,speaker,speech/);
 assert.match(game,/!streetConversation\|\|streetConversation\.pending\|\|performance\.now\(\)>=streetConversation\.until/);
});

test('orçamento móvel reduz desenhos sem mudar ritmo temporal do movimento',()=>{
 assert.equal(mobileFrameInterval(320,false),125);
 assert.equal(mobileFrameInterval(390,true),1000/30);
 assert.equal(mobileFrameInterval(1440,true),0);
 const frame=game.slice(game.indexOf('function frame(t){'),game.indexOf('function canvasWorldPoint('));
 assert.match(frame,/t-lastPaint>=interval/);
 assert.match(frame,/const dt=last\?Math\.min\(\(t-last\)\/1000,\.045\):\.016/);
 assert.match(frame,/move\(dt,t\/1000\);render\(t\/1000\)/);
});
