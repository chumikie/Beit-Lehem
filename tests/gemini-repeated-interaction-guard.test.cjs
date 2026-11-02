'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const body=source.slice(source.indexOf('function interactAction(){'),source.indexOf('function renderMissions(){'));

function interact({active=true,dialog=false,guide=false,resident=false,secondary=false,visitor=false,mission=-1,culture=false}={}){
 const calls=[];
 const args=['active','anyDialog','player','guide','closestReachableSpeaker','closestReachableVisitor','greetAmbientVisitor','near','nearCulture','talkGuide','talkResident','talkSecondary','collect','showCulture'];
 const nearest=resident?{person:{id:'damiao'},d:12}:secondary?{person:{id:'cica',secondary:true},d:12}:null;
 const values=[active,()=>dialog,{x:0,y:0},guide?{x:0,y:0}:{x:200,y:0},()=>nearest,()=>visitor?{person:{id:'passeio-1'},d:15}:null,()=>calls.push('visitor'),mission,culture?{id:'mercado'}:null,
  ()=>calls.push('guide'),id=>calls.push('resident:'+id),id=>calls.push('secondary:'+id),()=>calls.push('collect'),id=>calls.push('culture:'+id)];
 new Function(...args,body+'\ninteractAction();')(...values);
 return calls;
}

test('repeated interaction during a modal or sidebar cannot start a conversation, visit or collect',()=>{
 for(const options of [{guide:true},{resident:true},{secondary:true},{visitor:true},{mission:0},{culture:true}]){
  assert.deepEqual(interact({...options,dialog:true}),[]);
  assert.deepEqual(interact({...options,active:false}),[]);
 }
});

test('interaction priority remains intact while exploring',()=>{
 assert.deepEqual(interact({guide:true,resident:true,mission:0,culture:true}),['guide']);
 assert.deepEqual(interact({resident:true,mission:0,culture:true}),['resident:damiao']);
 assert.deepEqual(interact({secondary:true,mission:0,culture:true}),['secondary:cica']);
 assert.deepEqual(interact({visitor:true,mission:0,culture:true}),['visitor']);
 assert.deepEqual(interact({mission:0,culture:true}),['collect']);
 assert.deepEqual(interact({culture:true}),['culture:mercado']);
});
