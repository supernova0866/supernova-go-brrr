// generators/github-stats.js
// GHS01 — GitHub stats card
// Dynamic — {{commits}} {{prs}} {{issues}} {{stars}} injected at serve time

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

// Each stat row: label on left, value on right
function statRow(label, value, y, c) {
  return `
  <text x="18" y="${y}" font-family="monospace" font-size="11" fill="${c.muted}">${escXML(label)}</text>
  <text x="282" y="${y}" text-anchor="end" font-family="monospace" font-size="11" fill="${c.text}">${escXML(value)}</text>
  <line x1="18" y1="${y + 6}" x2="282" y2="${y + 6}" stroke="${c.border}" stroke-width="1" opacity="0.4"/>`;
}

module.exports = function generateGHS01(profile, { theme = 'TD', isDynamic = true } = {}) {
  const c        = THEMES[theme] || THEMES.TD;
  const username = profile.username || '';

  // Placeholders for dynamic injection, or zeros for static preview
  const commits = isDynamic ? '{{commits}}' : '0';
  const prs     = isDynamic ? '{{prs}}'     : '0';
  const issues  = isDynamic ? '{{issues}}'  : '0';
  const stars   = isDynamic ? '{{stars}}'   : '0';

  const WIDTH  = 300;
  const HEIGHT = 148;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="8" stroke="${c.border}" stroke-width="1"/>

  <!-- header -->
  <text x="18" y="22" font-family="monospace" font-size="10" fill="${c.muted}">GitHub Stats</text>
  <text x="282" y="22" text-anchor="end" font-family="monospace" font-size="10" fill="${c.accent}">${escXML(username)}</text>
  <line x1="18" y1="28" x2="282" y2="28" stroke="${c.border}" stroke-width="1"/>

  <!-- stat rows -->
  ${statRow('Total commits', commits, 50, c)}
  ${statRow('Pull requests', prs,     76, c)}
  ${statRow('Issues opened', issues,  102, c)}
  ${statRow('Stars earned',  stars,   128, c)}

  <!-- live indicator -->
  <circle cx="22" cy="${HEIGHT - 8}" r="3" fill="${c.green}">
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="30" y="${HEIGHT - 4}" font-family="monospace" font-size="8" fill="${c.accent}">↻ live via GitHub API</text>
</svg>`;
};
