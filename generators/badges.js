// generators/badges.js
// BGS01 — Shields.io-style badges (left label dark, right label colored)

'use strict';

const THEMES = {
  TD: { bg: '#161b22', left: '#21262d', leftText: '#7d8590', muted: '#7d8590' },
  TL: { bg: '#ffffff', left: '#e1e4e8', leftText: '#656d76', muted: '#656d76' },
  TT: { bg: '#0a0a0a', left: '#0d2a0d', leftText: '#00aa2a', muted: '#00aa2a' },
  TI: { bg: '#fdf6e3', left: '#d3c9a1', leftText: '#93a1a1', muted: '#93a1a1' },
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
  return /^#[0-9a-fA-F]{3,8}$/.test(hex) ? hex : '#3fb950';
}

// Estimate text width in monospace at given font-size
function textW(str, fontSize = 9) {
  return str.length * (fontSize * 0.62);
}

module.exports = function generateBGS01(profile, { theme = 'TD' } = {}) {
  const c     = THEMES[theme] || THEMES.TD;
  const items = (profile.badges?.items || []).filter(b => b.left || b.right);

  if (items.length === 0) {
    return `<svg viewBox="0 0 300 32" xmlns="http://www.w3.org/2000/svg" width="300" height="32">
  <rect width="300" height="32" fill="${c.bg}" rx="4"/>
  <text x="10" y="20" font-family="monospace" font-size="10" fill="${c.muted}">no badges configured</text>
</svg>`;
  }

  const FS    = 9;   // font size
  const H     = 20;  // badge height
  const HPAD  = 6;   // horizontal padding per side
  const GAP   = 6;   // gap between badges
  const VPAD  = 6;   // vertical padding (top)
  const ROWS_PER_LINE = 999; // all on one line for now — wrap later if needed

  let badges = '', x = 0;

  items.forEach(item => {
    const color  = safeHex(item.color || '#3fb950');
    const left   = item.left  || '';
    const right  = item.right || '';
    const lw     = Math.max(textW(left, FS) + HPAD * 2, 20);
    const rw     = Math.max(textW(right, FS) + HPAD * 2, 20);
    const bw     = lw + rw;
    const ty     = VPAD + H * 0.68; // text y — vertically centered

    badges += `
  <!-- badge: ${escXML(left)} | ${escXML(right)} -->
  <g transform="translate(${x}, ${VPAD})">
    <!-- left side -->
    <rect x="0" y="0" width="${lw + 3}" height="${H}" rx="3" fill="${c.left}"/>
    <text x="${lw / 2}" y="${H * 0.68}" text-anchor="middle"
      font-family="monospace" font-size="${FS}" fill="${c.leftText}">${escXML(left)}</text>

    <!-- right side -->
    <rect x="${lw}" y="0" width="${rw + 3}" height="${H}" rx="3" fill="${color}"/>
    <!-- cover the left-side right radius to make a clean join -->
    <rect x="${lw}" y="0" width="3" height="${H}" fill="${color}"/>
    <rect x="${lw - 2}" y="0" width="2" height="${H}" fill="${c.left}"/>
    <text x="${lw + rw / 2}" y="${H * 0.68}" text-anchor="middle"
      font-family="monospace" font-size="${FS}" fill="#ffffff" font-weight="700">${escXML(right)}</text>
  </g>`;

    x += bw + GAP;
  });

  const WIDTH  = Math.max(x - GAP, 200);
  const HEIGHT = VPAD + H + VPAD;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="4"/>
  ${badges}
</svg>`;
};
