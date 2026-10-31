const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'source/belem-osm-2026.geojson'),'utf8'));
const original=JSON.parse(fs.readFileSync(path.join(root,'source/export.geojson'),'utf8'));
const map=JSON.parse(fs.readFileSync(path.join(root,'dist/map.json'),'utf8'));
assert.equal(original.features.length,83,'original Roncador extract must stay preserved');
assert.equal(source.metadata.CD_MUN,'2501906');
assert.equal(map.featureCount,source.features.length);
assert.equal(map.roads.length,462);
assert.equal(map.streetNameCount,86);
assert.equal(map.missions.length,6);
assert.equal(map.areas.length,20);
assert.equal(map.points.length,9);
const vertices=map.roads.flatMap(r=>r.p);assert.equal(vertices.length,5485);
assert.equal(map.projection.originLat,-6.69676);
for(const road of map.roads){assert(road.tags.highway);for(const p of road.p){assert(p.every(Number.isFinite));assert(p[0]>=map.bounds[0]&&p[0]<=map.bounds[2]);assert(p[1]>=map.bounds[1]&&p[1]<=map.bounds[3]);}}
for(const mission of map.missions){assert(vertices.some(p=>Math.hypot(p[0]-mission.p[0],p[1]-mission.p[1])<.01));assert(Math.hypot(mission.p[0]-map.start[0],mission.p[1]-map.start[1])<1100);}
assert(Math.hypot(...map.start)<150,'game should start at urban center of Belém');
const names=new Set(map.points.map(p=>p.tags.name));
assert(names.has('Mercado Público de Belém'));assert(names.has('Igreja de Belém'));assert(names.has('Estação Rodoviária'));
assert.equal(map.landmarks.length,3);
for(const landmark of map.landmarks){assert(landmark.p.every(Number.isFinite));assert(landmark.kind);assert(landmark.positionStatus);assert(landmark.artStatus);}
for(const id of ['igreja','mercado','rodoviaria']){const landmark=map.landmarks.find(l=>l.id===id);assert(landmark);assert.equal(landmark.positionStatus,'osm_point');}
const square=map.cultureReferences.find(l=>l.id==='praca_6_setembro');assert(square);assert.equal(square.positionStatus,'unverified_no_geometry');assert.equal(square.p,undefined,'unverified public square must not have a map coordinate');
assert(map.missions.some(m=>m.name.includes('(ficcional)')));
console.log('Belém/PB map: 491 features, 462 road sections, 86 street names, 5485 vertices, 9 mapped POIs, six centre-first missions. Original extract preserved.');
