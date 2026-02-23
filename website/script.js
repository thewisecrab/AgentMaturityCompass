/* ═══════════════════════════════════════════════════════════
   AMC v2 — Interactions, Canvas Compass & Motion
   GSAP ScrollTrigger + Canvas API + Micro-interactions
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ─── Hero Canvas — Animated Compass ─── */
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let w, h, cx, cy, frame = 0;
    const particles = [];
    const PARTICLE_COUNT = 80;

    function resize() {
      w = heroCanvas.width = heroCanvas.offsetWidth;
      h = heroCanvas.height = heroCanvas.offsetHeight;
      cx = w / 2;
      cy = h / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.3 + 0.05
      });
    }

    function drawCompass(time) {
      const radius = Math.min(w, h) * 0.18;
      const pulse = Math.sin(time * 0.001) * 0.03 + 1;

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Middle ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.7 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.4 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
      ctx.stroke();

      // Tick marks
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        const inner = radius * (i % 9 === 0 ? 0.85 : 0.92) * pulse;
        const outer = radius * pulse;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.strokeStyle = i % 9 === 0 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = i % 9 === 0 ? 1.5 : 0.5;
        ctx.stroke();
      }

      // Compass needle (north)
      const needleAngle = time * 0.0003;
      const needleLen = radius * 0.65 * pulse;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(needleAngle);

      // North needle (accent color)
      const grad = ctx.createLinearGradient(0, -needleLen, 0, 0);
      grad.addColorStop(0, 'rgba(129, 140, 248, 0.6)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0.1)');
      ctx.beginPath();
      ctx.moveTo(0, -needleLen);
      ctx.lineTo(4, 0);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // South needle (dim)
      ctx.beginPath();
      ctx.moveTo(0, needleLen * 0.6);
      ctx.lineTo(3, 0);
      ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fill();

      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(129, 140, 248, 0.4)';
      ctx.fill();

      ctx.restore();

      // Glow at center
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.5);
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.03)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    }

    function drawParticles() {
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.02 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate(time) {
      ctx.clearRect(0, 0, w, h);
      if (!reduced) {
        drawParticles();
        drawCompass(time);
      }
      frame = requestAnimationFrame(animate);
    }
    if (!reduced) animate(0);
  }

  /* ─── Radar Chart (Solution section) ─── */
  const radarCanvas = document.getElementById('radarCanvas');
  if (radarCanvas) {
    const rctx = radarCanvas.getContext('2d');
    const rw = 240, rh = 240, rcx = rw / 2, rcy = rh / 2;
    const labels = ['Strategic Ops', 'Autonomy', 'Alignment', 'Governance', 'Skills'];
    const values = [0.78, 0.62, 0.85, 0.45, 0.70];
    const maxR = 90;
    let radarAnimated = false;

    function drawRadar(progress) {
      rctx.clearRect(0, 0, rw, rh);
      const sides = labels.length;

      // Grid rings
      for (let ring = 1; ring <= 4; ring++) {
        const r = (ring / 4) * maxR;
        rctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
          const x = rcx + Math.cos(angle) * r;
          const y = rcy + Math.sin(angle) * r;
          i === 0 ? rctx.moveTo(x, y) : rctx.lineTo(x, y);
        }
        rctx.strokeStyle = 'rgba(255,255,255,0.04)';
        rctx.lineWidth = 1;
        rctx.stroke();
      }

      // Axis lines
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        rctx.beginPath();
        rctx.moveTo(rcx, rcy);
        rctx.lineTo(rcx + Math.cos(angle) * maxR, rcy + Math.sin(angle) * maxR);
        rctx.strokeStyle = 'rgba(255,255,255,0.03)';
        rctx.stroke();
      }

      // Data polygon
      rctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const idx = i % sides;
        const angle = (idx / sides) * Math.PI * 2 - Math.PI / 2;
        const r = values[idx] * maxR * progress;
        const x = rcx + Math.cos(angle) * r;
        const y = rcy + Math.sin(angle) * r;
        i === 0 ? rctx.moveTo(x, y) : rctx.lineTo(x, y);
      }
      const grad = rctx.createLinearGradient(rcx - maxR, rcy - maxR, rcx + maxR, rcy + maxR);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.08)');
      rctx.fillStyle = grad;
      rctx.fill();
      rctx.strokeStyle = 'rgba(129, 140, 248, 0.5)';
      rctx.lineWidth = 1.5;
      rctx.stroke();

      // Data points
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const r = values[i] * maxR * progress;
        const x = rcx + Math.cos(angle) * r;
        const y = rcy + Math.sin(angle) * r;
        rctx.beginPath();
        rctx.arc(x, y, 3, 0, Math.PI * 2);
        rctx.fillStyle = '#818cf8';
        rctx.fill();
      }

      // Labels
      rctx.font = '500 10px Inter, sans-serif';
      rctx.fillStyle = '#6b6b80';
      rctx.textAlign = 'center';
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const x = rcx + Math.cos(angle) * (maxR + 20);
        const y = rcy + Math.sin(angle) * (maxR + 20) + 4;
        rctx.fillText(labels[i], x, y);
      }
    }

    // Animate on scroll
    const radarObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !radarAnimated) {
          radarAnimated = true;
          let start = null;
          function tick(ts) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / 1500, 1);
            const eased = 1 - Math.pow(1 - p, 4);
            drawRadar(eased);
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          radarObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    radarObs.observe(radarCanvas);
    drawRadar(0);
  }

  /* ─── Cursor glow ─── */
  const glow = document.getElementById('cursorGlow');
  if (glow && fine && !reduced) {
    let mx = 0, my = 0, gx = 0, gy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; glow.classList.add('active'); });
    document.addEventListener('mouseleave', () => glow.classList.remove('active'));
    (function anim() {
      gx += (mx - gx) * 0.04;
      gy += (my - gy) * 0.04;
      glow.style.transform = `translate(${gx - 500}px, ${gy - 500}px)`;
      requestAnimationFrame(anim);
    })();
  }

  /* ─── Glass card mouse tracking ─── */
  if (fine && !reduced) {
    document.querySelectorAll('.glass').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ─── Magnetic buttons ─── */
  if (fine && !reduced) {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.4, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  /* ─── Announcement bar ─── */
  const announceBar = document.getElementById('announceBar');
  const announceClose = document.getElementById('announceClose');
  const nav = document.getElementById('nav');
  if (announceBar && nav) {
    nav.classList.add('has-banner');
    if (announceClose) {
      announceClose.addEventListener('click', () => {
        announceBar.classList.add('hidden');
        nav.classList.remove('has-banner');
      });
    }
  }

  /* ─── Nav ─── */
  if (!reduced) {
    gsap.to(nav, { delay: 0.3, duration: 0, onComplete: () => nav.classList.add('loaded') });
  } else {
    nav.classList.add('loaded');
  }
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (!scrollTick) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY > 60;
        nav.classList.toggle('scrolled', scrolled);
        if (scrolled && announceBar) {
          announceBar.classList.add('hidden');
          nav.classList.remove('has-banner');
        }
        scrollTick = false;
      });
      scrollTick = true;
    }
  }, { passive: true });

  /* ─── Mobile menu ─── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(open));
      mobileMenu.setAttribute('aria-hidden', String(!open));
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ─── GSAP scroll reveals ─── */
  if (!reduced) {
    gsap.utils.toArray('.anim-reveal').forEach(el => {
      const delay = el.classList.contains('anim-d1') ? 0.1
                  : el.classList.contains('anim-d2') ? 0.2
                  : el.classList.contains('anim-d3') ? 0.3
                  : el.classList.contains('anim-d4') ? 0.5
                  : 0;
      gsap.to(el, {
        opacity: 1, y: 0, scale: 1, duration: 1, delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    ScrollTrigger.batch('.module-card', {
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.8, ease: 'power3.out' }),
      start: 'top 88%', once: true
    });

    ScrollTrigger.batch('.install-step', {
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }),
      start: 'top 88%', once: true
    });
  } else {
    document.querySelectorAll('.anim-reveal').forEach(el => el.classList.add('visible'));
  }

  /* ─── Terminal parallax on scroll ─── */
  if (!reduced) {
    const terminal = document.querySelector('.hero-terminal');
    if (terminal) {
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: self => {
          const p = self.progress;
          const rx = 2 - p * 5;
          const s = 1 - p * 0.08;
          const ty = p * 40;
          terminal.style.transform = `perspective(1200px) rotateX(${rx}deg) scale(${s}) translateY(${ty}px)`;
        }
      });
    }
  }

  /* ─── Counter animation ─── */
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        if (isNaN(target)) return;
        const dur = 2200;
        const start = performance.now();
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

  /* ─── Terminal typing ─── */
  const termObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.term-line').forEach(line => {
          line.style.animationDelay = (parseInt(line.dataset.delay) || 0) + 'ms';
        });
        termObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const termBody = document.getElementById('termBody');
  if (termBody) termObs.observe(termBody);

  /* ─── Bento bar fill ─── */
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.bento-bar-fill').forEach(bar => {
          const w = bar.dataset.width;
          requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = w + '%'; }));
        });
        barObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.bento').forEach(el => barObs.observe(el));

  /* ─── Smooth scroll ─── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight + 24;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();

/* ─── Copy command ─── */
function copyCmd(btn) {
  const code = btn.parentElement.querySelector('code');
  navigator.clipboard.writeText(code.textContent.trim());
  const orig = btn.textContent;
  btn.textContent = 'Copied!';
  btn.style.color = '#34d399';
  setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1800);
}
