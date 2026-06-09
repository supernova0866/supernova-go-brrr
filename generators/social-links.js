// generators/social-links.js
// SCL01 — Social links row (GitHub, Discord, Twitter, LinkedIn)

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1' },
};

// Platform definitions — label + brand color
const PLATFORMS = {
  github:   { label: 'GitHub',   color: '#e6edf3' },
  discord:  { label: 'Discord',  color: '#5865F2' },
  twitter:  { label: 'Twitter',  color: '#1DA1F2' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2' },
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = function generateSCL01(profile, { theme = 'TD' } = {}) {
  const c     = THEMES[theme] || THEMES.TD;
  const links = profile.social_links?.links || profile.profile_card?.links || {};
  const show  = profile.social_links?.show || Object.keys(PLATFORMS);

  // Build list of active links
  const active = show
    .filter(key => links[key])
    .map(key => ({
      label: PLATFORMS[key]?.label || key,
      color: PLATFORMS[key]?.color || c.text,
      value: links[key],
    }));

  if (active.length === 0) {
    return `<svg viewBox="0 0 300 44" xmlns="http://www.w3.org/2000/svg" width="300" height="44">
  <rect width="300" height="44" fill="${c.bg}" rx="6"/>
  <text x="14" y="26" font-family="monospace" font-size="10" fill="${c.muted}">no social links configured</text>
</svg>`;
  }

  const PAD    = 0;
  const H      = 28;
  const R      = 14; // pill radius
  const CHAR_W = 8;
  const GAP    = 8;

  let pills = '', x = PAD;
  active.forEach(link => {
    const w = link.label.length * CHAR_W + 24;
    pills += `
  <rect x="${x}" y="8" width="${w}" height="${H}" rx="${R}"
    fill="${c.surface}" stroke="${escXML(link.color)}88" stroke-width="1"/>
  <text x="${x + w / 2}" y="26" text-anchor="middle"
    font-family="monospace" font-size="10" fill="${escXML(link.color)}">${escXML(link.label)}</text>`;
    x += w + GAP;
  });

  const WIDTH  = Math.max(x - GAP + PAD, 200);
  const HEIGHT = 44;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="6"/>
  ${pills}
</svg>`;
};
