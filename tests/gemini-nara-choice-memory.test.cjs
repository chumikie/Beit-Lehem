'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const affection=require('../gemini-modules/affection-memory.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;

function recollection(choice){
 const saved=neighbors.restore({seen:['nara'],choices:{nara:choice},lastHelp:{nara:3}});
 const state={living:{day:6,minute:15*60,people:{}},sideNeighbors:saved,communitySeen:[],marketMorning:{claimed:false},luciaGarden:{claimed:false},biaLetters:{claimed:false}};
 const before=JSON.stringify(state);
 const result=affection.snapshot(state,'nara');
 assert.equal(JSON.stringify(state),before,'ler a lembrança não modifica o save');
 return result;
}

test('Nara recorda a observação da luz sem inventar um desenho',()=>{
 const memory=recollection('sombra');
 assert.equal(memory.remembered,true);
 assert.match(memory.line,/luz nas fachadas.*observamos/);
 assert.doesNotMatch(memory.line,/desenham|desenhamos|página/i);
 assert.equal(memory.short,'a luz que observamos');
});

test('a escolha real de desenhar mantém a lembrança anterior',()=>{
 const memory=recollection('desenho');
 assert.match(memory.line,/página que desenhamos juntos/);
 assert.equal(memory.short,'nosso primeiro desenho');
 const unrecorded=affection.snapshot({living:{day:6,minute:900,people:{}},sideNeighbors:neighbors.restore({})},'nara');
 assert.equal(unrecorded.remembered,false);
});
