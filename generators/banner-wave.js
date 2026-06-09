// generators/banner-wave.js
// BNR03 — Wave banner
// Variants: TD, TL, TT, TI

'use strict';

const THEMES = {
  TD: { bg: '#0d1117', surface: '#161b22', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff', wave: '#1f2d3d' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', text: '#1f2328', muted: '#656d76', accent: '#0969da', wave: '#b6d4f5' },
  TT: { bg: '#0a0a0a', surface: '#111111', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41', wave: '#003300' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', text: '#586e75', muted: '#93a1a1', accent: '#268bd2', wave: '#b8a060' },
};

module.exports = function generateBNR03(profile, { theme = 'TD' } = {}) {
  const c        = THEMES[theme] || THEMES.TD;
  const username = profile.username || '';
  const tagline  = profile.banners?.wave?.tagline || '';

  return `<svg viewBox="0 0 700 110" xmlns="http://www.w3.org/2000/svg" width="700" height="110">
  <rect width="700" height="110" fill="${c.bg}" rx="8"/>
  <path d="M0,60 C100,30 200,90 350,55 C500,20 600,70 700,50 L700,110 L0,110 Z" fill="${c.wave}"/>
  <text x="350" y="48" text-anchor="middle" font-family="monospace" font-size="22" fill="${c.text}" font-weight="700">${escXML(username)}</text>
  <text x="350" y="72" text-anchor="middle" font-family="monospace" font-size="12" fill="${c.accent}">${escXML(tagline)}</text>
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
