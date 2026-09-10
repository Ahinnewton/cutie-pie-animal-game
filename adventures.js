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
const giftIcons=['🎀','🌼','🧣','👑','🦋','🌷','🎩','🍓','🌙','⭐','🐚','🌵','❄️','🌻','🏮','🍄','🪸','🎵','🎈','🏰'];
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
  data.butterfly=!!data.butterfly;
  data.activeGift=data.activeGift||null;
  levels.forEach((l,i)=>shop.push({id:'gift'+(i+1),name:l.name+' Ribbon',icon:giftIcons[i],price:0,type:'gift',level:i+1}));
}
function currentMission(){return missions[(runLevel-1)%missions.length]}
function resetAdventures(){
  magnetFrames=0;butterflyRescued=false;spawnCount=0;cleanCookies=0;runCookies=0;missionDone=false;missionReward=0;
  $('#party').classList.add('hidden');$('#runReward').textContent='';
}
function updateAdventures(){
  const m=currentMission();
  if(!missionDone&&m.value()>=m.goal){missionDone=true;missionReward=5;data.coins+=5;toast('Mission complete! +5 coins ✨')}
  $('#missionProgress').textContent=missionDone?'✓ Mission complete · +5 coins':`${m.name} · ${Math.min(m.goal,m.value())}/${m.goal}`;
  $('#powerStatus').textContent=magnetFrames>0?`🧲 ${Math.ceil(magnetFrames/60)}s`:butterflyRescued?'🦋 Flying with Beni!':'🦋 Rescue a butterfly';
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
  $('#butterflyHome').textContent=data.butterfly?'🦋 Your rescued butterfly visits the garden!':'🦋 Find a butterfly on the trail and bring a friend home.';
  const equipped=shop.find(i=>i.id===data.activeGift);if(equipped)$('#hat').textContent=equipped.icon;
}
function finishAdventures(){
  const first=!data.cleared.includes(runLevel);
  if(first){data.cleared.push(runLevel);const id='gift'+runLevel;if(!data.owned.includes(id))data.owned.push(id)}
  $('#runReward').textContent=[first?`🎁 New gift: ${levels[runLevel-1].name} Ribbon! Find it in Beni’s Boutique.`:'Welcome back! Your friends are cheering for you.',missionDone?'✨ Mission reward: +5 coins.':'',butterflyRescued?'🦋 You rescued a butterfly!':''].filter(Boolean).join(' ');
  const row=$('#partyFriends');row.innerHTML='';
  animalFriends.slice(0,Math.min(animalFriends.length,data.cleared.length+1)).forEach(f=>{const el=document.createElement('span');el.textContent=f.icon;el.title=f.name;row.append(el)});
  $('#party').classList.remove('hidden');
}
function drawCompanions(){
  ctx.save();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.shadowColor='#756684';ctx.shadowBlur=2;ctx.textAlign='center';ctx.textBaseline='middle';
  if(butterflyRescued){ctx.font='28px "Apple Color Emoji",sans-serif';ctx.fillText('🦋',beni.x-18,beni.y-55+Math.sin(frame/15)*8)}
  if(magnetFrames>0){ctx.strokeStyle='#df8bba';ctx.lineWidth=2;ctx.setLineDash([6,7]);ctx.beginPath();ctx.arc(beni.x+34,beni.y-6,72,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
  if(data.activeGift){const gift=shop.find(i=>i.id===data.activeGift);if(gift){ctx.font='24px "Apple Color Emoji",sans-serif';ctx.fillText(gift.icon,beni.x+34,beni.y-49)}}
  ctx.restore();
}
