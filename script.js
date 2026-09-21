const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE = 32;
const MAP_W = 70;
const MAP_H = 45;
const SAVE_KEY = "imc-neighborhood-save-v1";

const palette = {
  grass: "#7f9b68", grass2: "#738e5f", road: "#777b76", roadLine: "#aaa999",
  pavement: "#b6ad95", wall: "#ddd0af", roof: "#9d584c", roof2: "#6d777f",
  fence: "#6c5745", tree: "#3e6b4b", trunk: "#5c4432", water: "#5d8ca0",
};

const buildings = [
  { x: 3, y: 3, w: 10, h: 7, color: palette.roof, name: "영준의 집" },
  { x: 17, y: 2, w: 9, h: 8, color: palette.roof2, name: "빨간 지붕집" },
  { x: 31, y: 3, w: 12, h: 7, color: "#a97a4d", name: "동네 슈퍼" },
  { x: 49, y: 2, w: 15, h: 8, color: "#756f83", name: "연립주택" },
  { x: 5, y: 17, w: 12, h: 8, color: "#a96961", name: "이발소" },
  { x: 22, y: 18, w: 8, h: 6, color: "#697f80", name: "빈집" },
  { x: 36, y: 16, w: 13, h: 9, color: "#9b6f53", name: "세탁소" },
  { x: 55, y: 18, w: 10, h: 7, color: "#7c7259", name: "공사장" },
  { x: 2, y: 33, w: 13, h: 8, color: "#7d6a78", name: "낡은 빌라" },
  { x: 22, y: 34, w: 12, h: 7, color: "#a5644f", name: "놀이터 관리소" },
  { x: 43, y: 32, w: 9, h: 9, color: "#687e6a", name: "골목 끝집" },
  { x: 58, y: 33, w: 10, h: 8, color: "#855f55", name: "언덕 입구" },
];

const ponds = [{ x: 17, y: 29, w: 7, h: 4 }];
const fences = [
  { x: 1, y: 13, w: 18, h: 1 }, { x: 27, y: 12, w: 17, h: 1 },
  { x: 51, y: 13, w: 17, h: 1 }, { x: 1, y: 28, w: 12, h: 1 },
  { x: 27, y: 28, w: 10, h: 1 }, { x: 52, y: 28, w: 16, h: 1 },
];

const npcs = [
  { id: "dongzi", name: "Mr.3 Dongzi", x: 15.5, y: 11.5, color: "#cf7a5f", icon: "3", lines: ["친구를 찾는다고? 이 동네에서는 먼저 친구를 만들어야 길이 보여.", "슈퍼 앞의 하얀 옷을 입은 사람에게 물어봐. 골목 소문은 그 사람이 제일 빨라."] },
  { id: "dust", name: "Mr.6 WhiteDust", x: 43.5, y: 11.5, color: "#d8d8cc", icon: "6", requires: "dongzi", locked: "처음 보는 사람에게는 할 말이 없는데... Mr.3와 먼저 이야기해 봐.", lines: ["콜록! 한빈은 남쪽 이발소 쪽으로 갔어. 하지만 지름길은 막혔지.", "동쪽 큰길로 돌아 내려가. 구경꾼이 길목을 지키고 있을 거야."] },
  { id: "overseer", name: "Mr.9 Overseer", x: 52.5, y: 27, color: "#728ec0", icon: "9", requires: "dust", locked: "난 아직 구경할 게 없어. 다른 소문부터 가져와.", lines: ["오, 드디어 여기까지 왔군. 나는 모든 걸 봤지.", "한빈을 쫓는 붉은 옷의 남자가 연못 근처를 맴돌고 있어. 먼저 그를 찾아봐."] },
  { id: "phoenix", name: "In凸 The Phoenix", x: 25.5, y: 31.5, color: "#c95042", icon: "凸", requires: "overseer", locked: "거짓말할 준비가 아직 안 됐어. 구경꾼에게 먼저 가.", lines: ["한빈? 북쪽으로 갔지. 분명해. 아마도. 어쩌면.", "...사실은 남동쪽 골목 끝집에서 삼성 언덕으로 가는 표식을 봤어."] },
  { id: "grandma", name: "평상 할머니", x: 8.5, y: 30.5, color: "#b7839a", icon: "할", lines: ["이 골목은 길이 빙빙 돌아. 담장 틈과 집 사이를 잘 살펴봐.", "사람들과 이야기를 많이 나누면, 마지막 길도 자연히 열릴 게다."] },
  { id: "kid", name: "공 차는 아이", x: 38.5, y: 28.5, color: "#e1a84d", icon: "공", lines: ["아저씨 찾는 중이야? 난 놀이터에서 이상한 빨간 그림자를 봤어!", "근데 공을 세 번 차고 사라졌어. 진짜라니까!"] },
  { id: "guard", name: "언덕 문지기", x: 55, y: 42, color: "#5f8e78", icon: "문", requires: "phoenix", locked: "언덕 위는 위험해. 동네의 중요한 소문을 모두 확인하고 와.", lines: ["건방 사천왕의 소문을 모두 모았군.", "한빈은 평택의 가장 높은 곳에서 기다린다. 다음 장에서 삼성 언덕으로 향하게 될 거야."] },
];

const player = { x: 8 * TILE, y: 12 * TILE, w: 20, h: 22, speed: 170, facing: "down" };
const camera = { x: 0, y: 0 };
const keys = new Set();
let met = new Set();
let activeNpc = null;
let dialogueIndex = 0;
let lastTime = performance.now();
let toastTimer = 0;

const ui = {
  dialogue: document.querySelector("#dialogue"), speaker: document.querySelector("#speaker"),
  text: document.querySelector("#dialogueText"), portrait: document.querySelector("#portrait"),
  met: document.querySelector("#metCount"), total: document.querySelector("#npcCount"),
  mission: document.querySelector("#missionText"), toast: document.querySelector("#toast"),
};
ui.total.textContent = npcs.length;

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function blocked(rect) {
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > MAP_W * TILE || rect.y + rect.h > MAP_H * TILE) return true;
  const solids = [...buildings, ...fences, ...ponds].map(o => ({ x: o.x * TILE, y: o.y * TILE, w: o.w * TILE, h: o.h * TILE }));
  return solids.some(s => rectsOverlap(rect, s));
}

function tryMove(dx, dy) {
  const nextX = { x: player.x + dx, y: player.y, w: player.w, h: player.h };
  if (!blocked(nextX)) player.x += dx;
  const nextY = { x: player.x, y: player.y + dy, w: player.w, h: player.h };
  if (!blocked(nextY)) player.y += dy;
}

function update(dt) {
  if (!activeNpc) {
    let dx = 0, dy = 0;
    if (keys.has("arrowleft") || keys.has("a")) { dx--; player.facing = "left"; }
    if (keys.has("arrowright") || keys.has("d")) { dx++; player.facing = "right"; }
    if (keys.has("arrowup") || keys.has("w")) { dy--; player.facing = "up"; }
    if (keys.has("arrowdown") || keys.has("s")) { dy++; player.facing = "down"; }
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    tryMove(dx * player.speed * dt, dy * player.speed * dt);
  }
  camera.x += (player.x - canvas.width / 2 - camera.x) * Math.min(1, dt * 7);
  camera.y += (player.y - canvas.height / 2 - camera.y) * Math.min(1, dt * 7);
  camera.x = Math.max(0, Math.min(camera.x, MAP_W * TILE - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, MAP_H * TILE - canvas.height));
}

function drawGround() {
  const startX = Math.floor(camera.x / TILE), endX = Math.ceil((camera.x + canvas.width) / TILE);
  const startY = Math.floor(camera.y / TILE), endY = Math.ceil((camera.y + canvas.height) / TILE);
  for (let y = startY; y <= endY; y++) for (let x = startX; x <= endX; x++) {
    const road = x === 20 || x === 21 || x === 45 || x === 46 || (y >= 11 && y <= 12) || (y >= 26 && y <= 27) || (y >= 42 && y <= 43);
    ctx.fillStyle = road ? palette.road : ((x + y) % 5 === 0 ? palette.grass2 : palette.grass);
    ctx.fillRect(x * TILE - camera.x, y * TILE - camera.y, TILE + 1, TILE + 1);
    if (road && ((x + y) % 4 === 0)) {
      ctx.fillStyle = "#6d716d"; ctx.fillRect(x * TILE - camera.x + 4, y * TILE - camera.y + 6, 3, 3);
    }
  }
}

function drawBuilding(b) {
  const x = b.x * TILE - camera.x, y = b.y * TILE - camera.y, w = b.w * TILE, h = b.h * TILE;
  ctx.fillStyle = "#4b4035"; ctx.fillRect(x - 5, y + 10, w + 10, h - 5);
  ctx.fillStyle = palette.wall; ctx.fillRect(x, y + 28, w, h - 28);
  ctx.fillStyle = b.color; ctx.fillRect(x - 7, y, w + 14, 38);
  ctx.fillStyle = "#54372f"; ctx.fillRect(x + w / 2 - 13, y + h - 38, 26, 38);
  ctx.fillStyle = "#75a1aa";
  for (let wx = 22; wx < w - 20; wx += 58) ctx.fillRect(x + wx, y + 54, 22, 20);
  ctx.fillStyle = "#191b1a"; ctx.fillRect(x + 8, y + h - 5, w - 16, 5);
  ctx.fillStyle = "#272725cc"; ctx.fillRect(x + 8, y + 5, Math.min(w - 16, b.name.length * 13 + 12), 20);
  ctx.fillStyle = "#f0e7d2"; ctx.font = "bold 11px sans-serif"; ctx.fillText(b.name, x + 14, y + 19);
}

function drawScenery() {
  ponds.forEach(p => { ctx.fillStyle = palette.water; ctx.fillRect(p.x*TILE-camera.x, p.y*TILE-camera.y, p.w*TILE, p.h*TILE); });
  fences.forEach(f => {
    ctx.fillStyle = palette.fence; ctx.fillRect(f.x*TILE-camera.x, f.y*TILE-camera.y+10, f.w*TILE, 9);
    for (let i=0; i<f.w; i++) ctx.fillRect((f.x+i)*TILE-camera.x+4, f.y*TILE-camera.y+3, 6, 24);
  });
  const trees = [[1,2],[14,5],[28,6],[47,7],[67,4],[3,15],[19,16],[33,15],[51,16],[68,20],[2,31],[16,38],[38,35],[54,31],[69,38]];
  trees.forEach(([tx,ty]) => {
    const x=tx*TILE-camera.x, y=ty*TILE-camera.y;
    ctx.fillStyle=palette.trunk; ctx.fillRect(x+12,y+19,8,18);
    ctx.fillStyle=palette.tree; ctx.fillRect(x+3,y+4,26,23); ctx.fillStyle="#527e55"; ctx.fillRect(x+8,y,17,10);
  });
}

function drawCharacter(x, y, color, icon, metBefore=false) {
  const sx=x-camera.x, sy=y-camera.y;
  ctx.fillStyle="#0004"; ctx.fillRect(sx-10,sy+9,20,6);
  ctx.fillStyle=color; ctx.fillRect(sx-9,sy-11,18,20);
  ctx.fillStyle="#e8c49f"; ctx.fillRect(sx-7,sy-20,14,12);
  ctx.fillStyle="#222"; ctx.fillRect(sx-6,sy-22,12,5);
  ctx.fillStyle="#fff"; ctx.font="bold 8px sans-serif"; ctx.textAlign="center"; ctx.fillText(icon,sx,sy+3); ctx.textAlign="left";
  if (metBefore) { ctx.fillStyle=palette.accent; ctx.fillRect(sx+9,sy-25,5,5); }
}

function drawPlayer() {
  const x=player.x-camera.x+player.w/2, y=player.y-camera.y+player.h/2;
  drawCharacter(x,y,"#4f7295","하");
  ctx.fillStyle="#d14f43";
  const offsets={left:[-15,-6],right:[10,-6],up:[-3,-28],down:[-3,13]};
  const [ox,oy]=offsets[player.facing]; ctx.fillRect(x+ox,y+oy,6,6);
}

function nearbyNpc() {
  return npcs.find(n => Math.hypot(player.x+player.w/2-n.x*TILE, player.y+player.h/2-n.y*TILE) < 54);
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawGround(); drawScenery(); buildings.forEach(drawBuilding);
  npcs.forEach(n => drawCharacter(n.x*TILE,n.y*TILE,n.color,n.icon,met.has(n.id)));
  drawPlayer();
  const near=nearbyNpc();
  if (near && !activeNpc) {
    const x=near.x*TILE-camera.x, y=near.y*TILE-camera.y-42;
    ctx.fillStyle="#151719e8"; ctx.fillRect(x-27,y-12,54,22);
    ctx.fillStyle="#f6e8bd"; ctx.font="bold 11px sans-serif"; ctx.textAlign="center"; ctx.fillText("E  대화",x,y+3); ctx.textAlign="left";
  }
}

function talk() {
  const npc = nearbyNpc();
  if (!npc) { showToast("주변에 대화할 사람이 없습니다."); return; }
  activeNpc=npc; dialogueIndex=0;
  const locked=npc.requires && !met.has(npc.requires);
  npc.currentLines=locked ? [npc.locked] : npc.lines;
  if (!locked) met.add(npc.id);
  renderDialogue(); updateProgress(); save();
}

function renderDialogue() {
  const lines=activeNpc.currentLines;
  if (dialogueIndex >= lines.length) { closeDialogue(); return; }
  ui.dialogue.classList.remove("hidden");
  ui.speaker.textContent=activeNpc.name; ui.text.textContent=lines[dialogueIndex];
  ui.portrait.textContent=activeNpc.icon; ui.portrait.style.setProperty("--portrait",activeNpc.color);
}

function nextDialogue() { if (!activeNpc) return; dialogueIndex++; renderDialogue(); }
function closeDialogue() { activeNpc=null; ui.dialogue.classList.add("hidden"); }

function updateProgress() {
  ui.met.textContent=met.size;
  const core=["dongzi","dust","overseer","phoenix"];
  const coreMet=core.filter(id=>met.has(id)).length;
  if (met.has("guard")) ui.mission.textContent="삼성 언덕으로 가는 길을 찾았다. 다음 장을 기다리자.";
  else if (coreMet===4) ui.mission.textContent="남동쪽 끝에서 언덕 문지기를 찾아가자.";
  else ui.mission.textContent=`건방 사천왕의 소문을 모으자. (${coreMet}/4)`;
}

function showToast(message) {
  ui.toast.textContent=message; ui.toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>ui.toast.classList.remove("show"),1300);
}

function save() { localStorage.setItem(SAVE_KEY, JSON.stringify({x:player.x,y:player.y,met:[...met]})); }
function load() {
  try { const data=JSON.parse(localStorage.getItem(SAVE_KEY)); if (!data) return; player.x=data.x; player.y=data.y; met=new Set(data.met||[]); } catch {}
}
function reset() { localStorage.removeItem(SAVE_KEY); location.reload(); }

addEventListener("keydown", e => {
  const key=e.key.toLowerCase();
  if (["arrowup","arrowdown","arrowleft","arrowright"," "].includes(key)) e.preventDefault();
  if ((key==="e" || key===" ") && !e.repeat) activeNpc ? nextDialogue() : talk();
  keys.add(key);
});
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
document.querySelector("#nextButton").addEventListener("click", nextDialogue);
document.querySelector("#resetButton").addEventListener("click", reset);
addEventListener("beforeunload", save);

load(); updateProgress();
function loop(now) {
  const dt=Math.min((now-lastTime)/1000,.05); lastTime=now;
  update(dt); draw(); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
