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
    't4': '⚔️', 'sr': '🔐', 'tt': '🗝️', 'ascnd': '⬆️'
};

const RAID_NAMES = {
    't4': 'T4NM', 'sr': 'SR', 'tt': 'TT', 'ascnd': 'Ascended'
};

function getRaidDisplayName(raidName) {
    if (!raidName) return 'Unknown';
    const lower = raidName.toLowerCase();
    for (const [key, display] of Object.entries(RAID_NAMES)) {
        if (lower.includes(key)) return display;
    }
    return raidName;
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
    if (lower.includes('tt')) return 'tt';
    if (lower.includes('ascnd') || lower.includes('ascended')) return 'ascnd';
    return '';
}

function getMaxSlots(teamSize) {
    const num = parseInt(teamSize);
    return isNaN(num) ? 10 : num;
}

function getRaidRound(raidName) {
    if (!raidName) return '';
    const match = raidName.match(/[rＲ](\\d+)/i);
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
                <span class="name">${escapeHTML(r.ign)}</span>
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

    // Raid Types (total + breakdown summary)
    const typeBreakdown = document.getElementById('raid-types');
    typeBreakdown.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-icon">📊</span>
            <span class="breakdown-label">Total Raids</span>
            <span class="breakdown-value">${stats.totalRaids || 0}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-icon">✅</span>
            <span class="breakdown-label">Success Rate</span>
            <span class="breakdown-value">${stats.successRate || 0}%</span>
        </div>`;
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
    document.querySelectorAll('.stat-card, .raid-card, .member-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// Load all live data
async function init() {
    await Promise.all([
        loadHeroStats(),
        loadActiveRaids(),
        loadStats(),
        loadRoster()
    ]);
    observeCards();
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
