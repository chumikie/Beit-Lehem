'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const source=read('references/gemini-2026-10-31/experimento-anonimizado.html.txt');
const mapText=source.match(/<script[^>]*id="embedded-map-data"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
const data=JSON.parse(mapText);
const pathScript=[...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)]
 .map(m=>m[1]).find(body=>body.includes('Road-network routing for the illustrated Roncador game'));
const pathModule={exports:{}};
vm.runInNewContext(pathScript,{module:pathModule,globalThis:{}});
const graph=pathModule.exports.buildGraph(data.roads);
const neighbors=require('../gemini-modules/secondary-neighbors.js');
const game=read('gemini-modules/game.js');
const previews=['gemini-preview.html','beit-lehem-development.html','beit-lehem-development-mobile.html']
 .map(file=>read('previews/'+file));

test('Bolt usa a origem existente e a rota conectada ao Mercado',()=>{
 assert.deepEqual(data.start.length,2);
 assert.equal(data.landmarks.some(p=>p.id==='casa_varanda'),false);
 assert.match(game,/const home=\{p:data\.start\}/);
 assert.match(game,/walkingPoint\('bolt','inicio',5\)/);
 assert.match(game,/drawStreetPets\(ctx,time,/);
 const market=data.landmarks.find(p=>p.id==='mercado');
 const route=graph.route(data.start,market.p);
 assert.ok(route?.points?.length>=3,'rota mapeada entre o início e o Mercado');
 assert.ok(route.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
});

test('novos moradores têm horários e percursos existentes',()=>{
 const api=global.RoncadorSecondaryNeighbors;
 assert.equal(api.RESIDENTS.length>=6,true);
 for(const def of api.RESIDENTS){
  const place=def.hub.startsWith('missao:')?data.missions[Number(def.hub.slice(7))]:data.landmarks.find(p=>p.id===def.hub);
  assert.ok(place,'lugar de '+def.name);
  assert.ok(graph.route(data.start,place.p),'rota até '+def.name);
 }
 const atNine=api.RESIDENTS.filter(def=>api.agenda({day:1,minute:9*60},def).present);
 assert.ok(['rosa','zeca','mila'].every(id=>atNine.some(p=>p.id===id)));
 assert.ok(api.RESIDENTS.every(def=>!api.agenda({day:1,minute:23*60},def).present));
});

test('as três prévias incluem as versões atuais dos módulos e preservam o save',()=>{
 assert.equal(previews[0],previews[1]);
 assert.equal(previews[1],previews[2]);
 for(const file of ['affection-memory','secondary-neighbors','street-moments','crowd-flow']){
  assert.ok(previews[0].includes(read('gemini-modules/'+file+'.js')),'módulo não integrado: '+file);
 }
 assert.match(previews[0],/const STORE='roncador-expedition-v2-referencias-gemini'/);
 assert.match(previews[0],/Bolt 🐕/);
});

test('o botão de conversa escolhe o morador mais próximo, inclusive secundários',()=>{
 assert.match(game,/const closestSpeaker=residentSnapshot\.concat\(secondarySnapshot\)\.reduce/);
 assert.match(game,/nearSecondary=closestSpeaker\?\.person\.secondary/);
 assert.match(previews[0],/const closestSpeaker=residentSnapshot\.concat\(secondarySnapshot\)\.reduce/);
});

test('opções especiais exibem marca discreta apenas quando disponíveis',()=>{
 assert.ok(game.includes("const special=['banca','janela-bia','paisagem-bia','muda-lucia','amigas']"));
 assert.ok(previews[0].includes("button.textContent=(special&&!already?'✦ ':'')+choice.label;"));
});
