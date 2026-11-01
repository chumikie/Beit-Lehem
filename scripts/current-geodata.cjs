'use strict';

const TAG_FIELDS = [
  'name', 'highway', 'surface', 'leisure', 'landuse', 'amenity',
  'shop', 'tourism', 'oneway', 'ref', 'lit', 'sidewalk'
];

function projectCoordinate(lonLat, projection) {
  if (!Array.isArray(lonLat) || lonLat.length < 2 ||
      !Number.isFinite(lonLat[0]) || !Number.isFinite(lonLat[1])) {
    throw new TypeError('Coordenada OSM inválida.');
  }
  const [lon, lat] = lonLat;
  return [
    Math.round((lon - projection.originLon) * projection.metersPerDegreeLon * 100) / 100,
    Math.round((projection.originLat - lat) * projection.metersPerDegreeLat * 100) / 100
  ];
}

function selectTags(properties) {
  const tags = {};
  for (const key of TAG_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(properties, key)) tags[key] = properties[key];
  }
  return tags;
}

function samePoint(a, b, tolerance = 0.02) {
  return Array.isArray(a) && Array.isArray(b) &&
    Math.hypot(a[0] - b[0], a[1] - b[1]) <= tolerance;
}

function assertGeometryParity(templateMap, roads, areas) {
  if (!Array.isArray(templateMap.roads) || !Array.isArray(templateMap.areas)) {
    throw new TypeError('O mapa-base não contém roads/areas válidos.');
  }

  const previousRoads = new Map(templateMap.roads.map(road => [road.id, road]));
  if (previousRoads.size !== templateMap.roads.length || previousRoads.size !== roads.length) {
    throw new Error('A quantidade ou os identificadores de vias OSM mudaram. Revisão geográfica necessária antes do build.');
  }

  for (const road of roads) {
    const previous = previousRoads.get(road.id);
    if (!previous || JSON.stringify(previous.p) !== JSON.stringify(road.p)) {
      throw new Error('A geometria OSM mudou em ' + road.id + '. Revisão geográfica necessária antes do build.');
    }
  }

  const previousAreaGeometry = templateMap.areas.map(area => area.p);
  const currentAreaGeometry = areas.map(area => area.p);
  if (JSON.stringify(previousAreaGeometry) !== JSON.stringify(currentAreaGeometry)) {
    throw new Error('A geometria dos polígonos OSM mudou. Revisão geográfica necessária antes do build.');
  }
}

function composeCurrentMap(osm, templateMap) {
  if (!osm || osm.type !== 'FeatureCollection' || !Array.isArray(osm.features)) {
    throw new TypeError('Fonte geográfica deve ser uma FeatureCollection GeoJSON.');
  }
  if (osm.metadata?.CD_MUN !== '2501906') {
    throw new Error('A fonte OSM não identifica Belém/PB (CD_MUN 2501906).');
  }
  if (!templateMap?.projection ||
      !Number.isFinite(templateMap.projection.originLon) ||
      !Number.isFinite(templateMap.projection.originLat) ||
      !Number.isFinite(templateMap.projection.metersPerDegreeLon) ||
      !Number.isFinite(templateMap.projection.metersPerDegreeLat)) {
    throw new TypeError('Projeção local do mapa-base inválida.');
  }

  const projection = templateMap.projection;
  const roads = [];
  const areas = [];
  const points = [];

  for (const feature of osm.features) {
    const properties = feature?.properties || {};
    const geometry = feature?.geometry;
    if (!geometry || !Array.isArray(geometry.coordinates)) {
      throw new Error('Geometria GeoJSON ausente em ' + (feature?.id || 'feição sem ID') + '.');
    }
    const tags = selectTags(properties);

    if (geometry.type === 'LineString' && tags.highway) {
      if (typeof properties['@id'] !== 'string' || !properties['@id']) {
        throw new Error('Via OSM sem @id estável.');
      }
      roads.push({
        id: properties['@id'],
        p: geometry.coordinates.map(pair => projectCoordinate(pair, projection)),
        tags
      });
    } else if (geometry.type === 'Polygon') {
      areas.push({
        p: geometry.coordinates.map(ring => ring.map(pair => projectCoordinate(pair, projection))),
        tags
      });
    } else if (geometry.type === 'Point') {
      points.push({
        id: properties['@id'] || feature.id || null,
        p: projectCoordinate(geometry.coordinates, projection),
        tags
      });
    }
  }

  assertGeometryParity(templateMap, roads, areas);

  const osmRoadById = new Map(roads.map(road => [road.id, road]));
  const roadAppearance = { ...(templateMap.roadAppearance || {}) };
  const unverifiedRoadLabels = [ ...(templateMap.unverifiedRoadLabels || []) ];

  for (const previous of templateMap.roads) {
    const canonical = osmRoadById.get(previous.id);
    if (!canonical) continue;

    // Preserve hand-tuned pavement rendering, but never write it into OSM tags.
    const visualSurface = previous.tags?.surface;
    if (visualSurface && visualSurface !== canonical.tags.surface) {
      roadAppearance[previous.id] = {
        ...(roadAppearance[previous.id] || {}),
        surface: visualSurface,
        provenance: 'game-visual-override'
      };
    }

    // A suggested label is not an OSM street name. Keep it reviewable but inert.
    const proposedName = previous.tags?.name;
    if (proposedName && proposedName !== canonical.tags.name &&
        !unverifiedRoadLabels.some(item => item.roadId === previous.id)) {
      unverifiedRoadLabels.push({
        roadId: previous.id,
        sourceName: canonical.tags.name || null,
        proposedLabel: proposedName,
        status: 'needs-author-review',
        displayedAsStreetName: false
      });
    }
  }

  const localPlaces = [ ...(templateMap.localPlaces || []) ];
  const osmPointAt = point => points.find(candidate => samePoint(candidate.p, point.p));
  for (const previous of templateMap.points || []) {
    const sameLocation = osmPointAt(previous);
    if (sameLocation && sameLocation.tags?.name === previous.tags?.name) continue;

    const landmark = (templateMap.landmarks || []).find(item =>
      item.name === previous.tags?.name ||
      (sameLocation && item.name === sameLocation.tags?.name));
    const record = {
      id: landmark?.id || 'local-place-' + String(localPlaces.length + 1),
      landmarkId: landmark?.id || null,
      displayName: previous.tags?.name || landmark?.name || 'Ponto local',
      sourceName: sameLocation?.tags?.name || null,
      sourceId: sameLocation?.id || null,
      p: previous.p.slice(),
      kind: landmark?.kind || 'place',
      provenance: 'author-curated',
      nameRole: 'game-display-alias',
      positionStatus: landmark?.positionStatus || 'author-reference-unverified'
    };
    const existing = localPlaces.findIndex(item => item.id === record.id);
    if (existing >= 0) localPlaces[existing] = record;
    else localPlaces.push(record);
  }

  const osmStreetNames = new Set(roads.map(road => road.tags.name).filter(Boolean));
  const enrichedLandmarks = (templateMap.landmarks || []).map(landmark => {
    const local = localPlaces.find(place => place.landmarkId === landmark.id);
    const osmPoint = points.find(point =>
      point.tags?.name === landmark.name && samePoint(point.p, landmark.p));
    return {
      ...landmark,
      displayName: landmark.displayName || landmark.name,
      sourceName: local?.sourceName ?? osmPoint?.tags?.name ?? landmark.sourceName ?? null,
      nameProvenance: local ? 'author-curated' : osmPoint ? 'openstreetmap' : 'author-reference'
    };
  });

  return {
    ...templateMap,
    roads,
    areas,
    points,
    landmarks: enrichedLandmarks,
    localPlaces,
    roadAppearance,
    unverifiedRoadLabels,
    source: 'belem-osm-2026.geojson',
    featureCount: osm.features.length,
    streetNameCount: osmStreetNames.size,
    sourceMetadata: osm.metadata,
    geography: {
      municipalityCode: '2501906',
      streetNameField: 'OSM properties.name',
      streetNamesAreCanonical: true,
      localAliasesAreSeparate: true,
      geometryGuard: 'exact-match-to-reviewed-game-map'
    }
  };
}

function extractEmbeddedMap(html) {
  const pattern = /(<script\b(?=[^>]*\bid=["']embedded-map-data["'])[^>]*>)([\s\S]*?)(<\/script>)/gi;
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error('Esperado exatamente um bloco embedded-map-data; o mapa-base não foi alterado.');
  }
  try {
    return JSON.parse(matches[0][2]);
  } catch (error) {
    throw new Error('O mapa embutido não é JSON válido: ' + error.message);
  }
}

function replaceEmbeddedMap(html, map) {
  const pattern = /(<script\b(?=[^>]*\bid=["']embedded-map-data["'])[^>]*>)([\s\S]*?)(<\/script>)/gi;
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error('Esperado exatamente um bloco embedded-map-data; nenhum HTML foi gerado.');
  }
  const match = matches[0];
  const replacement = match[1] + JSON.stringify(map) + match[3];
  return html.slice(0, match.index) + replacement + html.slice(match.index + match[0].length);
}

module.exports = {
  composeCurrentMap,
  extractEmbeddedMap,
  projectCoordinate,
  replaceEmbeddedMap,
  samePoint
};
