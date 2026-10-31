'use strict';
// Creates a standalone, metadata-scrubbed public review candidate.
// This tool never deploys, changes repository visibility or edits source HTML.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const input=path.join(root,'previews/beit-lehem-development.html');
const output=path.join(root,'build/public-preview/index.html');
function cleanJpeg(encoded){
 const bytes=Buffer.from(encoded,'base64');
 if(bytes[0]!==0xff||bytes[1]!==0xd8)throw Error('Imagem JPEG inválida');
 const pieces=[bytes.subarray(0,2)];let pos=2,removed=0,scan=false;
 while(pos<bytes.length){
  if(bytes[pos]!==0xff)throw Error('Marcador JPEG inválido');
  const start=pos;while(bytes[pos]===0xff)pos++;
  const marker=bytes[pos++];
  if(marker===0xda){pieces.push(bytes.subarray(start));scan=true;break;}
  if(marker===0xd9){pieces.push(bytes.subarray(start));break;}
  if(marker===0x01||(marker>=0xd0&&marker<=0xd7)){pieces.push(bytes.subarray(start,pos));continue;}
  const len=bytes.readUInt16BE(pos),end=pos+len;
  if(len<2||end>bytes.length)throw Error('Segmento JPEG incompleto');
  if([0xe1,0xed,0xfe].includes(marker))removed++;
  else pieces.push(bytes.subarray(start,end));
  pos=end;
 }
 if(!scan||removed===0)throw Error('JPEG sem metadados esperados: revisar antes de publicar');
 const result=Buffer.concat(pieces);
 if(result.at(-2)!==0xff||result.at(-1)!==0xd9)throw Error('Fim de JPEG inválido');
 return result.toString('base64');
}
function build(){
 let html=fs.readFileSync(input,'utf8');
 if(!html.includes('aria-label="Beit Lehem"')||
    !html.includes("const STORE='roncador-expedition-v2-referencias-gemini'"))
  throw Error('Prévia incompatível: conferir marca e chave de salvamento.');
 let count=0;
 html=html.replace(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/g,(_,encoded)=>{
  count++;return 'data:image/jpeg;base64,'+cleanJpeg(encoded);
 });
 if(count!==2)throw Error('Esperadas exatamente duas fotos JPEG históricas; confira a fonte.');
 const header=/^<!--[\s\S]*?-->\s*/;
 if(!header.test(html))throw Error('Cabeçalho de referência não localizado.');
 html=html.replace(header,'');
 const font=/@import url\('https:\/\/fonts\.googleapis\.com\/css2\?[^']+'\);\s*/;
 if(!font.test(html))throw Error('Fonte remota inesperada; revisar manualmente.');
 html=html.replace(font,'');
 if(html.includes('fonts.googleapis.com'))throw Error('Fontes externas permaneceram no pacote.');
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,html,'utf8');
 console.log('Prévia sanitizada: '+path.relative(root,output)+' ('+Buffer.byteLength(html)+' bytes).');
 console.log('Duas fotos sem EXIF; fonte remota e cabeçalho interno removidos. NÃO PUBLICADO.');
}
if(require.main===module){try{build()}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={cleanJpeg,build};
