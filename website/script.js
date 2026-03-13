(function(){
'use strict';

// ─── GSAP SCROLL REVEALS — fast, no lag ───
function initReveals(){
  if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined')return;
  gsap.registerPlugin(ScrollTrigger);

  // Instant reveal — no stagger lag, just fade in fast
  gsap.utils.toArray('.gs').forEach(function(el){
    gsap.to(el,{opacity:1,y:0,duration:0.45,ease:'power2.out',
      scrollTrigger:{trigger:el,start:'top 95%',toggleActions:'play none none none'}
    });
  });

  // Nav background on scroll
  var nav=document.querySelector('.nav');
  ScrollTrigger.create({start:'top -60',onUpdate:function(self){
    nav.classList.toggle('scrolled',self.progress>0);
  }});

  // Big number scale
  var bigNum=document.querySelector('.big-number-value');
  if(bigNum){
    gsap.fromTo(bigNum,{scale:0.6},{scale:1,duration:0.8,ease:'power2.out',scrollTrigger:{trigger:bigNum,start:'top 90%'}});
  }
}

// ─── PRODUCT TERMINAL SHOWCASE (OSE/QT-inspired) ───
var PRODUCTS=[
  {name:'amc score',title:'Score',headline:'Score trust before you ship',summary:'Evidence-weighted scoring across live execution behavior instead of brochure claims.',badges:['138 diagnostics','L0-L5 maturity','2 min baseline'],info:[{label:'what it does',title:'Calculates the trust baseline',text:'Finds maturity gaps across governance, security, reliability, cost, and state.'},{label:'why it matters',title:'Kills documentation inflation',text:'Observed evidence carries full weight. Self-reported evidence is capped.'},{label:'output',title:'Actionable trust report',text:'Ships a scored report, signed evidence bundle, and remediation targets.'}],panels:[
    {title:'Latency',kicker:'execution monitor',body:'anthropic/opus-4-6 .......... 241ms\nopenai/gpt-5.4 ............. 186ms\ngemini/3.1-pro ............. 214ms\nopenclaw relay ............. 119ms\ncache hit ratio ............ 50%',foot:'Optimized for fast evidence collection and low-friction runtime scoring.'},
    {title:'Coverage',kicker:'diagnostic matrix',body:'governance .................. 28\nsecurity .................... 31\nreliability ................. 24\ncost ......................... 19\nstate portability ........... 36',foot:'Maps score depth across the full trust surface instead of a toy checklist.'},
    {title:'Execution',kicker:'scoring pipeline',body:'1  ingest live run traces\n2  weight observed evidence\n3  compare against maturity rubric\n4  emit signed remediation set\n5  publish trust report',foot:'Turns agent behavior into an auditable trust baseline in one pass.'},
    {title:'Safeguard',kicker:'evidence controls',body:'self-report cap ............ 0.4x\nobserved execution ......... 1.0x\nsigned receipt chain ....... on\napproval gates ............. optional\nmerkle ledger .............. verified',foot:'Prevents polished documentation from outranking real-world execution evidence.'}
  ]},
  {name:'amc shield',title:'Shield',headline:'Attack your agent before attackers do',summary:'Runs adversarial packs against prompt injection, leakage, memory poisoning, and sycophancy.',badges:['86 assurance packs','adversarial probes','guardrail output'],info:[{label:'what it does',title:'Pressure-tests the runtime',text:'Executes attack scenarios against your actual prompt, tool, and memory surface.'},{label:'why it matters',title:'Finds brittle defenses fast',text:'One missed path can turn a polished demo into a production incident.'},{label:'output',title:'Pack report + guardrails',text:'Returns failing probes, exploit traces, and generated mitigation configs.'}],panels:[
    {title:'Injection',kicker:'adversarial pack',body:'pair jailbreaks ............ blocked
promptware payloads ........ blocked
indirect web injection ..... blocked
encoded prompt chain ....... blocked
memory poisoning ........... blocked',foot:'Directly pressure-tests real attack paths instead of relying on static policy claims.'},
    {title:'Leakage',kicker:'exfiltration probes',body:'tool output leak ........... warned
base64 pii path ............ found
clipboard exfiltration ..... clean
secret fetch chain ......... clean
network callback ........... blocked',foot:'Surfaces the exact place sensitive data can still slip through.'},
    {title:'Behavior',kicker:'alignment check',body:'sycophancy score ........... pass
over-compliance ............ pass
role confusion ............. pass
authority spoofing ......... pass
escalation drift ........... pass',foot:'Checks whether the runtime stays firm under manipulation and pressure.'},
    {title:'Output',kicker:'guardrail generation',body:'pack status ................ warn
mitigation file ............ generated
regression replay .......... ready
trace bundle ............... saved
review gate ................ enabled',foot:'Generates a concrete fix path the team can ship immediately.'}
  ]},
  {name:'amc enforce',title:'Enforce',headline:'Wrap agent actions in policy',summary:'Approval gates, scoped permissions, and runtime controls for sensitive operations.',badges:['policy engine','step-up auth','budget controls'],info:[{label:'what it does',title:'Constrains dangerous actions',text:'Puts hard rules around delete, send, deploy, spend, and prod access.'},{label:'why it matters',title:'Trust without enforcement is theater',text:'Policies must bite at runtime, not live as dead docs in a repo.'},{label:'output',title:'Enforced runtime config',text:'Applies governance rules that your operator and auditor can inspect.'}],lines:[
    {title:'Policy',kicker:'runtime profile',body:'profile .................... strict
sensitive actions .......... gated
scope limits ............... /prod read-only
budget ceiling ............. $2.50
session controls ........... active',foot:'Turns governance into runtime behavior instead of a dead checklist.'},
    {title:'Approvals',kicker:'human checkpoints',body:'delete requests ............ approval
send actions ............... approval
deploy actions ............. approval
privilege step-up .......... enabled
audit log ................. on',foot:'Lets teams keep humans in the loop only where it actually matters.'},
    {title:'Boundaries',kicker:'permission model',body:'tool allowlist ............. enforced
filesystem scope ........... constrained
network policy ............. filtered
secret paths ............... blocked
unsafe write paths ......... denied',foot:'Reduces the blast radius of one bad prompt or one sloppy workflow.'},
    {title:'Artifact',kicker:'policy output',body:'runtime config ............. policy.yaml
active rules ............... 14
change review .............. tracked
step-up mode ............... enabled
operator override .......... explicit',foot:'Outputs a policy artifact operators and auditors can both inspect.'}
  ]},
  {name:'amc vault',title:'Vault',headline:'Cryptographically prove what happened',summary:'Signs evidence, verifies ledgers, and gives auditors a tamper-evident chain of custody.',badges:['Ed25519 signing','Merkle chain','audit-ready'],info:[{label:'what it does',title:'Creates verifiable evidence',text:'Every artifact can be signed, chained, and checked independently.'},{label:'why it matters',title:'Because “trust me” is not evidence',text:'Teams need proof that survives handoffs, audits, and disputes.'},{label:'output',title:'Evidence chain + signatures',text:'Produces a ledger with hashes, proofs, and verification metadata.'}],lines:[
    {title:'Ledger',kicker:'evidence chain',body:'artifacts .................. 23
root hash .................. a7f3c2d1...e890b4
append mode ................ immutable
notary stamp ............... present
chain state ................ healthy',foot:'Preserves a tamper-evident record of what the agent actually did.'},
    {title:'Signatures',kicker:'cryptographic proof',body:'ed25519 signatures ......... 23/23
verification ............... valid
key rotation ............... supported
receipt bundling ........... enabled
proof export ............... ready',foot:'Lets outside reviewers verify your evidence without trusting your story.'},
    {title:'Integrity',kicker:'tamper checks',body:'merkle proof ............... verified
mutation scan .............. clean
file drift ................. none
missing receipt ............ none
ledger replay .............. pass',foot:'Makes retroactive edits obvious instead of invisible.'},
    {title:'Audit',kicker:'review package',body:'auditor mode ............... ready
chain export ............... generated
verification log ........... saved
review note ................ attached
status ..................... pass',foot:'Packages the proof trail into something a buyer or auditor can actually use.'}
  ]},
  {name:'amc watch',title:'Watch',headline:'See trust drift before it hurts you',summary:'Monitors posture over time and surfaces anomalies, regressions, and risky changes.',badges:['drift alerts','timelines','anomaly review'],info:[{label:'what it does',title:'Tracks trust over time',text:'Continuously compares current behavior against prior baselines and thresholds.'},{label:'why it matters',title:'Most failures are regressions',text:'A safe launch can quietly rot after a few prompt or policy changes.'},{label:'output',title:'Timeline + anomaly report',text:'Shows which dimension slipped, when it changed, and why it matters.'}],lines:[
    {title:'Trend',kicker:'7-day posture',body:'day 1 ...................... L3.2
day 3 ...................... L3.1
day 5 ...................... L3.0
day 7 ...................... L2.9
direction .................. down',foot:'Shows the slow decay that most teams miss until something breaks.'},
    {title:'Anomalies',kicker:'runtime alerts',body:'anomalies found ............ 2
permission expansion ....... yes
approval bypass ............ +12%
context drift .............. medium
alert level ................ elevated',foot:'Flags behavioral changes before they become incidents or customer pain.'},
    {title:'Timeline',kicker:'event log',body:'T+1d baseline captured
T+3d tool scope widened
T+5d bypass rate increased
T+6d governance score fell
T+7d alert emitted',foot:'Makes the regression legible enough to debug, not just alarming.'},
    {title:'Action',kicker:'next remediation',body:'diff approvals ............. pending
review prompts ............. pending
restore baseline ........... queued
notify operator ............ yes
report path ................ saved',foot:'Connects monitoring to concrete follow-up instead of passive dashboards.'}
  ]},
  {name:'amc comply',title:'Comply',headline:'Map trust evidence to real frameworks',summary:'Turns technical evidence into regulator-readable artifacts for audits and risk reviews.',badges:['EU AI Act','ISO 42001','NIST AI RMF'],info:[{label:'what it does',title:'Builds compliance binders',text:'Maps evidence and controls to the frameworks buyers and regulators care about.'},{label:'why it matters',title:'Compliance work is mostly evidence plumbing',text:'AMC shortens the gap between tests run and proof produced.'},{label:'output',title:'Binder + gap report',text:'Exports mapped requirements, evidence references, and remediation gaps.'}],lines:[
    {title:'Frameworks',kicker:'mapping targets',body:'eu ai act .................. 34/41
nist ai rmf ................ 28/28
iso 42001 .................. ready
soc 2 ...................... supported
custom controls ............ optional',foot:'Maps technical evidence to the frameworks buyers and regulators actually ask for.'},
    {title:'Binder',kicker:'generated artifacts',body:'eu binder pdf .............. ready
nist mapping ............... ready
gap remediation ............ ready
control export ............. ready
review packet .............. ready',foot:'Turns compliance work into generated evidence instead of spreadsheet misery.'},
    {title:'Gaps',kicker:'missing controls',body:'open controls .............. 7
article 9 .................. partial
article 13 ................. partial
article 15 ................. missing
owner action ............... required',foot:'Makes unresolved obligations painfully visible before procurement does.'},
    {title:'Review',kicker:'audit workflow',body:'status ..................... review-ready
trace links ................ attached
citations .................. included
export path ................ binder/
share mode ................. internal',foot:'Packages the story with enough proof for real legal, risk, or audit review.'}
  ]},
  {name:'amc fleet',title:'Fleet',headline:'Govern many agents like an actual platform',summary:'Benchmarks multiple agents, compares risk posture, and enforces org-wide trust baselines.',badges:['fleet baselines','org policy','cross-agent compare'],info:[{label:'what it does',title:'Surfaces weakest links',text:'Puts every agent on one trust map so the laggards are obvious.'},{label:'why it matters',title:'Your stack fails at the weakest boundary',text:'One sloppy assistant can negate ten well-governed ones.'},{label:'output',title:'Fleet scorecard',text:'Shows per-agent maturity, threshold breaches, and policy coverage.'}],lines:[
    {title:'Overview',kicker:'fleet status',body:'agents scanned ............. 12
fleet average .............. L2.9
policy mode ................ strict
threshold breaches ......... 2
benchmark run .............. complete',foot:'Gives operators one view across the entire multi-agent estate.'},
    {title:'Topline',kicker:'compare agents',body:'prod-agent-02 .............. L3.5
prod-agent-01 .............. L3.2
staging-bot ................ L2.1
dev-assistant .............. L1.8
spread ..................... wide',foot:'Makes it obvious which agents are carrying risk for the whole stack.'},
    {title:'Policy',kicker:'org controls',body:'global baseline ............ L2.5
strict mode ................ enabled
outlier flagging ........... on
delegation graph ........... tracked
auto-review ................ optional',foot:'Lets teams enforce shared standards instead of babysitting one agent at a time.'},
    {title:'Focus',kicker:'next steps',body:'raise staging .............. yes
raise dev assistant ........ yes
retest after fixes ......... yes
publish scorecard .......... ready
report path ................ saved',foot:'Converts comparison into a remediation queue the org can actually execute.'}
  ]},
  {name:'amc passport',title:'Passport',headline:'Make trust portable between environments',summary:'Issues a portable, signed trust identity that can move between tools, teams, and environments.',badges:['portable identity','verifiable score','expiry controls'],info:[{label:'what it does',title:'Packages trust state',text:'Bundles score, evidence, validity window, and signature into a portable credential.'},{label:'why it matters',title:'Trust should travel with the agent',text:'Handoffs break when context and evidence get lost between systems.'},{label:'output',title:'Signed passport artifact',text:'Exports a machine-readable trust document with expiry and verification data.'}],lines:[
    {title:'Identity',kicker:'portable trust',body:'agent id ................... prod-agent-01
verified level ............. L3.2
passport id ................ ppt_a7f3c2d1e890b4
issuer ..................... AMC
state ...................... valid',foot:'Packages trust into a portable identity instead of trapping it in one tool.'},
    {title:'Evidence',kicker:'credential backing',body:'evidence set ............... 23 artifacts
chain verification ......... pass
signature type ............. Ed25519
issue date ................. 2026-03-12
expiry window .............. 30 days',foot:'Keeps the credential anchored to actual evidence rather than vibes.'},
    {title:'Transfer',kicker:'environment handoff',body:'export format .............. json
verification path .......... builtin
cross-env use .............. yes
share scope ................ configurable
revocation ................. supported',foot:'Makes handoffs between teams and environments much less stupid.'},
    {title:'Artifact',kicker:'passport output',body:'output path ............... .amc/passport/
review mode ............... enabled
consumer check ............ ready
audit use ................. supported
status .................... issued',foot:'Creates a portable trust artifact that can survive deployment boundaries.'}
  ]}
];

var currentProduct=0,cycleTimer=null;

function renderProduct(idx){
  var p=PRODUCTS[idx];
  var body=document.getElementById('product-term');
  var info=document.getElementById('product-info');
  var title=document.getElementById('term-title');
  var headline=document.getElementById('product-headline');
  var summary=document.getElementById('product-summary');
  var badges=document.getElementById('product-badges');
  if(!body)return;

  document.querySelectorAll('.product-tab').forEach(function(t,i){t.classList.toggle('active',i===idx)});
  title.textContent=p.name;
  if(headline)headline.textContent=p.headline||p.title;
  if(summary)summary.textContent=p.summary||'';
  if(badges)badges.innerHTML=(p.badges||[]).map(function(b){return '<span class="product-badge">'+b+'</span>'}).join('');

  info.innerHTML='<div class="product-info-grid">'+(p.info||[]).map(function(card){
    return '<div class="product-info-card"><span>'+card.label+'</span><strong>'+card.title+'</strong><p>'+card.text+'</p></div>';
  }).join('')+'</div>';

  body.innerHTML='<div class="terminal-cards">'+(p.panels||[]).map(function(panel){
    return '<article class="terminal-panel">'
      +'<div class="terminal-panel-head"><span class="terminal-kicker">'+panel.kicker+'</span><h4>'+panel.title+'</h4></div>'
      +'<div class="terminal-code">'+panel.body+'</div>'
      +'<div class="terminal-panel-foot">'+panel.foot+'</div>'
      +'</article>';
  }).join('')+'</div>';
}

function startCycle(){
  if(cycleTimer)clearInterval(cycleTimer);
  cycleTimer=setInterval(function(){
    currentProduct=(currentProduct+1)%PRODUCTS.length;
    renderProduct(currentProduct);
  },5000);
}

function initProducts(){
  var tabs=document.getElementById('product-tabs');
  if(!tabs)return;
  tabs.addEventListener('click',function(e){
    var btn=e.target.closest('.product-tab');
    if(!btn)return;
    currentProduct=parseInt(btn.dataset.idx);
    renderProduct(currentProduct);
    startCycle(); // reset timer
  });
  renderProduct(0);
  // Start auto-cycle when visible
  var obs=new IntersectionObserver(function(entries){
    if(entries[0].isIntersecting){startCycle();obs.disconnect()}
  },{threshold:0.2});
  obs.observe(tabs);
}

// ─── FAQ ───
function initFAQ(){
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click',function(){
      var item=btn.closest('.faq-item');
      var was=item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.faq-q').setAttribute('aria-expanded','false')});
      if(!was){item.classList.add('open');btn.setAttribute('aria-expanded','true')}
    });
  });
}

// ─── SMOOTH ANCHORS ───
function initAnchors(){
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href');if(id==='#')return;
      var target=document.querySelector(id);if(!target)return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
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

// ─── INIT ───
function init(){
  initReveals();
  initProducts();
  initFAQ();
  initAnchors();
  initMobileNav();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(typeof ScrollTrigger!=='undefined')ScrollTrigger.refresh()});

})();
