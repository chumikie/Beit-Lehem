'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const code=source.slice(source.indexOf('function drawTree('),source.indexOf('function drawCordeiroCactus('));
assert.ok(code.startsWith('function drawTree('));

function tree(seed,tone='street',lightPhase='manha'){
 const arcs=[],ellipses=[],trunks=[];
 const c={save(){},restore(){},beginPath(){},fill(){},
  arc(...args){arcs.push({args,color:c.fillStyle});},
  ellipse(...args){ellipses.push(args);}};
 const draw=vm.runInNewContext(code+'\ndrawTree',{lightPhase,roundRect(_ctx,...args){trunks.push(args);}});
 draw(c,100,200,12,seed,tone);
 return {arcs,ellipses,trunks};
}

test('C18.3: urban blossom accents change color but never canopy geometry or primitives',()=>{
 for(const seed of [2,5,6,15,22]){
  const street=tree(seed,'street'),canopy=tree(seed,'canopy');
  assert.equal(street.arcs.length,7);
  assert.equal(canopy.arcs.length,7);
  assert.deepEqual(street.arcs.map(a=>Array.from(a.args)),canopy.arcs.map(a=>Array.from(a.args)));
  assert.deepEqual(street.ellipses.map(a=>Array.from(a)),canopy.ellipses.map(a=>Array.from(a)));
  assert.deepEqual(street.trunks.map(a=>Array.from(a)),canopy.trunks.map(a=>Array.from(a)));
 }
 assert.equal(tree(2).arcs[3].color,'#e8c879b8','rare golden urban highlight');
 assert.equal(tree(5,'shade').arcs[3].color,'#d8947bad','rare terracotta shade highlight');
 assert.equal(tree(6).arcs[3].color,'#eff3cc70','most trees retain the approved original highlight');
 assert.equal(tree(2,'canopy').arcs[3].color,'#eff3cc70','rural canopies stay unchanged');
 assert.equal(tree(2,'street','anoitecer').arcs[3].color,'#eff3cc70','night keeps its previous accent');
});

test('C18.3: bloom is deterministic and adds no new trees, coordinates or saved state',()=>{
 assert.deepEqual(tree(15),tree(15));
 assert.match(source,/renderables\.push\(\{sortY:tree\.y\+2/);
 assert.match(source,/drawGroundedFlora\(ctx,\{left,right,top,bottom\},time,renderables\)/);
});
