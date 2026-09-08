(function(){"use strict";var BANK_KEY="wheel_bank";var START_BANK=1000;var SEGMENT_COUNT=16;var TAU=Math.PI*2;var HISTORY_LIMIT=8;var MULTIPLIERS=[10,0,1.2,0.5,2,0,1.5,0.2,3,0,1.2,0.5,2,0,5,0.2];function segmentStyle(mult){if(mult>=10){return{fill:"#b91c1c",text:"#ffffff"};}
if(mult>=5){return{fill:"#7f1d1d",text:"#ffffff"};}
if(mult>=3){return{fill:"#b45309",text:"#ffffff"};}
if(mult>=2){return{fill:"#d9a441",text:"#1c1917"};}
if(mult>=1.5){return{fill:"#a3b18a",text:"#1c1917"};}
if(mult>=1.2){return{fill:"#e8dcc8",text:"#1c1917"};}
if(mult>0){return{fill:"#f5efe5",text:"#57534e"};}
return{fill:"#292524",text:"#d6cfc4"};}
function formatMultiplier(mult){var label=String(mult);return label+"×";}
function readStoredBank(){try{var raw=window.localStorage.getItem(BANK_KEY);if(raw===null){return START_BANK;}
var value=parseInt(raw,10);if(!isFinite(value)||value<0){return START_BANK;}
return value;}catch(err){return START_BANK;}}
function storeBank(value){try{window.localStorage.setItem(BANK_KEY,String(value));}catch(err){}}
function easeOutQuart(t){return 1-Math.pow(1-t,4);}
function setIssueDate(){var el=document.getElementById("issue-date");if(!el){return;}
var now=new Date();try{var lang=document.documentElement.lang||undefined;el.textContent=now.toLocaleDateString(lang,{year:"numeric",month:"long",day:"numeric"});}catch(err){el.textContent=now.toDateString();}}
function init(){setIssueDate();var canvas=document.getElementById("wheel-canvas");var stage=canvas?canvas.parentElement:null;var bankEl=document.getElementById("bank-value");var resetBtn=document.getElementById("bank-reset");var resultEl=document.getElementById("spin-result");var betInput=document.getElementById("bet-input");var minusBtn=document.getElementById("bet-minus");var plusBtn=document.getElementById("bet-plus");var spinBtn=document.getElementById("spin-button");var historyEl=document.getElementById("history-list");var presets=document.querySelectorAll(".preset-chip-7c453836");if(!canvas||!canvas.getContext||!bankEl||!betInput||!spinBtn||!resultEl||!historyEl){return;}
var ctx=canvas.getContext("2d");var bank=readStoredBank();var rotation=0;var spinning=false;var history=[];var cssSize=280;function renderBank(withPulse){bankEl.textContent=String(bank);if(withPulse){bankEl.classList.remove("tick-7c453836");void bankEl.offsetWidth;bankEl.classList.add("tick-7c453836");}}
function showResult(text,tone){resultEl.textContent=text;resultEl.classList.remove("is-win","is-lose","is-push");if(tone){resultEl.classList.add(tone);}}
function clearPresetHighlight(){for(var i=0;i<presets.length;i+=1){presets[i].classList.remove("is-active-7c453836");}}
function renderHistory(){historyEl.textContent="";for(var i=0;i<history.length;i+=1){var entry=history[i];var item=document.createElement("li");var sign=entry.net>0?"+":"";item.textContent=formatMultiplier(entry.mult)+" "+sign+entry.net;if(entry.net>0){item.classList.add("hist-win-7c453836");}else if(entry.net<0){item.classList.add("hist-lose-7c453836");}else{item.classList.add("hist-push-7c453836");}
historyEl.appendChild(item);}}
function fitCanvas(){var box=stage?stage.getBoundingClientRect():null;var width=box&&box.width?box.width:280;cssSize=Math.max(180,Math.min(Math.round(width),340));var dpr=window.devicePixelRatio||1;canvas.width=Math.round(cssSize*dpr);canvas.height=Math.round(cssSize*dpr);canvas.style.width=cssSize+"px";canvas.style.height=cssSize+"px";drawWheel();}
function drawWheel(){var dpr=window.devicePixelRatio||1;var size=cssSize;var center=size/2;var radius=center-4;var segAngle=TAU/SEGMENT_COUNT;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);ctx.save();ctx.translate(center,center);ctx.rotate(rotation);for(var i=0;i<SEGMENT_COUNT;i+=1){var start=i*segAngle;var style=segmentStyle(MULTIPLIERS[i]);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,radius,start,start+segAngle);ctx.closePath();ctx.fillStyle=style.fill;ctx.fill();ctx.strokeStyle="#faf8f5";ctx.lineWidth=1.5;ctx.stroke();ctx.save();ctx.rotate(start+segAngle/2);ctx.textAlign="right";ctx.textBaseline="middle";ctx.fillStyle=style.text;ctx.font="700 "+Math.max(11,Math.round(size/24))+"px 'Source Sans 3', Arial, sans-serif";ctx.fillText(formatMultiplier(MULTIPLIERS[i]),radius-10,0);ctx.restore();}
ctx.restore();ctx.beginPath();ctx.arc(center,center,radius,0,TAU);ctx.strokeStyle="#1c1917";ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.arc(center,center,Math.max(16,size*0.11),0,TAU);ctx.fillStyle="#faf8f5";ctx.fill();ctx.strokeStyle="#1c1917";ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(center,center,Math.max(4,size*0.025),0,TAU);ctx.fillStyle="#b91c1c";ctx.fill();}
function readBet(){var value=parseInt(betInput.value,10);if(!isFinite(value)||value<=0){showResult("Enter a bet above zero.","is-lose");return null;}
if(value>bank){showResult("That bet exceeds your balance.","is-lose");return null;}
return value;}
function settle(index,bet){var mult=MULTIPLIERS[index];var payout=Math.round(bet*mult);var net=payout-bet;bank+=payout;storeBank(bank);renderBank(true);if(net>0){showResult("Landed on "+formatMultiplier(mult)+" — you win "+net+"!","is-win");}else if(net===0){showResult("Landed on "+formatMultiplier(mult)+" — your bet came back.","is-push");}else{showResult("Landed on "+formatMultiplier(mult)+" — better luck next spin.","is-lose");}
history.unshift({mult:mult,net:net});if(history.length>HISTORY_LIMIT){history.length=HISTORY_LIMIT;}
renderHistory();spinning=false;spinBtn.disabled=false;}
function spin(){if(spinning){return;}
var bet=readBet();if(bet===null){return;}
spinning=true;spinBtn.disabled=true;showResult("Spinning…",null);bank-=bet;storeBank(bank);renderBank(false);var index=Math.floor(Math.random()*SEGMENT_COUNT);var segAngle=TAU/SEGMENT_COUNT;var centerAngle=index*segAngle+segAngle/2;var jitter=(Math.random()-0.5)*segAngle*0.7;var target=-Math.PI/2-centerAngle-jitter;var current=rotation%TAU;var delta=((target-current)%TAU+TAU)%TAU;var turns=4+Math.floor(Math.random()*3);var total=delta+TAU*turns;var startRotation=rotation;var duration=3800+Math.random()*900;var startTime=null;function frame(timestamp){if(startTime===null){startTime=timestamp;}
var t=Math.min(1,(timestamp-startTime)/duration);rotation=startRotation+total*easeOutQuart(t);drawWheel();if(t<1){window.requestAnimationFrame(frame);}else{rotation=rotation%TAU;settle(index,bet);}}
window.requestAnimationFrame(frame);}
function adjustBet(step){var value=parseInt(betInput.value,10);if(!isFinite(value)){value=0;}
value+=step;if(value<1){value=1;}
betInput.value=String(value);clearPresetHighlight();}
spinBtn.addEventListener("click",spin);if(minusBtn){minusBtn.addEventListener("click",function(){adjustBet(-5);});}
if(plusBtn){plusBtn.addEventListener("click",function(){adjustBet(5);});}
betInput.addEventListener("input",clearPresetHighlight);for(var i=0;i<presets.length;i+=1){(function(chip){chip.addEventListener("click",function(){var amount=parseInt(chip.getAttribute("data-bet"),10);if(isFinite(amount)&&amount>0){betInput.value=String(amount);clearPresetHighlight();chip.classList.add("is-active-7c453836");}});})(presets[i]);}
if(resetBtn){resetBtn.addEventListener("click",function(){if(spinning){return;}
bank=START_BANK;storeBank(bank);renderBank(true);showResult("Credits reset to "+START_BANK+".","is-push");});}
var resizeTimer=null;window.addEventListener("resize",function(){if(resizeTimer!==null){window.clearTimeout(resizeTimer);}
resizeTimer=window.setTimeout(function(){resizeTimer=null;fitCanvas();},150);});renderBank(false);renderHistory();fitCanvas();}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}})();