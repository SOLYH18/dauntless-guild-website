const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('Raid Breakdown renders live summary values and NMCOLO', () => {
    assert.match(script, /setText\('summary-total-raids',/);
    assert.match(script, /setText\('summary-success-rate',/);
    assert.match(script, /label: 'NMCOLO', value: stats\.breakdown\.nmColo/);
});

test('Raid Breakdown HTML does not ship stale hardcoded summary values', () => {
    assert.doesNotMatch(html, /id="summary-total-raids">[\d,]+</);
    assert.doesNotMatch(html, /id="summary-success-rate">\d+%</);
});
