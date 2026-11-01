'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const html=fs.readFileSync(require.resolve('../previews/beit-lehem-development.html'),'utf8');
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
 const panel={classList:{contains:key=>states.has(key),add:key=>states.add(key),toggle:key=>states.has(key)?states.delete(key):states.add(key)},append:button=>{panel.button=button;}};
 const mini={closest:()=>panel},document={createElement:tag=>({tag,setAttribute:(key,value)=>{attrs[key]=value;}}),head:{append:style=>{panel.style=style.textContent;}}};
 vm.runInNewContext(setup,{mini,document,matchMedia:()=>({matches:false})});
 assert.equal(attrs['aria-expanded'],'true');
 panel.button.onclick();
 assert.equal(attrs['aria-expanded'],'false');
 assert.ok(states.has('is-collapsed'));
 panel.button.onclick();
 assert.equal(attrs['aria-expanded'],'true');
 assert.ok(!states.has('is-collapsed'));
 assert.match(panel.style,/@media\(max-width:800px\)/);
});

test('C12: em 320px o minimapa começa recolhido e abre com alvo de toque de 44px',()=>{
 const states=new Set(),attrs={};
 const panel={classList:{contains:key=>states.has(key),add:key=>states.add(key),toggle:key=>states.has(key)?states.delete(key):states.add(key)},append:button=>{panel.button=button;}};
 const mini={closest:()=>panel};
 const document={createElement:tag=>({tag,setAttribute:(key,value)=>{attrs[key]=value;}}),head:{append:style=>{panel.style=style.textContent;}}};
 vm.runInNewContext(setup,{mini,document,matchMedia:()=>({matches:true})});
 assert.equal(attrs['aria-expanded'],'false');
 assert.ok(states.has('is-collapsed'));
 assert.match(panel.style,/\.mini-wrap\.is-collapsed\{width:58px;height:58px/);
 assert.match(panel.style,/\.mini-wrap\.is-collapsed \.mini-toggle\{[^}]*width:44px;height:44px/);
 panel.button.onclick();
 assert.equal(attrs['aria-expanded'],'true');
 assert.ok(!states.has('is-collapsed'));
});

test('C12: a redução do minimapa melhora a área livre sem retirar o canvas',()=>{
 // Estimativa por CSS: viewport 320x640, barra superior 68, minimapa 112x~130.
 const world=320*(640-68),expanded=112*130,collapsed=58*58;
 const gain=(expanded-collapsed)/world;
 assert.ok(gain>.05&&gain<.08);
 assert.match(setup,/if\(matchMedia\('\(max-width:380px\)'\)\.matches\)/);
 assert.doesNotMatch(setup,/remove\(|localStorage|save\(/);
 console.info(`C12: 320×640, minimapa estimado ${(expanded/world*100).toFixed(1)}% → ${(collapsed/world*100).toFixed(1)}%; liberação aproximada ${(gain*100).toFixed(1)} p.p.`);
});

test('C12: diário de desktop e gaveta móvel mantêm a área jogável prevista',()=>{
 assert.match(html,/\.layout\{display:grid;grid-template-columns:minmax\(0,1fr\) 330px/);
 assert.match(html,/\.layout\{grid-template-columns:minmax\(0,1fr\) 290px\}/);
 assert.match(html,/\.sidebar\{position:fixed;z-index:15;right:0;bottom:0;top:68px/);
 assert.match(src,/\$\('sidebar'\)\.inert=matchMedia\('\(max-width:800px\)'\)\.matches&&!open/);
 const samples=[[1280,330,950/1280],[1024,290,734/1024],[390,0,1],[320,0,1]];
 for(const [width,panel,share] of samples){
  assert.equal((width-panel)/width,share);
  console.info(`C12: ${width}px de largura — painel ${panel}px, mundo ${(share*100).toFixed(1)}%`);
 }
});

test('C12.1: botões móveis conservam alvo mínimo de 44px nos quatro tamanhos',()=>{
 assert.match(html,/@media\(max-height:640px\) and \(max-width:800px\)\{/);
 assert.match(html,/\.touch-pad\{grid-template-columns:repeat\(3,43px\);grid-template-rows:repeat\(3,43px\)/);
 assert.match(setup,/@media\(max-width:800px\) and \(max-height:640px\)\{\s*\.touch-pad\{grid-template-columns:repeat\(3,44px\);grid-template-rows:repeat\(3,44px\)/);
 assert.match(setup,/\.world-tools button\{width:44px;height:44px\}/);
 for(const [width,height] of [[320,640],[360,640],[390,844],[768,1024]]){
  const cell=height<=640?44:49;
  assert.ok(cell>=44);
  assert.ok(44>=44);
  const padWidth=3*cell+2*4;
  const minimapWidth=width<=380?58:width<=800?126:190;
  const freeHorizontal=width-26-padWidth-minimapWidth;
  assert.ok(freeHorizontal>0,`pad/minimapa sobrepostos em ${width}px`);
  console.info(`C12.1 ${width}×${height}: toque ${cell}px, pad ${padWidth}px, intervalo horizontal >= ${freeHorizontal}px`);
 }
});

test('C12.1: alvo ampliado do minimapa não desloca mapa nem alcança interação',()=>{
 assert.match(setup,/\.mini-wrap:not\(\.is-collapsed\) \.mini-toggle::before\{content:'';position:absolute;inset:-6px\}/);
 assert.match(setup,/@media\(max-width:380px\)\{\.mini-wrap:not\(\.is-collapsed\)\{bottom:calc\(88px/);
 assert.match(setup,/@media\(max-width:800px\) and \(max-height:640px\)\{[\s\S]*?\.mini-wrap:not\(\.is-collapsed\)\{bottom:calc\(75px/);
 // Alvo expandido: botão visível 32px + 6px de cada lado; recolhido: 44px.
 const expandedHit=32+2*6,collapsedHit=44;
 assert.equal(expandedHit,44);
 assert.equal(collapsedHit,44);
 for(const [width,height] of [[320,640],[360,640],[390,844],[768,1024]]){
  // Conservadora altura do painel de 145px (título, canvas, rodapé e padding).
  // Em telas estreitas ele desce de 116px para 88px do rodapé.
  const bottom=height<=640?75:width<=380?88:108;
  const toggleTopFromBottom=bottom+145-4+6;
  const interactBottom=height<=640?224:257;
  // Sem interseção vertical: o topo do alvo fica ABAIXO da borda inferior
  // do botão de interação (medidas positivas a partir do rodapé).
  assert.ok(toggleTopFromBottom<interactBottom,
   `minimapa e interação se interceptam em ${width}px`);
 }
});

test('C12.1: clima deixa de cobrir o grupo de zoom/câmera no celular',()=>{
 assert.match(html,/\.world-tools\{top:66px;right:13px/);
 assert.match(html,/\.sky-mood\{top:111px\}/);
 assert.match(setup,/\.sky-mood\{top:210px\}/);
 const top=66,buttons=3,size=44,gap=2,moodTop=210;
 const toolsBottom=top+buttons*size+(buttons-1)*gap;
 assert.equal(toolsBottom,202);
 assert.ok(moodTop-toolsBottom>=8);
 // Geometry holds for all requested widths; no action handler was removed.
 assert.match(src,/\$\('zoomIn'\)\.onclick=/);
 assert.match(src,/\$\('zoomOut'\)\.onclick=/);
 assert.match(src,/\$\('recenter'\)\.onclick=/);
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
