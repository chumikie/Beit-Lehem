/* Derive a small, auditable GPS-point layer from the official SGB ArcGIS export. */
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const map = JSON.parse(fs.readFileSync(path.join(root,'dist/map.json')));
const raw = JSON.parse(fs.readFileSync(path.join(root,'source/sgb-afloramentos-belem-2026.geojson')));
const p = map.projection;
if (raw.type !== 'FeatureCollection' || !Array.isArray(raw.features)) throw Error('Invalid SGB data');
const points = raw.features.map(feature => {
  const tags = feature.properties, coord = feature.geometry?.coordinates;
  if (feature.geometry?.type !== 'Point' || tags.UF !== 'PB' || tags.MUNICIPIO !== 'Belém' ||
    tags.DATUM !== 'WGS84' || !Number.isFinite(coord?.[0]) || !Number.isFinite(coord?.[1])) throw Error('Unexpected point or municipality');
  const x = +( (coord[0] - p.originLon) * p.metersPerDegreeLon ).toFixed(2);
  const y = +( (p.originLat - coord[1]) * p.metersPerDegreeLat ).toFixed(2);
  return { id:tags.ID_AFLORAMENTO, site:tags.TOPONIMIA, type:tags.TIPO_AFLORAMENTO,
    rock:tags.ROCHAS, method:tags.METODO_GEOPOSICIONAMENTO,
    lon:+coord[0].toFixed(8),lat:+coord[1].toFixed(8),p:[x,y] };
}).sort((a,b)=>a.id-b.id);
if (new Set(points.map(x=>x.id)).size !== points.length || points.length < 1) throw Error('SGB IDs are missing or repeated');
const output = { source:'SGB Geoportal Geológico — Afloramentos, consulta por UF=PB e MUNICIPIO=Belém, 31/10/2026',
  url:'https://geoportal.sgb.gov.br/server/rest/services/geologia/afloramentos/MapServer/0',
  kind:'GPS point observations, not geological outcrop contours or public visit destinations',
  points };
fs.writeFileSync(path.join(root,'dist/geology.json'),JSON.stringify(output,null,2)+'\n');
console.log(`Geologia SGB: ${points.length} observações GPS de Belém/PB`);
