'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const move=source.slice(source.indexOf('function move(dt,time){'),source.indexOf('function ',source.indexOf('function move(dt,time){')+9));
const note=source.slice(source.indexOf('function note('),source.indexOf('function pointSegment('));

test('passos a pé soam sem Shift com volume menor e pisos reais',()=>{
 assert.match(move,/else if\(sound\)\{/);
 assert.match(move,/surf==='sett'\|\|surf==='paving_stones'/);
 assert.match(move,/note\(148,0,\.022,\.008\);note\(162,\.035,\.022,\.006\)/);
 assert.match(move,/\['unpaved','dirt','ground'\]/);
 assert.match(move,/note\(96,0,\.028,\.009\)/);
 assert.match(move,/note\(124,0,\.02,\.007\)/);
 assert.doesNotMatch(move,/else if\(sound&&keys\.has\('shift'\)\)/);
});

test('ambiente é localizado por marcos mapeados, a cada nove segundos e só com som',()=>{
 assert.match(move,/if\(sound\)\{\s*ambientSoundSeconds\+=dt/);
 assert.match(move,/ambientSoundSeconds>=9/);
 assert.match(move,/p\.id==='igreja'/);
 assert.match(move,/living\.minute>=11\*60\+55&&living\.minute<=12\*60\+10/);
 assert.match(move,/living\.minute>=17\*60&&living\.minute<=17\*60\+20/);
 assert.match(move,/note\(523,0,\.26,\.013\);note\(659,\.13,\.32,\.010\)/);
 assert.match(move,/\['parque_sao_luis','pedra_cordeiro'\]/);
 assert.match(move,/a\.tags\?\.name==='Mato'/);
 assert.match(move,/note\(1180,0,\.07,\.007\);note\(1480,\.11,\.08,\.006\)/);
 assert.match(note,/if\(!sound\)return/);
 assert.match(note,/volume=\.045/);
});
