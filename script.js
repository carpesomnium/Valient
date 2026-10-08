document.body.classList.add("js");

// drop stale #links (e.g. an old #models) so they don't point at nothing
if (location.hash && !document.getElementById(decodeURIComponent(location.hash.slice(1)))) {
  history.replaceState(null, "", location.pathname + location.search);
}

// ============ settings ============
// Song for the background music. Set `youtube` to a video ID (the part after
// "v=" in a YouTube link), or drop your own audio file in the repo and set
// `file` to its path (e.g. "audio/color-your-night.mp3"). `file` wins if set.
const MUSIC = {
  youtube: "emw4Sv6draM",
  file: "",
};

// ============ ransom-note letters ============
(function () {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  document.querySelectorAll("[data-r]").forEach((el) => {
    const soft = el.dataset.r === "soft";
    const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      for (const c of node.textContent.trim()) {
        if (c === " ") { const s = document.createElement("span"); s.className = "sp"; frag.append(s); continue; }
        const s = document.createElement("span");
        s.className = "ch"; s.setAttribute("aria-hidden", "true"); s.textContent = c;
        const spread = soft ? 0.1 : 0.32;
        s.style.setProperty("--sz", (1 + (rand() - 0.45) * spread * 2).toFixed(2));
        s.style.setProperty("--rot", ((rand() - 0.5) * (soft ? 5 : 9)).toFixed(1) + "deg");
        s.style.setProperty("--dy", ((rand() - 0.5) * (soft ? 2 : 6)).toFixed(1) + "px");
        s.style.setProperty("--dl", (-rand() * 0.9).toFixed(2) + "s");
        frag.append(s);
      }
      el.setAttribute("aria-label", node.textContent.trim());
      node.replaceWith(frag);
    });
  });
})();

// ============ background: spinning wireframe + drifting specks ============
(function () {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const p = (1 + Math.sqrt(5)) / 2;
  const verts = [[-1,p,0],[1,p,0],[-1,-p,0],[1,-p,0],[0,-1,p],[0,1,p],[0,-1,-p],[0,1,-p],[p,0,-1],[p,0,1],[-p,0,-1],[-p,0,1]];
  const edges = [];
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(...verts[i].map((v, k) => v - verts[j][k]));
      if (Math.abs(d - 2) < 0.01) edges.push([i, j]);
    }

  let w, h, dpr, specks = [];
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = canvas.clientWidth * dpr;
    h = canvas.height = canvas.clientHeight * dpr;
    specks = Array.from({ length: Math.round(canvas.clientWidth / 16) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      s: (0.6 + Math.random() * 1.6) * dpr, v: (0.25 + Math.random()) * dpr,
      c: Math.random() < 0.3 ? "110,175,255" : "255,255,255",
    }));
  }
  addEventListener("resize", resize);
  resize();

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of specks) {
      s.y -= s.v;
      if (s.y < -6) { s.y = h + 6; s.x = Math.random() * w; }
      ctx.fillStyle = `rgba(${s.c},.55)`;
      ctx.fillRect(s.x, s.y, s.s, s.s * 3);
    }
    const a = t / 4000, b = t / 6500;
    const size = Math.min(w, h) * (w > h ? 0.3 : 0.24);
    const cx = w * (w > h ? 0.74 : 0.7), cy = h * (w > h ? 0.45 : 0.66);
    const pts = verts.map(([x, y, z]) => {
      const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
      const y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b);
      const k = 1 / (1 - z2 / 6);
      return [cx + x1 * size * 0.5 * k, cy + y1 * size * 0.5 * k];
    });
    ctx.lineWidth = 2 * dpr;
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.shadowColor = "#000"; ctx.shadowOffsetX = 3 * dpr; ctx.shadowOffsetY = 3 * dpr;
    ctx.beginPath();
    for (const [i, j] of edges) { ctx.moveTo(...pts[i]); ctx.lineTo(...pts[j]); }
    ctx.stroke();
    ctx.shadowColor = "transparent";
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // gentle parallax
  const bg = document.querySelector(".bg");
  addEventListener("pointermove", (e) => {
    const x = (e.clientX / innerWidth - 0.5) * -24, y = (e.clientY / innerHeight - 0.5) * -24;
    bg.style.transform = `translate(${x}px, ${y}px)`;
  });
})();

// ============ poster menu ============
(function () {
  const links = [...document.querySelectorAll(".menu a")];
  const numeral = document.getElementById("numeral");
  const scale = [1, 0.62, 0.48, 0.4, 0.34];
  let active = -1;

  links.forEach((l, i) => l.style.setProperty("--i", i));

  function setActive(i) {
    if (i === active) return;
    active = i;
    links.forEach((l, k) => {
      l.classList.toggle("on", k === i);
      l.style.setProperty("--s", scale[Math.min(Math.abs(k - i), scale.length - 1)]);
    });
    numeral.textContent = String(i + 1).padStart(2, "0");
    numeral.classList.remove("pop"); void numeral.offsetWidth; numeral.classList.add("pop");
  }
  links.forEach((l, i) => {
    l.addEventListener("mouseenter", () => setActive(i));
    l.addEventListener("focus", () => setActive(i));
    l.addEventListener("touchstart", () => setActive(i), { passive: true });
  });
  setActive(0);

  // follow the page as you scroll
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const i = links.findIndex((l) => l.getAttribute("href") === "#" + e.target.id);
      if (i >= 0) setActive(i);
    }
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section").forEach((s) => io.observe(s));
})();

// ============ scroll reveal ============
(function () {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

// ============ tap to copy ============
(function () {
  document.querySelectorAll("[data-copy]").forEach((el) => {
    const label = el.querySelector("small");
    const original = label.textContent;
    el.addEventListener("click", async (e) => {
      if (el.tagName === "A") e.preventDefault();
      try { await navigator.clipboard.writeText(el.dataset.copy); label.textContent = "Copied!"; }
      catch { label.textContent = "Discord: " + el.dataset.copy; }
      el.classList.add("copied");
      setTimeout(() => { label.textContent = original; el.classList.remove("copied"); }, 1800);
    });
  });
})();


// ============ glass shatter (one canvas, no DOM copies: light enough for phones) ============
function shatterGate(gate, ox, oy, onStart) {
  const rect = gate.getBoundingClientRect(), W = rect.width, H = rect.height;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const css = getComputedStyle(document.documentElement);
  const BLUE = "#3f86ff", DARK = "#040a1e";

  // what the entry screen looks like (read live positions so it lines up)
  const logoParts = [...gate.querySelectorAll(".gate-logo span")].map((s) => {
    const r = s.getBoundingClientRect(), cs = getComputedStyle(s);
    return { t: s.getAttribute("aria-label") || s.textContent, x: r.left + r.width / 2, y: r.top + r.height / 2, fs: parseFloat(cs.fontSize) };
  });
  const btn = gate.querySelector("#enter").getBoundingClientRect();

  // shatter geometry: spokes + rings around the hit point
  const K = 10, R = 4, far = Math.hypot(W, H) * 1.3, diag = Math.hypot(W, H);
  const base = rnd(0, Math.PI * 2), angs = [];
  for (let j = 0; j < K; j++) angs.push(base + (j + rnd(-0.25, 0.25)) * (Math.PI * 2 / K));
  const rr = [0, 0.09, 0.22, 0.42].map((f) => f * diag * 0.7);
  const V = [];
  for (let i = 0; i <= R; i++) {
    V.push([]);
    for (let j = 0; j < K; j++) {
      const r = i === 0 ? 0 : i === R ? far : rr[i] * rnd(0.85, 1.15);
      V[i].push([ox + Math.cos(angs[j]) * r, oy + Math.sin(angs[j]) * r]);
    }
  }
  const shards = [];
  for (let i = 0; i < R; i++) for (let j = 0; j < K; j++) {
    const pts = [V[i][j], V[i][(j + 1) % K], V[i + 1][(j + 1) % K], V[i + 1][j]];
    const cx = pts.reduce((s, p) => s + Math.min(Math.max(p[0], 0), W), 0) / 4;
    const cy = pts.reduce((s, p) => s + Math.min(Math.max(p[1], 0), H), 0) / 4;
    const dx = cx - ox, dy = cy - oy, d = Math.hypot(dx, dy) || 1, push = rnd(30, 150) * (1 + (R - i) * 0.15);
    shards.push({
      pts, cx, cy, ring: i,
      tx: (dx / d) * push + rnd(-30, 30), ty: (dy / d) * push * 0.4 + H * rnd(0.55, 1.05),
      rot: rnd(-4.5, 4.5), dur: rnd(900, 1500), delay: 260 + i * 45 + rnd(0, 120),
    });
  }

  const cv = document.createElement("canvas");
  cv.className = "shatter"; cv.setAttribute("aria-hidden", "true");
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  document.body.append(cv);
  const ctx = cv.getContext("2d");
  gate.classList.add("gone");
  onStart && onStart();

  function paintGate() {
    ctx.fillStyle = DARK; ctx.fillRect(0, 0, W, H);
    // diagonal band (115deg gradient between 38% and 62%)
    const th = 115 * Math.PI / 180, dx = Math.sin(th), dy = -Math.cos(th), L = Math.abs(W * dx) + Math.abs(H * dy);
    const sx = W / 2 - dx * L / 2, sy = H / 2 - dy * L / 2, px = -dy, py = dx;
    const at = (f) => [sx + dx * L * f, sy + dy * L * f];
    const [a, b] = [at(0.38), at(0.62)];
    ctx.fillStyle = BLUE; ctx.beginPath();
    ctx.moveTo(a[0] + px * far, a[1] + py * far); ctx.lineTo(b[0] + px * far, b[1] + py * far);
    ctx.lineTo(b[0] - px * far, b[1] - py * far); ctx.lineTo(a[0] - px * far, a[1] - py * far); ctx.fill();
    // title
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
    for (const p of logoParts) {
      ctx.font = "900 " + p.fs + "px 'Playfair Display', serif";
      ctx.fillStyle = "#000"; ctx.fillText(p.t, p.x + 5, p.y + 5);
      ctx.fillStyle = "#fff"; ctx.fillText(p.t, p.x, p.y);
    }
    // button
    ctx.save(); ctx.translate(btn.left + btn.width / 2, btn.top + btn.height / 2); ctx.transform(1, 0, Math.tan(12 * Math.PI / 180), 1, 0, 0);
    ctx.fillStyle = "#000"; ctx.fillRect(-btn.width / 2 + 6, -btn.height / 2 + 6, btn.width, btn.height);
    ctx.fillStyle = "#fff"; ctx.fillRect(-btn.width / 2, -btn.height / 2, btn.width, btn.height);
    ctx.lineWidth = 4; ctx.strokeStyle = "#000"; ctx.strokeRect(-btn.width / 2, -btn.height / 2, btn.width, btn.height);
    ctx.fillStyle = "#000"; ctx.font = "italic 900 30px 'Playfair Display', serif"; ctx.fillText("ENTER \u266A", 0, 2);
    ctx.restore();
  }
  function sheen() {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "rgba(255,255,255,.28)"); g.addColorStop(0.45, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(160,205,255,.22)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function clipShard(s) { ctx.beginPath(); s.pts.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.clip(); }

  // quick impact shake on the page content (never on <body>)
  const rumble = document.querySelectorAll(".hero, .ticker, main, footer");
  rumble.forEach((n) => n.classList.add("shake"));
  setTimeout(() => rumble.forEach((n) => n.classList.remove("shake")), 300);

  const CRACK = 260, t0 = performance.now(), END = 260 + 45 * R + 120 + 1500 + 80;
  (function frame(now) {
    const t = now - t0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (t < CRACK) {                                  // phase 1: whole pane, cracks spreading
      paintGate(); sheen();
      const reach = (t / CRACK) * R;
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2; ctx.beginPath();
      for (let j = 0; j < K; j++) {
        ctx.moveTo(ox, oy);
        for (let i = 1; i <= R; i++) {
          const f = Math.min(Math.max(reach - (i - 1), 0), 1); if (!f) break;
          const a = V[i - 1][j], b = V[i][j];
          ctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
        }
      }
      for (let i = 1; i < R; i++) { if (reach < i) break; for (let j = 0; j < K; j++) { const a = V[i][j], b = V[i][(j + 1) % K]; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } }
      ctx.stroke();
    } else {                                          // phase 2: pieces fall
      for (const s of shards) {
        const p = Math.min(Math.max((t - s.delay) / s.dur, 0), 1);
        if (p >= 1) continue;
        const e = p * p, alpha = 1 - Math.max(0, (p - 0.6) / 0.4);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(s.cx + s.tx * e, s.cy + s.ty * e); ctx.rotate(s.rot * e); ctx.translate(-s.cx, -s.cy);
        clipShard(s); paintGate(); sheen();
        ctx.restore();
      }
    }
    if (t < END) requestAnimationFrame(frame); else { cv.remove(); gate.remove(); }
  })(t0);
}

function glassSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ac = new AC(), t = ac.currentTime, out = ac.createGain(); out.gain.value = 0.28; out.connect(ac.destination);
    const len = Math.floor(ac.sampleRate * 0.8), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3) * (Math.random() < 0.03 ? 1.8 : 1);
    const n = ac.createBufferSource(); n.buffer = buf;
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500;
    n.connect(hp); hp.connect(out); n.start(t);
    for (let k = 0; k < 7; k++) {                       // tinkles
      const o = ac.createOscillator(), g = ac.createGain(), at = t + 0.05 + Math.random() * 0.5;
      o.frequency.value = 2500 + Math.random() * 4500; o.type = "sine";
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.25, at + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + 0.2);
    }
    setTimeout(() => ac.close(), 1500);
  } catch (e) {}
}

// ============ gate + music ============
(function () {
  const gate = document.getElementById("gate");
  const player = document.getElementById("player");
  const toggle = document.getElementById("p-toggle");
  const note = document.getElementById("p-note");
  let yt = null, ytReady = false, audio = null, wantPlay = false;

  function showNote(html) { note.innerHTML = html; note.hidden = false; }

  if (MUSIC.file) {
    audio = new Audio(MUSIC.file);
    audio.loop = true; audio.volume = 0.6;
    audio.addEventListener("error", () => showNote("Couldn't load the audio file."));
    audio.addEventListener("play", () => player.classList.add("playing"));
    audio.addEventListener("pause", () => player.classList.remove("playing"));
    player.querySelector(".p-body").hidden = true;
  } else if (MUSIC.youtube) {
    window.onYouTubeIframeAPIReady = () => {
      yt = new YT.Player("yt", {
        width: 218, height: 123, videoId: MUSIC.youtube,
        playerVars: { playsinline: 1, loop: 1, playlist: MUSIC.youtube, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => { ytReady = true; if (wantPlay) yt.playVideo(); },
          onStateChange: (e) => player.classList.toggle("playing", e.data === 1),
          onError: () => showNote('Song unavailable here. <a href="https://www.youtube.com/watch?v=' + MUSIC.youtube + '" target="_blank" rel="noopener">Open on YouTube</a>'),
        },
      });
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.append(s);
  } else {
    player.hidden = true;
  }

  function play() {
    wantPlay = true;
    if (audio) audio.play().catch(() => {});
    else if (ytReady) yt.playVideo();
  }
  function pause() {
    wantPlay = false;
    if (audio) audio.pause();
    else if (ytReady) yt.pauseVideo();
  }

  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function enter(withMusic, e, btn) {
    const go = () => {
      document.body.classList.add("entered");
      if (withMusic) play(); else { player.classList.add("min"); toggle.setAttribute("aria-label", "Open music player"); }
    };
    if (calm) { gate.classList.add("out"); go(); return; }
    const r = btn.getBoundingClientRect();
    const x = e && e.clientX ? e.clientX : r.left + r.width / 2, y = e && e.clientY ? e.clientY : r.top + r.height / 2;
    if (withMusic) glassSound();
    try { shatterGate(gate, x, y, go); } catch (err) { document.querySelectorAll("canvas.shatter").forEach((n) => n.remove()); gate.classList.remove("gone"); gate.classList.add("out"); go(); }
  }
  const enterBtn = document.getElementById("enter"), muteBtn = document.getElementById("enter-mute");
  enterBtn.addEventListener("click", (e) => enter(true, e, enterBtn), { once: true });
  muteBtn.addEventListener("click", (e) => enter(false, e, muteBtn), { once: true });

  toggle.addEventListener("click", () => {
    const minimized = player.classList.toggle("min");
    toggle.setAttribute("aria-label", minimized ? "Open music player" : "Minimize music player");
    if (minimized) pause(); else play();
  });
})();
