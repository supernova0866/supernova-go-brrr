// generators/image-grid.js
// IMG02 — Image grid, query-string driven — fully stateless
//
// URL format:
//   /svg/:username/image/IMG02TD?cols=3&cw=180&ch=120&gap=8&url=https://...&url=https://...
//
// Query params:
//   cols — number of columns (default 3, max 6)
//   cw   — cell width in px  (default 180, max 400)
//   ch   — cell height in px (default 120, max 400)
//   gap  — gap between cells (default 8, max 40)
//   url  — image URL, repeat for multiple (e.g. &url=...&url=...&url=...)

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

module.exports = function generateIMG02(profile, { theme = 'TD', query = {} } = {}) {
  const c    = THEMES[theme] || THEMES.TD;
  const cols = clamp(query.cols, 1, 6,   3);
  const cw   = clamp(query.cw,  60, 400, 180);
  const ch   = clamp(query.ch,  40, 400, 120);
  const gap  = clamp(query.gap,  0, 40,   8);
  const cr   = 6; // fixed cell corner radius

  // url can be a single string or array depending on how querystring parses it
  const rawUrls = query.url
    ? (Array.isArray(query.url) ? query.url : [query.url])
    : [];
  const urls = rawUrls.filter(Boolean);

  const totalW = cols * cw + (cols - 1) * gap;

  // No URLs — placeholder grid
  if (urls.length === 0) {
    const PLACEHOLDER_ROWS = 2;
    const totalH = PLACEHOLDER_ROWS * ch + (PLACEHOLDER_ROWS - 1) * gap;
    let cells = '';
    for (let row = 0; row < PLACEHOLDER_ROWS; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (cw + gap);
        const y = row * (ch + gap);
        cells += `
  <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="${cr}"
    fill="none" stroke="${c.border}" stroke-width="1" stroke-dasharray="5,4"/>
  <text x="${x + cw / 2}" y="${y + ch / 2 + 4}" text-anchor="middle"
    font-family="monospace" font-size="9" fill="${c.muted}">add ?url=... to link</text>`;
      }
    }
    return `<svg viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">
  <rect width="${totalW}" height="${totalH}" fill="${c.bg}" rx="8"/>
  ${cells}
</svg>`;
  }

  const rows   = Math.ceil(urls.length / cols);
  const totalH = rows * ch + (rows - 1) * gap;

  let cells = '';
  urls.forEach((url, i) => {
    const col    = i % cols;
    const row    = Math.floor(i / cols);
    const x      = col * (cw + gap);
    const y      = row * (ch + gap);
    const clipId = `c${i}`;
    cells += `
  <clipPath id="${clipId}">
    <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="${cr}"/>
  </clipPath>
  <image href="${escXML(url)}" x="${x}" y="${y}" width="${cw}" height="${ch}"
    preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`;
  });

  return `<svg viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">
  <rect width="${totalW}" height="${totalH}" fill="${c.bg}" rx="8"/>
  ${cells}
</svg>`;
};
