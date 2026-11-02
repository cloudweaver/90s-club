import { mountSnake } from './games.js';

const PALETTE = { ink: '#473e4c', yellow: '#e8bd4e', gold: '#b7833e', cream: '#fff1c2', brown: '#9c6850', orange: '#db8b50', red: '#c86e66', blue: '#76aab4', teal: '#75b3a0', green: '#729460', leaf: '#a7bc78', pink: '#d6a0ad', white: '#fff9e8', eye: '#456d78', lavender: '#a6a0bf' };
const blockArt = blocks => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${blocks.map(([x,y,w,h,color]) => `<path fill="${PALETTE[color]}" d="M${x} ${y}h${w}v${h}h-${w}z"/>`).join('')}</svg>`;

const CREATURES = [
  { name: 'Pikachu', color: '#e4c165', memory: 'The theme song starts. For twenty minutes, the whole afternoon belongs to you.', art: [
    [5,1,3,8,'ink'],[6,3,2,6,'yellow'],[15,1,3,8,'ink'],[15,3,2,6,'yellow'],[5,7,13,10,'ink'],[6,8,11,8,'yellow'],[7,15,10,7,'ink'],[8,16,8,5,'yellow'],[5,19,4,3,'ink'],[6,19,3,2,'yellow'],[15,19,4,3,'ink'],[15,19,3,2,'yellow'],[18,11,5,3,'ink'],[20,8,3,4,'yellow'],[18,13,3,3,'yellow'],[7,11,2,2,'ink'],[14,11,2,2,'ink'],[7,14,2,2,'red'],[14,14,2,2,'red'],[11,14,2,1,'ink'],[10,17,4,1,'brown'],
  ] },
  { name: 'Bulbasaur', color: '#8bb8a1', memory: 'A first partner, a borrowed guidebook, and a whole world waiting on a tiny green screen.', art: [
    [9,3,8,9,'ink'],[11,2,4,2,'ink'],[10,4,6,7,'green'],[12,3,2,7,'leaf'],[8,6,3,4,'leaf'],[6,10,13,9,'ink'],[7,11,11,7,'teal'],[3,11,10,9,'ink'],[4,12,8,7,'teal'],[3,9,3,5,'ink'],[4,10,2,4,'teal'],[10,10,3,4,'ink'],[10,11,2,3,'teal'],[5,18,3,4,'ink'],[5,18,2,3,'teal'],[14,18,3,4,'ink'],[14,18,2,3,'teal'],[5,14,2,3,'red'],[9,14,2,3,'red'],[5,14,1,1,'white'],[9,14,1,1,'white'],[6,18,4,1,'ink'],[14,13,2,2,'green'],[16,16,2,1,'green'],
  ] },
  { name: 'Charmander', color: '#dbac79', memory: 'Leaning towards the window, looking for just enough light to keep playing.', art: [
    [7,3,8,2,'ink'],[5,5,12,8,'ink'],[6,5,10,7,'orange'],[7,12,9,9,'ink'],[8,12,7,8,'orange'],[9,15,5,5,'cream'],[5,18,4,4,'ink'],[6,18,3,3,'orange'],[14,18,4,4,'ink'],[14,18,3,3,'orange'],[16,15,5,4,'ink'],[17,15,3,3,'orange'],[20,10,3,7,'red'],[21,8,1,3,'red'],[21,12,1,4,'yellow'],[7,7,2,3,'ink'],[13,7,2,3,'ink'],[7,7,1,1,'white'],[13,7,1,1,'white'],[9,11,4,1,'ink'],[5,14,3,3,'orange'],
  ] },
  { name: 'Squirtle', color: '#8fbbc4', memory: 'A water-blue sticker on your school folder. Everyone was sure their favourite was best.', art: [
    [6,3,8,2,'ink'],[4,5,12,7,'ink'],[5,5,10,6,'blue'],[7,11,11,10,'ink'],[8,12,9,8,'brown'],[9,13,6,7,'cream'],[13,12,4,7,'gold'],[4,13,5,3,'ink'],[5,13,4,2,'blue'],[17,14,4,6,'ink'],[18,15,3,4,'blue'],[19,17,1,2,'cream'],[6,19,5,3,'ink'],[7,19,4,2,'blue'],[14,19,5,3,'ink'],[14,19,4,2,'blue'],[6,7,2,3,'ink'],[12,7,2,3,'ink'],[6,7,1,1,'white'],[12,7,1,1,'white'],[8,10,4,1,'ink'],[10,16,4,1,'gold'],
  ] },
  { name: 'Eevee', color: '#bc9a7d', memory: 'The one you never quite wanted to evolve. Some things are already exactly right.', art: [
    [3,1,3,8,'ink'],[4,3,2,5,'brown'],[17,1,3,8,'ink'],[17,3,2,5,'brown'],[5,6,14,10,'ink'],[6,7,12,8,'brown'],[7,14,11,7,'ink'],[8,15,9,5,'brown'],[5,14,14,3,'cream'],[7,17,10,1,'cream'],[9,18,6,1,'cream'],[7,19,4,3,'ink'],[7,19,3,2,'brown'],[15,19,4,3,'ink'],[15,19,3,2,'brown'],[19,12,4,7,'ink'],[20,13,3,5,'brown'],[21,12,2,3,'cream'],[8,10,2,3,'ink'],[14,10,2,3,'ink'],[8,10,1,1,'white'],[14,10,1,1,'white'],[11,13,2,1,'ink'],
  ] },
  { name: 'Jigglypuff', color: '#d5a8b6', memory: 'You promised to stay awake for the song. A pink doodle and a sleepy Saturday morning.', art: [
    [4,3,4,7,'ink'],[5,4,2,5,'pink'],[17,3,4,7,'ink'],[18,4,2,5,'pink'],[6,5,13,15,'ink'],[4,8,17,9,'ink'],[6,6,12,13,'pink'],[5,9,15,7,'pink'],[9,2,6,6,'ink'],[10,3,4,4,'pink'],[11,4,2,1,'red'],[5,18,6,3,'ink'],[6,18,5,2,'pink'],[15,18,6,3,'ink'],[15,18,5,2,'pink'],[7,10,4,5,'white'],[15,10,4,5,'white'],[8,11,3,4,'eye'],[15,11,3,4,'eye'],[8,11,1,1,'white'],[15,11,1,1,'white'],[12,16,2,1,'ink'],[3,12,2,3,'pink'],[20,12,2,3,'pink'],
  ] },
];

function scope(container, className) {
  if (!container?.ownerDocument) throw new TypeError('A collection needs a DOM container.');
  const doc = container.ownerDocument, win = doc.defaultView;
  const root = doc.createElement('section'); root.className = `collection-root ${className}`;
  const controller = new win.AbortController();
  container.replaceChildren(root);
  return { root, doc, win, signal: controller.signal, dispose() { controller.abort(); root.remove(); } };
}

function binder(container) {
  const life = scope(container, 'collection-binder');
  life.root.innerHTML = `<header class="collection-heading"><span class="collection-eyebrow">THE AFTER-SCHOOL COLLECTION</span><h3>Just one more look.</h3><p>Six little pixel memories. Tap a card to turn it over.</p></header><div class="collection-binder-pages">${CREATURES.map((item,index) => `<button type="button" class="collection-card" data-card="${index}" aria-pressed="false" aria-label="${item.name}. Turn over to read a memory." style="--collection-card-color:${item.color}"><span class="collection-card-turn"><span class="collection-card-face collection-card-front"><span class="collection-card-top"><b>${item.name}</b><small>0${index+1}</small></span><span class="collection-card-art">${blockArt(item.art)}</span><span class="collection-card-caption">A LITTLE PIXEL PORTRAIT</span><span class="collection-card-foot">1999 · the good old favourites <span aria-hidden="true">↻</span></span></span><span class="collection-card-face collection-card-back" aria-hidden="true"><span class="collection-card-back-label">a memory, not a move</span><b>${item.name}</b><span>${item.memory}</span><small>tap to see your little friend again ↻</small></span></span></button>`).join('')}</div><p class="collection-disclaimer">Original fan-made pixel doodles, not official trading cards. This little fan room is not affiliated with Pokémon.</p>`;
  life.root.addEventListener('click', event => {
    const card = event.target.closest('[data-card]'); if (!card || !life.root.contains(card)) return;
    const flipped = card.classList.toggle('collection-is-flipped');
    const item = CREATURES[Number(card.dataset.card)];
    card.setAttribute('aria-pressed', String(flipped));
    card.setAttribute('aria-label', flipped ? `${item.name}. ${item.memory} Turn over to see the portrait.` : `${item.name}. Turn over to read a memory.`);
    card.querySelector('.collection-card-front').setAttribute('aria-hidden', String(flipped));
    card.querySelector('.collection-card-back').setAttribute('aria-hidden', String(!flipped));
  }, { signal: life.signal });
  return { destroy: () => life.dispose() };
}

const PET_ART = [[7,7,10,10,'ink'],[5,9,14,6,'ink'],[8,8,8,8,'teal'],[6,10,12,4,'teal'],[7,16,3,2,'ink'],[14,16,3,2,'ink'],[7,9,3,1,'leaf'],[8,13,1,1,'pink'],[15,13,1,1,'pink']];
function pet(container) {
  const life = scope(container, 'collection-pet');
  let food = 65, fun = 70, energy = 80, sleeping = false, destroyed = false, paused = false, tick = null, actionTimer = null;
  life.root.innerHTML = `<header class="collection-heading"><span class="collection-eyebrow">A POCKET-SIZED FRIEND</span><h3>Little Pixel Pal</h3><p>An original virtual pet, inspired by the pocket pets of the ’90s.</p></header><div class="collection-egg"><div class="collection-egg-speckles" aria-hidden="true"></div><span class="collection-egg-brand">little pixel pal</span><div class="collection-pet-screen"><span class="collection-pet-mood">Feeling lovely</span><div class="collection-pet-portrait">${blockArt(PET_ART)}<span class="collection-pet-effect" aria-hidden="true"></span></div><span class="collection-pet-face" aria-hidden="true"></span></div><div class="collection-pet-buttons"><button type="button" data-pet="feed"><span aria-hidden="true">●</span>Feed</button><button type="button" data-pet="play"><span aria-hidden="true">●</span>Play</button><button type="button" data-pet="nap"><span aria-hidden="true">●</span><span data-nap-label>Nap</span></button></div></div><div class="collection-pet-meters"><label>Full tummy <meter min="0" max="100" value="65" data-meter="food"></meter><output data-value="food">65</output></label><label>Good spirits <meter min="0" max="100" value="70" data-meter="fun"></meter><output data-value="fun">70</output></label><label>Little battery <meter min="0" max="100" value="80" data-meter="energy"></meter><output data-value="energy">80</output></label></div><p class="collection-pet-status" role="status">Hello, new friend. Got a minute for a tiny snack?</p><p class="collection-small">A tiny toy for this visit. No account, no chores saved for later.</p>`;
  const portrait = life.root.querySelector('.collection-pet-portrait');
  const status = life.root.querySelector('.collection-pet-status');
  const face = life.root.querySelector('.collection-pet-face');
  const mood = life.root.querySelector('.collection-pet-mood');
  const clamp = value => Math.max(15, Math.min(100, value));
  function render() {
    const values = { food, fun, energy };
    for (const [name,value] of Object.entries(values)) {
      life.root.querySelector(`[data-meter="${name}"]`).value = value;
      life.root.querySelector(`[data-value="${name}"]`).textContent = String(value);
    }
    mood.textContent = sleeping ? 'A very small snooze' : energy < 35 ? 'A little sleepy' : food < 35 ? 'Thinking about snacks' : fun < 35 ? 'Ready for a little game' : 'Feeling lovely';
    face.textContent = sleeping ? '−  −' : '•  •';
    life.root.classList.toggle('collection-pet-sleeping', sleeping);
    life.root.querySelector('[data-nap-label]').textContent = sleeping ? 'Wake up' : 'Nap';
    life.root.querySelector('[data-pet="nap"]').setAttribute('aria-pressed', String(sleeping));
  }
  function stopTick() { if (tick !== null) life.win.clearInterval(tick); tick = null; }
  function startTick() {
    if (destroyed || life.doc.hidden || tick !== null) return;
    paused = false;
    tick = life.win.setInterval(() => {
      food = clamp(food - 2); fun = clamp(fun - 1); energy = clamp(energy + (sleeping ? 6 : -1)); render();
    }, 9000);
  }
  function animate(action, effect) {
    if (actionTimer !== null) life.win.clearTimeout(actionTimer);
    portrait.className = `collection-pet-portrait collection-pet-${action}`;
    portrait.querySelector('.collection-pet-effect').textContent = effect;
    actionTimer = life.win.setTimeout(() => { actionTimer = null; portrait.className = 'collection-pet-portrait'; portrait.querySelector('.collection-pet-effect').textContent = ''; }, 1100);
  }
  life.root.addEventListener('click', event => {
    const button = event.target.closest('[data-pet]'); if (!button || !life.root.contains(button) || destroyed) return;
    if (paused) startTick();
    const action = button.dataset.pet;
    if (action === 'feed') { sleeping = false; food = clamp(food + 20); energy = clamp(energy + 3); status.textContent = 'Crunch, crunch. A tiny pixel snack makes everything better.'; animate('feeding', '· · ·'); }
    if (action === 'play') { sleeping = false; fun = clamp(fun + 22); energy = clamp(energy - 10); food = clamp(food - 6); status.textContent = 'A little hop, a little wobble. That was a very good game.'; animate('playing', '✦'); }
    if (action === 'nap') { sleeping = !sleeping; if (sleeping) energy = clamp(energy + 10); status.textContent = sleeping ? 'Zzz. A short snooze is a perfectly good plan.' : 'A big stretch. Your little pal is awake again.'; animate('napping', sleeping ? 'z z' : '·'); }
    render();
  }, { signal: life.signal });
  function pause() {
    if (destroyed) return;
    paused = true; stopTick();
    if (actionTimer !== null) life.win.clearTimeout(actionTimer); actionTimer = null;
    portrait.className = 'collection-pet-portrait'; portrait.querySelector('.collection-pet-effect').textContent = '';
  }
  life.doc.addEventListener('visibilitychange', () => { if (life.doc.hidden) pause(); else if (!destroyed && life.root.isConnected && life.root.getClientRects().length) startTick(); }, { signal: life.signal });
  render(); startTick();
  return { pause, destroy() { if (destroyed) return; pause(); destroyed = true; life.dispose(); } };
}

const DISCS = [
  { name: 'Sunshine Club', color: '#dfb167', art: [[7,3,10,18,'yellow'],[3,7,18,10,'yellow'],[7,7,10,10,'ink'],[8,8,8,8,'gold'],[9,10,2,2,'ink'],[14,10,2,2,'ink'],[10,14,5,1,'ink'],[3,3,3,3,'cream'],[19,19,2,2,'cream']] },
  { name: 'Orbit No. 3', color: '#8a91b1', art: [[5,5,14,14,'lavender'],[7,3,10,18,'lavender'],[3,7,18,10,'lavender'],[8,6,8,12,'navy'],[6,8,12,8,'eye'],[9,7,6,10,'blue'],[7,9,10,6,'blue'],[2,13,5,3,'cream'],[6,11,4,3,'cream'],[10,9,4,3,'cream'],[14,7,4,3,'cream'],[18,5,4,3,'cream'],[3,3,2,2,'yellow']] },
  { name: 'Pixel Daisy', color: '#9caf8c', art: [[10,3,4,18,'cream'],[3,10,18,4,'cream'],[5,5,4,4,'cream'],[15,5,4,4,'cream'],[5,15,4,4,'cream'],[15,15,4,4,'cream'],[8,8,8,8,'ink'],[9,9,6,6,'yellow'],[10,10,2,2,'gold']] },
];
// "navy" is deliberately local to the disc pattern, not a brand mark.
PALETTE.navy = '#5a637f';
function pogs(container) {
  const life = scope(container, 'collection-pogs');
  let order = [0,1,2], mixes = 0, scattered = false;
  life.root.innerHTML = `<header class="collection-heading"><span class="collection-eyebrow">THE CARDBOARD TREASURE DEPARTMENT</span><h3>A pocket full of pogs.</h3><p>Three original little designs. Mix the stack, then pick a favourite.</p></header><button type="button" class="collection-pog-stack" aria-label="Mix the stack of three pogs"></button><div class="collection-pog-actions"><button type="button" class="collection-action" data-pogs="mix">Mix the stack</button><button type="button" class="collection-action" data-pogs="scatter" aria-pressed="false">Spread them out</button></div><div class="collection-pog-picks">${DISCS.map((disc,index) => `<button type="button" class="collection-pog-pick" data-disc="${index}" aria-pressed="false"><span class="collection-disc" style="--collection-disc-color:${disc.color}">${blockArt(disc.art)}</span><b>${disc.name}</b><span class="collection-disc-caption">click to claim your favourite</span></button>`).join('')}</div><p class="collection-pog-status" role="status">Sunshine Club is on top. A good place to start.</p><p class="collection-small">Original pixel patterns. No rare ones, just favourites.</p>`;
  const stack = life.root.querySelector('.collection-pog-stack'), status = life.root.querySelector('.collection-pog-status');
  function renderStack() {
    stack.innerHTML = [...order].reverse().map((index,layer) => `<span class="collection-disc collection-stack-disc" style="--collection-disc-color:${DISCS[index].color};--collection-layer:${layer}">${blockArt(DISCS[index].art)}</span>`).join('');
    stack.classList.toggle('collection-pogs-scattered', scattered);
  }
  function mix() {
    order = [...order.slice(1), order[0]]; mixes++;
    if (mixes % 2 === 0) [order[1],order[2]] = [order[2],order[1]];
    renderStack(); status.textContent = `${DISCS[order[0]].name} is on top. Mixed ${mixes} ${mixes === 1 ? 'time' : 'times'}.`;
  }
  life.root.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || !life.root.contains(button)) return;
    if (button === stack || button.dataset.pogs === 'mix') mix();
    if (button.dataset.pogs === 'scatter') { scattered = !scattered; button.setAttribute('aria-pressed', String(scattered)); button.textContent = scattered ? 'Stack them again' : 'Spread them out'; renderStack(); status.textContent = scattered ? 'All three on the carpet. Which one is yours?' : 'A satisfyingly tidy little stack.'; }
    if (button.dataset.disc !== undefined) {
      const index = Number(button.dataset.disc), chosen = button.getAttribute('aria-pressed') !== 'true';
      life.root.querySelectorAll('[data-disc]').forEach(item => { item.setAttribute('aria-pressed', String(chosen && item === button)); item.querySelector('.collection-disc-caption').textContent = chosen && item === button ? 'your favourite, for now' : 'click to claim your favourite'; });
      status.textContent = chosen ? `${DISCS[index].name}. Excellent taste. This one's your favourite.` : 'Back in the collection. You can always change your mind.';
    }
  }, { signal: life.signal });
  renderStack(); return { destroy: () => life.dispose() };
}

function handheld(container) {
  const life = scope(container, 'collection-handheld');
  life.root.innerHTML = `<header class="collection-heading"><span class="collection-eyebrow">FOUR BATTERIES AND THE WHOLE AFTERNOON</span><h3>Pocket Snake</h3><p>A little handheld. A fresh patch of garden. One more apple.</p></header><div class="collection-handheld-case"><div class="collection-handheld-label"><span class="collection-power-light" aria-hidden="true"></span>DOT MATRIX · POCKET EDITION</div><div class="collection-handheld-game"></div><div class="collection-handheld-chin"><b>pocket <i>snake</i></b><span aria-hidden="true">▰ ▰ ▰</span></div></div><p class="collection-small">An original handheld-inspired toy, using the room’s own Snake game. Arrows / WASD or the on-screen pad.</p>`;
  const game = mountSnake(life.root.querySelector('.collection-handheld-game'));
  let destroyed = false;
  return { pause() { if (!destroyed) game.pause?.(); }, destroy() { if (destroyed) return; destroyed = true; game.destroy?.(); life.dispose(); } };
}

/** Mount one local, interactive bedroom collection. No account or network calls. */
export function mountCollection(container, { type = 'pokemon' } = {}) {
  const collections = { pokemon: binder, tamagotchi: pet, pogs, handheld };
  return (Object.hasOwn(collections, type) ? collections[type] : binder)(container);
}
