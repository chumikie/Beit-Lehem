
/* V2.29 — Moto Super Kawaii Cozy (inspirada na vibe TsuLiPa⭐World ✨ (o˘◡˘o) ✨),
   Cestinhas ilustrativas de pães e doces da Padaria da Tia,
   Meio-fio caiado + Motinhas estacionadas na Feliciano Pedrosa,
   e Ciclo Vivo de Calçada às 17h e Iluminação Noturna às 19h. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RoncadorKawaiiMoto = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';
  const MOTO_SKINS = [
    {id: 'sakura', name: '🌸 Rosa Sakura TsuLiPa', body: '#f4a6b8', fender: '#ffd6e0', seat: '#8c5866', glow: '#ffebf0', trail: ['🌸','✨','💖','⭐']},
    {id: 'brejo', name: '🌿 Verde Sálvia do Brejo', body: '#7eb596', fender: '#cfe8d8', seat: '#526e5c', glow: '#e8f7ee', trail: ['🌿','✨','🌼','💚']},
    {id: 'sol', name: '⭐ Amarelo Sol de Belém', body: '#f2c94c', fender: '#fff0b8', seat: '#8c6b2b', glow: '#fff8d6', trail: ['⭐','✨','☀️','💛']},
    {id: 'serra', name: '☁️ Azul Brisa da Serra', body: '#7bb5d9', fender: '#d4ecfa', seat: '#4a6b82', glow: '#e6f5ff', trail: ['☁️','✨','💎','🩵']}
  ];
  const ACCESSORIES = [
    {id: 'none', name: 'Chapéu de Explorador (Padrão)', icon: '🧢'},
    {id: 'sakura', name: '🌸 Flor de Cerejeira (tCenter)', icon: '🌸'},
    {id: 'laco', name: '🎀 Laço Azul Kawaii', icon: '🎀'},
    {id: 'cat', name: '🐱 Orelhinhas de Gato', icon: '🐱'},
    {id: 'mic', name: '🎤 Headset Idol / Karaokê', icon: '🎤'},
    {id: 'crown', name: '👑 Tiara Dourada Center⭐', icon: '👑'}
  ];
  // Parked motorcycles along Rua Feliciano Pedrosa (Sonho Doce / Mercado) & Praça 6 de Setembro / Correios
  const PARKED_MOTOS = [
    {x: 146, y: -96, angle: 0.3, color: '#d96b52'},
    {x: 150, y: -104, angle: 0.3, color: '#4e7d96'},
    {x: 153, y: -112, angle: 0.3, color: '#e0a84b'},
    {x: 6, y: 78, angle: -0.4, color: '#c95b4a'},
    {x: 11, y: 86, angle: -0.4, color: '#5c8a72'},
    {x: 155, y: 112, angle: 0.2, color: '#6b7d99'},
    {x: 20, y: -242, angle: -0.2, color: '#d4845a'},
    {x: -92, y: 525, angle: 0.5, color: '#5b8296'}
  ];
  // Pães ilustrativos próximos aos cenários existentes; NÃO são a localização da padaria real.
  const SORDA_SPOTS = [
    {id: 'sorda_mercado', name: 'Cestinha de pães · Mercado ilustrativo', x: 14, y: 92},
    {id: 'sorda_feliciano', name: 'Cestinha de rosquinhas · Cenário ilustrativo', x: 144, y: -88}
  ];
  const BAKERY_GOODS=[
    {id:'frances',name:'pão francês',icon:'🥖'},
    {id:'coco',name:'pão doce de coco',icon:'🍞'},
    {id:'bolo',name:'bolo caseiro',icon:'🍰'},
    {id:'rosquinha',name:'rosquinha',icon:'🍩'}
  ];
  function nextBakeryGood(state){return BAKERY_GOODS[Math.max(0,Math.floor(Number(state?.sordasGifted)||0))%BAKERY_GOODS.length];}

  function fresh() {
    return {
      riding: false,
      skin: 'sakura',
      accessory: 'sakura',
      sordas: 3, // legacy save key; now represents baked goods, not the former recipe
      sordasGifted: 0,
      ferrisRides: 0,
      honks: 0
    };
  }

  function restore(raw) {
    const s = fresh();
    if (!raw || typeof raw !== 'object') return s;
    s.riding = !!raw.riding;
    if (MOTO_SKINS.some(k => k.id === raw.skin)) s.skin = raw.skin;
    if (ACCESSORIES.some(a => a.id === raw.accessory)) s.accessory = raw.accessory;
    if (Number.isFinite(raw.sordas)) s.sordas = Math.max(0, Math.min(99, Math.floor(raw.sordas)));
    if (Number.isFinite(raw.sordasGifted)) s.sordasGifted = Math.max(0, Math.min(999, Math.floor(raw.sordasGifted)));
    if (Number.isFinite(raw.ferrisRides)) s.ferrisRides = Math.max(0, Math.min(999, Math.floor(raw.ferrisRides)));
    if (Number.isFinite(raw.honks)) s.honks = Math.max(0, Math.min(9999, Math.floor(raw.honks)));
    return s;
  }

  function currentSkin(state) {
    return MOTO_SKINS.find(k => k.id === state?.skin) || MOTO_SKINS[0];
  }

  function currentAccessory(state) {
    return ACCESSORIES.find(a => a.id === state?.accessory) || ACCESSORIES[0];
  }

  return {MOTO_SKINS, ACCESSORIES, PARKED_MOTOS, SORDA_SPOTS, BAKERY_GOODS, nextBakeryGood, fresh, restore, currentSkin, currentAccessory};
});
