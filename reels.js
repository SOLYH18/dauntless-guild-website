(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.ReelsEmbed = api;
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
    const TWITCH_CLIP_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
    const TWITCH_VIDEO_ID_PATTERN = /^\d+$/;
    const HOSTNAME_PATTERN = /^(?=.{1,253}$)(?:localhost|[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?)$/;

    function getReelEmbedUrl(video, hostname) {
        if (!video || typeof video !== 'object') return null;

        if (video.platform === 'youtube') {
            if (!YOUTUBE_ID_PATTERN.test(video.videoId || '')) return null;
            return `https://www.youtube-nocookie.com/embed/${video.videoId}`;
        }

        if (video.platform !== 'twitch' || !HOSTNAME_PATTERN.test(hostname || '')) return null;
        const parent = encodeURIComponent(hostname);

        if (video.videoType === 'clip' && TWITCH_CLIP_ID_PATTERN.test(video.videoId || '')) {
            return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(video.videoId)}&parent=${parent}&autoplay=false`;
        }

        if (video.videoType === 'video' && TWITCH_VIDEO_ID_PATTERN.test(video.videoId || '')) {
            return `https://player.twitch.tv/?video=v${video.videoId}&parent=${parent}&autoplay=false`;
        }

        return null;
    }

    function getReelPlatformLabel(platform) {
        if (platform === 'youtube') return 'YouTube';
        if (platform === 'twitch') return 'Twitch';
        return 'Video';
    }

    return {
        getReelEmbedUrl,
        getReelPlatformLabel,
    };
}));
