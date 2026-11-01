'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  composeCurrentMap,
  extractEmbeddedMap,
  replaceEmbeddedMap
} = require('../scripts/current-geodata.cjs');

const root = path.resolve(__dirname, '..');
const osm = JSON.parse(fs.readFileSync(path.join(root, 'source/belem-osm-2026.geojson'), 'utf8'));
const preview = fs.readFileSync(path.join(root, 'previews/beit-lehem-development.html'), 'utf8');
const templateMap = extractEmbeddedMap(preview);

test('a malha ativa usa geometrias OSM sem deslocar ruas ou polígonos', () => {
  const map = composeCurrentMap(osm, templateMap);

  assert.equal(map.roads.length, 462);
  assert.equal(map.areas.length, 20);
  assert.deepEqual(map.roads.map(road => ({id: road.id, p: road.p})),
    templateMap.roads.map(road => ({id: road.id, p: road.p})));
  assert.deepEqual(map.areas.map(area => area.p), templateMap.areas.map(area => area.p));

  const sourceRoads = new Map(osm.features
    .filter(feature => feature.geometry?.type === 'LineString' && feature.properties?.highway)
    .map(feature => [feature.properties['@id'], feature]));
  for (const road of map.roads) {
    const source = sourceRoads.get(road.id);
    assert.ok(source, 'via ativa corresponde a um identificador OSM');
    for (const key of ['name', 'highway', 'surface', 'oneway', 'ref', 'lit', 'sidewalk']) {
      assert.equal(road.tags[key], source.properties[key], road.id + ' · ' + key);
    }
  }
});

test('nomes oficiais vêm apenas de properties.name do OSM, sem correção de acentos', () => {
  const map = composeCurrentMap(osm, templateMap);
  const sourceNames = new Set(osm.features
    .filter(feature => feature.properties?.highway && feature.properties?.name)
    .map(feature => feature.properties.name));
  const mapNames = new Set(map.roads.map(road => road.tags.name).filter(Boolean));

  assert.equal(map.streetNameCount, 86);
  assert.deepEqual([...mapNames].sort(), [...sourceNames].sort());
  assert.ok(map.roads.some(road => road.tags.name === 'Rua Clovis Bezerra'));
  assert.ok(map.roads.some(road => road.tags.name === 'Rua Floranea'));
  assert.ok(!map.roads.some(road => road.tags.name === 'Vila Sul · Clóvis Bezerra'));
  assert.ok(!map.roads.some(road => road.tags.name === 'Acesso Leste · Clóvis Bezerra'));

  assert.ok(map.unverifiedRoadLabels.length >= 1);
  for (const proposal of map.unverifiedRoadLabels) {
    assert.equal(proposal.displayedAsStreetName, false);
    assert.equal(map.roads.find(road => road.id === proposal.roadId)?.tags.name,
      proposal.sourceName);
  }
});

test('POIs locais são mantidos como aliases separados dos pontos OSM', () => {
  const map = composeCurrentMap(osm, templateMap);
  const osmPointFeatures = osm.features.filter(feature => feature.geometry?.type === 'Point');

  assert.equal(map.points.length, osmPointFeatures.length);
  assert.equal(map.points.length, 9);
  assert.equal(map.localPlaces.length, 9);
  const osmPointNames = new Set(osmPointFeatures.map(feature => feature.properties.name));
  assert.ok(map.points.every(point => osmPointNames.has(point.tags.name)));
  const game = fs.readFileSync(path.join(root, 'gemini-modules/game.js'), 'utf8');
  const corrections = game.slice(game.indexOf('function applyUserPublicPlaceCorrections()'), game.indexOf('function preprocess()'));
  assert.match(corrections, /for\(const point of \(data\.localPlaces\|\|\[\]\)\)/);
  assert.doesNotMatch(corrections, /data\.points/, 'local corrections cannot move canonical OSM points');
  assert.ok(map.localPlaces.some(place => place.displayName === 'Bar da Prosa (R. Vicente Cado, 354)'));
  assert.ok(map.localPlaces.some(place => place.displayName === 'Confeitaria Sonho Doce (R. Feliciano Pedrosa, 1401)'));
  assert.ok(map.localPlaces.every(place => place.landmarkId && map.landmarks.some(landmark => landmark.id === place.landmarkId)));
  for (const place of map.localPlaces) {
    assert.equal(place.provenance, 'author-curated');
    assert.equal(place.nameRole, 'game-display-alias');
    assert.equal(typeof place.displayName, 'string');
    assert.ok(place.displayName.length > 0);
    assert.ok(!Object.prototype.hasOwnProperty.call(place, 'tags'),
      'aliases locais não devem parecer tags OSM');
  }
  for (const landmark of map.landmarks) {
    assert.equal(landmark.displayName, landmark.name);
    assert.ok(['author-curated', 'openstreetmap', 'author-reference'].includes(landmark.nameProvenance));
  }
});

test('acabamento de pavimento sobrevive numa camada visual sem contaminar tags OSM', () => {
  const map = composeCurrentMap(osm, templateMap);
  const oldRoads = new Map(templateMap.roads.map(road => [road.id, road]));
  let overrides = 0;
  for (const road of map.roads) {
    const oldSurface = oldRoads.get(road.id)?.tags?.surface;
    const override = map.roadAppearance[road.id]?.surface;
    const effectiveSurface = override || road.tags.surface;
    if (override) {
      overrides++;
      assert.notEqual(override, road.tags.surface);
    }
    assert.equal(effectiveSurface, oldSurface || road.tags.surface);
  }
  assert.ok(overrides > 0);
});

test('o build bloqueia alterações geométricas OSM não revisadas', () => {
  const changed = structuredClone(templateMap);
  changed.roads[0].p[0][0] += 1;
  assert.throws(() => composeCurrentMap(osm, changed), /geometria OSM mudou/);
});

test('o bloco embedded-map-data recebe o mapa composto sem tocar no resto do HTML', () => {
  const map = composeCurrentMap(osm, templateMap);
  const prefix = '<script type="application/json" id="embedded-map-data">';
  const suffix = '</script>';
  const html = '<main>preservar</main>' + prefix + JSON.stringify(templateMap) + suffix + '<footer>fim</footer>';
  const result = replaceEmbeddedMap(html, map);

  assert.ok(result.startsWith('<main>preservar</main>'));
  assert.ok(result.endsWith('<footer>fim</footer>'));
  assert.deepEqual(extractEmbeddedMap(result), map);
});
