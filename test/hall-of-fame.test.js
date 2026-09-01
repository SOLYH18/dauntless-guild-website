'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const start = source.indexOf('// ==================== HALL OF FAME ====================');
const end = source.indexOf('// ==================== LIGHTBOX ====================', start);
const section = source.slice(start, end);

test('Hall of Fame loads normalized monthly awards from the live backend', () => {
    assert.match(section, /fetch\(`\$\{API_BASE\}\/api\/hall-of-fame`\)/);
    assert.match(section, /HOF_DATA = Array\.isArray\(data\.months\)/);
    assert.match(section, /await res\.json\(\)/);
    assert.match(section, /renderMonth\(0\)/);
});

test('Hall of Fame no longer embeds manually maintained monthly winner data', () => {
    assert.doesNotMatch(section, /"month": "JULY 2026"/);
    assert.doesNotMatch(section, /pcg5fg7\.png/);
    assert.match(section, /Unable to load Hall of Fame/);
});

test('Hall of Fame safely supports award images and members without avatars', () => {
    assert.match(section, /a\.imageUrl/);
    assert.match(section, /a\.avatarUrl/);
    assert.match(section, /hof-award-avatar-placeholder/);
    assert.match(section, /escapeHTML\(displayName\)/);
});
