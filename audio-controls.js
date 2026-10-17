'use strict';
// Site volume and device volume are separate. Device volume is not exposed to pages.
const PROFILE_AUDIO = (() => {
  const media = document.querySelector('#background');
  const slider = document.querySelector('#volume');
  const output = document.querySelector('#volumeValue');
  const mute = document.querySelector('#muteAudio');
  const icon = document.querySelector('#audioIcon');
  const hint = document.querySelector('#deviceVolumeHint');
  const storage = {
    read(key) { try { return localStorage.getItem(key); } catch { return null; } },
    write(key, value) { try { localStorage.setItem(key, String(value)); } catch { /* Optional preference storage. */ } }
  };
  const raw = storage.read('stormangel:volume');
  let selected = raw !== null && raw.trim() !== '' && Number.isFinite(Number(raw)) && Number(raw) >= 0 && Number(raw) <= 100 ? Math.round(Number(raw)) : 65;
  let lastNonzero = selected || 65;
  let frame = 0;
  let enabled = false;
  // iOS can expose the property without applying it to audio output.
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let adjustable = !ios;
  if (adjustable) {
    const original = media.volume;
    try { media.volume = 0.37; adjustable = Math.abs(media.volume - 0.37) < 0.01; media.volume = original; }
    catch { adjustable = false; }
  }
  slider.value = String(selected);
  slider.hidden = output.hidden = document.querySelector('#volumeLabel').hidden = !adjustable;
  hint.hidden = adjustable;
  hint.title = 'Use the volume buttons on your phone. This site cannot read device volume.';
  media.muted = storage.read('stormangel:muted') === 'true' || selected === 0;
  if (adjustable) media.volume = selected / 100;

  function update() {
    const silent = media.muted || (adjustable && selected === 0);
    icon.textContent = silent ? '◌' : '♫';
    mute.setAttribute('aria-pressed', String(silent));
    mute.setAttribute('aria-label', silent ? 'Unmute sound' : 'Mute sound');
    mute.title = silent ? 'Unmute sound' : 'Mute sound';
    output.textContent = (silent ? 0 : selected) + '%';
    slider.disabled = !enabled || !adjustable;
    mute.disabled = !enabled;
  }
  function cancelFade() { cancelAnimationFrame(frame); frame = 0; }
  function prepare(fade) {
    cancelFade();
    if (adjustable) media.volume = fade && !media.muted ? 0 : selected / 100;
  }
  function fadeIn() {
    if (!adjustable || media.muted) return;
    cancelFade();
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / 1800);
      media.volume = selected / 100 * t * t * (3 - 2 * t);
      frame = t < 1 ? requestAnimationFrame(step) : 0;
    }
    frame = requestAnimationFrame(step);
  }
  slider.addEventListener('input', () => {
    cancelFade();
    selected = Number(slider.value);
    if (selected) lastNonzero = selected;
    media.muted = selected === 0;
    if (adjustable) media.volume = selected / 100;
    storage.write('stormangel:volume', selected);
    storage.write('stormangel:muted', media.muted);
    update();
  });
  mute.addEventListener('click', () => {
    cancelFade();
    const wasSilent = media.muted || (adjustable && selected === 0);
    if (wasSilent && selected === 0) {
      selected = lastNonzero;
      slider.value = String(selected);
      storage.write('stormangel:volume', selected);
    }
    media.muted = !wasSilent;
    if (adjustable) media.volume = selected / 100;
    storage.write('stormangel:muted', media.muted);
    update();
  });
  media.addEventListener('volumechange', update);
  update();
  return { update, prepare, fadeIn, enable() { enabled = true; update(); } };
})();
