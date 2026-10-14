document.body.classList.add("js");

// drop stale #links so they don't point at nothing
if (location.hash && !document.getElementById(decodeURIComponent(location.hash.slice(1)))) {
  history.replaceState(null, "", location.pathname + location.search);
}

// ============ settings ============
// Song for the background music. Set `youtube` to a video ID (the part after
// "v=" in a YouTube link), or drop your own audio file in the repo and set
// `file` to its path (e.g. "audio/song.mp3"). `file` wins if set.
const MUSIC = {
  youtube: "nD8h3H3w338",
  file: "",
};

// ============ background: hologram + targeting ring + drifting dust ============
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

  let w, h, dpr, dust = [];
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = canvas.clientWidth * dpr;
    h = canvas.height = canvas.clientHeight * dpr;
    dust = Array.from({ length: Math.round(canvas.clientWidth / 18) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      s: (0.8 + Math.random() * 1.4) * dpr, v: (0.1 + Math.random() * 0.4) * dpr,
      c: Math.random() < 0.2 ? "255,138,31" : "140,200,230", a: 0.25 + Math.random() * 0.4,
    }));
  }
  addEventListener("resize", resize);
  resize();

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of dust) {
      s.y -= s.v;
      if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }
      ctx.fillStyle = `rgba(${s.c},${s.a})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    const a = t / 5200, b = t / 8200;
    const size = Math.min(w, h) * (w > h ? 0.3 : 0.24);
    const cx = w * (w > h ? 0.74 : 0.68), cy = h * (w > h ? 0.46 : 0.64);
    const pts = verts.map(([x, y, z]) => {
      const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
      const y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b);
      const k = 1 / (1 - z2 / 6);
      return [cx + x1 * size * 0.5 * k, cy + y1 * size * 0.5 * k];
    });

    // hologram wireframe
    ctx.lineWidth = 1.4 * dpr;
    const al = w > h ? 0.6 : 0.3;
    ctx.strokeStyle = `rgba(95,208,255,${al})`;
    ctx.shadowColor = "#5fd0ff"; ctx.shadowBlur = 8 * dpr;
    ctx.beginPath();
    for (const [i, j] of edges) { ctx.moveTo(...pts[i]); ctx.lineTo(...pts[j]); }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // targeting ring
    const rad = size * 0.62;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(t / 9000);
    ctx.strokeStyle = `rgba(255,138,31,${al})`; ctx.lineWidth = 1.2 * dpr;
    ctx.setLineDash([8 * dpr, 10 * dpr]);
    ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    for (let k = 0; k < 4; k++) { ctx.moveTo(rad - 10 * dpr, 0); ctx.lineTo(rad + 12 * dpr, 0); ctx.rotate(Math.PI / 2); }
    ctx.stroke();
    ctx.restore();

    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// ============ terminal menu ============
(function () {
  const links = [...document.querySelectorAll(".menu a")];
  const numeral = document.getElementById("numeral");
  let active = -1;

  function setActive(i) {
    if (i === active) return;
    active = i;
    links.forEach((l, k) => l.classList.toggle("on", k === i));
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
  }, { threshold: 0.12 });
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

// ============ uplink boot sequence + music ============
(function () {
  const gate = document.getElementById("gate");
  const log = document.getElementById("boot-log");
  const bar = document.getElementById("boot-bar");
  const granted = document.getElementById("granted");
  const actions = document.getElementById("boot-actions");
  const player = document.getElementById("player");
  const toggle = document.getElementById("p-toggle");
  const note = document.getElementById("p-note");
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let yt = null, ytReady = false, audio = null, wantPlay = false;

  // ----- music -----
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
        width: 222, height: 125, videoId: MUSIC.youtube,
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
  toggle.addEventListener("click", () => {
    const minimized = player.classList.toggle("min");
    toggle.setAttribute("aria-label", minimized ? "Open music player" : "Minimize music player");
    if (minimized) pause(); else play();
  });

  // ----- terminal beeps (only if the visitor chose audio) -----
  let ac = null, sfx = false;
  function beep(freq, dur) {
    if (!sfx || !ac) return;
    try {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "square"; o.frequency.value = freq; g.gain.value = 0.03;
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur);
    } catch (e) {}
  }

  // ----- boot sequence -----
  const models = document.querySelectorAll("#models .card:not(.soon)").length;
  const LINES = [
    ["Establishing uplink", "OK"],
    ["Reading citizen file", "NES"],
    ["Employment status", "OPEN TO WORK"],
    ["Portfolio records", models + " MODELS"],
    ["Clearance", "GRANTED"],
  ];
  let running = false, skip = false, startedAt = 0, finished = false;
  const wait = (ms) => new Promise((r) => setTimeout(r, skip || calm ? 0 : ms));

  function finish() {
    if (finished) return;
    finished = true;
    gate.classList.add("out");
    document.body.classList.add("entered");
    setTimeout(() => gate.remove(), 900);
  }

  async function boot() {
    running = true; startedAt = performance.now();
    actions.hidden = true;
    for (let i = 0; i < LINES.length; i++) {
      const ln = document.createElement("div"); ln.className = "ln";
      const lb = document.createElement("span"), ld = document.createElement("span"), st = document.createElement("b");
      ld.className = "ld"; st.className = "st";
      ln.append(lb, ld, st); log.append(ln);
      for (const ch of LINES[i][0]) { lb.textContent += ch; await wait(16); }
      st.textContent = LINES[i][1]; ln.classList.add("done");
      beep(520 + i * 110, 0.06);
      bar.style.width = ((i + 1) / LINES.length) * 100 + "%";
      await wait(230);
    }
    granted.classList.add("show");
    beep(880, 0.09); setTimeout(() => beep(1175, 0.14), 110);
    await wait(750);
    finish();
  }

  // tap anywhere during the boot to skip ahead
  gate.addEventListener("pointerdown", () => {
    if (running && performance.now() - startedAt > 500) { skip = true; setTimeout(finish, 350); }
  });

  function enter(withMusic) {
    if (running) return;
    if (withMusic) {
      try { const AC = window.AudioContext || window.webkitAudioContext; if (AC) { ac = new AC(); sfx = true; } } catch (e) {}
      play();
    } else {
      player.classList.add("min"); toggle.setAttribute("aria-label", "Open music player");
    }
    boot();
  }
  document.getElementById("enter").addEventListener("click", () => enter(true));
  document.getElementById("enter-mute").addEventListener("click", () => enter(false));
})();
