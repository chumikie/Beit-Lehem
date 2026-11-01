'use strict';
// C20.3.5: paired A/B on the same Chromium runner; no shipped HTML is modified.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { chromium } = require('playwright');
const { buildGeminiPreview } = require('./build-gemini-preview.cjs');
const { extractEmbeddedMap } = require('./current-geodata.cjs');

const root = path.resolve(__dirname, '..');
const baselineSha = 'c208b809cc3c633a9458631bd0d80e3c504d57de';
const optimizedSha = process.env.GITHUB_SHA || spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim();
const output = path.join(process.env.RUNNER_TEMP || os.tmpdir(),'beit-lehem-paired-performance');
fs.mkdirSync(output,{recursive:true});
const worktree = path.join(output,'baseline-worktree');
const checked = spawnSync('git',['worktree','add','--detach',worktree,baselineSha],{cwd:root,encoding:'utf8'});
assert.equal(checked.status,0,'baseline commit must be available in the Actions checkout: '+checked.stderr);

const build = (project,filename) => {
 const dest=path.join(output,filename);
 const result=buildGeminiPreview(project,path.relative(project,dest));
 const source=fs.readFileSync(result.outputPath,'utf8');
 const map=extractEmbeddedMap(source);
 assert.deepEqual([map.roads.length,map.areas.length,map.points.length,map.localPlaces.length,map.streetNameCount],
  [462,20,9,9,86]);
 const marker='move(dt,t/1000);render(t/1000);renderedFrames++;';
 assert.equal(source.split(marker).length,2);
 let instrumented=source.replace(marker,
  '{const p=performance.now();move(dt,t/1000);window.__pairMove?.push(performance.now()-p);}' +
  '{const p=performance.now();render(t/1000);window.__pairRender?.push({at:p,ms:performance.now()-p});}renderedFrames++;');
 // Preserve exactly the baseline/HEAD nearestRoad implementation and all its callers.
 const start=instrumented.indexOf('function nearestRoad(x,y){');
 assert.ok(start>=0);
 const open=instrumented.indexOf('{',start);
 let depth=0,end=-1;
 for(let i=open;i<instrumented.length;i++){
  if(instrumented[i]==='{')depth++;
  else if(instrumented[i]==='}'&&!--depth){end=i+1;break;}
 }
 assert.ok(end>open);
 const original=instrumented.slice(start,end).replace('function nearestRoad(x,y){','function nearestRoadUnprobed(x,y){');
 instrumented=instrumented.slice(0,start)+original+
  '\nfunction nearestRoad(x,y){const p=performance.now();try{return nearestRoadUnprobed(x,y);}finally{window.__pairRoad?.push(performance.now()-p);}}'+
  instrumented.slice(end);
 return {html:instrumented,bytes:result.bytes,map};
};
const variants={A:build(worktree,'baseline.html'),B:build(root,'optimized.html')};
assert.deepEqual(variants.A.map.roads.map(x=>x.p),variants.B.map.roads.map(x=>x.p));
assert.deepEqual(variants.A.map.points.map(x=>x.p),variants.B.map.points.map(x=>x.p));

const server=http.createServer((req,res)=>{
 const variant=req.url==='/A'?'A':req.url==='/B'?'B':null;
 if(!variant){res.writeHead(404).end();return;}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 res.end(variants[variant].html);
});
const percentile=(arr,p)=>{
 if(!arr.length)return null;
 const sorted=arr.slice().sort((a,b)=>a-b);
 return +sorted[Math.max(0,Math.ceil(p*sorted.length)-1)].toFixed(2);
};

async function sample(page,phase,ms=650){
 const begin=await page.evaluate(()=>({t:performance.now(),frames:window.__pairRender.length,
  roads:window.__pairRoad.length,moves:window.__pairMove.length,long:window.__pairLong.length}));
 await page.waitForTimeout(ms);
 return page.evaluate(({begin,phase})=>{
  const end=performance.now();
  const frames=window.__pairRender.slice(begin.frames).filter(x=>x.at<end).map(x=>x.ms);
  const roads=window.__pairRoad.slice(begin.roads);
  const moves=window.__pairMove.slice(begin.moves);
  const long=window.__pairLong.slice(begin.long).filter(x=>x.at>=begin.t&&x.at<end);
  const sort=arr=>arr.sort((a,b)=>a-b);
  const pct=(arr,p)=>arr.length?+sort(arr)[Math.max(0,Math.ceil(arr.length*p)-1)].toFixed(2):null;
  return {phase,elapsedMs:+(end-begin.t).toFixed(1),frames:frames.length,
   renderP95:pct(frames,.95),moveP95:pct(moves,.95),nearestRoadP95:pct(roads,.95),
   nearestRoadCalls:roads.length,nearestRoadTotalMs:+roads.reduce((a,b)=>a+b,0).toFixed(2),
   longTasks:long.length,longestTaskMs:Math.max(0,...long.map(x=>x.ms))};
 },{begin,phase});
}

async function runScenario(browser,url,variant,viewport,round){
 const context=await browser.newContext({viewport,deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const page=await context.newPage();
 await page.addInitScript(()=>{
  window.__pairMove=[];window.__pairRender=[];window.__pairRoad=[];window.__pairLong=[];
  try{new PerformanceObserver(list=>{
   for(const entry of list.getEntries())window.__pairLong.push({at:entry.startTime,ms:entry.duration});
  }).observe({type:'longtask',buffered:true});}catch{}
 });
 await page.route('https://**/*',route=>route.abort());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(url+'/'+variant,{waitUntil:'load',timeout:60000});
  await page.locator('#world').waitFor({state:'visible'});
  const phases={welcome:await sample(page,'welcome')};
  await page.locator('#start').click();
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#welcome')).display==='none');
  phases.gameplay=await sample(page,'gameplay');
  const interact=page.locator('#interact');
  if(await interact.isVisible().catch(()=>false)){
   await interact.click();
   const opened=await page.locator('dialog[open]').count();
   if(opened){phases.dialogue=await sample(page,'dialogue',500);await page.keyboard.press('Escape');}
  }
  await page.locator('#zoomIn').click();
  phases.zoom=await sample(page,'zoom');
  const mapButton=page.locator('#mapButton');
  if(await mapButton.isVisible())await mapButton.click();else await page.keyboard.press('m');
  await page.locator('#mapDialog[open]').waitFor({timeout:10000});
  const mapCanvas=page.locator('#bigmap');
  const box=await mapCanvas.boundingBox();assert.ok(box);
  const targets=[[.64,.55],[.42,.65],[.72,.38]];
  let routeSelected=false;
  for(const [x,y] of targets){
   await mapCanvas.click({position:{x:box.width*x,y:box.height*y}});
   const toast=await page.locator('#toast').textContent();
   if(toast.includes('Caminho marcado pelas ruas')){routeSelected=true;break;}
   if(!(await page.locator('#mapDialog').evaluate(el=>el.open))){
    if(await mapButton.isVisible())await mapButton.click();else await page.keyboard.press('m');
   }
  }
  assert.ok(routeSelected,'route must be selected by mapped streets');
  phases.walking=await sample(page,'walking');
  const state=await page.evaluate(()=>({dpr:devicePixelRatio,
   canvas:[document.querySelector('#world').width,document.querySelector('#world').height],
   mapSource:expeditionState.mapSource,roads:expeditionState.roadCount,
   residents:window.RoncadorLivingWorld.RESIDENTS.length,
   pets:expeditionState.streetPets.length,routeRemaining:expeditionState.routeRemaining}));
  assert.equal(state.dpr,2);assert.equal(state.roads,462);
  assert.ok(state.mapSource.includes('belem-osm'));
  assert.equal(errors.length,0,errors.join('; '));
  return {variant,viewport,round,phases,state};
 }finally{await context.close();}
}

(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 const runs=[];
 try{
  for(const viewport of [{width:390,height:844},{width:320,height:640}]){
   for(const [round,variant] of ['A','B','B','A','B','A'].entries())
    runs.push(await runScenario(browser,url,variant,viewport,round+1));
  }
 }finally{await browser.close();server.close();}
 const summary={baselineSha,optimizedSha,order:'ABBA BA',runs,
  note:'Same runner, sequential browser contexts; no temperature or battery measurement.'};
 fs.writeFileSync(path.join(output,'paired-report.json'),JSON.stringify(summary,null,2)+'\n');
 console.log('PAIRED_REPORT='+JSON.stringify(summary));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;try{server.close();}catch{}});
