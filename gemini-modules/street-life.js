
/* V2.7: fictional pedestrians follow edges of the existing OSM road graph. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RoncadorStreetLife = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  function itinerary(graph, anchor, variant = 0, limit = 95) {
    if (!graph?.nodes?.length) return [];
    const nearest = graph.nearest(anchor);
    if (nearest.distance > 120) return []; // No fictional shortcut to an unmapped street.
    const nodes = graph.nodes;
    const visited = new Set([nearest.id]);
    const path = [{ x: nodes[nearest.id].x, y: nodes[nearest.id].y }];
    let cursor = nearest.id, total = 0;
    for (let step = 0; step < 12; step++) {
      const choices = nodes[cursor].neighbours
        .filter(e => !visited.has(e.id) && total + e.metres < limit &&
          Math.hypot(nodes[e.id].x - anchor[0], nodes[e.id].y - anchor[1]) < limit)
        .sort((a, b) => a.metres - b.metres || a.id - b.id);
      if (!choices.length) break;
      // Secondary neighbors use variants 6+; retain their individual branch
      // choices instead of collapsing every pair to the same parity route.
      const choice = choices[(variant + Math.floor(variant / 6) + step) % choices.length];
      visited.add(choice.id);total += choice.metres;cursor = choice.id;
      path.push({ x: nodes[cursor].x, y: nodes[cursor].y });
      // The validated graph and the existing `limit` already bound the walk.
      // Cutting at 32 m made several neighbors trace identical short segments.
    }
    // A short dead-end should not confine a resident when another continuous
    // route on the same mapped block reaches a proper walking distance.
    if (total < 58) {
      const alternatives = [];
      const search = (id, distance, ids) => {
        if (distance >= 58) { alternatives.push({ distance, ids }); return; }
        if (ids.length >= 12) return;
        for (const edge of nodes[id].neighbours) {
          if (ids.includes(edge.id) || distance + edge.metres >= limit ||
              Math.hypot(nodes[edge.id].x-anchor[0], nodes[edge.id].y-anchor[1]) >= limit) continue;
          search(edge.id, distance + edge.metres, [...ids, edge.id]);
        }
      };
      search(nearest.id, 0, [nearest.id]);
      if (alternatives.length) {
        alternatives.sort((a,b) => a.distance-b.distance || a.ids.join(',').localeCompare(b.ids.join(',')));
        const selected = alternatives[Math.abs(variant) % alternatives.length];
        return selected.ids.map(id => ({x:nodes[id].x,y:nodes[id].y}));
      }
    }
    if (path.length === 1) {
      const neighbor = nodes[cursor].neighbours.find(e => e.metres > 0 && e.metres < limit);
      if (neighbor) path.push({ x: nodes[neighbor.id].x, y: nodes[neighbor.id].y });
    }
    return path;
  }
  function sample(path, metres) {
    if (!path.length) return null;
    if (path.length === 1) return { ...path[0], walking: false, direction: 1 };
    const segments = []; let total = 0;
    for (let i = 1; i < path.length; i++) {
      const len = Math.hypot(path[i].x - path[i-1].x, path[i].y - path[i-1].y);
      if (len > 0) { segments.push({ a: path[i-1], b: path[i], len });total += len; }
    }
    if (!total) return { ...path[0], walking: false, direction: 1 };
    // A calm pause at each end and a walk back along the very same road segments.
    const rest = 9, cycle = 2 * total + 2 * rest;
    const phase = ((metres % cycle) + cycle) % cycle;
    const outgoing = phase < total + rest;
    let position = outgoing ? Math.max(0, phase - rest) : Math.max(0, total - (phase - total - rest));
    const walking = phase > rest && phase < total + rest || phase > total + 2 * rest;
    for (const s of segments) {
      if (position <= s.len) {
        const t = position / s.len;
        return { x:s.a.x + (s.b.x-s.a.x)*t, y:s.a.y + (s.b.y-s.a.y)*t,
          walking, direction:(s.b.x >= s.a.x ? 1 : -1)*(outgoing?1:-1) };
      }
      position -= s.len;
    }
    return { ...path[path.length-1], walking:false, direction:1 };
  }
  return { itinerary, sample };
});

