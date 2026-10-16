import fs from 'node:fs';

const prods = [
  { id: 4, name: 'CUSQUEÑA', sub: 'TRIGO · 620 ML', bg: '#fef3c7', stroke: '#d97706', fill: '#b45309' },
  { id: 5, name: 'TRUJILLO', sub: 'CERVEZA · 620 ML', bg: '#ecfdf5', stroke: '#059669', fill: '#047857' },
  { id: 6, name: 'STELLA', sub: 'ARTOIS · 330 ML', bg: '#fef2f2', stroke: '#dc2626', fill: '#991b1b' },
  { id: 7, name: 'GUARANÁ', sub: 'BACKUS · 500 ML', bg: '#ecfdf5', stroke: '#10b981', fill: '#047857' },
  { id: 8, name: 'VIVA', sub: 'BACKUS · 500 ML', bg: '#fefce8', stroke: '#eab308', fill: '#ca8a04' },
  { id: 9, name: 'SAN MATEO', sub: 'CON GAS · 600 ML', bg: '#eff6ff', stroke: '#2563eb', fill: '#1d4ed8' },
  { id: 10, name: 'SAN MATEO', sub: 'SIN GAS · 600 ML', bg: '#f0f9ff', stroke: '#0284c7', fill: '#0369a1' },
  { id: 11, name: 'MALTIN', sub: 'POWER · 330 ML', bg: '#fef3c7', stroke: '#78350f', fill: '#451a03' },
  { id: 12, name: 'CORONA', sub: 'EXTRA · 355 ML', bg: '#fffbeb', stroke: '#1e3a8a', fill: '#172554' }
];

prods.forEach(p => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 250">
    <defs>
      <linearGradient id="glass-${p.id}" x1="0" x2="1">
        <stop stop-color="#311c08"/>
        <stop offset=".25" stop-color="#705023"/>
        <stop offset=".5" stop-color="#84652b"/>
        <stop offset=".8" stop-color="#34270e"/>
        <stop offset="1" stop-color="#201807"/>
      </linearGradient>
      <linearGradient id="shine-${p.id}">
        <stop stop-color="#ffffff" stop-opacity=".26"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="M45 13 Q60 9 75 13 L77 65 Q78 76 87 92 Q97 102 97 119 L97 226 Q97 241 83 244 L37 244 Q23 241 23 226 L23 119 Q23 102 33 92 Q42 76 43 65Z" fill="url(#glass-${p.id})"/>
    <rect x="43" y="7" width="34" height="13" rx="3" fill="${p.stroke}"/>
    <path d="M48 27 L53 27 L49 84 L36 114 L36 224 Q30 224 30 213 L30 119 L43 87Z" fill="url(#shine-${p.id})"/>
    <rect x="26" y="121" width="68" height="79" rx="5" fill="${p.bg}"/>
    <rect x="29" y="125" width="62" height="71" rx="4" fill="none" stroke="${p.stroke}" stroke-width="2"/>
    <circle cx="60" cy="145" r="11" fill="${p.stroke}"/>
    <path d="M53 149 L56 139 L60 143 L64 139 L67 149Z" fill="${p.bg}"/>
    <text x="60" y="171" text-anchor="middle" fill="${p.fill}" font-family="Georgia,serif" font-size="13" font-weight="bold">${p.name}</text>
    <text x="60" y="185" text-anchor="middle" fill="${p.fill}" font-family="sans-serif" font-size="5.5" letter-spacing="0.8">${p.sub}</text>
    <path d="M46 31 H74 V56 H46Z" fill="${p.bg}" opacity=".9"/>
    <path d="M52 43 H68" stroke="${p.stroke}" stroke-width="3"/>
  </svg>`;
  fs.writeFileSync(`public/products/${p.id}.svg`, svg, 'utf8');
});
console.log('Product SVGs 4-12 generated.');
