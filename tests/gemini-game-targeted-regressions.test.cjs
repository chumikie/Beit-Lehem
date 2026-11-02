'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const section=(begin,end)=>source.slice(source.indexOf(begin),source.indexOf(end,source.indexOf(begin)));

test('marcos com latitude e escola pública seguem o eixo Y positivo ao sul',()=>{
 const start=source.indexOf('function applyUserPublicPlaceCorrections(');
 const places=source.slice(start,start+2200);
 assert.match(places,/projection\.originLat-place\.geo\[0\]/);
 assert.match(places,/projection\.originLat-\(-6\.6984949\)/);
 assert.match(source,/lat:proj\.originLat-p\[1\]\/proj\.metersPerDegreeLat/);
});

test('observação privilegia o momento local antes da fotografia genérica',()=>{
 const observe=section('function observe(){','function interactAction(');
 assert.ok(observe.indexOf('if(observeWorldMoment())return;')<observe.indexOf("let key='vila'"));
 assert.equal(observe.match(/if\(observeWorldMoment\(\)\)return;/g)?.length,1);
});

test('o Caderno de Retorno só atualiza a última leitura quando fecha',()=>{
 const show=section('function showLife(){','function visitStreetEncounter(');
 assert.doesNotMatch(show,/lastJournalDay\s*=/);
 assert.match(source,/\$\('lifeDialog'\)\.addEventListener\('close',\(\)=>\{if\(!loaded\)return;lastJournalDay=living\.day;save\(\);\}\)/);
 assert.match(source,/elapsed=Math\.max\(0,Math\.min\(86400,Number\(saved\.elapsed\)\|\|0\)\)/,
  'o tempo acumulado de jogo dos saves existentes não deve ser truncado');
});
