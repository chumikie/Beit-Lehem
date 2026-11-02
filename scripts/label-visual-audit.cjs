'use strict';

// CI-only browser probe. It never edits the distributed game or its saves.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { buildGeminiPreview } = require('./build-gemini-preview.cjs');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'beit-lehem-visual-review');
fs.mkdirSync(outputDir, { recursive: true });
const temporary = path.join(os.tmpdir(), 'beit-lehem-c21-label-audit.html');
const built = buildGeminiPreview(root, path.relative(root, temporary));
let html = fs.readFileSync(built.outputPath, 'utf8');

// The probe is injected into a temporary build only; no production instrumentation.
const petPaint = "roundRect(c,-labelWidth/2,labelY,labelWidth,10,4,'#fff9ebee','#b89f7d');";
const residentPaint = "roundRect(c,label.x-label.width/2,label.y-6.5,label.width,13,5,'#fffcf1ed','#b4c2a1');";
assert.equal(html.split(petPaint).length, 2, 'pet label draw site changed');
assert.equal(html.split(residentPaint).length, 2, 'resident label draw site changed');
html = html.replace(petPaint,
  "window.__c21Record?.({kind:'pet',name:pet.name,x:visualCenter.x,y:visualCenter.y+labelY,"+
  "width:labelWidth,height:10,strokeWidth:c.lineWidth});" + petPaint)
  .replace(residentPaint,
    "window.__c21Record?.({kind:'resident',name:label.name,x:label.x,y:label.y,"+
    "width:label.width,height:13,strokeWidth:c.lineWidth});" + residentPaint);
const petFunction = 'function drawStreetPets(c,time,view,people=[],renderables=null){';
assert.equal(html.split(petFunction).length,2,'pet drawing function changed');
html = html.replace(petFunction,
  "window.__c21SetScene=(hub,magnification)=>{"+
  "const resident=hub==='bia'?residentsInStreets().find(item=>item.id==='bia'):null;"+
  "const place=resident?{p:[resident.x,resident.y]}:data.landmarks.find(item=>item.id===hub);"+
  "if(!place)throw Error('Missing scene '+hub);"+
  "player.x=place.p[0];player.y=place.p[1];player.moving=false;"+
  "camera.x=player.x;camera.y=player.y;zoom=magnification;};"+petFunction);

const server = http.createServer((req, res) => {
  if (req.url !== '/' && req.url !== '/index.html') return res.writeHead(404).end();
  res.writeHead(200, {'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
  res.end(html);
});

const overlaps = (a, b) => Math.abs(a.x-b.x) < (a.width+b.width)/2 &&
  Math.abs(a.y-b.y) < (a.height+b.height)/2;

let browser;
async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless:true, args:['--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__c21Labels = [];
    window.__c21Record = label => {
      if (window.__c21Labels.length < 1200) window.__c21Labels.push(label);
    };
  });
  // Match the established CI browser conditions: never wait on remote assets.
  await page.route('https://**/*', route => route.abort());
  const url = `http://127.0.0.1:${server.address().port}/`;
  await page.goto(url, { waitUntil:'domcontentloaded', timeout:20000 });
  await page.locator('#start').click();
  await page.waitForFunction(() => expeditionState.active, null, {timeout:15000});
  console.log('C21: Chromium started; rendering landmarks and Bia at her actual location.');

  const report = { sourceSha: process.env.GITHUB_SHA || null, temporaryBuild:true,
    browser:browser.version(), scenarios:[], errors };
  for (const hub of ['igreja','mercado','rodoviaria','bia']) {
    for (const magnification of [1.85,2.85,3.5]) {
      await page.evaluate(({hub,magnification}) => {
        window.__c21SetScene(hub,magnification);
        window.__c21Labels=[];
      }, {hub,magnification});
      await page.waitForTimeout(800);
      const raw = await page.evaluate(() => ({
        labels:window.__c21Labels,
        location:document.querySelector('#location')?.textContent,
        viewport:{zoom:expeditionState.zoom, dpr:devicePixelRatio},
        population:{people:expeditionState.streetPopulation.length,pets:expeditionState.streetPets.length}
      }));
      const labels = [...new Map(raw.labels.map(l => [`${l.kind}:${l.name}`,l])).values()];
      const collisions = [];
      for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
        if(overlaps(labels[i],labels[j]))collisions.push([labels[i].kind+':'+labels[i].name,
          labels[j].kind+':'+labels[j].name]);
      }
      const entry = {hub,zoom:magnification,dpr:raw.viewport.dpr,
        labels:labels.map(l=>({...l,strokeWidth:+l.strokeWidth.toFixed(3)})),
        collisions, population:raw.population};
      report.scenarios.push(entry);
      const screenshot = `c21-${hub}-${String(magnification).replace('.','-')}.png`;
      await page.screenshot({ path:path.join(outputDir,screenshot), animations:'disabled',timeout:15000 });
      console.log('C21 ' + JSON.stringify(entry));
    }
  }
  fs.writeFileSync(path.join(outputDir,'c21-label-report.json'),JSON.stringify(report,null,2));
  assert.deepEqual(errors,[], 'Chromium page errors');
  await context.close();
}

main().catch(error => { console.error(error); process.exitCode=1; })
  .finally(async () => {
    await browser?.close().catch(() => {});
    server.closeAllConnections();
    server.close();
  });
