'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
function extract(begin,end){const a=source.indexOf(begin),b=source.indexOf(end,a);assert.ok(a>=0&&b>a);return source.slice(a,b);}
const behavior=new Function('boltRestingByGreen',extract('function streetPetBehavior(','function drawStreetPets(')+';return streetPetBehavior;')(()=>false);
test('animais observam o jogador apenas enquanto estão parados e sem chuva',()=>{
 const pet={cat:true},at={x:20,y:30,walking:false},player={x:29,y:30};
 const before=JSON.stringify(at);
 assert.equal(behavior(pet,at,9*60,'sol',player).curious,true);
 assert.equal(behavior(pet,{...at,walking:true},9*60,'sol',player).curious,false);
 assert.equal(behavior(pet,at,9*60,'chuvisco',player).curious,false);
 assert.equal(behavior(pet,at,9*60,'sol',{x:90,y:30}).curious,false);
 assert.equal(JSON.stringify(at),before);
});
test('Bolt percorre apenas vértices da via e retorna continuamente sem teleporte',()=>{
 const living={minute:480},data={start:[0,0],landmarks:[{id:'mercado',p:[20,10]}]};
 const pathfinder={route(){return{points:[{x:0,y:0},{x:10,y:0},{x:20,y:0},{x:20,y:10}]};}};
 const route=new Function('data','pathfinder','living','walkingPoint',extract('let boltMarketRoad=null;','function boltRestingByGreen(')+';return boltCityPoint;')(data,pathfinder,living,()=>null);
 let previous=null;
 for(let minute=480;minute<=675;minute++){
  living.minute=minute;const point=route();
  assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));
  assert.equal(point.y,0,'Bolt permanece no segmento mapeado, sem usar o conector de POI');
  assert.ok(point.x>=0&&point.x<=20);
  if(previous)assert.ok(Math.hypot(point.x-previous.x,point.y-previous.y)<=.27,'sem salto minuto a minuto');
  previous=point;
 }
});
