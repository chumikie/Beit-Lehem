'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const file=require.resolve('../gemini-modules/secondary-neighbors.js');
delete require.cache[file];
require(file);
const model=globalThis.RoncadorSecondaryNeighbors;

test('recados atravessam Rodoviária → Rosa → Rodoviária sem inventar coordenadas',()=>{
 const state=model.fresh(),clock={day:1,minute:10*60};
 assert.equal(model.recadoStage(state),0);
 assert.equal(model.interact(state,clock,'teo','envelope').threadAdvanced,false);
 // A single interaction per person per day is preserved.
 clock.day=2;
 assert.equal(model.interact(state,clock,'teo','recado').threadAdvanced,true);
 assert.equal(model.recadoStage(state),1);
 assert.equal(model.interact(state,clock,'rosa','caderno').threadAdvanced,true);
 assert.equal(model.recadoStage(state),2);
 clock.day=3;
 const result=model.interact(state,clock,'teo','envelope');
 assert.equal(result.threadComplete,true);
 assert.equal(model.recadoStage(state),3);
 assert.match(model.recadoLine(state,'teo'),/viagem de volta/);
 assert.equal(model.recadoStage(model.restore(JSON.parse(JSON.stringify(state)))),3);
});

test('save antigo mantém escolhas e inicia recados sem perder amizades',()=>{
 const legacy={seen:['teo','rosa'],lastHelp:{teo:5},choices:{teo:'recado'}};
 const restored=model.restore(legacy);
 assert.deepEqual(restored.seen,['rosa','teo']);
 assert.equal(restored.lastHelp.teo,5);
 assert.equal(restored.choices.teo,'recado');
 assert.equal(model.recadoStage(restored),0);
 assert.equal(model.recadoStage(model.restore({recados:{stage:99}})),0);
});

test('personagem indisponível não avança nem altera a missão',()=>{
 const state=model.fresh(),clock={day:1,minute:2*60};
 assert.equal(model.interact(state,clock,'teo','recado').ok,false);
 assert.equal(model.recadoStage(state),0);
});
test('uma conversa cruzada só vira memória uma vez e persiste no save',()=>{
 const state=model.fresh();
 assert.equal(model.rememberConnection(state,'damiaoTeo'),true);
 assert.equal(model.rememberConnection(state,'damiaoTeo'),false);
 assert.equal(model.rememberConnection(state,'inexistente'),false);
 assert.equal(model.rememberConnection(state,'biaTeo'),true);
 const restored=model.restore(JSON.parse(JSON.stringify(state)));
 assert.deepEqual(restored.connections,{damiaoTeo:true,biaTeo:true,zecaLucia:false,zecaLuciaDay:0});
 assert.equal(model.rememberConnection(restored,'biaTeo'),false);
 assert.deepEqual(model.restore({}).connections,{damiaoTeo:false,biaTeo:false,zecaLucia:false,zecaLuciaDay:0});
});
test('Zeca guarda o encontro sobre a muda mesmo após outras escolhas futuras',()=>{
 const state=model.fresh(),clock={day:2,minute:10*60};
 const action=model.interact(state,clock,'zeca','muda-lucia',{luciaGarden:{claimed:true}});
 assert.equal(action.ok,true);
 assert.equal(state.connections.zecaLucia,true);
 assert.equal(state.connections.zecaLuciaDay,2);
 clock.day=3;
 assert.equal(model.interact(state,clock,'zeca','vasos').ok,true);
 assert.equal(model.restore(state).connections.zecaLucia,true);
 assert.equal(model.restore(state).connections.zecaLuciaDay,2);
});
