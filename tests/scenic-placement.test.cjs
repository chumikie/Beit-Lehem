const assert=require('node:assert/strict');
const map=require('../dist/map.json');
const engine=require('../dist/scenic-placement.js');
const scenes=engine.layout(map);
assert.equal(scenes.length,4,'three OSM scenes and the conceptual plaza must render');
assert.deepEqual(new Set(scenes.map(s=>s.id)),new Set(['igreja','mercado','rodoviaria','praca_6_setembro']));
for(const scene of scenes){
 assert(scene.at.every(Number.isFinite));
 assert(scene.scale>.3&&scene.scale<.8);
 const rect=engine.bounds(scene);
 assert(rect.every(Number.isFinite));
 assert(rect[2]>rect[0]&&rect[3]>rect[1]);
 if(scene.anchor)assert(Math.hypot(scene.at[0]-scene.anchor[0],scene.at[1]-scene.anchor[1])<=80,'symbolic scene should stay close to OSM point');
}
const plaza=scenes.find(s=>s.id==='praca_6_setembro');
assert.equal(plaza.anchor,null,'unverified plaza must not gain a real map anchor');
assert.equal(plaza.positionStatus,'unverified_no_geometry');
for(let i=0;i<scenes.length;i++)for(let j=i+1;j<scenes.length;j++){
 assert(!engine.intersects(engine.bounds(scenes[i],5),engine.bounds(scenes[j],5)),'symbolic footprints must not overlap');
}
console.log('Scenic V2.4: 4 independently positioned postcards, official POIs separate, no visual collisions between scenes.');
