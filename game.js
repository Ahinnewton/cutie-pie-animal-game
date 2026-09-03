const $=s=>document.querySelector(s), canvas=$('#game'),ctx=canvas.getContext('2d'),beniPhoto=new Image();beniPhoto.src='beni.png';
let data=JSON.parse(localStorage.getItem('beniBigDay')||'null')||{coins:20,hunger:72,clean:70,happy:76,owned:[]};
data.unlocked=Math.max(1,data.unlocked||1);
let running=false,paused=false,frame=0,speed=6,distance=0,bones=0,combo=0,cloudHits=0,lives=3,beni,things=[],raf,ducking=false,runLevel=1,difficulty='normal';
const modes={easy:{start:8,max:15,ramp:230,hearts:4,spawn:1.15},normal:{start:10,max:18,ramp:175,hearts:3,spawn:1},hard:{start:12,max:22,ramp:130,hearts:2,spawn:.82}};
const levels=[
  {goal:400,name:'Sunny Park',sky:'#a9e7ff',ground:'#b5ea8d',far:'#91bd75',accent:'#fff4a8'},
  {goal:550,name:'Candy Sunset',sky:'#ffc2cf',ground:'#e8a6cc',far:'#cb79ac',accent:'#fff0b8'},
  {goal:700,name:'Magic Forest',sky:'#9edbc3',ground:'#75ae78',far:'#477d5d',accent:'#d8f5c4'},
  {goal:850,name:'Moonlit Hills',sky:'#8d91d9',ground:'#7774a8',far:'#55537f',accent:'#f8edb0'},
  {goal:1100,name:'Rainbow Challenge',sky:'#c7b5ff',ground:'#8ed8b2',far:'#6aa38a',accent:'#ffd1e6'},
  {goal:1250,name:'Starlight Garden',sky:'#777bb7',ground:'#799b86',far:'#555982',accent:'#fff3bd'},
  {goal:1400,name:'Crystal Lake',sky:'#9fd8e8',ground:'#75aaa1',far:'#668fa4',accent:'#d9fbff'},
  {goal:1550,name:'Sakura Village',sky:'#f7c9d7',ground:'#9eb985',far:'#c78fa3',accent:'#fff0ca'},
  {goal:1750,name:'Aurora Valley',sky:'#4b5985',ground:'#728e91',far:'#4a5c79',accent:'#d8fff0'},
  {goal:2000,name:'Beni Dreamland',sky:'#8c7db8',ground:'#8cb39e',far:'#655b91',accent:'#fff4bf'}
];
const shop=[{id:'nooutfit',icon:'✕',name:'No Outfit',price:0,type:'outfit'},{id:'nohat',icon:'✕',name:'No Hat',price:0,type:'hat'},{id:'bow',icon:'🎀',name:'Pink Bow',price:8,type:'hat'},{id:'crown',icon:'👑',name:'Crown',price:18,type:'hat'},{id:'cap',icon:'🧢',name:'Cool Cap',price:15,type:'hat'},{id:'scarf',icon:'🧣',name:'Scarf',price:12,type:'outfit'},{id:'vest',icon:'🦺',name:'Adventure',price:25,type:'outfit'},{id:'blue',icon:'🩵',name:'Blue Room',price:20,type:'room'},{id:'space',icon:'🚀',name:'Space Room',price:35,type:'room'},{id:'teddy',icon:'🧸',name:'Teddy Decor',price:10,type:'decor'}];
function save(){localStorage.setItem('beniBigDay',JSON.stringify(data));render()}
function render(){ $('#coins').textContent=data.coins;['hunger','clean','happy'].forEach(k=>$('#'+k).style.width=data[k]+'%');const box=$('#shopItems');box.innerHTML='';shop.forEach(item=>{const b=document.createElement('button'),owned=data.owned.includes(item.id);b.className=owned?'owned':'';b.innerHTML=`${item.icon}<br>${item.name}<br><small>${owned?'USE':`🪙 ${item.price}`}</small>`;b.onclick=()=>buy(item);box.append(b)});refreshLevels()}
function refreshLevels(){const s=$('#courseLevel');if(!s)return;const chosen=Math.min(Number(s.value)||data.unlocked,data.unlocked);s.innerHTML='';levels.forEach((l,i)=>{const o=document.createElement('option');o.value=i+1;o.disabled=i+1>data.unlocked;o.textContent=`${i+1}. ${l.name}${o.disabled?' — LOCKED':''}`;s.append(o)});s.value=chosen;showGoal()}
function showGoal(){const n=Number($('#courseLevel')?.value||1),l=levels[n-1];if(l)$('#levelGoal').textContent=`Reach ${l.goal}m to clear ${l.name}.`}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800)}
function buy(i){if(!data.owned.includes(i.id)){if(data.coins<i.price)return toast('Earn more coins on Treat Trail! 🦴');data.coins-=i.price;data.owned.push(i.id);toast(`${i.name} unlocked! ✨`)}use(i);save()}
function use(i){if(i.type==='hat')$('#hat').textContent=i.id==='nohat'?'':i.icon;if(i.type==='outfit')$('#outfit').textContent=i.id==='nooutfit'?'':i.icon;if(i.type==='room')$('#room').className=`room room-${i.id}`;if(i.type==='decor')$('#decorSide').textContent=i.icon;toast(i.id.startsWith('no')?'Back to fluffy Beni! 🤎':`Beni loves the ${i.name}! 💖`)}
document.querySelectorAll('[data-care]').forEach(b=>b.onclick=()=>{const a=b.dataset.care;if(a==='feed'){data.hunger=Math.min(100,data.hunger+24);data.coins=Math.max(0,data.coins-1);toast('Nom nom nom! 😋')}if(a==='wash'){data.clean=100;toast('Fluffy and clean! 🫧')}if(a==='play'){data.happy=Math.min(100,data.happy+20);toast('Zoomies!! 🎾')}if(a==='sleep'){data.hunger=Math.max(15,data.hunger-8);data.happy=Math.min(100,data.happy+10);toast('Sweet dreams, Beni 🌙')}$('#beni').animate([{transform:'scale(1)'},{transform:'scale(1.18) rotate(-5deg)'},{transform:'scale(1)'}],400);save()});
setInterval(()=>{data.hunger=Math.max(10,data.hunger-1);data.clean=Math.max(10,data.clean-.5);data.happy=Math.max(10,data.happy-.4);save()},12000);
function stopRun(){if(running){running=false;cancelAnimationFrame(raf);data.happy=Math.min(100,data.happy+Math.min(20,bones));save()}$('#runOverlay').classList.remove('hidden');$('#runOverlay h2').textContent='Ready, Beni?';showGoal()}
function tab(run){if(!run)stopRun();$('#homeScene').classList.toggle('hidden',run);$('#runScene').classList.toggle('hidden',!run);$('#homeTab').classList.toggle('active',!run);$('#runTab').classList.toggle('active',run)}$('#homeTab').onclick=()=>tab(false);$('#runTab').onclick=()=>tab(true);$('#leaveRun').onclick=()=>tab(false);$('#homeHint').onclick=()=>tab(false);
function resetRun(){difficulty=$('#difficulty').value;runLevel=Number($('#courseLevel').value);const m=modes[difficulty];frame=0;speed=m.start+(runLevel-1)*1.25;distance=0;bones=0;combo=0;cloudHits=0;lives=m.hearts;things=[];ducking=false;paused=false;$('#pauseRun').textContent='PAUSE';beni={x:105,y:330,vy:0,ground:true,jumps:0};updateHud()}
function updateHud(){$('#distance').textContent=Math.floor(distance);$('#runLevel').textContent=runLevel;$('#bones').textContent=bones;$('#combo').textContent=combo;$('#cloudHits').textContent=cloudHits;const max=modes[difficulty]?.hearts||3;$('#lives').textContent='● '.repeat(lives)+'○ '.repeat(Math.max(0,max-lives));$('#trailProgress').style.width=Math.min(100,distance/(levels[runLevel-1]?.goal||1)*100)+'%'}
function jump(){if(!running||paused||beni.jumps>=2)return;beni.vy=-30;beni.ground=false;beni.jumps++}function duck(on=true){if(running&&!paused)ducking=on}
function spawnThing(){const r=Math.random();if(runLevel>=3&&r<.07)things.push({type:'golden',x:930,y:225+Math.random()*75,w:40,h:40,hit:false});else if(runLevel>=4&&r<.12)things.push({type:'heart',x:930,y:245+Math.random()*55,w:38,h:38,hit:false});else if(r<.6)things.push({type:'cookie',x:930,y:230+Math.random()*75,w:36,h:36,hit:false});else if(r<.82)things.push({type:'cloud',x:930,y:337,w:52,h:43,hit:false});else things.push({type:'cloud',x:930,y:275,w:52,h:43,hit:false})}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function drawThing(t){ctx.save();ctx.translate(t.x,t.y);ctx.font='44px "Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';if(t.type==='cookie')ctx.fillText('🍪',18,18);else if(t.type==='golden')ctx.fillText('🌟',20,20);else if(t.type==='heart')ctx.fillText('💖',19,19);else if(t.type==='cloud'){ctx.font='48px "Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.fillText('☁️',27,24)}ctx.restore()}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function cloud(x,y,s=1){ctx.fillStyle='#fffdf1';ctx.beginPath();ctx.arc(x,y,17*s,0,Math.PI*2);ctx.arc(x+22*s,y-9*s,23*s,0,Math.PI*2);ctx.arc(x+48*s,y,18*s,0,Math.PI*2);ctx.fill();ctx.fillRect(x,y,48*s,18*s)}
function flower(x,y,color){ctx.strokeStyle='#56874f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+24);ctx.stroke();for(let a=0;a<6;a++)circle(x+Math.cos(a*Math.PI/3)*7,y+Math.sin(a*Math.PI/3)*7,5,color);circle(x,y,4,'#ffe77a')}
function tree(x,base,s=1,kind=0,dark='#527f55',light='#75a96c'){
  const h=(74+(kind%3)*17)*s,w=(kind%2?28:34)*s;
  ctx.fillStyle='#614536';ctx.fillRect(x-7*s,base-h,16*s,h);
  ctx.fillStyle='#8b674e';ctx.fillRect(x-7*s,base-h,10*s,h);
  circle(x+5*s,base-h-4*s,w+4*s,dark);
  if(kind%3===0){circle(x-20*s,base-h+5*s,w*.72,light);circle(x+22*s,base-h+7*s,w*.78,light);circle(x,base-h-25*s,w*.72,light)}
  else if(kind%3===1){circle(x-15*s,base-h-15*s,w*.8,light);circle(x+19*s,base-h-12*s,w*.72,light);circle(x+2*s,base-h-34*s,w*.66,light)}
  else{circle(x-23*s,base-h+2*s,w*.68,light);circle(x+24*s,base-h+1*s,w*.68,light);circle(x,base-h-28*s,w*.86,light)}
  circle(x-10*s,base-h-22*s,w*.3,'rgba(255,255,255,.18)');
}
function drawBackground(){
  const t=levels[runLevel-1]||levels[0],scroll=0;
  const sky=ctx.createLinearGradient(0,0,0,375);sky.addColorStop(0,t.sky);sky.addColorStop(1,runLevel===4?'#c5a9dc':'#fff2d4');ctx.fillStyle=sky;ctx.fillRect(0,0,900,375);
  if(runLevel===1){
    circle(765,72,43,'#fff2a2');circle(765,72,32,'#fff9ca');
    cloud(80,74,.8);cloud(430,126,.6);
    ctx.fillStyle='#aad889';for(let x=-scroll;x<1000;x+=180){ctx.beginPath();ctx.arc(x,360,130,Math.PI,0);ctx.fill()}
    [55,205,390,555,745,880].forEach((x,i)=>{tree(x,375,[.72,.9,.66,.82,.74,.62][i],i,'#56875a','#78ad70');flower(x+55,345,['#df789c','#8179c9','#daa253'][i%3])})
  }else if(runLevel===2){
    circle(750,87,50,'#fff0a6');cloud(105,90,.7);
    ctx.fillStyle='#d98bc1';for(let x=-scroll;x<1000;x+=150){ctx.beginPath();ctx.arc(x,365,105,Math.PI,0);ctx.fill()}
    for(let x=-scroll;x<1000;x+=120){ctx.strokeStyle='#fff5f8';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x+20,375);ctx.lineTo(x+20,292);ctx.stroke();circle(x+20,282,21,['#ff7fa4','#a979df','#72d6cf'][Math.abs(Math.round(x/120))%3]);ctx.fillStyle='#fff';ctx.fillRect(x+76,319,10,56);circle(x+81,312,18,'#ff91ba');circle(x+72,302,12,'#ffb9d2');circle(x+52,340,4,'#fff2a8');circle(x+61,352,3,'#8de0d3')}
  }else if(runLevel===3){
    ctx.fillStyle='#c7f2d3';ctx.globalAlpha=.24;for(let x=25;x<900;x+=90){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+75,375);ctx.lineTo(x+120,375);ctx.lineTo(x+40,0);ctx.fill()}ctx.globalAlpha=1;
    [35,150,285,425,570,720,855].forEach((x,i)=>tree(x,375,[1.15,.84,1.28,.75,1.08,.88,1.2][i],i+1,'#315f48','#477d5d'));
    for(let x=-scroll;x<1000;x+=145){ctx.fillStyle='#f8eee1';ctx.fillRect(x+80,341,8,25);circle(x+84,337,13,['#ef6d82','#9d79dd','#f2b95f'][Math.abs(Math.round(x/145))%3]);circle(x+28,330,3,'#f7ef8b');circle(x+35,315,2,'#d8b8ff');circle(x+48,285,2,'#fff8a6');circle(x+54,278,1.5,'#bfffea')}
  }else if(runLevel===4){
    circle(755,78,45,'#fff7cb');circle(738,65,45,t.sky);
    for(let i=0;i<30;i++)circle((i*137)%900,(i*67)%220,1.5+(i%3),i%4?'#fff6cf':'#d7c5ff');
    ctx.fillStyle='#696394';for(let x=-scroll;x<1050;x+=185){ctx.beginPath();ctx.moveTo(x,375);ctx.quadraticCurveTo(x+92,225,x+185,375);ctx.fill()}
    ctx.fillStyle='#49476f';for(let x=-scroll*1.4;x<1050;x+=230){ctx.beginPath();ctx.moveTo(x,375);ctx.quadraticCurveTo(x+115,275,x+230,375);ctx.fill()}circle(105,325,4,'#fff2a8');circle(310,300,3,'#fff2a8');cloud(115,145,.45);cloud(470,105,.35)
  }else if(runLevel===5){
    const bands=['#ff8fa3','#ffbe76','#fff08a','#82d99b','#7fc9ff','#b394ed'];bands.forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=14;ctx.beginPath();ctx.arc(735,245,150-i*14,Math.PI,0);ctx.stroke()});
    cloud(570,244,.8);cloud(810,244,.8);for(let i=0;i<24;i++){const x=(i*113)%900;circle(x,35+(i*53)%270,2+(i%2),bands[i%6])}
    ctx.fillStyle='#73bb91';for(let x=-scroll;x<1000;x+=145){ctx.beginPath();ctx.arc(x,370,100,Math.PI,0);ctx.fill();flower(x+65,338,bands[Math.abs(Math.round(x/145))%bands.length])}
  }else if(runLevel===6){
    circle(755,76,42,'#fff5c7');circle(740,62,42,t.sky);for(let i=0;i<24;i++)circle((i*149)%900,28+(i*71)%240,1.5+(i%2),'#fff4cf');
    ctx.fillStyle='#62678f';for(let x=0;x<1000;x+=180){ctx.beginPath();ctx.arc(x,370,120,Math.PI,0);ctx.fill()}
    [80,245,430,615,800].forEach((x,i)=>tree(x,375,[.68,.85,.72,.9,.7][i],i,'#4b6866','#718b79'));
    for(let x=45;x<900;x+=115){circle(x,342,4,'#f4df91');circle(x+8,336,2,'#d7c9ff')}
  }else if(runLevel===7){
    circle(760,70,38,'#eefcff');cloud(75,82,.65);cloud(420,118,.45);
    ctx.fillStyle='#718fa5';for(let x=-40;x<1000;x+=220){ctx.beginPath();ctx.moveTo(x,345);ctx.lineTo(x+110,170);ctx.lineTo(x+220,345);ctx.fill();ctx.fillStyle='#e9f5f5';ctx.beginPath();ctx.moveTo(x+78,220);ctx.lineTo(x+110,170);ctx.lineTo(x+142,220);ctx.fill();ctx.fillStyle='#718fa5'}
    ctx.fillStyle='#7fc3ca';ctx.fillRect(0,330,900,45);ctx.fillStyle='rgba(255,255,255,.3)';for(let x=20;x<900;x+=95)ctx.fillRect(x,346,58,3);
    for(let x=70;x<900;x+=165){ctx.fillStyle='#b8f2f0';ctx.beginPath();ctx.moveTo(x,370);ctx.lineTo(x+13,326);ctx.lineTo(x+27,370);ctx.fill()}
  }else if(runLevel===8){
    circle(760,72,40,'#fff1c2');cloud(95,82,.55);cloud(460,130,.45);
    ctx.fillStyle='#c78fa3';for(let x=-30;x<950;x+=190){ctx.beginPath();ctx.arc(x,370,120,Math.PI,0);ctx.fill()}
    [70,225,390,560,735,865].forEach((x,i)=>tree(x,375,[.65,.82,.7,.9,.74,.64][i],i,'#9d6d7f','#e5a5bd'));
    for(let x=110;x<850;x+=260){ctx.fillStyle='#fff4e7';ctx.fillRect(x,322,75,53);ctx.fillStyle='#76576e';ctx.beginPath();ctx.moveTo(x-10,322);ctx.lineTo(x+38,286);ctx.lineTo(x+86,322);ctx.fill();ctx.fillStyle='#9a6f5a';ctx.fillRect(x+31,343,16,32)}
  }else if(runLevel===9){
    for(let i=0;i<28;i++)circle((i*137)%900,24+(i*73)%230,1.5+(i%2),'#eafff8');
    ['#76d8c1','#8ac9eb','#b6a3e7'].forEach((c,i)=>{ctx.strokeStyle=c;ctx.globalAlpha=.35;ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(-20,70+i*28);ctx.bezierCurveTo(230,15+i*24,570,145-i*18,930,50+i*25);ctx.stroke()});ctx.globalAlpha=1;
    ctx.fillStyle='#536581';for(let x=-50;x<1000;x+=210){ctx.beginPath();ctx.moveTo(x,375);ctx.lineTo(x+105,185);ctx.lineTo(x+210,375);ctx.fill();ctx.fillStyle='#dce8e9';ctx.beginPath();ctx.moveTo(x+72,245);ctx.lineTo(x+105,185);ctx.lineTo(x+140,248);ctx.fill();ctx.fillStyle='#536581'}
  }else{
    circle(740,76,48,'#fff3c1');for(let i=0;i<30;i++)circle((i*127)%900,25+(i*59)%245,2+(i%2),i%3?'#fff1ca':'#e1cfff');
    const dream=['#e89bbd','#eabe85','#9fc8dd','#ac9bd6'];dream.forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=11;ctx.beginPath();ctx.arc(735,250,128-i*12,Math.PI,0);ctx.stroke()});
    ctx.fillStyle='#675b8f';for(let x=-20;x<980;x+=180){ctx.beginPath();ctx.arc(x,372,115,Math.PI,0);ctx.fill()}
    [95,290,620,820].forEach((x,i)=>tree(x,375,[.72,.9,.82,.68][i],i,'#566f70','#78988a'));
    ctx.fillStyle='#f2dfeb';ctx.fillRect(405,285,105,90);ctx.fillStyle='#b890c2';ctx.fillRect(420,255,22,120);ctx.fillRect(475,245,22,130);ctx.beginPath();ctx.arc(431,255,11,Math.PI,0);ctx.arc(486,245,11,Math.PI,0);ctx.fill();ctx.fillStyle='#876b91';ctx.fillRect(450,335,18,40)
  }
  ctx.fillStyle=t.ground;ctx.fillRect(0,368,900,45);
  ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(0,368,900,8);
  ctx.fillStyle='rgba(52,65,55,.18)';ctx.fillRect(0,413,900,17);
  const tileShift=(frame*speed)%80;
  for(let x=-tileShift-80;x<980;x+=80){
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(x,380,54,25);
    ctx.fillStyle='rgba(40,55,45,.12)';ctx.beginPath();ctx.moveTo(x+54,380);ctx.lineTo(x+65,386);ctx.lineTo(x+65,410);ctx.lineTo(x+54,405);ctx.fill();
  }
  const near=0;
  for(let x=-near;x<980;x+=95){
    if(runLevel===1){flower(x+18,397,['#ff82b4','#9984ef','#ffbf62'][Math.abs(Math.round(x/95))%3]);ctx.strokeStyle='#fff7dc';ctx.lineWidth=3;ctx.strokeRect(x+50,386,38,23)}
    if(runLevel===2){circle(x+20,407,7,['#ff719d','#8edfd0','#fff083'][Math.abs(Math.round(x/95))%3]);ctx.fillStyle='#fff';ctx.fillRect(x+48,398,24,5);circle(x+48,400,5,'#ff8cb1');circle(x+72,400,5,'#ff8cb1')}
    if(runLevel===3){circle(x+22,414,9,'#6f8f78');circle(x+30,416,7,'#829c86');ctx.strokeStyle='#4f765c';ctx.lineWidth=3;for(let g=0;g<4;g++){ctx.beginPath();ctx.moveTo(x+48+g*8,430);ctx.lineTo(x+52+g*8,405+(g%2)*5);ctx.stroke()}}
    if(runLevel===4){circle(x+18,408,7,'#c9b9ff');circle(x+18,408,3,'#fff5b5');ctx.fillStyle='#9288c5';ctx.beginPath();ctx.moveTo(x+50,430);ctx.lineTo(x+61,394);ctx.lineTo(x+72,430);ctx.fill()}
    if(runLevel===5){const c=['#ff8fa3','#ffbe76','#fff08a','#82d99b','#7fc9ff','#b394ed'][Math.abs(Math.round(x/95))%6];circle(x+20,408,8,c);ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText('♡',x+54,414)}
    if(runLevel>=6){circle(x+20,414,7,runLevel===8?'#d99ab3':runLevel===9?'#9bb7c4':'#8e9da0');circle(x+28,416,5,'rgba(255,255,255,.25)')}
  }
}
function draw(){drawBackground();ctx.save();ctx.fillStyle='rgba(34,47,39,.22)';ctx.beginPath();ctx.ellipse(beni.x+34,374,31,8,0,0,Math.PI*2);ctx.fill();const ph=ducking?48:72,py=ducking?beni.y+4:beni.y-42;ctx.beginPath();ctx.arc(beni.x+34,py+ph/2,ph/2,0,Math.PI*2);ctx.clip();if(beniPhoto.complete)ctx.drawImage(beniPhoto,beni.x,py,68,ph);ctx.restore();things.forEach(drawThing)}
function loop(){
  if(!running)return;
  if(paused){raf=requestAnimationFrame(loop);return}
  frame++;const m=modes[difficulty],cfg=levels[runLevel-1];distance+=speed/45;
  const interval=Math.max(24,Math.floor((94-speed*2.7-runLevel*5)*m.spawn));
  if(frame%interval===0){spawnThing();const comboChance=Math.max(0,(runLevel-1)*.09);if(Math.random()<comboChance)setTimeout(()=>running&&!paused&&spawnThing(),230);if(runLevel>=5&&Math.random()<.18)setTimeout(()=>running&&!paused&&spawnThing(),440)}
  speed=Math.min(m.max+runLevel*1.8,m.start+(runLevel-1)*1.25+distance/(m.ramp-runLevel*10));beni.vy+=4;beni.y+=beni.vy;
  if(beni.y>=330){beni.y=330;beni.vy=0;beni.ground=true;beni.jumps=0}
  const box={x:beni.x+8,y:beni.y+(ducking?15:-35),w:52,h:ducking?35:62};
  things.forEach(t=>{t.x-=speed;if(t.hit||!collide(box,t))return;t.hit=true;
    if(t.type==='cookie'||t.type==='golden'){
      const prize=t.type==='golden'?3:1;bones+=prize;data.coins+=prize;combo++;
      if(combo%5===0){data.coins+=2;toast(`${combo} cookie combo! +2 bonus coins! ✨`)}else toast(t.type==='golden'?'+3! Golden treat! 🌟':'+1 coin! Cookie! 🍪')
    }else if(t.type==='heart'){
      const max=modes[difficulty].hearts;if(lives<max){lives++;toast('Beni found a heart! +1 health 💖')}else{data.coins++;toast('Full health! +1 coin 💖')}
    }else{lives--;cloudHits++;combo=0;toast(`Cloud hit ${cloudHits}! Combo reset! ☁️`);if(navigator.vibrate)navigator.vibrate(100)}
    updateHud()
  });
  things=things.filter(t=>t.x>-70&&!t.hit);if(frame%6===0)updateHud();draw();
  if(lives<=0)return endRun(false);if(distance>=cfg.goal)return endRun(true);raf=requestAnimationFrame(loop)
}
function togglePause(){if(!running)return;paused=!paused;$('#pauseRun').textContent=paused?'RESUME':'PAUSE';toast(paused?'Game paused 💛':'Go, Beni! 🐾')}
function startRun(){resetRun();running=true;$('#runOverlay').classList.add('hidden');loop()}
function endRun(cleared=false){running=false;paused=false;cancelAnimationFrame(raf);data.happy=Math.min(100,data.happy+Math.min(20,bones));$('#runOverlay').classList.remove('hidden');if(cleared){distance=levels[runLevel-1].goal;updateHud();const final=runLevel===levels.length;if(!final)data.unlocked=Math.max(data.unlocked,runLevel+1);$('#runOverlay h2').textContent=final?'All 10 levels cleared!':'Level cleared!';$('#levelGoal').textContent=final?'You completed Beni’s Grand Challenge!':`Level ${runLevel+1} is now unlocked.`;$('#startRun').textContent=final?'Play again':'Next level';save();refreshLevels();if(!final)$('#courseLevel').value=runLevel+1}else{$('#runOverlay h2').textContent='Try again';$('#levelGoal').textContent=`You reached ${Math.floor(distance)}m of ${levels[runLevel-1].goal}m.`;$('#startRun').textContent='Retry level'}save()}
$('#courseLevel').onchange=()=>{showGoal();resetRun();draw()};$('#startRun').onclick=startRun;$('#jump').onpointerdown=jump;$('#duck').onpointerdown=()=>duck(true);$('#duck').onpointerup=()=>duck(false);$('#pauseRun').onclick=togglePause;addEventListener('keydown',e=>{if([' ','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();if(e.key===' '||e.key==='ArrowUp')jump();if(e.key==='ArrowDown')duck(true);if(e.key.toLowerCase()==='p')togglePause()});addEventListener('keyup',e=>{if(e.key==='ArrowDown')duck(false)});$('#difficulty').value='normal';render();resetRun();draw();
