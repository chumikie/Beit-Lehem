const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
const section=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end));
const blend=new Function(section('function cameraFollowBlend(','let ambientSoundSeconds=' )+';return cameraFollowBlend;')();

test('conversas, cartões culturais e menus congelam a posição da câmera',()=>{
 for(const dt of [.016,.045,.09])for(const reduced of [false,true]){
  assert.equal(blend(dt,reduced,true),0);
  const camera={x:12,y:25},target={x:36,y:40},factor=blend(dt,reduced,true);
  camera.x+=(target.x-camera.x)*factor;
  camera.y+=(target.y-camera.y)*factor;
  assert.deepEqual(camera,{x:12,y:25});
 }
});

test('câmera retoma suavemente ao fechar, respeitando movimento reduzido',()=>{
 assert.ok(blend(.016,false,false)>0);
 assert.ok(blend(.016,false,false)<1);
 assert.equal(blend(.016,true,false),1);
 assert.match(source,/cameraFollowBlend\(dt,reduce,dialog\|\|document\.hidden\)/);
});

test('diálogo não cancela rota de clique e suspende movimento de teclado e toque',()=>{
 const move=section('function move(dt,time){','function frame(t){');
 assert.match(move,/if\(active&&!dialog&&!document\.hidden\)\{/);
 assert.match(move,/else if\(waypoint&&!worldPause\)/);
 assert.match(move,/\}else\{walkVelocity=\{x:0,y:0\};player\.moving=false;\}/);
 assert.match(source,/function showDialog\(id\)\{keys\.clear\(\);touches\.clear\(\);/);
 assert.doesNotMatch(section('function showDialog(id){','let ambientSoundSeconds='),/waypoint=null/);
});

test('fechar diálogos preserva destino, câmera e controles existentes',()=>{
 assert.match(source,/document\.querySelectorAll\('dialog'\)\.forEach\(d=>\{d\.addEventListener\('close',\(\)=>\{keys\.clear\(\);updateUI\(\);\}\)/);
 assert.match(source,/\$\('interact'\)\.onclick=interactAction;\$\('observe'\)\.onclick=observe/);
 assert.match(source,/for\(const b of document\.querySelectorAll\('\[data-move\]'\)\)/);
});
