const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {inspect,applyOverrides,referenceRanges}=require('../scripts/gemini-workbench.cjs');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'references/gemini-2026-10-31/experimento-anonimizado.html.txt'),'utf8');
const modules=inspect(source),ranges=referenceRanges();
assert(ranges.length>=30,'reference index tracks the major Gemini systems');
assert(modules.length>=30,'large Gemini HTML should expose its separate inline scripts');
assert.equal(new Set(modules.map(m=>m.name)).size,modules.length,'stable unique module names');
assert(modules.some(m=>m.name==='game'),'the main game module must have a recognizable name');
assert(modules.some(m=>m.name==='facade-studio'),'facade edits must be isolatable');
for(const [line,name] of [[726,'market-scene'],[808,'street-moments'],[831,'street-greetings'],[904,'pathfinding'],[999,'landmarks']]){
 assert.equal(modules.find(m=>m.line===line)?.name,name,'script must resolve its exact starting range');
}
const example='<script type="application/json">{"map":true}</script><script>window.ok=true;</script>';
const sample=inspect(example);
assert.equal(sample.length,1,'embedded map JSON must never be treated as executable JS');
assert.equal(sample[0].body,'window.ok=true;');
const empty=applyOverrides(example,path.join(root,'this-folder-does-not-exist'));
assert.equal(empty.html,example,'without patches, rebuilding preserves the source byte-for-byte');
assert.deepEqual(empty.used,[]);
console.log('Gemini workbench: indexed scripts, safe module extraction and no-op reconstruction OK');
