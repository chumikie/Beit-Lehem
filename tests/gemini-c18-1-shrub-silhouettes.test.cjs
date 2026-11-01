const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const code=source.slice(source.indexOf('function drawRuralShrub('),source.indexOf('function house('));
assert.ok(code.startsWith('function drawRuralShrub('));

function shrub(seed,zoom){
 const ellipses=[];
 const strokes=[];
 const c={save(){},restore(){},translate(){},beginPath(){},fill(){},stroke(){strokes.push(1);},moveTo(){},lineTo(){},arc(){},
  ellipse(...args){ellipses.push(args);}};
 const draw=vm.runInNewContext(code+'\ndrawRuralShrub',{zoom});
 draw(c,100,200,10,seed);
 return {ellipses,strokes};
}

test('C18.1: shrub variants retain ground shadow and compact footprint at near and distant zoom',()=>{
 for(const zoom of [.9,2.5]){
  const variants=[0,1,2].map(seed=>shrub(seed,zoom));
  for(const item of variants){
   assert.equal(item.ellipses.length,4);
   for(const [i,expected] of [2,3,7.8,2.8,0,0,Math.PI*2].entries())
    assert.ok(Math.abs(item.ellipses[0][i]-expected)<1e-9,'ground shadow remains fixed');
   for(const ellipse of item.ellipses.slice(1)){
    const [x,y,rx,ry]=ellipse;
    assert.ok(Math.abs(x)+rx<=8.2&&Math.abs(y)+ry<=9,'silhouette stays within original compact envelope');
   }
   assert.equal(item.strokes.length,zoom<1.15?0:1);
  }
  assert.notDeepEqual(variants[0].ellipses.slice(1),variants[1].ellipses.slice(1));
  assert.notDeepEqual(variants[1].ellipses.slice(1),variants[2].ellipses.slice(1));
 }
});
