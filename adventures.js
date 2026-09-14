// Upgrade numbered course rewards once, preserving existing progress and outfits.
function migrateSeasonLevels(){
  if(data.courseVersion>=3)return;
  // v1 was the original 20-course order. v2 briefly inserted Christmas at 11
  // and winter at 21. Match rewards to their scenery when moving to season order.
  const oldScenes=data.courseVersion===2
    ?[1,2,3,4,5,6,7,8,9,10,'christmas',11,12,13,14,15,16,17,18,19,'winter',20]
    :[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  const newScenes=[1,8,3,6,5,2,7,11,12,14,17,'autumn',16,15,18,10,9,13,'winter','christmas',19,20];
  const move=n=>{const scene=oldScenes[Number(n)-1];const found=newScenes.indexOf(scene);return found<0?null:found+1};
  const oldUnlocked=Math.max(1,Number(data.unlocked)||1);
  data.unlocked=oldUnlocked>=oldScenes.length?newScenes.length:Math.min(newScenes.length,oldUnlocked);
  data.cleared=(Array.isArray(data.cleared)?data.cleared:[]).map(move).filter(Boolean);
  const moveGift=id=>{if(typeof id!=='string'||!/^gift\d+$/.test(id))return id;const n=move(id.slice(4));return n?'gift'+n:null};
  data.owned=(Array.isArray(data.owned)?data.owned:[]).map(moveGift).filter(Boolean);
  data.activeGift=moveGift(data.activeGift);
  data.courseVersion=3;
}
// Little adventures share the existing save and coin balance.
const animalFriends=[
  {name:'Pip the bunny',icon:'🐰'}, {name:'Mochi the kitten',icon:'🐱'},
  {name:'Puddle the duckling',icon:'🐥'}, {name:'Clover the fawn',icon:'🦌'},
  {name:'Peaches the fox cub',icon:'🦊'}, {name:'Buttons the bear cub',icon:'🐻'}
];
const gardenItems=[
  {id:'daisies',name:'Daisy patch',icon:'🌼',price:8},
  {id:'tulips',name:'Tulip bed',icon:'🌷',price:12},
  {id:'tree',name:'Blossom tree',icon:'🌸',price:18},
  {id:'pond',name:'Duck pond',icon:'🦆',price:22},
  {id:'swing',name:'Little swing',icon:'🎠',price:30},
  {id:'house',name:'Friends’ cottage',icon:'🏡',price:40}
];
const giftIcons=['🌼','🌸','🌿','⭐','🌈','🍬','💎','🐚','🌵','🌻','🪸','🍁','🍄','🏮','🕰️','🌙','✨','❄️','☃️','🎄','🎈','🏰'];
const MAX_BUTTERFLIES=20;
// Twenty distinct soft colors sampled from the user's pastel reference palette.
const BUTTERFLY_PALETTE=['#ABDEE6','#CBAACB','#FFFFB5','#FFCCB6','#F3B0C3','#C6DBDA','#FEE1E8','#FED7C3','#F6EAC2','#ECD5E3','#FFC5BF','#FF968A','#FFAEA5','#FFDDBE','#FFC8A2','#8FCACA','#CCE2CB','#B6CFB6','#97C1A9','#A2E1DB'];
const BUTTERFLY_COLORS=BUTTERFLY_PALETTE.map((color,i)=>[color,i%2?'#FFF4E8':'#FFFFFF']);
let magnetFrames=0,butterflyRescued=false,spawnCount=0,cleanCookies=0,runCookies=0,missionDone=false,missionReward=0;
const missions=[
  {name:'Collect 10 cookies without a cloud hit',goal:10,value:()=>cleanCookies},
  {name:'Collect 15 cookies',goal:15,value:()=>runCookies},
  {name:'Find 3 keys',goal:3,value:()=>keys}
];
function initAdventures(){
  data.cleared=Array.isArray(data.cleared)?data.cleared:[];
  data.garden=Array.isArray(data.garden)?data.garden:Array(6).fill(null);
  data.garden=data.garden.slice(0,6);while(data.garden.length<6)data.garden.push(null);
  data.butterflyCount=Number.isFinite(data.butterflyCount)?Math.max(0,Math.min(MAX_BUTTERFLIES,Math.floor(data.butterflyCount))):(data.butterfly?1:0);
  data.butterfly=data.butterflyCount>0;
  data.activeGift=data.activeGift||null;
  levels.forEach((l,i)=>shop.push({id:'gift'+(i+1),name:l.name+' Ribbon',icon:giftIcons[i],price:0,type:'gift',level:i+1}));
}
function currentMission(){return missions[(runLevel-1)%missions.length]}
function resetAdventures(){
  magnetFrames=0;butterflyRescued=!!data.butterfly;spawnCount=0;cleanCookies=0;runCookies=0;missionDone=false;missionReward=0;
  $('#party').classList.add('hidden');$('#runReward').textContent='';
}
function updateAdventures(){
  const m=currentMission();
  if(!missionDone&&m.value()>=m.goal){missionDone=true;missionReward=5;data.coins+=5;toast('Mission complete! +5 coins ✨')}
  $('#missionProgress').textContent=missionDone?'✓ Mission complete · +5 coins':`${m.name} · ${Math.min(m.goal,m.value())}/${m.goal}`;
  $('#powerStatus').textContent=magnetFrames>0?`🧲 ${Math.ceil(magnetFrames/60)}s`:butterflyRescued?`🦋 ${data.butterflyCount}/${MAX_BUTTERFLIES} flying with Beni!`:'🦋 Rescue a butterfly';
}
function renderAdventures(){
  const garden=$('#gardenPlots');garden.innerHTML='';
  data.garden.forEach((id,index)=>{
    const item=gardenItems.find(i=>i.id===id),plot=document.createElement('div');plot.className='garden-plot';
    const art=document.createElement('span');art.className='garden-art'+(id==='swing'?' garden-swing':'');art.textContent=item?item.icon:'✿';plot.append(art);
    const label=document.createElement('span');label.textContent=item?item.name:'Empty patch';plot.append(label);
    if(item){const remove=document.createElement('button');remove.textContent='Remove · +'+item.price+' coins';remove.onclick=()=>{if(data.garden[index]!==id)return;data.garden[index]=null;data.coins+=item.price;save()};plot.append(remove)}
    garden.append(plot);
  });
  const store=$('#gardenShop');store.innerHTML='';
  gardenItems.forEach(item=>{const b=document.createElement('button');b.textContent=`${item.icon} ${item.name} · ${item.price} coins`;b.disabled=data.coins<item.price||!data.garden.includes(null);b.onclick=()=>{
    const slot=data.garden.indexOf(null);if(slot<0||data.coins<item.price)return;
    data.coins-=item.price;data.garden[slot]=item.id;save();toast('A lovely new '+item.name.toLowerCase()+'! 🌷');
  };store.append(b)});
  const friends=$('#animalFriends');friends.innerHTML='';
  animalFriends.forEach((f,i)=>{const el=document.createElement('span');const unlocked=data.cleared.length>=i;el.textContent=unlocked?`${f.icon} ${f.name}`:`🔒 Clear ${i} levels`;friends.append(el)});
  $('#butterflyHome').textContent=data.butterfly?`🦋 Butterfly friends: ${data.butterflyCount}/${MAX_BUTTERFLIES}!`:'🦋 Find a butterfly on the trail and bring a friend home.';
  const equipped=shop.find(i=>i.id===data.activeGift);if(equipped)$('#hat').textContent=equipped.icon;
}
function finishAdventures(){
  const first=!data.cleared.includes(runLevel);
  if(first){data.cleared.push(runLevel);const id='gift'+runLevel;if(!data.owned.includes(id))data.owned.push(id)}
  $('#runReward').textContent=[first?`🎁 New gift: ${levels[runLevel-1].name} Ribbon! Find it in Beni’s Boutique.`:'Welcome back! Your friends are cheering for you.',missionDone?'✨ Mission reward: +5 coins.':'',butterflyRescued?`🦋 Butterfly friends: ${data.butterflyCount}/${MAX_BUTTERFLIES}!`:''].filter(Boolean).join(' ');
  const row=$('#partyFriends');row.innerHTML='';
  animalFriends.slice(0,Math.min(animalFriends.length,data.cleared.length+1)).forEach(f=>{const el=document.createElement('span');el.textContent=f.icon;el.title=f.name;row.append(el)});
  $('#party').classList.remove('hidden');
}
function drawButterfly(x,y,colors,phase){
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(frame/14+phase)*.12);const flap=.86+Math.sin(frame/5+phase)*.14;
  const outline='#5f5361';ctx.globalAlpha=.86;ctx.fillStyle=colors[0];ctx.strokeStyle=outline;ctx.lineWidth=1.05;ctx.beginPath();ctx.ellipse(-4,-2,5*flap,4,Math.PI*.12,0,Math.PI*2);ctx.ellipse(4,-2,5*flap,4,-Math.PI*.12,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.globalAlpha=.72;ctx.fillStyle=colors[1];ctx.beginPath();ctx.ellipse(-3,3,3.5*flap,2.7,Math.PI*.16,0,Math.PI*2);ctx.ellipse(3,3,3.5*flap,2.7,-Math.PI*.16,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.globalAlpha=.9;ctx.fillStyle=outline;ctx.beginPath();ctx.roundRect(-1, -3, 2, 8, 1);ctx.fill();
  ctx.strokeStyle=outline;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-.5,-2.5);ctx.quadraticCurveTo(-2.5,-6,-4,-6.5);ctx.moveTo(.5,-2.5);ctx.quadraticCurveTo(2.5,-6,4,-6.5);ctx.stroke();ctx.beginPath();ctx.arc(-4,-6.5,.7,0,Math.PI*2);ctx.arc(4,-6.5,.7,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawCompanions(){
  ctx.save();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.shadowColor='#756684';ctx.shadowBlur=2;ctx.textAlign='center';ctx.textBaseline='middle';
  if(butterflyRescued){for(let i=0;i<data.butterflyCount;i++){const dx=-12+(i%5)*18,dy=-58-Math.floor(i/5)*17,phase=i*2.1;drawButterfly(beni.x+dx,beni.y+dy+Math.sin(frame/15+phase)*6,BUTTERFLY_COLORS[i%BUTTERFLY_COLORS.length],phase)}}
  if(magnetFrames>0){ctx.strokeStyle='#df8bba';ctx.lineWidth=2;ctx.setLineDash([6,7]);ctx.beginPath();ctx.arc(beni.x+34,beni.y-6,72,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
  if(data.activeGift){const gift=shop.find(i=>i.id===data.activeGift);if(gift){ctx.font='24px "Apple Color Emoji",sans-serif';ctx.fillText(gift.icon,beni.x+34,beni.y-49)}}
  ctx.restore();
}
