import { icon } from './assets/icons.js';
import { mountSnake, mountMines, mountPaddle } from './modules/games.js';
import { mountPaint, mountNotes } from './modules/apps.js';
import { mountIntro } from './modules/intro.js';
import { mountBedroom } from './modules/bedroom.js?v=20261102-speed1';
import { mountMusic, mountTelevision } from './modules/media.js';
import { mountCollection } from './modules/collections.js';

const $ = (selector, root = document) => root.querySelector(selector);
const desktop = $('#desktop');
const layer = $('#window-layer');
const tasks = $('#task-buttons');
const announcer = $('#announcer');
const computerDialog = $('#computer-dialog');
const objectDialog = $('#object-dialog');
const windows = new Map();
let topZ = 10, soundEnabled = false, audio;
let introCleanup;
let objectCleanup = null, objectReturnFocus = null, computerReturnFocus = null;

document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size || 32)); });

function announce(message) { announcer.textContent = message; }
function gameSound(name) {
  if (!soundEnabled) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    void audio.resume();
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = 'triangle';
    osc.frequency.value = ({ start: 330, score: 660, win: 880, lose: 165, flag: 440, move: 220 })[name] || 330;
    gain.gain.setValueAtTime(.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .12);
    osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + .14);
  } catch { /* The visual experience works without audio support. */ }
}
const apps = {
  welcome: { title: 'The Game Room', icon: 'folder', width: 650, height: 410 },
  snake: { title: 'Snake — one more apple', icon: 'snake', width: 475, height: 455, mount: mountSnake },
  mines: { title: 'Mines — take your time', icon: 'mines', width: 440, height: 460, mount: mountMines },
  paddle: { title: 'Paddle — a friendly rally', icon: 'paddle', width: 610, height: 430, mount: mountPaddle },
  paint: { title: 'Untitled — Paint Pad', icon: 'paint', width: 650, height: 445, mount: mountPaint },
  notes: { title: 'A little note to yourself', icon: 'notes', width: 530, height: 390, mount: mountNotes },
  radio: { title: 'Mixtape Radio — the 80s & 90s', icon: 'radio', width: 690, height: 460, mount: mountMusic },
  about: { title: 'My Computer', icon: 'computer', width: 475, height: 425 },
};
function welcomeHtml() {
  return `<div class="welcome-content"><div class="welcome-greeting"><h2>Good to have you back.</h2>${icon('flower', 39)}</div><p class="welcome-subtitle">Your afternoon is wide open. Where shall we start?</p><div class="games-heading">THE GOOD OLD FAVORITES</div><div class="game-cards"><button class="game-card card-snake" data-open="snake"><span class="game-card-art">${icon('snake', 64)}</span><span class="game-card-label"><span>Snake</span><span>↗</span></span><span class="game-card-description">One more apple.</span></button><button class="game-card card-mines" data-open="mines"><span class="game-card-art">${icon('mines', 64)}</span><span class="game-card-label"><span>Mines</span><span>↗</span></span><span class="game-card-description">A little lucky guess.</span></button><button class="game-card card-paddle" data-open="paddle"><span class="game-card-art">${icon('paddle', 64)}</span><span class="game-card-label"><span>Paddle</span><span>↗</span></span><span class="game-card-description">Find your rhythm.</span></button></div><div class="welcome-bottom"><span>${icon('clock', 15)} There's no hurry in here.</span><button data-open="paint">I'd rather make something →</button></div></div>`;
}
function aboutHtml() {
  return `<div class="about-content">${icon('computer', 50)}<h2>A little less everything.</h2><p>Remember turning on a computer just to see what you could do with it?</p><p>This is a small place for that feeling. Play a game. Draw a wonky flower. Write a thought you don't have to share.</p><button class="bevel" data-replay-intro>Replay the little time machine</button><hr class="about-rule"><p class="about-small">Your notebook is saved in this browser. Clearing browser data clears it too. Mixtape Radio plays official music videos through YouTube; use its Play controls whenever you're ready.</p><button class="bevel" data-open="welcome">Make yourself at home</button><p class="about-small">Original little games & pixel drawings.<br>Pixelify Sans by the Pixelify Sans Project Authors (SIL OFL).</p></div>`;
}
function focusWindow(id, focus = true) {
  const state = windows.get(id); if (!state) return;
  state.minimized = false; state.el.hidden = false;
  constrainWindow(state);
  windows.forEach((w, key) => { if (key !== id && w.el.classList.contains('active')) w.cleanup?.pause?.(); w.el.classList.toggle('active', key === id); w.task.setAttribute('aria-pressed', String(key === id)); });
  state.el.style.zIndex = String(++topZ);
  if (focus) state.el.focus({ preventScroll: true });
}
function nextWindow() {
  const visible = [...windows].filter(([, w]) => !w.minimized).sort((a, b) => Number(b[1].el.style.zIndex) - Number(a[1].el.style.zIndex));
  if (visible[0]) focusWindow(visible[0][0]); else desktop.focus({ preventScroll: true });
}
function closeWindow(id) {
  const state = windows.get(id); if (!state) return;
  state.cleanup?.destroy?.(); state.el.remove(); state.task.remove(); windows.delete(id); nextWindow(); announce(`${apps[id].title} closed.`);
}
function minimizeWindow(id) {
  const state = windows.get(id); if (!state) return;
  state.cleanup?.pause?.(); state.el.hidden = true; state.minimized = true; state.task.setAttribute('aria-pressed', 'false'); nextWindow();
}
function constrainWindow(state) {
  if (!computerDialog.open || state.el.hidden || state.el.classList.contains('window-maximized')) return;
  const { width, height } = desktop.getBoundingClientRect();
  state.el.style.left = `${Math.max(6, Math.min(parseFloat(state.el.style.left) || 6, width - state.el.offsetWidth - 6))}px`;
  state.el.style.top = `${Math.max(6, Math.min(parseFloat(state.el.style.top) || 6, height - Math.min(state.el.offsetHeight, height - 12) - 6))}px`;
}
function makeDraggable(el, titlebar, state) {
  let drag;
  titlebar.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    focusWindow(state.id);
    if (el.classList.contains('window-maximized')) return;
    drag = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop };
    titlebar.setPointerCapture(e.pointerId); e.preventDefault();
  });
  titlebar.addEventListener('pointermove', e => {
    if (!drag) return;
    const left = Math.max(4, Math.min(drag.left + e.clientX - drag.x, desktop.clientWidth - el.offsetWidth - 4));
    const top = Math.max(4, Math.min(drag.top + e.clientY - drag.y, desktop.clientHeight - el.offsetHeight - 4));
    el.style.left = `${left}px`; el.style.top = `${top}px`;
  });
  const end = () => { drag = null; }; titlebar.addEventListener('pointerup', end); titlebar.addEventListener('pointercancel', end);
}
function openApp(id) {
  setStart(false);
  if (!apps[id]) return;
  if (!computerDialog.open) computerDialog.showModal();
  if (windows.has(id)) { focusWindow(id); return; }
  const app = apps[id], el = document.createElement('section');
  el.className = 'retro-window'; el.tabIndex = -1; el.dataset.app = id; el.setAttribute('aria-label', app.title);
  const available = desktop.clientWidth, mobile = available < 650;
  const width = Math.min(app.width, available - (mobile ? 16 : 121));
  const height = Math.min(id === 'welcome' && mobile ? 465 : app.height, desktop.clientHeight - 20);
  el.style.width = `${width}px`; el.style.height = `${height}px`;
  el.style.left = `${mobile ? Math.max(6, (available - width) / 2) : Math.max(105, (available - width) / 2 + 28) + (windows.size % 3) * 12}px`;
  el.style.top = `${mobile ? 30 : 36 + (windows.size % 3) * 17}px`;
  el.innerHTML = `<div class="window-titlebar">${icon(app.icon, 18)}<span class="window-title">${app.title}</span><div class="window-actions"><button class="window-action minimize" aria-label="Minimize ${app.title}" title="Minimize">_</button><button class="window-action maximize" aria-label="Maximize ${app.title}" title="Maximize">□</button><button class="window-action close" aria-label="Close ${app.title}" title="Close">×</button></div></div>${id === 'welcome' ? '<nav class="window-menu" aria-label="Game Room menu"><button data-open="welcome">Games</button><button data-open="paint">Make something</button><button data-open="about">About</button></nav>' : ''}<div class="window-content"></div><div class="window-status"><span>${id === 'welcome' ? '3 small games. One good afternoon.' : "90's-club · personal edition"}</span><span>${id === 'welcome' ? 'Ready when you are.' : 'Take your time.'}</span></div>`;
  const task = document.createElement('button'); task.className = 'task-button'; task.setAttribute('aria-pressed', 'true'); task.innerHTML = `${icon(app.icon, 17)}<span>${id === 'welcome' ? 'Game Room' : id === 'notes' ? 'Notebook' : id === 'radio' ? 'Mixtape' : app.title.split(' — ')[0]}</span>`;
  task.addEventListener('click', () => { const state = windows.get(id); if (!state) return; if (!state.minimized && state.el.classList.contains('active')) minimizeWindow(id); else focusWindow(id); });
  tasks.append(task); layer.append(el);
  const state = { id, el, task, cleanup: null, minimized: false }; windows.set(id, state);
  const content = $('.window-content', el);
  if (id === 'welcome') content.innerHTML = welcomeHtml();
  else if (id === 'about') content.innerHTML = aboutHtml();
  else { content.tabIndex = 0; content.setAttribute('aria-label', `${app.title} controls`); state.cleanup = app.mount(content, { onSound: gameSound }); }
  $('.close', el).addEventListener('click', () => closeWindow(id));
  $('.minimize', el).addEventListener('click', () => minimizeWindow(id));
  $('.maximize', el).addEventListener('click', e => { const max = el.classList.toggle('window-maximized'); e.currentTarget.setAttribute('aria-label', `${max ? 'Restore' : 'Maximize'} ${app.title}`); constrainWindow(state); focusWindow(id); });
  el.addEventListener('pointerdown', () => focusWindow(id, false));
  el.addEventListener('focusin', () => focusWindow(id, false));
  makeDraggable(el, $('.window-titlebar', el), state); constrainWindow(state); focusWindow(id);
  announce(`${app.title} opened.`);
}

const startButton = $('#start-button'), startMenu = $('#start-menu');
function setStart(open) { startMenu.hidden = !open; startButton.setAttribute('aria-expanded', String(open)); }
document.addEventListener('click', e => { if (e.target.closest('[data-replay-intro]')) { showIntro(); return; } const trigger = e.target.closest('[data-open]'); if (trigger) openApp(trigger.dataset.open); else if (!e.target.closest('#start-menu, #start-button')) setStart(false); });
startButton.addEventListener('click', () => { const open = startMenu.hidden; setStart(open); if (open) $('button', startMenu).focus(); });
document.addEventListener('keydown', e => {
  const intro = $('#project-intro');
  if (!intro.hidden && e.key === 'Escape') { e.preventDefault(); dismissIntro(); return; }
  if (!intro.hidden && e.key === 'Tab') {
    const buttons = [...intro.querySelectorAll('button:not(:disabled)')];
    const first = buttons[0], last = buttons.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    return;
  }
  if (e.key === 'Escape' && !startMenu.hidden) { e.preventDefault(); setStart(false); startButton.focus(); }
});
$('#sound-button').addEventListener('click', () => { soundEnabled = !soundEnabled; const b = $('#sound-button'); b.setAttribute('aria-pressed', String(soundEnabled)); b.setAttribute('aria-label', `${soundEnabled ? 'Mute' : 'Enable gentle'} game sounds`); b.title = `Game sounds: ${soundEnabled ? 'on' : 'off'}`; $('.muted-cross', b).hidden = soundEnabled; if (soundEnabled) gameSound('start'); announce(`Game sounds ${soundEnabled ? 'on' : 'off'}.`); });
function syncScreenInert() {
  const intro = $('#project-intro'), breakScreen = $('#break-screen');
  // The intro takes priority if replayed during a break. Dismissing either
  // overlay must preserve the other's inert state.
  const overlay = !intro.hidden ? intro : !breakScreen.hidden ? breakScreen : null;
  [...$('#screen').children].forEach(el => { el.inert = Boolean(overlay && el !== overlay); });
}
function focusScreenState() {
  const intro = $('#project-intro');
  if (!intro.hidden) $('button', intro)?.focus({ preventScroll: true });
  else if (!$('#break-screen').hidden) $('#resume-button').focus({ preventScroll: true });
  else nextWindow();
}
function takeBreak() {
  setStart(false); windows.forEach(w => w.cleanup?.pause?.());
  $('#break-screen').hidden = false; syncScreenInert();
  $('#power-button').setAttribute('aria-label', 'Return to the desktop');
  focusScreenState();
}
function resume(focus = true) {
  $('#break-screen').hidden = true; syncScreenInert();
  $('#power-button').setAttribute('aria-label', 'Take a break from the screen');
  if (focus) focusScreenState();
}
function dismissIntro() {
  const host = $('#project-intro'); if (host.hidden) return;
  introCleanup?.destroy?.(); introCleanup = null; host.hidden = true;
  syncScreenInert();
  $('.site-header').inert = false; $('.skip-link').inert = false;
  $('#power-button').disabled = false;
  try { sessionStorage.setItem('offline-club.intro-seen', 'true'); } catch { /* A private browser session still works. */ }
  focusScreenState();
}
function showIntro() {
  setStart(false); windows.forEach(w => w.cleanup?.pause?.());
  const host = $('#project-intro'); introCleanup?.destroy?.(); host.hidden = false;
  syncScreenInert();
  $('.site-header').inert = true; $('.skip-link').inert = true;
  $('#power-button').disabled = true;
  introCleanup = mountIntro(host, { onEnter: dismissIntro });
  $('button', host)?.focus({ preventScroll: true });
}
function openComputer(app = 'welcome', trigger) {
  if (objectDialog.open) closeObject(false);
  if (!$('#break-screen').hidden) resume(false);
  if (trigger) computerReturnFocus = trigger;
  if (!computerDialog.open) computerDialog.showModal();
  if (trigger) {
    const from = trigger.getBoundingClientRect(), to = computerDialog.getBoundingClientRect();
    computerDialog.style.setProperty('--zoom-x', `${Math.max(0, Math.min(100, (from.x + from.width / 2 - to.x) / to.width * 100))}%`);
    computerDialog.style.setProperty('--zoom-y', `${Math.max(0, Math.min(100, (from.y + from.height / 2 - to.y) / to.height * 100))}%`);
  }
  openApp(app);
  if (app === 'welcome') {
    try { if (!sessionStorage.getItem('offline-club.intro-seen')) showIntro(); } catch { showIntro(); }
  }
}
function closeComputer() {
  // Reopening returns to the desktop; paused games remain paused until the
  // visitor explicitly resumes them.
  if (!$('#break-screen').hidden) resume(false);
  if (!$('#project-intro').hidden) dismissIntro();
  windows.forEach(w => w.cleanup?.pause?.());
  void audio?.suspend();
  computerDialog.close();
  computerReturnFocus?.focus({ preventScroll: true });
}
const objectTitles = {
  walkman: 'Your weekend mixtape', tv: 'After-school television', poster: 'Backstreet Boys · on repeat',
  'pokemon-poster': 'Pokémon · after school', pokemon: 'Your Pokémon binder', tamagotchi: 'Your pocket-sized friend',
  handheld: 'Pocket Snake', pogs: 'The slammer collection', story: 'Welcome back to your room',
};
function roomStoryHtml() {
  return `<section class="room-story"><h3>Friday night. Homework can wait.</h3><p>The computer hums on the desk. Your favourite poster is still taped to the wall. There is a mixtape waiting where you left it.</p><p><strong>Click the PC</strong> for little games, Paint Pad, and your notebook. <strong>Pick up the Walkman</strong> for an 80s/90s mixtape. <strong>Turn on the TV</strong>, flick through your Pokémon binder, or check on your tiny virtual pet.</p><p>Look around at your own pace. On a phone, swipe across the room or use the shelf of shortcuts below it.</p><small>Music and video load from YouTube after you choose to play. Notebook and drawing saves stay in this browser. This is an unofficial nostalgia fan project.</small></section>`;
}
function closeObject(restoreFocus = true) {
  try { objectCleanup?.destroy?.(); } finally { objectCleanup = null; $('#object-content').replaceChildren(); objectDialog.close(); }
  if (restoreFocus) objectReturnFocus?.focus({ preventScroll: true });
}
function openObject(id, trigger) {
  if (id === 'computer') { openComputer('welcome', trigger); return; }
  if (!objectTitles[id]) return;
  if (objectDialog.open) closeObject(false);
  if (computerDialog.open) closeComputer();
  objectReturnFocus = trigger ?? document.activeElement;
  objectDialog.dataset.kind = id;
  $('#object-title').textContent = objectTitles[id];
  const content = $('#object-content');
  objectDialog.showModal();
  if (id === 'walkman') objectCleanup = mountMusic(content, { initialTrack: 'bsb-iwant', autoplay: true });
  else if (id === 'tv' || id === 'poster' || id === 'pokemon-poster') objectCleanup = mountTelevision(content, { initialTrack: id === 'poster' ? 'bsb-iwant' : 'pokemon-pikachu', autoplay: true });
  else if (id === 'story') content.innerHTML = roomStoryHtml();
  else objectCleanup = mountCollection(content, { type: id });
  $('#close-object').focus({ preventScroll: true });
  announce(`${objectTitles[id]} opened.`);
}
$('#close-computer').addEventListener('click', closeComputer);
computerDialog.addEventListener('cancel', e => { e.preventDefault(); if (!$('#project-intro').hidden) dismissIntro(); else closeComputer(); });
computerDialog.addEventListener('click', e => { if (e.target === computerDialog) closeComputer(); });
$('#close-object').addEventListener('click', () => closeObject());
objectDialog.addEventListener('cancel', e => { e.preventDefault(); closeObject(); });
objectDialog.addEventListener('click', e => { if (e.target === objectDialog) closeObject(); });
$('#room-about').addEventListener('click', e => openObject('story', e.currentTarget));
document.body.classList.toggle('is-page-hidden', document.hidden);
document.addEventListener('visibilitychange', () => { document.body.classList.toggle('is-page-hidden', document.hidden); if (document.hidden) { objectCleanup?.pause?.(); windows.forEach(w => w.cleanup?.pause?.()); } });
$('#break-menu').addEventListener('click', takeBreak); $('#power-button').addEventListener('click', () => $('#break-screen').hidden ? takeBreak() : resume()); $('#resume-button').addEventListener('click', resume);
function clock() { const now = new Date(); $('#clock').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }); $('#clock').dateTime = now.toISOString(); }
clock(); setInterval(clock, 1000 * 15);
window.addEventListener('resize', () => windows.forEach(constrainWindow));
window.addEventListener('pagehide', event => {
  windows.forEach(w => event.persisted ? w.cleanup?.pause?.() : w.cleanup?.destroy?.());
  if (event.persisted) objectCleanup?.pause?.(); else objectCleanup?.destroy?.();
  if (event.persisted) void audio?.suspend(); else void audio?.close();
});
mountBedroom($('#bedroom-root'), { onOpen: openObject });
