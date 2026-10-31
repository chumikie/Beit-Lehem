'use strict';
// Extract only the Gemini inline scripts an AI needs to work on.
// Keep the archived HTML and embedded map/images unchanged.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const sourceFile=path.join(root,'references/gemini-2026-10-31/experimento-anonimizado.html.txt');
const indexFile=path.join(root,'references/gemini-2026-10-31/INDICE.md');
const moduleDir=path.join(root,'gemini-modules');
const SCRIPT=/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
function referenceRanges(){
 const text=fs.readFileSync(indexFile,'utf8'),refs=[];
 for(const line of text.split(/\r?\n/)){
  const match=/^\|\s*([a-z][a-z0-9-]*)\s*\|\s*(\d+)\s*[–-]\s*(\d+)\s*\|/.exec(line);
  if(match)refs.push({name:match[1],from:Number(match[2]),to:Number(match[3])});
 }
 return refs;
}
function inspect(source){
 const refs=referenceRanges(),out=[];
 for(const match of source.matchAll(SCRIPT)){
  const attrs=match[1]||'';
  if(/\bsrc\s*=|\btype\s*=\s*['"]application\/json/i.test(attrs))continue;
  const line=source.slice(0,match.index).split('\n').length;
  // Prefer the exact script start range. Nearby fallback is only for references
  // whose line numbering drifted; it must not steal the next module.
  const exact=refs.filter(r=>line>=r.from&&line<=r.to);
  const nearby=refs.filter(r=>line>=r.from-3&&line<=r.to+1);
  const candidates=(exact.length?exact:nearby).sort((a,b)=>Math.abs(a.from-line)-Math.abs(b.from-line));
  const name=candidates[0]?.name||'inline-'+String(out.length+1).padStart(2,'0');
  out.push({name,line,bytes:Buffer.byteLength(match[2]),body:match[2],start:match.index,full:match[0],attrs});
 }
 if(new Set(out.map(x=>x.name)).size!==out.length)throw Error('Nomes de scripts repetidos: conferir INDICE.md');
 return out;
}
function applyOverrides(html,dir=moduleDir){
 const modules=inspect(html);let result=html,used=[];
 for(const mod of modules){
  const file=path.join(dir,mod.name+'.js');
  if(!fs.existsSync(file))continue;
  const replacement=fs.readFileSync(file,'utf8');
  // Match the original tag rather than replacing a similar code fragment.
  const newTag=mod.full.replace(mod.body,replacement);
  if(newTag===mod.full)continue;
  if(result.split(mod.full).length!==2)throw Error('Script não único: '+mod.name);
  result=result.replace(mod.full,newTag);used.push(mod.name);
 }
 return{html:result,used};
}
function main(){
 const action=process.argv[2]||'list',source=fs.readFileSync(sourceFile,'utf8'),mods=inspect(source);
 if(action==='list'){
  for(const m of mods)console.log(m.name.padEnd(25),String(m.bytes).padStart(8)+' bytes','linha '+m.line);
  console.log('Selecione 1 ou 2 módulos de cada vez: node scripts/gemini-workbench.cjs extract facade-studio street-greetings');
 }else if(action==='extract'){
  const names=process.argv.slice(3);if(!names.length)throw Error('Informe os módulos a extrair; use list para ver os nomes.');
  for(const name of names){
   const mod=mods.find(m=>m.name===name);if(!mod)throw Error('Módulo desconhecido: '+name);
   const file=path.join(moduleDir,name+'.js');
   fs.mkdirSync(moduleDir,{recursive:true});
   if(fs.existsSync(file))throw Error('Arquivo já existe, preservado: '+file);
   fs.writeFileSync(file,mod.body,'utf8');
   console.log('Módulo extraído (não sobrescrito): '+path.relative(root,file));
  }
 }else if(action==='check'){
  const r=applyOverrides(source);console.log('Módulos sobrepostos: '+(r.used.join(', ')||'nenhum'));
  console.log('Scripts identificados: '+mods.length);
 }else throw Error('Use list, extract <nome...> ou check.');
}
if(require.main===module){try{main()}catch(e){console.error(e.message);process.exitCode=1}}
module.exports={inspect,applyOverrides,referenceRanges};
