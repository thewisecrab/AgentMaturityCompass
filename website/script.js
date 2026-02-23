/* AMC v9 — Matrix Terminal Script */

// ─── MATRIX RAIN ───
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const chars = 'AMCアイウエオ01234567890.:{}<>[];/\\|=+-_*&^%';
const fontSize = 14;
let columns, drops;

function initDrops() {
  columns = Math.floor(canvas.width / fontSize);
  drops = Array(columns).fill(1);
}
initDrops();
window.addEventListener('resize', initDrops);

function drawMatrix() {
  ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff41';
  ctx.font = fontSize + 'px monospace';
  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(char, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
  requestAnimationFrame(drawMatrix);
}
drawMatrix();

// ─── GSAP + SCROLL ───
gsap.registerPlugin(ScrollTrigger);

// Hero parallax
gsap.to('.hero-content', {
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  y: -100, opacity: 0
});

// ─── SCROLL REVEALS ───
document.querySelectorAll('.sec-tag, .sec h2, .sec-sub, .plat-card, .dim, .lvl, .tier, .uc, .terminal, .inflation-demo, .arch-diagram, .install-alt, .trust-tiers, .p-card, .ev-step, .atk, .atk-terminal, .int-item, .comply-card, .oss-stats, .oss-links, .sub-heading, .tier-intro, .atk-note, .evidence-flow').forEach(el => {
  el.classList.add('reveal');
});

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Stagger
document.querySelectorAll('.plat-card').forEach((c, i) => { c.style.transitionDelay = `${i * 0.05}s`; });
document.querySelectorAll('.dim').forEach((d, i) => { d.style.transitionDelay = `${i * 0.06}s`; });
document.querySelectorAll('.lvl').forEach((l, i) => { l.style.transitionDelay = `${i * 0.08}s`; });
document.querySelectorAll('.uc').forEach((u, i) => { u.style.transitionDelay = `${i * 0.06}s`; });
document.querySelectorAll('.tier').forEach((t, i) => { t.style.transitionDelay = `${i * 0.06}s`; });
document.querySelectorAll('.p-card').forEach((c, i) => { c.style.transitionDelay = `${i * 0.08}s`; });
document.querySelectorAll('.atk').forEach((a, i) => { a.style.transitionDelay = `${i * 0.04}s`; });
document.querySelectorAll('.ev-step').forEach((e, i) => { e.style.transitionDelay = `${i * 0.1}s`; });
document.querySelectorAll('.int-item').forEach((e, i) => { e.style.transitionDelay = `${i * 0.05}s`; });
document.querySelectorAll('.comply-card').forEach((c, i) => { c.style.transitionDelay = `${i * 0.08}s`; });

// ─── COUNTERS ───
function animateNum(el, target) {
  const dur = 2000;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateNum(e.target, parseInt(e.target.dataset.count));
      cObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.proof-num').forEach(n => cObs.observe(n));
document.querySelectorAll('.oss-num').forEach(n => cObs.observe(n));

// ─── INFLATION BARS ───
const infObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.inflation-fill').forEach(fill => {
        const w = fill.style.getPropertyValue('--w');
        fill.style.width = w;
      });
      infObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.inflation-demo').forEach(d => infObs.observe(d));

// ─── LEVEL BARS ───
const lvlObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const fill = e.target.querySelector('.lvl-fill');
      if (fill) fill.style.width = getComputedStyle(fill).getPropertyValue('--tw');
      lvlObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.lvl').forEach(l => lvlObs.observe(l));

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});
