'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const reelsStart = script.indexOf('async function loadReels()');
const reelsEnd = script.indexOf('\n// Load all live data', reelsStart);
const loadReels = script.slice(reelsStart, reelsEnd);

test('Guild Reels loads the embed helper before the main website script', () => {
    assert.ok(index.indexOf('<script src="reels.js"></script>') < index.indexOf('<script src="script.js"></script>'));
});

test('Guild Reels renders safe YouTube/Twitch iframes and source links', () => {
    assert.match(loadReels, /ReelsEmbed\.getReelEmbedUrl/);
    assert.match(loadReels, /window\.location\.hostname/);
    assert.match(loadReels, /<iframe/);
    assert.match(loadReels, /allowfullscreen/);
    assert.match(loadReels, /v\.videoUrl/);
    assert.match(loadReels, /v\.messageUrl/);
    assert.doesNotMatch(loadReels, /<video src=/);
});
