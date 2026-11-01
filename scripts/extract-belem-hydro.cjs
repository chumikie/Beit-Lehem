'use strict';
// Reproducible extraction from a dated OSM API XML snapshot. Run with:
// node scripts/extract-belem-hydro.cjs /path/to/map.osm
// Never derive coordinates by tracing Google Maps screenshots.
const fs=require('node:fs');
const path=require('node:path');
const input=process.argv[2];
if(!input)throw Error('Informe o arquivo XML OSM obtido da API pública.');
const xml=fs.readFileSync(input,'utf8');
if(!xml.includes('<osm'))throw Error('Não parece um XML do OpenStreetMap.');
const nodes=new Map();
for(const m of xml.matchAll(/<node\s+([^>]*?)\s*\/>/g)){
 const attrs=Object.fromEntries([...m[1].matchAll(/([\w:]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]));
 if(attrs.id)nodes.set(attrs.id,[Number(attrs.lon),Number(attrs.lat)]);
}
const features=[];
for(const match of xml.matchAll(/<way\s+id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g)){
 const id=match[1],body=match[2],tags=Object.fromEntries([...body.matchAll(/<tag\s+k="([^"]+)"\s+v="([^"]*)"\s*\/>/g)].map(x=>[x[1],x[2]]));
 if(tags.natural!=='water'||tags.access==='private'||tags.access==='no')continue;
 const refs=[...body.matchAll(/<nd\s+ref="(\d+)"\s*\/>/g)].map(m=>m[1]);
 if(refs.length<4||refs[0]!==refs.at(-1))continue;
 const ring=refs.map(ref=>nodes.get(ref));
 if(ring.some(p=>!p||!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[0]<-35.56||p[0]>-35.49||p[1]<-6.72||p[1]>-6.66))continue;
 features.push({type:'Feature',id:'way/'+id,properties:{'@id':'way/'+id,name:tags.name||'',natural:'water',...(tags.water?{water:tags.water}:{})},geometry:{type:'Polygon',coordinates:[ring]}});
}
if(features.length!==2)throw Error('Esperados 2 polígonos públicos de água no recorte; obtidos '+features.length+'. Revisão manual necessária.');
const output=path.resolve(__dirname,'../source/belem-aguas-osm-2026-11-01.geojson');
const fc={type:'FeatureCollection',name:'Massas d’água verificadas em recorte de Belém/PB',metadata:{municipality:'Belém/PB',CD_MUN:'2501906',source:'© OpenStreetMap contributors, ODbL',retrieved_at:'2026-11-01',osm_api_bbox:'-35.56,-6.72,-35.49,-6.66',note:'Contornos vetoriais OSM; não comprova nível de água, acesso público ou navegabilidade'},features};
fs.writeFileSync(output,JSON.stringify(fc)+'\n');
console.log('Hidrografia OSM:',features.map(f=>f.id+' ('+f.geometry.coordinates[0].length+' vértices)').join(', '));
console.log('Arquivo:',output);
