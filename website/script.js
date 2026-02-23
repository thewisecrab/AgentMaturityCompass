/* AMC v14 — Bulletproof rendering + GSAP progressive enhancement */

// ─── MATRIX RAIN ───
const canvas = document.getElementById('matrix');
if (canvas) {
  const ctx = canvas.getContext('2d');
  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resizeCanvas(); window.addEventListener('resize', resizeCanvas);
  const chars = 'AMC01234567890.:{}<>[];/\\|=+-_*&^%$#@!';
  const fontSize = 14;
  let columns, drops;
  function initDrops() { columns = Math.floor(canvas.width / fontSize); drops = Array(columns).fill(1); }
  initDrops(); window.addEventListener('resize', initDrops);
  (function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41'; ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(drawMatrix);
  })();
}

// ─── GSAP CHECK ───
if (typeof gsap === 'undefined') { console.warn('GSAP not loaded'); }
else {
  gsap.registerPlugin(ScrollTrigger);
  if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

  // ─── HERO (immediate, no scroll trigger) ───
  gsap.from('.hero-tag', { y: 20, opacity: 0, duration: 0.6, delay: 0.2 });
  gsap.from('.h1-line', { y: 60, opacity: 0, duration: 0.8, stagger: 0.12, delay: 0.4 });
  gsap.from('.hero-sub', { y: 20, opacity: 0, duration: 0.6, delay: 0.9 });
  gsap.from('.hero-ctas', { y: 20, opacity: 0, duration: 0.6, delay: 1.1 });
  gsap.from('.proof-item', { y: 30, opacity: 0, duration: 0.5, stagger: 0.08, delay: 1.3 });
  gsap.from('.proof-sep', { scaleY: 0, opacity: 0, duration: 0.3, stagger: 0.08, delay: 1.3 });

  // Hero counters — animate after delay
  setTimeout(function() {
    document.querySelectorAll('.proof-num').forEach(function(el) {
      var target = parseInt(el.dataset.count) || 0;
      var obj = { val: 0 };
      gsap.to(obj, { val: target, duration: 2, ease: 'power2.out', onUpdate: function() { el.textContent = Math.round(obj.val); } });
    });
  }, 1500);

  // ─── SCROLL REVEALS — simple, reliable ───
  function scrollReveal(selector, props, triggerSelector) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var trigger = triggerSelector ? document.querySelector(triggerSelector) : els[0];
    if (!trigger) return;
    gsap.from(els, Object.assign({
      opacity: 0, y: 40, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: trigger, start: 'top 88%', toggleActions: 'play none none none' }
    }, props));
  }

  // Section tags + headings
  document.querySelectorAll('.sec-tag').forEach(function(el) {
    gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }, x: -20, opacity: 0, duration: 0.5 });
  });
  document.querySelectorAll('.sec h2').forEach(function(el) {
    gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }, y: 40, opacity: 0, duration: 0.7 });
  });
  document.querySelectorAll('.sec-sub').forEach(function(el) {
    gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }, y: 20, opacity: 0, duration: 0.6, delay: 0.1 });
  });

  // Compare
  scrollReveal('.compare-bad', { x: -40, y: 0 }, '.compare');
  scrollReveal('.compare-good', { x: 40, y: 0 }, '.compare');
  scrollReveal('.compare-vs', { scale: 0, y: 0, ease: 'back.out(2)', delay: 0.3 }, '.compare');

  // Problem cards
  scrollReveal('.p-card', { stagger: 0.1 }, '.problem-cards');

  // Flow
  scrollReveal('.flow-step', { stagger: 0.12 }, '.flow');
  scrollReveal('.flow-arrow', { scale: 0, y: 0, stagger: 0.12, delay: 0.2, ease: 'back.out(2)' }, '.flow');

  // Trust tiers
  scrollReveal('.tier', { x: -20, y: 0, stagger: 0.06 }, '.trust-tiers');
  document.querySelectorAll('.tier-fill').forEach(function(fill) {
    ScrollTrigger.create({
      trigger: fill.closest('.tier'), start: 'top 90%', once: true,
      onEnter: function() {
        var tw = getComputedStyle(fill).getPropertyValue('--tw');
        if (tw) fill.style.width = tw;
      }
    });
  });

  // Platform cards
  scrollReveal('.plat-card', { stagger: 0.06 }, '.platform-grid');

  // Radar
  if (document.querySelector('.radar-data')) {
    gsap.from('.radar-data', {
      scrollTrigger: { trigger: '.dim-visual', start: 'top 85%', toggleActions: 'play none none none' },
      scale: 0, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.6)', transformOrigin: '150px 150px'
    });
  }
  scrollReveal('.dim-item', { x: 20, y: 0, stagger: 0.06 }, '.dim-list');

  // Maturity levels
  document.querySelectorAll('.lvl').forEach(function(lvl, i) {
    gsap.from(lvl, {
      scrollTrigger: { trigger: lvl, start: 'top 92%', toggleActions: 'play none none none' },
      x: -20, opacity: 0, duration: 0.4, delay: i * 0.05
    });
    var fill = lvl.querySelector('.lvl-fill');
    if (fill) {
      ScrollTrigger.create({
        trigger: lvl, start: 'top 92%', once: true,
        onEnter: function() {
          var tw = getComputedStyle(fill).getPropertyValue('--tw');
          if (tw) fill.style.width = tw;
        }
      });
    }
  });

  // Attack grid
  scrollReveal('.atk', { y: 20, stagger: 0.04 }, '.attack-grid');

  // Use cases
  scrollReveal('.uc', { stagger: 0.08 }, '.uc-grid');

  // Evidence chain
  scrollReveal('.chain-block', { y: 30, stagger: 0.1 }, '.chain');
  scrollReveal('.chain-link', { scale: 0, y: 0, stagger: 0.1, delay: 0.15, ease: 'back.out(2)' }, '.chain');

  // Terminal
  scrollReveal('.terminal', { y: 20 }, '.terminal');

  // Doc cards
  scrollReveal('.doc-card', { y: 30, stagger: 0.04 }, '.docs-grid');

  // Mission
  if (document.querySelector('.mission-icon')) {
    gsap.from('.mission-icon', {
      scrollTrigger: { trigger: '.mission-wrap', start: 'top 85%', toggleActions: 'play none none none' },
      scale: 0, rotation: -180, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.6)'
    });
  }
  scrollReveal('.mission-text', { y: 20 }, '.mission-wrap');

  // OSS stats
  scrollReveal('.oss-stat', { y: 30, stagger: 0.06 }, '.oss-stats');

  // OSS counters
  document.querySelectorAll('.oss-num').forEach(function(el) {
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: function() {
        var target = parseInt(el.dataset.count) || 0;
        var obj = { val: 0 };
        gsap.to(obj, { val: target, duration: 2, ease: 'power2.out', onUpdate: function() { el.textContent = Math.round(obj.val); } });
      }
    });
  });

  // ─── MAGNETIC BUTTONS ───
  document.querySelectorAll('.btn-green, .btn-dim').forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.12, y: y * 0.12, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', function() {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // ─── NAV AUTO-HIDE ───
  var lastScroll = 0;
  ScrollTrigger.create({
    onUpdate: function(self) {
      var nav = document.getElementById('nav');
      var scroll = self.scroll();
      if (scroll > 200 && scroll > lastScroll) {
        gsap.to(nav, { y: -80, duration: 0.3 });
      } else {
        gsap.to(nav, { y: 0, duration: 0.3 });
      }
      lastScroll = scroll;
    }
  });

  // ─── SCROLL PROGRESS BAR ───
  var bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:#00ff41;z-index:9999;width:0;box-shadow:0 0 10px rgba(0,255,65,0.5)';
  document.body.appendChild(bar);
  gsap.to(bar, { width: '100%', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

  // ─── SMOOTH SCROLL ───
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var href = a.getAttribute('href');
      if (href === '#') return;
      var t = document.querySelector(href);
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─── CARD TILT ───
  document.querySelectorAll('.plat-card, .uc, .doc-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, { rotateY: x * 5, rotateX: -y * 5, duration: 0.3, transformPerspective: 800 });
    });
    card.addEventListener('mouseleave', function() {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // ─── TERMINAL GLOW ───
  gsap.to('.terminal', { boxShadow: '0 0 80px rgba(0,255,65,0.06)', duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
}

// ─── CURSOR GLOW ───
var glow = document.getElementById('cursorGlow');
if (glow && window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', function(e) {
    glow.style.transform = 'translate(' + (e.clientX - 200) + 'px,' + (e.clientY - 200) + 'px)';
  });
}
