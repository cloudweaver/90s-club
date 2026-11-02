// Percentages are bounding boxes: x / y are the top-left of the object.
// Keep this small map separate from the artwork so the scene is easy to tune.
export const ROOM_OBJECTS = [
  { id: 'computer', label: 'The family computer', shortLabel: 'Computer', x: 16.5, y: 28, w: 24, h: 25 },
  { id: 'walkman', label: 'Your favorite mixtape', shortLabel: 'Walkman', x: 42.5, y: 42.5, w: 11, h: 10 },
  { id: 'tv', label: 'Something good is on', shortLabel: 'Television', x: 70.5, y: 23, w: 15, h: 19 },
  { id: 'poster', label: 'The band on your wall', shortLabel: 'Band poster', x: 42.2, y: 7, w: 25.5, h: 24 },
  { id: 'pokemon', label: 'Your trading card collection', shortLabel: 'Trading cards', x: 4, y: 57, w: 20, h: 23 },
  { id: 'handheld', label: 'One more level', shortLabel: 'Handheld', x: 85.5, y: 65, w: 10, h: 13 },
  { id: 'tamagotchi', label: 'Your tiny digital friend', shortLabel: 'Virtual pet', x: 19, y: 14, w: 5, h: 8 },
  { id: 'pogs', label: 'The good Pogs', shortLabel: 'Pogs', x: 58.5, y: 86, w: 11, h: 8 },
  { id: 'lamp', label: 'The lava lamp', shortLabel: 'Lava lamp', x: 53.5, y: 31, w: 5, h: 19, layer: 3 },
  { id: 'pokemon-poster', label: 'Your favorite after-school show', shortLabel: 'Cartoon poster', x: 5, y: 6, w: 11, h: 39, quick: false },
];

let instance = 0;

export function mountBedroom(container, { onOpen } = {}) {
  const id = `bedroom-${++instance}`;
  const document = container.ownerDocument;
  let destroyed = false, lampOn = true, labelsVisible = false;
  const listeners = [];
  const listen = (target, event, fn, options) => {
    target.addEventListener(event, fn, options);
    listeners.push(() => target.removeEventListener(event, fn, options));
  };
  const hotspots = ROOM_OBJECTS.map(object => `<button type="button" class="room-hotspot room-object-${object.id}" data-room-object="${object.id}" style="left:${object.x}%;top:${object.y}%;width:${object.w}%;height:${object.h}%;z-index:${object.layer || 2}" aria-label="${object.id === 'lamp' ? 'Turn off the lava lamp' : object.label}"${object.id === 'lamp' ? ' aria-pressed="true"' : ''}><span class="room-object-corners" aria-hidden="true"></span><span class="room-tooltip" aria-hidden="true">${object.label}<span>${object.id === 'lamp' ? 'a little warm light' : 'click to remember'}</span></span></button>`).join('');
  const quick = ROOM_OBJECTS.filter(object => object.quick !== false).map(object => `<button type="button" class="room-quick-button" data-room-object="${object.id}"${object.id === 'lamp' ? ' aria-pressed="true"' : ''}><span class="room-quick-pixel" aria-hidden="true"></span>${object.shortLabel}<span class="room-quick-arrow" aria-hidden="true">↗</span></button>`).join('');

  container.innerHTML = `<section class="bedroom" aria-labelledby="${id}-title">
    <header class="room-intro">
      <div class="room-greeting"><p class="room-eyebrow"><span aria-hidden="true">✦</span> YOUR OLD ROOM, JUST AS YOU LEFT IT</p><h1 id="${id}-title">You’re home. It’s 1999.</h1><p class="room-copy">Click something familiar. Stay awhile.</p></div>
      <div class="room-badges" aria-label="Scene setting"><span class="room-evening"><span aria-hidden="true">●</span> Friday evening</span><span class="room-date">NO SCHOOL TOMORROW.</span></div>
    </header>
    <div class="room-frame">
      <div class="room-viewport" tabindex="0" aria-label="Explore your bedroom. On a small screen, scroll sideways to look around." aria-describedby="${id}-help">
        <div class="room-scene is-lamp-on">
          <img class="room-art" src="./assets/bedroom-1999.png" width="1536" height="1024" fetchpriority="high" decoding="async" draggable="false" alt="A warmly lit pixel-art bedroom in 1999: a computer, cassette player and trading cards on the desk, posters on the wall, a little television, and a handheld game waiting on the bed.">
          <div class="room-dusk" aria-hidden="true"></div>
          <div class="room-lamp-glow" aria-hidden="true"></div>
          <div class="room-tv-light" aria-hidden="true"></div>
          <div class="room-dust" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="room-hotspot-layer">${hotspots}</div>
          <span class="room-scene-note" aria-hidden="true">a place to come back to.</span>
        </div>
      </div>
      <span class="room-frame-corner room-frame-corner-tl" aria-hidden="true"></span><span class="room-frame-corner room-frame-corner-br" aria-hidden="true"></span>
    </div>
    <div class="room-under-scene"><p id="${id}-help"><span aria-hidden="true">✧</span> There’s a memory in every corner.<span class="room-pan-hint"> Swipe sideways to look around.</span></p><button type="button" class="room-label-toggle" aria-pressed="false">Show object labels <span aria-hidden="true">+</span></button></div>
    <nav class="room-quick" aria-label="Explore the room"><div class="room-quick-heading"><span>EXPLORE THE ROOM</span><span class="room-quick-line" aria-hidden="true"></span><small>pick an old favorite</small></div><div class="room-quick-buttons">${quick}</div></nav>
    <p class="room-status" role="status" aria-live="polite">The lamp is on. The evening is yours.</p>
  </section>`;

  const scene = container.querySelector('.room-scene');
  const status = container.querySelector('.room-status');
  const labelToggle = container.querySelector('.room-label-toggle');
  const allObjectButtons = [...container.querySelectorAll('[data-room-object]')];

  function updateLamp() {
    scene.classList.toggle('is-lamp-on', lampOn);
    for (const button of allObjectButtons.filter(button => button.dataset.roomObject === 'lamp')) {
      button.setAttribute('aria-pressed', String(lampOn));
      button.setAttribute('aria-label', `Turn ${lampOn ? 'off' : 'on'} the lava lamp`);
    }
    status.textContent = lampOn ? 'A little warm light. That’s better.' : 'Lamp off. Just the last of the evening light.';
  }

  listen(container, 'click', event => {
    if (destroyed || !(event.target instanceof document.defaultView.Element)) return;
    const button = event.target.closest('button');
    if (!button || !container.contains(button)) return;
    if (button === labelToggle) {
      labelsVisible = !labelsVisible;
      scene.classList.toggle('room-labels-visible', labelsVisible);
      labelToggle.setAttribute('aria-pressed', String(labelsVisible));
      labelToggle.innerHTML = `${labelsVisible ? 'Hide' : 'Show'} object labels <span aria-hidden="true">${labelsVisible ? '−' : '+'}</span>`;
      return;
    }
    const objectId = button.dataset.roomObject;
    if (!objectId) return;
    if (objectId === 'lamp') { lampOn = !lampOn; updateLamp(); return; }
    if (typeof onOpen === 'function') onOpen(objectId, button);
  });

  // Keyboard focus reveals the same labels as a pointer and pans to the object.
  for (const button of container.querySelectorAll('.room-hotspot')) {
    listen(button, 'focus', () => {
      button.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
    });
  }

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.forEach(remove => remove());
      container.replaceChildren();
    },
  };
}
