// ─────────────────────────────────────────────
//  supernova-go-brrr — server.js
//  Plain Node.js http — no Express, no frameworks
// ─────────────────────────────────────────────

'use strict';

const http        = require('http');
const https       = require('https');
const fs          = require('fs');
const path        = require('path');
const crypto      = require('crypto');
const querystring = require('querystring');

// ── Env ──────────────────────────────────────
require('./env'); // loads .env manually (see below)

const PORT    = process.env.PORT || 3000;
const HOST    = process.env.HOST || `http://localhost:${PORT}`;

const GH_CLIENT_ID     = process.env.GITHUB_CLIENT_ID;
const GH_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GH_REDIRECT      = process.env.GITHUB_REDIRECT_URI || `${HOST}/auth/github/callback`;

const SP_CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const SP_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SP_REDIRECT      = process.env.SPOTIFY_REDIRECT_URI || `${HOST}/auth/spotify/callback`;

const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production';

// ── Paths ─────────────────────────────────────
const ROOT        = __dirname;
const PUBLIC_DIR  = path.join(ROOT, 'public');
const PROFILES_DIR = path.join(ROOT, 'profiles');
const STATIC_DIR  = path.join(ROOT, 'static');
const GEN_DIR     = path.join(ROOT, 'generators');

// ── Dynamic card codes ────────────────────────
// These cards have {{variable}} placeholders — data is injected at serve time
const DYNAMIC_CODES = new Set([
  'BNR01', // typing banner   — {{username}} {{tagline}}
  'GHS01', // github stats    — {{commits}} {{prs}} {{issues}} {{stars}}
  'STK01', // streak          — {{streak}} {{longest}} {{total}}
  'TPL01', // top languages   — {{lang_1}} {{pct_1}} ... {{lang_N}} {{pct_N}}
  'PRF01', // profile card    — {{avatar_url}} {{bio}} {{location}}
  'VSC01', // visitor counter — {{count}}
  'DCS01', // discord         — {{status}} {{activity_type}} {{activity_name}} {{activity_detail}} {{elapsed}}
  'SPT01', // spotify         — {{track}} {{artist}} {{album}} {{progress_pct}} {{duration}} {{elapsed}} {{album_art}}
]);

// ── Sessions (in-memory) ──────────────────────
// Simple cookie-based sessions — good enough for personal/limited-access tool
const sessions = new Map();

function createSession(data) {
  const id = crypto.randomBytes(32).toString('hex');
  sessions.set(id, { ...data, createdAt: Date.now() });
  return id;
}

function getSession(req) {
  const cookie = req.headers.cookie || '';
  const match  = cookie.match(/sid=([a-f0-9]{64})/);
  if (!match) return null;
  return sessions.get(match[1]) || null;
}

function destroySession(req) {
  const cookie = req.headers.cookie || '';
  const match  = cookie.match(/sid=([a-f0-9]{64})/);
  if (match) sessions.delete(match[1]);
}

// Clean up sessions older than 7 days
setInterval(() => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const [id, s] of sessions) {
    if (s.createdAt < cutoff) sessions.delete(id);
  }
}, 60 * 60 * 1000);

// ── Helpers ───────────────────────────────────
function send(res, status, body, type = 'text/plain') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

function sendJSON(res, status, obj) {
  send(res, status, JSON.stringify(obj), 'application/json');
}

function sendSVG(res, svg) {
  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.end(svg);
}

function redirect(res, url, cookie) {
  const headers = { Location: url };
  if (cookie) headers['Set-Cookie'] = cookie;
  res.writeHead(302, headers);
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function loadProfile(username) {
  const file = path.join(PROFILES_DIR, `${username}.json`);
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

function saveProfile(username, data) {
  const file = path.join(PROFILES_DIR, `${username}.json`);
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath)) { send(res, 404, 'Not found'); return; }
  const ext  = path.extname(filePath).toLowerCase();
  const mime = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
    '.json': 'application/json', '.md': 'text/markdown',
  }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
}

// ── HTTPS fetch helper ────────────────────────
function fetchJSON(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'supernova-go-brrr',
        'Accept': 'application/json',
        ...options.headers,
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// ── Variable injection ────────────────────────
function inject(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

// ── GitHub API ────────────────────────────────
async function fetchGitHubStats(username, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const user    = await fetchJSON(`https://api.github.com/users/${username}`, { headers });
  const repos   = await fetchJSON(`https://api.github.com/user/repos?per_page=100&type=owner`, { headers });

  let stars = 0, topLangs = {};
  if (Array.isArray(repos)) {
    for (const r of repos) {
      stars += r.stargazers_count || 0;
      if (r.language) topLangs[r.language] = (topLangs[r.language] || 0) + 1;
    }
  }

  // Sort languages by count
  const sortedLangs = Object.entries(topLangs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const total = sortedLangs.reduce((s, [, c]) => s + c, 0);

  return {
    username: user.login || username,
    avatar_url: user.avatar_url || '',
    bio: user.bio || '',
    location: user.location || '',
    public_repos: user.public_repos || 0,
    followers: user.followers || 0,
    stars,
    langs: sortedLangs.map(([name, count]) => ({
      name,
      pct: Math.round((count / total) * 100),
    })),
  };
}

async function fetchGitHubCommits(username, token) {
  // Use search API for total commit count approximation
  const headers = token
    ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
    : { Accept: 'application/vnd.github.v3+json' };
  const result = await fetchJSON(
    `https://api.github.com/search/commits?q=author:${username}&per_page=1`,
    { headers }
  );
  return result.total_count || 0;
}

// ── Lanyard (Discord presence) ────────────────
async function fetchDiscordPresence(userId) {
  try {
    const data = await fetchJSON(`https://api.lanyard.rest/v1/users/${userId}`);
    if (!data.success) return null;
    const d = data.data;
    const activity = d.activities?.[0];
    const statusMap = { online: 'online', idle: 'idle', dnd: 'do not disturb', offline: 'offline' };
    return {
      status: statusMap[d.discord_status] || 'offline',
      activity_type: activity ? ['Playing', 'Streaming', 'Listening to', 'Watching', 'Custom', 'Competing in'][activity.type] || '' : '',
      activity_name: activity?.name || '',
      activity_detail: activity?.details || activity?.state || '',
      elapsed: activity?.timestamps?.start
        ? formatElapsed(Date.now() - activity.timestamps.start)
        : '',
    };
  } catch { return null; }
}

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h} hr${h > 1 ? 's' : ''} ${m % 60} min${m % 60 !== 1 ? 's' : ''} elapsed`;
  if (m > 0) return `${m} min${m > 1 ? 's' : ''} elapsed`;
  return `${s}s elapsed`;
}

// ── Spotify ───────────────────────────────────
async function fetchSpotifyNowPlaying(profile) {
  if (!profile.spotify?.access_token) return null;
  try {
    const data = await fetchJSON('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${profile.spotify.access_token}` },
    });
    if (!data || !data.item) {
      // Fetch last played
      if (!profile.spotify.show_last_played) return null;
      const recent = await fetchJSON('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
        headers: { Authorization: `Bearer ${profile.spotify.access_token}` },
      });
      const track = recent?.items?.[0]?.track;
      if (!track) return null;
      return {
        track: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        album_art: track.album.images?.[0]?.url || '',
        progress_pct: 0,
        duration: formatMs(track.duration_ms),
        elapsed: '0:00',
        is_playing: false,
      };
    }
    const item = data.item;
    return {
      track: item.name,
      artist: item.artists.map(a => a.name).join(', '),
      album: item.album.name,
      album_art: item.album.images?.[0]?.url || '',
      progress_pct: Math.round((data.progress_ms / item.duration_ms) * 100),
      duration: formatMs(item.duration_ms),
      elapsed: formatMs(data.progress_ms),
      is_playing: data.is_playing,
    };
  } catch { return null; }
}

async function refreshSpotifyToken(profile, username) {
  if (!profile.spotify?.refresh_token) return profile;
  try {
    const body = querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: profile.spotify.refresh_token,
    });
    const creds = Buffer.from(`${SP_CLIENT_ID}:${SP_CLIENT_SECRET}`).toString('base64');
    const data  = await fetchJSON('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (data.access_token) {
      profile.spotify.access_token = data.access_token;
      saveProfile(username, profile);
    }
  } catch { /* silent fail */ }
  return profile;
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

// ── SVG serving ───────────────────────────────
async function serveSVG(res, username, code, theme, query = {}) {
  const fullCode = `${code}${theme}`;
  const svgPath  = path.join(STATIC_DIR, username, `${fullCode}.svg`);

  if (!fs.existsSync(svgPath)) {
    send(res, 404, `SVG not found: ${fullCode} — generate it from the dashboard first`);
    return;
  }

  let svg = fs.readFileSync(svgPath, 'utf8');

  // If static, serve directly
  if (!DYNAMIC_CODES.has(code)) {
    sendSVG(res, svg);
    return;
  }

  // Dynamic — load profile, fetch live data, inject variables
  const profile = loadProfile(username);
  if (!profile) { send(res, 404, 'Profile not found'); return; }

  let vars = {};

  // ── BNR01 — typing banner (name comes from GitHub API)
  if (code === 'BNR01') {
    vars = {
      username,
      tagline: profile.banners?.animated_typing?.tagline || '',
    };
  }

  // ── GHS01 — GitHub stats
  else if (code === 'GHS01') {
    const session = [...sessions.values()].find(s => s.username === username);
    const token   = session?.access_token || null;
    const commits = await fetchGitHubCommits(username, token).catch(() => '?');
    const stats   = await fetchGitHubStats(username, token).catch(() => ({}));
    vars = {
      commits: commits.toLocaleString?.() ?? commits,
      prs: '?',   // GitHub API doesn't expose PRs easily without GraphQL
      issues: '?',
      stars: (stats.stars || 0).toLocaleString(),
    };
  }

  // ── STK01 — streak (no official API; placeholder for custom implementation)
  else if (code === 'STK01') {
    vars = { streak: '?', longest: '?', total: '?' };
    // TODO: implement streak fetching via GitHub contributions API or third-party
  }

  // ── TPL01 — top languages
  else if (code === 'TPL01') {
    const session = [...sessions.values()].find(s => s.username === username);
    const token   = session?.access_token || null;
    const stats   = await fetchGitHubStats(username, token).catch(() => ({ langs: [] }));
    stats.langs.forEach((l, i) => {
      vars[`lang_${i + 1}`] = l.name;
      vars[`pct_${i + 1}`]  = `${l.pct}%`;
    });
  }

  // ── PRF01 — profile card
  else if (code === 'PRF01') {
    const session = [...sessions.values()].find(s => s.username === username);
    const token   = session?.access_token || null;
    const stats   = await fetchGitHubStats(username, token).catch(() => ({}));
    vars = {
      avatar_url: stats.avatar_url || '',
      bio: profile.profile_card?.bio || stats.bio || '',
      location: profile.profile_card?.location || stats.location || '',
    };
  }

  // ── VSC01 — visitor counter (increment and save)
  else if (code === 'VSC01') {
    profile.visitor_counter = profile.visitor_counter || { enabled: true, count: 0 };
    profile.visitor_counter.count = (profile.visitor_counter.count || 0) + 1;
    saveProfile(username, profile);
    vars = { count: profile.visitor_counter.count.toLocaleString() };
  }

  // ── DCS01 — Discord presence
  else if (code === 'DCS01') {
    const userId   = profile.discord?.user_id;
    const presence = userId ? await fetchDiscordPresence(userId) : null;
    vars = presence || {
      status: 'offline',
      activity_type: '',
      activity_name: '',
      activity_detail: '',
      elapsed: '',
    };
  }

  // ── SPT01 — Spotify now playing
  else if (code === 'SPT01') {
    const refreshed = await refreshSpotifyToken(profile, username);
    const sp = await fetchSpotifyNowPlaying(refreshed);
    const data = sp || {
      track: 'Not playing',
      artist: '',
      album: '',
      album_art: '',
      progress_pct: 0,
      duration: '0:00',
      elapsed: '0:00',
      is_playing: false,
    };
    // Compute progress bar pixel width (track is 272px wide)
    const BAR_W = 272;
    data.progress_w = Math.round((parseFloat(data.progress_pct) / 100) * BAR_W);
    vars = data;
  }

  sendSVG(res, inject(svg, vars));
}

// ── SVG route parser ──────────────────────────
// URL format: /svg/:username/:category/XXX00TT
// e.g. /svg/supernova0866/banner/BNR01TD
function parseSVGRoute(url) {
  const match = url.match(/^\/svg\/([^/]+)\/[^/]+\/([A-Z]{3})(\d{2})(T[DLTI])$/);
  if (!match) return null;
  return { username: match[1], code: `${match[2]}${match[3]}`, theme: match[4] };
}

// Query-string driven card codes — never stored on disk
const QUERY_DRIVEN = new Set(['CBT01', 'IMG01', 'IMG02']);

// ── Apply — regenerate all SVGs ───────────────
async function applyProfile(username, profile) {
  const generators = require('./generators');
  const userDir    = path.join(STATIC_DIR, username);
  fs.mkdirSync(userDir, { recursive: true });

  // Themes the user has enabled — fall back to just TD
  const themes  = profile.themes || ['TD'];
  const results = [];

  for (const [code, generate] of Object.entries(generators)) {
    // Skip non-function exports (ICONS, LANG_COLORS, queryDriven)
    if (typeof generate !== 'function') continue;
    // Skip query-driven cards — not stored on disk
    if (QUERY_DRIVEN.has(code)) continue;

    for (const theme of themes) {
      try {
        const svg  = generate(profile, { code, theme, isDynamic: DYNAMIC_CODES.has(code) });
        const file = path.join(userDir, `${code}${theme}.svg`);
        fs.writeFileSync(file, svg, 'utf8');
        results.push({ code: `${code}${theme}`, ok: true });
      } catch (err) {
        results.push({ code: `${code}${theme}`, ok: false, error: err.message });
      }
    }
  }
  return results;
}

// ── Router ────────────────────────────────────
async function router(req, res) {
  const url    = req.url.split('?')[0];
  const query  = querystring.parse(req.url.includes('?') ? req.url.split('?')[1] : '');
  const method = req.method;
  const session = getSession(req);

  // ── Public assets ──────────────────────────
  if (url.startsWith('/assets/') || url.endsWith('.css') || url.endsWith('.ico')) {
    serveFile(res, path.join(PUBLIC_DIR, url));
    return;
  }

  // ── Landing page ───────────────────────────
  if (url === '/' || url === '/index.html') {
    serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
    return;
  }

  // ── Preview (dev only) ─────────────────────
  if (url === '/preview') {
    serveFile(res, path.join(PUBLIC_DIR, 'preview.html'));
    return;
  }

  // ── GitHub OAuth — start ───────────────────
  if (url === '/auth/github') {
    const state = crypto.randomBytes(16).toString('hex');
    const params = querystring.stringify({
      client_id: GH_CLIENT_ID,
      redirect_uri: GH_REDIRECT,
      scope: 'read:user repo',
      state,
    });
    redirect(res, `https://github.com/login/oauth/authorize?${params}`,
      `oauth_state=${state}; HttpOnly; Path=/; SameSite=Lax; Max-Age=300`
    );
    return;
  }

  // ── GitHub OAuth — callback ────────────────
  if (url === '/auth/github/callback') {
    const { code, state } = query;
    const cookie = req.headers.cookie || '';
    const storedState = cookie.match(/oauth_state=([a-f0-9]{32})/)?.[1];

    if (!code || state !== storedState) {
      send(res, 400, 'OAuth state mismatch. Please try again.');
      return;
    }

    try {
      // Exchange code for token
      const tokenData = await fetchJSON('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_id: GH_CLIENT_ID, client_secret: GH_CLIENT_SECRET, code }),
      });

      if (!tokenData.access_token) {
        send(res, 401, 'GitHub OAuth failed — no access token returned.');
        return;
      }

      // Fetch GitHub user info
      const user = await fetchJSON('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const sid = createSession({
        username: user.login,
        access_token: tokenData.access_token,
        avatar_url: user.avatar_url,
      });

      // Profile exists? → dashboard. Otherwise → landing with limited access msg.
      const profileExists = loadProfile(user.login) !== null;
      redirect(res,
        profileExists ? '/dashboard' : '/?limited=1',
        `sid=${sid}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
      );
    } catch (err) {
      send(res, 500, `OAuth error: ${err.message}`);
    }
    return;
  }

  // ── Spotify OAuth — start ──────────────────
  if (url === '/auth/spotify') {
    if (!session) { redirect(res, '/'); return; }
    const params = querystring.stringify({
      client_id: SP_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SP_REDIRECT,
      scope: 'user-read-currently-playing user-read-recently-played',
    });
    redirect(res, `https://accounts.spotify.com/authorize?${params}`);
    return;
  }

  // ── Spotify OAuth — callback ───────────────
  if (url === '/auth/spotify/callback') {
    if (!session) { redirect(res, '/'); return; }
    const { code } = query;
    try {
      const creds = Buffer.from(`${SP_CLIENT_ID}:${SP_CLIENT_SECRET}`).toString('base64');
      const body  = querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SP_REDIRECT,
      });
      const data = await fetchJSON('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!data.access_token) { send(res, 400, 'Spotify auth failed'); return; }

      const profile = loadProfile(session.username);
      if (profile) {
        profile.spotify = {
          ...profile.spotify,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: Date.now() + data.expires_in * 1000,
        };
        saveProfile(session.username, profile);
      }
      redirect(res, '/dashboard?spotify=connected');
    } catch (err) {
      send(res, 500, `Spotify OAuth error: ${err.message}`);
    }
    return;
  }

  // ── Logout ─────────────────────────────────
  if (url === '/auth/logout') {
    destroySession(req);
    redirect(res, '/', `sid=; HttpOnly; Path=/; Max-Age=0`);
    return;
  }

  // ── SVG endpoint ───────────────────────────
  // Format: /svg/:username/:category/XXX00TT
  if (url.startsWith('/svg/')) {
    const parsed = parseSVGRoute(url);
    if (!parsed) { send(res, 400, 'Invalid SVG URL format. Expected /svg/:username/:category/XXX00TT'); return; }

    // Query-string driven cards — fully stateless, no profile lookup, no disk
    if (QUERY_DRIVEN.has(parsed.code)) {
      const { queryDriven } = require('./generators');
      const generator = queryDriven[parsed.code];
      if (!generator) { send(res, 404, `Unknown card code: ${parsed.code}`); return; }
      try {
        const svg = generator({}, { theme: parsed.theme, query });
        sendSVG(res, svg);
      } catch (err) {
        send(res, 500, `Generator error: ${err.message}`);
      }
      return;
    }

    // CBT needs buttons parsed from query keys
    // IMG needs query passed through — handled above via queryDriven
    await serveSVG(res, parsed.username, parsed.code, parsed.theme, query);
    return;
  }

  // ── Dashboard ──────────────────────────────
  if (url === '/dashboard') {
    if (!session) { redirect(res, '/'); return; }
    const profile = loadProfile(session.username);
    if (!profile) { redirect(res, '/?limited=1'); return; }
    serveFile(res, path.join(PUBLIC_DIR, 'dashboard.html'));
    return;
  }

  // ── API: get profile ───────────────────────
  if (url === '/api/profile' && method === 'GET') {
    if (!session) { sendJSON(res, 401, { error: 'Not authenticated' }); return; }
    const profile = loadProfile(session.username);
    if (!profile) { sendJSON(res, 404, { error: 'Profile not found' }); return; }
    sendJSON(res, 200, { profile, user: { username: session.username, avatar_url: session.avatar_url } });
    return;
  }

  // ── API: save profile + regenerate SVGs ────
  if (url === '/api/profile' && method === 'POST') {
    if (!session) { sendJSON(res, 401, { error: 'Not authenticated' }); return; }
    const profile = loadProfile(session.username);
    if (!profile) { sendJSON(res, 404, { error: 'Profile not found' }); return; }

    try {
      const body    = await readBody(req);
      const updated = JSON.parse(body);

      // Safety: don't allow username or spotify tokens to be overwritten via API
      updated.username        = session.username;
      updated.spotify         = { ...profile.spotify, ...updated.spotify };
      updated.visitor_counter = profile.visitor_counter; // preserve count

      saveProfile(session.username, updated);
      const results = await applyProfile(session.username, updated);
      sendJSON(res, 200, { ok: true, results });
    } catch (err) {
      sendJSON(res, 400, { error: `Failed to save: ${err.message}` });
    }
    return;
  }

  // ── API: list available icons ──────────────
  if (url === '/api/icons' && method === 'GET') {
    const iconsDir = path.join(PUBLIC_DIR, 'assets', 'icons');
    const cats     = ['software', 'languages', 'os'];
    const result   = {};
    for (const cat of cats) {
      const dir = path.join(iconsDir, cat);
      result[cat] = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', ''))
        : [];
    }
    sendJSON(res, 200, result);
    return;
  }

  // ── API: session info ─────────────────────
  if (url === '/api/me' && method === 'GET') {
    if (!session) { sendJSON(res, 401, { error: 'Not authenticated' }); return; }
    sendJSON(res, 200, { username: session.username, avatar_url: session.avatar_url });
    return;
  }

  // ── Ping — keep-alive ─────────────────────
  if (url === '/ping') {
    send(res, 200, 'pong');
    return;
  }

  // 404
  send(res, 404, 'Not found');
}

// ── Start ─────────────────────────────────────
require('./ping');

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    console.error('Unhandled error:', err);
    send(res, 500, 'Internal server error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`supernova-go-brrr running on port ${PORT}`);
  console.log(`Host: ${HOST}`);
});
