/* V2.9 — Feira ilustrativa: barracas pequenas ligadas à geometria OSM.
 * A rua é real; o posicionamento de cada banca é uma interpretação artística.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RoncadorFairStreets = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const STREET_NAMES = /(?:joão pessoa|luiz gomes|luís gomes|floranea|florânea|brasiliano da costa)/i;
  const close = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  function layout(map, scenes = [], houses = []) {
    const market = map.landmarks.find(p => p.id === 'mercado');
    if (!market) return [];
    const positions = [];
    for (const road of map.roads) {
      if (!STREET_NAMES.test(road.tags.name || '')) continue;
      for (let i = 1; i < road.p.length; i++) {
        const a = road.p[i - 1], b = road.p[i], dx = b[0] - a[0], dy = b[1] - a[1];
        const length = Math.hypot(dx, dy);
        if (length < 24) continue;
        for (let along = 18; along < length - 8; along += 37) {
          const t = along / length, side = (positions.length % 2 ? 1 : -1);
          const onRoad = [a[0] + dx * t, a[1] + dy * t];
          if (close(onRoad, market.p) > 140 || close(onRoad, market.p) < 23) continue;
          const point = [onRoad[0] - dy / length * 14 * side, onRoad[1] + dx / length * 14 * side];
          if (houses.some(h => Math.hypot(h.x - point[0], h.y - point[1]) < 17)) continue;
          if (scenes.some(s => Math.abs(s.at[0] - point[0]) < 58 * s.scale + 9 && Math.abs(s.at[1] - point[1]) < 75 * s.scale + 9)) continue;
          if (map.missions.some(m => close(m.p, point) < 23)) continue;
          if (positions.some(p => close(p.p, point) < 26)) continue;
          positions.push({p: point, road: road.tags.name, seed: positions.length, orientation: Math.atan2(dy, dx)});
          if (positions.length >= 10) return positions;
        }
      }
    }
    return positions;
  }


  // V2.27: reuse one of the existing artistic positions. Never add a GIS pin.
  function featured(stalls,market){
    if(!Array.isArray(market))return null;
    return stalls.reduce((best,stall)=>!best||close(stall.p,market)<close(best.p,market)?stall:best,null);
  }
  function appearance(state,slots){
    const work=Array.isArray(state?.work)?state.work:[];
    const valid=['maca-1','limao-1','laranja-1','maca-2','limao-2','laranja-2'];
    const seen=new Set(),fruits=Array(6).fill(null);
    if(Array.isArray(slots)&&slots.length===6)slots.forEach((id,i)=>{if(valid.includes(id)&&!seen.has(id)){fruits[i]=id;seen.add(id);}});
    if(work.includes('frutas'))for(const id of valid)if(!seen.has(id)){fruits[fruits.indexOf(null)]=id;seen.add(id);}
    return{canopy:work.includes('toldo'),baskets:work.includes('cestos'),fruits,claimed:!!state?.claimed};
  }
  function hit(stall,x,y){return !!stall&&Math.abs(x-stall.p[0])<=20&&y>=stall.p[1]-25&&y<=stall.p[1]+12;}
  function witness({state,witnessed,stall,player,people,visible,route}){
    if(!visible||!state?.claimed||witnessed||!stall||!player||Math.hypot(player.x-stall.p[0],player.y-stall.p[1])>85)return null;
    const friend=people.find(p=>p.id==='cica'&&!p.meeting&&!p.travel&&!p.arriving&&Math.hypot(p.x-stall.p[0],p.y-stall.p[1])<70&&Math.hypot(p.x-player.x,p.y-player.y)<90);
    if(!friend||typeof route!=='function')return null;
    const path=route([friend.x,friend.y],stall.p);if(!path||!Number.isFinite(path.distance)||path.distance>140)return null;
    return {id:friend.id,line:'Ciça: “Ficou bonita a banca, Damião! Dá gosto de passar por aqui.”'};
  }
  function draw(c, stalls, viewport, time = 0, motionReduced = false, personal = null) {
    for (const stall of stalls) {
      const [x, y] = stall.p;
      if (x < viewport.left - 25 || x > viewport.right + 25 || y < viewport.top - 30 || y > viewport.bottom + 20) continue;
      const own=personal?.stall===stall,look=own?appearance(personal.state,personal.slots):null;
      c.save(); c.translate(x, y);
      c.fillStyle = '#294b3625'; c.beginPath(); c.ellipse(1, 5, 8, 3, 0, 0, 7); c.fill();
      if(own&&look.canopy){c.fillStyle='#4c73552b';c.beginPath();c.ellipse(0,7,10,3,0,0,7);c.fill();}
      c.fillStyle = '#b58c6b'; c.fillRect(-6, -1, 12, 7);
      c.fillStyle = '#e7cd98'; c.fillRect(-5, 1, 10, 3);
      c.fillStyle = ['#cf8d76', '#8cab9b', '#d5b574'][stall.seed % 3];
      if(!own||look.canopy){
        c.beginPath(); c.moveTo(-8, -4); c.lineTo(-5, -11); c.lineTo(5, -11); c.lineTo(8, -4); c.closePath(); c.fill();
        c.strokeStyle = '#fff3d4'; c.lineWidth = 1.7;
        for (const stripe of [-4, 0, 4]) { c.beginPath(); c.moveTo(stripe * .72, -10); c.lineTo(stripe, -4); c.stroke(); }
      }else{
        c.fillRect(-7,-11,14,2);c.fillStyle='#f0dcbb';c.fillRect(-6,-10,12,.65);
        c.fillStyle='#947456';c.fillRect(-7,-9,.65,12);c.fillRect(6.35,-9,.65,12);
      }
      if(own){
        for(let j=0;j<6;j++)if(look.fruits[j]){
          c.fillStyle=look.fruits[j].startsWith('maca')?'#c97f67':look.fruits[j].startsWith('limao')?'#c7b65e':'#d9a064';
          c.beginPath();c.arc(-3.3+(j%3)*3.2,(j<3?.6:3.2),1.2,0,7);c.fill();
        }
        c.fillStyle='#a3825e';
        if(look.baskets){c.fillRect(7,2,3,2);c.fillRect(7,-.7,3,2);}
        else{c.fillRect(-9,5,3,2);c.fillRect(7,5,3,2);}
        if(personal.label!==false){
         c.fillStyle='#fff5d9';c.fillRect(-20,-25,40,11);
         c.strokeStyle='#bda37b';c.lineWidth=.6;c.strokeRect(-20,-25,40,11);
         c.fillStyle='#667957';c.textAlign='center';c.textBaseline='middle';c.font='bold 7.5px system-ui';c.fillText('Damião',0,-19.1);
        }
        if(look.claimed){c.fillStyle='#c68b79';c.beginPath();c.arc(18,-24.5,1.1,0,7);c.fill();}
      }else for (let j = 0; j < 3; j++) {
        c.fillStyle = ['#dca16e', '#91a973', '#e6c877'][(j + stall.seed) % 3];
        c.beginPath(); c.arc(-3 + j * 3, 2, 1.3, 0, 7); c.fill();
      }
      const shimmer = motionReduced ? 0 : Math.sin(time * 1.5 + stall.seed) * .35;
      c.fillStyle = '#fff4d1'; c.beginPath(); c.arc(6, -10 + shimmer, 1.1, 0, 7); c.fill();
      c.restore();
    }
  }
  return {layout, draw, STREET_NAMES,featured,appearance,hit,witness};
});
