/* ═══════════════════════════════════════════════════════════
   AMC — Interactions & Motion
   GSAP ScrollTrigger + custom cursor + magnetic buttons
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ─── Custom cursor dot ─── */
  if (fine && !reduced) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    let cx = -100, cy = -100, tx = -100, ty = -100;
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; dot.classList.add('visible'); });
    document.addEventListener('mouseleave', () => dot.classList.remove('visible'));
    (function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      dot.style.left = cx + 'px';
      dot.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('hover'));
      el.addEventListener('mouseleave', () => dot.classList.remove('hover'));
    });
  }

  /* ─── Cursor glow ─── */
  const glow = document.getElementById('cursorGlow');
  if (glow && fine && !reduced) {
    let mx = 0, my = 0, gx = 0, gy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; glow.classList.add('active'); });
    document.addEventListener('mouseleave', () => glow.classList.remove('active'));
    (function anim() {
      gx += (mx - gx) * 0.05;
      gy += (my - gy) * 0.05;
      glow.style.transform = `translate(${gx - 450}px, ${gy - 450}px)`;
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

  /* ─── Nav ─── */
  const nav = document.getElementById('nav');
  if (!reduced) {
    gsap.to(nav, { delay: 0.3, duration: 0, onComplete: () => nav.classList.add('loaded') });
  } else {
    nav.classList.add('loaded');
  }
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (!scrollTick) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
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
        opacity: 1, y: 0, scale: 1, duration: 1, delay: delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Stagger module cards
    ScrollTrigger.batch('.module-card', {
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.8, ease: 'power3.out' }),
      start: 'top 88%', once: true
    });

    // Stagger install steps
    ScrollTrigger.batch('.install-step', {
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }),
      start: 'top 88%', once: true
    });
  } else {
    document.querySelectorAll('.anim-reveal').forEach(el => el.classList.add('visible'));
  }

  /* ─── Terminal scroll depth ─── */
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
          const rx = 2 - p * 4;
          const s = 1 - p * 0.06;
          terminal.style.transform = `perspective(1200px) rotateX(${rx}deg) scale(${s})`;
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

  /* ─── Score bars ─── */
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.score-fill').forEach(bar => {
          const w = bar.dataset.width;
          bar.style.width = '0%';
          requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = w + '%'; }));
        });
        barObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  const scoreBars = document.getElementById('scoreBars');
  if (scoreBars) barObs.observe(scoreBars);

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
