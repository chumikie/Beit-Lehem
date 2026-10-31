const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
const match=/const GEMINI_LOCAL_PLACES=(\[[\s\S]*?\]);/.exec(source);
assert(match,'the verified local landmark catalog remains available');
const places=vm.runInNewContext(match[1]);
assert.equal(places.length,7,'the first Gemini integration has seven distinct local references');
assert.equal(new Set(Array.from(places,p=>p.id)).size,places.length);
assert.deepEqual(Array.from(new Set(Array.from(places,p=>p.kind))).sort(),['bakery','bar','chapel','church','civic','gym','school']);
for(const p of places){
 assert(p.p.length===2&&Array.from(p.p).every(Number.isFinite),'finite local coordinates: '+p.id);
 assert(p.name&&p.id,'each place needs an identity');
}
assert.equal(places.find(p=>p.id==='bar_prosa').fictionalName,true,'fictional bar title stays marked');
assert(source.includes('user-verified positions'),'the source must distinguish firsthand positions from OSM');
assert(source.includes('drawGeminiLocalPlaces(ctx,{left,right,top,bottom})'),'the map actually renders the local category art');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const graph=buildGraph(map.roads);
for(const p of places){
 const route=graph.route(map.start,p.p);
 assert(route&&route.points?.length,'connected walking route to '+p.id);
}
assert(source.includes('if(setRoute(...localPlace.p,18))'),'tapping an illustrated place uses the existing router');
// Every local category must render in both daytime and evening without
// introducing new map geometries or relying on a browser-only side effect.
const vignette=/function drawGeminiLocalPlaces\(c,viewport\)\{[\s\S]*?\n\}\n(?=function drawMappedPlaces)/.exec(source);
assert(vignette,'the detailed place renderer remains available');
for(const minute of [9*60,19*60]){
 const render=vm.runInNewContext('('+vignette[0].trim()+')',{zoom:1.8,living:{minute},GEMINI_LOCAL_PLACES:places,Math});
 let saved=0,restored=0;
 const c=new Proxy({}, {get(_target,name){return (..._args)=>{if(name==='save')saved++;if(name==='restore')restored++;};},set(){return true;}});
 render(c,{left:-200,right:400,top:-850,bottom:700});
 assert.equal(saved,7,'all seven category scenes drawn');
 assert.equal(restored,saved,'canvas state restored after drawing');
}
console.log('Gemini integration: seven distinct landmark categories, user verification provenance and map rendering OK');
