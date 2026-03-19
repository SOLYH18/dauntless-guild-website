// Dauntless Guild Website - Emerald Dragon Theme

// Particle Animation System
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        // Create emerald dust particles - MORE VISIBLE
        for (let i = 0; i < 70; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.8 - 0.2,
                opacity: Math.random() * 0.4 + 0.6,
                color: `rgba(110, 232, 156, ${Math.random() * 0.4 + 0.6})`,
                type: 'dust'
            });
        }
        
        // Create fire ember particles - MORE VISIBLE
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 5 + 3,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: -Math.random() * 1.5 - 0.3,
                opacity: Math.random() * 0.4 + 0.6,
                color: `rgba(255, 200, 100, ${Math.random() * 0.4 + 0.6})`,
                glow: `rgba(255, 215, 0, ${Math.random() * 0.5 + 0.5})`,
                type: 'ember'
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Reset if out of bounds
            if (p.y < -50) {
                p.y = this.canvas.height + 50;
                p.x = Math.random() * this.canvas.width;
            }
            if (p.x < -50) p.x = this.canvas.width + 50;
            if (p.x > this.canvas.width + 50) p.x = -50;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            
            // Add glow for embers
            if (p.type === 'ember') {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = p.glow;
            } else {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = p.color;
            }
            
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particles when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(13, 59, 30, 0.98)';
    } else {
        navbar.style.background = 'rgba(13, 59, 30, 0.95)';
    }
});

// Animate stats on scroll
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-card, .raid-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Dragon fire effect on mouse move near dragon
const dragon = document.querySelector('.dragon-fire');
if (dragon) {
    dragon.addEventListener('mousemove', (e) => {
        // Create burst of embers
        for (let i = 0; i < 5; i++) {
            const ember = document.createElement('div');
            ember.className = 'ember';
            ember.style.left = `${e.clientX + Math.random() * 40}px`;
            ember.style.top = `${e.clientY}px`;
            ember.style.animationDelay = `${Math.random() * 0.5}s`;
            ember.style.animationDuration = `${2 + Math.random() * 2}s`;
            document.body.appendChild(ember);
            
            setTimeout(() => ember.remove(), 4000);
        }
    });
}

console.log('🐉 Dauntless Guild Website Loaded - Emerald Dragon Theme with Particles!');
