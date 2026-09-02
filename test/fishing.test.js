'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const cloverId = '1536609295658123358';

test('Fishing is a complete navigable section with live dashboard targets', () => {
    assert.match(html, /href="#fishing"/);
    assert.match(html, /<section id="fishing"/);
    for (const id of ['fishing-summary', 'fishing-leaderboard', 'fishing-rare-catches', 'fishing-baits', 'fishing-tiers']) {
        assert.match(html, new RegExp(`id="${id}"`));
    }
});

test('Fishing loads the public API and renders every dashboard area', () => {
    assert.match(script, /fetchAPI\('\/api\/fishing'\)/);
    assert.match(script, /fishingSummary\.caughtThisMonth/);
    assert.match(script, /fishingLeaders\.map/);
    assert.match(script, /fishingRares\.map/);
    assert.match(script, /fishingBaits\.map/);
    assert.match(script, /fishingTiers\.map/);
    assert.match(script, /fishingNumber/);
    assert.match(script, /Promise\.allSettled/);
    assert.match(script, /loadFishing\(\)/);
});

test('The website uses the Dauntless custom Clover image instead of the Unicode clover', () => {
    assert.match(html, new RegExp(cloverId));
    assert.match(script, new RegExp(cloverId));
    assert.doesNotMatch(html, /🍀/);
    assert.doesNotMatch(script, /🍀/);
    assert.match(css, /\.clover-emoji/);
});

test('Fishing layouts have desktop, tablet, and mobile responsive rules', () => {
    assert.match(css, /\.fishing-live-grid\s*\{/);
    assert.match(css, /@media \(max-width: 1024px\)[\s\S]*\.fishing-summary/);
    assert.match(css, /@media \(max-width: 480px\)[\s\S]*\.fishing-tier-table thead/);
    assert.match(css, /\.fishing-tier-table td::before/);
});
