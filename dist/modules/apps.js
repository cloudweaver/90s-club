let instanceNumber = 0;

const COLORS = [
  ['Evergreen', '#235744'], ['Amber', '#e5a750'], ['Paper', '#f7f0dc'],
  ['Ink', '#293c38'], ['Tomato', '#cf755c'], ['Rose', '#d8a2a4'],
  ['Lake', '#719fa7'], ['Lilac', '#aaa0c1'], ['Moss', '#8d9c68'], ['Cloud', '#fffdf5'],
];

function element(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(doc, text, className = '') {
  const node = element(doc, 'button', `app-button ${className}`.trim(), text);
  node.type = 'button';
  return node;
}

function setup(container, name) {
  const doc = container.ownerDocument;
  const win = doc.defaultView;
  const controller = new win.AbortController();
  const root = element(doc, 'section', `app-surface app-${name}`);
  root.tabIndex = -1;
  root.setAttribute('aria-label', name === 'paint' ? 'Paint a little picture' : name === 'notes' ? 'Your little notepad' : 'Quiet radio');
  container.append(root);
  return { doc, win, root, signal: controller.signal, dispose: () => { controller.abort(); root.remove(); } };
}

function statusLine(doc, text) {
  const node = element(doc, 'p', 'app-status', text);
  node.setAttribute('role', 'status');
  node.setAttribute('aria-live', 'polite');
  return node;
}

/** A deliberately small bitmap editor. All drawing and storage stay in-browser. */
export function mountPaint(container, options = {}) {
  const { doc, win, root, signal, dispose } = setup(container, 'paint');
  const width = 320, height = 200, paper = '#f7f0dc';
  const storageKey = options.storageKey || 'offline-club.paint.v1';
  const persist = options.persist !== false;
  let destroyed = false, touched = false, saveTimer = null, drawing = false;
  let pointerId = null, lastPoint = null, color = COLORS[0][1], erasing = false, brushSize = 4;
  let keyboardPoint = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  const history = [];

  const intro = element(doc, 'p', 'app-intro', 'A blank page. A few good colours. See where your hand goes.');
  const palette = element(doc, 'div', 'app-palette');
  palette.setAttribute('role', 'group');
  palette.setAttribute('aria-label', 'Paint colours');
  const swatches = COLORS.map(([name, value], index) => {
    const swatch = button(doc, '', 'app-swatch');
    swatch.style.setProperty('--app-swatch', value);
    swatch.title = name;
    swatch.setAttribute('aria-label', name);
    swatch.setAttribute('aria-pressed', String(index === 0));
    swatch.addEventListener('click', () => {
      color = value;
      erasing = false;
      updateTools();
    }, { signal });
    palette.append(swatch);
    return swatch;
  });

  const toolbar = element(doc, 'div', 'app-toolbar');
  const sizeLabel = element(doc, 'label', 'app-field', 'Brush ');
  const size = element(doc, 'select', 'app-select');
  size.setAttribute('aria-label', 'Brush size');
  for (const [value, text] of [[1, 'Tiny'], [4, 'Small'], [8, 'Medium'], [16, 'Big']]) {
    const option = element(doc, 'option', '', text);
    option.value = String(value);
    option.selected = value === brushSize;
    size.append(option);
  }
  size.addEventListener('change', () => { brushSize = Number(size.value); updateCursor(); }, { signal });
  sizeLabel.append(size);
  const erase = button(doc, 'Eraser');
  erase.setAttribute('aria-pressed', 'false');
  erase.addEventListener('click', () => { erasing = !erasing; updateTools(); }, { signal });
  const undo = button(doc, 'Undo');
  undo.disabled = true;
  const clear = button(doc, 'Clear page');
  const download = button(doc, 'Save PNG', 'app-button-accent');
  toolbar.append(sizeLabel, erase, undo, clear, download);

  const frame = element(doc, 'div', 'app-canvas-frame');
  const canvas = element(doc, 'canvas', 'app-canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'Drawing canvas. Use a pointer to paint, or arrow keys to move and Space to make a mark.');
  canvas.textContent = 'This browser does not support canvas drawing.';
  const cursor = element(doc, 'span', 'app-canvas-cursor');
  cursor.setAttribute('aria-hidden', 'true');
  frame.append(canvas, cursor);
  const hint = element(doc, 'p', 'app-caption', 'Make a mark, not a masterpiece. Keyboard: arrows move · Space paints · Ctrl/⌘ Z undoes.');
  const status = statusLine(doc, persist ? 'Your picture can stay on this browser.' : 'A small picture, just for this visit.');
  root.append(intro, palette, toolbar, frame, hint, status);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    for (const control of [...swatches, size, erase, undo, clear, download]) control.disabled = true;
    status.textContent = 'Drawing is not available in this browser. The notepad is still a good place to start.';
    return { destroy() { destroyed = true; dispose(); } };
  }
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);

  function updateTools() {
    swatches.forEach((swatch, index) => swatch.setAttribute('aria-pressed', String(!erasing && COLORS[index][1] === color)));
    erase.setAttribute('aria-pressed', String(erasing));
    canvas.style.cursor = erasing ? 'cell' : 'crosshair';
  }

  function updateCursor() {
    cursor.style.left = `${keyboardPoint.x / width * 100}%`;
    cursor.style.top = `${keyboardPoint.y / height * 100}%`;
    cursor.style.width = `${brushSize / width * 100}%`;
    cursor.style.height = `${brushSize / height * 100}%`;
  }

  function remember() {
    history.push(ctx.getImageData(0, 0, width, height));
    if (history.length > 12) history.shift();
    undo.disabled = false;
    touched = true;
  }

  function saveNow() {
    if (!persist || !touched) return;
    try {
      win.localStorage.setItem(storageKey, canvas.toDataURL('image/png'));
      status.textContent = 'Picture saved locally on this browser.';
    } catch {
      status.textContent = 'Your picture is here for this visit. Local saving is unavailable; Save PNG keeps a copy.';
    }
  }

  function saveSoon() {
    if (saveTimer !== null) win.clearTimeout(saveTimer);
    if (persist) saveTimer = win.setTimeout(() => { saveTimer = null; saveNow(); }, 350);
  }

  function mark(point) {
    ctx.fillStyle = erasing ? paper : color;
    ctx.fillRect(point.x - Math.floor(brushSize / 2), point.y - Math.floor(brushSize / 2), brushSize, brushSize);
  }

  function line(from, to) {
    const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);
    for (let i = 0; i <= steps; i++) {
      mark({ x: Math.round(from.x + (to.x - from.x) * i / steps), y: Math.round(from.y + (to.y - from.y) * i / steps) });
    }
  }

  function pointFrom(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(width - 1, Math.floor((event.clientX - rect.left) / rect.width * width))),
      y: Math.max(0, Math.min(height - 1, Math.floor((event.clientY - rect.top) / rect.height * height))),
    };
  }

  function stopDrawing(event) {
    if (!drawing || (event && event.pointerId !== pointerId)) return;
    drawing = false;
    if (canvas.hasPointerCapture?.(pointerId)) canvas.releasePointerCapture(pointerId);
    pointerId = null;
    lastPoint = null;
    saveSoon();
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (drawing || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    root.classList.remove('app-keyboard-drawing');
    remember();
    drawing = true;
    pointerId = event.pointerId;
    lastPoint = pointFrom(event);
    mark(lastPoint);
    try { canvas.setPointerCapture(event.pointerId); } catch { /* A cancelled pointer may already be gone. */ }
  }, { signal });
  canvas.addEventListener('pointermove', (event) => {
    if (!drawing || event.pointerId !== pointerId) return;
    event.preventDefault();
    const point = pointFrom(event);
    line(lastPoint, point);
    lastPoint = point;
  }, { signal });
  canvas.addEventListener('pointerup', stopDrawing, { signal });
  canvas.addEventListener('pointercancel', stopDrawing, { signal });
  canvas.addEventListener('lostpointercapture', stopDrawing, { signal });
  canvas.addEventListener('blur', () => root.classList.remove('app-keyboard-drawing'), { signal });
  canvas.addEventListener('keydown', (event) => {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      const step = event.shiftKey ? 8 : 1;
      keyboardPoint.x = Math.max(0, Math.min(width - 1, keyboardPoint.x + direction[0] * step));
      keyboardPoint.y = Math.max(0, Math.min(height - 1, keyboardPoint.y + direction[1] * step));
      root.classList.add('app-keyboard-drawing');
      updateCursor();
    } else if (event.code === 'Space' || event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) remember();
      mark(keyboardPoint);
      root.classList.add('app-keyboard-drawing');
      updateCursor();
      saveSoon();
    }
  }, { signal });

  function undoMark() {
    if (!history.length) return;
    stopDrawing();
    ctx.putImageData(history.pop(), 0, 0);
    undo.disabled = history.length === 0;
    status.textContent = 'One little step back.';
    saveSoon();
  }
  undo.addEventListener('click', undoMark, { signal });
  root.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      undoMark();
    }
  }, { signal });
  clear.addEventListener('click', () => {
    remember();
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, height);
    status.textContent = 'A fresh page. Undo brings your picture back.';
    saveSoon();
  }, { signal });
  download.addEventListener('click', () => {
    try {
      const link = element(doc, 'a');
      link.href = canvas.toDataURL('image/png');
      link.download = '90s-club-picture.png';
      doc.body.append(link);
      link.click();
      link.remove();
      status.textContent = 'A little picture to take with you.';
    } catch {
      status.textContent = 'The picture could not be downloaded in this browser.';
    }
  }, { signal });

  if (persist) {
    try {
      const saved = win.localStorage.getItem(storageKey);
      if (saved && saved.length < 600_000 && saved.startsWith('data:image/png;base64,')) {
        const image = new win.Image();
        image.onload = () => {
          if (!destroyed && !touched) {
            ctx.drawImage(image, 0, 0, width, height);
            status.textContent = 'Your last picture was waiting for you.';
          }
        };
        image.src = saved;
      }
    } catch { status.textContent = 'Local saving is unavailable. Save PNG can keep your picture.'; }
  }
  updateCursor();
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (saveTimer !== null) win.clearTimeout(saveTimer);
      stopDrawing();
      if (saveTimer !== null) win.clearTimeout(saveTimer);
      saveNow();
      history.length = 0;
      dispose();
    },
  };
}

/** A notepad with local persistence and a reversible clear action. */
export function mountNotes(container, options = {}) {
  const { doc, win, root, signal, dispose } = setup(container, 'notes');
  const storageKey = options.storageKey || 'offline-club.notes.v1';
  const inputId = `app-note-${++instanceNumber}`;
  let saveTimer = null, clearedNote = null, destroyed = false;
  const label = element(doc, 'label', 'app-note-label', 'A thought worth keeping');
  label.htmlFor = inputId;
  const textarea = element(doc, 'textarea', 'app-notepad');
  textarea.id = inputId;
  textarea.placeholder = 'A tiny plan. A half-remembered dream. A list of nice things.\n\nThere is room for all of it here.';
  textarea.spellcheck = true;
  textarea.setAttribute('aria-describedby', `${inputId}-privacy`);
  const footer = element(doc, 'div', 'app-note-footer');
  const actions = element(doc, 'div', 'app-toolbar');
  const clear = button(doc, 'Clear note');
  const restore = button(doc, 'Undo clear');
  restore.disabled = true;
  const count = element(doc, 'span', 'app-note-count');
  const status = statusLine(doc, 'Notes are saved locally on this browser.');
  const privacy = element(doc, 'p', 'app-caption', 'Just a note to yourself. Stored on this browser.');
  privacy.id = `${inputId}-privacy`;
  actions.append(clear, restore);
  footer.append(actions, count);
  root.append(label, textarea, footer, status, privacy);
  let storageAvailable = true;
  try {
    const saved = win.localStorage.getItem(storageKey);
    textarea.value = saved ?? (typeof options.initialText === 'string' ? options.initialText : '');
  } catch {
    storageAvailable = false;
    textarea.value = typeof options.initialText === 'string' ? options.initialText : '';
    status.textContent = 'Your note stays for this visit. Local saving is unavailable.';
  }

  function updateCount() {
    const length = textarea.value.length;
    count.textContent = `${length.toLocaleString()} character${length === 1 ? '' : 's'}`;
    clear.disabled = length === 0;
  }
  function save() {
    if (saveTimer !== null) { win.clearTimeout(saveTimer); saveTimer = null; }
    try {
      win.localStorage.setItem(storageKey, textarea.value);
      storageAvailable = true;
      status.textContent = 'Saved locally. Your thought can wait here.';
    } catch {
      storageAvailable = false;
      status.textContent = 'Your note stays for this visit. Local saving is unavailable.';
    }
  }
  function queueSave() {
    updateCount();
    if (storageAvailable) status.textContent = 'Saving your little thought…';
    if (saveTimer !== null) win.clearTimeout(saveTimer);
    saveTimer = win.setTimeout(save, 350);
  }
  textarea.addEventListener('input', queueSave, { signal });
  textarea.addEventListener('blur', save, { signal });
  clear.addEventListener('click', () => {
    if (!textarea.value) return;
    clearedNote = textarea.value;
    textarea.value = '';
    restore.disabled = false;
    queueSave();
    textarea.focus();
  }, { signal });
  restore.addEventListener('click', () => {
    if (clearedNote === null) return;
    // Keep any new writing made since Clear instead of replacing it silently.
    textarea.value = textarea.value ? `${clearedNote}\n\n${textarea.value}` : clearedNote;
    clearedNote = null;
    restore.disabled = true;
    queueSave();
    textarea.focus();
  }, { signal });
  updateCount();
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      save();
      dispose();
    },
  };
}

function makeNoise(context) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 3), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  return buffer;
}

function makeRadioScene(context, track, destination) {
  const nodes = [], sources = [];
  const keep = (node) => { nodes.push(node); return node; };
  const noise = keep(context.createBufferSource());
  noise.buffer = makeNoise(context);
  noise.loop = true;
  const highpass = keep(context.createBiquadFilter());
  highpass.type = 'highpass';
  highpass.frequency.value = track === 'rain' ? 420 : 900;
  const lowpass = keep(context.createBiquadFilter());
  lowpass.type = 'lowpass';
  lowpass.frequency.value = track === 'rain' ? 3200 : 1600;
  const noiseGain = keep(context.createGain());
  noiseGain.gain.value = track === 'rain' ? 0.22 : 0.045;
  noise.connect(highpass).connect(lowpass).connect(noiseGain).connect(destination);
  sources.push(noise);
  const pitches = track === 'rain' ? [130.81, 196] : [110, 164.81, 220];
  pitches.forEach((pitch, index) => {
    const tone = keep(context.createOscillator());
    tone.type = 'sine';
    tone.frequency.value = pitch;
    tone.detune.value = index % 2 ? 3 : -3;
    const gain = keep(context.createGain());
    gain.gain.value = track === 'rain' ? 0.014 : 0.032;
    const lfo = keep(context.createOscillator());
    lfo.frequency.value = 0.07 + index * 0.033;
    const depth = keep(context.createGain());
    depth.gain.value = track === 'rain' ? 0.007 : 0.014;
    lfo.connect(depth).connect(gain.gain);
    tone.connect(gain).connect(destination);
    sources.push(tone, lfo);
  });
  for (const source of sources) source.start();
  return {
    destroy() {
      for (const source of sources) { try { source.stop(); } catch { /* Already stopped. */ } }
      for (const node of nodes) { try { node.disconnect(); } catch { /* Already disconnected. */ } }
    },
  };
}

/** A user-started procedural radio: no files, streams, or automatic playback. */
export function mountRadio(container, options = {}) {
  const { doc, win, root, signal, dispose } = setup(container, 'radio');
  const AudioContextClass = win.AudioContext || win.webkitAudioContext;
  let context = null, master = null, scene = null, stopTimer = null;
  let playing = false, starting = false, muted = false, destroyed = false, generation = 0;
  const radioFace = element(doc, 'div', 'app-radio-face');
  radioFace.setAttribute('aria-hidden', 'true');
  const brand = element(doc, 'span', 'app-radio-brand', 'OFFLINE FM');
  const dial = element(doc, 'div', 'app-radio-dial');
  for (const frequency of ['88', '92', '96', '100', '104', '108']) dial.append(element(doc, 'span', '', frequency));
  const lamp = element(doc, 'span', 'app-radio-lamp');
  const speakers = element(doc, 'div', 'app-radio-speakers');
  speakers.append(element(doc, 'span', 'app-radio-speaker'), element(doc, 'span', 'app-radio-speaker'));
  radioFace.append(brand, dial, lamp, speakers);
  const intro = element(doc, 'p', 'app-intro', 'Something soft in the background. Nothing you need to keep up with.');
  const channelLabel = element(doc, 'label', 'app-field app-radio-channel', 'Tune in to ');
  const channel = element(doc, 'select', 'app-select');
  for (const [value, text] of [['rain', 'Rain on the window'], ['modem', 'Late-night modem']]) {
    const option = element(doc, 'option', '', text);
    option.value = value;
    channel.append(option);
  }
  channelLabel.append(channel);
  const controls = element(doc, 'div', 'app-radio-controls');
  const play = button(doc, '▶ Play', 'app-button-accent app-radio-play');
  play.setAttribute('aria-pressed', 'false');
  const mute = button(doc, 'Mute');
  mute.setAttribute('aria-pressed', 'false');
  const volumeLabel = element(doc, 'label', 'app-field app-volume', 'Volume ');
  const volume = element(doc, 'input', 'app-range');
  volume.type = 'range';
  volume.min = '0'; volume.max = '100'; volume.step = '1'; volume.value = '25';
  volume.setAttribute('aria-label', 'Radio volume');
  const volumeValue = element(doc, 'span', 'app-volume-value', '25%');
  volumeLabel.append(volume, volumeValue);
  controls.append(play, mute, volumeLabel);
  const status = statusLine(doc, 'The room is quiet. Press Play whenever you like.');
  root.append(radioFace, intro, channelLabel, controls, status, element(doc, 'p', 'app-caption', 'Made from gentle noise and simple tones, right here in your browser.'));
  if (!AudioContextClass) {
    play.disabled = true;
    mute.disabled = true;
    volume.disabled = true;
    status.textContent = 'This browser cannot play the radio. A little quiet is welcome here, too.';
  }

  function volumeTarget() { return muted ? 0 : Number(volume.value) / 100 * 0.38; }
  function adjustVolume() {
    volumeValue.textContent = `${volume.value}%`;
    if (!master || !context) return;
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(playing ? volumeTarget() : 0, now + 0.18);
  }
  function updatePlayback() {
    play.disabled = !AudioContextClass || starting;
    play.textContent = starting ? 'Tuning in…' : playing ? 'Ⅱ Pause' : '▶ Play';
    play.setAttribute('aria-pressed', String(playing));
    root.classList.toggle('app-radio-playing', playing && !muted && Number(volume.value) > 0);
  }
  function clearStopTimer() {
    if (stopTimer !== null) { win.clearTimeout(stopTimer); stopTimer = null; }
  }
  async function start() {
    if (destroyed || playing || starting || !AudioContextClass) return;
    const token = ++generation;
    starting = true;
    clearStopTimer();
    updatePlayback();
    try {
      if (!context) {
        context = new AudioContextClass();
        master = context.createGain();
        master.gain.value = 0;
        master.connect(context.destination);
      }
      await context.resume();
      if (destroyed || token !== generation) return;
      if (context.state !== 'running') throw new Error('Audio did not start');
      if (scene) scene.destroy();
      scene = makeRadioScene(context, channel.value, master);
      starting = false;
      playing = true;
      adjustVolume();
      updatePlayback();
      status.textContent = `${channel.options[channel.selectedIndex].text}. A small soundtrack for right now.`;
    } catch {
      if (destroyed || token !== generation) return;
      starting = false;
      playing = false;
      if (scene) { scene.destroy(); scene = null; }
      updatePlayback();
      status.textContent = 'The radio could not start here. You can try Play again whenever you like.';
    }
  }
  function pause() {
    if (destroyed) return;
    const token = ++generation;
    starting = false;
    playing = false;
    updatePlayback();
    status.textContent = 'Paused. There is no hurry to press Play.';
    clearStopTimer();
    if (!context) return;
    adjustVolume();
    stopTimer = win.setTimeout(() => {
      stopTimer = null;
      if (destroyed || generation !== token) return;
      if (scene) { scene.destroy(); scene = null; }
      context.suspend().catch(() => {});
    }, 220);
  }
  play.addEventListener('click', () => { if (playing) pause(); else void start(); }, { signal });
  channel.addEventListener('change', () => {
    if (playing) {
      pause();
      void start();
    } else status.textContent = `${channel.options[channel.selectedIndex].text} is ready when you are.`;
  }, { signal });
  volume.addEventListener('input', () => { adjustVolume(); updatePlayback(); }, { signal });
  mute.addEventListener('click', () => {
    muted = !muted;
    mute.textContent = muted ? 'Unmute' : 'Mute';
    mute.setAttribute('aria-pressed', String(muted));
    adjustVolume();
    updatePlayback();
  }, { signal });
  doc.addEventListener('visibilitychange', () => { if (doc.hidden && (playing || starting)) pause(); }, { signal });
  return {
    pause,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      generation++;
      clearStopTimer();
      if (scene) { scene.destroy(); scene = null; }
      if (master) { try { master.disconnect(); } catch { /* Already disconnected. */ } }
      if (context && context.state !== 'closed') context.close().catch(() => {});
      dispose();
    },
  };
}
