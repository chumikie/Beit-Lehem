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
console.log('Gemini integration: seven distinct landmark categories, user verification provenance and map rendering OK');
