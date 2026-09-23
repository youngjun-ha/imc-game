const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE = 32, MAP_W = 140, MAP_H = 90;
const SAVE_KEY = "imc-neighborhood-save-v5";
const RANK_KEY = "imc-commute-ranking-v1", GAME_DURATION = 600;
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
const company=buildings[buildings.length-1];
company.name="IMC 회사"; company.color="#445d78";
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
  {id:"junk",name:"태엽 고물상 춘배",x:15.5,y:11.5,color:"#bb6b4f",icon:"춘",style:"wrench",events:["lamp","lamp2","lamp3"],intro:["임씨! 마침 잘 왔어. 네 구역의 가로등 세 개가 동시에 말썽이야.","가까운 북쪽 골목부터 먼 아랫마을 언덕까지 모두 찾아서 전선을 단단히 고정해 줘!"],reminder:["고장 난 가로등은 모두 세 개야. 지도 끝쪽 골목과 언덕도 빠뜨리지 마!"],thanks:["세 가로등이 전부 안정됐군! 이제 밤에도 네 구역을 안전하게 다닐 수 있겠어."]},
  {id:"detective",name:"골목 탐정 미미",x:82,y:29,color:"#75639b",icon:"미",style:"detective",event:"cat",intro:["쉿, 임씨. 지금부터 극비 수사야.","연립주택의 줄무늬 고양이가 사라졌어. 동쪽 언덕 근처에서 방울 소리가 났지."],reminder:["수사 원칙 제1조. 고양이는 사람이 잘 안 가는 풀숲을 좋아한다."],thanks:["사건 해결! 임씨는 오늘부터 명예 골목 탐정이야."]},
  {id:"courier",name:"졸린 택배기사 만수",x:132,y:24,color:"#d39b43",icon:"택",style:"parcel",events:["parcel","parcel2","parcel3"],intro:["임씨... 오늘 배달지가 지도의 세 끝에 흩어져 있네.","시장골목, 윗마을 끝, 아랫마을 언덕의 우체통에 소포를 하나씩 넣어줘. 난 짐을 지키며 안 자고 있을게."],reminder:["우체통은 모두 세 곳이야. 서로 아주 멀리 떨어져 있으니 굽은 큰길을 따라가 봐."],thanks:["세 곳 모두 배달 완료! 임씨 덕분에 오늘도 지각이 아니라 장거리 특별 배송이 됐어."]},
  {id:"dj",name:"심야 DJ 단비",x:18,y:48,color:"#477ca3",icon:"DJ",style:"headphone",lines:["낮에는 라디오가 쉬는 시간인데, 임씨한테만 한 곡 틀어줄게.","골목의 소리를 잘 들어봐. 사건이 있는 곳은 평소와 다른 소리가 나거든."]},
  {id:"fortune",name:"거꾸로 점쟁이 복례",x:55,y:35,color:"#a85e8e",icon:"점",style:"shawl",lines:["임씨, 오늘 운세는 '길을 잃어야 길을 찾는다'야.","동쪽에서 고양이 방울, 북쪽에서 전기 소리, 남쪽에서 코 고는 소리가 들리는구나."]},
  {id:"artist",name:"벽화 화가 솔",x:84,y:52,color:"#4f9b78",icon:"솔",style:"beret",lines:["임씨가 지나간 자리는 이상하게 파란색으로 그리고 싶어져.","언덕의 굽은 길이 마음에 들어. 곧 담장 전체를 지도처럼 칠할 거야."]},
  {id:"poet",name:"언덕 시인 윤",x:128,y:63,color:"#657b66",icon:"윤",style:"scarf",final:true,locked:["아직 골목의 이야기가 충분히 모이지 않았군요.","네 구역에 흩어진 모든 사건을 해결하고 다시 오세요."],lines:["임씨가 해결한 사건들이 오늘 골목의 이야기가 되었군요.","꼬불꼬불한 길은 더 많은 사람을 만나기 위해 있는지도 몰라요."]},
  {id:"gardener",name:"성급한 정원사 초록",x:22,y:60,color:"#60965d",icon:"초",style:"shawl",event:"weeds",intro:["임씨, 윗마을 화단의 덩굴이 돌계단을 삼키고 있어!","뿌리가 질겨서 한 번에 뽑히지 않아. 힘껏 여러 번 잡아당겨 줘."],reminder:["윗마을 동쪽 연못 위쪽의 덩굴이야. 손에 힘 꽉 줘!"],thanks:["돌계단이 다시 보인다! 임씨 손이 작은 굴착기보다 낫네."]},
  {id:"clock",name:"방향치 시계공 시우",x:52,y:75,color:"#8d6d45",icon:"시",style:"wrench",event:"clock",intro:["시계는 고쳤는데 동서남북 바늘이 제멋대로야.","내가 적어둔 방향 순서를 보고 그대로 입력해 줘. 한 번 틀리면 처음부터야."],reminder:["시계탑은 윗마을 남쪽 굽은 길에 있어. 방향을 차례대로 기억해."],thanks:["모든 바늘이 정각을 가리켜! 방향치인 건 나고, 시계는 멀쩡해졌군."]},
  {id:"coach",name:"박자 교관 박씨",x:73,y:72,color:"#a94f4f",icon:"박",style:"beret",event:"bell",intro:["임씨, 시장 종은 힘이 아니라 박자야.","움직이는 눈금이 노란 구간에 들어올 때 스페이스를 세 번 눌러 봐."],reminder:["시장골목 중앙 종탑에서 정확한 박자를 세 번 맞춰야 해."],thanks:["좋아! 이 정도 박자면 온 동네가 같은 시간에 점심을 먹겠어."]},
  {id:"collector",name:"표지판 수집가 별",x:118,y:70,color:"#4e82a0",icon:"별",style:"headphone",event:"sign",intro:["아랫마을 표지판 하나가 바람에 돌아가 버렸어.","표지판의 화살표를 북쪽, 동쪽, 남쪽 순서로 맞춰 줘."],reminder:["아랫마을 연못 아래의 파란 표지판이야. 방향 세 개를 순서대로!"],thanks:["완벽해. 이제 길을 잃는 사람은... 아마 조금 줄어들 거야."]},
];
const events=[
  {id:"lamp",mode:"mash",goal:16,name:"첫 번째 깜빡이는 가로등",x:29.5,y:14.6,icon:"!",color:"#f0cc55",lines:["첫 번째 가로등의 접촉 불량 전선을 단단히 고정했다.","지직거리던 불빛이 따뜻한 노란빛으로 안정됐다!"],reward:"첫 번째 전구 조각"},
  {id:"lamp2",mode:"mash",goal:20,name:"두 번째 흔들리는 가로등",x:105,y:45,icon:"!",color:"#e8bc4a",lines:["두 번째 가로등의 느슨한 나사를 여러 번 조였다.","멀리 떨어진 윗마을 골목이 환해졌다!"],reward:"두 번째 전구 조각"},
  {id:"lamp3",mode:"mash",goal:24,name:"세 번째 꺼진 가로등",x:132,y:88,icon:"!",color:"#dca83b",lines:["마지막 가로등의 굳은 스위치를 끝까지 밀어 올렸다.","아랫마을 언덕 끝까지 불빛이 이어졌다!"],reward:"세 번째 전구 조각"},
  {id:"cat",mode:"chase",name:"도망치는 줄무늬 고양이",x:66.2,y:15.8,icon:"냥",color:"#d5b486",lines:["한참을 쫓아간 끝에 고양이가 숨을 고른다.","임씨가 조심스럽게 손을 내밀자 방울 달린 목걸이를 보여준다!"],reward:"고양이 방울"},
  {id:"parcel",mode:"deliver",name:"시장골목 초록 우체통",x:20,y:82,icon:"〒",color:"#4e8b65",lines:["시장골목 끝의 초록 우체통에 첫 소포를 넣었다.","아직 두 곳의 먼 배달지가 남아 있다."],reward:"시장골목 수취 도장"},
  {id:"parcel2",mode:"deliver",name:"윗마을 파란 우체통",x:118,y:12,icon:"〒",color:"#477c87",lines:["윗마을 끝의 파란 우체통에 두 번째 소포를 넣었다.","이제 아랫마을 언덕의 마지막 배달지만 남았다."],reward:"윗마을 수취 도장"},
  {id:"parcel3",mode:"deliver",name:"아랫마을 붉은 우체통",x:126,y:76,icon:"〒",color:"#91554d",lines:["아랫마을 언덕의 붉은 우체통에 마지막 소포를 넣었다.","세 구역을 가로지른 장거리 배달이 모두 끝났다!"],reward:"아랫마을 수취 도장"},
  {id:"weeds",mode:"mash",goal:20,name:"돌계단의 질긴 덩굴",x:101,y:18,icon:"풀",color:"#4c8b55",lines:["임씨가 마지막 덩굴 뿌리까지 힘껏 뽑아냈다.","가려져 있던 오래된 돌계단이 모습을 드러냈다!"],reward:"향긋한 풀잎"},
  {id:"clock",mode:"sequence",sequence:["arrowup","arrowright","arrowdown","arrowleft","arrowup"],name:"방향 잃은 시계탑",x:110,y:43,icon:"시",color:"#9a7748",lines:["마지막 방향키를 맞추자 네 개의 바늘이 동시에 움직였다.","시계탑이 정확한 종을 울리기 시작했다!"],reward:"작은 태엽"},
  {id:"bell",mode:"timing",goal:3,name:"시장골목 박자 종",x:38,y:58,icon:"종",color:"#b75d4e",lines:["세 번째 정확한 타격과 함께 맑은 종소리가 골목에 퍼졌다.","시장 사람들이 박수를 보낸다!"],reward:"황동 종조각"},
  {id:"sign",mode:"sequence",sequence:["arrowup","arrowright","arrowdown","arrowup","arrowright"],name:"돌아간 파란 표지판",x:105,y:75,icon:"표",color:"#4e82a0",lines:["표지판의 화살표가 제자리를 찾았다.","멀리 떨어진 네 골목의 방향이 하나로 이어졌다!"],reward:"낡은 지도 조각"},
];
const questGroups=[
  {name:"골목 가로등 수리",ids:["lamp","lamp2","lamp3"]},
  {name:"줄무늬 고양이 찾기",ids:["cat"]},
  {name:"장거리 소포 배달",ids:["parcel","parcel2","parcel3"]},
  {name:"돌계단 덩굴 제거",ids:["weeds"]},
  {name:"시계탑 방향 복구",ids:["clock"]},
  {name:"시장 종 박자 맞추기",ids:["bell"]},
  {name:"파란 표지판 복구",ids:["sign"]},
];

// 원작 출근길 인물과 위험 요소. 기존 주민 사건과 별개로 길 위에서 작동한다.
const hazards=[
  {id:"yang",name:"양씨",x:18,y:13,color:"#d76565",icon:"양",kind:"chase",range:150,cooldown:0},
  {id:"kang",name:"강씨",x:50,y:27,color:"#795b9a",icon:"강",kind:"mental",range:300,cooldown:0},
  {id:"seo",name:"서씨",x:38,y:29,color:"#e19042",icon:"서",kind:"race",range:56,cooldown:0},
  {id:"ha",name:"하씨",x:84,y:29,color:"#a33e4c",icon:"하",kind:"chaseHard",range:175,cooldown:0},
  {id:"yook",name:"육씨",x:70,y:55,color:"#66804e",icon:"육",kind:"fart",range:0,cooldown:0},
  {id:"jung",name:"정영현",x:103,y:72,color:"#427e99",icon:"정",kind:"birds",range:190,cooldown:0},
  {id:"bong",name:"봉씨",x:119,y:77,color:"#8e6e45",icon:"봉",kind:"confuse",range:220,cooldown:0},
  {id:"villain",name:"수상한 악당",x:55,y:60,color:"#4a3135",icon:"악",kind:"fight",range:54,cooldown:0},
  {id:"quiz",name:"문제 악당",x:88,y:76,color:"#33434e",icon:"?",kind:"quiz",range:54,cooldown:0},
];
const sewers=[{x:28,y:26},{x:99,y:54}], bike={x:20,y:36,taken:false};
const fartTrails=[],droppings=[];
const quizQuestions=[
  {q:"수열 2, 3, 5, 8, 13 다음 수는?",options:["18","20","21"],answer:"3"},
  {q:"200의 15%는 얼마일까?",options:["20","30","35"],answer:"2"},
  {q:"일꾼 3명이 상자 3개를 3분에 옮긴다. 일꾼 6명이 상자 6개를 옮기는 시간은?",options:["3분","6분","9분"],answer:"1"},
  {q:"자동차가 깜짝 놀라면?",options:["카놀라유","오일쇼크","놀란자동차"],answer:"1"},
  {q:"왕이 넘어지면?",options:["왕좌","킹콩","왕창"],answer:"2"},
  {q:"손은 있지만 팔은 없는 것은?",options:["장갑","시계","의자"],answer:"2"},
];

const player={x:8*TILE,y:12*TILE,w:20,h:26,speed:185,facing:"down",moving:false,walk:0};
const camera={x:0,y:0},keys=new Set();
let met=new Set(),startedEvents=new Set(),completedEvents=new Set(),items=new Set();
let activeEntity=null,challenge=null,dialogueIndex=0,lastTime=performance.now(),toastTimer=0;
let gameStarted=false,gameEnded=false,elapsed=0,playerName="임씨",stun=0,slow=0,bikeTime=0,confused=0,companyPrompted=false;
let shakeTime=0,mentalEffect=null,inOffice=false,bossEncountered=false;
const office={
  boss:{x:480,y:300},computer:{x:840,y:155},
  solids:[
    {x:24,y:270,w:390,h:38},{x:546,y:270,w:390,h:38},
    {x:120,y:370,w:190,h:66},{x:650,y:390,w:190,h:66},
    {x:100,y:90,w:190,h:66},{x:760,y:70,w:160,h:75},
  ],
};
const worldSolids=buildSolidRects();
const ui={dialogue:document.querySelector("#dialogue"),speaker:document.querySelector("#speaker"),text:document.querySelector("#dialogueText"),portrait:document.querySelector("#portrait"),met:document.querySelector("#metCount"),total:document.querySelector("#npcCount"),eventCount:document.querySelector("#eventCount"),eventTotal:document.querySelector("#eventTotal"),mission:document.querySelector("#missionText"),questList:document.querySelector("#questList"),toast:document.querySelector("#toast"),challenge:document.querySelector("#challenge"),challengeTitle:document.querySelector("#challengeTitle"),challengeText:document.querySelector("#challengeText"),challengeBar:document.querySelector("#challengeBar"),start:document.querySelector("#startScreen"),ending:document.querySelector("#endingScreen"),endingLabel:document.querySelector("#endingLabel"),endingTitle:document.querySelector("#endingTitle"),endingText:document.querySelector("#endingText"),endingChoices:document.querySelector("#endingChoices"),restart:document.querySelector("#restartGameButton"),clock:document.querySelector("#gameClock"),condition:document.querySelector("#conditionText"),mental:document.querySelector("#mentalWords")};
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

function catBlockedAt(x,y){
  const body={x:x*TILE-8,y:y*TILE-9,w:16,h:15};
  if(body.x<8||body.y<8||body.x+body.w>MAP_W*TILE-8||body.y+body.h>MAP_H*TILE-8)return true;
  return worldSolids.some(s=>rectsOverlap(body,s));
}
function updateCat(dt){
  const cat=events.find(e=>e.id==="cat");if(!eventIsActive(cat))return;
  const px=player.x+player.w/2,py=player.y+player.h/2,distToPlayer=Math.hypot(px-cat.x*TILE,py-cat.y*TILE);
  if(distToPlayer>120)return;
  const dx=cat.x*TILE-px,dy=cat.y*TILE-py,dist=Math.hypot(dx,dy)||1,step=4.2*dt;
  let vx=dx/dist*step,vy=dy/dist*step,moved=false;
  if(!catBlockedAt(cat.x+vx,cat.y)){cat.x+=vx;moved=true;}
  if(!catBlockedAt(cat.x,cat.y+vy)){cat.y+=vy;moved=true;}
  // 정면이 막히면 옆으로 빠져나가며 절대로 구조물 내부로 진입하지 않는다.
  if(!moved){vx=-dy/dist*step;vy=dx/dist*step;if(!catBlockedAt(cat.x+vx,cat.y))cat.x+=vx;if(!catBlockedAt(cat.x,cat.y+vy))cat.y+=vy;}
}

function updateChallenge(dt){
  if(!challenge)return;
  if(challenge.mode==="mash"||challenge.mode==="race"){
    challenge.time-=dt;setChallengeBar(challenge.count/challenge.goal);
    const action=challenge.mode==="race"?"← → 번갈아 연타":"E키 연타";
    ui.challengeText.textContent=`${action} ${challenge.count}/${challenge.goal} · 남은 시간 ${Math.max(0,challenge.time).toFixed(1)}초`;
    if(challenge.time<=0)completeChallenge(false);
  }else if(challenge.mode==="escape"){
    challenge.time-=dt;
    const arrows={arrowup:"↑",arrowright:"→",arrowdown:"↓",arrowleft:"←"};
    const route=challenge.sequence.map((key,i)=>i===challenge.index?`[${arrows[key]}]`:arrows[key]).join(" ");
    ui.challengeText.textContent=`${route} · 입력 ${challenge.index}/${challenge.sequence.length} · 남은 시간 ${Math.max(0,challenge.time).toFixed(1)}초`;
    if(challenge.time<=0)completeChallenge(false);
  }else if(challenge.mode==="timing"){
    challenge.phase=(challenge.phase+dt*.72)%1;setChallengeBar(challenge.phase);
    ui.challengeText.textContent=`노란 구간(45~60%)에서 Space · 성공 ${challenge.hits}/${challenge.goal}`;
  }
}

function actorBlockedAt(x,y){
  const body={x:x*TILE-8,y:y*TILE-8,w:16,h:16};
  return x<.5||y<.5||x>MAP_W-.5||y>MAP_H-.5||worldSolids.some(s=>rectsOverlap(body,s));
}
function moveActor(h,tx,ty,dt,speed){
  const dx=tx-h.x*TILE,dy=ty-h.y*TILE,d=Math.hypot(dx,dy)||1,step=speed*dt/TILE;
  const vx=dx/d*step,vy=dy/d*step;
  if(!actorBlockedAt(h.x+vx,h.y))h.x+=vx;
  if(!actorBlockedAt(h.x,h.y+vy))h.y+=vy;
}
function popMentalWord(word,index){const s=document.createElement("span");s.textContent=word;s.style.left=`${10+(index*23)%72}%`;s.style.top=`${15+(index*19)%65}%`;s.style.fontSize=`${23+(index%3)*5}px`;ui.mental.appendChild(s);setTimeout(()=>s.remove(),1200);}
function startMentalAttack(){slow=3;shakeTime=3;mentalEffect={time:0,next:0,index:0,words:["자석코끼리","야~ 일어나~","임씨는 철퇴로 맞아야","임임임"]};showToast("강씨의 말이 머릿속을 흔든다!");}
function updateMentalAttack(dt){
  shakeTime=Math.max(0,shakeTime-dt);if(!mentalEffect)return;mentalEffect.time+=dt;
  while(mentalEffect.time>=mentalEffect.next&&mentalEffect.time<3){popMentalWord(mentalEffect.words[mentalEffect.index%mentalEffect.words.length],mentalEffect.index);mentalEffect.index++;mentalEffect.next+=.48;}
  if(mentalEffect.time>=3)mentalEffect=null;
}
function startHazardChallenge(h){
  h.cooldown=12;
  if(h.kind==="fight"){
    challenge={mode:"mash",count:0,goal:28,time:6,title:h.name,onSuccess:()=>showToast("악당을 물리쳤다!"),onFail:()=>showEnding("기절 엔딩","악당과의 싸움에서 져 길바닥에 쓰러졌다.","BAD END")};
    showChallenge("악당과 전투","6초 안에 E키를 28번 연타!");
  }else if(h.kind==="race"){
    challenge={mode:"race",count:0,goal:24,time:7,next:"arrowleft",title:h.name,onSuccess:()=>showToast("서씨와의 달리기 승리!"),onFail:()=>{elapsed+=20;showToast("달리기에 져 4분을 허비했다!");}};
    showChallenge("서씨의 달리기 시합","← → 방향키를 번갈아 빠르게 누르세요!");
  }else if(h.kind==="quiz"){
    const questions=[...quizQuestions].sort(()=>Math.random()-.5).slice(0,3);
    challenge={mode:"quiz",questions,quizIndex:0,title:h.name,onSuccess:()=>showToast("3문제 정답! 문제 악당이 길을 비켰다.")};
    renderQuizQuestion();
  }
}
function renderQuizQuestion(){
  const q=challenge.questions[challenge.quizIndex];challenge.answer=q.answer;
  showChallenge(`문제 악당 ${challenge.quizIndex+1}/${challenge.questions.length}`,`${q.q}  ${q.options.map((o,i)=>`${i+1}) ${o}`).join("   ")}`);
  setChallengeBar(challenge.quizIndex/challenge.questions.length);
}
function startSewer(index){
  const arrows=["arrowup","arrowleft","arrowright","arrowdown","arrowup"];
  challenge={mode:"escape",index:0,sequence:arrows,time:16,title:"하수구",onSuccess:()=>{sewers[index].escaped=true;showToast("사다리를 찾아 하수구에서 탈출했다!");},onFail:()=>showEnding("하수구 엔딩","어둠 속에서 사다리를 찾지 못했다.","BAD END")};
  showChallenge("하수구에 빠졌다!","방향 순서를 보고 천천히 입력하세요.");
}
function updateHazards(dt){
  const px=player.x+player.w/2,py=player.y+player.h/2;
  hazards.forEach((h,i)=>{
    h.cooldown=Math.max(0,h.cooldown-dt);const d=Math.hypot(px-h.x*TILE,py-h.y*TILE);
    if(["chase","chaseHard","confuse"].includes(h.kind)&&d<h.range)moveActor(h,px,py,dt,h.kind==="chaseHard"?115:78);
    if(h.kind==="fart"){
      h.wander=(h.wander||0)+dt;const tx=(70+Math.sin(h.wander*.5)*9)*TILE,ty=(55+Math.cos(h.wander*.35)*7)*TILE;moveActor(h,tx,ty,dt,40);
      h.drop=(h.drop||0)-dt;if(h.drop<=0){fartTrails.push({x:h.x,y:h.y,time:8});h.drop=1.3;}
    }
    if(h.kind==="birds"&&d<h.range){h.drop=(h.drop||0)-dt;if(h.drop<=0){droppings.push({x:px/TILE+(Math.random()-.5)*3,y:py/TILE-5,vy:0});h.drop=.7;}}
    if(h.cooldown>0)return;
    if(h.kind==="chase"&&d<30){stun=.7;h.cooldown=8;showToast("양씨가 옆구리를 찔렀다! 잠깐 움직일 수 없다.");}
    if(h.kind==="chaseHard"&&d<34){stun=1.1;h.cooldown=8;const dx=(px-h.x*TILE)/(d||1),dy=(py-h.y*TILE)/(d||1);tryMove(dx*55,dy*55);showToast("하씨: 뭐하는거야! 3연속 옆구리 공격!");}
    if(h.kind==="mental"&&d<h.range){h.cooldown=10;startMentalAttack();}
    if(h.kind==="confuse"&&d<35){confused=3;h.cooldown=10;showToast("봉씨 때문에 방향 감각이 뒤집혔다!");}
    if(["fight","race","quiz"].includes(h.kind)&&d<h.range&&!challenge&&!activeEntity)startHazardChallenge(h);
  });
  fartTrails.forEach(t=>t.time-=dt);while(fartTrails[0]&&fartTrails[0].time<=0)fartTrails.shift();
  droppings.forEach(d=>{d.vy+=18*dt;d.y+=d.vy*dt;if(Math.hypot(px-d.x*TILE,py-d.y*TILE)<25){slow=3;d.hit=true;showToast("새똥을 맞아 발걸음이 느려졌다!");}});for(let i=droppings.length-1;i>=0;i--)if(droppings[i].hit||droppings[i].y>MAP_H)droppings.splice(i,1);
  sewers.forEach((s,i)=>{if(!s.escaped&&Math.hypot(px-s.x*TILE,py-s.y*TILE)<25&&!challenge&&!activeEntity)startSewer(i);});
  if(!bike.taken&&Math.hypot(px-bike.x*TILE,py-bike.y*TILE)<30){bike.taken=true;bikeTime=45;showToast("공공자전거 탑승! 45초 동안 이동 속도 상승");}
}

function clockText(){const total=Math.min(540,450+Math.floor(elapsed/GAME_DURATION*90));return`${String(Math.floor(total/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;}
function updateClock(){ui.clock.textContent=clockText();ui.condition.textContent=stun>0?"움직임 불가":confused>0?"방향 혼란":slow>0?"느려짐":bikeTime>0?`자전거 ${Math.ceil(bikeTime)}초`:"정상";}

function officeBlockedAt(x,y){const feet=playerFeetAt(x,y);return x<28||y<28||x+player.w>canvas.width-28||y+player.h>canvas.height-28||office.solids.some(s=>rectsOverlap(feet,s));}
function moveOfficeAxis(amount,axis){const dir=Math.sign(amount);let left=Math.abs(amount);while(left>0){const step=Math.min(4,left)*dir,nx=axis==="x"?player.x+step:player.x,ny=axis==="y"?player.y+step:player.y;if(officeBlockedAt(nx,ny))break;player[axis]+=step;left-=Math.abs(step);}}
function updateOffice(dt){
  let dx=0,dy=0;if(!activeEntity&&!challenge){if(keys.has("arrowleft")||keys.has("a")){dx--;player.facing="left";}if(keys.has("arrowright")||keys.has("d")){dx++;player.facing="right";}if(keys.has("arrowup")||keys.has("w")){dy--;player.facing="up";}if(keys.has("arrowdown")||keys.has("s")){dy++;player.facing="down";}if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2;}moveOfficeAxis(dx*player.speed*dt,"x");moveOfficeAxis(dy*player.speed*dt,"y");}
  player.moving=Boolean(dx||dy);if(player.moving)player.walk+=dt*11;
  const px=player.x+player.w/2,py=player.y+player.h/2;if(!bossEncountered&&Math.hypot(px-office.boss.x,py-office.boss.y)<82)showBossQuestion();
}

function update(dt){
  if(!gameStarted||gameEnded)return;
  elapsed+=dt;stun=Math.max(0,stun-dt);slow=Math.max(0,slow-dt);bikeTime=Math.max(0,bikeTime-dt);confused=Math.max(0,confused-dt);updateMentalAttack(dt);updateClock();
  if(elapsed>=GAME_DURATION){showEnding("지각 엔딩",`${playerName}은 오전 9시까지 회사에 도착하지 못했다.`,"LATE END");return;}
  if(inOffice){updateOffice(dt);return;}
  let dx=0,dy=0;
  if(!activeEntity&&!challenge&&stun<=0){
    if(keys.has("arrowleft")||keys.has("a")){dx--;player.facing="left";}if(keys.has("arrowright")||keys.has("d")){dx++;player.facing="right";}
    if(keys.has("arrowup")||keys.has("w")){dy--;player.facing="up";}if(keys.has("arrowdown")||keys.has("s")){dy++;player.facing="down";}
    if(confused>0){dx*=-1;dy*=-1;}if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2;}const speed=player.speed*(bikeTime>0?1.55:1)*(slow>0?.52:1);tryMove(dx*speed*dt,dy*speed*dt);
  }
  player.moving=Boolean(dx||dy)&&!activeEntity;if(player.moving)player.walk+=dt*11;
  updateCat(dt);updateChallenge(dt);updateHazards(dt);
  const entrance={x:(company.x+company.w/2)*TILE,y:(company.y+company.h+1)*TILE};
  if(!companyPrompted&&Math.hypot(player.x+player.w/2-entrance.x,player.y+player.h/2-entrance.y)<48)enterOffice();
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

function drawCommuteHazards(){
  fartTrails.forEach(t=>{ctx.fillStyle=`rgba(112,91,45,${Math.min(.55,t.time/8)})`;ctx.fillRect(t.x*TILE-camera.x-15,t.y*TILE-camera.y-9,30,18);});
  sewers.forEach(s=>{const x=s.x*TILE-camera.x,y=s.y*TILE-camera.y;ctx.fillStyle="#282d2e";ctx.fillRect(x-13,y-8,26,16);ctx.strokeStyle="#596164";ctx.lineWidth=2;for(let i=-8;i<=8;i+=5){ctx.beginPath();ctx.moveTo(x+i,y-7);ctx.lineTo(x+i,y+7);ctx.stroke();}});
  if(!bike.taken){const x=bike.x*TILE-camera.x,y=bike.y*TILE-camera.y;ctx.strokeStyle="#72c8d5";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x-8,y+6,7,0,Math.PI*2);ctx.arc(x+9,y+6,7,0,Math.PI*2);ctx.moveTo(x-8,y+6);ctx.lineTo(x,y-6);ctx.lineTo(x+9,y+6);ctx.stroke();}
  droppings.forEach(d=>{ctx.fillStyle="#f2f0dc";ctx.fillRect(d.x*TILE-camera.x-3,d.y*TILE-camera.y-3,6,7);});
  hazards.forEach(h=>{drawBaseCharacter(h.x*TILE,h.y*TILE,h.color,h.icon,false);const x=h.x*TILE-camera.x,y=h.y*TILE-camera.y;ctx.fillStyle="#171917cc";ctx.fillRect(x-24,y+14,48,13);ctx.fillStyle="#f4e8cf";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(h.name,x,y+24);ctx.textAlign="left";});
  const ex=(company.x+company.w/2)*TILE-camera.x,ey=(company.y+company.h+1)*TILE-camera.y;ctx.fillStyle="#f2c14e";ctx.fillRect(ex-16,ey-4,32,8);ctx.fillStyle="#171717";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("회사",ex,ey+19);ctx.textAlign="left";
}

function drawOffice(){
  ctx.fillStyle="#b9b2a1";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#aaa391";for(let y=32;y<canvas.height;y+=32)for(let x=32;x<canvas.width;x+=32)if((x+y)/32%2===0)ctx.fillRect(x,y,32,32);
  ctx.fillStyle="#30383b";ctx.fillRect(0,0,canvas.width,28);ctx.fillRect(0,canvas.height-28,canvas.width,28);ctx.fillRect(0,0,28,canvas.height);ctx.fillRect(canvas.width-28,0,28,canvas.height);
  office.solids.forEach((s,i)=>{if(i<2){ctx.fillStyle="#5a6466";ctx.fillRect(s.x,s.y,s.w,s.h);ctx.fillStyle="#829092";for(let x=s.x+12;x<s.x+s.w-10;x+=42)ctx.fillRect(x,s.y+8,25,6);}else{ctx.fillStyle="#6c5139";ctx.fillRect(s.x,s.y,s.w,s.h);ctx.fillStyle="#d1c19e";ctx.fillRect(s.x+5,s.y+5,s.w-10,12);}});
  ctx.fillStyle="#21313b";ctx.fillRect(807,84,66,42);ctx.fillStyle="#7bd2e4";ctx.fillRect(813,90,54,28);ctx.fillStyle="#333";ctx.fillRect(836,126,8,16);ctx.fillStyle="#f2c14e";ctx.font="bold 12px sans-serif";ctx.fillText("임씨 자리",792,62);
  const b=office.boss;ctx.fillStyle="#0004";ctx.fillRect(b.x-12,b.y+12,24,7);ctx.fillStyle="#563e68";ctx.fillRect(b.x-11,b.y-12,22,24);ctx.fillStyle="#e2bc98";ctx.fillRect(b.x-8,b.y-25,16,14);ctx.fillStyle="#242124";ctx.fillRect(b.x-9,b.y-28,18,6);ctx.fillStyle="#fff";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText("상",b.x,b.y+4);ctx.fillStyle="#222d";ctx.fillRect(b.x-31,b.y+20,62,15);ctx.fillStyle="#fff";ctx.fillText("상사",b.x,b.y+31);ctx.textAlign="left";
  drawPlayer();
  const px=player.x+player.w/2,py=player.y+player.h/2;if(bossEncountered&&Math.hypot(px-office.computer.x,py-office.computer.y)<70){ctx.fillStyle="#151719e8";ctx.fillRect(office.computer.x-53,office.computer.y+20,106,24);ctx.fillStyle="#f6e8bd";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText("E  컴퓨터 켜기",office.computer.x,office.computer.y+36);ctx.textAlign="left";}
}

function eventIsActive(e){return startedEvents.has(e.id)&&!completedEvents.has(e.id);}
function drawEvents(){events.forEach(e=>{if(e.id==="cat"&&!eventIsActive(e))return;const x=e.x*TILE-camera.x,y=e.y*TILE-camera.y,active=eventIsActive(e);if(e.id.startsWith("lamp")){ctx.fillStyle="#454545";ctx.fillRect(x-3,y-20,6,31);ctx.fillRect(x-8,y-22,16,4);ctx.fillStyle=completedEvents.has(e.id)?"#ffe58a":"#8b805a";ctx.fillRect(x-6,y-19,12,9);}else if(e.id.startsWith("parcel")){ctx.fillStyle=e.color;ctx.fillRect(x-9,y-12,18,19);ctx.fillStyle="#dbe3d8";ctx.fillRect(x-6,y-8,12,4);ctx.fillStyle="#4d4b40";ctx.fillRect(x-2,y+7,4,10);}else if(e.id==="cat"){ctx.fillStyle="#a98661";ctx.fillRect(x-9,y-8,18,12);ctx.fillStyle="#ede2c3";ctx.fillRect(x-6,y-15,12,9);ctx.fillStyle="#333";ctx.fillRect(x-3,y-13,2,2);ctx.fillRect(x+3,y-13,2,2);}else{ctx.fillStyle=e.color;ctx.fillRect(x-11,y-13,22,22);ctx.fillStyle="#171917";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(e.icon,x,y+1);ctx.textAlign="left";}if(active){ctx.fillStyle=palette.accent;ctx.font="bold 15px sans-serif";ctx.textAlign="center";ctx.fillText("!",x,y-30);ctx.textAlign="left";}});}
function nearbyNpc(){return npcs.find(n=>Math.hypot(player.x+player.w/2-n.x*TILE,player.y+player.h/2-n.y*TILE)<54);}
function nearbyEvent(){return events.find(e=>eventIsActive(e)&&Math.hypot(player.x+player.w/2-e.x*TILE,player.y+player.h/2-e.y*TILE)<52);}
function drawPrompt(target,label){const x=target.x*TILE-camera.x,y=target.y*TILE-camera.y-42;ctx.fillStyle="#151719e8";ctx.fillRect(x-34,y-12,68,22);ctx.fillStyle="#f6e8bd";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(`E  ${label}`,x,y+3);ctx.textAlign="left";}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();if(shakeTime>0)ctx.translate((Math.random()-.5)*12,(Math.random()-.5)*12);if(inOffice)drawOffice();else{drawGround();drawScenery();buildings.forEach(drawBuilding);drawEvents();drawCommuteHazards();npcs.forEach(drawNpc);drawPlayer();if(gameStarted&&!gameEnded&&!activeEntity&&!challenge){const event=nearbyEvent(),npc=nearbyNpc();if(event)drawPrompt(event,event.mode==="chase"?"잡기":"조사");else if(npc)drawPrompt(npc,"대화");}}ctx.restore();}

function setChallengeBar(value){ui.challengeBar.style.width=`${Math.max(0,Math.min(1,value))*100}%`;}
function showChallenge(title,text){ui.challenge.classList.remove("hidden");ui.challengeTitle.textContent=title;ui.challengeText.textContent=text;setChallengeBar(0);}
function hideChallenge(){ui.challenge.classList.add("hidden");setChallengeBar(0);}
function completeChallenge(success){
  const current=challenge;if(!current)return;challenge=null;hideChallenge();
  if(success){if(current.event)finishEvent(current.event);else current.onSuccess?.();}
  else if(current.onFail)current.onFail();else showToast("시간이 지나 처음부터 다시 해야 한다!");
}
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
    challenge.count++;if(challenge.count>=challenge.goal)completeChallenge(true);return;
  }
  if(challenge.mode==="race"&&(key==="arrowleft"||key==="arrowright")){
    if(key===challenge.next){challenge.count++;challenge.next=key==="arrowleft"?"arrowright":"arrowleft";}else challenge.count=Math.max(0,challenge.count-1);
    if(challenge.count>=challenge.goal)completeChallenge(true);return;
  }
  if(challenge.mode==="escape"&&key.startsWith("arrow")){
    if(key===challenge.sequence[challenge.index])challenge.index++;else showToast("그 방향은 막다른 길! 표시된 방향을 다시 확인하세요.");
    setChallengeBar(challenge.index/challenge.sequence.length);if(challenge.index>=challenge.sequence.length)completeChallenge(true);return;
  }
  if(challenge.mode==="quiz"&&["1","2","3"].includes(key)){
    if(key===challenge.answer){challenge.quizIndex++;if(challenge.quizIndex>=challenge.questions.length)completeChallenge(true);else{showToast("정답! 다음 문제.");renderQuizQuestion();}}
    else{elapsed+=12;showToast("오답! 출근 시간이 조금 줄었다.");}return;
  }
  if(challenge.mode==="sequence"&&key.startsWith("arrow")){
    if(key===challenge.sequence[challenge.index])challenge.index++;
    else{challenge.index=0;showToast("순서가 틀려 처음부터!");}
    setChallengeBar(challenge.index/challenge.sequence.length);
    ui.challengeText.textContent=`방향 입력 ${challenge.index}/${challenge.sequence.length}`;
    if(challenge.index>=challenge.sequence.length)completeChallenge(true);return;
  }
  if(challenge.mode==="timing"&&key===" "){
    if(challenge.phase>=.45&&challenge.phase<=.60){challenge.hits++;showToast("정확한 박자!");}
    else{challenge.hits=0;showToast("박자를 놓쳐 연속 성공 초기화!");}
    if(challenge.hits>=challenge.goal)completeChallenge(true);
  }
}

function npcDialogue(npc){
  if(npc.final){if(completedEvents.size===events.length){items.add("골목 이야기");return npc.lines;}return npc.locked;}
  if(npc.events){
    if(npc.events.every(id=>completedEvents.has(id)))return npc.thanks;
    if(npc.events.some(id=>startedEvents.has(id)))return npc.reminder;
    npc.events.forEach(id=>startedEvents.add(id));return npc.intro;
  }
  if(npc.event){if(completedEvents.has(npc.event))return npc.thanks;if(startedEvents.has(npc.event))return npc.reminder;startedEvents.add(npc.event);return npc.intro;}
  return npc.lines;
}
function openDialogue(entity,lines){activeEntity={...entity,currentLines:lines};dialogueIndex=0;renderDialogue();updateProgress();save();}
function interact(){if(inOffice){const px=player.x+player.w/2,py=player.y+player.h/2;if(bossEncountered&&Math.hypot(px-office.computer.x,py-office.computer.y)<70){showEnding("출근 성공!",`${playerName}은 본인 자리를 찾아 컴퓨터를 켜고 업무를 시작했다.`,"CLEAR",true);return;}showToast(bossEncountered?"임씨 자리를 찾아 컴퓨터를 켜자.":"통로에 있는 상사를 지나가야 한다.");return;}const event=nearbyEvent();if(event){startChallenge(event);return;}const npc=nearbyNpc();if(!npc){showToast("주변에 조사하거나 대화할 대상이 없습니다.");return;}met.add(npc.id);openDialogue(npc,npcDialogue(npc));}
function renderDialogue(){const lines=activeEntity.currentLines;if(dialogueIndex>=lines.length){closeDialogue();return;}ui.dialogue.classList.remove("hidden");ui.speaker.textContent=activeEntity.name;ui.text.textContent=lines[dialogueIndex];ui.portrait.textContent=activeEntity.icon;ui.portrait.style.setProperty("--portrait",activeEntity.color);}
function nextDialogue(){if(!activeEntity)return;dialogueIndex++;renderDialogue();}
function closeDialogue(){activeEntity=null;ui.dialogue.classList.add("hidden");updateProgress();save();}
function renderQuestList(){const active=questGroups.filter(q=>q.ids.some(id=>startedEvents.has(id))&&!q.ids.every(id=>completedEvents.has(id)));ui.questList.replaceChildren();if(!active.length){const li=document.createElement("li");li.className="quest-empty";li.textContent="아직 받은 미션이 없습니다.";ui.questList.appendChild(li);return;}active.forEach(q=>{const done=q.ids.filter(id=>completedEvents.has(id)).length,li=document.createElement("li");li.textContent=q.ids.length>1?`${q.name} ${done}/${q.ids.length}`:q.name;ui.questList.appendChild(li);});}
function updateProgress(){ui.met.textContent=met.size;ui.eventCount.textContent=completedEvents.size;renderQuestList();if(inOffice){ui.mission.textContent=bossEncountered?"임씨 자리를 찾아 컴퓨터를 켜자.":"사무실 통로를 지나 임씨 자리로 가자.";return;}const active=events.find(e=>eventIsActive(e));if(active){ui.mission.textContent=`9시 전 회사 도착 · 선택 사건: ${active.name} (${completedEvents.size}/${events.length})`;return;}ui.mission.textContent=`9시 전 회사 도착 · 골목 사건 ${completedEvents.size}/${events.length}`;}
function showToast(message){ui.toast.textContent=message;ui.toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove("show"),1400);}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({x:player.x,y:player.y,met:[...met],started:[...startedEvents],completed:[...completedEvents],items:[...items]}));}
function load(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(!d)return;player.x=d.x;player.y=d.y;met=new Set(d.met||[]);startedEvents=new Set(d.started||[]);completedEvents=new Set(d.completed||[]);items=new Set(d.items||[]);if(blockedAt(player.x,player.y)){player.x=8*TILE;player.y=12*TILE;}}catch{}}

function rankingText(){
  try{const ranks=JSON.parse(localStorage.getItem(RANK_KEY)||"[]");if(!ranks.length)return"";return`\n\n빠른 출근 기록\n${ranks.slice(0,5).map((r,i)=>`${i+1}. ${r.name} · ${Math.floor(r.time/60)}분 ${Math.floor(r.time%60)}초`).join("\n")}`;}catch{return"";}
}
function recordRanking(){
  try{const ranks=JSON.parse(localStorage.getItem(RANK_KEY)||"[]");ranks.push({name:playerName,time:elapsed});ranks.sort((a,b)=>a.time-b.time);localStorage.setItem(RANK_KEY,JSON.stringify(ranks.slice(0,20)));}catch{}
}
function showEnding(title,text,label="ENDING",clear=false){
  gameEnded=true;keys.clear();challenge=null;hideChallenge();ui.ending.classList.remove("hidden");ui.endingLabel.textContent=label;ui.endingTitle.textContent=title;if(clear)recordRanking();ui.endingText.textContent=text+(clear?rankingText():"");ui.endingText.style.whiteSpace="pre-line";ui.endingChoices.replaceChildren();ui.restart.style.display="inline-block";
}
function enterOffice(){companyPrompted=true;inOffice=true;bossEncountered=false;camera.x=0;camera.y=0;player.x=70;player.y=500;keys.clear();updateProgress();showToast("회사 도착! 이제 임씨 자리에서 컴퓨터를 켜야 한다.");}
function showBossQuestion(){
  gameEnded=true;keys.clear();ui.ending.classList.remove("hidden");ui.endingLabel.textContent="상사에게 붙잡혔다";ui.endingTitle.textContent="곤란한 업무 질문";ui.endingText.textContent="상사: 오늘 안에 끝내기 어려운 일인데 거래처에서는 무조건 해달라고 하네. 어떻게 할 건가?";ui.endingChoices.replaceChildren();ui.restart.style.display="none";
  [["어쩔 수 없지",true],["제가 왜 해야 하죠?",false],["내일 생각해보겠습니다",false],["일단 못 들은 척하겠습니다",false]].forEach(([text,correct])=>{const b=document.createElement("button");b.textContent=text;b.addEventListener("click",()=>{if(correct){bossEncountered=true;gameEnded=false;ui.ending.classList.add("hidden");updateProgress();showToast("상사: ...그래, 일단 가보게.");}else showEnding("회사 밖으로 쫓겨난 엔딩",`상사: 너 누구야?\n${playerName}은 회사 밖으로 쫓겨났다.`,"BAD END");});ui.endingChoices.appendChild(b);});
}
function startGame(){
  const entered=document.querySelector("#playerName").value.trim();playerName=entered||"임씨";player.x=8*TILE;player.y=12*TILE;elapsed=0;stun=slow=bikeTime=confused=shakeTime=0;mentalEffect=null;bike.taken=false;companyPrompted=false;inOffice=false;bossEncountered=false;gameEnded=false;gameStarted=true;ui.start.classList.add("hidden");ui.ending.classList.add("hidden");updateClock();updateProgress();showToast(`${playerName}, 오전 7시 30분 출발! 9시까지 회사로 가자.`);
}

addEventListener("keydown",e=>{const key=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(key))e.preventDefault();if(challenge){handleChallengeKey(key,e.repeat);return;}if(!gameStarted||gameEnded)return;if((key==="e"||key===" ")&&!e.repeat)activeEntity?nextDialogue():interact();keys.add(key);});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));document.querySelector("#nextButton").addEventListener("click",nextDialogue);addEventListener("beforeunload",save);
document.querySelector("#startGameButton").addEventListener("click",startGame);document.querySelector("#playerName").addEventListener("keydown",e=>{if(e.key==="Enter")startGame();});ui.restart.addEventListener("click",()=>location.reload());
load();updateProgress();updateClock();
function loop(now){const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;update(dt);draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
