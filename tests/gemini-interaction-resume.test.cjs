'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');

test('opening and closing interactions flushes held input without discarding the route',()=>{
 const open=source.slice(source.indexOf('function showDialog('),source.indexOf('function cameraFollowBlend('));
 assert.match(open,/keys\.clear\(\);touches\.clear\(\)/);
 assert.doesNotMatch(open,/waypoint\s*=/);
 const handlers=source.slice(source.indexOf("$('mobileRoute').onclick="),source.indexOf("canvas.addEventListener('pointerdown'"));
 assert.match(handlers,/mobileRoute'\)\.onclick=.*?keys\.clear\(\);touches\.clear\(\)/);
 assert.match(handlers,/closeRoute'\)\.onclick=.*?keys\.clear\(\);touches\.clear\(\)/);
 assert.match(handlers,/addEventListener\('close',\(\)=>\{keys\.clear\(\);touches\.clear\(\);updateUI\(\)/);
});

test('mobile movement cannot replace a click destination while a menu is open',()=>{
 const movementStart=source.indexOf("for(const b of document.querySelectorAll('[data-move]'))");
 const movement=source.slice(movementStart,source.indexOf("window.addEventListener('keydown'",movementStart));
 assert.match(movement,/if\(!active\|\|anyDialog\(\)\)return/);
 assert.match(movement,/touches\.set\(e\.pointerId,b\.dataset\.move\);waypoint=null/);
 assert.match(source,/else if\(waypoint&&!worldPause\)/);
 assert.match(source,/cameraFollowBlend\(dt,reduce,dialog\|\|document\.hidden\)/);
});
