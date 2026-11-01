'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
const stages=['chuva','claridade','terra','bia-ouviu','lembranca'];
function extract(name){
 const start=source.indexOf('function '+name+'(');
 assert.ok(start>=0,name+' existe');
 let depth=0,open=source.indexOf('{',start),end=open;
 for(;end<source.length;end++){
  if(source[end]==='{')depth++;
  if(source[end]==='}'&&!--depth)break;
 }
 return source.slice(start,end+1);
}
const context=vm.createContext({CAMUCA_STAGES:stages});
vm.runInContext(extract('camucaHasRestored')+'\n'+extract('restoreCamucaStories'),context);
const restore=raw=>JSON.parse(JSON.stringify(vm.runInContext('restoreCamucaStories(input,12)',Object.assign(context,{input:raw}))));
test('Camucá: somente acontecimentos reais, ordenados e de dias distintos persistem',()=>{
 const rows=stages.map((stage,i)=>({stage,day:i+2+(i===4?2:0),...(i===0?{weather:'chuvisco'}:{})}));
 assert.deepEqual(restore(rows),rows);
 assert.deepEqual(restore([...rows,{stage:'lembranca',day:12}]),rows);
 assert.deepEqual(restore([{stage:'lembranca',day:2},...rows]),rows);
 assert.deepEqual(restore([{stage:'chuva',day:2,weather:'sol'},...rows]),rows);
 assert.deepEqual(restore([{stage:'chuva',day:2,weather:'chuvisco'},{stage:'claridade',day:2}]),[{stage:'chuva',day:2,weather:'chuvisco'}]);
 assert.deepEqual(restore(rows.map(r=>r.stage==='lembranca'?{...r,day:6}:r)),rows.slice(0,-1));
});
test('Camucá: sem trilha falsa, recompensa ou lembrança automática dos moradores',()=>{
 assert.match(source,/worldMomentAt\(data,player\)!=='mato'/);
 assert.match(source,/skyMode==='chuvisco'/);
 assert.match(source,/skyMode==='sol'&&living\.day>rain\.day/);
 assert.match(source,/id==='bia'&&camucaHas\('terra'\)/);
 assert.match(source,/camucaStories=restoreCamucaStories\(saved\.camucaStories,living\.day\)/);
 assert.match(source,/camucaStories=\[\];worldPause=null/);
 assert.doesNotMatch(extract('recordCamucaStage'),/coins|reward|friendship\+\+|setRoute/);
});
