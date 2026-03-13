// AMC Token Animation — random on left, constrained between guardrails on right
(function(){
'use strict';
var canvas=document.getElementById('hero-canvas');
if(!canvas)return;
var ctx=canvas.getContext('2d');
var W,H,tokens=[];
var TOKENS=['GPT','LLM','RAG','MCP','L3','L4','0.4×','1.0×','Ed25519','NIST','ISO','OWASP','EU AI','HIPAA','SOC2','CI/CD','FHIR','PII','DLP','RBAC','TEE','CoT','RLHF','SaMD','FDA','GxP','NIS2','GDPR','JWT','TLS'];
var amcZoneStart,amcZoneEnd,guardrailTop,guardrailBottom,guardrailMid;

function resize(){
  W=canvas.width=canvas.parentElement.offsetWidth;
  H=canvas.height=canvas.parentElement.offsetHeight;
  amcZoneStart=W*0.35;
  amcZoneEnd=W*0.95;
  guardrailMid=H*0.52;
  guardrailTop=guardrailMid-18;
  guardrailBottom=guardrailMid+18;
}

function Token(){this.reset(true)}
Token.prototype.reset=function(init){
  this.x=init?Math.random()*W*0.4:-20-Math.random()*120;
  this.y=H*0.15+Math.random()*H*0.7;
  this.vx=0.45+Math.random()*0.75;
  this.vy=(Math.random()-0.5)*0.45;
  this.text=TOKENS[Math.floor(Math.random()*TOKENS.length)];
  this.alpha=0.07+Math.random()*0.12;
  this.targetAlpha=this.alpha;
  this.size=8+Math.random()*5;
  this.phase=0;
};
Token.prototype.update=function(){
  if(this.phase===0&&this.x>=amcZoneStart){
    this.phase=1;
    this.targetAlpha=Math.min(this.alpha+0.1,0.25);
  }
  if(this.phase===1){
    var targetY=guardrailMid;
    var dy=targetY-this.y;
    this.vy=dy*0.06;
    this.vx=0.95;
    if(Math.abs(dy)<1.5){
      this.phase=2;
      this.vy=0;
      this.y=targetY;
    }
  }
  if(this.phase===2){
    this.vx=1.15;
    this.vy=0;
    if(this.y<guardrailTop+3)this.y=guardrailTop+3;
    if(this.y>guardrailBottom-3)this.y=guardrailBottom-3;
  }
  this.alpha+=(this.targetAlpha-this.alpha)*0.06;
  this.x+=this.vx;
  this.y+=this.vy;
  if(this.x>W+40){this.reset(false)}
};
Token.prototype.draw=function(){
  ctx.save();
  ctx.globalAlpha=this.alpha;
  ctx.font=this.size+'px "Space Mono",monospace';
  ctx.fillStyle=this.phase>=1?'#4AEF79':'#94B0BF';
  ctx.fillText(this.text,this.x,this.y);
  ctx.restore();
};

function drawAMC(){
  ctx.save();
  ctx.globalAlpha=0.04;
  var fontSize=Math.min(W*0.25,220);
  ctx.font='800 '+fontSize+'px Inter,system-ui,sans-serif';
  ctx.fillStyle='#4AEF79';
  ctx.textAlign='center';
  ctx.fillText('AMC',W*0.68,H*0.58);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha=0.08;
  ctx.strokeStyle='#4AEF79';
  ctx.lineWidth=1;
  ctx.setLineDash([6,8]);
  ctx.beginPath();
  ctx.moveTo(amcZoneStart,guardrailTop);
  ctx.lineTo(amcZoneEnd,guardrailTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(amcZoneStart,guardrailBottom);
  ctx.lineTo(amcZoneEnd,guardrailBottom);
  ctx.stroke();
  ctx.restore();
}

function loop(){
  ctx.clearRect(0,0,W,H);
  drawAMC();
  for(var i=0;i<tokens.length;i++){tokens[i].update();tokens[i].draw()}
  requestAnimationFrame(loop);
}

function init(){
  resize();
  for(var i=0;i<20;i++)tokens.push(new Token());
  loop();
}

window.addEventListener('resize',resize);
init();
})();
