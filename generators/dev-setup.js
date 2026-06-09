// generators/dev-setup.js
// DVS01 — Icon tiles (sectioned: Software, Languages, OS)
// DVS02 — Badge row (flat inline row of all selected icons)
// DVS03 — Grid (compact sectioned grid)

'use strict';

const THEMES = {
  TD: { bg: '#161b22', surface: '#0d1117', border: '#21262d', text: '#e6edf3', muted: '#7d8590', accent: '#58a6ff' },
  TL: { bg: '#ffffff', surface: '#f6f8fa', border: '#d0d7de', text: '#1f2328', muted: '#656d76', accent: '#0969da' },
  TT: { bg: '#0a0a0a', surface: '#111111', border: '#00ff4133', text: '#00ff41', muted: '#00aa2a', accent: '#00ff41' },
  TI: { bg: '#fdf6e3', surface: '#eee8d5', border: '#d3c9a1', text: '#586e75', muted: '#93a1a1', accent: '#268bd2' },
};

// Icon registry — slug → { label, color }
// Extend this as more icons are added
const ICONS = {
  // Software
  vscode:    { label: 'VS Code',    color: '#007ACC' },
  replit:    { label: 'Replit',     color: '#F26207' },
  cursor:    { label: 'Cursor',     color: '#a371f7' },
  neovim:    { label: 'Neovim',     color: '#3fb950' },
  jetbrains: { label: 'JetBrains',  color: '#f78166' },
  zed:       { label: 'Zed',        color: '#58a6ff' },
  sublime:   { label: 'Sublime',    color: '#FF9800' },
  vim:       { label: 'Vim',        color: '#019733' },
  emacs:     { label: 'Emacs',      color: '#7F5AB6' },
  // Languages
  python:     { label: 'Python',     color: '#3572A5' },
  javascript: { label: 'JavaScript', color: '#F7DF1E' },
  typescript: { label: 'TypeScript', color: '#3178c6' },
  rust:       { label: 'Rust',       color: '#dea584' },
  go:         { label: 'Go',         color: '#00ADD8' },
  cpp:        { label: 'C++',        color: '#f34b7d' },
  c:          { label: 'C',          color: '#555555' },
  lua:        { label: 'Lua',        color: '#6b6fdc' },
  ruby:       { label: 'Ruby',       color: '#CC342D' },
  java:       { label: 'Java',       color: '#b07219' },
  kotlin:     { label: 'Kotlin',     color: '#A97BFF' },
  swift:      { label: 'Swift',      color: '#F05138' },
  php:        { label: 'PHP',        color: '#4F5D95' },
  csharp:     { label: 'C#',         color: '#178600' },
  dart:       { label: 'Dart',       color: '#00B4AB' },
  elixir:     { label: 'Elixir',     color: '#6e4a7e' },
  haskell:    { label: 'Haskell',    color: '#5e5086' },
  zig:        { label: 'Zig',        color: '#ec915c' },
  // OS
  windows: { label: 'Windows', color: '#0078D4' },
  linux:   { label: 'Linux',   color: '#f5c518' },
  macos:   { label: 'macOS',   color: '#999999' },
  ubuntu:  { label: 'Ubuntu',  color: '#E95420' },
  arch:    { label: 'Arch',    color: '#1793d1' },
  debian:  { label: 'Debian',  color: '#A80030' },
  fedora:  { label: 'Fedora',  color: '#294172' },
};

function escXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveIcons(slugs) {
  return (slugs || [])
    .map(s => ({ slug: s, ...(ICONS[s] || { label: s, color: '#7d8590' }) }));
}

// ── DVS01 — Icon tiles ────────────────────────
function generateDVS01(profile, c) {
  const sw  = resolveIcons(profile.dev_setup?.software);
  const lg  = resolveIcons(profile.dev_setup?.languages);
  const os  = resolveIcons(profile.dev_setup?.os);

  const TILE_W = 44, TILE_H = 40, GAP = 4, PAD = 14;
  const LABEL_H = 10; // label text below icon

  function tileRow(items, yStart) {
    return items.slice(0, 12).map((item, i) => {
      const x = PAD + i * (TILE_W + GAP);
      // Use first 2 chars of label as icon symbol if no SVG icon
      const sym = item.label.substring(0, 2);
      return `
    <rect x="${x}" y="${yStart}" width="${TILE_W}" height="${TILE_H}" rx="5"
      fill="${c.surface}" stroke="${c.border}" stroke-width="1"/>
    <text x="${x + TILE_W / 2}" y="${yStart + 24}" text-anchor="middle"
      font-family="monospace" font-size="12" fill="${escXML(item.color)}" font-weight="700">${escXML(sym)}</text>
    <text x="${x + TILE_W / 2}" y="${yStart + TILE_H + LABEL_H}" text-anchor="middle"
      font-family="monospace" font-size="7" fill="${c.muted}">${escXML(item.label.substring(0, 8))}</text>`;
    }).join('');
  }

  const ROW_H   = TILE_H + LABEL_H + 10; // tile + label + spacing
  const SECTION = ROW_H + 20;            // row + section header
  const HEIGHT  = PAD + SECTION * 3 + PAD;
  const WIDTH   = 700;

  const swY  = PAD + 20;
  const lgY  = swY + SECTION;
  const osY  = lgY + SECTION;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="8"/>

  <text x="${PAD}" y="${PAD + 12}" font-family="monospace" font-size="9" fill="${c.muted}" letter-spacing="1">SOFTWARE</text>
  <line x1="${PAD}" y1="${PAD + 16}" x2="${WIDTH - PAD}" y2="${PAD + 16}" stroke="${c.border}" stroke-width="1"/>
  ${tileRow(sw, swY)}

  <text x="${PAD}" y="${lgY - 8}" font-family="monospace" font-size="9" fill="${c.muted}" letter-spacing="1">LANGUAGES</text>
  <line x1="${PAD}" y1="${lgY - 4}" x2="${WIDTH - PAD}" y2="${lgY - 4}" stroke="${c.border}" stroke-width="1"/>
  ${tileRow(lg, lgY)}

  <text x="${PAD}" y="${osY - 8}" font-family="monospace" font-size="9" fill="${c.muted}" letter-spacing="1">OS</text>
  <line x1="${PAD}" y1="${osY - 4}" x2="${WIDTH - PAD}" y2="${osY - 4}" stroke="${c.border}" stroke-width="1"/>
  ${tileRow(os, osY)}
</svg>`;
}

// ── DVS02 — Badge row ─────────────────────────
function generateDVS02(profile, c) {
  const all = [
    ...resolveIcons(profile.dev_setup?.software),
    ...resolveIcons(profile.dev_setup?.languages),
    ...resolveIcons(profile.dev_setup?.os),
  ];

  const PAD = 10, H = 24, GAP = 6;
  const CHAR_W = 7.2;

  let chips = '', x = PAD;
  all.forEach(item => {
    const w = Math.max(item.label.length * CHAR_W + 18, 40);
    chips += `
  <rect x="${x}" y="9" width="${w}" height="${H}" rx="4"
    fill="${c.surface}" stroke="${escXML(item.color)}55" stroke-width="1"/>
  <text x="${x + w / 2}" y="25" text-anchor="middle"
    font-family="monospace" font-size="10" fill="${escXML(item.color)}">${escXML(item.label)}</text>`;
    x += w + GAP;
  });

  const WIDTH  = Math.min(Math.max(x + PAD, 300), 900);
  const HEIGHT = 42;

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="6"/>
  ${chips || `<text x="${PAD}" y="24" font-family="monospace" font-size="10" fill="${c.muted}">no icons selected</text>`}
</svg>`;
}

// ── DVS03 — Compact grid ──────────────────────
function generateDVS03(profile, c) {
  const sw  = resolveIcons(profile.dev_setup?.software);
  const lg  = resolveIcons(profile.dev_setup?.languages);
  const os  = resolveIcons(profile.dev_setup?.os);

  const CHIP_W = 56, CHIP_H = 20, GAP = 4, PAD = 14;
  const ROW_H  = CHIP_H + 28;

  function chipRow(items, yStart) {
    return items.slice(0, 10).map((item, i) => {
      const x = PAD + i * (CHIP_W + GAP);
      return `
    <rect x="${x}" y="${yStart}" width="${CHIP_W}" height="${CHIP_H}" rx="3"
      fill="${c.surface}" stroke="${c.border}" stroke-width="1"/>
    <text x="${x + CHIP_W / 2}" y="${yStart + 13}" text-anchor="middle"
      font-family="monospace" font-size="9" fill="${escXML(item.color)}">${escXML(item.label.substring(0, 8))}</text>`;
    }).join('');
  }

  const cats   = [['SOFTWARE', sw], ['LANGUAGES', lg], ['OS', os]].filter(([, items]) => items.length);
  const HEIGHT = PAD + cats.length * ROW_H + PAD;
  const WIDTH  = 500;

  let body = '', y = PAD;
  cats.forEach(([cat, items]) => {
    body += `
  <text x="${PAD}" y="${y + 10}" font-family="monospace" font-size="8" fill="${c.muted}" letter-spacing="1">${cat}</text>
  <line x1="${PAD}" y1="${y + 14}" x2="${WIDTH - PAD}" y2="${y + 14}" stroke="${c.border}" stroke-width="1"/>
  ${chipRow(items, y + 18)}`;
    y += ROW_H;
  });

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${c.bg}" rx="8"/>
  ${body}
</svg>`;
}

// ── Entry point ───────────────────────────────
module.exports = function generateDVS(profile, { theme = 'TD', code = 'DVS01' } = {}) {
  const c       = THEMES[theme] || THEMES.TD;
  const variant = parseInt(code.replace('DVS', '')) || 1;

  if (variant === 1) return generateDVS01(profile, c);
  if (variant === 2) return generateDVS02(profile, c);
  if (variant === 3) return generateDVS03(profile, c);

  return generateDVS01(profile, c); // fallback
};

module.exports.ICONS = ICONS; // export registry for /api/icons
