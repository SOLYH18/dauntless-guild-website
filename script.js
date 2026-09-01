// Dauntless Guild Website - Live Discord Integration
// ============================================================
// CONFIG: Change this to your bot's Railway URL after deploy
// ============================================================
const API_BASE = 'https://dauntless-flyff-bot-production.up.railway.app';

// ==================== API HELPERS ====================

async function fetchAPI(path) {
    try {
        const res = await fetch(`${API_BASE}${path}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(`API ${path} failed:`, err);
        return null;
    }
}

function setText(id, text, fallback) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text || fallback || '—';
}

function showError(containerId, message) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<li class="error">⚠️ ${message}</li>`;
}

// ==================== HERO STATS ====================

async function loadHeroStats() {
    const [stats, members] = await Promise.all([
        fetchAPI('/api/stats'),
        fetchAPI('/api/members')
    ]);

    if (stats) {
        setText('hero-total-raids', stats.totalRaids, '—');
        setText('hero-success-rate', stats.successRate + '%', '—');
    } else {
        setText('hero-total-raids', null, '—');
        setText('hero-success-rate', null, '—');
    }

    if (members) {
        setText('hero-members', members.memberCount, '—');
    } else {
        setText('hero-members', null, '—');
    }
}

// ==================== ACTIVE RAIDS ====================

const RAID_ICONS = {
    'colo': '🕋', 'colo-3': '🕋', 'colo-5': '🕋', 'colo-7': '🕋', 'colo-10': '🕋',
    't4': '⚔️', 'sr': '🔐', 'tt': '🗝️', 'torment': '🗝️', 'ascnd': '⬆️'
};

function getRaidDisplayName(raidName) {
    if (!raidName) return 'Unknown';
    // Raid names are like "⚔・dntl-t4・r2193" — strip emoji prefix and round suffix
    const cleaned = raidName.replace(/^[^\w]+/, ''); // remove leading emoji + separator
    const parts = cleaned.split('・');
    // Return middle part (lineup name) if available, otherwise full cleaned name
    if (parts.length >= 2) {
        const last = parts[parts.length - 1];
        // Remove round suffix if present (・r123, r123)
        const withoutRound = parts.slice(0, -1).join('・');
        return /^r\d+$/i.test(last) ? withoutRound : cleaned;
    }
    return cleaned;
}

function getRaidIcon(raidName) {
    if (!raidName) return '⚔️';
    const lower = raidName.toLowerCase();
    for (const [key, icon] of Object.entries(RAID_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return '⚔️';
}

function getRaidTypeClass(raidName) {
    if (!raidName) return '';
    const lower = raidName.toLowerCase();
    if (lower.includes('colo')) return 'colo';
    if (lower.includes('t4')) return 't4';
    if (lower.includes('sr')) return 'sr';
    if (lower.includes('tt') || lower.includes('torment')) return 'tt';
    if (lower.includes('ascnd') || lower.includes('ascended')) return 'ascnd';
    return '';
}

function getMaxSlots(teamSize) {
    const num = parseInt(teamSize);
    return isNaN(num) ? 10 : num;
}

function getRaidRound(raidName) {
    if (!raidName) return '';
    const match = raidName.match(/[rＲ](\d+)/i);
    return match ? `#${match[1]}` : '';
}

async function loadActiveRaids() {
    const container = document.getElementById('raids-container');
    const data = await fetchAPI('/api/raids');

    if (!data || data.active.length === 0) {
        container.innerHTML = `
            <div class="raid-card no-raids">
                <div class="raid-header">
                    <span class="raid-icon">💤</span>
                    <span class="raid-type">No Active Raids</span>
                </div>
                <p style="color: var(--text-secondary); text-align: center; padding: 1rem;">
                    Check back soon or join our Discord for lineup announcements!
                </p>
            </div>`;
        return;
    }

    container.innerHTML = data.active.map(raid => {
        const icon = getRaidIcon(raid.name);
        const displayName = getRaidDisplayName(raid.name);
        const round = getRaidRound(raid.name);
        const typeClass = getRaidTypeClass(raid.name);
        const maxSlots = getMaxSlots(raid.teamSize);
        const fillPercent = maxSlots > 0 ? Math.round((raid.memberCount / maxSlots) * 100) : 0;
        const locked = raid.locked ? 'LOCKED' : 'OPEN';
        const privateTag = raid.isPrivate ? ' 🔒' : '';

        let infoHtml = '';
        if (raid.date) {
            infoHtml += `<span class="raid-date">📅 ${raid.date}</span>`;
        }
        if (raid.time) {
            infoHtml += `<span class="raid-time">🕐 ${raid.time}</span>`;
        }
        if (raid.partyName) {
            infoHtml += `<span class="raid-party">👥 ${raid.partyName}</span>`;
        }

        return `
            <div class="raid-card ${typeClass}">
                <div class="raid-header">
                    <span class="raid-icon">${icon}</span>
                    <span class="raid-type">${displayName}${privateTag}</span>
                    ${round ? `<span class="raid-number">${round}</span>` : ''}
                </div>
                ${infoHtml ? `<div class="raid-info">${infoHtml}</div>` : ''}
                <div class="raid-status">
                    <span class="slots">${raid.memberCount}/${maxSlots} filled</span>
                    <span class="status ${locked ? 'locked' : 'open'}">${locked}</span>
                </div>
                <div class="raid-progress">
                    <div class="progress-bar" style="width: ${fillPercent}%"></div>
                </div>
            </div>`;
    }).join('');
}

// ==================== STATS ====================

async function loadStats() {
    const stats = await fetchAPI('/api/stats');
    if (!stats) {
        showError('top-raiders', 'Could not load stats');
        showError('raid-breakdown', 'Could not load stats');
        return;
    }

    // Top Raiders
    const topList = document.getElementById('top-raiders');
    if (stats.topRaiders && stats.topRaiders.length > 0) {
        topList.innerHTML = stats.topRaiders.map((r, i) => `
            <li>
                <span class="rank${i === 0 ? ' crown' : ''}">${i === 0 ? '👑' : i + 1}</span>
                ${r.avatarUrl ? `<img src="${escapeHTML(r.avatarUrl)}" alt="" class="raider-avatar" loading="lazy">` : ''}
                <span class="name">${escapeHTML(r.displayName || r.username || r.ign)}</span>
                <span class="score">${r.count} raids</span>
            </li>`).join('');
    } else {
        topList.innerHTML = '<li class="empty">No raid data yet</li>';
    }

    // Raid Breakdown
    const breakdown = document.getElementById('raid-breakdown');
    const breaks = [
        { icon: '🕋', label: 'COLO', value: stats.breakdown.colo },
        { icon: '⚔️', label: 'T4NM', value: stats.breakdown.t4 },
        { icon: '🔐', label: 'SR', value: stats.breakdown.sr },
        { icon: '🗝️', label: 'TT', value: stats.breakdown.tt },
        { icon: '⬆️', label: 'ASCND', value: stats.breakdown.ascnd }
    ];
    breakdown.innerHTML = breaks.map(b => `
        <div class="breakdown-item">
            <span class="breakdown-icon">${b.icon}</span>
            <span class="breakdown-label">${b.label}</span>
            <span class="breakdown-value">${b.value || 0}</span>
        </div>`).join('');
}

// Load all live data
// ==================== CLOVER LEADERBOARD ====================

async function loadClovers() {
    const leaders = await fetchAPI('/api/clovers');
    const list = document.getElementById('clover-leaders');
    if (!leaders || leaders.length === 0) {
        list.innerHTML = '<li class="empty">No clovers earned yet</li>';
        return;
    }
    list.innerHTML = leaders.map((c, i) => `
        <li>
            <span class="rank${i === 0 ? ' crown' : ''}">${i === 0 ? '👑' : i + 1}</span>
            ${c.avatarUrl ? `<img src="${escapeHTML(c.avatarUrl)}" alt="" class="raider-avatar" loading="lazy">` : ''}
            <span class="name">${escapeHTML(c.displayName || c.username)}</span>
            <span class="score clovers">${c.clovers}🍀</span>
            ${c.streak > 0 ? `<span class="streak" title="${c.streak}-day streak">🔥${c.streak}</span>` : ''}
        </li>`).join('');
}

// ==================== ROSTER ====================

async function loadRoster() {
    const roster = await fetchAPI('/api/roster');
    if (!roster) {
        showError('admins-list', 'Could not load roster');
        showError('raid-leaders-list', 'Could not load roster');
        return;
    }

    const adminsList = document.getElementById('admins-list');
    if (roster.admins && roster.admins.length > 0) {
        adminsList.innerHTML = roster.admins.map(a => `
            <div class="member-card">
                <img src="${escapeHTML(a.avatarUrl)}" alt="${escapeHTML(a.displayName)}" class="member-avatar" loading="lazy">
                <span class="member-name">${escapeHTML(a.displayName)}</span>
            </div>`).join('');
    } else {
        adminsList.innerHTML = '<p class="empty">No admins found</p>';
    }

    const leadersList = document.getElementById('raid-leaders-list');
    if (roster.raidLeaders && roster.raidLeaders.length > 0) {
        leadersList.innerHTML = roster.raidLeaders.map(l => `
            <div class="member-card">
                <img src="${escapeHTML(l.avatarUrl)}" alt="${escapeHTML(l.displayName)}" class="member-avatar" loading="lazy">
                <span class="member-name">${escapeHTML(l.displayName)}</span>
            </div>`).join('');
    } else {
        leadersList.innerHTML = '<p class="empty">No raid leaders found</p>';
    }
}

// ==================== UTILS ====================

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== INIT ====================

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Animate cards on scroll
const observerOptions = { threshold: 0.3 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

function observeCards() {
    document.querySelectorAll('.stat-card, .raid-card, .member-card, .hof-award-card, .rc-card, .gallery-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// ==================== HALL OF FAME ====================

let HOF_DATA = [];

async function loadHallOfFame() {
    const container = document.getElementById('hof-display');
    const selector = document.getElementById('hof-selector');
    if (!container || !selector) return;

    container.innerHTML = '<p class="loading">Loading Hall of Fame...</p>';
    selector.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE}/api/hall-of-fame`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        HOF_DATA = Array.isArray(data.months)
            ? data.months.filter(month => month && Array.isArray(month.awards))
            : [];

        if (HOF_DATA.length === 0) {
            container.innerHTML = '<p class="empty">No Hall of Fame data yet</p>';
            return;
        }

        selector.innerHTML = HOF_DATA.map((month, index) =>
            `<button class="hof-month-btn${index === 0 ? ' active' : ''}" data-idx="${index}">${escapeHTML(month.month)}</button>`
        ).join('');

        selector.querySelectorAll('.hof-month-btn').forEach(button => {
            button.addEventListener('click', () => {
                selector.querySelectorAll('.hof-month-btn').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                renderMonth(Number.parseInt(button.dataset.idx, 10));
            });
        });

        renderMonth(0);
    } catch (error) {
        console.error('Hall of Fame load failed:', error);
        container.innerHTML = '<p class="empty">Unable to load Hall of Fame right now.</p>';
    }
}

function renderMonth(idx) {
    const container = document.getElementById('hof-display');
    const month = HOF_DATA[idx];
    if (!container || !month) return;

    if (month.awards.length === 0) {
        container.innerHTML = '<p class="empty">No awards posted for this month.</p>';
        return;
    }

    container.innerHTML = month.awards.map(a => {
        const displayName = a.displayName || a.username || 'Unknown Member';
        const avatar = a.avatarUrl
            ? `<img src="${escapeHTML(a.avatarUrl)}" alt="${escapeHTML(displayName)}" class="hof-award-avatar" loading="lazy">`
            : '<div class="hof-award-avatar hof-award-avatar-placeholder" aria-hidden="true">?</div>';
        const awardImage = a.imageUrl
            ? `<img src="${escapeHTML(a.imageUrl)}" alt="${escapeHTML(a.award)} award card" class="hof-stat-image" data-lightbox-url="${escapeHTML(a.imageUrl)}" loading="lazy">`
            : '';

        return `
            <div class="hof-award-card">
                ${avatar}
                <div class="hof-award-label">${escapeHTML(a.award)}</div>
                <div class="hof-award-name">${escapeHTML(displayName)}</div>
                ${awardImage}
            </div>
        `;
    }).join('');

    container.querySelectorAll('[data-lightbox-url]').forEach(image => {
        image.addEventListener('click', () => openLightbox(image.dataset.lightboxUrl));
    });

    setTimeout(observeCards, 100);
}

// ==================== LIGHTBOX ====================

function openLightbox(src) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    lb.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const lb = document.getElementById('lightbox');
    if (lb) {
        lb.addEventListener('click', () => lb.classList.remove('active'));
    }
});

// ==================== RAID COUNTS ====================

let rcData = [];

const RC_ICONS = {
    t4: { icon: '⚔️', label: 'T4' },
    colo: { icon: '🕋', label: 'COLO' },
    sr: { icon: '🔐', label: 'SR' },
    tt: { icon: '🗝️', label: 'TT' },
    ascnd: { icon: '⬆️', label: 'ASCND' }
};

async function loadRaidCounts() {
    const container = document.getElementById('rc-display');
    const selector = document.getElementById('rc-selector');
    if (!container || !selector) return;

    try {
        const res = await fetch(`${API_BASE}/api/raidcounts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        rcData = await res.json();

        if (!rcData || rcData.length === 0) {
            container.innerHTML = '<p class="empty">No raid count data yet</p>';
            return;
        }

        // Build month selector buttons
        selector.innerHTML = rcData.map((m, i) =>
            `<button class="rc-month-btn${i === 0 ? ' active' : ''}" data-idx="${i}">${escapeHTML(m.month)}</button>`
        ).join('');

        selector.querySelectorAll('.rc-month-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selector.querySelectorAll('.rc-month-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderRaidCount(parseInt(btn.dataset.idx));
            });
        });

        // Show latest month
        renderRaidCount(0);

    } catch (err) {
        console.error('Raid counts load error:', err);
        container.innerHTML = '<p class="error">⚠️ Could not load raid counts</p>';
    }
}

function renderRaidCount(idx) {
    const container = document.getElementById('rc-display');
    const month = rcData[idx];
    if (!month) return;

    const types = ['t4', 'colo', 'sr', 'tt', 'ascnd'];

    container.innerHTML = `
        <div class="rc-card">
            <div class="rc-total">${month.total.toLocaleString()}</div>
            <div class="rc-total-label">Total Raids</div>
            <div class="rc-breakdown">
                ${types.map(t => `
                    <div class="rc-type">
                        <div class="rc-type-icon">${RC_ICONS[t].icon}</div>
                        <div class="rc-type-count">${month[t].toLocaleString()}</div>
                        <div class="rc-type-label">${RC_ICONS[t].label}</div>
                    </div>
                `).join('')}
            </div>
        </div>`;

    setTimeout(observeCards, 100);
}

// ==================== GALLERY ====================

let currentGalleryChannel = '';
const GALLERY_CHANNELS = {
    '': { name: 'All', emoji: '📷' },
    '1487104672333566172': { name: 'T4', emoji: '⚔️' },
    '1487104672614322311': { name: 'COLO', emoji: '🕋' },
    '1520222453001883659': { name: 'ASCND', emoji: '⬆️' },
    '1487104673143066810': { name: 'TT', emoji: '🗝️' },
    '1491642076331507781': { name: 'Fit Check', emoji: '👗' }
};

async function loadGallery(channelId) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = '<p class="loading">Loading gallery...</p>';

    const params = channelId ? `?channel=${channelId}&limit=24` : '?limit=24';
    const data = await fetchAPI(`/api/gallery${params}`);

    if (!data || !data.images || data.images.length === 0) {
        grid.innerHTML = '<p class="gallery-empty">No images found yet. Post your run party photos in the history channels!</p>';
        return;
    }

    grid.innerHTML = data.images.map(img => `
        <div class="gallery-card" onclick="window.open('${escapeHTML(img.messageUrl)}', '_blank')">
            <img src="${escapeHTML(img.imageUrl)}" alt="Run party photo" class="gallery-card-image" loading="lazy">
            <div class="gallery-card-info">
                ${img.author && img.author.avatarUrl ? `<img src="${escapeHTML(img.author.avatarUrl)}" alt="" class="gallery-card-avatar" loading="lazy">` : ''}
                <span class="gallery-card-author">${escapeHTML(img.author ? (img.author.displayName || img.author.username) : 'Unknown')}</span>
                <span class="gallery-card-channel">${img.channelEmoji || ''} ${img.channelName}</span>
            </div>
        </div>
    `).join('');

    // Cards visible immediately — no scroll animation for gallery
}

function setupGalleryFilters() {
    const filterContainer = document.getElementById('gallery-filters');
    if (!filterContainer) return;

    filterContainer.querySelectorAll('.gallery-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterContainer.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGalleryChannel = btn.dataset.channel || '';
            loadGallery(currentGalleryChannel);
        });
    });

    // Load initial (all)
    loadGallery('');
}

// ==================== REELS ====================

function getReelCaption(content) {
    if (!content) return '';
    return content.replace(/https?:\/\/[^\s<>"']+/gi, '').trim();
}

async function loadReels() {
    const grid = document.getElementById('reels-grid');
    if (!grid) return;

    grid.innerHTML = '<p class="loading">Loading reels...</p>';

    const data = await fetchAPI('/api/reels?limit=24');

    if (!data || !data.videos || data.videos.length === 0) {
        grid.innerHTML = '<p class="reels-empty">No YouTube or Twitch links yet. Post one in the reels channel!</p>';
        return;
    }

    const cards = data.videos.map(v => {
        const embedUrl = window.ReelsEmbed
            ? window.ReelsEmbed.getReelEmbedUrl(v, window.location.hostname)
            : null;
        if (!embedUrl) return '';

        const platformLabel = window.ReelsEmbed.getReelPlatformLabel(v.platform);
        const caption = getReelCaption(v.content);
        return `
            <div class="reels-card">
                <iframe
                    src="${escapeHTML(embedUrl)}"
                    class="reels-video reels-embed"
                    title="${escapeHTML(platformLabel)} reel"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen></iframe>
                ${caption ? `<p class="reels-card-caption">${escapeHTML(caption)}</p>` : ''}
                <div class="reels-card-info">
                    ${v.author && v.author.avatarUrl ? `<img src="${escapeHTML(v.author.avatarUrl)}" alt="" class="reels-card-avatar" loading="lazy">` : ''}
                    <span class="reels-card-author">${escapeHTML(v.author ? (v.author.displayName || v.author.username) : 'Unknown')}</span>
                    <a class="reels-card-link" href="${escapeHTML(v.videoUrl)}" target="_blank" rel="noopener">${escapeHTML(platformLabel)}</a>
                    <a class="reels-card-link" href="${escapeHTML(v.messageUrl)}" target="_blank" rel="noopener">Discord</a>
                </div>
            </div>
        `;
    }).filter(Boolean);

    grid.innerHTML = cards.length > 0
        ? cards.join('')
        : '<p class="reels-empty">No playable YouTube or Twitch links found.</p>';
}

// Load all live data
async function init() {
    await Promise.all([
        loadHeroStats(),
        loadActiveRaids(),
        loadStats(),
        loadClovers(),
        loadRoster(),
        loadHallOfFame(),
        loadRaidCounts(),
        loadReels()
    ]);
    observeCards();
    setupGalleryFilters();
    console.log('🐉 Dauntless Guild Website - Live data loaded');
}

// Refresh every 5 minutes
init();
setInterval(init, 5 * 60 * 1000);

// ==================== EMERALD GLITTER PARTICLES ====================

(function() {
    const canvas = document.getElementById('glitter-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const MAX = 80;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            size: Math.random() * 4 + 2,
            speedY: Math.random() * 1 + 0.3,
            speedX: (Math.random() - 0.5) * 0.8,
            opacity: Math.random() * 0.5 + 0.3,
            pulse: Math.random() * Math.PI * 2,
            color: Math.random() < 0.3 ? '#ffd700' : '#50c878'
        };
    }

    // Pre-fill
    for (let i = 0; i < MAX; i++) {
        const p = createParticle();
        p.y = Math.random() * canvas.height;
        particles.push(p);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.pulse + performance.now() * 0.001) * 0.3;
            p.opacity = 0.2 + Math.sin(p.pulse + performance.now() * 0.002) * 0.15;

            if (p.y > canvas.height + 10) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.fill();

            // Glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity * 0.2;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Maintain count
        while (particles.length < MAX) particles.push(createParticle());

        requestAnimationFrame(animate);
    }

    animate();
})();