'use strict';
const video = document.querySelector('#background');
const gate = document.querySelector('#gate');
const enter = document.querySelector('#enter');
const enterHint = document.querySelector('#enterHint');
const volume = document.querySelector('#volume');
const status = document.querySelector('#status');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Edit matching title/subtitle pairs here. Each page load selects one pair.
const INTRO_MESSAGES = [
  { title: 'Let the world wait.', subtitle: 'It is a little quieter here.' },
  { title: 'Take a moment.', subtitle: 'There is nowhere you need to rush to.' },
  { title: 'Leave the noise behind.', subtitle: 'Stay for one song.' },
  { title: 'Glad you stopped by.', subtitle: 'You can stay a while.' },
  { title: 'Fade into the night.', subtitle: 'Some moments take their time.' },
  { title: 'Step away for a while.', subtitle: 'Your thoughts can wait.' },
  { title: 'Stay in the moment.', subtitle: 'Just you and this song.' },
  { title: 'Make a little room for yourself.', subtitle: 'The rest can wait.' },
  { title: 'Time slows down here.', subtitle: 'Take a deep breath.' },
  { title: 'You found your way here.', subtitle: 'Maybe a short break was all you needed.' }
];
function selectIntro() {
  let previous = -1;
  try { previous = Number(sessionStorage.getItem('stormangel:lastIntro') ?? -1); } catch { /* Local storage may be restricted. */ }
  const choices = INTRO_MESSAGES.map((_, index) => index).filter(index => index !== previous);
  const index = choices[Math.floor(Math.random() * choices.length)];
  const message = INTRO_MESSAGES[index];
  document.querySelector('#introTitle').textContent = message.title;
  document.querySelector('#introSubtitle').textContent = message.subtitle;
  try { sessionStorage.setItem('stormangel:lastIntro', String(index)); } catch { /* Random selection still works. */ }
}
selectIntro();

let started = false;
let fadeFrame = 0;
function updateAudio() { PROFILE_AUDIO.update(); }
function fadeSound() { PROFILE_AUDIO.fadeIn(); }
function reveal() {
  started = true;
  gate.inert = true;
  gate.classList.add('closed');
  document.body.classList.add('entered');
  PROFILE_AUDIO.enable();
  updateAudio();
  document.dispatchEvent(new Event('profile:entered'));
  // Keep keyboard focus out of the profile until its entrance is visible.
  setTimeout(() => {
    document.querySelector('#profile').inert = false;
    if (document.activeElement === enter || document.activeElement === document.body) {
      document.querySelector('#discord').focus({preventScroll:true});
    }
  }, reducedMotion ? 0 : 1800);
}
enter.addEventListener('click', async () => {
  if (started || enter.disabled) return;
  enter.disabled = true;
  enterHint.textContent = 'one moment…';
  PROFILE_AUDIO.prepare(!reducedMotion);
  try {
    // Start from the gesture; reveal only when playback has actually begun.
    await video.play();
    reveal();
    if (!reducedMotion) fadeSound();
  } catch (error) {
    enter.disabled = false;
    document.querySelector('#gateStatus').textContent = 'Playback could not start. Check media/background.mp4 and try again.';
    enterHint.textContent = 'click anywhere to retry ↗';
    if (video.error) {
      reveal();
      status.textContent = 'Video unavailable. Check media/background.mp4.';
    }
  }
});
video.addEventListener('error', () => {
  if (started) status.textContent = 'Video unavailable. Refresh and try again.';
});
document.querySelector('#discord').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText('stormangl');
    status.textContent = 'Discord username copied.';
    showCopied();
  } catch {
    // Local file previews can restrict Clipboard API; select the visible name.
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#discord strong'));
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    status.textContent = 'Username selected. Press Ctrl+C / ⌘C, or touch and hold to copy.';
  }
});
// A separate wrapper keeps pointer movement independent of the entrance animation.
const cardMotion = document.querySelector('.card-motion');
const profileArea = document.querySelector('#profile');
const pointerPreference = window.matchMedia('(hover: hover) and (pointer: fine)');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let tiltFrame = 0;
const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };
function paintTilt() {
  tiltFrame = 0;
  tilt.x += (tilt.targetX - tilt.x) * 0.09;
  tilt.y += (tilt.targetY - tilt.y) * 0.09;
  const moving = Math.abs(tilt.x - tilt.targetX) + Math.abs(tilt.y - tilt.targetY) > 0.002;
  if (!moving) { tilt.x = tilt.targetX; tilt.y = tilt.targetY; }
  cardMotion.style.transform = `perspective(1100px) translate3d(${tilt.x * 7}px, ${tilt.y * 5}px, 0) rotateX(${-tilt.y * 5}deg) rotateY(${tilt.x * 7}deg)`;
  cardMotion.style.setProperty('--light-x', `${50 + tilt.x * 38}%`);
  cardMotion.style.setProperty('--light-y', `${50 + tilt.y * 38}%`);
  if (moving) tiltFrame = requestAnimationFrame(paintTilt);
}
function scheduleTilt() { if (!tiltFrame) tiltFrame = requestAnimationFrame(paintTilt); }
function resetTilt() {
  tilt.targetX = 0; tilt.targetY = 0;
  cardMotion.classList.remove('pointer-active');
  scheduleTilt();
}
profileArea.addEventListener('pointermove', event => {
  if (!started || profileArea.inert || event.pointerType !== 'mouse' || !pointerPreference.matches || motionPreference.matches) return;
  // Read the stationary main area, avoiding feedback from the transformed card.
  const bounds = profileArea.getBoundingClientRect();
  tilt.targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
  tilt.targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
  cardMotion.classList.add('pointer-active');
  scheduleTilt();
});
profileArea.addEventListener('pointerleave', resetTilt);
window.addEventListener('blur', resetTilt);
window.addEventListener('resize', resetTilt);
function stopTilt() {
  cancelAnimationFrame(tiltFrame); tiltFrame = 0;
  tilt.x = tilt.y = tilt.targetX = tilt.targetY = 0;
  cardMotion.style.transform = '';
  cardMotion.classList.remove('pointer-active');
}
motionPreference.addEventListener('change', stopTilt);
pointerPreference.addEventListener('change', stopTilt);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopTilt(); });
let copiedTimer;
function showCopied() {
  const discord = document.querySelector('#discord');
  discord.classList.add('copied');
  document.querySelector('.copy-mark').textContent = '✓';
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => {
    discord.classList.remove('copied');
    document.querySelector('.copy-mark').textContent = '⧉';
  }, 2200);
}

// Fit the stationary card layout without mixing scale with pointer/entry transforms.
const cardFit = document.querySelector('.card-fit');
const cardElement = document.querySelector('.card');
function fitProfile() {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const viewport = document.documentElement.clientHeight;
  const top = header.getBoundingClientRect().bottom + 12;
  const footerHeight = footer.getBoundingClientRect().height;
  const bottom = footerHeight + 12;
  const available = Math.max(1, viewport - top - bottom);
  const naturalHeight = cardElement.offsetHeight;
  if (!naturalHeight) return;
  const scale = Math.min(1, available / naturalHeight);
  profileArea.style.paddingTop = `${top}px`;
  profileArea.style.paddingBottom = `${bottom}px`;
  cardMotion.style.setProperty('--card-scale', String(scale));
  cardMotion.style.setProperty('--card-fit-height', `${naturalHeight * scale}px`);
}
const fitObserver = new ResizeObserver(fitProfile);
fitObserver.observe(cardElement);
fitObserver.observe(document.querySelector('header'));
fitObserver.observe(document.querySelector('footer'));
window.addEventListener('resize', fitProfile);
window.visualViewport?.addEventListener('resize', fitProfile);
fitProfile();
