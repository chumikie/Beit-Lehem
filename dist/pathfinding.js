/* Road-network routing for the illustrated Roncador game. Coordinates are local metres. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RoncadorPathfinding = api;
})(typeof globalThis !== 'undefined' ? globalThis : null, function () {
  'use strict';
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  function buildGraph(roads) {
    const nodes = [];
    const byPosition = new Map();
    let edgeCount = 0;
    for (const road of roads) {
      let previous = null;
      for (const point of road.p) {
        // The source OSM ways share intersection vertices. A one-metre cell
        // absorbs the small rounding differences in the local projection.
        const key = `${Math.round(point[0])},${Math.round(point[1])}`;
        let current = byPosition.get(key);
        if (current === undefined) {
          current = nodes.length;
          byPosition.set(key, current);
          nodes.push({ x: point[0], y: point[1], neighbours: [] });
        }
        if (previous !== null && previous !== current) {
          const a = nodes[previous], b = nodes[current];
          const metres = Math.hypot(a.x - b.x, a.y - b.y);
          if (metres > 0) {
            a.neighbours.push({ id: current, metres });
            b.neighbours.push({ id: previous, metres });
            edgeCount++;
          }
        }
        previous = current;
      }
    }

    function nearest(point) {
      let best = -1, closest = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        const candidate = nodes[i];
        const d = Math.hypot(candidate.x - point[0], candidate.y - point[1]);
        if (d < closest) { closest = d; best = i; }
      }
      return { id: best, distance: closest };
    }

    function route(start, destination) {
      if (!nodes.length) return null;
      const first = nearest(start), last = nearest(destination);
      if (first.id < 0 || last.id < 0) return null;
      const costs = new Float64Array(nodes.length).fill(Infinity);
      const previous = new Int32Array(nodes.length).fill(-1);
      const visited = new Uint8Array(nodes.length);
      const queue = [{ id: first.id, score: distance(start, destination) }];
      costs[first.id] = 0;
      while (queue.length) {
        queue.sort((a, b) => a.score - b.score);
        const current = queue.shift().id;
        if (visited[current]) continue;
        if (current === last.id) break;
        visited[current] = 1;
        for (const edge of nodes[current].neighbours) {
          const candidate = costs[current] + edge.metres;
          if (candidate >= costs[edge.id]) continue;
          costs[edge.id] = candidate;
          previous[edge.id] = current;
          const n = nodes[edge.id];
          queue.push({ id: edge.id, score: candidate + Math.hypot(n.x - nodes[last.id].x, n.y - nodes[last.id].y) });
        }
      }
      if (!Number.isFinite(costs[last.id])) return null;
      const indices = [];
      for (let node = last.id; node !== -1; node = previous[node]) indices.push(node);
      indices.reverse();
      const points = indices.map(i => ({ x: nodes[i].x, y: nodes[i].y }));
      points.push({ x: destination[0], y: destination[1] });
      return {
        points,
        roadMetres: costs[last.id],
        distance: costs[last.id] + first.distance + last.distance,
        fromRoadMetres: first.distance,
        toRoadMetres: last.distance,
      };
    }

    return { nodes, edgeCount, nearest, route };
  }
  return { buildGraph };
});
