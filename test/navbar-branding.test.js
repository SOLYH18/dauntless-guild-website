'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const asset = path.join(root, 'assets', 'insanity-mmorpg.webp');

test('navbar displays the supplied Insanity MMORPG wordmark beneath DAUNTLESS', () => {
    assert.match(html, /class="nav-brand-copy"[\s\S]*class="guild-name">DAUNTLESS<\/span>[\s\S]*assets\/insanity-mmorpg\.webp/);
    assert.match(html, /alt="Insanity MMORPG"/);
    assert.equal(fs.existsSync(asset), true);
    assert.ok(fs.statSync(asset).size > 0);
});

test('wordmark preserves its ratio and scales at desktop, tablet, and mobile widths', () => {
    assert.match(css, /\.nav-brand-copy\s*{[\s\S]*flex-direction:\s*column/);
    assert.match(css, /\.game-wordmark\s*{[\s\S]*width:\s*132px;[\s\S]*height:\s*auto;/);
    assert.match(css, /@media \(max-width: 1024px\)[\s\S]*\.game-wordmark\s*{\s*width:\s*102px;/);
    assert.match(css, /@media \(max-width: 480px\)[\s\S]*\.game-wordmark\s*{\s*width:\s*84px;/);
});
