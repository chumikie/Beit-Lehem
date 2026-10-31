
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
    // Shallow arch recesses and stucco edge light, inspired by the 2007 facade.
    // The illustration is historical in character; it does not assert current paint.
    for(const x of [-16,0,16]){
      c.fillStyle='#4c5d5630';c.fillRect(x-5.6,2,1.3,17);
      c.strokeStyle='#f8ecd6a6';c.lineWidth=.65;
      c.beginPath();c.moveTo(x+5,3);c.lineTo(x+5,19);c.stroke();
    }
    c.fillStyle='#fff4d154';c.fillRect(-23,-23,1.2,39);
    c.fillStyle='#5b655126';c.fillRect(22.1,-22,1.5,42);
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
    // Small light-and-shadow study on the existing illustrated terminal symbol.
    // Not a claim about the present-day facade or bus timetable.
    rounded(c, -29, -16, 58, 16, 2.5, '#77999b', '#547578');
    rounded(c, -27, -14.5, 54, 1.4, .7, '#e5eee17a');
    rounded(c, -27, -1.8, 54, 1.4, .7, '#405f6260');
    c.strokeStyle = '#e9f0dd'; c.lineWidth = 1.2;
    for (let i = -20; i < 24; i += 10) { c.beginPath(); c.moveTo(i, -15); c.lineTo(i, 0); c.stroke(); }
    rounded(c, -18, 3, 36, 13, 5, '#e3d4ae', '#9a9b85');
    for (let i = -13; i < 15; i += 8) rounded(c, i, 5, 6, 5, 1, '#789a9d');
    circle(c, -11, 16, 3.3, '#67746a'); circle(c, 11, 16, 3.3, '#67746a');
  }
  function drawHomeVarandaGround(c) {
    rounded(c, -34, -22, 68, 48, 6, '#d9ceb8', '#b5a489');
    rounded(c, -31, -19, 62, 42, 4, '#efe5cf', '#cbbba0');
    c.strokeStyle = '#c8b89d'; c.lineWidth = .7;
    for (let x = -28; x <= 28; x += 8) { c.beginPath(); c.moveTo(x, 12); c.lineTo(x, 22); c.stroke(); }
  }
  function drawHomeVarandaDetails(c, night = false, time = 0) {
    // Adjacent church wall reference at sem número residencial ("encostado à igreja")
    rounded(c, -31, -24, 18, 34, 2, '#f3ead8', '#9c9588');
    polygon(c, [[-32,-24],[-22,-34],[-12,-24]], '#a89f91', '#7d776c');
    c.strokeStyle = '#8b7d6b'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-22, -39); c.lineTo(-22, -33); c.moveTo(-25, -36); c.lineTo(-19, -36); c.stroke();
    rounded(c, -25, -14, 6, 12, 3, '#6e8884');
    // Main Casa da Varanda facade with terracotta roof & iconic silver garage door ("porta de garagem prateada")
    polygon(c, [[-14,-25],[30,-25],[33,-7],[-16,-7]], '#c67d63', '#985e49');
    rounded(c, -13, -8, 42, 24, 2, '#f7ebd4', '#a89882');
    // Metallic silver garage door
    rounded(c, -9, -4, 20, 19, 1.5, '#cfd6dc', '#7d8790');
    c.strokeStyle = '#9aa4ae'; c.lineWidth = .9;
    for (let y = -1; y <= 12; y += 3.2) { c.beginPath(); c.moveTo(-7.5, y); c.lineTo(9.5, y); c.stroke(); }
    c.strokeStyle = '#ffffffcc'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(-6, -2); c.lineTo(0, 12); c.stroke();
    // Fictional porch plaque and warm window
    rounded(c, 15, -2, 8, 17, 1.5, '#8c6d53', '#6b513c');
    rounded(c, 12, -7, 10, 4, 1, '#54736e');
    c.fillStyle = '#ffffff'; c.font = 'bold 4.5px system-ui'; c.textAlign = 'center'; c.fillText('⌂', 17, -4.5);
    // Sidewalk chairs ("cadeiras na calçada")
    for (const cx of [-20, -14]) {
      rounded(c, cx, 14, 4.2, 4.2, 1, '#d98a5f', '#8f5738');
    }
    // Pingo the dog wagging tail on the sidewalk
    const wag = Math.sin(time * 6) * 1.8;
    ellipse(c, 21, 19, 5.5, 2.1, '#3b4f3d33');
    rounded(c, 17, 13, 8.5, 5.5, 2.5, '#d49b6a', '#8c623e');
    circle(c, 16.5, 13.5, 3.2, '#d49b6a', '#8c623e');
    circle(c, 15.3, 13, .7, '#3b2f26');
    c.strokeStyle = '#c94a4a'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(18, 12); c.lineTo(18, 16); c.stroke();
    c.strokeStyle = '#b57e4f'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(25, 14); c.quadraticCurveTo(28, 11 + wag, 27, 9.5); c.stroke();
    if (night) circle(c, 18, -10, 8, '#ffe6a355');
  }
  function drawGymGround(c) {
    rounded(c, -40, -24, 80, 52, 7, '#cad2c5', '#9aa696');
    rounded(c, -36, -20, 72, 44, 5, '#e2e7dc', '#b8c2b2');
  }
  function drawGymDetails(c, night = false) {
    // Ginásio Poliesportivo O Xaviezão: iconic arched metallic roof & court colors
    rounded(c, -31, -12, 62, 28, 2, '#eef2ea', '#7f8c84');
    // Blue/teal court & warm arched roof
    c.fillStyle = '#5f8fa3'; c.fillRect(-28, -9, 26, 25);
    c.fillStyle = '#d9895b'; c.fillRect(0, -9, 28, 25);
    c.beginPath(); c.moveTo(-34, -10); c.quadraticCurveTo(0, -34, 34, -10); c.lineTo(34, -4); c.quadraticCurveTo(0, -26, -34, -4); c.closePath();
    c.fillStyle = '#b8c4cc'; c.fill(); c.strokeStyle = '#6c7c87'; c.lineWidth = 1.2; c.stroke();
    c.strokeStyle = '#e6eef2'; c.lineWidth = .9;
    for (let x = -24; x <= 24; x += 8) { c.beginPath(); c.moveTo(x, -9); c.lineTo(x, 15); c.stroke(); }
    rounded(c, -18, -19, 36, 7.5, 2.5, '#fff6df', '#6c7c87');
    c.fillStyle = '#3f5d6b'; c.font = 'bold 5.8px system-ui'; c.textAlign = 'center'; c.fillText('O XAVIEZÃO', 0, -14.8);
    // Mini court entrance & basketball/futsal ball
    rounded(c, -8, 4, 16, 12, 2, '#476778');
    circle(c, 18, 19, 3.2, '#e07a47', '#8c4320');
    if (night) { circle(c, -22, -16, 9, '#fff1b855'); circle(c, 22, -16, 9, '#fff1b855'); }
  }
  function drawBarGround(c) {
    rounded(c, -34, -20, 68, 46, 6, '#d9c6ab', '#ab9679');
    rounded(c, -31, -17, 62, 40, 4, '#f0e1c8', '#cbb694');
  }
  function drawBarDetails(c, night = false, time = 0) {
    // Bar da Prosa: warm terracotta/brick facade, string lights, yellow sidewalk tables, skewer grill & karaoke
    polygon(c, [[-26,-24],[26,-24],[30,-8],[-30,-8]], '#b8694e', '#874833');
    rounded(c, -25, -8, 50, 22, 2, '#f5e2c4', '#9e8468');
    rounded(c, -20, -4, 18, 16, 2, night ? '#ffd984' : '#6c5344', '#876950');
    rounded(c, 3, -3, 17, 13, 2, '#7d5a46', '#593e2f');
    rounded(c, -21, -22, 42, 7.5, 2.5, '#fff3d1', '#94583e');
    c.fillStyle = '#87442b'; c.font = 'bold 5.7px system-ui'; c.textAlign = 'center'; c.fillText("BAR DA PROSA", 0, -17.8);
    // Yellow sidewalk tables & chairs
    for (const tx of [-17, 0, 17]) {
      rounded(c, tx - 4.5, 15, 9, 6, 1.5, '#f2c94c', '#b88f1a');
      circle(c, tx - 6, 18, 1.8, '#e0b034'); circle(c, tx + 6, 18, 1.8, '#e0b034');
    }
    // Skewer grill ("espetinhos") with gentle smoke
    rounded(c, -28, 8, 7, 6, 1, '#5c534c', '#3d3630');
    circle(c, -24.5, 6 - Math.sin(time * 3) * 1.2, 2.1, '#ffffff88');
    // String lights
    c.strokeStyle = '#7a6248'; c.lineWidth = .7; c.beginPath(); c.moveTo(-26, -7); c.quadraticCurveTo(0, -3, 26, -7); c.stroke();
    for (let lx = -22; lx <= 22; lx += 7) {
      circle(c, lx, -5.5, 1.5, night ? '#ffe37a' : '#f7d774');
    }
  }
  function drawBakeryGround(c) {
    rounded(c, -32, -20, 64, 44, 6, '#e3d2be', '#b8a188');
    rounded(c, -29, -17, 58, 38, 4, '#f8ede0', '#d4be9f');
  }
  function drawBakeryDetails(c, night = false) {
    // Confeitaria Sonho Doce: striped awning, cake display window
    polygon(c, [[-25,-23],[25,-23],[28,-8],[-28,-8]], '#c97a63', '#965441');
    rounded(c, -24, -8, 48, 22, 2, '#fff5e8', '#b59982');
    // Striped candy awning
    for (let x = -22; x < 22; x += 6) {
      rounded(c, x, -9, 6, 5, 1, (Math.floor((x+22)/6)%2===0) ? '#d66f5c' : '#fff6ea');
    }
    // Glass cake display
    rounded(c, -19, -2, 24, 13, 2, night ? '#fff0c2' : '#d8ecea', '#9c826c');
    circle(c, -13, 5, 2.6, '#e8998d'); circle(c, -7, 5, 2.6, '#f2c97d'); circle(c, -1, 5, 2.6, '#9ec492');
    rounded(c, 9, -1, 10, 15, 1.5, '#9e6f56');
    rounded(c, -20, -21, 40, 7, 2.5, '#fff7eb', '#a86451');
    c.fillStyle = '#964935'; c.font = 'bold 5.7px system-ui'; c.textAlign = 'center'; c.fillText('SONHO DOCE', 0, -17);
  }
  function drawSchoolGround(c) {
    rounded(c, -36, -21, 72, 46, 6, '#cfd9cc', '#9ead9b');
    rounded(c, -33, -18, 66, 40, 4, '#e9f0e6', '#b9c7b5');
  }
  function drawSchoolDetails(c) {
    // EMEF Anita de Melo Barbosa Lima
    polygon(c, [[-28,-22],[28,-22],[31,-7],[-31,-7]], '#bf8365', '#8f5d44');
    rounded(c, -27, -7, 54, 21, 2, '#f5f7f2', '#81968f');
    c.fillStyle = '#4e7d96'; c.fillRect(-27, 8, 54, 5);
    for (const wx of [-19, -9, 9, 19]) rounded(c, wx - 3.5, -2, 7, 7, 1, '#8ab4c7', '#5a7f91');
    rounded(c, -4, -1, 8, 15, 1.5, '#4e7d96');
    rounded(c, -22, -20, 44, 7, 2, '#ffffff', '#4e7d96');
    c.fillStyle = '#386278'; c.font = 'bold 5.3px system-ui'; c.textAlign = 'center'; c.fillText('EMEF ANITA BARBOSA', 0, -16.2);
  }
  function drawHallGround(c) {
    rounded(c, -34, -20, 68, 44, 6, '#d5d8cf', '#a2a89b');
    rounded(c, -30, -17, 60, 38, 4, '#ecefe8', '#bec4b7');
  }
  function drawHallDetails(c) {
    // Prefeitura Municipal (R. Flávio Ribeiro, 74)
    rounded(c, -26, -16, 52, 28, 2.5, '#f2f5f0', '#7c8c82');
    c.fillStyle = '#4b7363'; c.fillRect(-26, -16, 52, 5);
    for (const wx of [-18, -9, 9, 18]) rounded(c, wx - 3, -7, 6, 10, 1, '#7ea396');
    rounded(c, -4, -4, 8, 16, 1.5, '#4b7363');
    // Three municipal/state/national flagpoles
    for (const [fx, col] of [[-6, '#3a8c5a'], [0, '#d9a441'], [6, '#c94a4a']]) {
      c.strokeStyle = '#68736c'; c.lineWidth = .9; c.beginPath(); c.moveTo(fx, -26); c.lineTo(fx, -16); c.stroke();
      c.fillStyle = col; c.fillRect(fx, -26, 4.5, 3);
    }
    rounded(c, -20, -14, 40, 6, 1.5, '#fffdf7', '#4b7363');
    c.fillStyle = '#38594b'; c.font = 'bold 5.2px system-ui'; c.textAlign = 'center'; c.fillText('PREFEITURA · 74', 0, -10.8);
  }
  function drawChapelGround(c) {
    ellipse(c, 0, 6, 28, 16, '#415d4a24');
    rounded(c, -26, -24, 52, 50, 6, '#e3dac3', '#c2b393');
  }
  function drawChapelDetails(c) {
    // Capela Nossa Senhora da Luz (R. Mário Barbosa)
    polygon(c, [[-20,-20],[20,-20],[23,2],[-23,2]], '#c98769', '#966147');
    rounded(c, -18, -19, 36, 35, 2, '#faf2e1', '#9e927d');
    polygon(c, [[-12,-19],[0,-36],[12,-19]], '#faf2e1', '#9e927d');
    c.strokeStyle = '#8c7756'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(0, -43); c.lineTo(0, -35); c.moveTo(-3.5, -40); c.lineTo(3.5, -40); c.stroke();
    circle(c, 0, -25, 3.2, '#d9b26f', '#8c7756');
    rounded(c, -5, 1, 10, 15, 4.5, '#688782', '#9e8b6b');
    // Festive bunting for Bloco da Paz Risca Faca / Padroeira
    c.strokeStyle = '#d49b6a'; c.lineWidth = .8;
    c.beginPath(); c.moveTo(-22, -12); c.quadraticCurveTo(0, -6, 22, -12); c.stroke();
  }
  function drawAmusementGround(c) {
    rounded(c, -38, -24, 76, 50, 8, '#e3d3b8', '#b89f7a');
    rounded(c, -34, -20, 68, 42, 6, '#f6ebd6', '#d1bc99');
  }
  function drawAmusementDetails(c, night = false, time = 0) {
    // Parque Artesanal São Luís: colorful recycled-art Ferris wheel & carousel
    if (night) circle(c, -10, -24, 24, '#ffe69944');
    // A-frame support legs for the Ferris wheel
    c.strokeStyle = '#6c7c87'; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(-22, 16); c.lineTo(-10, -22); c.lineTo(2, 16); c.stroke();
    // Rotating wheel rim & spokes
    const wheelR = 17, cx = -10, cy = -22;
    c.beginPath(); c.arc(cx, cy, wheelR, 0, TAU); c.strokeStyle = '#d66f5c'; c.lineWidth = 1.8; c.stroke();
    c.beginPath(); c.arc(cx, cy, wheelR * .58, 0, TAU); c.strokeStyle = '#5f8fa3'; c.lineWidth = 1.1; c.stroke();
    const cabinCols = ['#f2c94c', '#e07a5f', '#6fa072', '#5f8fa3', '#b983b8', '#f2994a'];
    for (let i = 0; i < 6; i++) {
      const ang = time * .95 + i * TAU / 6;
      const gx = cx + Math.cos(ang) * wheelR, gy = cy + Math.sin(ang) * wheelR;
      c.strokeStyle = '#8fa399'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(gx, gy); c.stroke();
      // Upright hanging cabin
      rounded(c, gx - 3.2, gy - 1, 6.4, 5.2, 1.5, cabinCols[i], '#fff8e8');
    }
    circle(c, cx, cy, 3.2, '#f2c94c', '#8c5e32');
    // Mini recycled carousel on the right
    ellipse(c, 19, 13, 12, 5, '#c9b493');
    polygon(c, [[7, 2], [19, -9], [31, 2]], '#5f8fa3', '#fff5dc');
    for (const hx of [12, 19, 26]) {
      c.strokeStyle = '#8c6d53'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(hx, 2); c.lineTo(hx, 12); c.stroke();
      circle(c, hx, 8 + Math.sin(time * 3 + hx) * 1.3, 2.2, '#e8998d');
    }
    rounded(c, -26, 17, 52, 7, 2.5, '#fff7e6', '#b87d56');
    c.fillStyle = '#874c2b'; c.font = 'bold 5.2px system-ui'; c.textAlign = 'center'; c.fillText('PARQUE SÃO LUÍS 🎡', 0, 20.8);
  }
  function drawRockviewGround(c) {
    ellipse(c, 0, 6, 36, 22, '#bca88255');
    ellipse(c, -4, 4, 29, 17, '#d9c8a5');
  }
  function drawRockviewDetails(c, night = false) {
    // Mirante da Pedra do Cordeiro: granite outcrop, summit cross & mandacarus
    polygon(c, [[-28, 12], [-18, -14], [-2, -22], [18, -12], [26, 12]], '#9e9789', '#6e685c');
    polygon(c, [[-18, 12], [-9, -12], [6, -18], [19, 12]], '#b5ae9e');
    // Summit Cross (Cruzeiro)
    c.strokeStyle = '#5c4938'; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(-2, -21); c.lineTo(-2, -37); c.moveTo(-7, -32); c.lineTo(3, -32); c.stroke();
    if (night) circle(c, -2, -31, 10, '#fff2b244');
    // Mandacarus & Xique-xiques
    for (const [mx, my] of [[-24, 8], [22, 7]]) {
      c.strokeStyle = '#4e7d52'; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(mx, my); c.lineTo(mx, my - 13);
      c.moveTo(mx, my - 6); c.lineTo(mx - 4, my - 8); c.lineTo(mx - 4, my - 12);
      c.moveTo(mx, my - 8); c.lineTo(mx + 4, my - 10); c.lineTo(mx + 4, my - 13); c.stroke();
      circle(c, mx, my - 14, 1.3, '#f7d9e3');
    }
    rounded(c, -24, 15, 48, 7, 2.5, '#fff8e8', '#7d7362');
    c.fillStyle = '#574e3f'; c.font = 'bold 5.2px system-ui'; c.textAlign = 'center'; c.fillText('PEDRA DO CORDEIRO ⛰', 0, 18.8);
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
      if (landmark.kind === 'homeVaranda') drawHomeVarandaGround(c);
      if (landmark.kind === 'gym') drawGymGround(c);
      if (landmark.kind === 'bar') drawBarGround(c);
      if (landmark.kind === 'bakery') drawBakeryGround(c);
      if (landmark.kind === 'school') drawSchoolGround(c);
      if (landmark.kind === 'hall') drawHallGround(c);
      if (landmark.kind === 'chapel') drawChapelGround(c);
      if (landmark.kind === 'amusement') drawAmusementGround(c);
      if (landmark.kind === 'rockview') drawRockviewGround(c);
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
      if (landmark.kind === 'homeVaranda') drawHomeVarandaDetails(c, night, time);
      if (landmark.kind === 'gym') drawGymDetails(c, night);
      if (landmark.kind === 'bar') drawBarDetails(c, night, time);
      if (landmark.kind === 'bakery') drawBakeryDetails(c, night);
      if (landmark.kind === 'school') drawSchoolDetails(c);
      if (landmark.kind === 'hall') drawHallDetails(c);
      if (landmark.kind === 'chapel') drawChapelDetails(c);
      if (landmark.kind === 'amusement') drawAmusementDetails(c, night, time);
      if (landmark.kind === 'rockview') drawRockviewDetails(c, night);
      label(c, landmark);
      c.restore();
    }
  }

  function drawMarkers(c, landmarks, viewport, zoom) {
    for (const landmark of landmarks || []) {
      if (landmark.positionStatus !== 'osm_point' || !visible(landmark, viewport, 20)) continue;
      c.save(); c.translate(...landmark.p);
      circle(c, 0, 0, 8, '#fff8e9', '#66836b');
      const markerColors = {church:'#aa8678',market:'#b49b65',terminal:'#799898',homeVaranda:'#5f8775',gym:'#52788f',bar:'#b8694e',bakery:'#c97a63',school:'#4e7d96',hall:'#5a7a68',chapel:'#9c7e54',amusement:'#d66f5c',rockview:'#7d7362'};
      const markerGlyphs = {church:'✝',market:'F',terminal:'R',homeVaranda:'⌂',gym:'🏀',bar:'🎤',bakery:'🍰',school:'E',hall:'P',chapel:'✞',amusement:'🎡',rockview:'⛰'};
      circle(c, 0, 0, 5.8, markerColors[landmark.kind] || '#799898');
      c.font = 'bold 7.5px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#ffffff';
      c.fillText(markerGlyphs[landmark.kind] || '✦', 0, .4);
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
    const postcardNames = {church:'Igreja de Belém',market:'Mercado Público de Belém',square:'Praça 6 de Setembro*',terminal:'Estação Rodoviária',homeVaranda:'Casa da Varanda · R. Clóvis Bezerra',gym:'Ginásio O Xaviezão',bar:"Bar da Prosa · R. Vicente Cado",bakery:'Sonho Doce · R. Feliciano Pedrosa',school:'EMEF Anita Barbosa',hall:'Prefeitura de Belém',chapel:'Capela N. Sra. da Luz',amusement:'Parque Artesanal São Luís',rockview:'Mirante Pedra do Cordeiro'};
    const landmark = {kind, name: postcardNames[kind] || 'Belém/PB', p:[0,0]};
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

