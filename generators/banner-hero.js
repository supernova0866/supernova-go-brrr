// generators/banner-hero.js
// BNR02 — Static hero banner
// Variants: TD, TL, TT, TI

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff', green: '#3fb950' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76', accent: '#0969da', green: '#1a7f37' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41', green: '#00ff41' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1', accent: '#268bd2', green: '#859900' },
};

module.exports = function generateBNR02(profile, { theme = 'TD' } = {}) {
  const c        = THEMES[theme] || THEMES.TD;
  const username = profile.username || '';
  const tagline  = profile.banners?.hero?.tagline || '';
  const status   = profile.banners?.hero?.status  || '';

  return `<svg viewBox="0 0 700 110" xmlns="http://www.w3.org/2000/svg" width="700" height="110">
  <rect width="700" height="110" fill="${c.bg}" rx="8"/>
  <rect x="0" y="0" width="4" height="110" fill="${c.accent}" rx="2"/>
  <text x="28" y="45" font-family="monospace" font-size="26" fill="${c.text}" font-weight="700">${escXML(username)}</text>
  <text x="28" y="68" font-family="monospace" font-size="13" fill="${c.muted}">${escXML(tagline)}</text>
  ${status ? `<text x="28" y="90" font-family="monospace" font-size="11" fill="${c.green}">● ${escXML(status)}</text>` : ''}
</svg>`;
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
