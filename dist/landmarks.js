/* Belém Viva: small OSM reference markers and separate hand-drawn postcards.
 * No facade or approximate public square is painted as a geographic footprint.
 */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const palette = {
    stone: '#f0e9ce', grout: '#d8caaa', shadow: '#354f3e33',
    cream: '#fff0cc', terracotta: '#bb795c', moss: '#6a8b63',
    paleBlue: '#a9cdd0', navy: '#517279', gold: '#d1ad66',
  };

  function rounded(c, x, y, width, height, radius, fill, stroke) {
    c.beginPath(); c.roundRect(x, y, width, height, radius);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
  }
  function polygon(c, points, fill, stroke) {
    c.beginPath();
    for (let i = 0; i < points.length; i++) {
      if (i) c.lineTo(points[i][0], points[i][1]);
      else c.moveTo(points[i][0], points[i][1]);
    }
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
  }
  function ellipse(c, x, y, rx, ry, fill) {
    c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
  }
  function circle(c, x, y, radius, fill, stroke) {
    c.beginPath(); c.arc(x, y, radius, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = .7; c.stroke(); }
  }
  function visible(landmark, viewport, padding = 80) {
    if (!viewport) return true;
    const [x, y] = landmark.p;
    return x > viewport.left - padding && x < viewport.right + padding &&
      y > viewport.top - padding && y < viewport.bottom + padding;
  }

  function garden(c, x, y, width, height) {
    rounded(c, x, y, width, height, 5, '#f5ead6', '#d2c4a5');
    rounded(c, x + 2.3, y + 2.3, width - 4.6, height - 4.6, 3, '#82a775');
    for (let dx = 5; dx < width - 3; dx += 7) {
      circle(c, x + dx, y + height / 2, 3.1, dx % 2 ? '#98bc79' : '#6f9c70');
      circle(c, x + dx + 1.4, y + height / 2 - 1.6, 1.1, '#e8d6a6');
    }
  }
  function lamp(c, x, y) {
    ellipse(c, x + 1, y + 3, 4, 2, '#51634b36');
    c.fillStyle = '#667768'; c.fillRect(x - .6, y - 12, 1.2, 15);
    circle(c, x, y - 12, 3.8, '#fff3c2', '#ab9269');
    circle(c, x - 1, y - 13, 1.6, '#ffffffbb');
  }
  function drawSquareGround(c) {
    // Modern paving + raised greenery: conceptual postcard informed by the 2023 reform.
    rounded(c, -46, -30, 92, 63, 8, '#c8b99c', '#a59880');
    rounded(c, -42, -27, 84, 56, 6, '#e6decd', '#c9baa2');
    c.lineWidth = .75;
    for (let x = -39; x < 42; x += 10) {
      for (let y = -23; y < 28; y += 9) {
        c.strokeStyle = '#c5b9a5aa'; c.strokeRect(x + ((y + 23) % 2 ? 2.5 : 0), y, 9, 8);
      }
    }
    rounded(c, -42, -1.5, 84, 3, 1, '#c79578');
    // Interlocking pavement gets a clearer stone/terracotta rhythm.
    c.strokeStyle='#f8efdf8d';c.lineWidth=.65;
    for(let x=-35;x<39;x+=16){c.beginPath();c.moveTo(x,-27);c.lineTo(x-4,29);c.stroke();}
    rounded(c,-42,-29,84,2,1,'#f2dfbb');
    garden(c, -37, -22, 22, 12); garden(c, 15, -22, 22, 12);
    garden(c, -37, 15, 17, 9); garden(c, 20, 15, 17, 9);
  }
  function drawSquareDetails(c, night = false, time = 0) {
    // Cascata iluminada, anfiteatro e jardins suspensos documentados em 2023.
    if (night) { ellipse(c, 0, 2, 25, 17, '#fee7a646'); ellipse(c, 0, 2, 15, 11, '#ddfaf288'); }
    ellipse(c, 0, 2, 14, 11, '#8cb7a766');
    rounded(c, -12, -9, 24, 19, 7, '#f9f1dc', '#a3bdb3');
    rounded(c, -9, -6, 18, 13, 5, '#83bfc4', '#5d999e');
    rounded(c, -6, -10, 12, 3, 1, '#f0e8dc', '#b8c8bf');
    c.strokeStyle = night ? '#e9fff7' : '#d3f6ee'; c.lineWidth = 1.7;
    for (let x = -5; x <= 5; x += 5) { c.beginPath(); c.moveTo(x, -6); c.quadraticCurveTo(x + 2, -1, x - 1, 6); c.stroke(); }
    // Fine cascade sparkles remain in the postcard, but drift softly in the live map.
    for(let i=0;i<5;i++){
      const x=-7+i*3.4,y=1+Math.sin(time*1.2+i)*1.2;
      circle(c,x,y,.65,night?'#fff8d9':'#f9fff5');
    }
    // Terraced amphitheatre represented as a small open, curved gathering place.
    for (let i = 0; i < 3; i++) {
      c.beginPath(); c.strokeStyle = i === 0 ? '#b98770' : '#f8edd6'; c.lineWidth = 2;
      c.arc(0, 22, 12 + i * 4, Math.PI * 1.12, Math.PI * 1.88); c.stroke();
    }
    rounded(c, -9, 16, 18, 4, 2, '#ceaa8d');
    // Raised planters, not a claim about exact locations or dimensions.
    for (const x of [-31, 31]) {
      rounded(c, x - 6.5, -3, 13, 5, 1.5, '#b6aa8e', '#f5efdf');
      for (const i of [-3, 0, 3]) circle(c, x + i, -5, 2.8, i ? '#6e9c76' : '#a0ba7c');
      rounded(c, x - 6, 8, 12, 3.8, 1.2, '#a47f62');
      for(let i=-3;i<=3;i+=3){c.strokeStyle='#5f9271';c.lineWidth=1;c.beginPath();c.moveTo(x+i,-3);c.quadraticCurveTo(x+i+2,2,x+i+1,5);c.stroke();circle(c,x+i+1,5,1.1,'#ecd8b7');}
    }
    // Terraced seating and gentle pictorial shadow; not surveyed coordinates.
    rounded(c,-28,29,56,3,1.5,'#96775a32');
    for (const [x, y] of [[-39, -25], [39, -25], [-39, 24], [39, 24]]) {
      if (night) circle(c, x, y - 12, 7.6, '#ffe4a34d');
      lamp(c, x, y);
    }
  }
  function drawChurchGround(c) {
    ellipse(c, 0, 8, 30, 18, '#415d4a2a');
    rounded(c, -27, -28, 54, 58, 6, '#ded4ba', '#beae8d');
    c.strokeStyle = '#fef4de'; c.lineWidth = 1;
    for (let y = 16; y <= 27; y += 5) { c.beginPath(); c.moveTo(-15, y); c.lineTo(15, y); c.stroke(); }
  }
  function drawChurchDetails(c) {
    // O corpo central, três arcos e torre são inspirados na foto histórica de 2007.
    polygon(c, [[-24,-25],[23,-25],[28,3],[-27,3]], '#d5c7ad', '#b0a58e');
    rounded(c, -24, -24, 48, 45, 2, '#f2e4c7', '#7a8175');
    polygon(c, [[-29,-24],[0,-39],[29,-24]], '#a3a596', '#71827b');
    for (let x of [-16, 0, 16]) {
      rounded(c, x - 5.7, 0, 11.4, 20, 5, '#c5ae87', '#998668');
      rounded(c, x - 3.5, 4, 7, 16, 3.5, '#5b7670');
      c.strokeStyle = '#d4c9ab'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(x, 6); c.lineTo(x, 19); c.stroke();
    }
    for (let x of [-18, 18]) {
      rounded(c, x - 3, -19, 6, 9, 3, '#7b9590', '#bca47c');
      circle(c, x, -19, .8, '#e9d79d');
    }
    rounded(c, -11, -53, 22, 40, 2, '#e8d7ba', '#7e8b7e');
    polygon(c, [[-13,-53],[0,-68],[13,-53]], '#8b998f', '#5e726d');
    rounded(c, -5.5, -45, 11, 17, 5.5, '#4d7779', '#ad9d80');
    circle(c, 0, -49, 3.3, '#fff7d3', '#b9a277');
    c.strokeStyle = '#aa9a77'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(0, -75); c.lineTo(0, -67); c.moveTo(-4, -72); c.lineTo(4, -72); c.stroke();
    for (let x of [-24, 24]) { circle(c, x, -26, 2.7, '#e4d0a7'); }
    // Architectural cues visible in the dated 2007 archival image:
    // dark vertical pilasters, three fanlight arches, corner finials and clock.
    c.strokeStyle='#6e7770';c.lineWidth=1.6;
    for(const x of [-23,-8,8,23]){c.beginPath();c.moveTo(x,-19);c.lineTo(x,22);c.stroke();}
    c.strokeStyle='#b7a789';c.lineWidth=.8;
    for(const x of [-16,0,16]){c.beginPath();c.arc(x,8,3.5,Math.PI,Math.PI*2);c.stroke();}
    rounded(c,-27,-2,54,2,0,'#899083');rounded(c,-27,21,54,2,0,'#8a9181');
    polygon(c,[[-25,-25],[-18,-31],[-11,-25]],'#d6cbb3','#819084');
    polygon(c,[[11,-25],[18,-31],[25,-25]],'#d6cbb3','#819084');
    for(const x of [-26,26]){rounded(c,x-1.5,-33,3,10,1,'#9b9f91');polygon(c,[[x-3,-33],[x,-38],[x+3,-33]],'#87938c');}
    // A little balustrade beneath the central tower makes its silhouette distinctive.
    rounded(c,-11,-13,22,2,0,'#878e82');
    for(let x=-9;x<10;x+=3){rounded(c,x,-16,1.3,3,0,'#d1c6b0');}
    circle(c,0,-49,1.4,'#ae8e5f');
  }
  function drawMarketGround(c) {
    rounded(c, -35, -21, 70, 48, 5, '#d6c6a5', '#aa9c84');
    rounded(c, -32, -18, 64, 41, 3, '#eee2c5', '#c2ad8b');
    for (let y = -13; y < 21; y += 8) {
      c.strokeStyle = '#d9c4a1'; c.lineWidth = .7; c.beginPath(); c.moveTo(-30, y); c.lineTo(30, y); c.stroke();
    }
  }
  function stall(c, x, y, color, produce = '#dea06e') {
    ellipse(c, x + 1.5, y + 4, 9, 3.5, '#344a3426');
    rounded(c, x - 7, y - 3, 14, 10, 1.4, '#c3a582', '#8d816e');
    c.fillStyle = '#a88f67'; c.fillRect(x - 6, y + 4, 12, 1.2);
    for (let i = 0; i < 4; i++) circle(c, x - 4.5 + i * 3, y + 2, 1.5, i % 2 ? '#9aad6b' : produce);
    polygon(c, [[x-9,y-5],[x+9,y-5],[x+7,y-13],[x-7,y-13]], color, '#fff4d0');
    c.strokeStyle = '#fff3c6'; c.lineWidth = 1.4;
    for (let i = -6; i <= 6; i += 6) { c.beginPath(); c.moveTo(x+i,y-12); c.lineTo(x+i,y-5); c.stroke(); }
  }
  function drawMarketDetails(c, marketDay) {
    polygon(c, [[-25,-29],[18,-29],[30,-7],[-32,-7]], '#ba8062', '#96684e');
    rounded(c, -25, -7, 50, 24, 1.5, '#f2dfbc', '#9d9780');
    rounded(c, -18, -5, 36, 11, 2, '#73948b', '#54716f');
    for (let i = -21; i <= 21; i += 8) rounded(c, i-3, 10, 6, 7, 1, '#d8b88e', '#b58e68');
    rounded(c, -18, -30, 36, 8, 3, '#fff4db', '#927358');
    c.fillStyle = '#8a6c4d'; c.font = 'bold 7px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MERCADO', 0, -26);
    stall(c, -24, 19, '#d18e75', '#e6bd76');
    stall(c, 22, 19, '#86a5a1', '#b9c77a');
    if (marketDay) {
      stall(c, -39, 5, '#c47f65', '#c8a46c');
      stall(c, 38, -3, '#e3b46f', '#d5ac81');
      stall(c, -36, -22, '#829e84', '#e1b76c');
      for (let i = 0; i < 7; i++) {
        const x = -27 + i * 8.5, y = 34 + (i % 2) * 3;
        circle(c, x, y, 2.8, ['#a67764','#dbb3a1','#84a189'][i % 3]);
        circle(c, x, y - 3.8, 1.7, '#ebc7a4');
      }
      // Stacked woven baskets, pans and folded fabrics recall the 2007 fair photograph.
      // These objects are illustrative; no merchant or current stall is identified.
      for(const [x,y] of [[-28,30],[28,28],[-11,36]]){
        ellipse(c,x,y,6,2.3,'#ad8962');
        c.strokeStyle='#e7ce97';c.lineWidth=1.1;
        c.beginPath();c.arc(x,y-2,5,Math.PI,Math.PI*2);c.stroke();
        c.strokeStyle='#c4aa79';c.beginPath();c.moveTo(x-4,y-.8);c.lineTo(x+4,y-.8);c.moveTo(x-3,y+1);c.lineTo(x+3,y+1);c.stroke();
      }
      ellipse(c,14,34,5.5,2.8,'#879795');ellipse(c,14,32,4.8,1.5,'#d9dfd4');
      circle(c,14,32,.9,'#abb2a5');
    }
  }
  function drawTerminalGround(c) {
    rounded(c, -33, -16, 66, 39, 5, '#d6d4bc', '#a1a690');
    rounded(c, -28, -11, 56, 23, 2, '#c9cfc0');
  }
  function drawTerminalDetails(c) {
    rounded(c, -29, -16, 58, 16, 2.5, '#77999b', '#547578');
    c.strokeStyle = '#e9f0dd'; c.lineWidth = 1.2;
    for (let i = -20; i < 24; i += 10) { c.beginPath(); c.moveTo(i, -15); c.lineTo(i, 0); c.stroke(); }
    rounded(c, -18, 3, 36, 13, 5, '#e3d4ae', '#9a9b85');
    for (let i = -13; i < 15; i += 8) rounded(c, i, 5, 6, 5, 1, '#789a9d');
    circle(c, -11, 16, 3.3, '#67746a'); circle(c, 11, 16, 3.3, '#67746a');
  }
  function label(c, landmark) {
    const title = landmark.kind === 'square' ? 'Praça 6 de Setembro*' : landmark.name;
    const y = landmark.kind === 'church' ? 33 : landmark.kind === 'square' ? 43 : 36;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 8px system-ui';
    c.lineWidth = 3; c.strokeStyle = '#fff9df'; c.strokeText(title, 0, y);
    c.fillStyle = '#476b55'; c.fillText(title, 0, y);
  }

  function drawGround(c, landmarks, viewport) {
    for (const landmark of landmarks || []) {
      if (!visible(landmark, viewport)) continue;
      c.save(); c.translate(landmark.p[0], landmark.p[1]);
      if (landmark.kind === 'square') drawSquareGround(c);
      if (landmark.kind === 'church') drawChurchGround(c);
      if (landmark.kind === 'market') drawMarketGround(c);
      if (landmark.kind === 'terminal') drawTerminalGround(c);
      c.restore();
    }
  }
  function drawDetails(c, landmarks, viewport, marketDay, time = 0, night = false) {
    for (const landmark of landmarks || []) {
      if (!visible(landmark, viewport)) continue;
      c.save(); c.translate(landmark.p[0], landmark.p[1]);
      if (landmark.kind === 'square') drawSquareDetails(c, night, time);
      if (landmark.kind === 'church') drawChurchDetails(c);
      if (landmark.kind === 'market') drawMarketDetails(c, marketDay);
      if (landmark.kind === 'terminal') drawTerminalDetails(c);
      label(c, landmark);
      c.restore();
    }
  }

  function drawMarkers(c, landmarks, viewport, zoom) {
    for (const landmark of landmarks || []) {
      if (landmark.positionStatus !== 'osm_point' || !visible(landmark, viewport, 20)) continue;
      c.save(); c.translate(...landmark.p);
      circle(c, 0, 0, 8, '#fff8e9', '#66836b');
      circle(c, 0, 0, 5.6, landmark.kind === 'church' ? '#aa8678' : landmark.kind === 'market' ? '#b49b65' : '#799898');
      c.font = 'bold 8px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#ffffff';
      c.fillText(landmark.kind === 'church' ? '✝' : landmark.kind === 'market' ? 'F' : 'R', 0, .4);
      // Mission pins already identify nearby stops. Omitting map text prevents
      // labels from overlapping pins and streets; the interaction displays names.
      c.restore();
    }
  }

  function drawPostcard(canvas, kind, marketDay = false) {
    const c = canvas.getContext('2d');
    const {width, height} = canvas;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, width, height);
    const sky = c.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#dcead9'); sky.addColorStop(.7, '#f5ead2'); sky.addColorStop(1, '#d0ddbb');
    c.fillStyle = sky; c.fillRect(0, 0, width, height);
    ellipse(c, width * .17, height * .95, width * .55, height * .24, '#9dbb8f88');
    ellipse(c, width * .85, height * 1.02, width * .54, height * .31, '#89ab8390');
    for (let i = 0; i < 12; i++) {
      const x = (i * 67 + 31) % width;
      circle(c, x, height - 13 - (i % 3) * 9, 2.2, i % 2 ? '#f2ca9d' : '#f0dea9');
    }
    const landmark = {kind, name:kind === 'church' ? 'Igreja de Belém' :kind === 'market' ? 'Mercado Público de Belém':kind === 'square' ? 'Praça 6 de Setembro*':'Estação Rodoviária',p:[0,0]};
    const composition = kind === 'church' ? {scale:1.95, base:.73} :
      kind === 'market' ? {scale:2.3, base:.61} :
      kind === 'square' ? {scale:2.35, base:.56} : {scale:2.25, base:.63};
    c.save(); c.translate(width / 2, height * composition.base); c.scale(composition.scale, composition.scale);
    drawGround(c, [landmark]); drawDetails(c, [landmark], null, marketDay);
    c.restore();
  }

  const API = {drawGround, drawDetails, drawMarkers, drawPostcard};
  if (typeof root !== 'undefined') root.RoncadorLandmarks = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : undefined);
