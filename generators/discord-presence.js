// generators/discord-presence.js
// DCS01 — Discord presence card
// Dynamic — {{status}} {{dot_color}} {{activity_type}} {{activity_name}} {{activity_detail}} {{elapsed}}
// injected at serve time via Lanyard API

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff', green: '#3fb950', idle: '#e3b341', dnd: '#f78166', offline: '#7d8590' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76', accent: '#0969da', green: '#1a7f37', idle: '#9a6700', dnd: '#cf222e', offline: '#656d76' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41', green: '#00ff41', idle: '#ffaa00', dnd: '#ff0000', offline: '#00aa2a' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1', accent: '#268bd2', green: '#859900', idle: '#b58900', dnd: '#dc322f', offline: '#93a1a1' },
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function statusColor(status, c) {
  if (status.includes('online'))                              return c.green;
  if (status.includes('idle'))                               return c.idle;
  if (status.includes('do not disturb') || status === 'dnd') return c.dnd;
  return c.offline;
}

module.exports = function generateDCS01(profile, { theme = 'TD', isDynamic = true } = {}) {
  const c        = THEMES[theme] || THEMES.TD;
  const username = profile.username || '';

  const status          = isDynamic ? '{{status}}'          : 'offline';
  const dotColor        = isDynamic ? '{{dot_color}}'       : statusColor('offline', c);
  const activity_type   = isDynamic ? '{{activity_type}}'   : '';
  const activity_name   = isDynamic ? '{{activity_name}}'   : '';
  const activity_detail = isDynamic ? '{{activity_detail}}' : '';
  const elapsed         = isDynamic ? '{{elapsed}}'         : '';

  const WIDTH  = 300;
  const HEIGHT = 140;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="8" stroke="${c.border}" stroke-width="1"/>

  <!-- Discord accent bar -->
  <rect x="0" y="0" width="${WIDTH}" height="3" rx="2" fill="#5865F2"/>

  <!-- Discord logo mark -->
  <rect x="14" y="12" width="24" height="24" rx="6" fill="#5865F2"/>
  <text x="26" y="28" text-anchor="middle" font-family="monospace" font-size="12"
    fill="white" font-weight="700">D</text>

  <!-- username -->
  <text x="46" y="22" font-family="monospace" font-size="12"
    fill="${c.text}" font-weight="700">${escXML(username)}</text>

  <!-- status dot + label — dot_color injected dynamically -->
  <circle cx="46" cy="34" r="5" fill="${escXML(dotColor)}" stroke="${c.bg}" stroke-width="2"/>
  <text x="57" y="38" font-family="monospace" font-size="9" fill="${escXML(dotColor)}">${escXML(status)}</text>

  <!-- divider -->
  <line x1="14" y1="48" x2="${WIDTH - 14}" y2="48" stroke="${c.border}" stroke-width="1"/>

  <!-- activity type label -->
  <text x="14" y="64" font-family="monospace" font-size="9"
    fill="${c.muted}" letter-spacing="0.5">${escXML(activity_type)}</text>

  <!-- activity icon placeholder -->
  <rect x="14" y="70" width="34" height="34" rx="4"
    fill="${c.surface}" stroke="${c.border}" stroke-width="1"/>
  <text x="31" y="91" text-anchor="middle" font-family="monospace" font-size="10"
    fill="${c.accent}">{ }</text>

  <!-- activity name + detail + elapsed -->
  <text x="56" y="82" font-family="monospace" font-size="10"
    fill="${c.text}" font-weight="700">${escXML(activity_name)}</text>
  <text x="56" y="96" font-family="monospace" font-size="9"
    fill="${c.muted}">${escXML(activity_detail)}</text>
  <text x="56" y="108" font-family="monospace" font-size="9"
    fill="${c.muted}">${escXML(elapsed)}</text>

  <!-- live indicator -->
  <circle cx="18" cy="${HEIGHT - 8}" r="3" fill="${c.green}">
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="26" y="${HEIGHT - 4}" font-family="monospace" font-size="8"
    fill="${c.accent}">↻ live via Lanyard API</text>
</svg>`;
};
