"""Build a reproducible Belém/PB GeoJSON extract from official municipal + OSM data.

Requires: PYTHONPATH=/tmp/roncador_geolibs python import_belem_osm.py \
  /tmp/roncador_belem_municipio_2026.osm /tmp/roncador_pb_municipios_2025.zip

OSM geometries are community contributions, not verified site access facts.
"""
from collections import Counter
from io import BytesIO
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import zipfile

import shapefile
from shapely.geometry import LineString, Point, Polygon, shape, mapping

BASE = Path(__file__).resolve().parent
OSM_INPUT = Path(sys.argv[1])
IBGE_INPUT = Path(sys.argv[2])


def tags(element):
    return {tag.get('k'): tag.get('v') for tag in element.findall('tag')}


def iter_lines(geometry):
    if geometry.geom_type == 'LineString':
        yield geometry
    elif geometry.geom_type == 'MultiLineString':
        yield from geometry.geoms
    elif geometry.geom_type == 'GeometryCollection':
        for geom in geometry.geoms:
            yield from iter_lines(geom)


def boundary_of_belem():
    with zipfile.ZipFile(IBGE_INPUT) as z:
        base = 'PB_Municipios_2025'
        reader = shapefile.Reader(
            shp=BytesIO(z.read(base + '.shp')),
            shx=BytesIO(z.read(base + '.shx')),
            dbf=BytesIO(z.read(base + '.dbf')),
            encoding='utf-8',
        )
        for rec in reader.iterShapeRecords():
            if rec.record.as_dict().get('CD_MUN') == '2501906':
                return shape(rec.shape.__geo_interface__)
    raise ValueError('Município Belém 2501906 não encontrado')


def main():
    municipality = boundary_of_belem()
    root = ET.parse(OSM_INPUT).getroot()
    nodes = {n.get('id'): (float(n.get('lon')), float(n.get('lat'))) for n in root.findall('node')}
    features = []
    wanted_areas = {'residential', 'grass', 'forest', 'meadow'}
    wanted_leisure = {'pitch', 'park', 'garden', 'nature_reserve'}
    excluded_highways = {'proposed', 'construction', 'abandoned', 'razed'}
    wanted_pois = {'place_of_worship', 'school', 'hospital', 'bus_station', 'post_office', 'marketplace', 'townhall', 'library', 'theatre', 'police', 'fuel'}

    def emit(fid, geom, props):
        features.append({'type': 'Feature', 'id': fid, 'properties': {'@id': fid, **props}, 'geometry': mapping(geom)})

    for way in root.findall('way'):
        t = tags(way)
        pts = [nodes[ref.get('ref')] for ref in way.findall('nd') if ref.get('ref') in nodes]
        if len(pts) < 2:
            continue
        wid = 'way/' + way.get('id')
        if 'highway' in t and t['highway'] not in excluded_highways and t.get('access') not in ('private', 'no'):
            line = LineString(pts).intersection(municipality)
            for i, part in enumerate(iter_lines(line)):
                if part.length < 0.000006 or len(part.coords) < 2:
                    continue
                emit(wid + ('/' + str(i) if line.geom_type != 'LineString' else ''), part,
                     {k: t[k] for k in ('name', 'highway', 'surface', 'oneway', 'ref', 'lit', 'sidewalk') if k in t})
        elif len(pts) >= 4 and pts[0] == pts[-1] and (
                t.get('landuse') in wanted_areas or t.get('leisure') in wanted_leisure):
            polygon = Polygon(pts)
            if not polygon.is_valid:
                polygon = polygon.buffer(0)
            if polygon.is_empty:
                continue
            intersection = polygon.intersection(municipality)
            if intersection.is_empty:
                continue
            for i, part in enumerate(intersection.geoms if intersection.geom_type == 'MultiPolygon' else [intersection]):
                if part.geom_type != 'Polygon' or part.area < 1e-10:
                    continue
                emit(wid + '/' + str(i), part,
                     {k: t[k] for k in ('name', 'landuse', 'leisure') if k in t})

    for n in root.findall('node'):
        t = tags(n)
        pt = Point(nodes[n.get('id')])
        if not municipality.covers(pt):
            continue
        if not t.get('name'):
            continue
        if not (t.get('amenity') in wanted_pois or t.get('shop') or t.get('tourism')):
            continue
        emit('node/' + n.get('id'), pt,
             {k: t[k] for k in ('name', 'amenity', 'shop', 'tourism', 'historic') if k in t})

    collection = {
        'type': 'FeatureCollection',
        'name': 'Belém/PB — ruas e pontos mapeados para Trilhas do Roncador V2',
        'metadata': {
            'municipality': 'Belém/PB', 'CD_MUN': '2501906',
            'municipal_boundary': 'IBGE Malha Municipal Digital 2025, SIRGAS 2000',
            'street_source': '© OpenStreetMap contributors, ODbL',
            'retrieved_at': '2026-10-31',
            'geographic_crs': 'SIRGAS 2000 / lat-long (EPSG:4674); approximately WGS84',
            'coverage_note': 'Inclui vias OSM dentro dos limites IBGE, não garante todas as vias existentes ou transitáveis',
            'osm_bbox': '-35.553,-6.785,-35.415,-6.641',
        },
        'features': features,
    }
    output = BASE / 'source' / 'belem-osm-2026.geojson'
    output.write_text(json.dumps(collection, ensure_ascii=False, separators=(',', ':')) + '\n')
    kinds = Counter(f['geometry']['type'] for f in features)
    highways = [f for f in features if f['properties'].get('highway')]
    streets = {f['properties']['name'] for f in highways if f['properties'].get('name')}
    print('Generated:', output)
    print('features:', len(features), 'geometry:', dict(kinds))
    print('roads:', len(highways), 'distinct street names:', len(streets))
    print('named POIs:', [(f['properties']['name'], f['geometry']['coordinates']) for f in features if f['geometry']['type'] == 'Point'][:20])


if __name__ == '__main__':
    main()
