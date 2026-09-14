// Seasonal scenery is painted behind Beni and obstacles; particles follow game time.
function autumnTree(x,y,size,colors){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);
  sceneryRect(-7,-52,14,88,'#b58b78');
  sceneryLine([[0,-15],[-31,-55]],'#b58b78',7);sceneryLine([[0,-29],[32,-68]],'#b58b78',7);
  [[-34,-66],[0,-86],[35,-71],[-18,-43],[24,-42]].forEach(([a,b],i)=>{
    circle(a,b,25,colors[i%colors.length]);circle(a+17,b+5,19,colors[(i+1)%colors.length]);circle(a-13,b+10,17,colors[(i+2)%colors.length]);
  });
  ctx.restore();
}
function autumnLeaf(x,y,color,turn=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(turn);ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,0,6,3.3,-.35,0,Math.PI*2);ctx.fill();
  sceneryLine([[-4,2],[5,-3]],'#ad806f',.8);ctx.restore();
}
function drawAutumnBackground(){
  const sky=ctx.createLinearGradient(0,0,0,368);sky.addColorStop(0,'#F6EAC2');sky.addColorStop(1,'#FEE1E8');ctx.fillStyle=sky;ctx.fillRect(0,0,900,430);
  circle(748,67,31,'#FFFFB5');
  for(const [x,y] of [[130,92],[415,71],[805,112]]){sceneryOval(x,y,46,10,'#fff8ed');sceneryOval(x-13,y-7,20,13,'#fff8ed');sceneryOval(x+16,y-5,18,11,'#fff8ed')}
  sceneryShape([[0,238],[120,166],[235,230],[362,150],[485,224],[630,158],[760,224],[900,165],[900,368],[0,368]],'#C6DBDA');
  sceneryOval(190,314,330,104,'#CCE2CB');sceneryOval(700,310,370,108,'#B6CFB6');
  const leaves=['#FF968A','#FFC8A2','#FFDDBE','#F3B0C3','#CBAACB'];
  autumnTree(108,304,1.05,leaves);autumnTree(350,294,.82,leaves.slice(1));autumnTree(600,302,1.12,leaves.slice(2).concat(leaves));autumnTree(835,310,.78,leaves);
  // A tiny woodland cottage and leaf piles make the forest feel inhabited.
  ctx.save();ctx.translate(470,292);ctx.scale(.68,.68);sceneryHouse('#FFAEA5');sceneryOval(0,29,55,8,'#F6EAC2');ctx.restore();
  for(let i=0;i<9;i++){const x=30+i*110;sceneryOval(x,351,32,9,leaves[i%leaves.length]);sceneryOval(x+20,350,21,8,leaves[(i+2)%leaves.length])}
  sceneryRect(0,368,900,62,'#F6EAC2');sceneryRect(0,368,900,6,'#fff7e7');sceneryRect(0,415,900,15,'#B6CFB6');
  for(let i=0;i<42;i++){const x=(i*151+Math.sin(frame/30+i)*18+900)%900,y=(i*67+frame*(.16+(i%3)*.08))%360;ctx.globalAlpha=y>280?.38:.8;autumnLeaf(x,y,leaves[i%leaves.length],frame/70+i)}
  ctx.globalAlpha=1;ctx.fillStyle='#806a78';ctx.textAlign='left';ctx.font='11px system-ui,sans-serif';ctx.fillText('BENI’S LITTLE WORLD  /  '+String(runLevel).padStart(2,'0'),22,25);ctx.font='18px system-ui,sans-serif';ctx.fillText(levels[runLevel-1].name,22,48);
}
function holidayPine(x,y,size,festive){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);
  sceneryRect(-5,-12,10,24,'#b99288');
  for(let i=0;i<3;i++){
    const top=-98+i*25,w=23+i*12;
    sceneryShape([[-w,top+42],[0,top],[w,top+42]],festive?'#79b9a7':'#a0c8db');
    sceneryShape([[-w*.48,top+20],[0,top],[w*.48,top+20],[7,top+16],[0,top+23],[-8,top+16]],'#fffdfb');
  }
  if(festive){
    sceneryStar(0,-104,12,'#ffe49c');
    [[-13,-59],[12,-49],[-23,-27],[3,-20],[27,-12]].forEach(([a,b],i)=>circle(a,b,4.5,['#f7adc5','#ffe8a1','#d5c1ef'][i%3]));
    sceneryLine([[-20,-43],[0,-35],[22,-39]],'#fff1bf',2);
  }
  ctx.restore();
}
function holidaySnowFriend(x,y,bunny=false){
  ctx.save();ctx.translate(x,y);
  sceneryOval(0,29,30,5,'#cbdde9');
  sceneryOval(0,6,24,25,'#fffdfc');circle(0,-23,18,'#fffdfc');
  if(bunny){
    sceneryOval(-10,-49,6,20,'#fffdfc');sceneryOval(10,-49,6,20,'#fffdfc');
    sceneryOval(-10,-49,2.5,13,'#f1c6d9');sceneryOval(10,-49,2.5,13,'#f1c6d9');
  }else{
    sceneryRect(-17,-47,34,8,'#c6b3df');sceneryRect(-11,-62,22,17,'#c6b3df');circle(0,-65,6,'#fffdfc');
  }
  circle(-6,-24,2,'#655b76');circle(6,-24,2,'#655b76');
  sceneryOval(-12,-17,4,2.5,'#f2bed3');sceneryOval(12,-17,4,2.5,'#f2bed3');
  sceneryLine([[-3,-16],[0,-14],[3,-16]],'#9b7f9d',1.5);
  sceneryRect(-17,-6,34,7,'#e9acc8');sceneryRect(10,-1,7,16,'#e9acc8');
  circle(0,10,2.5,'#c4b0d8');circle(0,21,2.5,'#c4b0d8');ctx.restore();
}
function holidayGift(x,y,color){
  sceneryRect(x-14,y-22,28,22,color);sceneryRect(x-16,y-25,32,7,color);
  sceneryRect(x-2,y-25,4,25,'#fff2c6');
  sceneryOval(x-6,y-29,6,3,'#fff2c6');sceneryOval(x+6,y-29,6,3,'#fff2c6');
}
function drawHolidayBackground(theme){
  const festive=theme==='christmas';
  const sky=ctx.createLinearGradient(0,0,0,368);
  sky.addColorStop(0,festive?'#e7cce0':'#c9dced');sky.addColorStop(1,festive?'#fff1e7':'#f3eaff');
  ctx.fillStyle=sky;ctx.fillRect(0,0,900,430);
  circle(748,69,30,'#fff5d6');circle(738,64,2,'#bda3aa');circle(752,64,2,'#bda3aa');
  sceneryLine([[740,74],[745,77],[750,74]],'#bda3aa',1.5);
  for(let i=0;i<7;i++)sceneryStar(200+i*93,55+(i%3)*26,3+i%2,'#fffaf5');
  sceneryOval(160,289,310,105,'#e4e7f4');sceneryOval(710,275,360,105,'#dce8f2');
  sceneryOval(420,332,560,101,'#f8faff');
  if(festive){
    sceneryLine([[0,91],[150,121],[300,94],[450,122],[600,94],[750,120],[900,92]],'#b39bae',2);
    for(let i=0;i<19;i++)circle(i*50,96+Math.sin(i*Math.PI/3)*12,4,['#fff0a9','#f4afc5','#a4d9c6'][i%3]);
    holidayPine(105,250,1.1,true);holidayPine(540,239,1.3,true);holidayPine(805,253,.85,true);
    for(const x of [285,690]){
      ctx.save();ctx.translate(x,222);sceneryHouse('#da9caf');
      sceneryLine([[-44,-25],[0,-64],[44,-25]],'#fffdfc',7);
      for(const wx of [-24,15])sceneryRect(wx,-13,12,14,'#ffe4a3');
      circle(0,-17,9,'#8bc3ad');circle(0,-17,5,'#fff6ed');circle(0,-9,3,'#eea4b8');ctx.restore();
    }
    holidayGift(70,271,'#ecc0d8');holidayGift(137,270,'#b8daca');holidayGift(570,269,'#d3bfeb');
    holidaySnowFriend(415,254);
  }else{
    holidayPine(90,260,1.1,false);holidayPine(300,238,.8,false);holidayPine(755,252,1.2,false);holidayPine(835,270,.65,false);
    holidaySnowFriend(210,250,true);holidaySnowFriend(465,247);holidaySnowFriend(640,262,true);
    sceneryOval(550,304,63,12,'#d5e9f4');sceneryLine([[510,304],[546,300],[573,302]],'#f9fdff',2);
  }
  // Keep a clear, softly tinted lane so white obstacle clouds remain visible.
  sceneryRect(0,306,900,62,festive?'rgba(208,177,196,.20)':'rgba(161,184,216,.23)');
  sceneryRect(0,368,900,62,'#e8eaf6');sceneryRect(0,368,900,7,'#fffdfd');
  for(let i=0;i<12;i++){
    const x=30+i*79;
    sceneryOval(x,413,45,13,'#fffafb');
    if(festive&&i%2===0)holidayGift(x,413,i%4?'#b9d9ce':'#ebc0d5');
    else {sceneryOval(x-4,390,2.5,4,'#c8cde2');sceneryOval(x+5,397,2.5,4,'#c8cde2')}
  }
  for(let i=0;i<65;i++){
    const x=(i*137+Math.sin(frame/95+i)*13+900)%900,y=(i*53+frame*(.35+(i%3)*.16))%428;
    ctx.globalAlpha=y>285&&y<368?.3:.8;circle(x,y,1.2+(i%3)*.6,'#ffffff');
  }
  ctx.globalAlpha=1;ctx.fillStyle='#776882';ctx.textAlign='left';ctx.font='11px system-ui,sans-serif';
  ctx.fillText('BENI’S LITTLE WORLD  /  '+String(runLevel).padStart(2,'0'),22,25);
  ctx.font='18px system-ui,sans-serif';ctx.fillText(levels[runLevel-1].name,22,48);
}
