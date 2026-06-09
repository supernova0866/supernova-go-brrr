// ping.js — keep-alive pinger for Render
// Handles self-ping and mutual partner ping
// The /ping route itself lives in server.js
// Run alongside server.js — just require('./ping') at the bottom of server.js

// Self-ping every 10 minutes
const PORT = process.env.PORT || 3000;
setInterval(() => {
    fetch(`http://localhost:${PORT}/ping`)
        .then(() => console.log('Self-ping successful'))
        .catch(err => console.error('Self-ping failed:', err));
}, 10 * 60 * 1000);

// Ping partner Render service every 5 minutes
const PARTNER_URL = process.env.PARTNER_PING_URL;
if (PARTNER_URL) {
    setInterval(() => {
        fetch(`${PARTNER_URL}/ping`)
            .then(() => console.log(`Pinged partner at ${PARTNER_URL}`))
            .catch(err => console.error('Partner ping failed:', err));
    }, 5 * 60 * 1000);
} else {
    console.warn('PARTNER_PING_URL not set — mutual ping disabled.');
}
