// generators/index.js
// Maps every card code to its generator function
// Used by server.js applyProfile() to regenerate all SVGs on Apply

'use strict';

const bannerTyping    = require('./banner-typing');
const bannerHero      = require('./banner-hero');
const bannerWave      = require('./banner-wave');
const githubStats     = require('./github-stats');
const streak          = require('./streak');
const topLanguages    = require('./top-languages');
const devSetup        = require('./dev-setup');
const profileCard     = require('./profile-card');
const currentlyWorking = require('./currently-working');
const socialLinks     = require('./social-links');
const visitorCounter  = require('./visitor-counter');
const discordPresence = require('./discord-presence');
const spotifyPlaying  = require('./spotify-playing');
const badges          = require('./badges');

// Query-string driven — not stored on disk, excluded from Apply
// const customButtons = require('./custom-buttons');
// const imageBanner   = require('./image-banner');
// const imageGrid     = require('./image-grid');

// Map: card code (without theme) → generator function
// generator(profile, { theme, code, isDynamic }) → SVG string
module.exports = {
  // Banners
  BNR01: (profile, opts) => bannerTyping(profile, opts),
  BNR02: (profile, opts) => bannerHero(profile, opts),
  BNR03: (profile, opts) => bannerWave(profile, opts),

  // Stats
  GHS01: (profile, opts) => githubStats(profile, opts),
  STK01: (profile, opts) => streak(profile, opts),
  TPL01: (profile, opts) => topLanguages(profile, opts),

  // Dev Setup — variant determined by code number
  DVS01: (profile, opts) => devSetup(profile, { ...opts, code: 'DVS01' }),
  DVS02: (profile, opts) => devSetup(profile, { ...opts, code: 'DVS02' }),
  DVS03: (profile, opts) => devSetup(profile, { ...opts, code: 'DVS03' }),

  // Profile
  PRF01: (profile, opts) => profileCard(profile, opts),
  CWO01: (profile, opts) => currentlyWorking(profile, opts),

  // Social
  SCL01: (profile, opts) => socialLinks(profile, opts),
  VSC01: (profile, opts) => visitorCounter(profile, opts),

  // Badges
  BGS01: (profile, opts) => badges(profile, opts),

  // Discord + Spotify
  DCS01: (profile, opts) => discordPresence(profile, opts),
  SPT01: (profile, opts) => spotifyPlaying(profile, opts),
};

// Export icon registry for /api/icons endpoint
module.exports.ICONS     = devSetup.ICONS;
module.exports.LANG_COLORS = topLanguages.LANG_COLORS;

// Query-string driven cards — exported separately for router use
module.exports.queryDriven = {
  CBT01: require('./custom-buttons'),
  IMG01: require('./image-banner'),
  IMG02: require('./image-grid'),
};
