// generators/streak.js
// STK01 — Streak card
// Dynamic — {{streak}} {{longest}} {{total}} injected at serve time

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff', orange: '#f78166' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76', accent: '#0969da', orange: '#cf222e' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41', orange: '#ff6600' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1', accent: '#268bd2', orange: '#dc322f' },
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = function generateSTK01(profile, { theme = 'TD', isDynamic = true } = {}) {
  const c       = THEMES[theme] || THEMES.TD;
  const streak  = isDynamic ? '{{streak}}'  : '0';
  const longest = isDynamic ? '{{longest}}' : '0';
  const total   = isDynamic ? '{{total}}'   : '0';

  const WIDTH  = 300;
  const HEIGHT = 130;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="8" stroke="${c.border}" stroke-width="1"/>

  <!-- header -->
  <text x="${WIDTH / 2}" y="20" text-anchor="middle"
    font-family="monospace" font-size="10" fill="${c.muted}">Contribution Streak</text>
  <line x1="18" y1="26" x2="${WIDTH - 18}" y2="26" stroke="${c.border}" stroke-width="1"/>

  <!-- current streak — big center number -->
  <text x="${WIDTH / 2}" y="66" text-anchor="middle"
    font-family="monospace" font-size="34" fill="${c.orange}" font-weight="700">🔥 ${escXML(streak)}</text>
  <text x="${WIDTH / 2}" y="82" text-anchor="middle"
    font-family="monospace" font-size="10" fill="${c.muted}">current streak (days)</text>

  <!-- divider -->
  <line x1="18" y1="92" x2="${WIDTH - 18}" y2="92" stroke="${c.border}" stroke-width="1"/>

  <!-- longest + total -->
  <text x="${WIDTH / 4}" y="110" text-anchor="middle"
    font-family="monospace" font-size="10" fill="${c.muted}">longest</text>
  <text x="${WIDTH / 4}" y="124" text-anchor="middle"
    font-family="monospace" font-size="12" fill="${c.text}" font-weight="700">${escXML(longest)} days</text>

  <text x="${WIDTH * 3 / 4}" y="110" text-anchor="middle"
    font-family="monospace" font-size="10" fill="${c.muted}">total</text>
  <text x="${WIDTH * 3 / 4}" y="124" text-anchor="middle"
    font-family="monospace" font-size="12" fill="${c.text}" font-weight="700">${escXML(total)}</text>
</svg>`;
};
