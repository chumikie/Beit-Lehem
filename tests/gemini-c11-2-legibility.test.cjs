'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync(require('node:path').join(__dirname,'../gemini-modules/game.js'),'utf8');
const houseSource=source.slice(source.indexOf('function house(c,b){'),source.indexOf('function houseVisualBounds(b){'));
const labelGuardSource=source.slice(source.indexOf('function streetLabelBlocked('),source.indexOf('function region(c,detail){'));
const labelsSource=source.slice(source.indexOf(" ctx.textAlign='center';ctx.textBaseline='middle';for(const l of labels)"),source.indexOf(' if(waypoint){const route='));

function canvas(){
 const calls=[];
 const c={globalAlpha:1};
 for(const name of ['save','restore','translate','ellipse','beginPath','fill','stroke','fillRect','moveTo','lineTo','arc','strokeText','fillText','rotate'])
  c[name]=(...args)=>calls.push([name,...args]);
 c.measureText=name=>({width:name.length*4});
 return {c,calls};
}
const home={x:12,y:24,w:18,h:14,angle:Math.PI/2,seed:12,color:1};
function renderHouse(zoom){
 const {c,calls}=canvas();
 const ctx={zoom,lightPhase:'manha',detailedFacades:true,living:{minute:600},window:{RoncadorCentralBlocks:{draw(){calls.push(['central'])}},RoncadorFacadeStudio:{draw(){calls.push(['facade'])}}},roundRect(...args){calls.push(['roundRect',...args])}};
 vm.runInNewContext(`${houseSource}\nhouse(c,b)`,{...ctx,c,b:{...home}});
 return calls;
}

test('zoom 0.65 conserva o telhado sem desenhar portas, janelas ou estudos de fachada',()=>{
 const calls=renderHouse(.65);
 assert.equal(calls.filter(([name])=>name==='roundRect').length,1);
 assert.equal(calls.some(([name])=>name==='fillRect'),false);
 assert.equal(calls.some(([name])=>name==='central'||name==='facade'),false);
});
test('zoom intermediário revela a parede progressivamente e zoom próximo conserva detalhes',()=>{
 const mid=renderHouse(1.05),near=renderHouse(1.85);
 assert.ok(mid.filter(([name])=>name==='roundRect').length>1);
 assert.ok(near.length>mid.length);
 assert.ok(near.some(([name])=>name==='central'));
 assert.ok(near.some(([name])=>name==='facade'));
 assert.equal(home.angle,Math.PI/2);
});
test('nomes OSM usam letras discretas sem placas opacas em todos os zooms',()=>{
 for(const zoom of [.65,1.85,3.5]){
  const {c,calls}=canvas();
  vm.runInNewContext(`${labelGuardSource}\n${labelsSource}`,{ctx:c,labels:[{x:0,y:0,angle:Math.PI/3,name:'Rua Joaquim Rodrigues'}],left:-100,right:100,top:-100,bottom:100,zoom,visibleHouses:[],peopleNearPins:[],roundRect(){calls.push(['roundRect'])}});
  assert.equal(calls.some(([name])=>name==='roundRect'),false);
  assert.equal(calls.filter(([name])=>name==='fillText').length,1);
  assert.equal(calls.filter(([name])=>name==='strokeText').length,1);
 }
});
test('marcador numérico pertence às missões e não é alterado pela C11.2',()=>{
 assert.match(source,/function drawPin\(c,m,i,time/);
 assert.match(source,/fillText\(done\?'✓':String\(i\+1\),0,-22\.5\)/);
});

test('C11.6 suaviza telhado distante sem acrescentar portas',()=>{
 const far=renderHouse(.65),near=renderHouse(1.85);
 const distantRoof=far.find(([name])=>name==='roundRect');
 const nearRoof=near.find(([name])=>name==='roundRect');
 assert.equal(distantRoof.at(-1),'#79594b88');
 assert.equal(nearRoof.at(-1),'#79594b70');
 assert.equal(far.filter(([name])=>name==='roundRect').length,1);
 assert.match(houseSource,/\.82\+\.18\*Math\.max\(0,\(zoom-\.65\)\/\.4\)/);
});

test('C11.4 realça nomes existentes em todos os zooms sem recriar placas',()=>{
 const sizes=[];
 for(const zoom of [.65,1.85,3.5]){
  const {c,calls}=canvas();
  vm.runInNewContext(`${labelGuardSource}\n${labelsSource}`,{ctx:c,labels:[{x:0,y:0,angle:0,name:'Rua Vicente Cado'}],left:-100,right:100,top:-100,bottom:100,zoom,visibleHouses:[],peopleNearPins:[],roundRect(){calls.push(['roundRect'])}});
  sizes.push(Number(c.font.match(/([\d.]+)px/)[1])*zoom);
  assert.equal(c.fillStyle,'#536744');
  assert.equal(c.globalAlpha,.92);
  assert.equal(calls.some(([name])=>name==='roundRect'),false);
 }
 assert.ok(sizes.every(size=>size>=8&&size<=16));
});

test('C11.6 omite somente texto que atravessaria casa ou personagem, sem alterar seus dados',()=>{
 const label={x:0,y:0,angle:Math.PI/3,name:'Rua Vicente Cado'};
 const house={x:0,y:0,w:18,h:14};
 const person={x:0,y:0};
 const input=JSON.stringify({label,house,person});
 const guard=vm.runInNewContext(`${labelGuardSource}\nstreetLabelBlocked`,{});
 assert.equal(guard(label,70,6,[house],[]),true);
 assert.equal(guard(label,70,6,[],[person]),true);
 assert.equal(guard(label,70,6,[{...house,x:200}], [{...person,x:200}]),false);
 assert.equal(JSON.stringify({label,house,person}),input);
});

test('C11.6 ainda desenha nomes em vias livres, mas não sobre fachadas',()=>{
 for(const houses of [[],[{x:0,y:0,w:18,h:14}]]){
  const {c,calls}=canvas();
  vm.runInNewContext(`${labelGuardSource}\n${labelsSource}`,{ctx:c,labels:[{x:0,y:0,angle:0,name:'Rua Vicente Cado'}],left:-100,right:100,top:-100,bottom:100,zoom:1.25,visibleHouses:houses,peopleNearPins:[]});
  assert.equal(calls.filter(([name])=>name==='fillText').length,houses.length?0:1);
 }
 const {c,calls}=canvas();
 vm.runInNewContext(`${labelGuardSource}\n${labelsSource}`,{ctx:c,labels:[{x:0,y:0,angle:0,name:'Rua Vicente Cado'}],left:-100,right:100,top:-100,bottom:100,zoom:.65,visibleHouses:[{x:0,y:0,w:18,h:14}],peopleNearPins:[]});
 assert.equal(calls.filter(([name])=>name==='fillText').length,1,'panorama mantém nomes mesmo em ruas densas');
});
