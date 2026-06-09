// generators/spotify-playing.js
// SPT01 — Spotify now playing card
// Dynamic — {{track}} {{artist}} {{album}} {{album_art}} {{progress_pct}}
//           {{duration}} {{elapsed}} {{is_playing}} injected at serve time

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff', track: '#21262d' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76', accent: '#0969da', track: '#d0d7de' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41', track: '#0d2a0d' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1', accent: '#268bd2', track: '#d3c9a1' },
};

const SPOTIFY_GREEN = '#1DB954';

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = function generateSPT01(profile, { theme = 'TD', isDynamic = true } = {}) {
  const c = THEMES[theme] || THEMES.TD;

  const track       = isDynamic ? '{{track}}'       : 'Not playing';
  const artist      = isDynamic ? '{{artist}}'      : '';
  const album       = isDynamic ? '{{album}}'       : '';
  const album_art   = isDynamic ? '{{album_art}}'   : '';
  const progress    = isDynamic ? '{{progress_pct}}': '0';
  const duration    = isDynamic ? '{{duration}}'    : '0:00';
  const elapsed     = isDynamic ? '{{elapsed}}'     : '0:00';
  const is_playing  = isDynamic ? '{{is_playing}}'  : 'false';

  // Progress bar fill width — for dynamic use placeholder, server computes real width
  // Bar track is 232px wide, fill is computed as pct/100 * 232
  // For dynamic SVG we inject the actual pixel width via a separate {{progress_w}} var
  const progressW = isDynamic ? '{{progress_w}}' : '0';

  const WIDTH  = 300;
  const HEIGHT = 130;

  // Album art — use <image> if URL available, else music note placeholder
  const albumArtSVG = album_art
    ? `<clipPath id="art-clip">
    <rect x="14" y="14" width="52" height="52" rx="6"/>
  </clipPath>
  <image href="${escXML(album_art)}" x="14" y="14" width="52" height="52"
    clip-path="url(#art-clip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="14" y="14" width="52" height="52" rx="6"
    fill="${c.surface}" stroke="${SPOTIFY_GREEN}44" stroke-width="1"/>
  <text x="40" y="46" text-anchor="middle" font-family="monospace" font-size="22"
    fill="${SPOTIFY_GREEN}">♪</text>`;

  // Animated EQ bars — only shown when playing
  const eqBars = `
  <rect x="14" y="104" width="3" height="12" rx="1" fill="${SPOTIFY_GREEN}">
    <animate attributeName="height" values="4;12;6;10;4" dur="1.2s" repeatCount="indefinite"/>
    <animate attributeName="y" values="112;104;110;106;112" dur="1.2s" repeatCount="indefinite"/>
  </rect>
  <rect x="19" y="104" width="3" height="12" rx="1" fill="${SPOTIFY_GREEN}">
    <animate attributeName="height" values="12;4;10;6;12" dur="0.9s" repeatCount="indefinite"/>
    <animate attributeName="y" values="104;112;106;110;104" dur="0.9s" repeatCount="indefinite"/>
  </rect>
  <rect x="24" y="104" width="3" height="12" rx="1" fill="${SPOTIFY_GREEN}">
    <animate attributeName="height" values="8;12;4;12;8" dur="1.1s" repeatCount="indefinite"/>
    <animate attributeName="y" values="108;104;112;104;108" dur="1.1s" repeatCount="indefinite"/>
  </rect>`;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="8" stroke="${c.border}" stroke-width="1"/>

  <!-- Spotify green accent bar -->
  <rect x="0" y="0" width="${WIDTH}" height="3" rx="2" fill="${SPOTIFY_GREEN}"/>

  <!-- album art -->
  ${albumArtSVG}

  <!-- NOW PLAYING label -->
  <text x="76" y="26" font-family="monospace" font-size="9"
    fill="${SPOTIFY_GREEN}" letter-spacing="0.5">NOW PLAYING</text>

  <!-- track + artist + album -->
  <text x="76" y="42" font-family="monospace" font-size="12"
    fill="${c.text}" font-weight="700">${escXML(track)}</text>
  <text x="76" y="56" font-family="monospace" font-size="10"
    fill="${c.muted}">${escXML(artist)}</text>
  <text x="76" y="68" font-family="monospace" font-size="9"
    fill="${c.muted}">${escXML(album)}</text>

  <!-- progress bar -->
  <rect x="14" y="80" width="272" height="4" rx="2" fill="${c.track}"/>
  <rect x="14" y="80" width="${escXML(String(progressW))}" height="4" rx="2" fill="${SPOTIFY_GREEN}"/>
  <circle cx="${14 + (isDynamic ? 0 : 0)}" cy="82" r="5" fill="${SPOTIFY_GREEN}"/>

  <!-- timestamps -->
  <text x="14" y="96" font-family="monospace" font-size="8"
    fill="${c.muted}">${escXML(elapsed)}</text>
  <text x="${WIDTH - 14}" y="96" text-anchor="end" font-family="monospace" font-size="8"
    fill="${c.muted}">${escXML(duration)}</text>

  <!-- EQ bars (animated) -->
  ${eqBars}

  <!-- live label -->
  <text x="34" y="115" font-family="monospace" font-size="8"
    fill="${c.muted}">${is_playing === 'true' || is_playing === true ? 'listening now' : 'last played'}</text>
  <text x="${WIDTH - 14}" y="115" text-anchor="end" font-family="monospace" font-size="8"
    fill="${c.accent}">↻ live via Spotify API</text>
</svg>`;
};
