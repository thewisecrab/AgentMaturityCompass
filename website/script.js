/* ═══════════════════════════════════════════
   AMC v6 — Script
   Compass canvas, scroll reveals, demo, counters
   ═══════════════════════════════════════════ */

// ─── CURSOR GLOW ───
const cursor = document.getElementById('glowCursor');
let cursorX = 0, cursorY = 0, targetX = 0, targetY = 0;

document.addEventListener('mousemove', e => {
  targetX = e.clientX;
  targetY = e.clientY;
});

function animateCursor() {
  cursorX += (targetX - cursorX) * 0.08;
  cursorY += (targetY - cursorY) * 0.08;
  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ─── NAV SCROLL ───
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 60);
  lastScroll = y;
}, { passive: true });

// ─── COMPASS CANVAS ───
const canvas = document.getElementById('compassCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 800;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  let time = 0;

  function drawCompass() {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2;
    time += 0.003;

    // Outer rings
    for (let i = 0; i < 5; i++) {
      const r = 120 + i * 50;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(226, 169, 59, ${0.04 - i * 0.006})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Rotating tick marks
    for (let i = 0; i < 72; i++) {
      const angle = (i / 72) * Math.PI * 2 + time;
      const r1 = 340;
      const r2 = i % 9 === 0 ? 360 : 350;
      const alpha = i % 9 === 0 ? 0.12 : 0.04;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.strokeStyle = `rgba(226, 169, 59, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Compass needle (north)
    const needleAngle = -Math.PI / 2 + Math.sin(time * 0.7) * 0.05;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAngle);

    // North half (gold)
    ctx.beginPath();
    ctx.moveTo(0, -140);
    ctx.lineTo(8, 0);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, -140, 0, 0);
    grad.addColorStop(0, 'rgba(240, 192, 96, 0.6)');
    grad.addColorStop(1, 'rgba(226, 169, 59, 0.1)');
    ctx.fillStyle = grad;
    ctx.fill();

    // South half (dim)
    ctx.beginPath();
    ctx.moveTo(0, 140);
    ctx.lineTo(8, 0);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(226, 169, 59, 0.04)';
    ctx.fill();

    ctx.restore();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(226, 169, 59, 0.3)';
    ctx.fill();

    // Cardinal points
    const cardinals = ['N', 'E', 'S', 'W'];
    const cardAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    ctx.font = '12px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    cardinals.forEach((c, i) => {
      const a = cardAngles[i] + time * 0.3;
      const r = 380;
      ctx.fillStyle = 'rgba(226, 169, 59, 0.08)';
      ctx.fillText(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    });

    requestAnimationFrame(drawCompass);
  }

  drawCompass();
}

// ─── SCROLL REVEALS ───
gsap.registerPlugin(ScrollTrigger);

// Add reveal class to elements
document.querySelectorAll('.section-label, .section-title, .section-desc, .problem-card, .step, .maturity-level, .dim-card, .chain-block, .terminal, .demo-container, .footer-top').forEach(el => {
  el.classList.add('reveal');
});

// Observe
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Stagger cards
document.querySelectorAll('.problem-grid, .dims-grid').forEach(grid => {
  const cards = grid.children;
  Array.from(cards).forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });
});

// ─── COUNTER ANIMATION ───
const counters = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

function animateCounter(el, target) {
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ─── MATURITY BARS ANIMATION ───
document.querySelectorAll('.maturity-level').forEach(level => {
  ScrollTrigger.create({
    trigger: level,
    start: 'top 85%',
    onEnter: () => {
      const fill = level.querySelector('.level-fill');
      fill.style.transition = 'width 1s var(--ease)';
    }
  });
});

// ─── INTERACTIVE DEMO ───
const demoQuestions = [
  {
    text: "How clearly is your agent's mission and scope defined?",
    dim: "Strategic Operations",
    options: [
      { text: "No defined mission — it just responds to whatever comes in", score: 0 },
      { text: "There's a rough description, but it's not enforced", score: 1 },
      { text: "Documented scope with some boundary checks", score: 2 },
      { text: "Measurable goals with preflight alignment checks", score: 3 },
      { text: "Risk-tier calibrated with explicit tradeoff handling", score: 4 },
      { text: "Living context graph with automatic drift correction", score: 5 }
    ]
  },
  {
    text: "How does your agent handle unexpected errors?",
    dim: "Reliability & Safety",
    options: [
      { text: "It crashes or returns garbage", score: 0 },
      { text: "Basic try/catch, but no graceful degradation", score: 1 },
      { text: "Handles common errors, fails on edge cases", score: 2 },
      { text: "Structured error handling with fallback behaviors", score: 3 },
      { text: "Circuit breakers, retry logic, and health checks", score: 4 },
      { text: "Self-healing with automatic recovery and incident reports", score: 5 }
    ]
  },
  {
    text: "How is sensitive data protected in your agent?",
    dim: "Security & Compliance",
    options: [
      { text: "No data protection measures", score: 0 },
      { text: "Basic input sanitization", score: 1 },
      { text: "Encryption at rest, some access controls", score: 2 },
      { text: "Full encryption, audit logs, injection defense", score: 3 },
      { text: "Zero-trust architecture with DLP and anomaly detection", score: 4 },
      { text: "Cryptographic evidence chains with tamper-evident logs", score: 5 }
    ]
  },
  {
    text: "What visibility do you have into your agent's operations?",
    dim: "Observability & Cost",
    options: [
      { text: "None — it's a black box", score: 0 },
      { text: "Basic console logs", score: 1 },
      { text: "Structured logging with some metrics", score: 2 },
      { text: "Full observability: traces, metrics, dashboards", score: 3 },
      { text: "Cost tracking, performance budgets, SLO monitoring", score: 4 },
      { text: "Predictive analytics with automatic optimization", score: 5 }
    ]
  },
  {
    text: "How do you evaluate and improve your agent?",
    dim: "Evaluation & Growth",
    options: [
      { text: "We don't — ship and pray", score: 0 },
      { text: "Manual testing before releases", score: 1 },
      { text: "Some automated tests, occasional reviews", score: 2 },
      { text: "Test harness with benchmarks and regression tracking", score: 3 },
      { text: "A/B testing, user feedback loops, continuous evaluation", score: 4 },
      { text: "Self-improving with automated experiment pipelines", score: 5 }
    ]
  }
];

let currentQ = 0;
let scores = [];

function renderQuestion() {
  const q = demoQuestions[currentQ];
  document.getElementById('demoQNum').textContent = `Question ${currentQ + 1} of ${demoQuestions.length}`;
  document.getElementById('demoQText').textContent = q.text;
  document.getElementById('demoProgressBar').style.width = `${((currentQ) / demoQuestions.length) * 100}%`;

  const optionsEl = document.getElementById('demoOptions');
  optionsEl.innerHTML = '';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'demo-opt';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => selectOption(opt.score, q.dim));
    optionsEl.appendChild(btn);
  });
}

function selectOption(score, dim) {
  scores.push({ score, dim });

  if (currentQ < demoQuestions.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const avg = scores.reduce((a, b) => a + b.score, 0) / scores.length;
  const levelNames = ['Absent', 'Initial', 'Developing', 'Defined', 'Managed', 'Optimizing'];
  const levelDescs = [
    'Your agent has no structured maturity practices. Start with mission definition and basic error handling.',
    'Intent exists but isn\'t operational. Focus on documenting scope and adding basic safety measures.',
    'Partial structure in place. Strengthen consistency across sessions and add audit capabilities.',
    'Solid foundation. Your agent is repeatable and measurable. Push toward proactive controls.',
    'Advanced maturity. Focus on self-healing, predictive analytics, and continuous optimization.',
    'Exceptional. Your agent is self-correcting and continuously verified. Maintain and share your practices.'
  ];

  const level = Math.round(avg);

  document.getElementById('demoQuestion').style.display = 'none';
  const result = document.getElementById('demoResult');
  result.style.display = 'block';

  document.getElementById('resultScore').textContent = avg.toFixed(1);
  document.getElementById('resultLevel').textContent = levelNames[level];
  document.getElementById('resultDesc').textContent = levelDescs[level];

  const dimsEl = document.getElementById('resultDims');
  dimsEl.innerHTML = '';
  scores.forEach(s => {
    const div = document.createElement('div');
    div.className = 'result-dim';
    div.innerHTML = `<span class="result-dim-name">${s.dim}</span><span class="result-dim-score">${s.score}/5</span>`;
    dimsEl.appendChild(div);
  });
}

function resetDemo() {
  currentQ = 0;
  scores = [];
  document.getElementById('demoQuestion').style.display = 'block';
  document.getElementById('demoResult').style.display = 'none';
  renderQuestion();
}

// Init demo
renderQuestion();

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
