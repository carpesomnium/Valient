// ---------- background: rotating wireframe + drifting specks ----------
(function () {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // icosahedron
  const p = (1 + Math.sqrt(5)) / 2;
  const verts = [
    [-1, p, 0], [1, p, 0], [-1, -p, 0], [1, -p, 0],
    [0, -1, p], [0, 1, p], [0, -1, -p], [0, 1, -p],
    [p, 0, -1], [p, 0, 1], [-p, 0, -1], [-p, 0, 1],
  ];
  const edges = [];
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(...verts[i].map((v, k) => v - verts[j][k]));
      if (Math.abs(d - 2) < 0.01) edges.push([i, j]);
    }

  let w, h, dpr, specks = [];
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    specks = Array.from({ length: Math.round(innerWidth / 14) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      s: (0.5 + Math.random() * 1.5) * dpr, v: (0.2 + Math.random()) * dpr,
    }));
  }
  addEventListener("resize", resize);
  resize();

  function frame(t) {
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "rgba(94,231,255,.45)";
    for (const s of specks) {
      s.y -= s.v;
      if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }
      ctx.fillRect(s.x, s.y, s.s, s.s * 3);
    }

    const a = t / 4000, b = t / 6500;
    const size = Math.min(w, h) * 0.28;
    const cx = w * (w > h ? 0.72 : 0.5), cy = h * (w > h ? 0.5 : 0.62);
    const pts = verts.map(([x, y, z]) => {
      let x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
      let y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b);
      const k = 1 / (1 - z2 / 6);
      return [cx + x1 * size * 0.5 * k, cy + y1 * size * 0.5 * k];
    });

    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeStyle = "rgba(94,231,255,.55)";
    ctx.shadowColor = "#1b5cff";
    ctx.shadowBlur = 14 * dpr;
    ctx.beginPath();
    for (const [i, j] of edges) { ctx.moveTo(...pts[i]); ctx.lineTo(...pts[j]); }
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// ---------- highlight current section in the menu ----------
(function () {
  const links = [...document.querySelectorAll(".menu a")];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach((l) => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
    }
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section").forEach((s) => io.observe(s));
})();

// ---------- tap to copy Discord handle ----------
(function () {
  const btn = document.getElementById("discord");
  const label = btn.querySelector("small");
  const original = label.textContent;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      label.textContent = "Copied!";
    } catch {
      label.textContent = "Discord: " + btn.dataset.copy;
    }
    btn.classList.add("copied");
    setTimeout(() => { label.textContent = original; btn.classList.remove("copied"); }, 1800);
  });
})();
