'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const section=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));

test('objetos verticais entram na fila única pela base no chão',()=>{
 const render=section('function render(time){','function ');
 assert.match(source,/sortY:houseGroundDepth\(b\)/);
 assert.match(source,/sortY:tree\.y\+2/);
 assert.match(source,/sortY:mission\.p\[1\]/);
 assert.match(source,/sortY:guide\.y/);
 assert.match(source,/sortY:player\.y/);
 assert.match(source,/sortY:person\.y/);
 assert.match(source,/sortY:at\.y/);
 assert.match(source,/renderables\.sort\(\(a,b\)=>a\.sortY-b\.sortY\)/);
 assert.match(source,/for\(const item of renderables\)item\.draw\(\)/);
});

test('balões, placas de moradores e emojis vêm depois dos objetos ordenados',()=>{
 const render=source.slice(source.indexOf('function render(time){'),source.indexOf('function ',source.indexOf('function render(time){')+1));
 const ordered=render.indexOf('for(const item of renderables)item.draw()');
 assert.ok(ordered>=0);
 assert.ok(render.indexOf('for(const draw of speechOverlays)draw()')>ordered);
 assert.ok(render.indexOf('for(const ep of emojiParticles)')>ordered);
 assert.ok(render.indexOf('drawStreetEncounter(ctx,time')>ordered);
 assert.match(source,/if\(speechOverlays\)speechOverlays\.push\(drawNameplates\)/);
});

test('cobertura do território reserva células antes de preencher o orçamento de casas',()=>{
 const build=section('function preprocess(){','function house(c,b){');
 assert.match(build,/const occupied=\[\],candidates=\[\]/);
 assert.match(build,/selected\.size>=1350/);
 assert.match(build,/candidates\.forEach\(\(b,i\)=>\{if\(!covered\.has\(cell\(b\)\)\)take\(b,i\);\}\)/);
 assert.match(build,/nearFeliciano\(b\)/);
});
