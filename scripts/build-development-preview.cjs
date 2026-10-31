'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
function run(args){const result=cp.spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);}
run(['build-standalone.cjs']);
const source=path.join(root,'dist','Trilhas-do-Roncador-Cozy-V2-27.html'),dir=path.join(root,'previews'),output=path.join(dir,'beit-lehem-development.html');
fs.mkdirSync(dir,{recursive:true});fs.copyFileSync(source,output);
console.log('Prévia de desenvolvimento pronta: previews/beit-lehem-development.html');
