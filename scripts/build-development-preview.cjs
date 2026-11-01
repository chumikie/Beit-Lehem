'use strict';
// The richer Gemini game is now the MAIN DEVELOPMENT BASELINE.
// The original V2.27 stays preserved in baseline/ and dist/ for reference.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const result=cp.spawnSync(process.execPath,['scripts/build-gemini-preview.cjs'],{cwd:root,stdio:'inherit'});
if(result.error)throw result.error;
if(result.status!==0)process.exit(result.status||1);
const gemini=path.join(root,'previews','gemini-preview.html');
const dir=path.join(root,'previews');
fs.mkdirSync(dir,{recursive:true});
// Both entries use Gemini's existing responsive layout until a separate phone
// adaptation is validated. The experiment's isolated save key is intentional.
for(const file of ['beit-lehem-development.html','beit-lehem-development-mobile.html']){
 fs.copyFileSync(gemini,path.join(dir,file));
 console.log('Prévia Gemini-base: previews/'+file);
}
console.log('V2.27 preservada; progressos locais do Gemini ainda separados dos da V2.27.');
