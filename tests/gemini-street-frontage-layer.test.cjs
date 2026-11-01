'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const studio=require('../gemini-modules/facade-studio.js');

function recorder(){
 const ops=[];
 const target={
  save(){ops.push(['save']);},restore(){ops.push(['restore']);},
  translate(...a){ops.push(['translate',...a]);},beginPath(){ops.push(['beginPath']);},
  rect(...a){ops.push(['rect',...a]);},clip(){ops.push(['clip']);},
  fillRect(...a){ops.push(['fillRect',...a]);},strokeRect(...a){ops.push(['strokeRect',...a]);},
  moveTo(...a){ops.push(['moveTo',...a]);},lineTo(...a){ops.push(['lineTo',...a]);},
  stroke(){ops.push(['stroke']);},fill(){ops.push(['fill']);},
  arc(...a){ops.push(['arc',...a]);},ellipse(...a){ops.push(['ellipse',...a]);},
  clearRect(...a){ops.push(['clearRect',...a]);}
 };
 return{ops,ctx:new Proxy(target,{get(obj,key){if(key in obj)return obj[key];if(typeof key==='string')return(...args)=>ops.push([key,...args]);}})};
}
const blocks=['matriz','feira','joao','clovis','feliciano','vicente'];

test('frentes artísticas cobrem os seis setores sem criar geometria cadastral',()=>{
 for(const block of blocks){
  const home={x:37,y:54,w:24,h:16,seed:11,centralBlock:block,angle:.7,side:1};
  const before=structuredClone(home),{ctx,ops}=recorder();
  assert.equal(studio.draw(ctx,home,'manha',8*60,1.85),true,block);
  assert.deepEqual(home,before,'o desenho não pode alterar posição, dimensões, ângulo ou setor');
  const clipIndex=ops.findIndex(op=>op[0]==='clip');
  assert.ok(clipIndex>0,block+': camada de recuo precisa estar recortada');
  const clipRect=ops.slice(0,clipIndex).find(op=>op[0]==='rect');
  assert.deepEqual(clipRect,['rect',-11.2,3.08,22.4,4.42],block+': recorte fica dentro do envelope ilustrativo existente');
 }
});

test('ritmo de fachada, quintal e portão é determinístico por semente',()=>{
 for(const block of blocks){
  const home={x:0,y:0,w:24,h:16,seed:7,centralBlock:block};
  const a=recorder(),b=recorder();
  studio.draw(a.ctx,home,'tarde',16*60,2.85);
  studio.draw(b.ctx,home,'tarde',16*60,2.85);
  assert.deepEqual(a.ops,b.ops,block+': a arte deve ser reproduzível');
  assert.ok(a.ops.some(op=>op[0]==='clip'),block+': camada de frente presente');
  assert.ok(a.ops.some(op=>op[0]==='stroke'),block+': limites/ritmo desenhados');
 }
});

test('comércio e residência usam vocabulários visuais diferentes sem nomes inventados',()=>{
 const render=block=>{const r=recorder();studio.draw(r.ctx,{x:0,y:0,w:24,h:16,seed:4,centralBlock:block},'manha',9*60,2.85);return r.ops;};
 const residential=render('clovis'),market=render('feira'),commercial=render('feliciano'),bar=render('vicente');
 assert.notDeepEqual(residential,market);
 assert.notDeepEqual(market,commercial);
 assert.ok(market.filter(op=>op[0]==='strokeRect').length>commercial.filter(op=>op[0]==='strokeRect').length);
 assert.ok(bar.some(op=>op[0]==='clip'));
 for(const ops of [residential,market,commercial,bar]){
  assert.equal(ops.filter(op=>op[0]==='fillText').length,0,'não inventar nomes de lojas ou estabelecimentos');
 }
});
