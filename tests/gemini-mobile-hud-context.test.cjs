'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const setup=src.slice(src.indexOf('function setupMobileWalkingHud(){'),src.indexOf('setupMobileWalkingHud();')+24);
const summary=src.slice(src.indexOf('function lifeSummary(){'),src.indexOf('function rememberedLandscapeLine('));

test('minimapa começa aberto, alterna sem perder canvas e oferece estado acessível',()=>{
 assert.match(setup,/const expanded=!panel\.classList\.contains\('is-collapsed'\)/);
 assert.match(setup,/panel\.classList\.toggle\('is-collapsed'\)/);
 assert.match(setup,/aria-controls','minimap'/);
 assert.match(setup,/aria-expanded',String\(expanded\)/);
 assert.match(setup,/Recolher minimapa/);
 assert.match(setup,/Mostrar minimapa/);
 assert.match(setup,/@media\(max-width:800px\)/);
 assert.match(setup,/\.mini-wrap\.is-collapsed #minimap/);
 assert.doesNotMatch(setup,/remove\(|localStorage|save\(/);
 const states=new Set(),attrs={};
 const panel={classList:{contains:key=>states.has(key),toggle:key=>states.has(key)?states.delete(key):states.add(key)},append:button=>{panel.button=button;}};
 const mini={closest:()=>panel},document={createElement:tag=>({tag,setAttribute:(key,value)=>{attrs[key]=value;}}),head:{append:style=>{panel.style=style.textContent;}}};
 vm.runInNewContext(setup,{mini,document});
 assert.equal(attrs['aria-expanded'],'true');
 panel.button.onclick();
 assert.equal(attrs['aria-expanded'],'false');
 assert.ok(states.has('is-collapsed'));
 panel.button.onclick();
 assert.equal(attrs['aria-expanded'],'true');
 assert.ok(!states.has('is-collapsed'));
 assert.match(panel.style,/@media\(max-width:800px\)/);
});

test('cartão contextual prioriza proximidade, encontro ativo e caminhada sem ocultar o Caderno',()=>{
 assert.match(summary,/const nearby=nearResident\|\|nearSecondary/);
 assert.match(summary,/const liveScene=community\?\.phase==='visit'/);
 assert.match(summary,/if\(nearby\)/);
 assert.match(summary,/else if\(liveScene\)/);
 assert.match(summary,/classList\.toggle\('is-walking',player\.moving&&!nearby&&!liveScene\)/);
 assert.match(src,/\$\('streetPulse'\)\.onclick=showLife/);
 assert.match(setup,/\.street-pulse\.is-walking #streetResidentsHint/);
});
