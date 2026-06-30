// generators/profile-card.js
// PRF01 — Full profile card
// Dynamic — {{avatar_url}} {{bio}} {{location}} injected at serve time

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

function wrapText(str, charLimit = 42) {
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
  return lines.slice(0, 2);
}

module.exports = function generatePRF01(profile, { theme = 'TD', isDynamic = true } = {}) {
  const c        = THEMES[theme] || THEMES.TD;
  const username = profile.username || '';
  const prf      = profile.profile_card || {};
  const links    = prf.links || {};

  const avatarUrl = isDynamic ? '{{avatar_url}}' : '';
  const bio       = isDynamic ? '{{bio}}'        : (prf.bio      || '');
  const location  = isDynamic ? '{{location}}'   : (prf.location || '');

  const github   = links.github   || username;
  const discord  = links.discord  || '';
  const twitter  = links.twitter  || '';
  const linkedin = links.linkedin || '';

  // For dynamic: single placeholder line. For static: wrap bio text.
  const bioLines = isDynamic ? ['{{bio}}'] : wrapText(bio);

  const AVATAR_R  = 28;
  const AVATAR_CX = 44;
  const AVATAR_CY = 48;
  const WIDTH     = 320;

  // Layout — all text sits to the right of the avatar (x=88+)
  // username: y=30
  // bio lines: y=46, 60, ...
  // location: y = 46 + bioLines.length * 14 + 8
  const BIO_START_Y  = 46;
  const BIO_LINE_H   = 14;
  const locationY    = BIO_START_Y + bioLines.length * BIO_LINE_H + 8;
  const dividerY     = locationY + 18;

  const socialLinks = [
    github   && { label: `github.com/${github}`,     color: c.accent  },
    discord  && { label: `discord: ${discord}`,      color: '#5865F2' },
    twitter  && { label: `@${twitter}`,              color: '#1DA1F2' },
    linkedin && { label: `in/${linkedin}`,            color: '#0A66C2' },
  ].filter(Boolean);

  const HEIGHT = dividerY + 14 + socialLinks.length * 16 + (socialLinks.length ? 8 : 0);

  // Avatar
  const avatarSVG = avatarUrl
    ? `<clipPath id="av">
    <circle cx="${AVATAR_CX}" cy="${AVATAR_CY}" r="${AVATAR_R}"/>
  </clipPath>
  <circle cx="${AVATAR_CX}" cy="${AVATAR_CY}" r="${AVATAR_R}" fill="${c.surface}" stroke="${c.border}" stroke-width="1"/>
  <image href="${escXML(avatarUrl)}" x="${AVATAR_CX - AVATAR_R}" y="${AVATAR_CY - AVATAR_R}"
    width="${AVATAR_R * 2}" height="${AVATAR_R * 2}" clip-path="url(#av)"/>`
    : `<circle cx="${AVATAR_CX}" cy="${AVATAR_CY}" r="${AVATAR_R}" fill="${c.surface}" stroke="${c.border}" stroke-width="1"/>
  <text x="${AVATAR_CX}" y="${AVATAR_CY + 5}" text-anchor="middle"
    font-family="monospace" font-size="14" fill="${c.accent}" font-weight="700">${escXML(username.substring(0, 2).toUpperCase())}</text>`;

  const statusDot = `
  <circle cx="${AVATAR_CX + AVATAR_R - 5}" cy="${AVATAR_CY + AVATAR_R - 5}" r="5"
    fill="${c.green}" stroke="${c.bg}" stroke-width="2"/>`;

  const bioSVG = bioLines.map((line, i) =>
    `<text x="88" y="${BIO_START_Y + i * BIO_LINE_H}" font-family="monospace" font-size="9" fill="${c.muted}">${escXML(line)}</text>`
  ).join('\n  ');

  const socialSVG = socialLinks.map((l, i) =>
    `<text x="18" y="${dividerY + 14 + i * 16}" font-family="monospace" font-size="9" fill="${escXML(l.color)}">${escXML(l.label)}</text>`
  ).join('\n  ');

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="8" stroke="${c.border}" stroke-width="1"/>

  ${avatarSVG}
  ${statusDot}

  <text x="88" y="30" font-family="monospace" font-size="13" fill="${c.text}" font-weight="700">${escXML(username)}</text>
  ${bioSVG}
  <text x="88" y="${locationY}" font-family="monospace" font-size="9" fill="${c.muted}">📍 ${escXML(location)}</text>

  <line x1="18" y1="${dividerY}" x2="${WIDTH - 18}" y2="${dividerY}" stroke="${c.border}" stroke-width="1"/>
  ${socialSVG}
</svg>`;
};
