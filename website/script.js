(function(){
'use strict';

// ─── LENIS SMOOTH SCROLL (same as OSE) ───
var lenis;
function initLenis(){
  if(typeof Lenis==='undefined')return;
  lenis=new Lenis({duration:1.2,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},orientation:'vertical',smoothWheel:true});
  function raf(time){lenis.raf(time);requestAnimationFrame(raf)}
  requestAnimationFrame(raf);
  // Sync with ScrollTrigger
  if(typeof ScrollTrigger!=='undefined'){
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(function(time){lenis.raf(time*1000)});
    gsap.ticker.lagSmoothing(0);
  }
}

// ─── GSAP SCROLL REVEALS (same stack as OSE) ───
function initScrollReveals(){
  if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined')return;
  gsap.registerPlugin(ScrollTrigger);

  // Fade up
  gsap.utils.toArray('.fade-up').forEach(function(el,i){
    var parent=el.closest('.card-grid,.domains-grid,.persona-grid,.stats-row,.trust-grid,.pricing-grid,.diff-grid,.faq-list');
    var stagger=parent?0.08:0;
    var delay=0;
    if(el.classList.contains('fd1'))delay=0.1;
    if(el.classList.contains('fd2'))delay=0.2;
    if(el.classList.contains('fd3'))delay=0.3;
    if(el.classList.contains('fd4'))delay=0.4;
    if(el.classList.contains('fd5'))delay=0.5;
    gsap.fromTo(el,{opacity:0,y:40},{opacity:1,y:0,duration:0.9,delay:delay,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none none'}});
  });

  // Fade left
  gsap.utils.toArray('.fade-left').forEach(function(el){
    gsap.fromTo(el,{opacity:0,x:-40},{opacity:1,x:0,duration:0.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none none'}});
  });

  // Fade right
  gsap.utils.toArray('.fade-right').forEach(function(el){
    var delay=0;
    if(el.classList.contains('fd1'))delay=0.1;
    if(el.classList.contains('fd2'))delay=0.2;
    if(el.classList.contains('fd3'))delay=0.3;
    gsap.fromTo(el,{opacity:0,x:40},{opacity:1,x:0,duration:0.9,delay:delay,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none none'}});
  });

  // Big number parallax
  var bigNum=document.querySelector('.big-number-value');
  if(bigNum){
    gsap.fromTo(bigNum,{scale:0.7,opacity:0},{scale:1,opacity:1,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:bigNum,start:'top 90%',toggleActions:'play none none none'}});
  }

  // Nav scroll behavior
  var nav=document.querySelector('.nav');
  ScrollTrigger.create({start:'top -60',onUpdate:function(self){
    if(self.progress>0)nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }});

  // Scroll progress bar
  var bar=document.querySelector('.scroll-bar');
  if(bar){
    gsap.to(bar,{scaleX:1,ease:'none',scrollTrigger:{scrub:0.3}});
  }
}

// ─── FAQ ACCORDION ───
function initFAQ(){
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click',function(){
      var item=btn.closest('.faq-item');
      var was=item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){
        o.classList.remove('open');
        o.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!was){item.classList.add('open');btn.setAttribute('aria-expanded','true')}
    });
  });
}

// ─── SMOOTH SCROLL ANCHORS ───
function initAnchors(){
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href');if(id==='#')return;
      var target=document.querySelector(id);if(!target)return;
      e.preventDefault();
      if(lenis)lenis.scrollTo(target,{offset:-80});
      else target.scrollIntoView({behavior:'smooth',block:'start'});
      // Close mobile nav
      document.querySelector('.nav-mobile')?.classList.remove('open');
    });
  });
}

// ─── MOBILE NAV ───
function initMobileNav(){
  var btn=document.querySelector('.nav-hamburger');
  var mob=document.querySelector('.nav-mobile');
  if(!btn||!mob)return;
  btn.addEventListener('click',function(){mob.classList.toggle('open')});
}

// ─── TERMINAL ANIMATION ───
function initTerminal(){
  var body=document.getElementById('terminal-body');
  if(!body)return;
  var lines=[
    {t:'<span style="color:#4AEF79">$</span> amc quickscore --adapter openai',d:0},
    {t:'',d:400},
    {t:'<span style="color:#7394A4">⠋ Loading adapter: openai-agents-sdk</span>',d:600},
    {t:'<span style="color:#7394A4">⠙ Running 138 diagnostics...</span>',d:800},
    {t:'<span style="color:#7394A4">⠹ Evaluating execution evidence...</span>',d:600},
    {t:'',d:300},
    {t:'<span style="color:#4AEF79">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>',d:200},
    {t:'<span style="color:#FFF;font-weight:700">  AMC TRUST SCORE</span>',d:100},
    {t:'<span style="color:#4AEF79">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>',d:200},
    {t:'',d:100},
    {t:'  Overall:    <span style="color:#4AEF79;font-weight:700">L3.2</span>  ████████████░░░░  <span style="color:#4AEF79">64%</span>',d:150},
    {t:'  Security:   <span style="color:#4AEF79;font-weight:700">L4.0</span>  ██████████████░░  <span style="color:#4AEF79">80%</span>',d:150},
    {t:'  Governance: <span style="color:#febc2e;font-weight:700">L2.8</span>  ████████████░░░░  <span style="color:#febc2e">56%</span>',d:150},
    {t:'  Reliability:<span style="color:#4AEF79;font-weight:700"> L3.5</span>  █████████████░░░  <span style="color:#4AEF79">70%</span>',d:150},
    {t:'  Observability:<span style="color:#febc2e;font-weight:700">L2.5</span> ██████████░░░░░░  <span style="color:#febc2e">50%</span>',d:150},
    {t:'',d:100},
    {t:'  Diagnostics: <span style="color:#FFF">138</span> run  |  Evidence: <span style="color:#4AEF79">observed</span>  |  Time: <span style="color:#FFF">1m 47s</span>',d:200},
    {t:'  Gaps found:  <span style="color:#febc2e;font-weight:700">12</span>   |  Fixes generated: <span style="color:#4AEF79;font-weight:700">12</span>',d:200},
    {t:'',d:100},
    {t:'<span style="color:#4AEF79">✓</span> Report: .amc/reports/latest.md',d:150},
    {t:'<span style="color:#4AEF79">✓</span> Guardrails: .amc/guardrails/',d:150},
    {t:'<span style="color:#4AEF79">✓</span> Signed: Ed25519 (0b20f1fa...)',d:150},
  ];
  var idx=0;var total=0;
  function show(){
    if(idx>=lines.length)return;
    var line=lines[idx];
    total+=line.d;
    setTimeout(function(){
      var div=document.createElement('div');
      div.innerHTML=line.t||'&nbsp;';
      body.appendChild(div);
      if(body.scrollHeight>body.clientHeight)body.scrollTop=body.scrollHeight;
    },total);
    idx++;show();
  }

  // Only start when visible
  var started=false;
  var obs=new IntersectionObserver(function(entries){
    if(entries[0].isIntersecting&&!started){started=true;show();obs.disconnect()}
  },{threshold:0.3});
  obs.observe(body);
}

// ─── INIT ───
function init(){
  initLenis();
  initScrollReveals();
  initFAQ();
  initAnchors();
  initMobileNav();
  initTerminal();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();

// Re-init GSAP after fonts load
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(typeof ScrollTrigger!=='undefined')ScrollTrigger.refresh()});

})();
