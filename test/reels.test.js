'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { getReelEmbedUrl, getReelPlatformLabel } = require('../reels');

test('builds privacy-enhanced YouTube embeds from validated IDs', () => {
    assert.equal(
        getReelEmbedUrl({ platform: 'youtube', videoType: 'video', videoId: 'dQw4w9WgXcQ' }, 'solyh18.github.io'),
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    );
    assert.equal(getReelEmbedUrl({ platform: 'youtube', videoId: '<script>' }, 'solyh18.github.io'), null);
});

test('builds Twitch clip embeds with the current website hostname as parent', () => {
    assert.equal(
        getReelEmbedUrl({ platform: 'twitch', videoType: 'clip', videoId: 'FancyClipSlug' }, 'solyh18.github.io'),
        'https://clips.twitch.tv/embed?clip=FancyClipSlug&parent=solyh18.github.io&autoplay=false'
    );
});

test('builds Twitch VOD embeds and rejects invalid parent hostnames', () => {
    assert.equal(
        getReelEmbedUrl({ platform: 'twitch', videoType: 'video', videoId: '123456789' }, 'dauntless-guild.netlify.app'),
        'https://player.twitch.tv/?video=v123456789&parent=dauntless-guild.netlify.app&autoplay=false'
    );
    assert.equal(
        getReelEmbedUrl({ platform: 'twitch', videoType: 'video', videoId: '123456789' }, 'bad.example.com/?x='),
        null
    );
});

test('returns concise labels for supported platforms', () => {
    assert.equal(getReelPlatformLabel('youtube'), 'YouTube');
    assert.equal(getReelPlatformLabel('twitch'), 'Twitch');
    assert.equal(getReelPlatformLabel('unknown'), 'Video');
});
