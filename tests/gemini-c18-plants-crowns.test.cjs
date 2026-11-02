const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const code=source.slice(source.indexOf('function drawTree('),source.indexOf('function drawCordeiroCactus('));
assert.ok(code.startsWith('function drawTree('));

function crown(seed,tone='street'){
 const arcs=[],ops=[];
 const context={lightPhase:'manha',roundRect(_c,x,y,w,h){ops.push(['trunk',x,y,w,h]);}};
 const draw=vm.runInNewContext(code+'\ndrawTree',context);
 const c={save(){},restore(){},beginPath(){},fill(){},fillRect(){},ellipse(){},arc(...args){arcs.push(args);},fillStyle:null};
 draw(c,100,200,12,seed,tone);
 return {arcs,ops};
}

test('C18 plants: crown variants have distinct outlines within the original footprint',()=>{
 const shapes=[crown(3),crown(4),crown(5)];
 for(const shape of shapes){
  assert.equal(shape.arcs.length,7,'same three canopy lobes and four small highlights');
  assert.equal(shape.ops[0][0],'trunk');
  for(const [i,expected] of [98.3,197.6,3.4,8.4].entries())
   assert.ok(Math.abs(shape.ops[0][i+1]-expected)<1e-8,'tree ground/trunk anchor unchanged');
  for(const arc of shape.arcs.slice(0,3)){
   assert.ok(arc[0]>=89&&arc[0]<=111&&arc[1]>=190&&arc[1]<=200,'canopy stays around the same tree anchor');
  }
 }
 assert.notDeepEqual(shapes[0].arcs.slice(0,3),shapes[1].arcs.slice(0,3));
 assert.notDeepEqual(shapes[1].arcs.slice(0,3),shapes[2].arcs.slice(0,3));
});

test('C18 plants: shade and canopy keep their existing placement and rendering path',()=>{
 assert.equal(crown(9,'shade').arcs.length,crown(9,'canopy').arcs.length);
 assert.match(source,/RoncadorGroundedFlora\.sample\(data,houses,scenicScenes\)/);
 assert.match(source,/origin:'osm-green-polygon'|showGroundedFlora/);
});
