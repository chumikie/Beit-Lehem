const assert=require('node:assert/strict'),map=require('../dist/map.json'),api=require('../dist/local-road-references.js');
const source=JSON.stringify(map.roads),roads=api.apply(map.roads);
assert.equal(api.REFERENCES.length,17);assert.equal(roads.length,462);assert.equal(JSON.stringify(map.roads),source);
assert.equal(api.countDistinctNames(roads),91);
for(const ref of api.REFERENCES){const matched=roads.filter(r=>api.baseWayId(r.id)===ref.wayId);assert(matched.length>0,'mapped reference: '+ref.wayId);for(const road of matched){const original=map.roads.find(r=>r.id===road.id);assert.deepEqual(road.p,original.p);assert.deepEqual(road.tags,original.tags);if(ref.tags.surface)assert.equal(road.displayTags.surface,ref.tags.surface);if(ref.tags.name)assert.equal(road.displayTags.name,ref.tags.name);}}
assert.equal(roads.find(r=>r.id==='way/264042926').tags.surface,undefined);
assert.equal(roads.find(r=>r.id==='way/264042926').displayTags.surface,'paving_stones');
assert.equal(roads.find(r=>r.id==='way/814055923').displayTags.name,undefined);
assert.throws(()=>api.apply(map.roads,[...api.REFERENCES,api.REFERENCES[0]]),/duplicada/);
assert.throws(()=>api.apply(map.roads,[{wayId:'way/99999999',enabledForDisplay:true,tags:{surface:'asphalt'}}]),/não encontrado/);
assert.throws(()=>api.apply(map.roads,[{wayId:'way/264042926',enabledForDisplay:true,tags:{surface:'concreto'}}]),/Superfície local inválida/);
console.log('Camada de ruas: 17 referências, 91 nomes visíveis e 462 geometrias/tags OSM preservadas.');
