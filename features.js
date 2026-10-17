'use strict';
// Optional presentation features; the original playback and tilt stay in script.js.
(() => {
  const body = document.body;
  const film = document.querySelector('#background');
  const profile = document.querySelector('#profile');
  const toggle = document.querySelector('#toggleCard');
  const toggleText = document.querySelector('#toggleCardText');
  const signature = document.querySelector('#signature');
  const note = document.querySelector('#signatureNote');
  const fill = document.querySelector('#videoThreadFill');
  let active = false;
  let cardHidden = false;
  let idleTimer;
  let noteTimer;
  let lastProgress = 0;
  let lastQuote = -1;
  const pickIndex = (length, previous = -1) => {
    const choices = Array.from({length}, (_, index) => index).filter(index => index !== previous);
    return choices[Math.floor(Math.random() * choices.length)] ?? 0;
  };
  document.querySelector('#profileMood').textContent = PROFILE_TEXT.moods[pickIndex(PROFILE_TEXT.moods.length)];
  document.querySelector('#aboutText').textContent = PROFILE_TEXT.about;


  function wakeScene() {
    body.classList.remove('scene-idle');
    clearTimeout(idleTimer);
    if (!active || document.hidden) return;
    idleTimer = setTimeout(() => {
      // Keyboard users keep the controls visible while focused.
      if (!document.querySelector('header :focus-visible')) {
        body.classList.add('scene-idle');
      }
    }, 4200);
  }
  function setCardHidden(hidden) {
    cardHidden = hidden;
    body.classList.toggle('card-hidden', hidden);
    profile.inert = hidden;
    toggle.setAttribute('aria-pressed', String(hidden));
    toggle.setAttribute('aria-label', hidden ? 'Show profile' : 'Hide profile, watch video');
    toggleText.textContent = hidden ? 'show profile' : 'watch video';
    if (hidden) {
      signature.setAttribute('aria-expanded', 'false');
      note.classList.remove('visible');
      document.querySelector('#about').open = false;
      toggle.focus({ preventScroll: true });
    }
    wakeScene();
  }
  toggle.addEventListener('click', () => setCardHidden(!cardHidden));
  document.addEventListener('keydown', event => {
    wakeScene();
    if (event.key === 'Escape' && cardHidden) setCardHidden(false);
  });
  // CSS handles idle pointer events, so the first movement restores controls.
  document.addEventListener('pointermove', wakeScene, { passive: true });
  document.addEventListener('pointerdown', wakeScene, { passive: true });
  document.addEventListener('focusin', wakeScene);
  document.addEventListener('focusout', wakeScene);
  document.addEventListener('visibilitychange', wakeScene);

  signature.addEventListener('click', () => {
    const show = signature.getAttribute('aria-expanded') !== 'true';
    clearTimeout(noteTimer);
    signature.setAttribute('aria-expanded', String(show));
    if (show) {
      lastQuote = pickIndex(PROFILE_TEXT.quotes.length, lastQuote);
      note.textContent = PROFILE_TEXT.quotes[lastQuote];
    }
    note.classList.toggle('visible', show);
    if (show) noteTimer = setTimeout(() => {
      signature.setAttribute('aria-expanded', 'false');
      note.classList.remove('visible');
    }, 5000);
  });

  function updateThread() {
    const progress = Number.isFinite(film.duration) && film.duration > 0
      ? Math.max(0, Math.min(1, film.currentTime / film.duration)) : 0;
    fill.classList.toggle('loop-reset', progress < lastProgress);
    fill.style.width = `${progress * 100}%`;
    lastProgress = progress;
  }
  film.addEventListener('timeupdate', updateThread);
  film.addEventListener('loadedmetadata', updateThread);
  film.addEventListener('emptied', updateThread);

  function loadCounter() {
    const badge = document.querySelector('#visitBadge');
    const fallback = document.querySelector('#visitFallback');
    // Allow the existing site and GitHub Pages; local previews do not count.
    const host = location.hostname.toLowerCase();
    if (host !== 'stormanqel.netlify.app' && host !== 'stormanqei.github.io') return;
    fallback.textContent = 'loading counter';
    badge.addEventListener('load', () => { badge.hidden = false; fallback.hidden = true; });
    badge.addEventListener('error', () => {
      badge.hidden = true; fallback.hidden = false; fallback.textContent = 'counter unavailable';
    });
    badge.src = 'https://hits.sh/stormanqel.netlify.app.svg?label=views&color=8d75a6&labelColor=211c2b&style=flat';
  }
  document.addEventListener('profile:entered', () => {
    if (active) return;
    active = true;
    // Wait for the entrance to finish before enabling the cinema control.
    setTimeout(() => { toggle.disabled = false; wakeScene(); }, 2000);
    loadCounter();
  });
})();
