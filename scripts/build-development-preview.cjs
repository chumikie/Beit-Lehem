'use strict';
// The richer Gemini game is now the MAIN DEVELOPMENT BASELINE.
// The original V2.27 stays preserved in baseline/ and dist/ for reference.
const fs=require('node:fs'),path=require('node:path');
const {buildGeminiPreview}=require('./build-gemini-preview.cjs');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'previews');
fs.mkdirSync(dir,{recursive:true});
// The desktop entry is the canonical generated game. Both compatibility
// aliases receive byte-identical copies until a mobile-specific build exists.
const canonical='beit-lehem-development.html';
const result=buildGeminiPreview(root,path.join('previews',canonical));
console.log('HTML principal: previews/'+canonical+' ('+result.bytes+' bytes).');
for(const file of ['beit-lehem-development-mobile.html','gemini-preview.html']){
 fs.copyFileSync(result.outputPath,path.join(dir,file));
 console.log('Cópia de compatibilidade: previews/'+file);
}
console.log('Chave de save preservada: '+result.experimentalSaveKey);
console.log('V2.27 preservada; progressos locais do Gemini ainda separados dos da V2.27.');
