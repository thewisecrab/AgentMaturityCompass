/* ═══════════════════════════════════════════
   AMC v8 — Matrix Green Terminal
   Matrix rain, counters, scroll reveals, level bars
   ═══════════════════════════════════════════ */

// ─── MATRIX RAIN ───
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const chars = 'AMCアイウエオカキクケコ01234567890.:{}<>[];/\\|=+-_*&^%$#@!~';
const fontSize = 14;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff41';
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(char, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
  requestAnimationFrame(drawMatrix);
}
drawMatrix();

window.addEventListener('resize', () => {
  columns = Math.floor(canvas.width / fontSize);
  drops = Array(columns).fill(1);
});

// ─── NAV SCROLL ───
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 60
    ? 'rgba(0, 255, 65, 0.12)'
    : 'rgba(0, 255, 65, 0.06)';
}, { passive: true });

// ─── COUNTER ANIMATION ───
function animateCounter(el, target) {
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ─── SCROLL REVEALS ───
gsap.registerPlugin(ScrollTrigger);

// Mark elements for reveal
document.querySelectorAll('.sec-tag, .sec h2, .sec-sub, .plat-card, .dim, .lvl, .tier, .uc, .terminal, .inflation-demo, .arch-diagram, .install-alt').forEach(el => {
  el.classList.add('reveal');
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('vis');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// Stagger delays
document.querySelectorAll('.plat-card').forEach((c, i) => { c.style.transitionDelay = `${i * 0.06}s`; });
document.querySelectorAll('.dim').forEach((d, i) => { d.style.transitionDelay = `${i * 0.08}s`; });
document.querySelectorAll('.lvl').forEach((l, i) => { l.style.transitionDelay = `${i * 0.1}s`; });
document.querySelectorAll('.uc').forEach((u, i) => { u.style.transitionDelay = `${i * 0.08}s`; });
document.querySelectorAll('.tier').forEach((t, i) => { t.style.transitionDelay = `${i * 0.08}s`; });

// ─── COUNTERS ───
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target, parseInt(e.target.dataset.count));
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.proof-num').forEach(n => counterObs.observe(n));

// ─── LEVEL BARS ───
const levelObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const fill = e.target.querySelector('.lvl-fill');
      if (fill) {
        const tw = getComputedStyle(fill).getPropertyValue('--tw');
        fill.style.width = tw;
      }
      levelObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.lvl').forEach(l => levelObs.observe(l));

// ─── HERO PARALLAX ───
gsap.to('.hero-content', {
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1
  },
  y: -80,
  opacity: 0
});

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});
