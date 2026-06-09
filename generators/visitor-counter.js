// generators/visitor-counter.js
// VSC01 — Visitor counter
// Dynamic — {{count}} injected at serve time (incremented by server on each request)

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76', accent: '#0969da' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1', accent: '#268bd2' },
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = function generateVSC01(profile, { theme = 'TD', isDynamic = true } = {}) {
  const c     = THEMES[theme] || THEMES.TD;
  const count = isDynamic ? '{{count}}' : '0';

  const WIDTH  = 220;
  const HEIGHT = 36;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="6" stroke="${c.border}" stroke-width="1"/>
  <text x="${WIDTH / 2}" y="22" text-anchor="middle" font-family="monospace" font-size="11" fill="${c.muted}">
    <tspan>👁 profile views: </tspan><tspan fill="${c.text}" font-weight="700">${escXML(count)}</tspan>
  </text>
</svg>`;
};
