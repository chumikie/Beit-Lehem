const assert=require('node:assert/strict');
const test=require('node:test');
const {create}=require('../gemini-modules/resident-motion.js');

test('amortece a direção visual nas esquinas sem desviar a rota',()=>{
 const motion=create(null);
 motion.resolve({id:'vizinho',x:0,y:0},0,1);
 const east=motion.resolve({id:'vizinho',x:10,y:0,walking:true},.05,1);
 const turning=motion.resolve({id:'vizinho',x:10,y:10,walking:true},.10,1);
 assert.equal(east.heading,0);
 assert.ok(turning.heading>0&&turning.heading<Math.PI/2,'giro progressivo');
 assert.ok(turning.y>east.y&&Number.isFinite(turning.stridePhase));
});
test('preserva pausa e recupera a caminhada depois',()=>{
 const motion=create(null);
 motion.resolve({id:'amiga',x:0,y:0},0,1);
 const pause=motion.resolve({id:'amiga',x:0,y:0,pause:true},.05,1);
 assert.equal(pause.walking,false);
 const walk=motion.resolve({id:'amiga',x:12,y:0,walking:true},.10,1);
 assert.ok(walk.x>pause.x&&walk.walking);
});
test('não muda campos de salvamento nem pontos do grafo',()=>{
 const graph={route:()=>null};
 const motion=create(graph);
 motion.resolve({id:'a',x:1,y:2},0,1);
 const point=motion.resolve({id:'a',x:4,y:2,walking:true},.05,1);
 assert.ok(Number.isFinite(point.heading));
 assert.equal(motion.snapshot().length,1);
});
