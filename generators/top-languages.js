// generators/top-languages.js
// TPL01 — Top languages bar chart
// Dynamic — {{lang_1}} {{pct_1}} ... {{lang_N}} {{pct_N}} injected at serve time
// Supports up to 6 languages

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff', green: '#3fb950', track: '#21262d' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76', accent: '#0969da', green: '#1a7f37', track: '#d0d7de' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41', green: '#00ff41', track: '#0d2a0d' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1', accent: '#268bd2', green: '#859900', track: '#d3c9a1' },
};

// Language brand colors — fallback to accent if unknown
const LANG_COLORS = {
  TypeScript:  '#3178c6',
  JavaScript:  '#f1e05a',
  Python:      '#3572A5',
  Rust:        '#dea584',
  Go:          '#00ADD8',
  'C++':       '#f34b7d',
  C:           '#555555',
  Lua:         '#6b6fdc',
  Ruby:        '#CC342D',
  Java:        '#b07219',
  Kotlin:      '#A97BFF',
  Swift:       '#F05138',
  PHP:         '#4F5D95',
  'C#':        '#178600',
  Dart:        '#00B4AB',
  Elixir:      '#6e4a7e',
  Haskell:     '#5e5086',
  Zig:         '#ec915c',
  Shell:       '#89e051',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  Vue:         '#41b883',
  Svelte:      '#ff3e00',
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function langColor(name, accent) {
  return LANG_COLORS[name] || accent;
}

// Build a single bar row
// pct is a number 0-100, or a placeholder string like {{pct_1}}
function barRow(label, pct, color, y, c, barW = 160) {
  const isDynamic = typeof pct === 'string' && pct.startsWith('{{');
  // For dynamic, we can't compute bar width at generate time
  // so we use a fixed placeholder width and rely on the injected value for the text
  const fillW = isDynamic ? 80 : Math.round((parseFloat(pct) / 100) * barW);
  const pctLabel = isDynamic ? pct : `${pct}%`;

  return `
  <text x="18" y="${y + 10}" font-family="monospace" font-size="10" fill="${c.text}">${escXML(label)}</text>
  <rect x="110" y="${y}" width="${barW}" height="10" rx="3" fill="${c.track}"/>
  <rect x="110" y="${y}" width="${fillW}" height="10" rx="3" fill="${escXML(color)}"/>
  <text x="${110 + barW + 6}" y="${y + 10}" font-family="monospace" font-size="9" fill="${c.muted}">${escXML(pctLabel)}</text>`;
}

module.exports = function generateTPL01(profile, { theme = 'TD', isDynamic = true } = {}) {
  const c       = THEMES[theme] || THEMES.TD;
  const MAX     = 6;
  const ROW_H   = 20;
  const PAD_TOP = 30;
  const PAD_BOT = 24;
  const WIDTH   = 300;
  const HEIGHT  = PAD_TOP + MAX * ROW_H + PAD_BOT;

  let rows = '';

  if (isDynamic) {
    // Generate placeholder rows for all 6 possible languages
    // server.js injects real values; unused slots get empty strings → hidden
    for (let i = 1; i <= MAX; i++) {
      const label = `{{lang_${i}}}`;
      const pct   = `{{pct_${i}}}`;
      const color = c.accent; // color unknown at template time — use accent
      const y     = PAD_TOP - 14 + (i - 1) * ROW_H;
      rows += barRow(label, pct, color, y, c);
    }
  } else {
    // Static preview — use dummy data
    const preview = [
      { name: 'TypeScript', pct: 80 },
      { name: 'Python',     pct: 50 },
      { name: 'Rust',       pct: 30 },
      { name: 'Go',         pct: 20 },
    ];
    preview.forEach((l, i) => {
      const y = PAD_TOP - 14 + i * ROW_H;
      rows += barRow(l.name, l.pct, langColor(l.name, c.accent), y, c);
    });
  }

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="8" stroke="${c.border}" stroke-width="1"/>

  <!-- header -->
  <text x="18" y="18" font-family="monospace" font-size="10" fill="${c.muted}">Top Languages</text>
  <line x1="18" y1="22" x2="282" y2="22" stroke="${c.border}" stroke-width="1"/>

  <!-- bar rows -->
  ${rows}

  <!-- live indicator -->
  <circle cx="22" cy="${HEIGHT - 8}" r="3" fill="${c.green}">
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="30" y="${HEIGHT - 4}" font-family="monospace" font-size="8" fill="${c.accent}">↻ live via GitHub API</text>
</svg>`;
};

module.exports.LANG_COLORS = LANG_COLORS;
