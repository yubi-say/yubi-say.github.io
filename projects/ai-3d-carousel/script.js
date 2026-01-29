// script.js
(() => {
  const stage = document.querySelector(".stage");
  const pager = document.querySelector(".pager");
  const prevBtn = document.querySelector(".navBtn--left");
  const nextBtn = document.querySelector(".navBtn--right");

  const themes = [
    { label: "/Imagine", img: makeSvgBg({ a: "#9fb9b2", b: "#6f8c89", petal1: "#e07a5f", petal2: "#f2b5a3", accent: "#2b2b2d" }) },
    { label: "/Imagine", img: makeSvgBg({ a: "#7b6bbf", b: "#2f5e82", petal1: "#ff7aa8", petal2: "#ffb27a", accent: "#ffffff" }) },
    { label: "/Imagine", img: makeSvgBg({ a: "#e9b678", b: "#c5864b", petal1: "#ffffff", petal2: "#f3d8c6", accent: "#2b2b2d" }) },
    { label: "/Imagine", img: makeSvgBg({ a: "#b9c6ff", b: "#6f79c7", petal1: "#ffe1f0", petal2: "#ffd0a8", accent: "#ffffff" }) },
    { label: "/Imagine", img: makeSvgBg({ a: "#b9d0df", b: "#7a9bb7", petal1: "#d9fff2", petal2: "#f4fff9", accent: "#2b2b2d" }) },
  ];

  const POS_CLASSES = ["pos-active", "pos-right1", "pos-right2", "pos-left2", "pos-left1"];
  // Mapping around active: [active, +1, +2, -2, -1]
  let active = 1; // start on "vivid"
  let locked = false;

  const cards = themes.map((t, i) => createCard(t, i));
  cards.forEach(c => stage.appendChild(c));

  const dots = themes.map((t, i) => createDot(i, t.label));
  dots.forEach(d => pager.appendChild(d));

  // ✅ arrows fixed (previous version could get overridden by click-jump logic)
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));

  // Keyboard
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // Swipe
  let startX = 0, startY = 0, dragging = false;

  stage.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy)) return;
    step(dx < 0 ? 1 : -1);
  });

  stage.addEventListener("pointercancel", () => (dragging = false));

  render();

  function step(dirOrSteps) {
    if (locked) return;
    locked = true;

    const steps = Number(dirOrSteps) || 0;
    if (steps === 0) { locked = false; return; }

    active = mod(active + steps, themes.length);
    render();

    // matches CSS transition feel (professional & smooth)
    window.setTimeout(() => (locked = false), 520);
  }

  function render() {
    cards.forEach((card) => {
      POS_CLASSES.forEach(pc => card.classList.remove(pc));
      card.setAttribute("aria-hidden", "true");
      card.tabIndex = -1;
    });

    const idxActive = active;
    const idxP1 = mod(active + 1, themes.length);
    const idxP2 = mod(active + 2, themes.length);
    const idxM2 = mod(active - 2, themes.length);
    const idxM1 = mod(active - 1, themes.length);

    const ordered = [
      [idxActive, "pos-active"],
      [idxP1, "pos-right1"],
      [idxP2, "pos-right2"],
      [idxM2, "pos-left2"],
      [idxM1, "pos-left1"],
    ];

    ordered.forEach(([idx, cls]) => cards[idx].classList.add(cls));

    const activeCard = cards[idxActive];
    activeCard.setAttribute("aria-hidden", "false");
    activeCard.tabIndex = 0;

    dots.forEach((dot, i) => {
      dot.setAttribute("aria-selected", String(i === idxActive));
      dot.tabIndex = i === idxActive ? 0 : -1;
    });

    stage.setAttribute("aria-label", `Carousel. Active: ${themes[idxActive].label}`);
  }

  function createCard(theme, index) {
    const el = document.createElement("article");
    el.className = "card";
    el.setAttribute("role", "group");
    el.setAttribute("aria-roledescription", "slide");
    el.setAttribute("aria-label", `${index + 1} of ${themes.length}: ${theme.label}`);

    const bg = document.createElement("div");
    bg.className = "card__bg";
    bg.style.setProperty("--img", `url("${theme.img}")`);

    const vignette = document.createElement("div");
    vignette.className = "card__vignette";

    const label = document.createElement("div");
    label.className = "card__label";
    label.textContent = theme.label;

    el.appendChild(bg);
    el.appendChild(vignette);
    el.appendChild(label);

    // clicking a side card moves it to center (1 step)
    el.addEventListener("click", () => {
      if (locked) return;
      if (active === index) return;

      const n = themes.length;
      const forward = mod(index - active, n);
      const backward = mod(active - index, n);

      // If it's adjacent, do 1-step. If it's a far card (hidden), jump by steps.
      const steps = forward <= backward ? forward : -backward;
      step(steps);
    });

    return el;
  }

  function createDot(index, label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dot";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-label", `Go to ${label}`);
    btn.setAttribute("aria-selected", "false");

    btn.addEventListener("click", () => {
      if (locked) return;
      if (active === index) return;

      const n = themes.length;
      const forward = mod(index - active, n);
      const backward = mod(active - index, n);
      const steps = forward <= backward ? forward : -backward;
      step(steps);
    });

    return btn;
  }

  function mod(a, n) {
    return ((a % n) + n) % n;
  }

  function makeSvgBg({ a, b, petal1, petal2, accent }) {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${a}"/>
            <stop offset="1" stop-color="${b}"/>
          </linearGradient>
          <radialGradient id="p" cx="40%" cy="28%" r="68%">
            <stop offset="0" stop-color="${petal1}" stop-opacity="0.95"/>
            <stop offset="1" stop-color="${petal2}" stop-opacity="0.0"/>
          </radialGradient>
          <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18"/>
          </filter>
        </defs>

        <rect width="900" height="1200" fill="url(#g)"/>

        <g filter="url(#blur)" opacity="0.95">
          <path d="M468 240c120 40 220 140 180 260-40 120-210 120-290 60-80-60-90-220 110-320z" fill="url(#p)"/>
          <path d="M360 330c30-140 180-220 290-140 110 80 40 240-70 300-110 60-250-10-220-160z" fill="url(#p)"/>
          <path d="M530 420c160 20 260 150 180 270-80 120-240 70-320-10-80-80-40-240 140-260z" fill="url(#p)"/>
        </g>

        <g opacity="0.35">
          <path d="M470 1180c-12-210 30-330 90-470 60-140 80-220 90-340" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="8" stroke-linecap="round"/>
          <circle cx="468" cy="545" r="10" fill="${accent}" fill-opacity="0.45"/>
        </g>
      </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
})();
