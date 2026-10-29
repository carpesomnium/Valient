document.body.classList.add("js");

// drop stale #links so they don't point at nothing
if (location.hash && !document.getElementById(decodeURIComponent(location.hash.slice(1)))) {
  history.replaceState(null, "", location.pathname + location.search);
}

// ============ settings ============
// Song for the music player. Set `youtube` to a video ID (the part after "v="
// in a YouTube link), or drop your own audio file in the repo and set `file`
// to its path (e.g. "audio/song.mp3"). `file` wins if set.
const MUSIC = {
  youtube: "_E8jVPUfOD4",
  file: "",
};

// ============ highlight the current section in the header ============
(function () {
  const links = [...document.querySelectorAll(".top nav a")];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach((l) => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
    }
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section").forEach((s) => io.observe(s));
})();

// ============ scroll reveal ============
(function () {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

// ============ tap to copy ============
(function () {
  document.querySelectorAll("[data-copy]").forEach((el) => {
    const label = el.querySelector("small");
    const original = label.textContent;
    el.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(el.dataset.copy); label.textContent = "Copied!"; }
      catch { label.textContent = "Discord: " + el.dataset.copy; }
      el.classList.add("copied");
      setTimeout(() => { label.textContent = original; el.classList.remove("copied"); }, 1800);
    });
  });
})();

// ============ music (opens and plays on tap; never autoplays) ============
(function () {
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
        width: 250, height: 141, videoId: MUSIC.youtube,
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
    toggle.setAttribute("aria-label", minimized ? "Open music player" : "Close music player");
    if (minimized) pause(); else play();
  });
})();
