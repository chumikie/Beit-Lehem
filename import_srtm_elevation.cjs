/* Offline terrain sampling for Belém Viva. Run only when intentionally
   refreshing evidence: node import_srtm_elevation.cjs
   NASA SRTM via OpenTopoData (not street surveying or a slope measurement). */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const map=require('./dist/map.json');
const grid={x0:-700,y0:-1120,step:140,width:11,height:15};
const {originLat,originLon,metersPerDegreeLon,metersPerDegreeLat}=map.projection;
const places=[];
for(let row=0;row<grid.height;row++)for(let col=0;col<grid.width;col++){
 const x=grid.x0+col*grid.step,y=grid.y0+row*grid.step;
 const lat=Number((originLat-y/metersPerDegreeLat).toFixed(7));
 const lon=Number((originLon+x/metersPerDegreeLon).toFixed(7));
 places.push({x,y,lat,lon});
}
async function elevationBatch(batch){
 const args=new URLSearchParams({locations:batch.map(p=>`${p.lat},${p.lon}`).join('|'),interpolation:'bilinear'});
 const url=`https://api.opentopodata.org/v1/srtm30m?${args}`;
 for(let tries=1;tries<=3;tries++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   const data=await response.json();
   if(data.status!=='OK'||data.results?.length!==batch.length)throw Error('incomplete elevation response');
   return data.results.map((r,i)=>{
    if(r.dataset!=='srtm30m'||!Number.isFinite(r.elevation)||Math.abs(r.location.lat-batch[i].lat)>.00001||Math.abs(r.location.lng-batch[i].lon)>.00001)
     throw Error('unverified elevation or mismatched coordinate');
    return r.elevation;
   });
  }catch(err){if(tries===3)throw err;await new Promise(done=>setTimeout(done,1800*tries));}
 }
}
(async()=>{
 const values=[];
 for(let i=0;i<places.length;i+=80){
  const batch=places.slice(i,i+80);
  const heights=await elevationBatch(batch);values.push(...heights);
  process.stdout.write(`SRTM: ${values.length}/${places.length} amostras verificadas\n`);
  if(i+80<places.length)await new Promise(done=>setTimeout(done,1200));
 }
 const payload={
  kind:'dem-grid',projection:map.projection,grid,values,
  source:{dataset:'NASA SRTMGL1, grade de aproximadamente 30 m, altitudes EGM96',provider:'OpenTopoData / srtm30m',
   api:'https://api.opentopodata.org/v1/srtm30m',retrievedAt:new Date().toISOString().slice(0,10),
   sourceDoi:'https://doi.org/10.5067/MEaSUREs/SRTM/SRTMGL1.003',interpolation:'bilinear',
   note:'Grade de 140 m para visualização artística macroscópica. Não permite identificar inclinação de calçadas, degraus ou ruas curtas.'}
 };
 const output=path.join(__dirname,'dist','terrain.json');
 fs.writeFileSync(output,JSON.stringify(payload));
 console.log('Terreno verificado:',output,'altitude',Math.min(...values),'a',Math.max(...values),'m');
})().catch(err=>{console.error('No terrain output was written:',err.message);process.exitCode=1;});
