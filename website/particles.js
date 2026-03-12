/* AMC v5 — Atmospheric particles. Subtle. OSE-inspired. */
(function(){
  'use strict';
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var isMobile = window.innerWidth < 768;
  var COUNT = isMobile ? 60 : 120;
  var W, H, particles = [], raf, scrollY = 0, heroH = 0;
  var ACCENT = [74, 239, 121];
  var WHITE = [255, 255, 255];

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    heroH = document.querySelector('.hero')?.offsetHeight || H;
  }

  function init() {
    resize();
    particles = [];
    for (var i = 0; i < COUNT; i++) {
      var isAccent = Math.random() > 0.85;
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        size: isAccent ? 1.5 + Math.random() * 1.5 : 0.8 + Math.random(),
        opacity: isAccent ? 0.3 + Math.random() * 0.3 : 0.06 + Math.random() * 0.12,
        color: isAccent ? ACCENT : WHITE,
        seed: Math.random() * Math.PI * 2
      });
    }
    loop();
  }

  function update(now) {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx + Math.sin(now * 0.0003 + p.seed) * 0.15;
      p.y += p.vy + Math.cos(now * 0.0004 + p.seed) * 0.1;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    }
  }

  function render() {
    var fade = Math.max(0, 1 - scrollY / (heroH * 0.6));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (fade <= 0) return;
    ctx.globalAlpha = fade;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (p.opacity < 0.02) continue;
      // Glow for accent particles
      if (p.color === ACCENT && p.opacity > 0.2) {
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + (p.opacity * 0.3) + ')');
        g.addColorStop(1, 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + p.opacity + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop() {
    var now = performance.now();
    update(now);
    render();
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('scroll', function(){ scrollY = window.scrollY; }, {passive: true});
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  init();
})();
