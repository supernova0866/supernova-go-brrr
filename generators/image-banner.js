// generators/image-banner.js
// IMG01 — Single image banner, query-string driven — fully stateless
//
// URL format:
//   /svg/:username/image/IMG01TD?url=https://i.imgur.com/x.png&w=600&h=200&r=8
//
// Query params:
//   url — direct image URL (required)
//   w   — width in px  (default 600, max 1200)
//   h   — height in px (default 200, max 800)
//   r   — corner radius (default 8, max 40)

'use strict';

const THEMES = {
  TD: { bg: '#161b22', border: '#21262d', muted: '#7d8590' },
  TL: { bg: '#ffffff', border: '#d0d7de', muted: '#656d76' },
  TT: { bg: '#0a0a0a', border: '#00ff4133', muted: '#00aa2a' },
  TI: { bg: '#fdf6e3', border: '#d3c9a1', muted: '#93a1a1' },
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function clamp(val, min, max, def) {
  const n = parseInt(val);
  return isNaN(n) ? def : Math.min(Math.max(n, min), max);
}

module.exports = function generateIMG01(profile, { theme = 'TD', query = {} } = {}) {
  const c   = THEMES[theme] || THEMES.TD;
  const url = query.url || '';
  const w   = clamp(query.w, 100, 1200, 600);
  const h   = clamp(query.h,  50,  800, 200);
  const r   = clamp(query.r,   0,   40,   8);

  if (!url) {
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${c.bg}" rx="${r}"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r}"
    fill="none" stroke="${c.border}" stroke-width="1" stroke-dasharray="6,4"/>
  <text x="${w / 2}" y="${h / 2 - 8}" text-anchor="middle"
    font-family="monospace" font-size="12" fill="${c.muted}">no url provided</text>
  <text x="${w / 2}" y="${h / 2 + 10}" text-anchor="middle"
    font-family="monospace" font-size="9" fill="${c.muted}">add ?url=https://... to the link</text>
</svg>`;
  }

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${c.bg}" rx="${r}"/>
  <clipPath id="img-clip">
    <rect width="${w}" height="${h}" rx="${r}"/>
  </clipPath>
  <image href="${escXML(url)}" x="0" y="0" width="${w}" height="${h}"
    preserveAspectRatio="xMidYMid slice" clip-path="url(#img-clip)"/>
</svg>`;
};
