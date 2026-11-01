'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const garden=require('../gemini-modules/lucia-garden.js');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const first=game.indexOf('function gardenStageDialogue('),last=game.indexOf('function meetResident(',first);
assert.ok(first>=0&&last>first);
const dialogue=new Function(game.slice(first,last)+';return gardenStageDialogue;')();

test('quatro etapas do jardim provocam falas diferentes e não geram novas coordenadas',()=>{
 const lines=[];
 for(let stage=0;stage<=3;stage++)lines.push(dialogue('lucia',{stage}));
 assert.equal(new Set(lines).size,4);
 assert.match(lines[3],/flor/);
 assert.match(dialogue('zeca',{stage:2}),/botão/);
 assert.match(dialogue('zeca',{stage:3}),/conversa/);
 assert.equal(dialogue('lucia',null),'');
});

test('crescimento se recupera após dias sem visitas, sem avançar o relógio por leitura',()=>{
 const state=garden.fresh();
 garden.meet(state);for(const task of garden.TASKS)assert.equal(garden.doWork(state,task.id),true);
 assert.equal(garden.chooseMemory(state,'quintal'),true);
 assert.equal(garden.claim(state,6),true);
 const old=JSON.stringify(state),restored=garden.restore(JSON.parse(old));
 assert.equal(garden.growth(restored,6).stage,0);
 assert.equal(garden.growth(restored,7).stage,1);
 assert.equal(garden.growth(restored,9).stage,2);
 assert.equal(garden.growth(restored,11).stage,3);
 assert.equal(garden.growth(restored,50).stage,3);
 assert.equal(JSON.stringify(restored),old);
});

test('lembrança florida deriva apenas do estado alcançado e é desenhada no álbum existente',()=>{
 assert.match(game,/luciaGarden\.claimed&&window\.RoncadorLuciaGarden\.growth\(luciaGarden,living\.day\)\.flower/);
 assert.match(game,/title\.textContent='A flor que esperou'/);
 assert.match(game,/sideNeighbors\.connections\?\.zecaLucia===true/);
});
