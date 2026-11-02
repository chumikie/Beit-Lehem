const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');

test('C17.2: dawn light uses the existing palette exactly on overnight entry',()=>{
 const start=source.indexOf('function syncDawnLightOnEntry(');
 const end=source.indexOf('function syncSkyButton(',start);
 assert.ok(start>0&&end>start);
 const context={living:{minute:354},lightPhase:'anoitecer',syncLightButton(){this.calls=(this.calls||0)+1}};
 vm.createContext(context);
 vm.runInContext(source.slice(start,end)+'\nsyncDawnLightOnEntry(349);',context);
 assert.equal(context.lightPhase,'manha');
 context.lightPhase='tarde';context.living.minute=355;
 vm.runInContext('syncDawnLightOnEntry(354)',context);
 assert.equal(context.lightPhase,'tarde','manual selections are not overridden');
 context.lightPhase='anoitecer';context.living.minute=410;
 vm.runInContext('syncDawnLightOnEntry(349)',context);
 assert.equal(context.lightPhase,'anoitecer','dawn transition has a strict end');
});

test('C17.2: touch entry is confined to time panel and retains map and saves',()=>{
 assert.match(source,/dawnTestButton\.id='dawnTestButton'/);
 assert.match(source,/min-height:44px/);
 assert.match(source,/\$\('lifeDialogClock'\)\.parentElement\.append\(dawnTestButton\)/);
 assert.match(source,/living\.minute=5\*60\+54;lightPhase='manha'/);
 assert.match(source,/\$\('lifeDialog'\)\.close\(\);updateUI\(\);save\(\)/);
 const start=source.indexOf('dawnTestButton.onclick=()=>{');
 const handler=source.slice(start,source.indexOf("$('momentCollect').onclick",start));
 assert.doesNotMatch(handler,/player\.|pathfinder|STORE|localStorage\.removeItem|reset\(/);
});
