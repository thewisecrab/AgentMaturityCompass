/* AMC v11 — Matrix Terminal Script */

// ─── MATRIX RAIN ───
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);
const chars = 'AMCアイウエオ01234567890.:{}<>[];/\\|=+-_*&^%';
const fontSize = 14;
let columns, drops;
function initDrops() { columns = Math.floor(canvas.width / fontSize); drops = Array(columns).fill(1); }
initDrops(); window.addEventListener('resize', initDrops);
function drawMatrix() {
  ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff41'; ctx.font = fontSize + 'px monospace';
  for (let i = 0; i < drops.length; i++) {
    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
  requestAnimationFrame(drawMatrix);
}
drawMatrix();

// ─── GSAP ───
gsap.registerPlugin(ScrollTrigger);
gsap.to('.hero-content', { scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }, y: -100, opacity: 0 });

// ─── SCROLL REVEALS ───
const revealEls = '.sec-tag, .sec h2, .sec-sub, .plat-card, .dim-item, .lvl, .tier, .uc, .terminal, .install-alt, .trust-tiers, .p-card, .flow-step, .atk, .chain-block, .doc-card, .compare, .problem-cards, .sub-heading, .tier-intro, .dim-visual, .mission-wrap, .oss-stats, .oss-links, .attack-grid';
document.querySelectorAll(revealEls).forEach(el => el.classList.add('reveal'));
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Stagger delays
const stagger = (sel, delay) => document.querySelectorAll(sel).forEach((el, i) => { el.style.transitionDelay = `${i * delay}s`; });
stagger('.plat-card', 0.05); stagger('.dim-item', 0.06); stagger('.lvl', 0.08);
stagger('.uc', 0.06); stagger('.tier', 0.06); stagger('.p-card', 0.08);
stagger('.atk', 0.04); stagger('.flow-step', 0.1); stagger('.chain-block', 0.1);
stagger('.doc-card', 0.04);

// ─── COUNTERS ───
function animateNum(el, target) {
  const dur = 2000, start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateNum(e.target, parseInt(e.target.dataset.count)); cObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.proof-num, .oss-num').forEach(n => cObs.observe(n));

// ─── TIER BARS ───
const tierObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const fill = e.target.querySelector('.tier-fill');
      if (fill) fill.style.width = getComputedStyle(fill).getPropertyValue('--tw');
      tierObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.tier').forEach(t => tierObs.observe(t));

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
