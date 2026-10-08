document.body.classList.add("js");

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
      c: Math.random() < 0.3 ? "232,51,74" : "255,255,255",
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

  function enter(withMusic) {
    gate.classList.add("out");
    document.body.classList.add("entered");
    if (withMusic) play(); else { player.classList.add("min"); toggle.setAttribute("aria-label", "Open music player"); }
  }
  document.getElementById("enter").addEventListener("click", () => enter(true));
  document.getElementById("enter-mute").addEventListener("click", () => enter(false));

  toggle.addEventListener("click", () => {
    const minimized = player.classList.toggle("min");
    toggle.setAttribute("aria-label", minimized ? "Open music player" : "Minimize music player");
    if (minimized) pause(); else play();
  });
})();
