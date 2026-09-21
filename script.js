const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE = 32, MAP_W = 140, MAP_H = 90;
const SAVE_KEY = "imc-neighborhood-save-v5";
const palette = { grass:"#7f9b68",grass2:"#738e5f",road:"#777b76",roadEdge:"#686d68",wall:"#ddd0af",roof:"#9d584c",roof2:"#6d777f",fence:"#6c5745",tree:"#3e6b4b",trunk:"#5c4432",water:"#5d8ca0",accent:"#f2c14e" };

const baseBuildings = [
  {x:3,y:3,w:10,h:7,color:palette.roof,name:"임씨의 집"},{x:17,y:2,w:9,h:8,color:palette.roof2,name:"태엽 고물상"},
  {x:31,y:3,w:12,h:7,color:"#a97a4d",name:"달빛 사진관"},{x:49,y:2,w:15,h:8,color:"#756f83",name:"해질녘 연립"},
  {x:5,y:17,w:12,h:8,color:"#a96961",name:"수상한 이발소"},{x:22,y:18,w:8,h:6,color:"#697f80",name:"빈집"},
  {x:36,y:16,w:13,h:9,color:"#9b6f53",name:"심야 라디오"},{x:55,y:18,w:10,h:7,color:"#7c7259",name:"멈춘 공사장"},
  {x:2,y:33,w:13,h:8,color:"#7d6a78",name:"점괘 빌라"},{x:22,y:34,w:12,h:7,color:"#a5644f",name:"벽화 작업실"},
  {x:43,y:32,w:9,h:9,color:"#687e6a",name:"언덕 시인의 집"},{x:58,y:33,w:10,h:8,color:"#855f55",name:"바람 언덕"},
];
const districtNames=["윗마을","시장골목","아랫마을"];
const buildings=[...baseBuildings,
  ...baseBuildings.map((b,i)=>({...b,x:b.x+70,name:`${districtNames[0]} ${b.name}`})),
  ...baseBuildings.map((b,i)=>({...b,y:b.y+45,name:`${districtNames[1]} ${b.name}`})),
  ...baseBuildings.map((b,i)=>({...b,x:b.x+70,y:b.y+45,name:`${districtNames[2]} ${b.name}`})),
];
const ponds=[{x:17,y:29,w:7,h:4},{x:87,y:24,w:8,h:5},{x:35,y:69,w:9,h:5},{x:108,y:70,w:7,h:4}];
const baseFences=[{x:1,y:13,w:12},{x:27,y:13,w:12},{x:54,y:13,w:14},{x:1,y:28,w:10},{x:27,y:28,w:8},{x:55,y:28,w:13}];
const fences=[...baseFences,...baseFences.map(f=>({...f,x:f.x+70})),...baseFences.map(f=>({...f,y:f.y+45})),...baseFences.map(f=>({...f,x:f.x+70,y:f.y+45}))];
const baseTrees=[[1,2],[14,5],[28,6],[47,7],[67,4],[3,15],[19,16],[33,15],[51,16],[68,20],[2,31],[16,38],[38,35],[54,31],[69,38]];
const sceneryTrees=[...baseTrees,...baseTrees.map(([x,y])=>[x+70,y]),...baseTrees.map(([x,y])=>[x,y+45]),...baseTrees.map(([x,y])=>[x+70,y+45])];
const roadPaths=[
  [[0,12],[9,11],[18,13],[28,11],[38,13],[48,11],[58,12],[70,10],[81,13],[94,11],[108,14],[122,10],[140,12]],
  [[0,27],[9,26],[18,30],[28,26],[38,29],[49,26],[59,28],[70,25],[82,29],[96,26],[110,30],[125,27],[140,24]],
  [[0,57],[15,55],[28,59],[42,56],[57,60],[70,55],[84,58],[99,54],[114,59],[128,56],[140,58]],
  [[0,76],[14,73],[29,78],[44,74],[59,77],[73,72],[88,76],[103,73],[119,78],[140,74]],
  [[15,0],[15,10],[18,18],[17,27],[20,36],[18,48],[22,60],[19,75],[21,90]],
  [[46,0],[46,10],[51,18],[50,27],[55,35],[52,48],[56,60],[52,75],[55,90]],
  [[84,0],[86,12],[82,25],[87,38],[84,52],[89,66],[85,78],[88,90]],
  [[118,0],[116,14],[121,27],[117,42],[122,56],[118,70],[121,90]],
];
const hills=[{x:39,y:38,r:6},{x:66,y:16,r:5},{x:103,y:38,r:8},{x:64,y:67,r:7},{x:128,y:63,r:9},{x:100,y:82,r:6}];

const npcs=[
  {id:"junk",name:"태엽 고물상 춘배",x:15.5,y:11.5,color:"#bb6b4f",icon:"춘",style:"wrench",event:"lamp",intro:["임씨! 마침 잘 왔어. 골목 가로등이 낮에도 깜빡거린다니까.","북쪽 골목 끝의 가로등을 한 번 두드려 봐. 기계는 정직한 충격에 답하거든!"],reminder:["깜빡이는 가로등은 북쪽 담장 아래에 있어. 살살 두드려야 해!"],thanks:["오, 불빛이 안정됐군! 역시 내 진단과 임씨의 손맛은 완벽해."]},
  {id:"detective",name:"골목 탐정 미미",x:43.5,y:11.5,color:"#75639b",icon:"미",style:"detective",event:"cat",intro:["쉿, 임씨. 지금부터 극비 수사야.","연립주택의 줄무늬 고양이가 사라졌어. 동쪽 언덕 근처에서 방울 소리가 났지."],reminder:["수사 원칙 제1조. 고양이는 사람이 잘 안 가는 풀숲을 좋아한다."],thanks:["사건 해결! 임씨는 오늘부터 명예 골목 탐정이야."]},
  {id:"courier",name:"졸린 택배기사 만수",x:52.5,y:27,color:"#d39b43",icon:"택",style:"parcel",event:"parcel",intro:["임씨... 딱 3분만 자려다가 30분이 지났네.","바람 언덕 아래 우체통에 이 작은 소포 좀 넣어줄래? 난 여기서 눈을... 아니, 짐을 지킬게."],reminder:["소포는 남동쪽 바람 언덕 아래의 초록 우체통이야. 난 안 자고 있어... 정말이야."],thanks:["배달 완료 확인! 임씨 덕분에 오늘도 지각은 아니고... 약간의 시간차 배달이야."]},
  {id:"dj",name:"심야 DJ 단비",x:25.5,y:31.5,color:"#477ca3",icon:"DJ",style:"headphone",lines:["낮에는 라디오가 쉬는 시간인데, 임씨한테만 한 곡 틀어줄게.","골목의 소리를 잘 들어봐. 사건이 있는 곳은 평소와 다른 소리가 나거든."]},
  {id:"fortune",name:"거꾸로 점쟁이 복례",x:8.5,y:30.5,color:"#a85e8e",icon:"점",style:"shawl",lines:["임씨, 오늘 운세는 '길을 잃어야 길을 찾는다'야.","동쪽에서 고양이 방울, 북쪽에서 전기 소리, 남쪽에서 코 고는 소리가 들리는구나."]},
  {id:"artist",name:"벽화 화가 솔",x:38.5,y:28.5,color:"#4f9b78",icon:"솔",style:"beret",lines:["임씨가 지나간 자리는 이상하게 파란색으로 그리고 싶어져.","언덕의 굽은 길이 마음에 들어. 곧 담장 전체를 지도처럼 칠할 거야."]},
  {id:"poet",name:"언덕 시인 윤",x:55,y:42,color:"#657b66",icon:"윤",style:"scarf",final:true,locked:["아직 골목의 이야기가 충분히 모이지 않았군요.","네 구역에 흩어진 일곱 사건을 해결하고 다시 오세요."],lines:["임씨가 해결한 일곱 사건이 오늘 골목의 이야기가 되었군요.","꼬불꼬불한 길은 더 많은 사람을 만나기 위해 있는지도 몰라요."]},
  {id:"gardener",name:"성급한 정원사 초록",x:91,y:14,color:"#60965d",icon:"초",style:"shawl",event:"weeds",intro:["임씨, 윗마을 화단의 덩굴이 돌계단을 삼키고 있어!","뿌리가 질겨서 한 번에 뽑히지 않아. 힘껏 여러 번 잡아당겨 줘."],reminder:["윗마을 동쪽 연못 위쪽의 덩굴이야. 손에 힘 꽉 줘!"],thanks:["돌계단이 다시 보인다! 임씨 손이 작은 굴착기보다 낫네."]},
  {id:"clock",name:"방향치 시계공 시우",x:118,y:31,color:"#8d6d45",icon:"시",style:"wrench",event:"clock",intro:["시계는 고쳤는데 동서남북 바늘이 제멋대로야.","내가 적어둔 방향 순서를 보고 그대로 입력해 줘. 한 번 틀리면 처음부터야."],reminder:["시계탑은 윗마을 남쪽 굽은 길에 있어. 방향을 차례대로 기억해."],thanks:["모든 바늘이 정각을 가리켜! 방향치인 건 나고, 시계는 멀쩡해졌군."]},
  {id:"coach",name:"박자 교관 박씨",x:30,y:59,color:"#a94f4f",icon:"박",style:"beret",event:"bell",intro:["임씨, 시장 종은 힘이 아니라 박자야.","움직이는 눈금이 노란 구간에 들어올 때 스페이스를 세 번 눌러 봐."],reminder:["시장골목 중앙 종탑에서 정확한 박자를 세 번 맞춰야 해."],thanks:["좋아! 이 정도 박자면 온 동네가 같은 시간에 점심을 먹겠어."]},
  {id:"collector",name:"표지판 수집가 별",x:96,y:70,color:"#4e82a0",icon:"별",style:"headphone",event:"sign",intro:["아랫마을 표지판 하나가 바람에 돌아가 버렸어.","표지판의 화살표를 북쪽, 동쪽, 남쪽 순서로 맞춰 줘."],reminder:["아랫마을 연못 아래의 파란 표지판이야. 방향 세 개를 순서대로!"],thanks:["완벽해. 이제 길을 잃는 사람은... 아마 조금 줄어들 거야."]},
];
const events=[
  {id:"lamp",mode:"mash",goal:14,name:"깜빡이는 가로등",x:29.5,y:14.6,icon:"!",color:"#f0cc55",lines:["임씨가 접촉 불량 전선을 단단히 고정했다.","지직거리던 불빛이 따뜻한 노란빛으로 안정됐다!"],reward:"유리 전구 조각"},
  {id:"cat",mode:"chase",name:"도망치는 줄무늬 고양이",x:66.2,y:15.8,icon:"냥",color:"#d5b486",lines:["한참을 쫓아간 끝에 고양이가 숨을 고른다.","임씨가 조심스럽게 손을 내밀자 방울 달린 목걸이를 보여준다!"],reward:"고양이 방울"},
  {id:"parcel",mode:"deliver",name:"바람 언덕 우체통",x:56.3,y:31.2,icon:"〒",color:"#4e8b65",lines:["긴 골목길 끝에서 마침내 초록 우체통을 찾았다.","소포를 넣자 멀리서 택배기사의 안도하는 코 고는 소리가 들렸다."],reward:"수취 확인 도장"},
  {id:"weeds",mode:"mash",goal:20,name:"돌계단의 질긴 덩굴",x:101,y:18,icon:"풀",color:"#4c8b55",lines:["임씨가 마지막 덩굴 뿌리까지 힘껏 뽑아냈다.","가려져 있던 오래된 돌계단이 모습을 드러냈다!"],reward:"향긋한 풀잎"},
  {id:"clock",mode:"sequence",sequence:["arrowup","arrowright","arrowdown","arrowleft","arrowup"],name:"방향 잃은 시계탑",x:110,y:43,icon:"시",color:"#9a7748",lines:["마지막 방향키를 맞추자 네 개의 바늘이 동시에 움직였다.","시계탑이 정확한 종을 울리기 시작했다!"],reward:"작은 태엽"},
  {id:"bell",mode:"timing",goal:3,name:"시장골목 박자 종",x:38,y:58,icon:"종",color:"#b75d4e",lines:["세 번째 정확한 타격과 함께 맑은 종소리가 골목에 퍼졌다.","시장 사람들이 박수를 보낸다!"],reward:"황동 종조각"},
  {id:"sign",mode:"sequence",sequence:["arrowup","arrowright","arrowdown","arrowup","arrowright"],name:"돌아간 파란 표지판",x:105,y:75,icon:"표",color:"#4e82a0",lines:["표지판의 화살표가 제자리를 찾았다.","멀리 떨어진 네 골목의 방향이 하나로 이어졌다!"],reward:"낡은 지도 조각"},
];

const disruptors=[
  {id:"kang",name:"강씨",x:72,y:43,color:"#9d4c45",icon:"강",speed:70,route:[[72,43],[80,48],[73,54],[66,47]],routeIndex:1,cooldown:0},
  {id:"ha",name:"하씨",x:112,y:58,color:"#525b91",icon:"하",speed:82,route:[[112,58],[125,66],[115,80],[101,69]],routeIndex:1,cooldown:0},
];

const player={x:8*TILE,y:12*TILE,w:20,h:26,speed:185,facing:"down",moving:false,walk:0};
const camera={x:0,y:0},keys=new Set();
let met=new Set(),startedEvents=new Set(),completedEvents=new Set(),items=new Set();
let activeEntity=null,challenge=null,dialogueIndex=0,lastTime=performance.now(),toastTimer=0;
const worldSolids=buildSolidRects();
const ui={dialogue:document.querySelector("#dialogue"),speaker:document.querySelector("#speaker"),text:document.querySelector("#dialogueText"),portrait:document.querySelector("#portrait"),met:document.querySelector("#metCount"),total:document.querySelector("#npcCount"),eventCount:document.querySelector("#eventCount"),eventTotal:document.querySelector("#eventTotal"),mission:document.querySelector("#missionText"),toast:document.querySelector("#toast"),challenge:document.querySelector("#challenge"),challengeTitle:document.querySelector("#challengeTitle"),challengeText:document.querySelector("#challengeText"),challengeBar:document.querySelector("#challengeBar")};
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

function updateDisruptors(dt){
  disruptors.forEach(d=>{
    d.cooldown=Math.max(0,d.cooldown-dt);
    const target=d.route[d.routeIndex],tx=target[0]*TILE,ty=target[1]*TILE,dx=tx-d.x*TILE,dy=ty-d.y*TILE,dist=Math.hypot(dx,dy);
    if(dist<5)d.routeIndex=(d.routeIndex+1)%d.route.length;
    else{d.x+=dx/dist*d.speed*dt/TILE;d.y+=dy/dist*d.speed*dt/TILE;}
    const px=player.x+player.w/2,py=player.y+player.h/2,ddx=px-d.x*TILE,ddy=py-d.y*TILE,pd=Math.hypot(ddx,ddy);
    if(pd<28&&d.cooldown===0){
      const nx=player.x+(ddx/(pd||1))*46,ny=player.y+(ddy/(pd||1))*46;
      if(!blockedAt(nx,player.y))player.x=nx;if(!blockedAt(player.x,ny))player.y=ny;
      d.cooldown=2.2;showToast(`${d.name}가 길을 막아 돌아가게 만들었다!`);
    }
  });
}

const catRoute=[[66.2,15.8],[69,22],[63,27],[72,31],[78,25],[75,16]];
let catRouteIndex=1;
function updateCat(dt){
  const cat=events.find(e=>e.id==="cat");if(!eventIsActive(cat))return;
  const px=player.x+player.w/2,py=player.y+player.h/2,distToPlayer=Math.hypot(px-cat.x*TILE,py-cat.y*TILE);
  if(distToPlayer>120)return;
  const target=catRoute[catRouteIndex],dx=target[0]-cat.x,dy=target[1]-cat.y,dist=Math.hypot(dx,dy);
  if(dist<.18){catRouteIndex=(catRouteIndex+1)%catRoute.length;return;}
  cat.x+=dx/dist*4.2*dt;cat.y+=dy/dist*4.2*dt;
}

function updateChallenge(dt){
  if(!challenge)return;
  if(challenge.mode==="mash"){
    challenge.time-=dt;setChallengeBar(challenge.count/challenge.goal);
    ui.challengeText.textContent=`E키 연타 ${challenge.count}/${challenge.goal} · 남은 시간 ${Math.max(0,challenge.time).toFixed(1)}초`;
    if(challenge.time<=0)failChallenge("시간이 지나 처음부터 다시 해야 한다!");
  }else if(challenge.mode==="timing"){
    challenge.phase=(challenge.phase+dt*.72)%1;setChallengeBar(challenge.phase);
    ui.challengeText.textContent=`노란 구간(45~60%)에서 Space · 성공 ${challenge.hits}/${challenge.goal}`;
  }
}

function update(dt){
  let dx=0,dy=0;
  if(!activeEntity&&!challenge){
    if(keys.has("arrowleft")||keys.has("a")){dx--;player.facing="left";}if(keys.has("arrowright")||keys.has("d")){dx++;player.facing="right";}
    if(keys.has("arrowup")||keys.has("w")){dy--;player.facing="up";}if(keys.has("arrowdown")||keys.has("s")){dy++;player.facing="down";}
    if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2;}tryMove(dx*player.speed*dt,dy*player.speed*dt);
  }
  player.moving=Boolean(dx||dy)&&!activeEntity;if(player.moving)player.walk+=dt*11;
  updateCat(dt);updateDisruptors(dt);updateChallenge(dt);
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
function drawEvents(){events.forEach(e=>{if(e.id==="cat"&&!eventIsActive(e))return;const x=e.x*TILE-camera.x,y=e.y*TILE-camera.y,active=eventIsActive(e);if(e.id==="lamp"){ctx.fillStyle="#454545";ctx.fillRect(x-3,y-20,6,31);ctx.fillRect(x-8,y-22,16,4);ctx.fillStyle=completedEvents.has(e.id)?"#ffe58a":"#8b805a";ctx.fillRect(x-6,y-19,12,9);}else if(e.id==="parcel"){ctx.fillStyle="#3f7254";ctx.fillRect(x-9,y-12,18,19);ctx.fillStyle="#dbe3d8";ctx.fillRect(x-6,y-8,12,4);ctx.fillStyle="#4d4b40";ctx.fillRect(x-2,y+7,4,10);}else if(e.id==="cat"){ctx.fillStyle="#a98661";ctx.fillRect(x-9,y-8,18,12);ctx.fillStyle="#ede2c3";ctx.fillRect(x-6,y-15,12,9);ctx.fillStyle="#333";ctx.fillRect(x-3,y-13,2,2);ctx.fillRect(x+3,y-13,2,2);}else{ctx.fillStyle=e.color;ctx.fillRect(x-11,y-13,22,22);ctx.fillStyle="#171917";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(e.icon,x,y+1);ctx.textAlign="left";}if(active){ctx.fillStyle=palette.accent;ctx.font="bold 15px sans-serif";ctx.textAlign="center";ctx.fillText("!",x,y-30);ctx.textAlign="left";}});}
function drawDisruptors(){disruptors.forEach(d=>{drawBaseCharacter(d.x*TILE,d.y*TILE,d.color,d.icon,false);const x=d.x*TILE-camera.x,y=d.y*TILE-camera.y;ctx.fillStyle="#d84d45";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("×",x,y-29);ctx.textAlign="left";});}
function nearbyNpc(){return npcs.find(n=>Math.hypot(player.x+player.w/2-n.x*TILE,player.y+player.h/2-n.y*TILE)<54);}
function nearbyEvent(){return events.find(e=>eventIsActive(e)&&Math.hypot(player.x+player.w/2-e.x*TILE,player.y+player.h/2-e.y*TILE)<52);}
function drawPrompt(target,label){const x=target.x*TILE-camera.x,y=target.y*TILE-camera.y-42;ctx.fillStyle="#151719e8";ctx.fillRect(x-34,y-12,68,22);ctx.fillStyle="#f6e8bd";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(`E  ${label}`,x,y+3);ctx.textAlign="left";}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);drawGround();drawScenery();buildings.forEach(drawBuilding);drawEvents();npcs.forEach(drawNpc);drawDisruptors();drawPlayer();if(!activeEntity&&!challenge){const event=nearbyEvent(),npc=nearbyNpc();if(event)drawPrompt(event,event.mode==="chase"?"잡기":"조사");else if(npc)drawPrompt(npc,"대화");}}

function setChallengeBar(value){ui.challengeBar.style.width=`${Math.max(0,Math.min(1,value))*100}%`;}
function showChallenge(title,text){ui.challenge.classList.remove("hidden");ui.challengeTitle.textContent=title;ui.challengeText.textContent=text;setChallengeBar(0);}
function hideChallenge(){ui.challenge.classList.add("hidden");setChallengeBar(0);}
function finishEvent(event){challenge=null;hideChallenge();completedEvents.add(event.id);items.add(event.reward);openDialogue(event,event.lines);showToast(`${event.reward} 획득`);}
function failChallenge(message){challenge=null;hideChallenge();showToast(message);}
function startChallenge(event){
  if(event.mode==="deliver"||event.mode==="chase"){finishEvent(event);return;}
  if(event.mode==="mash"){
    challenge={event,mode:"mash",count:0,goal:event.goal,time:event.goal>15?6:4.5};
    showChallenge(event.name,"제한 시간 안에 E키를 빠르게 연타하세요!");return;
  }
  if(event.mode==="sequence"){
    challenge={event,mode:"sequence",index:0,sequence:event.sequence};
    const arrows={arrowup:"↑",arrowright:"→",arrowdown:"↓",arrowleft:"←"};
    showChallenge(event.name,`방향키 순서: ${event.sequence.map(k=>arrows[k]).join(" ")}`);return;
  }
  if(event.mode==="timing"){
    challenge={event,mode:"timing",phase:0,hits:0,goal:event.goal};
    showChallenge(event.name,"움직이는 눈금이 노란 구간에 올 때 Space!");
  }
}
function handleChallengeKey(key,repeat){
  if(!challenge||repeat)return;
  if(challenge.mode==="mash"&&key==="e"){
    challenge.count++;if(challenge.count>=challenge.goal)finishEvent(challenge.event);return;
  }
  if(challenge.mode==="sequence"&&key.startsWith("arrow")){
    if(key===challenge.sequence[challenge.index])challenge.index++;
    else{challenge.index=0;showToast("순서가 틀려 처음부터!");}
    setChallengeBar(challenge.index/challenge.sequence.length);
    ui.challengeText.textContent=`방향 입력 ${challenge.index}/${challenge.sequence.length}`;
    if(challenge.index>=challenge.sequence.length)finishEvent(challenge.event);return;
  }
  if(challenge.mode==="timing"&&key===" "){
    if(challenge.phase>=.45&&challenge.phase<=.60){challenge.hits++;showToast("정확한 박자!");}
    else{challenge.hits=0;showToast("박자를 놓쳐 연속 성공 초기화!");}
    if(challenge.hits>=challenge.goal)finishEvent(challenge.event);
  }
}

function npcDialogue(npc){if(npc.final){if(completedEvents.size===events.length){items.add("골목 이야기");return npc.lines;}return npc.locked;}if(npc.event){if(completedEvents.has(npc.event))return npc.thanks;if(startedEvents.has(npc.event))return npc.reminder;startedEvents.add(npc.event);return npc.intro;}return npc.lines;}
function openDialogue(entity,lines){activeEntity={...entity,currentLines:lines};dialogueIndex=0;renderDialogue();updateProgress();save();}
function interact(){const event=nearbyEvent();if(event){startChallenge(event);return;}const npc=nearbyNpc();if(!npc){showToast("주변에 조사하거나 대화할 대상이 없습니다.");return;}met.add(npc.id);openDialogue(npc,npcDialogue(npc));}
function renderDialogue(){const lines=activeEntity.currentLines;if(dialogueIndex>=lines.length){closeDialogue();return;}ui.dialogue.classList.remove("hidden");ui.speaker.textContent=activeEntity.name;ui.text.textContent=lines[dialogueIndex];ui.portrait.textContent=activeEntity.icon;ui.portrait.style.setProperty("--portrait",activeEntity.color);}
function nextDialogue(){if(!activeEntity)return;dialogueIndex++;renderDialogue();}
function closeDialogue(){activeEntity=null;ui.dialogue.classList.add("hidden");updateProgress();save();}
function updateProgress(){ui.met.textContent=met.size;ui.eventCount.textContent=completedEvents.size;if(completedEvents.size===events.length){ui.mission.textContent=items.has("골목 이야기")?"일곱 사건을 해결해 골목의 이야기를 완성했다.":"바람 언덕에서 시인 윤을 만나자.";return;}const active=events.find(e=>eventIsActive(e));if(active){ui.mission.textContent=`사건 조사: ${active.name} (${completedEvents.size}/${events.length})`;return;}ui.mission.textContent=`네 구역의 주민을 만나 사건을 찾아보자. (${completedEvents.size}/${events.length})`;}
function showToast(message){ui.toast.textContent=message;ui.toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove("show"),1400);}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({x:player.x,y:player.y,met:[...met],started:[...startedEvents],completed:[...completedEvents],items:[...items]}));}
function load(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(!d)return;player.x=d.x;player.y=d.y;met=new Set(d.met||[]);startedEvents=new Set(d.started||[]);completedEvents=new Set(d.completed||[]);items=new Set(d.items||[]);if(blockedAt(player.x,player.y)){player.x=8*TILE;player.y=12*TILE;}}catch{}}

addEventListener("keydown",e=>{const key=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(key))e.preventDefault();if(challenge){handleChallengeKey(key,e.repeat);return;}if((key==="e"||key===" ")&&!e.repeat)activeEntity?nextDialogue():interact();keys.add(key);});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));document.querySelector("#nextButton").addEventListener("click",nextDialogue);addEventListener("beforeunload",save);
load();updateProgress();
function loop(now){const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;update(dt);draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
