// generators/currently-working.js
// CWO01 — Currently working on card

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff', green: '#3fb950' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76', accent: '#0969da', green: '#1a7f37' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41', green: '#00ff41' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1', accent: '#268bd2', green: '#859900' },
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Wrap description into lines of max ~charLimit chars
function wrapText(str, charLimit = 52) {
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > charLimit) {
      if (line) lines.push(line.trim());
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines.slice(0, 3); // max 3 lines
}

module.exports = function generateCWO01(profile, { theme = 'TD' } = {}) {
  const c    = THEMES[theme] || THEMES.TD;
  const cwo  = profile.currently_working_on || {};
  const project = cwo.project     || '';
  const desc    = cwo.description || '';
  const url     = cwo.url         || '';

  const descLines = wrapText(desc);
  const LINE_H    = 16;
  const HEIGHT    = 40 + 28 + descLines.length * LINE_H + (url ? 20 : 0) + 20;

  const descSVG = descLines.map((line, i) =>
    `<text x="18" y="${92 + i * LINE_H}" font-family="monospace" font-size="10" fill="${c.muted}">${escXML(line)}</text>`
  ).join('\n  ');

  const urlSVG = url
    ? `<text x="18" y="${92 + descLines.length * LINE_H + 6}" font-family="monospace" font-size="9" fill="${c.accent}">${escXML(url)}</text>`
    : '';

  // Animated pulse dot
  const pulseDot = `
  <circle cx="20" cy="22" r="5" fill="${c.green}">
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
  </circle>`;

  return `<svg viewBox="0 0 420 ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="420" height="${HEIGHT}">
  <rect width="420" height="${HEIGHT}" fill="${c.bg}" rx="8" stroke="${c.border}" stroke-width="1"/>
  ${pulseDot}
  <text x="32" y="26" font-family="monospace" font-size="9" fill="${c.muted}" letter-spacing="1">CURRENTLY WORKING ON</text>
  <line x1="18" y1="34" x2="402" y2="34" stroke="${c.border}" stroke-width="1"/>
  <text x="18" y="60" font-family="monospace" font-size="16" fill="${c.text}" font-weight="700">${escXML(project)}</text>
  <line x1="18" y1="70" x2="402" y2="70" stroke="${c.border}" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
  ${descSVG}
  ${urlSVG}
</svg>`;
};
