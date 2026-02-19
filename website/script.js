// === AMC Website — Interactions & Animations ===

document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const toggle = document.querySelector('.theme-toggle');
  const saved = localStorage.getItem('amc-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  toggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('amc-theme', next);
    toggle.textContent = next === 'light' ? '🌙' : '☀️';
  });

  // Mobile menu
  const menuBtn = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuBtn?.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => observer.observe(el));

  // Level bars animation
  const levelObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bars = e.target.querySelectorAll('.level-bar');
        bars.forEach(bar => { bar.style.width = bar.dataset.width; });
        levelObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  const levels = document.querySelector('.levels');
  if (levels) levelObserver.observe(levels);

  // Copy button
  const copyBtn = document.querySelector('.copy-btn');
  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText('npm i -g agent-maturity-compass').then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    });
  });

  // Counter animation for hero stats
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseInt(e.target.dataset.target);
        const suffix = e.target.dataset.suffix || '';
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          e.target.textContent = current + suffix;
        }, 30);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  // Nav background on scroll
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
});
