// generators/custom-buttons.js
// CBT01 — Custom buttons, query-string driven — fully stateless
//
// URL format:
//   /svg/:username/buttons/CBT01TD?Label_hexcolor&Label2_hexcolor2
//
// Each query param key is "Label_hexcolor" — underscore separated
// No value needed, just the key itself
// e.g. ?My+Site_58a6ff&Blog_f78166&Discord+Server_5865F2
//
// Called from server.js with parsed query params passed in as options.buttons

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1' },
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function safeHex(hex) {
  const h = hex.startsWith('#') ? hex : `#${hex}`;
  return /^#[0-9a-fA-F]{3,8}$/.test(h) ? h : '#ffffff';
}

// Parse query string keys into button definitions
// Each key is "Label_hexcolor" — e.g. "My Site_58a6ff"
function parseButtons(queryKeys) {
  return queryKeys.map(key => {
    const lastUnderscore = key.lastIndexOf('_');
    if (lastUnderscore === -1) return { label: key, color: '#ffffff' };
    const label = key.slice(0, lastUnderscore).trim();
    const color = safeHex(key.slice(lastUnderscore + 1).trim());
    return { label, color };
  }).filter(b => b.label);
}

module.exports = function generateCBT01(profile, { theme = 'TD', buttons = [] } = {}) {
  const c    = THEMES[theme] || THEMES.TD;
  const btns = parseButtons(buttons);

  if (btns.length === 0) {
    return `<svg viewBox="0 0 300 44" xmlns="http://www.w3.org/2000/svg" width="300" height="44">
  <rect width="300" height="44" fill="${c.bg}" rx="6"/>
  <text x="14" y="26" font-family="monospace" font-size="10" fill="${c.muted}">no buttons in query string</text>
</svg>`;
  }

  const H      = 28;
  const R      = 6;
  const CHAR_W = 8;
  const GAP    = 8;
  const PAD    = 0;

  let chips = '', x = PAD;
  btns.forEach(btn => {
    const w = btn.label.length * CHAR_W + 24;
    chips += `
  <rect x="${x}" y="8" width="${w}" height="${H}" rx="${R}"
    fill="${escXML(btn.color)}22" stroke="${escXML(btn.color)}" stroke-width="1"/>
  <text x="${x + w / 2}" y="26" text-anchor="middle"
    font-family="monospace" font-size="10" fill="${escXML(btn.color)}" font-weight="600">${escXML(btn.label)}</text>`;
    x += w + GAP;
  });

  const WIDTH  = Math.max(x - GAP + PAD, 200);
  const HEIGHT = 44;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="6"/>
  ${chips}
</svg>`;
};

module.exports.parseButtons = parseButtons;
