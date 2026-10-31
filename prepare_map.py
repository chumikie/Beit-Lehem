"""Prepare a compact projected game world from the Belém/PB OSM extract.

The initial Roncador-region source is preserved as source/export.geojson.
"""
import json
import math
from pathlib import Path

BASE = Path(__file__).resolve().parent
SOURCE = BASE / 'source' / 'belem-osm-2026.geojson'
source = json.loads(SOURCE.read_text())
features = source['features']

# OSM Belém town centre, node 415521443. An approximate game projection only.
ORIGIN_LON = -35.53696
ORIGIN_LAT = -6.69676
METERS_LON = 111320 * math.cos(math.radians(ORIGIN_LAT))
METERS_LAT = 111320


def project(lonlat):
    return [round((lonlat[0] - ORIGIN_LON) * METERS_LON, 2),
            round((ORIGIN_LAT - lonlat[1]) * METERS_LAT, 2)]


roads, areas, points = [], [], []
for feature in features:
    props = feature['properties']
    geom = feature['geometry']
    tags = {key: props[key] for key in (
        'name', 'highway', 'surface', 'leisure', 'landuse',
        'amenity', 'shop', 'tourism', 'oneway', 'ref', 'lit', 'sidewalk'
    ) if key in props}
    if geom['type'] == 'LineString' and tags.get('highway'):
        roads.append({'id': props['@id'], 'p': [project(c) for c in geom['coordinates']], 'tags': tags})
    elif geom['type'] == 'Polygon':
        areas.append({'p': [[project(c) for c in ring] for ring in geom['coordinates']], 'tags': tags})
    elif geom['type'] == 'Point':
        points.append({'p': project(geom['coordinates']), 'tags': tags})


def nearby_street(name, target=(0, 0)):
    candidates = [p for road in roads if road['tags'].get('name') == name for p in road['p']]
    if not candidates:
        raise ValueError(f'Rua mapeada não encontrada: {name}')
    return min(candidates, key=lambda p: (p[0] - target[0]) ** 2 + (p[1] - target[1]) ** 2)


start = nearby_street('Rua Joaquim Rodrigues', (0, 0))


def osm_point(name):
    """Keep documented POI points separate from decorative scene geometry."""
    matches = [point for point in points if point['tags'].get('name') == name]
    if not matches:
        raise ValueError(f'Ponto OSM não encontrado: {name}')
    return matches[0]['p']


def street_near_point_of_interest(name):
    center = osm_point(name)
    return min((p for road in roads for p in road['p']),
               key=lambda p: (p[0] - center[0]) ** 2 + (p[1] - center[1]) ** 2)


missions = []
for title, name, icon, description, approximate in [
    ('Primeiros caminhos', 'Rua São José', 'compass', 'Explore uma rua registrada no mapa de Belém.', (-150, -80)),
    ('O coração de Belém', 'Rua São Pedro', 'flag', 'Conheça as conexões entre ruas reais da sede urbana.', (220, -100)),
    ('Perto do campo', 'Rua do Campo', 'ball', 'Observe os caminhos e o cotidiano da cidade.', (450, -220)),
]:
    missions.append({'title': title, 'name': name, 'icon': icon,
                     'p': nearby_street(name, approximate), 'description': description})

missions.extend([
    {'title': 'Histórias do mercado', 'name': 'Mercado Público de Belém',
     'icon': 'sign', 'p': street_near_point_of_interest('Mercado Público de Belém'),
     'description': 'Lugar identificado pelo OpenStreetMap; a visita e o nome devem ser confirmados localmente.'},
    {'title': 'Memória da cidade', 'name': 'Igreja de Belém',
     'icon': 'leaf', 'p': street_near_point_of_interest('Igreja de Belém'),
     'description': 'Referência mapeada na cidade; sem afirmar horários nem acesso.'},
])

# A fictional end-of-chapter station, anchored to a real road segment.
station = min((p for road in roads for p in road['p']),
              key=lambda p: (p[0] + 420) ** 2 + (p[1] - 480) ** 2)
missions.append({
    'title': 'Cartas para o Roncador', 'name': 'Estação Roncador (ficcional)',
    'icon': 'tree', 'p': station,
    'description': 'Um ponto de história criado para o jogo, não uma estação real identificada.',
})

all_points = [p for road in roads for p in road['p']] + [p for area in areas for ring in area['p'] for p in ring]
bounds = [min(p[0] for p in all_points) - 70,
          min(p[1] for p in all_points) - 70,
          max(p[0] for p in all_points) + 70,
          max(p[1] for p in all_points) + 70]
street_names = {road['tags']['name'] for road in roads if road['tags'].get('name')}

# OSM POIs are reference points only: they do not describe building orientation,
# outline or facade. Never draw an invented footprint over streets.
landmarks = [
    {'id': 'igreja', 'kind': 'church', 'name': 'Igreja de Belém',
     'p': osm_point('Igreja de Belém'), 'positionStatus': 'osm_point',
     'artStatus': 'fachada estilizada; não corresponde a levantamento arquitetônico'},
    {'id': 'mercado', 'kind': 'market', 'name': 'Mercado Público de Belém',
     'p': osm_point('Mercado Público de Belém'), 'positionStatus': 'osm_point',
     'artStatus': 'mercado ilustrativo e barracas inspiradas na feira local'},
    {'id': 'rodoviaria', 'kind': 'terminal', 'name': 'Estação Rodoviária',
     'p': osm_point('Estação Rodoviária'), 'positionStatus': 'osm_point',
     'artStatus': 'terminal ilustrativo, não réplica da fachada real'},
]

# Research references with no confirmed geometry do not get map coordinates.
culture_references = [
    {'id': 'praca_6_setembro', 'kind': 'square', 'name': 'Praça 6 de Setembro',
     'positionStatus': 'unverified_no_geometry',
     'visualReference': [160, -155],
     'artStatus': 'cena conceitual da requalificação; posição não mapeada'},
]

data = {
    'roads': roads, 'areas': areas, 'points': points, 'landmarks': landmarks,
    'cultureReferences': culture_references,
    'start': start, 'missions': missions,
    'source': 'belem-osm-2026.geojson', 'featureCount': len(features),
    'streetNameCount': len(street_names),
    'urbanCenter': [0, 0],
    'projection': {'originLon': ORIGIN_LON, 'originLat': ORIGIN_LAT,
                   'metersPerDegreeLon': METERS_LON, 'metersPerDegreeLat': METERS_LAT,
                   'description': 'Plano local aproximado para o jogo; não usar para GPS'},
    'attribution': 'Vias e locais: © colaboradores do OpenStreetMap (ODbL). Limite municipal de recorte: IBGE, Malha Municipal Digital 2025.',
    'sourceMetadata': source['metadata'],
    'bounds': bounds,
}
(BASE / 'dist' / 'map.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
print('Belém/PB:', len(features), 'features;', len(roads), 'road sections;', len(street_names), 'street names;', len(points), 'named POIs')
print('Start', start, 'missions', [(m['name'], m['p']) for m in missions])
