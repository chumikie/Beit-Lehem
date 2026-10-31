'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
function run(args){const result=cp.spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);}
run(['build-standalone.cjs']);
const desktop=path.join(root,'dist','Trilhas-do-Roncador-Cozy-V2-27.html');
const mobile=path.join(root,'dist','Trilhas-do-Roncador-Cozy-V2-27-Celular.html');
const dir=path.join(root,'previews');
fs.mkdirSync(dir,{recursive:true});
fs.copyFileSync(desktop,path.join(dir,'beit-lehem-development.html'));
fs.copyFileSync(mobile,path.join(dir,'beit-lehem-development-mobile.html'));
console.log('Prévia desktop: previews/beit-lehem-development.html');
console.log('Prévia celular: previews/beit-lehem-development-mobile.html');
