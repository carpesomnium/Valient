document.body.classList.add("js");

// drop stale #links so they don't point at nothing
if (location.hash && !document.getElementById(decodeURIComponent(location.hash.slice(1)))) {
  history.replaceState(null, "", location.pathname + location.search);
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// ============ settings ============
// Song for the background music. Set `youtube` to a video ID (the part after
// "v=" in a YouTube link), or drop your own audio file in the repo and set
// `file` to its path (e.g. "audio/song.mp3"). `file` wins if set.
const MUSIC = {
  youtube: "_E8jVPUfOD4",
  file: "",
};

// ============ background: slow gold astrolabe + drifting dust ============
(function () {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, dpr, dust = [];
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = canvas.clientWidth * dpr;
    h = canvas.height = canvas.clientHeight * dpr;
    dust = Array.from({ length: Math.round(canvas.clientWidth / 16) }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: (0.4 + Math.random() * 1) * dpr,
      v: (0.08 + Math.random() * 0.25) * dpr, a: 0.12 + Math.random() * 0.35,
    }));
  }
  addEventListener("resize", resize);
  resize();

  function star(r, n, step, rot) {                // {n/step} star polygon
    ctx.beginPath();
    for (let k = 0; k <= n; k++) {
      const a = rot + ((k * step) % n) * (Math.PI * 2 / n);
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of dust) {
      s.y -= s.v; if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }
      ctx.fillStyle = `rgba(240,220,174,${s.a})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    const R = Math.min(w, h) * (w > h ? 0.3 : 0.27);
    const cx = w * (w > h ? 0.74 : 0.7), cy = h * (w > h ? 0.48 : 0.66);
    const al = w > h ? 0.42 : 0.24;
    ctx.save(); ctx.translate(cx, cy);
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = `rgba(201,169,106,${al})`;
    for (const f of [1, 0.9, 0.55]) { ctx.beginPath(); ctx.arc(0, 0, R * f, 0, Math.PI * 2); ctx.stroke(); }
    ctx.save(); ctx.rotate(t / 26000);            // tick ring
    ctx.beginPath();
    for (let k = 0; k < 72; k++) {
      const a = k * Math.PI / 36, len = k % 6 === 0 ? 0.1 : 0.04;
      ctx.moveTo(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9);
      ctx.lineTo(Math.cos(a) * R * (0.9 + len), Math.sin(a) * R * (0.9 + len));
    }
    ctx.stroke(); ctx.restore();
    star(R * 0.9, 8, 3, t / 18000);               // two counter-turning eight-point stars
    star(R * 0.55, 8, 3, -t / 14000);
    ctx.fillStyle = `rgba(240,220,174,${al + 0.2})`;
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 + t / 18000;
      ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9, 2 * dpr, 0, Math.PI * 2); ctx.fill();
    }
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
    numeral.textContent = ROMAN[i + 1];
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

// ============ messy page stack (3D models) ============
(function () {
  const stack = document.getElementById("stack");
  if (!stack) return;
  const cards = [...stack.querySelectorAll(".card")];
  const count = document.getElementById("count"), hint = document.getElementById("hint");
  let seed = 11; const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  cards.forEach((c, i) => {
    c.dataset.n = i + 1;
    c.style.setProperty("--rot", ((rand() - 0.5) * 7).toFixed(2) + "deg");
    c.style.setProperty("--tape", ((rand() - 0.5) * 12).toFixed(1) + "deg");
  });
  let order = cards.slice(), busy = false;
  const pad = (n) => String(n).padStart(2, "0");
  const hideHint = () => { hint.hidden = true; };

  function render() {
    order.forEach((c, pos) => {
      c.style.setProperty("--p", pos);
      c.classList.toggle("top", pos === 0);
      c.classList.toggle("deep", pos > 3);
      c.inert = pos !== 0;
    });
    count.textContent = ROMAN[+order[0].dataset.n] + " / " + ROMAN[cards.length];
  }
  render();

  function next(dir) {                              // top page flies off, lands at the back
    if (busy) return; busy = true; hideHint();
    const c = order[0];
    c.style.transition = "transform .32s cubic-bezier(.5,0,.9,.6), opacity .32s";
    c.style.transform = `translate(${dir * 130}%, 30px) rotate(${dir * 28}deg)`;
    c.style.opacity = "0";
    setTimeout(() => {
      c.style.transition = "none"; c.style.transform = ""; c.style.opacity = "";
      order.push(order.shift()); render();
      void c.offsetWidth; c.style.transition = ""; busy = false;
    }, 330);
  }
  function prev() {                                 // last page slides back in on top
    if (busy) return; busy = true; hideHint();
    const c = order[order.length - 1];
    c.style.transition = "none"; c.style.transform = "translate(-130%, 30px) rotate(-28deg)"; c.style.opacity = "0";
    order.unshift(order.pop()); render();
    void c.offsetWidth;
    c.style.transition = "transform .4s cubic-bezier(.2,.9,.3,1), opacity .25s"; c.style.transform = ""; c.style.opacity = "";
    setTimeout(() => { c.style.transition = ""; busy = false; }, 420);
  }
  document.getElementById("next").addEventListener("click", () => next(-1));
  document.getElementById("prev").addEventListener("click", prev);
  stack.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); next(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); prev(); }
  });

  // drag the top page: flick it away to see the next one
  let active = false, drag = false, pid = null, sx = 0, sy = 0, st = 0, suppress = false;
  stack.addEventListener("pointerdown", (e) => {
    if (busy || !e.isPrimary || !order[0].contains(e.target)) return;
    active = true; drag = false; suppress = false; pid = e.pointerId; sx = e.clientX; sy = e.clientY; st = e.timeStamp;
  });
  stack.addEventListener("pointermove", (e) => {
    if (!active || e.pointerId !== pid) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!drag) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        drag = true; try { stack.setPointerCapture(pid); } catch (err) {}
        order[0].style.transition = "none"; hideHint();
      } else return;
    }
    order[0].style.transform = `translate(${dx}px, ${dy * 0.15}px) rotate(${dx * 0.06}deg)`;
  });
  function release(e, cancelled) {
    if (!active || e.pointerId !== pid) return;
    active = false;
    if (!drag) return;
    suppress = true;                                // a drag shouldn't count as a tap on the link
    const top = order[0], dx = e.clientX - sx, v = Math.abs(dx) / Math.max(e.timeStamp - st, 1);
    top.style.transition = "";
    if (!cancelled && (Math.abs(dx) > 80 || v > 0.5)) next(dx < 0 ? -1 : 1);
    else top.style.transform = "";
  }
  stack.addEventListener("pointerup", (e) => release(e, false));
  stack.addEventListener("pointercancel", (e) => release(e, true));
  stack.addEventListener("click", (e) => { if (suppress) { e.preventDefault(); e.stopPropagation(); suppress = false; } }, true);
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
    ["Breaking the seal", "OK"],
    ["Reading the decree", "NES"],
    ["Standing", "OPEN TO WORK"],
    ["Works in the vault", models + " MODELS"],
    ["Admittance", "GRANTED"],
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
      await wait(260);
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
