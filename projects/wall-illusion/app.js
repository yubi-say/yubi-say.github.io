// Café Wall Illusion — Interactive (Canvas)
// - Default: B/W
// - Color burst: complementary colors (still controlled by Contrast + Mortar Gray)
// - Reset returns to B/W defaults

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const ui = {
  tileW: document.getElementById("tileW"),
  tileH: document.getElementById("tileH"),
  offset: document.getElementById("offset"),
  mortar: document.getElementById("mortar"),
  mortarGray: document.getElementById("mortarGray"),
  contrast: document.getElementById("contrast"),
  invert: document.getElementById("invert"),

  burst: document.getElementById("burst"),
  random: document.getElementById("random"),
  reset: document.getElementById("reset"),

  tileWVal: document.getElementById("tileWVal"),
  tileHVal: document.getElementById("tileHVal"),
  offsetVal: document.getElementById("offsetVal"),
  mortarVal: document.getElementById("mortarVal"),
  mortarGrayVal: document.getElementById("mortarGrayVal"),
  contrastVal: document.getElementById("contrastVal"),
};

const defaults = {
  tileW: 72,
  tileH: 34,
  offset: 36,
  mortar: 3,
  mortarGray: 205,
  contrast: 0.92,
  invert: false,
};

// Modes
let colorMode = "bw"; // "bw" | "color"
let palette = null;   // { h1, h2, s, bg }

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function setLabels() {
  ui.tileWVal.textContent = `${ui.tileW.value}px`;
  ui.tileHVal.textContent = `${ui.tileH.value}px`;
  ui.offsetVal.textContent = `${ui.offset.value}px`;
  ui.mortarVal.textContent = `${ui.mortar.value}px`;
  ui.mortarGrayVal.textContent = ui.mortarGray.value;
  ui.contrastVal.textContent = Number(ui.contrast.value).toFixed(2);
}

function dprResize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function hsl(h, s, l) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

// Complementary palette (hues + saturation). Lightness is controlled by the Contrast slider.
function makeComplementaryPalette() {
  const h1 = Math.random() * 360;
  const h2 = (h1 + 180) % 360;
  const s = 72 + Math.random() * 18; // 72..90
  return { h1, h2, s, bg: "#ffffff" };
}

function getColors({ contrast, mortarGray, invert }) {
  const bg = "#ffffff";

  if (colorMode === "color" && palette) {
    // Map contrast (0.4..1) -> luminance separation (illusion-friendly)
    const t = (contrast - 0.4) / (1 - 0.4); // 0..1
    const darkL = clamp(38 - 14 * t, 18, 40);  // ~38 -> ~24
    const lightL = clamp(62 + 18 * t, 60, 85); // ~62 -> ~80

    const brick1 = hsl(palette.h1, palette.s, darkL);
    const brick2 = hsl(palette.h2, palette.s, lightL);

    // Mortar gray slider stays meaningful in color mode (neutral mortar = cleaner illusion)
    const mg = clamp(mortarGray, 0, 255);
    const mortar = `rgb(${mg},${mg},${mg})`;

    const brickA = invert ? brick2 : brick1;
    const brickB = invert ? brick1 : brick2;

    return { bg, mortar, brickA, brickB };
  }

  // B/W mode
  const dark = Math.round(20 + (1 - contrast) * 60);     // 20..80
  const light = Math.round(245 - (1 - contrast) * 40);   // 245..205
  const mg = clamp(mortarGray, 0, 255);
  const mortar = `rgb(${mg},${mg},${mg})`;

  const brickA = invert ? `rgb(${light},${light},${light})` : `rgb(${dark},${dark},${dark})`;
  const brickB = invert ? `rgb(${dark},${dark},${dark})` : `rgb(${light},${light},${light})`;

  return { bg, mortar, brickA, brickB };
}

function draw() {
  setLabels();

  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;

  const tileW = Number(ui.tileW.value);
  const tileH = Number(ui.tileH.value);
  const rowOffset = Number(ui.offset.value);
  const mortar = Number(ui.mortar.value);
  const mortarGray = Number(ui.mortarGray.value);
  const contrast = Number(ui.contrast.value);
  const invert = ui.invert.checked;

  const colors = getColors({ contrast, mortarGray, invert });

  // Background
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);

  // Mortar stripes (horizontal)
  if (mortar > 0) {
    ctx.fillStyle = colors.mortar;
    for (let y = 0; y <= h; y += tileH + mortar) {
      ctx.fillRect(0, y + tileH, w, mortar);
    }
  }

  // Bricks
  const stepY = tileH + mortar;
  const rows = Math.ceil(h / stepY) + 1;

  for (let r = 0; r < rows; r++) {
    const y = r * stepY;

    // alternating offset each row
    const off = (r % 2 === 0) ? 0 : rowOffset;

    // start left enough to cover
    let x = -tileW * 2 + off;
    let i = 0;

    while (x < w + tileW * 2) {
      ctx.fillStyle = (i % 2 === 0) ? colors.brickA : colors.brickB;
      ctx.fillRect(Math.round(x), Math.round(y), tileW, tileH);
      x += tileW;
      i++;
    }
  }
}

function bind() {
  const inputs = [
    ui.tileW, ui.tileH, ui.offset, ui.mortar, ui.mortarGray, ui.contrast, ui.invert
  ];
  inputs.forEach(el => el.addEventListener("input", draw));

  ui.burst.addEventListener("click", () => {
    colorMode = "color";
    palette = makeComplementaryPalette();
    draw();
  });

  ui.random.addEventListener("click", () => {
    ui.tileW.value = String(Math.round(54 + Math.random() * 70));     // 54..124
    ui.tileH.value = String(Math.round(22 + Math.random() * 34));     // 22..56
    ui.offset.value = String(Math.round(Math.random() * Number(ui.tileW.value))); // 0..tileW
    ui.mortar.value = String(Math.round(2 + Math.random() * 4));      // 2..6
    ui.mortarGray.value = String(Math.round(185 + Math.random() * 40)); // 185..225
    ui.contrast.value = String((0.75 + Math.random() * 0.23).toFixed(2)); // .75.. .98
    draw();
  });

  ui.reset.addEventListener("click", () => {
    colorMode = "bw";
    palette = null;

    ui.tileW.value = defaults.tileW;
    ui.tileH.value = defaults.tileH;
    ui.offset.value = defaults.offset;
    ui.mortar.value = defaults.mortar;
    ui.mortarGray.value = defaults.mortarGray;
    ui.contrast.value = defaults.contrast;
    ui.invert.checked = defaults.invert;

    draw();
  });

  window.addEventListener("resize", dprResize);
}

bind();
dprResize();
