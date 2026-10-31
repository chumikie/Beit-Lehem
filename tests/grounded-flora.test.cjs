const assert=require('node:assert/strict');
const flora=require('../dist/grounded-flora.js');
const data=require('../dist/map.json');
const once=flora.sample(data),twice=flora.sample(data);
assert.deepEqual(once,twice,'foliage positions must be deterministic');
assert.equal(once.greenPolygons,8,'only OSM parks, grass and the mapped reserve');
assert(once.points.length>=70,'green polygon layer should be visible in the archive');
for(const site of once.points){
  const area=data.areas[site.area];
  assert(area,'every illustrated plant must belong to an OSM polygon');
  assert(flora.greenKind(area.tags),'decorative foliage must not spill into residential polygons');
  assert(flora.inside(site.x,site.y,area.p[0]),'each illustration must be inside its source polygon');
  assert.equal(site.origin,'osm-green-polygon');
}
assert.equal(flora.greenKind({landuse:'residential'}),null);
console.log(`V2.12: ${once.points.length} deterministic foliage details constrained to ${once.greenPolygons} OSM green polygons.`);
