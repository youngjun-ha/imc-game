const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE = 32, MAP_W = 70, MAP_H = 45;
const SAVE_KEY = "imc-neighborhood-save-v4";
const palette = { grass:"#7f9b68",grass2:"#738e5f",road:"#777b76",roadEdge:"#686d68",wall:"#ddd0af",roof:"#9d584c",roof2:"#6d777f",fence:"#6c5745",tree:"#3e6b4b",trunk:"#5c4432",water:"#5d8ca0",accent:"#f2c14e" };

const buildings = [
  {x:3,y:3,w:10,h:7,color:palette.roof,name:"임씨의 집"},{x:17,y:2,w:9,h:8,color:palette.roof2,name:"태엽 고물상"},
  {x:31,y:3,w:12,h:7,color:"#a97a4d",name:"달빛 사진관"},{x:49,y:2,w:15,h:8,color:"#756f83",name:"해질녘 연립"},
  {x:5,y:17,w:12,h:8,color:"#a96961",name:"수상한 이발소"},{x:22,y:18,w:8,h:6,color:"#697f80",name:"빈집"},
  {x:36,y:16,w:13,h:9,color:"#9b6f53",name:"심야 라디오"},{x:55,y:18,w:10,h:7,color:"#7c7259",name:"멈춘 공사장"},
  {x:2,y:33,w:13,h:8,color:"#7d6a78",name:"점괘 빌라"},{x:22,y:34,w:12,h:7,color:"#a5644f",name:"벽화 작업실"},
  {x:43,y:32,w:9,h:9,color:"#687e6a",name:"언덕 시인의 집"},{x:58,y:33,w:10,h:8,color:"#855f55",name:"바람 언덕"},
];
const ponds=[{x:17,y:29,w:7,h:4}];
const fences=[{x:1,y:13,w:12},{x:27,y:13,w:12},{x:54,y:13,w:14},{x:1,y:28,w:10},{x:27,y:28,w:8},{x:55,y:28,w:13}];
const sceneryTrees=[[1,2],[14,5],[28,6],[47,7],[67,4],[3,15],[19,16],[33,15],[51,16],[68,20],[2,31],[16,38],[38,35],[54,31],[69,38]];
const roadPaths=[
  [[0,12],[9,11],[18,13],[28,11],[38,13],[48,11],[58,12],[70,10]],
  [[0,27],[9,26],[18,30],[28,26],[38,29],[49,26],[59,28],[70,25]],
  [[15,0],[15,10],[18,18],[17,27],[20,36],[18,45]],
  [[46,0],[46,10],[51,18],[50,27],[55,35],[54,45]],
  [[18,43],[29,42],[39,43],[48,40],[58,42],[70,41]],
];
const hills=[{x:39,y:38,r:6},{x:66,y:16,r:5}];

const npcs=[
  {id:"junk",name:"태엽 고물상 춘배",x:15.5,y:11.5,color:"#bb6b4f",icon:"춘",style:"wrench",event:"lamp",intro:["임씨! 마침 잘 왔어. 골목 가로등이 낮에도 깜빡거린다니까.","북쪽 골목 끝의 가로등을 한 번 두드려 봐. 기계는 정직한 충격에 답하거든!"],reminder:["깜빡이는 가로등은 북쪽 담장 아래에 있어. 살살 두드려야 해!"],thanks:["오, 불빛이 안정됐군! 역시 내 진단과 임씨의 손맛은 완벽해."]},
  {id:"detective",name:"골목 탐정 미미",x:43.5,y:11.5,color:"#75639b",icon:"미",style:"detective",event:"cat",intro:["쉿, 임씨. 지금부터 극비 수사야.","연립주택의 줄무늬 고양이가 사라졌어. 동쪽 언덕 근처에서 방울 소리가 났지."],reminder:["수사 원칙 제1조. 고양이는 사람이 잘 안 가는 풀숲을 좋아한다."],thanks:["사건 해결! 임씨는 오늘부터 명예 골목 탐정이야."]},
  {id:"courier",name:"졸린 택배기사 만수",x:52.5,y:27,color:"#d39b43",icon:"택",style:"parcel",event:"parcel",intro:["임씨... 딱 3분만 자려다가 30분이 지났네.","바람 언덕 아래 우체통에 이 작은 소포 좀 넣어줄래? 난 여기서 눈을... 아니, 짐을 지킬게."],reminder:["소포는 남동쪽 바람 언덕 아래의 초록 우체통이야. 난 안 자고 있어... 정말이야."],thanks:["배달 완료 확인! 임씨 덕분에 오늘도 지각은 아니고... 약간의 시간차 배달이야."]},
  {id:"dj",name:"심야 DJ 단비",x:25.5,y:31.5,color:"#477ca3",icon:"DJ",style:"headphone",lines:["낮에는 라디오가 쉬는 시간인데, 임씨한테만 한 곡 틀어줄게.","골목의 소리를 잘 들어봐. 사건이 있는 곳은 평소와 다른 소리가 나거든."]},
  {id:"fortune",name:"거꾸로 점쟁이 복례",x:8.5,y:30.5,color:"#a85e8e",icon:"점",style:"shawl",lines:["임씨, 오늘 운세는 '길을 잃어야 길을 찾는다'야.","동쪽에서 고양이 방울, 북쪽에서 전기 소리, 남쪽에서 코 고는 소리가 들리는구나."]},
  {id:"artist",name:"벽화 화가 솔",x:38.5,y:28.5,color:"#4f9b78",icon:"솔",style:"beret",lines:["임씨가 지나간 자리는 이상하게 파란색으로 그리고 싶어져.","언덕의 굽은 길이 마음에 들어. 곧 담장 전체를 지도처럼 칠할 거야."]},
  {id:"poet",name:"언덕 시인 윤",x:55,y:42,color:"#657b66",icon:"윤",style:"scarf",final:true,locked:["아직 골목의 이야기가 세 조각 부족하군요.","깜빡이는 빛, 사라진 방울, 늦은 소포를 만나고 다시 오세요."],lines:["임씨가 해결한 세 사건이 오늘 골목의 이야기가 되었군요.","꼬불꼬불한 길은 더 많은 사람을 만나기 위해 있는지도 몰라요."]},
];
const events=[
  {id:"lamp",name:"깜빡이는 가로등",x:29.5,y:14.6,icon:"!",color:"#f0cc55",lines:["임씨가 가로등 기둥을 살짝 두드렸다.","지직거리던 불빛이 따뜻한 노란빛으로 안정됐다!"],reward:"유리 전구 조각"},
  {id:"cat",name:"풀숲의 줄무늬 고양이",x:66.2,y:15.8,icon:"냥",color:"#d5b486",lines:["풀숲에서 방울 소리가 난다.","임씨가 손을 내밀자 줄무늬 고양이가 태연하게 따라왔다!"],reward:"고양이 방울"},
  {id:"parcel",name:"바람 언덕 우체통",x:56.3,y:31.2,icon:"〒",color:"#4e8b65",lines:["초록 우체통의 작은 문이 바람에 달각거린다.","임씨가 소포를 넣자 멀리서 택배기사의 안도하는 코 고는 소리가 들렸다."],reward:"수취 확인 도장"},
];

const player={x:8*TILE,y:12*TILE,w:20,h:26,speed:185,facing:"down",moving:false,walk:0};
const camera={x:0,y:0},keys=new Set();
let met=new Set(),startedEvents=new Set(),completedEvents=new Set(),items=new Set();
let activeEntity=null,dialogueIndex=0,lastTime=performance.now(),toastTimer=0;
const worldSolids=buildSolidRects();
const ui={dialogue:document.querySelector("#dialogue"),speaker:document.querySelector("#speaker"),text:document.querySelector("#dialogueText"),portrait:document.querySelector("#portrait"),met:document.querySelector("#metCount"),total:document.querySelector("#npcCount"),eventCount:document.querySelector("#eventCount"),eventTotal:document.querySelector("#eventTotal"),mission:document.querySelector("#missionText"),toast:document.querySelector("#toast")};
ui.total.textContent=npcs.length;ui.eventTotal.textContent=events.length;

function rectsOverlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function playerFeetAt(x,y){return{x:x+3,y:y+18,w:player.w-6,h:8};}
function buildSolidRects(){
  const houses=buildings.map(b=>({x:b.x*TILE+2,y:b.y*TILE+8,w:b.w*TILE-4,h:b.h*TILE-8}));
  const rails=fences.map(f=>({x:f.x*TILE+2,y:f.y*TILE+7,w:f.w*TILE-4,h:15}));
  const water=ponds.map(p=>({x:p.x*TILE+3,y:p.y*TILE+3,w:p.w*TILE-6,h:p.h*TILE-6}));
  const trunks=sceneryTrees.map(([x,y])=>({x:x*TILE+8,y:y*TILE+21,w:16,h:15}));
  const people=npcs.map(n=>({x:n.x*TILE-8,y:n.y*TILE-2,w:16,h:13}));
  const fixtures=events.filter(e=>e.id!=="cat").map(e=>({x:e.x*TILE-7,y:e.y*TILE-4,w:14,h:15}));
  return[...houses,...rails,...water,...trunks,...people,...fixtures];
}
function blockedAt(x,y){
  if(x<8||y<8||x+player.w>MAP_W*TILE-8||y+player.h>MAP_H*TILE-8)return true;
  const feet=playerFeetAt(x,y);return worldSolids.some(s=>rectsOverlap(feet,s));
}
function moveAxis(amount,axis){const dir=Math.sign(amount);let left=Math.abs(amount);while(left>0){const step=Math.min(4,left)*dir,nx=axis==="x"?player.x+step:player.x,ny=axis==="y"?player.y+step:player.y;if(blockedAt(nx,ny))break;player[axis]+=step;left-=Math.abs(step);}}
function tryMove(dx,dy){if(Math.abs(dx)>Math.abs(dy)){moveAxis(dx,"x");moveAxis(dy,"y");}else{moveAxis(dy,"y");moveAxis(dx,"x");}}

function update(dt){
  let dx=0,dy=0;
  if(!activeEntity){
    if(keys.has("arrowleft")||keys.has("a")){dx--;player.facing="left";}if(keys.has("arrowright")||keys.has("d")){dx++;player.facing="right";}
    if(keys.has("arrowup")||keys.has("w")){dy--;player.facing="up";}if(keys.has("arrowdown")||keys.has("s")){dy++;player.facing="down";}
    if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2;}tryMove(dx*player.speed*dt,dy*player.speed*dt);
  }
  player.moving=Boolean(dx||dy)&&!activeEntity;if(player.moving)player.walk+=dt*11;
  const sx=player.x-camera.x,sy=player.y-camera.y;let tx=camera.x,ty=camera.y;
  if(sx<250)tx=player.x-250;else if(sx>710)tx=player.x-710;if(sy<170)ty=player.y-170;else if(sy>390)ty=player.y-390;
  camera.x+=(tx-camera.x)*Math.min(1,dt*9);camera.y+=(ty-camera.y)*Math.min(1,dt*9);
  camera.x=Math.max(0,Math.min(camera.x,MAP_W*TILE-canvas.width));camera.y=Math.max(0,Math.min(camera.y,MAP_H*TILE-canvas.height));
}

function pointSegmentDistance(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));}
function roadAt(x,y){return roadPaths.some(path=>path.slice(0,-1).some((a,i)=>{const b=path[i+1];return pointSegmentDistance(x+.5,y+.5,a[0],a[1],b[0],b[1])<1.35;}));}
function hillAt(x,y){return hills.find(h=>Math.hypot(x+.5-h.x,y+.5-h.y)<h.r);}
function drawGround(){
  const sx=Math.floor(camera.x/TILE),ex=Math.ceil((camera.x+canvas.width)/TILE),sy=Math.floor(camera.y/TILE),ey=Math.ceil((camera.y+canvas.height)/TILE);
  for(let y=sy;y<=ey;y++)for(let x=sx;x<=ex;x++){
    const road=roadAt(x,y),hill=hillAt(x,y);let color=(x+y)%5===0?palette.grass2:palette.grass;
    if(hill){const d=Math.hypot(x+.5-hill.x,y+.5-hill.y);color=Math.floor(d)%2===0?"#879d68":"#789260";}
    ctx.fillStyle=road?palette.road:color;ctx.fillRect(x*TILE-camera.x,y*TILE-camera.y,TILE+1,TILE+1);
    if(road&&(x*3+y)%7===0){ctx.fillStyle=palette.roadEdge;ctx.fillRect(x*TILE-camera.x+5,y*TILE-camera.y+8,4,3);}
    if(hill&&!road){const d=Math.hypot(x+.5-hill.x,y+.5-hill.y);if(Math.abs(d-Math.round(d))<.17){ctx.fillStyle="#607b50";ctx.fillRect(x*TILE-camera.x,y*TILE-camera.y+26,TILE,3);}}
  }
}
function drawBuilding(b){const x=b.x*TILE-camera.x,y=b.y*TILE-camera.y,w=b.w*TILE,h=b.h*TILE;ctx.fillStyle="#4b4035";ctx.fillRect(x-5,y+10,w+10,h-5);ctx.fillStyle=palette.wall;ctx.fillRect(x,y+28,w,h-28);ctx.fillStyle=b.color;ctx.fillRect(x-7,y,w+14,38);ctx.fillStyle="#54372f";ctx.fillRect(x+w/2-13,y+h-38,26,38);ctx.fillStyle="#75a1aa";for(let wx=22;wx<w-20;wx+=58)ctx.fillRect(x+wx,y+54,22,20);ctx.fillStyle="#191b1a";ctx.fillRect(x+8,y+h-5,w-16,5);ctx.fillStyle="#272725cc";ctx.fillRect(x+8,y+5,Math.min(w-16,b.name.length*13+12),20);ctx.fillStyle="#f0e7d2";ctx.font="bold 11px sans-serif";ctx.fillText(b.name,x+14,y+19);}
function drawScenery(){
  ponds.forEach(p=>{ctx.fillStyle=palette.water;ctx.fillRect(p.x*TILE-camera.x,p.y*TILE-camera.y,p.w*TILE,p.h*TILE);ctx.fillStyle="#8bb4bd";for(let i=0;i<p.w;i+=2)ctx.fillRect((p.x+i)*TILE-camera.x+8,p.y*TILE-camera.y+18,22,3);});
  fences.forEach(f=>{ctx.fillStyle=palette.fence;ctx.fillRect(f.x*TILE-camera.x,f.y*TILE-camera.y+10,f.w*TILE,9);for(let i=0;i<f.w;i++)ctx.fillRect((f.x+i)*TILE-camera.x+4,f.y*TILE-camera.y+3,6,24);});
  sceneryTrees.forEach(([tx,ty])=>{const x=tx*TILE-camera.x,y=ty*TILE-camera.y;ctx.fillStyle=palette.trunk;ctx.fillRect(x+12,y+19,8,18);ctx.fillStyle=palette.tree;ctx.fillRect(x+3,y+4,26,23);ctx.fillStyle="#527e55";ctx.fillRect(x+8,y,17,10);});
  ctx.strokeStyle="#454a42";ctx.lineWidth=12;ctx.strokeRect(6-camera.x,6-camera.y,MAP_W*TILE-12,MAP_H*TILE-12);
}
function drawBaseCharacter(x,y,color,icon,metBefore=false){const sx=x-camera.x,sy=y-camera.y;ctx.fillStyle="#0004";ctx.fillRect(sx-10,sy+9,20,6);ctx.fillStyle=color;ctx.fillRect(sx-9,sy-11,18,20);ctx.fillStyle="#e8c49f";ctx.fillRect(sx-7,sy-20,14,12);ctx.fillStyle="#222";ctx.fillRect(sx-6,sy-22,12,5);ctx.fillStyle="#fff";ctx.font="bold 8px sans-serif";ctx.textAlign="center";ctx.fillText(icon,sx,sy+3);ctx.textAlign="left";if(metBefore){ctx.fillStyle=palette.accent;ctx.fillRect(sx+9,sy-25,5,5);}}
function drawNpc(n){drawBaseCharacter(n.x*TILE,n.y*TILE,n.color,n.icon,met.has(n.id));const x=n.x*TILE-camera.x,y=n.y*TILE-camera.y;if(n.style==="wrench"){ctx.fillStyle="#bbc0bd";ctx.fillRect(x+8,y-7,3,15);ctx.fillRect(x+6,y-9,7,3);}if(n.style==="detective"){ctx.fillStyle="#3c334b";ctx.fillRect(x-11,y-24,22,4);ctx.fillRect(x-6,y-29,12,6);}if(n.style==="parcel"){ctx.fillStyle="#765038";ctx.fillRect(x-15,y-9,7,15);}if(n.style==="headphone"){ctx.strokeStyle="#222";ctx.lineWidth=3;ctx.strokeRect(x-9,y-25,18,11);}if(n.style==="shawl"){ctx.fillStyle="#e1b85e";ctx.fillRect(x-10,y-10,20,4);}if(n.style==="beret"){ctx.fillStyle="#b53f52";ctx.fillRect(x-8,y-27,16,5);}if(n.style==="scarf"){ctx.fillStyle="#d76a4f";ctx.fillRect(x-9,y-12,18,4);ctx.fillRect(x+6,y-8,4,9);}}
function drawPlayer(){
  const x=player.x-camera.x+player.w/2,baseY=player.y-camera.y+player.h/2,bob=player.moving?Math.round(Math.sin(player.walk*2)*1.5):0,y=baseY+bob,step=player.moving?(Math.sin(player.walk*2)>0?2:-2):0;
  ctx.fillStyle="#0004";ctx.fillRect(x-10,baseY+12,20,6);ctx.fillStyle="#2c3541";ctx.fillRect(x-7+step,y+7,6,9);ctx.fillRect(x+1-step,y+7,6,9);ctx.fillStyle="#4f7295";ctx.fillRect(x-9,y-10,18,20);ctx.fillStyle="#e8c49f";ctx.fillRect(x-7,y-21,14,13);ctx.fillStyle="#252525";ctx.fillRect(x-7,y-23,14,6);ctx.fillStyle="#f2c14e";ctx.fillRect(x-10,y-7,3,12);
  ctx.fillStyle="#292929";if(player.facing==="left"){ctx.fillRect(x-6,y-16,2,2);ctx.fillStyle="#e8c49f";ctx.fillRect(x-13,y-5,4,9);}else if(player.facing==="right"){ctx.fillStyle="#292929";ctx.fillRect(x+4,y-16,2,2);ctx.fillStyle="#e8c49f";ctx.fillRect(x+9,y-5,4,9);}else if(player.facing==="down"){ctx.fillRect(x-4,y-16,2,2);ctx.fillRect(x+3,y-16,2,2);ctx.fillStyle="#e8c49f";ctx.fillRect(x-13,y-4,4,9);ctx.fillRect(x+9,y-4,4,9);}else{ctx.fillStyle="#222";ctx.fillRect(x-7,y-21,14,8);}ctx.fillStyle="#fff";ctx.font="bold 8px sans-serif";ctx.textAlign="center";ctx.fillText("임",x,y+3);ctx.textAlign="left";
}

function eventIsActive(e){return startedEvents.has(e.id)&&!completedEvents.has(e.id);}
function drawEvents(){events.forEach(e=>{if(e.id==="cat"&&!eventIsActive(e))return;const x=e.x*TILE-camera.x,y=e.y*TILE-camera.y,active=eventIsActive(e);if(e.id==="lamp"){ctx.fillStyle="#454545";ctx.fillRect(x-3,y-20,6,31);ctx.fillRect(x-8,y-22,16,4);ctx.fillStyle=completedEvents.has(e.id)?"#ffe58a":"#8b805a";ctx.fillRect(x-6,y-19,12,9);}else if(e.id==="parcel"){ctx.fillStyle="#3f7254";ctx.fillRect(x-9,y-12,18,19);ctx.fillStyle="#dbe3d8";ctx.fillRect(x-6,y-8,12,4);ctx.fillStyle="#4d4b40";ctx.fillRect(x-2,y+7,4,10);}else{ctx.fillStyle="#a98661";ctx.fillRect(x-9,y-8,18,12);ctx.fillStyle="#ede2c3";ctx.fillRect(x-6,y-15,12,9);ctx.fillStyle="#333";ctx.fillRect(x-3,y-13,2,2);ctx.fillRect(x+3,y-13,2,2);}if(active){ctx.fillStyle=palette.accent;ctx.font="bold 15px sans-serif";ctx.textAlign="center";ctx.fillText("!",x,y-30);ctx.textAlign="left";}});}
function nearbyNpc(){return npcs.find(n=>Math.hypot(player.x+player.w/2-n.x*TILE,player.y+player.h/2-n.y*TILE)<54);}
function nearbyEvent(){return events.find(e=>eventIsActive(e)&&Math.hypot(player.x+player.w/2-e.x*TILE,player.y+player.h/2-e.y*TILE)<52);}
function drawPrompt(target,label){const x=target.x*TILE-camera.x,y=target.y*TILE-camera.y-42;ctx.fillStyle="#151719e8";ctx.fillRect(x-34,y-12,68,22);ctx.fillStyle="#f6e8bd";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(`E  ${label}`,x,y+3);ctx.textAlign="left";}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);drawGround();drawScenery();buildings.forEach(drawBuilding);drawEvents();npcs.forEach(drawNpc);drawPlayer();if(!activeEntity){const event=nearbyEvent(),npc=nearbyNpc();if(event)drawPrompt(event,"조사");else if(npc)drawPrompt(npc,"대화");}}

function npcDialogue(npc){if(npc.final)return completedEvents.size===events.length?npc.lines:npc.locked;if(npc.event){if(completedEvents.has(npc.event))return npc.thanks;if(startedEvents.has(npc.event))return npc.reminder;startedEvents.add(npc.event);return npc.intro;}return npc.lines;}
function openDialogue(entity,lines){activeEntity={...entity,currentLines:lines};dialogueIndex=0;renderDialogue();updateProgress();save();}
function interact(){const event=nearbyEvent();if(event){completedEvents.add(event.id);items.add(event.reward);openDialogue(event,event.lines);showToast(`${event.reward} 획득`);return;}const npc=nearbyNpc();if(!npc){showToast("주변에 조사하거나 대화할 대상이 없습니다.");return;}met.add(npc.id);openDialogue(npc,npcDialogue(npc));}
function renderDialogue(){const lines=activeEntity.currentLines;if(dialogueIndex>=lines.length){closeDialogue();return;}ui.dialogue.classList.remove("hidden");ui.speaker.textContent=activeEntity.name;ui.text.textContent=lines[dialogueIndex];ui.portrait.textContent=activeEntity.icon;ui.portrait.style.setProperty("--portrait",activeEntity.color);}
function nextDialogue(){if(!activeEntity)return;dialogueIndex++;renderDialogue();}
function closeDialogue(){activeEntity=null;ui.dialogue.classList.add("hidden");updateProgress();save();}
function updateProgress(){ui.met.textContent=met.size;ui.eventCount.textContent=completedEvents.size;if(completedEvents.size===events.length){ui.mission.textContent=met.has("poet")?"골목의 세 사건을 모두 해결했다. 자유롭게 둘러보자.":"바람 언덕에서 시인 윤을 만나자.";return;}const active=events.find(e=>eventIsActive(e));if(active){ui.mission.textContent=`사건 조사: ${active.name} (${completedEvents.size}/${events.length})`;return;}ui.mission.textContent=`개성 강한 주민을 만나 골목 사건을 찾아보자. (${completedEvents.size}/${events.length})`;}
function showToast(message){ui.toast.textContent=message;ui.toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove("show"),1400);}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({x:player.x,y:player.y,met:[...met],started:[...startedEvents],completed:[...completedEvents],items:[...items]}));}
function load(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(!d)return;player.x=d.x;player.y=d.y;met=new Set(d.met||[]);startedEvents=new Set(d.started||[]);completedEvents=new Set(d.completed||[]);items=new Set(d.items||[]);if(blockedAt(player.x,player.y)){player.x=8*TILE;player.y=12*TILE;}}catch{}}

addEventListener("keydown",e=>{const key=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(key))e.preventDefault();if((key==="e"||key===" ")&&!e.repeat)activeEntity?nextDialogue():interact();keys.add(key);});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));document.querySelector("#nextButton").addEventListener("click",nextDialogue);addEventListener("beforeunload",save);
load();updateProgress();
function loop(now){const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;update(dt);draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
