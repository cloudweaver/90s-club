const catalog = [
  ['bsb-iwant', '4fndeDfaWCg', 'Backstreet Boys', 'I Want It That Way', 1999, 'BackstreetBoysVEVO'],
  ['bsb-everybody', '6M6samPEMpM', 'Backstreet Boys', 'Everybody (Backstreet’s Back)', 1997, 'BackstreetBoysVEVO'],
  ['aha-takeonme', 'djV11Xbc914', 'a-ha', 'Take On Me', 1985, 'a-ha'],
  ['cyndi-girls', 'PIb6AZdTr-A', 'Cyndi Lauper', 'Girls Just Want to Have Fun', 1983, 'CyndiLauperVEVO'],
  ['rick-never', 'dQw4w9WgXcQ', 'Rick Astley', 'Never Gonna Give You Up', 1987, 'RickAstleyYT'],
  ['tlc-waterfalls', '8WEtxJ4-sh4', 'TLC', 'Waterfalls', 1995, 'TLCVEVO'],
  ['spice-wannabe', 'gJLIiF15wjQ', 'Spice Girls', 'Wannabe', 1996, 'SpiceGirlsVEVO'],
  ['whitney-always', '3JWTaaS7LdU', 'Whitney Houston', 'I Will Always Love You', 1992, 'whitneyhoustonVEVO'],
];

export const TRACKS = Object.freeze(catalog.map(([id, videoId, artist, title, year, channel]) => Object.freeze({
  id, videoId, artist, title, year, decade: year < 1990 ? '80s' : '90s', channel,
  watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
})));

const POKEMON = Object.freeze({
  id: 'pokemon-pikachu', videoId: 'NIVKlYJp52c', artist: 'Pokémon',
  title: 'Ash Meets Pikachu', year: 1997, decade: '90s', channel: 'The Official Pokémon YouTube channel',
  watchUrl: 'https://www.youtube.com/watch?v=NIVKlYJp52c',
  note: 'Official Indigo League clip',
});
const TV_CHANNELS = Object.freeze([TRACKS[0], POKEMON, ...TRACKS.slice(1)]);
const activePlayers = new WeakMap();

function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function control(doc, text, className = '') {
  const node = el(doc, 'button', `media-button ${className}`.trim(), text);
  node.type = 'button';
  return node;
}
function link(doc, text, href) {
  const node = el(doc, 'a', 'media-link', text);
  node.href = href;
  node.target = '_blank';
  node.rel = 'noopener';
  return node;
}

/** Network is deferred until Play, or an explicitly requested opener gesture. */
function mountPlayer(container, kind, { initialTrack = 'bsb-iwant', autoplay = false } = {}) {
  const doc = container.ownerDocument, win = doc.defaultView;
  const controller = new win.AbortController();
  const { signal } = controller;
  const tracks = kind === 'music' ? TRACKS : TV_CHANNELS;
  let selected = tracks.find(track => track.id === initialTrack) || TRACKS[0];
  let side = selected.decade, iframe = null, destroyed = false;
  const root = el(doc, 'section', `media-root media-${kind}`);
  root.tabIndex = -1;
  root.setAttribute('aria-label', kind === 'music' ? 'Bedroom mixtape player' : 'Bedroom television');
  const heading = el(doc, 'div', 'media-heading');
  heading.append(el(doc, 'span', 'media-kicker', kind === 'music' ? 'A BEDROOM MIXTAPE' : 'JUST ONE MORE CHANNEL'), el(doc, 'span', 'media-brand', kind === 'music' ? "90's-club / STEREO" : "90's-club / COLOUR TV"));
  root.append(heading);

  const cassette = el(doc, 'div', 'media-cassette');
  const tapeTitle = el(doc, 'p', 'media-tape-title');
  if (kind === 'music') {
    cassette.setAttribute('aria-hidden', 'true');
    const tapeTop = el(doc, 'div', 'media-tape-top');
    tapeTop.append(el(doc, 'span', 'media-side-label', 'A / B'), el(doc, 'span', '', 'a few songs from back then'));
    const tapeWindow = el(doc, 'div', 'media-tape-window');
    tapeWindow.append(el(doc, 'span', 'media-reel'), el(doc, 'span', 'media-tape-bridge'), el(doc, 'span', 'media-reel'));
    const tapeBottom = el(doc, 'div', 'media-tape-bottom');
    tapeBottom.append(el(doc, 'span', '', 'HI • FI'), el(doc, 'span', 'media-request-label', 'READY'), el(doc, 'span', '', 'C 90'));
    cassette.append(tapeTop, tapeTitle, tapeWindow, tapeBottom);
    root.append(cassette);
  }

  const now = el(doc, 'div', 'media-now');
  const artist = el(doc, 'p', 'media-artist');
  const title = el(doc, 'h2', 'media-title');
  const year = el(doc, 'span', 'media-year');
  now.append(artist, title, year);
  root.append(now);
  const television = el(doc, 'div', kind === 'television' ? 'media-tv-cabinet' : 'media-video-cabinet');
  const screen = el(doc, 'div', 'media-player');
  const placeholder = el(doc, 'div', 'media-placeholder');
  placeholder.append(el(doc, 'span', 'media-placeholder-mark', kind === 'music' ? '▶' : 'TV'), el(doc, 'span', '', kind === 'music' ? 'A music video, right here.' : 'Pick a channel. Settle in.'), el(doc, 'small', '', 'Press Play to open YouTube.'));
  screen.append(placeholder);
  television.append(screen);
  if (kind === 'television') {
    const trim = el(doc, 'div', 'media-tv-trim');
    trim.setAttribute('aria-hidden', 'true');
    trim.append(el(doc, 'span', 'media-tv-led'), el(doc, 'span', '', 'COLOUR • STEREO'), el(doc, 'span', 'media-tv-grille'));
    television.append(trim);
  }
  root.append(television);

  const transport = el(doc, 'div', 'media-transport');
  const previous = control(doc, '◀', 'media-small-button');
  previous.setAttribute('aria-label', kind === 'music' ? 'Previous song' : 'Previous channel');
  const play = control(doc, kind === 'music' ? '▶ Play tape' : '▶ Turn on TV', 'media-play');
  const pauseButton = control(doc, kind === 'music' ? 'Ⅱ Pause' : '■ Turn off');
  pauseButton.disabled = true;
  const next = control(doc, '▶', 'media-small-button');
  next.setAttribute('aria-label', kind === 'music' ? 'Next song' : 'Next channel');
  transport.append(previous, play, pauseButton, next);
  const status = el(doc, 'p', 'media-status', 'Choose a favorite, then press Play.');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const fallback = link(doc, 'Watch on YouTube ↗', selected.watchUrl);
  fallback.setAttribute('aria-label', 'Watch the selected video on YouTube in a new tab');
  root.append(transport, status, fallback);
  if (kind === 'music') {
    const radio = el(doc, 'aside', 'media-radio-links');
    radio.setAttribute('aria-label', 'Live radio stations');
    radio.append(el(doc, 'p', '', 'Keep the radio on. Open a station in a new tab:'),
      link(doc, '80s · SomaFM Underground 80s ↗', 'https://somafm.com/u80s/'),
      link(doc, '90s · 90s90s Radio ↗', 'https://www.90s90s.de/'));
    radio.addEventListener('click', event => {
      if (event.target.closest('a')) pause('Mixtape paused. Your radio station opens in its own tab.');
    }, { signal });
    root.append(radio);
  }

  const playlist = el(doc, 'div', 'media-playlist');
  const filter = el(doc, 'div', 'media-side-tabs');
  filter.setAttribute('role', 'group');
  filter.setAttribute('aria-label', 'Mixtape side');
  const sides = [];
  if (kind === 'music') {
    for (const [value, label] of [['90s', 'SIDE A · 90s'], ['80s', 'SIDE B · 80s']]) {
      const tab = control(doc, label, 'media-side-tab');
      tab.addEventListener('click', () => { side = value; renderTracks(); }, { signal });
      sides.push([value, tab]);
      filter.append(tab);
    }
    playlist.append(filter);
  } else playlist.append(el(doc, 'p', 'media-list-label', 'CHANNEL GUIDE'));
  const list = el(doc, 'div', 'media-track-list');
  list.setAttribute('role', 'group');
  list.setAttribute('aria-label', kind === 'music' ? 'Choose a song' : 'Choose a channel');
  playlist.append(list);
  root.append(playlist);

  const privacy = el(doc, 'p', 'media-caption', 'Videos open in YouTube’s visible player. If a video will not play here, use Watch on YouTube. Availability and ads are controlled by YouTube.');
  const policies = el(doc, 'p', 'media-policy');
  policies.append(link(doc, 'YouTube Terms', 'https://www.youtube.com/t/terms'), doc.createTextNode(' · '), link(doc, 'Google Privacy', 'https://policies.google.com/privacy'));
  root.append(privacy, policies);
  container.append(root);

  function updateSelection() {
    artist.textContent = selected.artist;
    title.textContent = selected.title;
    year.textContent = selected.note || String(selected.year);
    tapeTitle.textContent = `${selected.artist} / ${selected.title}`;
    fallback.href = selected.watchUrl;
    renderTracks();
  }
  function renderTracks() {
    for (const [value, tab] of sides) tab.setAttribute('aria-pressed', String(value === side));
    list.replaceChildren();
    tracks.filter(track => kind !== 'music' || track.decade === side).forEach(track => {
      const item = control(doc, '', 'media-track');
      const number = tracks.indexOf(track) + 1;
      item.append(el(doc, 'span', 'media-track-number', String(number).padStart(2, '0')), el(doc, 'span', 'media-track-copy'), el(doc, 'span', 'media-track-year', track.note ? 'CLIP' : String(track.year)));
      const copy = item.children[1];
      copy.append(el(doc, 'strong', '', track.title), el(doc, 'span', '', track.artist));
      item.setAttribute('aria-pressed', String(track.id === selected.id));
      // Re-rendered rows own their listeners, so removed rows can be collected.
      item.addEventListener('click', () => selectTrack(track));
      list.append(item);
    });
  }
  function removeFrame() {
    if (iframe) { iframe.remove(); iframe = null; }
    placeholder.hidden = false;
    root.classList.remove('media-requested');
    pauseButton.disabled = true;
    play.textContent = kind === 'music' ? '▶ Play tape' : '▶ Turn on TV';
    const label = cassette.querySelector('.media-request-label');
    if (label) label.textContent = 'READY';
    if (activePlayers.get(doc) === api) activePlayers.delete(doc);
  }
  function pause(message) {
    if (destroyed) return;
    const hadFrame = !!iframe;
    removeFrame();
    if (hadFrame) status.textContent = typeof message === 'string' ? message : 'Paused. Play starts this video again from the beginning.';
  }
  function selectTrack(track) {
    pause();
    selected = track;
    side = track.decade;
    updateSelection();
    status.textContent = `${selected.title} is ready. Press Play when you like.`;
  }
  function step(direction) {
    const index = tracks.findIndex(track => track.id === selected.id);
    selectTrack(tracks[(index + direction + tracks.length) % tracks.length]);
  }
  function start() {
    if (destroyed || doc.hidden) return;
    screen.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
    // A dialog's opening transform scales its visual rect temporarily. The
    // embedded viewport uses layout dimensions, independent of that animation.
    if (screen.clientWidth < 200 || screen.clientHeight < 200) {
      status.textContent = 'Give the video a little more room, or choose Watch on YouTube.';
      return;
    }
    const other = activePlayers.get(doc);
    if (other && other !== api) other.pause('Paused while the other player is open.');
    removeFrame();
    const frame = el(doc, 'iframe', 'media-youtube');
    frame.title = `${selected.artist} — ${selected.title} · YouTube video player`;
    frame.width = '560';
    frame.height = '315';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = `https://www.youtube-nocookie.com/embed/${selected.videoId}?playsinline=1&controls=1&rel=0&autoplay=1`;
    frame.addEventListener('load', () => {
      if (iframe === frame && !destroyed) status.textContent = 'YouTube player opened. Press Play if available, or use Watch on YouTube.';
    }, { signal });
    frame.addEventListener('error', () => {
      if (iframe === frame && !destroyed) status.textContent = 'The video could not open here. Try Watch on YouTube.';
    }, { signal });
    iframe = frame;
    activePlayers.set(doc, api);
    placeholder.hidden = true;
    screen.append(frame);
    root.classList.add('media-requested');
    pauseButton.disabled = false;
    play.textContent = '↻ Restart video';
    const label = cassette.querySelector('.media-request-label');
    if (label) label.textContent = 'PLAY REQUESTED';
    status.textContent = 'Opening the YouTube player. Your browser may ask you to press Play inside the video.';
  }
  play.addEventListener('click', start, { signal });
  pauseButton.addEventListener('click', () => pause(), { signal });
  previous.addEventListener('click', () => step(-1), { signal });
  next.addEventListener('click', () => step(1), { signal });
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) pause('Paused while this page is hidden.'); }, { signal });
  const observer = win.IntersectionObserver ? new win.IntersectionObserver(entries => {
    // A queued batch may contain older opening/scrolling samples. Its final
    // observation describes the latest visible state, rather than any prior one.
    const latest = entries[entries.length - 1];
    if (iframe && latest && latest.intersectionRatio < 0.5) pause('Paused while the video is out of view. Bring it back and press Play.');
  }, { threshold: [0, 0.5] }) : null;
  observer?.observe(screen);
  const api = {
    pause,
    destroy() {
      if (destroyed) return;
      removeFrame();
      destroyed = true;
      controller.abort();
      observer?.disconnect();
      root.remove();
    },
  };
  updateSelection();
  // The host may request this only while opening the window from a user click.
  if (autoplay && (!win.navigator.userActivation || win.navigator.userActivation.isActive)) start();
  return api;
}

export function mountMusic(container, options = {}) { return mountPlayer(container, 'music', options); }
export function mountTelevision(container, options = {}) { return mountPlayer(container, 'television', options); }
