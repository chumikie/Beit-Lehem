/* V2.4 illustration-only layout: put symbolic buildings in clear visual pockets,
 * not on top of surveyed OSM roads or mission pins. Never infer a building footprint.
 */
(function (root) {
  'use strict';
  const TYPES = {
    church: {scale: .43, extent: [-31, -81, 31, 43]},
    market: {scale: .52, extent: [-48, -43, 48, 50]},
    square: {scale: .62, extent: [-52, -38, 52, 50]},
    terminal: {scale: .63, extent: [-36, -27, 36, 42]},
  };

  function bounds(scene, margin = 0) {
    const e = TYPES[scene.kind].extent;
    return [scene.at[0] + e[0] * scene.scale - margin,
      scene.at[1] + e[1] * scene.scale - margin,
      scene.at[0] + e[2] * scene.scale + margin,
      scene.at[1] + e[3] * scene.scale + margin];
  }
  function contains(rect, x, y) {
    return x >= rect[0] && x <= rect[2] && y >= rect[1] && y <= rect[3];
  }
  function intersects(a, b) {
    return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  }
  function distRoad(x, y, segments) {
    let nearest = Infinity;
    for (const s of segments) {
      const t = Math.max(0, Math.min(1, ((x-s.ax)*s.dx+(y-s.ay)*s.dy) / s.len2));
      const distance = Math.hypot(x-s.ax-t*s.dx, y-s.ay-t*s.dy);
      if (distance < nearest) nearest = distance;
    }
    return nearest;
  }
  function lineSegments(roads) {
    const result = [];
    for (const road of roads) for (let i = 1; i < road.p.length; i++) {
      const a = road.p[i - 1], b = road.p[i], dx = b[0] - a[0], dy = b[1] - a[1];
      const len2 = dx*dx + dy*dy;
      if (len2 > .01) result.push({ax:a[0],ay:a[1],dx,dy,len2,
        bounds:[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])]});
    }
    return result;
  }
  function layout(data) {
    const entries = [...data.landmarks, ...(data.cultureReferences || []).filter(r => r.visualReference)];
    const segments = lineSegments(data.roads);
    const scenes = [];
    for (const item of entries) {
      const anchor = item.p || item.visualReference;
      const kind = item.kind;
      if (!TYPES[kind]) continue;
      const nearby = segments.filter(s => s.bounds[0] < anchor[0]+165 && s.bounds[2] > anchor[0]-165 && s.bounds[1] < anchor[1]+165 && s.bounds[3] > anchor[1]-165);
      let best = null;
      for (const radius of [19, 29, 40, 53, 67, 79]) {
        for (let k = 0; k < 16; k++) {
          const angle = (k + (kind === 'church' ? .8 : kind === 'market' ? .4 : .05)) * Math.PI / 8;
          const candidate = {id:item.id,kind,name:item.name,
            at:[anchor[0]+Math.cos(angle)*radius,anchor[1]+Math.sin(angle)*radius],
            anchor:item.p || null,positionStatus:item.positionStatus,scale:TYPES[kind].scale};
          const rect = bounds(candidate, 3);
          let penalty = radius * 1.25;
          for (let xi = 0; xi < 5; xi++) for (let yi = 0; yi < 5; yi++) {
            const x = rect[0] + (rect[2]-rect[0]) * xi / 4;
            const y = rect[1] + (rect[3]-rect[1]) * yi / 4;
            const d = distRoad(x, y, nearby);
            if (d < 6) penalty += 32 + 21 * (6-d);
          }
          for (const mission of data.missions) if (contains(bounds(candidate, 17), ...mission.p)) penalty += 650;
          for (const place of data.points) if (place.tags.name!==item.name && contains(bounds(candidate, 10), ...place.p)) penalty += 270;
          if (contains(bounds(candidate, 25), ...data.start)) penalty += 320;
          for (const prior of scenes) if (intersects(bounds(candidate, 14), bounds(prior, 14))) penalty += 1200;
          // Keep decorated lots near the reference, but avoid covering roads.
          if (!best || penalty < best.penalty) best = {...candidate,penalty};
        }
      }
      if (best) scenes.push(best);
    }
    return scenes;
  }
  const API = {layout,bounds,contains,intersects};
  if (typeof root !== 'undefined') root.RoncadorScenicPlacement = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : undefined);
