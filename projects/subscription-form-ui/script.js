document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".subscription-card");
  const container = document.querySelector(".subscription-container");
  const subscribeBtn = document.querySelector(".subscribe-btn");
  const form = document.querySelector(".subscription-form");
  const confirmation = document.querySelector(".subscription-confirmation");
  const input = form.querySelector("input");
  const title = document.querySelector(".subscription-card h2");
  const description = document.querySelector(".subscription-text");
  const resetBtn = document.querySelector(".reset-btn");

  function showResetOnSuccess() {
    if (!resetBtn) return;
    resetBtn.textContent = "Start over";
    resetBtn.classList.add("is-visible"); // requires CSS .reset-btn.is-visible
  }

  function hideReset() {
    if (!resetBtn) return;
    resetBtn.classList.remove("is-visible");
    resetBtn.textContent = "Reset";
  }

  hideReset();

  // Step 1 → Step 2
  subscribeBtn.addEventListener("click", () => {
    hideReset();

    subscribeBtn.classList.remove("is-active");
    form.classList.add("is-active");
    container.dataset.state = "form";
    card.dataset.card = "active";
  });

  // Step 2 → Step 3
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    const username = email.split("@")[0];

    confirmation.innerHTML = `
      <span class="success-icon">≽^•⩊•^≼</span>
      <h2>Thanks for subscribing, ${username}!</h2>
      You’ll now receive updates, insights, and curated content in your inbox.
    `;
    confirmation.dataset.hasContent = "1"; // (optional debug)

    form.classList.remove("is-active");
    confirmation.classList.add("is-active");
    title.classList.add("hide-content");
    description.classList.add("hide-content");

    container.dataset.state = "success";
    card.dataset.card = "idle";

    showResetOnSuccess();
  });

  // Start over (from Step 3 → Step 1)
  resetBtn.addEventListener("click", () => {
    input.value = "";

    // ✅ KEY FIX: remove injected content so container height collapses
    confirmation.innerHTML = "";
    delete confirmation.dataset.hasContent;

    confirmation.classList.remove("is-active");
    form.classList.remove("is-active");
    subscribeBtn.classList.add("is-active");

    title.classList.remove("hide-content");
    description.classList.remove("hide-content");

    container.dataset.state = "idle";
    card.dataset.card = "idle";

    hideReset();
  });

  /* ==========================
     Particles Background
     ========================== */
  const canvas = document.getElementById("particle-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5,
  }));

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fill();
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  window.addEventListener("resize", () => {
    resizeCanvas();
  });
});

