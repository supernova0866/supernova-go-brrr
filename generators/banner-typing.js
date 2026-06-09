// generators/banner-typing.js
// BNR01 — Animated typing banner
// Dynamic — {{username}} and {{tagline}} are injected at serve time
// The typewriter animation runs entirely in SVG/CSS — no JS needed at serve time
// GitHub strips <script> tags but allows CSS animations and SMIL

'use strict';

const THEMES = {
  TD: { bg: '#0d1117', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff', cursor: '#58a6ff' },
  TL: { bg: '#ffffff', text: '#1f2328', muted: '#656d76', accent: '#0969da', cursor: '#0969da' },
  TT: { bg: '#0a0a0a', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41', cursor: '#00ff41' },
  TI: { bg: '#fdf6e3', text: '#586e75', muted: '#93a1a1', accent: '#268bd2', cursor: '#268bd2' },
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Build CSS keyframes for typewriter effect
// Types out char by char using clip-rect animation
// username is the placeholder {{username}} — at serve time this gets replaced
// We build the animation based on the character count of the placeholder
// so when the real username is injected it animates correctly
function buildTypewriterCSS(username, speed, backspaceSpeed, pauseMs, c) {
  const len       = username.length;
  const typeMs    = len * speed;
  const backMs    = len * backspaceSpeed;
  const totalMs   = typeMs + pauseMs + backMs + 400; // 400ms pause at empty
  const CHAR_W    = 13.2; // monospace char width at font-size 22
  const fullWidth = len * CHAR_W;

  // Keyframe percentages
  const typeDone    = (typeMs / totalMs) * 100;
  const pauseDone   = ((typeMs + pauseMs) / totalMs) * 100;
  const backDone    = ((typeMs + pauseMs + backMs) / totalMs) * 100;

  // Typing: clip-path width goes from 0 → fullWidth
  // Backspace: clip-path width goes from fullWidth → 0
  // Cursor moves with the text end
  return `
    <style>
      .tw-text {
        animation: typing ${totalMs}ms steps(${len}, end) infinite;
        font-family: monospace;
        font-size: 22px;
        fill: ${c.accent};
        font-weight: 700;
      }
      .tw-clip {
        animation: clip-grow ${totalMs}ms steps(${len}, end) infinite;
      }
      .tw-cursor {
        animation: blink 0.53s step-end infinite,
                   cursor-move ${totalMs}ms steps(${len}, end) infinite;
        fill: ${c.cursor};
      }
      @keyframes clip-grow {
        0%                    { clip-path: inset(0 ${fullWidth}px 0 0); }
        ${typeDone.toFixed(2)}%  { clip-path: inset(0 0px 0 0); }
        ${pauseDone.toFixed(2)}% { clip-path: inset(0 0px 0 0); }
        ${backDone.toFixed(2)}%  { clip-path: inset(0 ${fullWidth}px 0 0); }
        100%                  { clip-path: inset(0 ${fullWidth}px 0 0); }
      }
      @keyframes cursor-move {
        0%                    { transform: translateX(0px); }
        ${typeDone.toFixed(2)}%  { transform: translateX(${fullWidth}px); }
        ${pauseDone.toFixed(2)}% { transform: translateX(${fullWidth}px); }
        ${backDone.toFixed(2)}%  { transform: translateX(0px); }
        100%                  { transform: translateX(0px); }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0; }
      }
    </style>`;
}

module.exports = function generateBNR01(profile, { theme = 'TD', isDynamic = true } = {}) {
  const c        = THEMES[theme] || THEMES.TD;
  const config   = profile.banners?.animated_typing || {};
  const username = profile.username || 'username';
  const tagline  = config.tagline        || '';
  const speed    = config.speed          || 100;
  const bspeed   = config.backspace_speed || 60;
  const pause    = config.pause_ms       || 1200;

  // If dynamic, use {{username}} as placeholder — injected at serve time
  // Animation is built around the actual username length either way
  const displayName = isDynamic ? '{{username}}' : username;
  const animName    = username; // always build animation around real name length

  const css = buildTypewriterCSS(animName, speed, bspeed, pause, c);

  // Text is anchored at x=350 (center), we offset the clip origin to match
  const CHAR_W  = 13.2;
  const fullW   = animName.length * CHAR_W;
  const textX   = 350 - fullW / 2; // left edge of the text block
  const cursorX = textX;           // cursor starts at left, moves right via CSS

  return `<svg viewBox="0 0 700 100" xmlns="http://www.w3.org/2000/svg" width="700" height="100">
  <rect width="700" height="100" fill="${c.bg}" rx="8"/>
  ${css}

  <!-- typing text clipped to simulate character-by-character reveal -->
  <g class="tw-clip" style="clip-path: inset(0 ${fullW}px 0 0);">
    <text class="tw-text" x="${textX}" y="50">${escXML(displayName)}</text>
  </g>

  <!-- blinking cursor -->
  <rect class="tw-cursor" x="${cursorX}" y="30" width="2" height="24" rx="1"/>

  <!-- static tagline below -->
  <text x="350" y="76" text-anchor="middle"
    font-family="monospace" font-size="13" fill="${c.muted}">${escXML(isDynamic ? '{{tagline}}' : tagline)}</text>
</svg>`;
};
