const $=s=>document.querySelector(s), canvas=$('#game'),ctx=canvas.getContext('2d'),beniPhoto=new Image();beniPhoto.src='beni.png';
let data=JSON.parse(localStorage.getItem('beniBigDay')||'null')||{coins:20,hunger:72,clean:70,happy:76,owned:[]};

let running=false,paused=false,frame=0,speed=6,distance=0,bones=0,combo=0,keys=0,treasures=0,flightFrames=0,bossHP=6,cloudHits=0,lives=3,beni,things=[],raf,ducking=false,runLevel=1,difficulty='normal',runResult=null;
const modes={
  relaxed:{start:6,max:10,ramp:300,hearts:16,spawn:1.5},
  easy:{start:9,max:14,ramp:250,hearts:12,spawn:1.25},
  normal:{start:10.5,max:17,ramp:210,hearts:5,spawn:1.1},
  hard:{start:13,max:20,ramp:180,hearts:8,spawn:1},
  expert:{start:14.5,max:22,ramp:160,hearts:6,spawn:.9}
};
function trailSpeed(mode,level,travel){return Math.min(mode.max,mode.start+(level-1)*.18+travel/mode.ramp)*.968}
const levels=[
  {goal:400,name:'Sunny Park',sky:'#a9e7ff',ground:'#b5ea8d',far:'#91bd75',accent:'#fff4a8'},
  {goal:550,name:'Candy Sunset',sky:'#ffc2cf',ground:'#e8a6cc',far:'#cb79ac',accent:'#fff0b8'},
  {goal:700,name:'Magic Forest',sky:'#9edbc3',ground:'#75ae78',far:'#477d5d',accent:'#d8f5c4'},
  {goal:850,name:'Moonlit Hills',sky:'#8d91d9',ground:'#7774a8',far:'#55537f',accent:'#f8edb0'},
  {goal:1100,name:'Rainbow Challenge',sky:'#c7b5ff',ground:'#8ed8b2',far:'#6aa38a',accent:'#ffd1e6'},
  {"goal":1160,"name":"Starlight Garden","sky":"#777bb7","ground":"#799b86","far":"#555982","accent":"#fff3bd"},
  {"goal":1220,"name":"Crystal Lake","sky":"#9fd8e8","ground":"#75aaa1","far":"#668fa4","accent":"#d9fbff"},
  {"goal":1280,"name":"Sakura Village","sky":"#f7c9d7","ground":"#9eb985","far":"#c78fa3","accent":"#fff0ca"},
  {"goal":1340,"name":"Aurora Valley","sky":"#4b5985","ground":"#728e91","far":"#4a5c79","accent":"#d8fff0"},
  {"goal":1400,"name":"Beni Dreamland","sky":"#8c7db8","ground":"#8cb39e","far":"#655b91","accent":"#fff4bf"},
  {"goal":1460,"name":"Seashell Beach","sky":"#80d9ef","ground":"#efd39d","far":"#59b6cc","accent":"#fff0d4","motif":"🐚","landmark":"🏝️"},
  {"goal":1520,"name":"Cactus Canyon","sky":"#f0bb89","ground":"#cd976b","far":"#b27155","accent":"#fae1ae","motif":"🌵","landmark":"🏜️"},
  {"goal":1580,"name":"Snowflake Summit","sky":"#bad9f3","ground":"#e9f2fa","far":"#869eb9","accent":"#ffffff","motif":"❄️","landmark":"🏔️"},
  {"goal":1640,"name":"Sunflower Farm","sky":"#b7e8e5","ground":"#bbcc79","far":"#91aa58","accent":"#ffdf70","motif":"🌻","landmark":"🏡"},
  {"goal":1700,"name":"Lantern Festival","sky":"#555982","ground":"#b98c9c","far":"#777099","accent":"#ffd599","motif":"🏮","landmark":"⛩️"},
  {"goal":1760,"name":"Mushroom Hollow","sky":"#96c5b0","ground":"#9ab08a","far":"#5c8270","accent":"#efb5ad","motif":"🍄","landmark":"🪵"},
  {"goal":1820,"name":"Coral Cove","sky":"#75c9cf","ground":"#d6bcab","far":"#528fa8","accent":"#ffb5ad","motif":"🪸","landmark":"🐠"},
  {"goal":1880,"name":"Clockwork Town","sky":"#d4c5ac","ground":"#b39f84","far":"#8b7e73","accent":"#fce0a5","motif":"⚙️","landmark":"🕰️"},
  {"goal":1940,"name":"Bubble Sky","sky":"#c4def7","ground":"#bbaee3","far":"#978ac7","accent":"#f8ecff","motif":"🫧","landmark":"🎈"},
  {"goal":2000,"name":"Royal Cookie Castle","sky":"#f1d7a5","ground":"#cda6b8","far":"#a786af","accent":"#fff5d3","motif":"🍪","landmark":"🏰"}
];
data.unlocked=Math.min(levels.length,Math.max(1,data.unlocked||1));
const shop=[{id:'nooutfit',icon:'✕',name:'No Outfit',price:0,type:'outfit'},{id:'nohat',icon:'✕',name:'No Hat',price:0,type:'hat'},{id:'bow',icon:'🎀',name:'Pink Bow',price:8,type:'hat'},{id:'crown',icon:'👑',name:'Crown',price:18,type:'hat'},{id:'cap',icon:'🧢',name:'Cool Cap',price:15,type:'hat'},{id:'scarf',icon:'🧣',name:'Scarf',price:12,type:'outfit'},{id:'vest',icon:'🦺',name:'Adventure',price:25,type:'outfit'},{id:'blue',icon:'🩵',name:'Blue Room',price:20,type:'room'},{id:'space',icon:'🚀',name:'Space Room',price:35,type:'room'},{id:'teddy',icon:'🧸',name:'Teddy Decor',price:10,type:'decor'}];
function save(){localStorage.setItem('beniBigDay',JSON.stringify(data));render()}
function render(){ $('#coins').textContent=data.coins;['hunger','clean','happy'].forEach(k=>$('#'+k).style.width=data[k]+'%');const box=$('#shopItems');box.innerHTML='';shop.forEach(item=>{const b=document.createElement('button'),owned=data.owned.includes(item.id);b.className=owned?'owned':'';b.innerHTML=`${item.icon}<br>${item.name}<br><small>${owned?'USE':`🪙 ${item.price}`}</small>`;b.onclick=()=>buy(item);box.append(b)});refreshLevels()}
function refreshLevels(){const s=$('#courseLevel');if(!s)return;const chosen=Math.min(Number(s.value)||data.unlocked,data.unlocked);s.innerHTML='';levels.forEach((l,i)=>{const o=document.createElement('option');o.value=i+1;o.disabled=i+1>data.unlocked;o.textContent=`${i+1}. ${l.name}${o.disabled?' — LOCKED':''}`;s.append(o)});s.value=chosen;showGoal()}
function showGoal(){if(runResult)return;const n=Number($('#courseLevel')?.value||1),l=levels[n-1];if(l)$('#levelGoal').textContent=`${l.name} · Level ${n} of ${levels.length} · Finish distance: ${l.goal} m`}
function toast(t){if(running&&!paused&&Date.now()-(toast.lastRunMessage||0)<3000)return;if(running)toast.lastRunMessage=Date.now();const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800)}
function buy(i){if(!data.owned.includes(i.id)){if(data.coins<i.price)return toast('Earn more coins on Treat Trail! 🦴');data.coins-=i.price;data.owned.push(i.id);toast(`${i.name} unlocked! ✨`)}use(i);save()}
function use(i){if(i.type==='hat')$('#hat').textContent=i.id==='nohat'?'':i.icon;if(i.type==='outfit')$('#outfit').textContent=i.id==='nooutfit'?'':i.icon;if(i.type==='room')$('#room').className=`room room-${i.id}`;if(i.type==='decor')$('#decorSide').textContent=i.icon;toast(i.id.startsWith('no')?'Back to fluffy Beni! 🤎':`Beni loves the ${i.name}! 💖`)}
document.querySelectorAll('[data-care]').forEach(b=>b.onclick=()=>{const a=b.dataset.care;if(a==='feed'){data.hunger=Math.min(100,data.hunger+24);data.coins=Math.max(0,data.coins-1);toast('Nom nom nom! 😋')}if(a==='wash'){data.clean=100;toast('Fluffy and clean! 🫧')}if(a==='play'){data.happy=Math.min(100,data.happy+20);toast('Zoomies!! 🎾')}if(a==='sleep'){data.hunger=Math.max(15,data.hunger-8);data.happy=Math.min(100,data.happy+10);toast('Sweet dreams, Beni 🌙')}save()});
setInterval(()=>{data.hunger=Math.max(10,data.hunger-1);data.clean=Math.max(10,data.clean-.5);data.happy=Math.max(10,data.happy-.4);save()},12000);
function stopRun(){if(running){running=false;cancelAnimationFrame(raf);data.happy=Math.min(100,data.happy+Math.min(20,bones));save()}$('#runOverlay').classList.remove('hidden');runResult=null;$('#runOverlay h2').textContent='Ready for the trail?';$('#startRun').textContent='Start level';showGoal()}
function tab(run){if(!run)stopRun();$('#homeScene').classList.toggle('hidden',run);$('#runScene').classList.toggle('hidden',!run);$('#homeTab').classList.toggle('active',!run);$('#runTab').classList.toggle('active',run)}$('#homeTab').onclick=()=>tab(false);$('#runTab').onclick=()=>tab(true);$('#leaveRun').onclick=()=>tab(false);$('#homeHint').onclick=()=>tab(false);
function resetRun(){runResult=null;toast.lastRunMessage=0;clearTimeout(toast.t);$('#toast').classList.remove('show');difficulty=$('#difficulty').value;runLevel=Number($('#courseLevel').value);const m=modes[difficulty];frame=0;speed=trailSpeed(m,runLevel,0);distance=0;bones=0;combo=0;keys=0;treasures=0;flightFrames=0;bossHP=6;cloudHits=0;lives=m.hearts;things=[];ducking=false;paused=false;$('#pauseRun').textContent='PAUSE';beni={x:105,y:330,vy:0,ground:true,jumps:0};updateHud()}
function updateHud(){$('#distance').textContent=Math.floor(distance);$('#runLevel').textContent=runLevel;$('#bones').textContent=bones;$('#combo').textContent=combo;$('#keys').textContent=keys;$('#treasures').textContent=treasures;$('#cloudHits').textContent=cloudHits;$('#bossHealth').textContent=bossHP;$('#bossStatus').classList.toggle('hidden',runLevel!==10);const max=modes[difficulty]?.hearts||3;$('#lives').textContent=`♥ ${lives} / ${max}`;$('#trailProgress').style.width=Math.min(100,distance/(levels[runLevel-1]?.goal||1)*100)+'%'}
function jump(){if(!running||paused||beni.jumps>=2)return;beni.vy=-22;beni.ground=false;beni.jumps++}function duck(on=true){if(running&&!paused)ducking=on}
function spawnThing(){const gap=Math.max(160,modes[difficulty].max*.968*42);if(things.some(t=>930-(t.x+t.w)<gap))return;const r=Math.random(),goldenChance=runLevel===10?.16:.13;if(runLevel>=5&&r<.04)things.push({type:'rainbow',x:930,y:245,w:44,h:44,hit:false});else if(runLevel>=3&&r<.09)things.push({type:'key',x:930,y:235+Math.random()*65,w:40,h:40,hit:false});else if(runLevel>=3&&r<goldenChance)things.push({type:'golden',x:930,y:225+Math.random()*75,w:40,h:40,hit:false});else if(r<goldenChance+.12)things.push({type:'heart',x:930,y:245+Math.random()*55,w:38,h:38,hit:false});else if(r<.62)things.push({type:'cookie',x:930,y:230+Math.random()*75,w:36,h:36,hit:false});else if(r<.83)things.push({type:'cloud',x:930,y:337,w:52,h:43,hit:false});else things.push({type:'cloud',x:930,y:275,w:52,h:43,hit:false})}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function drawThing(t){ctx.save();ctx.translate(t.x,t.y);ctx.globalAlpha=1;ctx.fillStyle='#ffffff';ctx.shadowColor='#26334d';ctx.shadowBlur=3;ctx.shadowOffsetY=1;ctx.font='44px "Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';if(t.type==='cookie')ctx.fillText('🍪',18,18);else if(t.type==='golden')ctx.fillText('🌟',20,20);else if(t.type==='heart')ctx.fillText('💖',19,19);else if(t.type==='rainbow')ctx.fillText('🌈',22,22);else if(t.type==='key')ctx.fillText('🗝️',20,20);else if(t.type==='cloud'){ctx.font='48px "Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.fillText('☁️',27,24)}ctx.restore()}
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
// Each landscape uses its own illustration, with separate 150px-wide spaces.
// Scenery ends at y=205, leaving the item lane below it clear.
const pastelSkies=['#d9f1fa','#ffe1e7','#dcf2e5','#e2def5','#e6e3fc','#e4e5fa','#d8eff5','#ffe5ef','#dcecf3','#ede2fa','#d9f4f3','#ffe9da','#e3f0fc','#eef4d9','#eee0ef','#e4efdb','#d9f3ed','#f5e8df','#e6efff','#fff0dc'];
function sceneryShape(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill()}
function sceneryOval(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function sceneryLine(points,color,width=3){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}
function sceneryRect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
function sceneryStar(x,y,r,color){const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;p.push([x+Math.cos(a)*q,y+Math.sin(a)*q])}sceneryShape(p,color)}
function sceneryFlower(x,y,color){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;circle(x+Math.cos(a)*10,y+Math.sin(a)*10,7,color)}circle(x,y,6,'#ffe4a4')}
function sceneryHouse(color){sceneryRect(-35,-25,70,55,'#fffaf3');sceneryShape([[-47,-25],[0,-65],[47,-25]],color);sceneryRect(-8,4,16,26,'#c8b6cc');for(const x of [-24,15])sceneryRect(x,-13,12,14,'#c2e4e7')}
function sceneryMotif(n,x,y,variant){
  ctx.save();ctx.translate(x,y);const pink='#efb6cb',mint='#b5dcc5',lilac='#c8b9e4',peach='#f3c7a8',blue='#b6d8ec',cream='#fff5d9';
  switch(n){
    case 1: // Heart-shaped park trees.
      sceneryRect(-5,-20,10,55,'#d6bba4');circle(-17,-40,25,mint);circle(17,-40,25,mint);sceneryShape([[-40,-34],[40,-34],[0,7]],mint);sceneryFlower(0,-33,'#fff2f4');break;
    case 2: // Candy-shop lollipops.
      sceneryRect(-4,-15,8,50,'#fffaf4');circle(0,-33,33,pink);ctx.strokeStyle=cream;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-33,21,0,Math.PI*1.7);ctx.stroke();circle(0,-33,6,cream);break;
    case 3: // Fern forest.
      sceneryLine([[0,32],[0,-65]],'#9cbea6',5);for(let i=0;i<4;i++){sceneryOval(-17,-48+i*20,21,9,mint);sceneryOval(17,-40+i*20,21,9,'#c9e6be')}break;
    case 4: // Moonlit, separate rounded hills.
      sceneryOval(0,10,59,28,lilac);sceneryStar(0,-51,16,cream);sceneryStar(-40,-29,6,'#fffaf4');sceneryStar(42,-19,7,pink);break;
    case 5: // Freestanding pastel rainbow arches.
      [pink,peach,'#f4e4a8',mint,blue,lilac].forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,25,53-i*8,Math.PI,0);ctx.stroke()});break;
    case 6: // Star-shaped garden blooms.
      for(const [x,h] of [[-33,4],[0,-30],[33,-8]]){sceneryLine([[x,33],[x,h]],mint,3);sceneryStar(x,h-13,16,variant%2?pink:'#ecdca9')}break;
    case 7: // Crystal islands in little lakes.
      sceneryOval(0,29,62,10,blue);sceneryShape([[-30,22],[-22,-37],[-7,-58],[8,-37],[10,22]],'#b6dfdf');sceneryShape([[13,22],[17,-13],[31,-29],[44,-9],[39,22]],'#d2c6eb');sceneryLine([[-7,-50],[-7,16]],'#f7ffff',3);break;
    case 8: // Pink-roofed village cottages.
      sceneryHouse(pink);sceneryFlower(-49,17,'#f6d1df');break;
    case 9: // Aurora ribbons above tiny ice floes.
      [mint,blue,lilac].forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-56,-55+i*16);ctx.bezierCurveTo(-20,-83+i*16,20,-25+i*16,56,-52+i*16);ctx.stroke()});sceneryOval(0,30,52,8,'#fffaff');break;
    case 10: // Dreamland pillows, with room reserved for the boss.
      sceneryOval(0,15,55,23,'#d7c5eb');sceneryStar(-13,4,13,cream);sceneryStar(27,-48,13,pink);break;
    case 11: // Seashell fans.
      for(let i=0;i<7;i++){const a=Math.PI+i*Math.PI/6;sceneryLine([[0,27],[Math.cos(a)*46,19+Math.sin(a)*50]],i%2?pink:peach,12)}sceneryOval(0,28,15,6,cream);break;
    case 12: // Flowering cactus pots.
      sceneryRect(-19,5,38,29,peach);sceneryLine([[0,0],[0,-58]],mint,18);sceneryLine([[0,-17],[-28,-17],[-28,-41]],mint,13);sceneryLine([[0,-28],[28,-28],[28,-49]],mint,13);sceneryFlower(0,-65,pink);break;
    case 13: // One snowy peak in each space.
      sceneryShape([[-58,33],[0,-73],[58,33]],blue);sceneryShape([[-24,-29],[0,-73],[24,-29],[9,-37],[0,-25],[-10,-37]],'#fffefd');break;
    case 14: // Sunflower rows.
      for(const [x,h] of [[-34,-12],[0,-49],[34,-5]]){sceneryLine([[x,34],[x,h]],'#b0c891',4);sceneryFlower(x,h,'#f2d791')}break;
    case 15: // Paper lanterns on delicate individual stands.
      sceneryLine([[-45,32],[-45,-68],[18,-68],[18,-56]],'#c4b1c9',3);sceneryOval(18,-27,25,30,pink);sceneryLine([[18,-55],[18,0]],'#f8dce6',3);sceneryLine([[18,4],[18,21]],peach,3);break;
    case 16: // Polka-dot mushroom houses.
      sceneryRect(-24,-13,48,46,cream);ctx.fillStyle=pink;ctx.beginPath();ctx.arc(0,-13,49,Math.PI,0);ctx.fill();for(const [x,y] of [[-23,-29],[1,-45],[25,-25]])circle(x,y,6,'#fff6ec');sceneryRect(-8,10,16,23,'#cab9d6');break;
    case 17: // Branching pastel coral.
      sceneryLine([[0,33],[0,-45]],pink,9);for(const sign of [-1,1]){sceneryLine([[0,8],[sign*30,-9],[sign*36,-36]],pink,7);sceneryLine([[sign*30,-9],[sign*49,-13],[sign*53,-26]],peach,5)}circle(0,-53,7,cream);break;
    case 18: // Clock towers.
      sceneryRect(-27,-45,54,78,peach);sceneryShape([[-37,-45],[0,-73],[37,-45]],lilac);circle(0,-20,18,cream);sceneryLine([[0,-32],[0,-20],[10,-15]],'#b29ab6',3);sceneryRect(-9,10,18,23,'#fff5e7');break;
    case 19: // Floating balloon baskets.
      sceneryOval(0,-29,36,43,variant%2?pink:blue);sceneryOval(0,-29,13,43,'#f9eef7');sceneryLine([[-19,6],[-10,28],[10,28],[19,6]],'#cbb9c9',2);sceneryRect(-12,26,24,12,peach);break;
    case 20: // Biscuit castles.
      sceneryRect(-48,-34,25,66,peach);sceneryRect(23,-34,25,66,peach);sceneryRect(-23,-7,46,39,'#f5dcbc');for(const x of [-36,36]){sceneryShape([[x-19,-34],[x,-66],[x+19,-34]],pink);circle(x,-9,5,cream)}ctx.fillStyle='#c8b3c9';ctx.beginPath();ctx.arc(0,16,10,Math.PI,0);ctx.fill();sceneryRect(-10,16,20,16,'#c8b3c9');break;
  }
  ctx.restore();
}
function drawBackground(){
  ctx.save();ctx.globalAlpha=1;
  const n=runLevel,sky=pastelSkies[n-1],t=levels[n-1];
  const meadow=['#d6e9cc','#f0d7e2','#cfe7d9','#ddd9ef'][n%4];
  const wash=ctx.createLinearGradient(0,0,0,368);wash.addColorStop(0,sky);wash.addColorStop(1,'#fff5e7');ctx.fillStyle=wash;ctx.fillRect(0,0,900,430);
  // Soft sky details and broad rolling land make a continuous landscape.
  circle(655,65,31,'#fff3c9');circle(646,58,4,'#fff9e8');
  for(const [x,y] of [[110,96],[390,65],[810,91]]){
    sceneryOval(x,y,48,10,'#fffaf6');sceneryOval(x-12,y-7,22,13,'#fffaf6');sceneryOval(x+17,y-5,18,11,'#fffaf6');
  }
  ctx.fillStyle=n%2?'#e3e4ee':'#e2ead8';ctx.beginPath();ctx.moveTo(0,240);
  ctx.bezierCurveTo(130,133,205,258,350,196);ctx.bezierCurveTo(490,126,600,250,735,185);ctx.quadraticCurveTo(820,160,900,209);ctx.lineTo(900,368);ctx.lineTo(0,368);ctx.closePath();ctx.fill();
  ctx.fillStyle=meadow;ctx.beginPath();ctx.moveTo(0,275);ctx.bezierCurveTo(150,205,260,310,450,254);ctx.bezierCurveTo(640,202,745,293,900,242);ctx.lineTo(900,368);ctx.lineTo(0,368);ctx.closePath();ctx.fill();
  // Each level keeps its own large themed landmarks.
  [100,330,560,790].forEach((x,i)=>sceneryMotif(n,x,229+(i%2)*12,i));
  // Cottages fill the gaps between landmarks, rather than sitting on top of them.
  for(const [x,y] of [[215,277],[675,275]]){
    ctx.save();ctx.translate(x,y);ctx.scale(.65,.65);sceneryHouse(n%2?'#e9b8c9':'#c7bcdf');ctx.restore();
    sceneryLine([[x,y+21],[x-12,y+42],[x+8,y+67]],'#f6e9d7',9);
  }
  ctx.save();ctx.translate(445,278);ctx.scale(.55,.55);sceneryMotif(1,0,0,0);ctx.restore();
  // Low hedges and tiny flowers belong to the scenery, below the item lane.
  for(let i=0;i<9;i++){
    const x=30+i*105;
    sceneryOval(x,350,26,9,n%2?'#bdd9bd':'#c7d9c5');
    sceneryOval(x+19,349,16,10,'#d3e4c9');
  }
  // A translucent wash keeps moving items crisp without erasing the landscape.
  const haze=ctx.createLinearGradient(0,220,0,368);haze.addColorStop(0,'rgba(255,250,244,0)');haze.addColorStop(.65,'rgba(255,250,244,.25)');haze.addColorStop(1,'rgba(255,250,244,.08)');ctx.fillStyle=haze;ctx.fillRect(0,220,900,148);
  sceneryRect(0,368,900,62,'#f4e7d5');sceneryRect(0,368,900,5,'#fff9e9');
  sceneryRect(0,413,900,17,meadow);
  for(let i=0;i<15;i++){
    const x=20+i*62,y=393+(i%3)*8;
    ctx.save();ctx.translate(x,y);ctx.scale(.38,.38);sceneryLine([[0,0],[0,20]],'#9cbd9b',3);sceneryFlower(0,0,['#efb7cd','#c9bce6','#f1d694'][i%3]);ctx.restore();
  }
  for(let x=52;x<900;x+=124)sceneryOval(x,386,9,2,'#fff9ee');
  ctx.fillStyle='#82778e';ctx.font='11px system-ui,sans-serif';ctx.textAlign='left';ctx.fillText('BENI’S LITTLE WORLD  /  '+String(n).padStart(2,'0'),22,25);
  ctx.font='18px system-ui,sans-serif';ctx.fillText(t.name,22,48);
  ctx.restore();
}
function drawBoss(){
  if(runLevel!==10)return;ctx.save();ctx.translate(785,105);
  ctx.fillStyle='rgba(55,45,80,.22)';ctx.beginPath();ctx.ellipse(0,50,70,18,0,0,Math.PI*2);ctx.fill();
  circle(-34,24,30,'#d8d3e8');circle(0,8,43,'#eeeaf5');circle(40,25,31,'#d8d3e8');ctx.fillStyle='#d8d3e8';ctx.fillRect(-35,20,76,35);
  ctx.font='42px "Apple Color Emoji","Segoe UI Emoji",sans-serif';ctx.textAlign='center';ctx.fillText('👑',3,-34);
  ctx.fillStyle='#574867';circle(-15,12,5,'#574867');circle(19,12,5,'#574867');ctx.strokeStyle='#574867';ctx.lineWidth=4;ctx.beginPath();ctx.arc(2,38,14,Math.PI,0);ctx.stroke();
  ctx.fillStyle='#40394c';ctx.fillRect(-54,68,108,10);ctx.fillStyle='#f08aac';ctx.fillRect(-52,70,104*(bossHP/6),6);ctx.restore()
}
function draw(){drawBackground();drawBoss();ctx.save();ctx.fillStyle='rgba(34,47,39,.22)';ctx.beginPath();ctx.ellipse(beni.x+34,374,31,8,0,0,Math.PI*2);ctx.fill();const ph=ducking?48:72,py=ducking?beni.y+4:beni.y-42;if(flightFrames>0){ctx.strokeStyle='#697e65';ctx.lineWidth=3;ctx.beginPath();ctx.arc(beni.x+34,py+ph/2,ph/2+5,0,Math.PI*2);ctx.stroke()}ctx.beginPath();ctx.arc(beni.x+34,py+ph/2,ph/2,0,Math.PI*2);ctx.clip();if(beniPhoto.complete)ctx.drawImage(beniPhoto,beni.x,py,68,ph);ctx.restore();things.forEach(drawThing)}
function loop(){
  if(!running)return;
  if(paused){raf=requestAnimationFrame(loop);return}
  frame++;const m=modes[difficulty],cfg=levels[runLevel-1];distance+=speed/45;
  const interval=Math.max(48,Math.floor((88-Math.min(runLevel,20))*m.spawn));
  if(frame%interval===0)spawnThing();
  speed=trailSpeed(m,runLevel,distance);
  if(flightFrames>0){flightFrames--;beni.y=235;beni.vy=0;beni.ground=false;if(flightFrames===0)toast('Rainbow flight finished—land safely! 🌈')}
  else{beni.vy+=1.6;beni.y+=beni.vy;if(beni.y>=330){beni.y=330;beni.vy=0;beni.ground=true;beni.jumps=0}}
  const box={x:beni.x+8,y:beni.y+(ducking?15:-35),w:52,h:ducking?35:62};
  things.forEach(t=>{t.x-=speed;if(t.hit||!collide(box,t))return;t.hit=true;
    if(t.type==='cloud'&&flightFrames>0){toast('Rainbow shield! Cloud blocked! 🌈');return}
    if(t.type==='cookie'||t.type==='golden'){
      const prize=t.type==='golden'?3:1;bones+=prize;data.coins+=prize;combo++;
      if(t.type==='golden'&&runLevel===10&&bossHP>0){bossHP--;toast(`Star hit! Cloud King has ${bossHP} power left! 👑`)}
      else if(combo%5===0){data.coins+=2;toast(`${combo} cookie combo! +2 bonus coins! ✨`)}else if(t.type==='golden')toast('Golden cookie: +3 coins')
    }else if(t.type==='heart'){
      const max=modes[difficulty].hearts;if(lives<max){lives++;toast('Beni found a heart! +1 health 💖')}else{data.coins++;toast('Full health! +1 coin 💖')}
    }else if(t.type==='rainbow'){
      flightFrames=300;beni.y=235;beni.vy=0;toast('Rainbow flight! Beni is safe for 5 seconds! 🌈')
    }else if(t.type==='key'){
      keys++;if(keys%3===0){treasures++;data.coins+=10;toast('Treasure opened! +10 coins! 🎁')}else toast(`${keys%3}/3 keys found! Keep searching! 🗝️`)
    }else{lives--;cloudHits++;combo=0;toast(`Cloud hit ${cloudHits}! Combo reset! ☁️`);}
    updateHud()
  });
  things=things.filter(t=>t.x>-70&&!t.hit);if(frame%6===0)updateHud();draw();
  if(lives<=0)return endRun(false);if(distance>=cfg.goal)return endRun(true);raf=requestAnimationFrame(loop)
}
function togglePause(){if(!running)return;paused=!paused;$('#pauseRun').textContent=paused?'RESUME':'PAUSE';toast(paused?'Game paused 💛':'Go, Beni! 🐾')}
function startRun(){resetRun();running=true;$('#runOverlay').classList.add('hidden');loop()}
function endRun(cleared=false){
  running=false;paused=false;cancelAnimationFrame(raf);
  runResult=cleared?'cleared':'failed';
  data.happy=Math.min(100,data.happy+Math.min(20,bones));
  $('#runOverlay').classList.remove('hidden');
  const final=runLevel===levels.length;
  if(cleared){
    distance=levels[runLevel-1].goal;updateHud();
    if(!final)data.unlocked=Math.max(data.unlocked,runLevel+1);
  }
  save();
  if(cleared){
    $('#runOverlay h2').textContent=final?'All levels complete':'Level complete';
    $('#levelGoal').textContent=final?'You completed every course.':`${levels[runLevel-1].name} complete · ${levels[runLevel].name} unlocked`;
    $('#startRun').textContent=final?'Play again':'Next level';
    $('#courseLevel').value=final?runLevel:runLevel+1;
  }else{
    $('#runOverlay h2').textContent='Run ended';
    $('#levelGoal').textContent=`You reached ${Math.floor(distance)} m of ${levels[runLevel-1].goal} m.`;
    $('#startRun').textContent='Retry level';
  }
}
$('#courseLevel').onchange=()=>{resetRun();$('#runOverlay h2').textContent='Ready for the trail?';$('#startRun').textContent='Start level';showGoal();draw()};$('#startRun').onclick=startRun;$('#jump').onpointerdown=jump;$('#duck').onpointerdown=()=>duck(true);$('#duck').onpointerup=()=>duck(false);$('#pauseRun').onclick=togglePause;addEventListener('keydown',e=>{if([' ','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();if(e.key===' '||e.key==='ArrowUp')jump();if(e.key==='ArrowDown')duck(true);if(e.key.toLowerCase()==='p')togglePause()});addEventListener('keyup',e=>{if(e.key==='ArrowDown')duck(false)});$('#difficulty').value='normal';render();resetRun();draw();
