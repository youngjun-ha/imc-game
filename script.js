const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE = 32;
const MAP_W = 70;
const MAP_H = 45;
const SAVE_KEY = "imc-neighborhood-save-v3";

const palette = {
  grass: "#7f9b68", grass2: "#738e5f", road: "#777b76", roadLine: "#aaa999",
  pavement: "#b6ad95", wall: "#ddd0af", roof: "#9d584c", roof2: "#6d777f",
  fence: "#6c5745", tree: "#3e6b4b", trunk: "#5c4432", water: "#5d8ca0",
};

const buildings = [
  { x: 3, y: 3, w: 10, h: 7, color: palette.roof, name: "임씨의 집" },
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
const sceneryTrees = [[1,2],[14,5],[28,6],[47,7],[67,4],[3,15],[19,16],[33,15],[51,16],[68,20],[2,31],[16,38],[38,35],[54,31],[69,38]];

const npcs = [
  { id: "shopkeeper", name: "동네 슈퍼 주인", x: 15.5, y: 11.5, color: "#cf7a5f", icon: "슈", lines: ["임씨, 동네를 둘러보러 나온 거야?", "큰길을 따라가면 우편배달부를 만날 수 있을 거야."] },
  { id: "postman", name: "우편배달부", x: 43.5, y: 11.5, color: "#d8d8cc", icon: "우", requires: "shopkeeper", locked: "배달이 바빠서 지금은 길게 이야기하기 어렵네요. 슈퍼에 들렀다가 와주세요.", lines: ["임씨 앞으로 온 우편물은 없네요.", "동쪽 큰길로 내려가면 산책하는 주민을 만날 수 있어요."] },
  { id: "walker", name: "산책하는 주민", x: 52.5, y: 27, color: "#728ec0", icon: "산", requires: "postman", locked: "우리 아직 인사를 나눈 적이 없죠? 우편배달부에게 먼저 가보세요.", lines: ["안녕하세요, 임씨. 이 동네 골목은 처음엔 꽤 헷갈리죠.", "연못 근처의 세탁소 직원이 골목길을 잘 알고 있어요."] },
  { id: "laundry", name: "세탁소 직원", x: 25.5, y: 31.5, color: "#c95042", icon: "세", requires: "walker", locked: "지금 손님 옷을 정리하는 중이에요. 산책 나온 분과 먼저 이야기해 보세요.", lines: ["임씨, 골목을 한 바퀴 돌고 있군요.", "남동쪽 골목 끝까지 가면 동네 안내판을 지키는 관리인이 있어요."] },
  { id: "grandma", name: "평상 할머니", x: 8.5, y: 30.5, color: "#b7839a", icon: "할", lines: ["임씨, 담장 사이로 난 좁은 길도 놓치지 말거라.", "천천히 동네 사람들과 인사하면서 둘러보렴."] },
  { id: "kid", name: "공 차는 아이", x: 38.5, y: 28.5, color: "#e1a84d", icon: "공", lines: ["임씨 아저씨, 같이 공 찰래요?", "놀이터 옆 골목으로 가면 지름길이 하나 있어요!"] },
  { id: "manager", name: "동네 관리인", x: 55, y: 42, color: "#5f8e78", icon: "관", requires: "laundry", locked: "동네 안내를 받으려면 주민들과 먼저 인사를 나누고 오세요.", lines: ["임씨, 동네 한 바퀴를 제대로 돌았군요.", "이제 주택가의 길을 익혔습니다. 자유롭게 더 둘러보세요."] },
];
const worldSolids = solidRects();

const player = { x: 8 * TILE, y: 12 * TILE, w: 20, h: 22, speed: 180, facing: "down" };
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

function playerFeetAt(x, y) {
  return { x: x + 3, y: y + 14, w: player.w - 6, h: 8 };
}

function solidRects() {
  const houseRects = buildings.map(b => ({
    x: b.x * TILE + 2, y: b.y * TILE + 8,
    w: b.w * TILE - 4, h: b.h * TILE - 8,
  }));
  const fenceRects = fences.map(f => ({
    x: f.x * TILE + 2, y: f.y * TILE + 7,
    w: f.w * TILE - 4, h: 15,
  }));
  const pondRects = ponds.map(p => ({
    x: p.x * TILE + 3, y: p.y * TILE + 3,
    w: p.w * TILE - 6, h: p.h * TILE - 6,
  }));
  const treeRects = sceneryTrees.map(([x, y]) => ({
    x: x * TILE + 8, y: y * TILE + 21, w: 16, h: 15,
  }));
  const npcRects = npcs.map(n => ({
    x: n.x * TILE - 8, y: n.y * TILE - 2, w: 16, h: 13,
  }));
  return [...houseRects, ...fenceRects, ...pondRects, ...treeRects, ...npcRects];
}

function blockedAt(x, y) {
  const feet = playerFeetAt(x, y);
  if (feet.x < 0 || feet.y < 0 || feet.x + feet.w > MAP_W * TILE || feet.y + feet.h > MAP_H * TILE) return true;
  return worldSolids.some(solid => rectsOverlap(feet, solid));
}

function moveAxis(amount, axis) {
  const direction = Math.sign(amount);
  let remaining = Math.abs(amount);
  while (remaining > 0) {
    const step = Math.min(4, remaining) * direction;
    const nextX = axis === "x" ? player.x + step : player.x;
    const nextY = axis === "y" ? player.y + step : player.y;
    if (blockedAt(nextX, nextY)) break;
    player[axis] += step;
    remaining -= Math.abs(step);
  }
}

function tryMove(dx, dy) {
  // 축별로 따로 움직이면 모서리에 닿아도 가능한 방향으로 자연스럽게 미끄러진다.
  if (Math.abs(dx) > Math.abs(dy)) {
    moveAxis(dx, "x"); moveAxis(dy, "y");
  } else {
    moveAxis(dy, "y"); moveAxis(dx, "x");
  }
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
  sceneryTrees.forEach(([tx,ty]) => {
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
  drawCharacter(x,y,"#4f7295","임");
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
  const core=["shopkeeper","postman","walker","laundry"];
  const coreMet=core.filter(id=>met.has(id)).length;
  if (met.has("manager")) ui.mission.textContent="주택가의 길을 모두 익혔다. 자유롭게 둘러보자.";
  else if (coreMet===4) ui.mission.textContent="남동쪽 끝에서 동네 관리인을 찾아가자.";
  else ui.mission.textContent=`동네 사람들과 인사를 나누자. (${coreMet}/4)`;
}

function showToast(message) {
  ui.toast.textContent=message; ui.toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>ui.toast.classList.remove("show"),1300);
}

function save() { localStorage.setItem(SAVE_KEY, JSON.stringify({x:player.x,y:player.y,met:[...met]})); }
function load() {
  try { const data=JSON.parse(localStorage.getItem(SAVE_KEY)); if (!data) return; player.x=data.x; player.y=data.y; met=new Set(data.met||[]); } catch {}
}
addEventListener("keydown", e => {
  const key=e.key.toLowerCase();
  if (["arrowup","arrowdown","arrowleft","arrowright"," "].includes(key)) e.preventDefault();
  if ((key==="e" || key===" ") && !e.repeat) activeNpc ? nextDialogue() : talk();
  keys.add(key);
});
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
document.querySelector("#nextButton").addEventListener("click", nextDialogue);
addEventListener("beforeunload", save);

load(); updateProgress();
function loop(now) {
  const dt=Math.min((now-lastTime)/1000,.05); lastTime=now;
  update(dt); draw(); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
