const frame = document.getElementById("frame");
const grid = document.getElementById("grid");

const depthInput = document.getElementById("depth");
const depthVal = document.getElementById("depthVal");

const N = 16;

// IMPORTANTe: tomar el valor real del input al cargar
let depth = parseFloat(depthInput.value);

let targetCenter = { x: 0.5, y: 0.5 };
let smoothCenter = { x: 0.5, y: 0.5 };

const cells = [];
let rafId = null;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

function init() {
  grid.style.setProperty("--n", N);
  grid.innerHTML = "";
  cells.length = 0;

  for (let i = 0; i < N * N; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerHTML = `<div class="shadow"></div><div class="dot"></div>`;
    grid.appendChild(cell);

    const row = Math.floor(i / N);
    const col = i % N;
    cells.push({ el: cell, row, col });
  }

  depthVal.textContent = `${depth.toFixed(2)}×`;
  updateStyles(0.5, 0.5);
}

function updateStyles(cxN, cyN) {
  const cx = cxN * (N - 1);
  const cy = cyN * (N - 1);

  const d1 = Math.hypot(0 - cx, 0 - cy);
  const d2 = Math.hypot((N - 1) - cx, 0 - cy);
  const d3 = Math.hypot(0 - cx, (N - 1) - cy);
  const d4 = Math.hypot((N - 1) - cx, (N - 1) - cy);
  const maxD = Math.max(d1, d2, d3, d4) || 1;

  const r = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--d")) / 2;

  for (const c of cells) {
    const dx = c.col - cx;
    const dy = c.row - cy;

    const dist = Math.hypot(dx, dy);
    const t = clamp(dist / maxD, 0, 1);

    let vx = 0, vy = 0;
    if (dist > 0.0001) {
      vx = dx / dist;
      vy = dy / dist;
    }

    const L = lerp(12, 90, t);
    const base = `hsl(0 0% ${L}%)`;

    // OPTION 2 (radial-only): depth escala SOLO la parte dependiente de t
    const shadowMag = r * (0.06 + 0.28 * t * depth);
    const hiMag = r * (0.04 + 0.22 * t * depth);

    const so = lerp(0.95, 0.55, t);
    const ho = lerp(0.10, 0.95, t);

    const sx = (-vx * shadowMag);
    const sy = (-vy * shadowMag);
    const hx = (vx * hiMag);
    const hy = (vy * hiMag);

    c.el.style.setProperty("--base", base);
    c.el.style.setProperty("--sx", `${sx.toFixed(2)}px`);
    c.el.style.setProperty("--sy", `${sy.toFixed(2)}px`);
    c.el.style.setProperty("--hx", `${hx.toFixed(2)}px`);
    c.el.style.setProperty("--hy", `${hy.toFixed(2)}px`);
    c.el.style.setProperty("--so", so.toFixed(3));
    c.el.style.setProperty("--ho", ho.toFixed(3));
  }
}

function tick() {
  const ease = 0.18;
  smoothCenter.x = lerp(smoothCenter.x, targetCenter.x, ease);
  smoothCenter.y = lerp(smoothCenter.y, targetCenter.y, ease);

  updateStyles(smoothCenter.x, smoothCenter.y);
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (rafId != null) return;
  rafId = requestAnimationFrame(tick);
}

function stop() {
  if (rafId == null) return;
  cancelAnimationFrame(rafId);
  rafId = null;
}

function setTargetFromClientXY(clientX, clientY) {
  const rect = frame.getBoundingClientRect();
  targetCenter.x = clamp((clientX - rect.left) / rect.width, 0, 1);
  targetCenter.y = clamp((clientY - rect.top) / rect.height, 0, 1);
}

frame.addEventListener("pointerenter", e => {
  setTargetFromClientXY(e.clientX, e.clientY);
  start();
});
frame.addEventListener("pointermove", e => {
  setTargetFromClientXY(e.clientX, e.clientY);
});
frame.addEventListener("pointerleave", () => {
  targetCenter.x = 0.5;
  targetCenter.y = 0.5;
  setTimeout(() => { if (!frame.matches(":hover")) stop(); }, 350);
});

depthInput.addEventListener("input", () => {
  depth = parseFloat(depthInput.value);
  depthVal.textContent = `${depth.toFixed(2)}×`;
  if (rafId == null) updateStyles(smoothCenter.x, smoothCenter.y);
});

init();
window.addEventListener("resize", () => updateStyles(smoothCenter.x, smoothCenter.y));
