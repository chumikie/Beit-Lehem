'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const a=source.indexOf('function rememberedLandscapeLine('),b=source.indexOf('function meetResident(',a);
assert.ok(a>=0&&b>a);
const landscape=new Function(source.slice(a,b)+';return rememberedLandscapeLine;')();

test('paisagens inspiram diálogo apenas se registradas no diário',()=>{
 assert.equal(landscape(new Set()),'');
 assert.match(landscape(new Set(['mata'])),/fotografou no diário/);
 assert.match(landscape(new Set(['campo'])),/registrou no diário/);
 assert.equal(landscape(new Set(['vila'])),'');
});
test('conexões dependem de fatos salvos, sem criar novos pontos de Rua Nova',()=>{
 assert.match(source,/recadoStage>=1/);
 assert.match(source,/recadoStage===3/);
 assert.match(source,/rememberConnection\(sideNeighbors,'damiaoTeo'\)/);
 assert.match(source,/rememberConnection\(sideNeighbors,'biaTeo'\)/);
 assert.match(source,/sideNeighbors\.connections\?\.zecaLucia===true/);
 assert.match(source,/growth\(luciaGarden,living\.day\)\.stage>=1/);
 assert.match(source,/if\(result\.newMemory\|\|connectionChanged\)\{save\(/);
});
