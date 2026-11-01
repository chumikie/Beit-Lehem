const assert=require('node:assert/strict'),map=require('../dist/map.json'),api=require('../dist/local-road-references.js');
const original=JSON.stringify(map.roads),roads=api.apply(map.roads);
assert.equal(api.REFERENCES.length,17);assert(api.REFERENCES.every(ref=>ref.enabledForDisplay===false));
assert.equal(roads.length,462);assert.equal(JSON.stringify(map.roads),original);assert.equal(api.countDistinctNames(roads),86);
for(const road of roads){const source=map.roads.find(r=>r.id===road.id);assert.deepEqual(road.p,source.p);assert.deepEqual(road.tags,source.tags);assert.deepEqual(road.displayTags,source.tags);assert.equal(road.localReference,null);}
const proposal=api.REFERENCES.find(ref=>ref.wayId==='way/264042926'),preview=api.apply(map.roads,[{...proposal,enabledForDisplay:true}]);
assert.equal(preview.find(r=>api.baseWayId(r.id)===proposal.wayId).displayTags.surface,'paving_stones');assert.equal(map.roads.find(r=>r.id==='way/264042926').tags.surface,undefined);
assert.throws(()=>api.apply(map.roads,[{...proposal,enabledForDisplay:true},{...proposal,enabledForDisplay:true}]),/duplicada/);
assert.throws(()=>api.apply(map.roads,[{...proposal,enabledForDisplay:true,wayId:'way/99999999'}]),/não encontrado/);
assert.throws(()=>api.apply(map.roads,[{...proposal,enabledForDisplay:true,tags:{surface:'concreto'}}]),/Superfície local inválida/);
console.log('17 proposals inactive; 86 verified OSM names and 462 source geometries/tags unchanged.');
