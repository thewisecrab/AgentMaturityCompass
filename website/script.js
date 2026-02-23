/* ═══════════════════════════════════════════════════════════
   AMC v5 — Education → Ownership → Commitment
   Clean motion. No jargon. Gold warmth.
   ═══════════════════════════════════════════════════════════ */
(function(){
'use strict';
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
const FP = matchMedia('(pointer:fine)').matches;
gsap.registerPlugin(ScrollTrigger);

/* ─── TEXT SPLITTING ─── */
document.querySelectorAll('[data-word]').forEach(w => {
  const text = w.textContent;
  const isGold = w.classList.contains('gold');
  w.innerHTML = '';
  [...text].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    if (isGold) s.style.color = '#f0c060';
    w.appendChild(s);
  });
});

if (!RM) {
  gsap.to('.hero h1 .char', { y: 0, opacity: 1, duration: .65, stagger: .022, ease: 'power4.out', delay: .3 });
  gsap.to('.hero-sub', { opacity: 1, y: 0, duration: .8, delay: .9, ease: 'power3.out' });
  gsap.to('.hero-btns', { opacity: 1, y: 0, duration: .8, delay: 1.05, ease: 'power3.out' });
  gsap.to('.float-term', { opacity: 1, y: 0, duration: 1, delay: 1.3, ease: 'power3.out' });
} else {
  document.querySelectorAll('.char').forEach(c => { c.style.opacity = 1; c.style.transform = 'none'; });
  document.querySelectorAll('.hero-sub,.hero-btns,.float-term').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; });
}

/* ─── NAV ─── */
const nav = document.getElementById('nav');
if (!RM) {
  gsap.set(nav, { autoAlpha: 0, y: -16 });
  gsap.to(nav, { autoAlpha: 1, y: 0, duration: .7, delay: .1, ease: 'power3.out' });
}
let raf = false;
window.addEventListener('scroll', () => {
  if (!raf) { requestAnimationFrame(() => { nav.classList.toggle('scrolled', scrollY > 50); raf = false; }); raf = true; }
}, { passive: true });

const tog = document.getElementById('navToggle');
const mm = document.getElementById('mobMenu');
if (tog && mm) {
  tog.addEventListener('click', () => {
    const o = mm.classList.toggle('open');
    tog.classList.toggle('on');
    tog.setAttribute('aria-expanded', o);
    mm.setAttribute('aria-hidden', !o);
  });
  mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mm.classList.remove('open'); tog.classList.remove('on');
  }));
}

/* ─── CURSOR ─── */
const cur = document.getElementById('cursor');
if (cur && FP && !RM) {
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.classList.add('on'); });
  document.addEventListener('mouseleave', () => cur.classList.remove('on'));
  (function loop() {
    cx += (mx - cx) * .04; cy += (my - cy) * .04;
    cur.style.transform = `translate(${cx - 300}px,${cy - 300}px)`;
    requestAnimationFrame(loop);
  })();
}

/* ─── MAGNETIC BUTTONS ─── */
if (FP && !RM) {
  document.querySelectorAll('.btn-gold,.btn-ghost').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width/2) * .12, y: (e.clientY - r.top - r.height/2) * .12, duration: .3, ease: 'power3.out' });
    });
    b.addEventListener('mouseleave', () => {
      gsap.to(b, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.4)' });
    });
  });
}

/* ─── SCROLL REVEALS ─── */
if (!RM) {
  gsap.utils.toArray('.reveal').forEach(el => {
    const d = el.classList.contains('rd1') ? .1 : el.classList.contains('rd2') ? .2 : el.classList.contains('rd3') ? .3 : 0;
    gsap.to(el, { opacity: 1, y: 0, duration: .85, delay: d, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
}

/* ─── TERMINAL TYPING ─── */
const tb = document.getElementById('termBody');
if (tb) {
  const obs = new IntersectionObserver(e => {
    e.forEach(en => {
      if (en.isIntersecting) {
        en.target.querySelectorAll('.tl').forEach(l => {
          setTimeout(() => l.classList.add('show'), +(l.dataset.d) || 0);
        });
        obs.unobserve(en.target);
      }
    });
  }, { threshold: .3 });
  obs.observe(tb);
}

/* ─── TERMINAL PARALLAX ─── */
if (!RM) {
  const ft = document.querySelector('.float-term .term');
  if (ft) {
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5,
      onUpdate: s => {
        const p = s.progress;
        ft.style.transform = `rotateX(${3 - p * 6}deg) scale(${1 - p * .06}) translateY(${p * 30}px)`;
      }
    });
  }
}

/* ─── MATURITY SCALE HOVER ─── */
const scale = document.getElementById('maturityScale');
if (scale) {
  const levels = scale.querySelectorAll('.scale-level');
  const names = ['Absent — No capability exists', 'Initial — Ad-hoc, reactive', 'Developing — Repeatable processes', 'Defined — Standardized, documented', 'Managed — Measured and controlled', 'Optimizing — Continuous improvement'];
  levels.forEach((l, i) => {
    l.title = names[i];
    l.addEventListener('mouseenter', () => {
      levels.forEach((ll, j) => {
        ll.style.opacity = j <= i ? '1' : '.3';
        ll.style.transform = j === i ? 'translateY(-4px) scale(1.05)' : '';
      });
    });
  });
  scale.addEventListener('mouseleave', () => {
    levels.forEach(l => { l.style.opacity = '1'; l.style.transform = ''; });
  });
}

/* ─── INTERACTIVE DEMO ─── */
const demoBody = document.querySelector('.demo-body');
if (demoBody) {
  const scoreEl = document.getElementById('demoScore');
  const barEl = document.getElementById('demoBar');
  const questions = demoBody.querySelectorAll('.demo-q');
  const scores = {};
  const maturityNames = ['Absent', 'Initial', 'Developing', 'Defined', 'Managed', 'Optimizing'];

  demoBody.addEventListener('click', e => {
    const btn = e.target.closest('.demo-lvl');
    if (!btn) return;
    const q = btn.closest('.demo-q');
    const dim = q.dataset.dim;
    const val = +btn.dataset.v;

    q.querySelectorAll('.demo-lvl').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    scores[dim] = val;

    const total = questions.length;
    const sum = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxPossible = total * 5;
    const pct = Math.round((sum / maxPossible) * 100);
    const avgLevel = Math.round(sum / Object.keys(scores).length);
    const maturity = maturityNames[Math.min(avgLevel, 5)];

    gsap.to({ v: parseFloat(scoreEl.textContent) || 0 }, {
      v: pct, duration: .6, ease: 'power2.out',
      onUpdate: function() { scoreEl.textContent = Math.round(this.targets()[0].v) + '/100'; }
    });
    gsap.to(barEl, { width: pct + '%', duration: .8, ease: 'power3.out' });
  });
}

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const t = document.querySelector(id);
    if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' }); }
  });
});

})();

/* Copy */
function copyCmd(b) {
  const c = b.parentElement.querySelector('code');
  navigator.clipboard.writeText(c.textContent.trim());
  b.textContent = 'Copied!'; b.style.color = '#34d399';
  setTimeout(() => { b.textContent = 'Copy'; b.style.color = ''; }, 1500);
}
