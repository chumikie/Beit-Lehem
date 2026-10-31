const assert=require('node:assert/strict');
const blocks=require('../dist/central-blocks.js');
const map=require('../dist/map.json');

const street=blocks.streetAnchor(map);
assert.equal(street.length,2);
assert(map.roads.some(road=>road.tags.name==='Rua João Pessoa'&&road.p.some(p=>p[0]===street[0]&&p[1]===street[1])), 'third study must be anchored to a real OSM street coordinate');

const church=map.landmarks.find(l=>l.id==='igreja').p;
const market=map.landmarks.find(l=>l.id==='mercado').p;
const homes=[{x:church[0]+10,y:church[1]+10,seed:1,w:14,h:12,angle:0},{x:market[0]+8,y:market[1]+6,seed:2,w:14,h:12,angle:0},{x:street[0]+8,y:street[1]+4,seed:3,w:14,h:12,angle:0},{x:10000,y:10000,seed:4,w:14,h:12,angle:0}];
const original=homes.map(h=>[h.x,h.y]);
const layout=blocks.prepare(map,homes);
assert.deepEqual(layout.map(b=>b.id),['matriz','feira','joao']);
assert(layout.every(b=>b.count>=1), 'all three study districts should have some illustrative houses');
assert.deepEqual(homes.map(h=>[h.x,h.y]),original,'decorative facade study cannot move roads or houses');
assert.equal(homes[3].centralBlock,null,'distant homes are not decorated as centre blocks');
assert.equal(layout.reduce((n,b)=>n+b.count,0),homes.filter(h=>h.centralBlock).length);
console.log('V2.13: three OSM-anchored study areas classify houses without modifying positions.');
