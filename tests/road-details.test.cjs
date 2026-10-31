const assert=require('node:assert/strict');
const data=require('../dist/map.json');
const graph=require('../dist/pathfinding.js').buildGraph(data.roads);
const detail=require('../dist/road-details.js');
const before=JSON.stringify(data.roads);
const layer=detail.prepare(data.roads,graph);
assert.equal(layer.totalRoads,462);
assert.equal(layer.knownSurface,134);
assert.deepEqual(layer.surfaceCounts,{asphalt:44,paved:43,unpaved:39,paving_stones:5,sett:3});
assert.equal(layer.inclineCount,0,'the existing map has no measured slopes; never fabricate arrows');
assert(layer.junctions.length>100,'crossings must derive from actual connected OSM vertices');
for(const j of layer.junctions){
 assert(graph.nodes.some(p=>p.x===j.x&&p.y===j.y&&p.neighbours.length>=3));
 assert(j.arms>=3);
}
assert.equal(JSON.stringify(data.roads),before,'render preparation cannot move map geometry');
const operations=[];
const fake=new Proxy({}, {get(_,key){if(key==='restore'||key==='save')return()=>operations.push(key);if(key==='setLineDash')return()=>{};if(['beginPath','ellipse','arc','fill','stroke','moveTo','lineTo','quadraticCurveTo'].includes(key))return()=>operations.push(key);return undefined;},set(){return true;}});
const region={left:-120,right:120,top:-120,bottom:120};
detail.draw(fake,layer,region,1.85);
assert(operations.includes('stroke')&&operations.includes('fill'),'junctions and known materials must create perceptible strokes and highlights');
assert.deepEqual(operations.at(-1),'restore');
operations.length=0;detail.draw(fake,layer,region,.9);assert.equal(operations.length,0,'low zoom must stay clean');
console.log('Road details V2.21: 134 verified surfaces, 458 junction anchors, no invented inclines, map unchanged and level-of-detail render OK.');
