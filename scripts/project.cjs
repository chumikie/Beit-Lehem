const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),task=process.argv[2];
function run(args){const result=cp.spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);}
function build(){run(['build-standalone.cjs']);fs.mkdirSync(path.join(root,'build'),{recursive:true});for(const [from,to]of [['Trilhas-do-Roncador-Cozy-V2-27.html','jogo.html'],['Trilhas-do-Roncador-Cozy-V2-27-Celular.html','jogo-celular.html']])fs.copyFileSync(path.join(root,'dist',from),path.join(root,'build',to));console.log('Abra build/jogo.html ou build/jogo-celular.html.');}
function openPage(relativePath){const url=pathToFileURL(path.join(root,relativePath)).href;const command=process.platform==='win32'?'rundll32.exe':process.platform==='darwin'?'open':'xdg-open';const args=process.platform==='win32'?['url.dll,FileProtocolHandler',url]:[url];const child=cp.spawn(command,args,{detached:true,stdio:'ignore'});child.on('error',()=>console.log(`Abra o arquivo ${relativePath} manualmente.`));child.unref();}
if(task==='test'){const files=fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.test.cjs')).sort().map(f=>'tests/'+f);run(['--test',...files]);}
else if(task==='build')build();
else if(task==='play'){build();openPage('build/jogo.html');}
else if(task==='play:gemini'){run(['scripts/build-gemini-preview.cjs']);openPage('build/gemini-preview.html');}
else if(task==='verify-baseline'){const expected=fs.readFileSync(path.join(root,'baseline','SHA256.txt'),'utf8').split(/\\s+/)[0],actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'baseline','Belem-Viva-V2-27.html'))).digest('hex');if(actual!==expected)throw Error('A cópia congelada V2.27 foi modificada.');console.log('V2.27 congelada: SHA-256 confere.');}
else{console.log('Uso: node scripts/project.cjs test | build | play | play:gemini | verify-baseline');process.exitCode=1;}
