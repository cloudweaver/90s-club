const CREAM = '#f7f0dc';
const GREEN = '#235744';
const AMBER = '#e5a750';
const INK = '#343b32';
const DIRECTIONS = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const KEY_DIRECTION = { ArrowUp: 'up', w: 'up', W: 'up', ArrowRight: 'right', d: 'right', D: 'right', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left' };

function integer(value, minimum, label) {
  if (!Number.isInteger(value) || value < minimum) throw new RangeError(`${label} must be an integer of at least ${minimum}`);
}

function randomIndex(length, random) {
  return Math.min(length - 1, Math.max(0, Math.floor(random() * length)));
}

function snakeFood(body, cols, rows, random) {
  const occupied = new Set(body.map(([x, y]) => `${x},${y}`));
  const empty = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!occupied.has(`${x},${y}`)) empty.push([x, y]);
  return empty.length ? empty[randomIndex(empty.length, random)] : null;
}

export function createSnakeState(cols = 20, rows = 16, random = Math.random) {
  integer(cols, 4, 'Columns'); integer(rows, 4, 'Rows');
  const x = Math.floor(cols / 2), y = Math.floor(rows / 2);
  const body = [[x, y], [x - 1, y], [x - 2, y]];
  return { cols, rows, body, direction: 'right', food: snakeFood(body, cols, rows, random), score: 0, status: 'ready' };
}

/** One immutable movement tick. Moving into the vacated tail square is legal. */
export function stepSnake(state, requestedDirection = state.direction, random = Math.random) {
  if (state.status === 'lost' || state.status === 'won') return state;
  const direction = DIRECTIONS[requestedDirection] && requestedDirection !== OPPOSITE[state.direction] ? requestedDirection : state.direction;
  const [dx, dy] = DIRECTIONS[direction];
  const head = [state.body[0][0] + dx, state.body[0][1] + dy];
  const eating = Boolean(state.food && head[0] === state.food[0] && head[1] === state.food[1]);
  const solidBody = eating ? state.body : state.body.slice(0, -1);
  const collision = head[0] < 0 || head[1] < 0 || head[0] >= state.cols || head[1] >= state.rows || solidBody.some(([x, y]) => x === head[0] && y === head[1]);
  if (collision) return { ...state, direction, status: 'lost' };
  const body = [head, ...state.body.map(point => [...point])];
  if (!eating) body.pop();
  const food = eating ? snakeFood(body, state.cols, state.rows, random) : state.food;
  return { ...state, body, direction, food, score: state.score + (eating ? 10 : 0), status: food ? 'running' : 'won' };
}

export function mineNeighbors(index, rows = 9, cols = 9) {
  const result = [], row = Math.floor(index / cols), col = index % cols;
  for (let y = row - 1; y <= row + 1; y++) for (let x = col - 1; x <= col + 1; x++) {
    if (y >= 0 && y < rows && x >= 0 && x < cols && !(y === row && x === col)) result.push(y * cols + x);
  }
  return result;
}

/** Places mines outside the first square and its neighbors, without retries. */
export function createMinefield(rows = 9, cols = 9, count = 10, firstIndex = 0, random = Math.random) {
  integer(rows, 1, 'Rows'); integer(cols, 1, 'Columns'); integer(count, 0, 'Mine count');
  if (!Number.isInteger(firstIndex) || firstIndex < 0 || firstIndex >= rows * cols) throw new RangeError('First square is outside the board');
  const excluded = new Set([firstIndex, ...mineNeighbors(firstIndex, rows, cols)]);
  const available = Array.from({ length: rows * cols }, (_, i) => i).filter(i => !excluded.has(i));
  if (count > available.length) throw new RangeError('Too many mines for a safe opening');
  for (let i = available.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, random);
    [available[i], available[j]] = [available[j], available[i]];
  }
  const mines = new Set(available.slice(0, count));
  return Array.from({ length: rows * cols }, (_, i) => ({
    mine: mines.has(i), adjacent: mineNeighbors(i, rows, cols).filter(n => mines.has(n)).length,
    revealed: false, flagged: false, exploded: false,
  }));
}

/** Flood-reveals empty regions. Flags prevent reveals and never count as a win. */
export function revealMinefield(cells, index, rows = 9, cols = 9) {
  const board = cells.map(cell => ({ ...cell }));
  const target = board[index];
  if (!target || target.flagged || target.revealed) return { board, status: board.every(cell => cell.mine || cell.revealed) ? 'won' : 'playing' };
  if (target.mine) {
    target.exploded = true;
    for (const cell of board) if (cell.mine) cell.revealed = true;
    return { board, status: 'lost' };
  }
  const pending = [index];
  while (pending.length) {
    const current = pending.pop(), cell = board[current];
    if (!cell || cell.mine || cell.flagged || cell.revealed) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) pending.push(...mineNeighbors(current, rows, cols));
  }
  return { board, status: board.every(cell => cell.mine || cell.revealed) ? 'won' : 'playing' };
}

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

export function createPaddleState() {
  return { width: 400, height: 280, paddleHeight: 52, leftY: 114, rightY: 114,
    leftScore: 0, rightScore: 0, ball: { x: 200, y: 140, vx: 170, vy: 60 }, status: 'ready', event: null };
}

/** A bounded physics step, independent of the DOM or animation clock. */
export function stepPaddle(state, seconds, input = {}) {
  if (state.status !== 'running') return state;
  const dt = clamp(Number.isFinite(seconds) ? seconds : 0, 0, 0.035);
  const next = { ...state, ball: { ...state.ball }, event: null };
  const half = next.paddleHeight / 2;
  if (Number.isFinite(input.targetY)) next.leftY = clamp(input.targetY - half, 0, next.height - next.paddleHeight);
  else next.leftY = clamp(next.leftY + (input.axis || 0) * 240 * dt, 0, next.height - next.paddleHeight);
  const aiDelta = next.ball.y - (next.rightY + half);
  next.rightY = clamp(next.rightY + clamp(aiDelta, -108 * dt, 108 * dt), 0, next.height - next.paddleHeight);
  const ball = next.ball, oldX = ball.x, radius = 4;
  ball.x += ball.vx * dt; ball.y += ball.vy * dt;
  if (ball.y < radius) { ball.y = radius; ball.vy = Math.abs(ball.vy); next.event = 'move'; }
  if (ball.y > next.height - radius) { ball.y = next.height - radius; ball.vy = -Math.abs(ball.vy); next.event = 'move'; }
  if (ball.vx < 0 && oldX - radius >= 22 && ball.x - radius <= 22 && ball.y + radius >= next.leftY && ball.y - radius <= next.leftY + next.paddleHeight) {
    ball.x = 26; ball.vx = Math.min(270, Math.abs(ball.vx) + 6); ball.vy = ((ball.y - next.leftY - half) / half) * 180; next.event = 'move';
  }
  if (ball.vx > 0 && oldX + radius <= next.width - 22 && ball.x + radius >= next.width - 22 && ball.y + radius >= next.rightY && ball.y - radius <= next.rightY + next.paddleHeight) {
    ball.x = next.width - 26; ball.vx = -Math.min(270, Math.abs(ball.vx) + 6); ball.vy = ((ball.y - next.rightY - half) / half) * 180; next.event = 'move';
  }
  if (ball.x < -radius || ball.x > next.width + radius) {
    const playerScored = ball.x > next.width;
    if (playerScored) next.leftScore++; else next.rightScore++;
    next.ball = { x: next.width / 2, y: next.height / 2, vx: playerScored ? 170 : -170, vy: next.leftScore % 2 ? -60 : 60 };
    next.event = 'score';
    if (next.leftScore >= 5 || next.rightScore >= 5) next.status = 'won';
  }
  return next;
}

function lifecycle(container) {
  const document = container.ownerDocument, view = document.defaultView;
  const listeners = [], originalTabindex = container.getAttribute('tabindex');
  if (originalTabindex === null) container.tabIndex = 0;
  return {
    document, view,
    listen(target, name, fn, options) { target.addEventListener(name, fn, options); listeners.push(() => target.removeEventListener(name, fn, options)); },
    focused() { return container === document.activeElement || container.contains(document.activeElement); },
    focus() { container.focus({ preventScroll: true }); },
    destroy() {
      listeners.forEach(remove => remove());
      if (originalTabindex === null) container.removeAttribute('tabindex'); else container.setAttribute('tabindex', originalTabindex);
      container.replaceChildren();
    },
  };
}

function canvasContext(canvas) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This game needs a browser with canvas support.');
  context.imageSmoothingEnabled = false;
  return context;
}

function overlay(context, width, height, title, detail) {
  context.fillStyle = 'rgba(247,240,220,.90)'; context.fillRect(24, height / 2 - 42, width - 48, 84);
  context.strokeStyle = GREEN; context.lineWidth = 1; context.strokeRect(24.5, height / 2 - 41.5, width - 49, 83);
  context.textAlign = 'center'; context.fillStyle = GREEN; context.font = 'bold 17px monospace'; context.fillText(title, width / 2, height / 2 - 6);
  context.fillStyle = INK; context.font = '11px monospace'; context.fillText(detail, width / 2, height / 2 + 17);
}

function sound(options, name) { options.onSound?.(name); }

export function mountSnake(container, options = {}) {
  const life = lifecycle(container);
  container.innerHTML = `<section class="oc-game oc-snake"><div class="oc-game-top"><span>GARDEN SNAKE</span><output aria-live="polite">Score 000</output></div><canvas width="400" height="320" tabindex="0" aria-label="Garden Snake. Use arrow keys or W A S D to collect seeds. Walls and your tail end the round."></canvas><div class="oc-game-controls"><button type="button" data-action="start">Start</button><button type="button" data-action="pause" disabled>Pause</button><button type="button" data-action="reset">New game</button></div><div class="oc-direction-pad" aria-label="Direction controls"><button type="button" data-direction="up" aria-label="Move up">↑</button><button type="button" data-direction="left" aria-label="Move left">←</button><button type="button" data-direction="down" aria-label="Move down">↓</button><button type="button" data-direction="right" aria-label="Move right">→</button></div><p class="oc-game-hint">Arrows / WASD · Space to pause</p><p class="oc-game-status" role="status">Ready when you are.</p></section>`;
  const canvas = container.querySelector('canvas'), context = canvasContext(canvas);
  const output = container.querySelector('output'), startButton = container.querySelector('[data-action="start"]');
  const pauseButton = container.querySelector('[data-action="pause"]'), message = container.querySelector('.oc-game-status');
  let state = createSnakeState(), requested = state.direction, timer = null, destroyed = false;

  function stopTimer() { if (timer !== null) life.view.clearInterval(timer); timer = null; }
  function draw() {
    context.fillStyle = CREAM; context.fillRect(0, 0, 400, 320);
    context.fillStyle = '#e9e5ce';
    for (let y = 0; y < 16; y++) for (let x = 0; x < 20; x++) context.fillRect(x * 20 + 9, y * 20 + 9, 1, 1);
    if (state.food) { const [x, y] = state.food; context.fillStyle = AMBER; context.fillRect(x * 20 + 6, y * 20 + 4, 8, 12); context.fillRect(x * 20 + 4, y * 20 + 6, 12, 8); }
    state.body.forEach(([x, y], i) => { context.fillStyle = i ? '#4b7860' : GREEN; context.fillRect(x * 20 + 2, y * 20 + 2, 16, 16); });
    const [hx, hy] = state.body[0], [dx, dy] = DIRECTIONS[state.direction];
    context.fillStyle = CREAM;
    if (dx) { context.fillRect(hx * 20 + (dx > 0 ? 13 : 4), hy * 20 + 5, 3, 3); context.fillRect(hx * 20 + (dx > 0 ? 13 : 4), hy * 20 + 12, 3, 3); }
    else { context.fillRect(hx * 20 + 5, hy * 20 + (dy > 0 ? 13 : 4), 3, 3); context.fillRect(hx * 20 + 12, hy * 20 + (dy > 0 ? 13 : 4), 3, 3); }
    if (state.status === 'ready') overlay(context, 400, 320, 'A little garden wander.', 'Press Start to begin');
    if (state.status === 'paused') overlay(context, 400, 320, 'Taking a breather.', 'Resume whenever you like');
    if (state.status === 'lost') overlay(context, 400, 320, 'A lovely little run.', `${state.score} points · New game to try again`);
    if (state.status === 'won') overlay(context, 400, 320, 'The garden is full!', 'Every seed collected. Beautiful.');
    output.textContent = `Score ${String(state.score).padStart(3, '0')}`;
    startButton.textContent = state.status === 'paused' ? 'Resume' : 'Start';
    startButton.disabled = state.status === 'running' || state.status === 'lost' || state.status === 'won';
    pauseButton.disabled = state.status !== 'running';
  }
  function tick() {
    const priorScore = state.score;
    state = stepSnake(state, requested); requested = state.direction;
    if (state.score > priorScore) sound(options, 'score');
    if (state.status === 'lost' || state.status === 'won') {
      stopTimer(); sound(options, state.status === 'won' ? 'win' : 'lose');
      message.textContent = state.status === 'won' ? 'You filled the garden!' : `Round complete. ${state.score} points.`;
    }
    draw();
  }
  function start() {
    if (destroyed || !['ready', 'paused'].includes(state.status) || life.document.hidden) return;
    state = { ...state, status: 'running' }; stopTimer(); timer = life.view.setInterval(tick, 145);
    message.textContent = 'Collect seeds. Watch the edges.'; sound(options, 'start'); draw();
  }
  function pause() {
    if (state.status !== 'running') return;
    stopTimer(); state = { ...state, status: 'paused' }; message.textContent = 'Paused. Your garden can wait.'; draw();
  }
  function reset() { stopTimer(); state = createSnakeState(); requested = state.direction; message.textContent = 'A fresh patch of garden.'; draw(); }
  function turn(direction) { if (direction !== OPPOSITE[state.direction]) requested = direction; }
  life.listen(container, 'click', event => {
    const button = event.target.closest('button'); if (!button || !container.contains(button)) return;
    if (button.dataset.direction) turn(button.dataset.direction);
    if (button.dataset.action === 'start') start();
    if (button.dataset.action === 'pause') pause();
    if (button.dataset.action === 'reset') reset();
  });
  life.listen(canvas, 'pointerdown', () => life.focus());
  life.listen(container, 'keydown', event => {
    if (!life.focused()) return;
    if (KEY_DIRECTION[event.key]) { event.preventDefault(); turn(KEY_DIRECTION[event.key]); }
    if (event.code === 'Space' && event.target.tagName !== 'BUTTON') { event.preventDefault(); state.status === 'running' ? pause() : start(); }
  });
  life.listen(life.document, 'visibilitychange', () => { if (life.document.hidden) pause(); });
  draw();
  return { pause, destroy() { destroyed = true; stopTimer(); life.destroy(); } };
}

export function mountMines(container, options = {}) {
  const life = lifecycle(container);
  container.innerHTML = `<section class="oc-game oc-mines"><div class="oc-game-top"><span>MEADOW MINES</span><output aria-live="polite">10 flags left</output><span class="oc-mine-time" aria-label="Elapsed seconds">000 s</span></div><div class="oc-game-controls"><button type="button" data-action="reset">New meadow</button><button type="button" data-action="flag" aria-pressed="false">Flag mode: off</button><button type="button" data-action="pause" disabled>Pause</button></div><div class="oc-mine-grid" role="grid" aria-label="Nine by nine minefield. Arrow keys navigate, Enter reveals, F flags." aria-rowcount="9" aria-colcount="9"></div><p class="oc-game-hint">Click to reveal · Right-click / F to flag</p><p class="oc-game-status" role="status">Choose a square to begin.</p></section>`;
  const grid = container.querySelector('.oc-mine-grid'), output = container.querySelector('output');
  const clock = container.querySelector('.oc-mine-time'), message = container.querySelector('.oc-game-status');
  const flagButton = container.querySelector('[data-action="flag"]'), pauseButton = container.querySelector('[data-action="pause"]');
  let gridRow;
  const squares = Array.from({ length: 81 }, (_, index) => {
    if (index % 9 === 0) {
      gridRow = life.document.createElement('div'); gridRow.className = 'oc-mine-row'; gridRow.setAttribute('role', 'row'); grid.append(gridRow);
    }
    const button = life.document.createElement('button'); button.type = 'button'; button.dataset.index = String(index);
    button.className = 'oc-mine-cell'; button.setAttribute('role', 'gridcell'); button.tabIndex = index === 0 ? 0 : -1;
    button.setAttribute('aria-rowindex', String(Math.floor(index / 9) + 1)); button.setAttribute('aria-colindex', String(index % 9 + 1)); gridRow.append(button); return button;
  });
  let board, generated, status, flags, elapsed, flagMode, paused, timer = null, destroyed = false;
  function stopTimer() { if (timer !== null) life.view.clearInterval(timer); timer = null; }
  function startTimer() { stopTimer(); if (status === 'playing' && !paused) timer = life.view.setInterval(() => { elapsed++; clock.textContent = `${String(elapsed).padStart(3, '0')} s`; }, 1000); }
  function render() {
    flags = board.filter(cell => cell.flagged).length;
    output.textContent = `${10 - flags} flags left`; clock.textContent = `${String(elapsed).padStart(3, '0')} s`;
    flagButton.textContent = `Flag mode: ${flagMode ? 'on' : 'off'}`; flagButton.setAttribute('aria-pressed', String(flagMode));
    pauseButton.textContent = paused ? 'Resume' : 'Pause'; pauseButton.disabled = !generated || status !== 'playing';
    squares.forEach((square, index) => {
      const cell = board[index];
      square.className = `oc-mine-cell${cell.revealed ? ' is-revealed' : ''}${cell.flagged ? ' is-flagged' : ''}${cell.exploded ? ' is-exploded' : ''}`;
      square.dataset.adjacent = String(cell.adjacent);
      square.textContent = paused ? '' : cell.flagged ? '⚑' : cell.revealed ? cell.mine ? '✳' : cell.adjacent || '' : '';
      const label = paused ? 'Paused' : cell.flagged ? 'Flagged' : cell.revealed ? cell.mine ? 'Mine' : cell.adjacent ? `${cell.adjacent} adjacent mines` : 'Clear' : 'Hidden';
      square.setAttribute('aria-label', `${label}, row ${Math.floor(index / 9) + 1}, column ${index % 9 + 1}`);
      square.setAttribute('aria-disabled', String(paused || status === 'won' || status === 'lost'));
    });
  }
  function reset() {
    stopTimer(); board = Array.from({ length: 81 }, () => ({ mine: false, adjacent: 0, revealed: false, flagged: false, exploded: false }));
    generated = false; status = 'ready'; flags = 0; elapsed = 0; flagMode = false; paused = false;
    message.textContent = 'Choose a square to begin.'; render();
  }
  function flag(index) {
    if (paused || ['won', 'lost'].includes(status) || board[index].revealed) return;
    if (!board[index].flagged && flags >= 10) { message.textContent = 'All ten flags are placed. Remove one to move it.'; return; }
    board[index] = { ...board[index], flagged: !board[index].flagged }; sound(options, 'flag'); render();
  }
  function reveal(index) {
    if (paused || ['won', 'lost'].includes(status) || board[index].flagged || board[index].revealed) return;
    if (!generated) {
      const marked = board.map(cell => cell.flagged); board = createMinefield(9, 9, 10, index);
      board.forEach((cell, i) => { cell.flagged = marked[i]; }); generated = true; status = 'playing'; startTimer();
    }
    const result = revealMinefield(board, index); board = result.board; status = result.status;
    if (status === 'lost') { stopTimer(); message.textContent = 'A hidden stone. New meadow, fresh start.'; sound(options, 'lose'); }
    else if (status === 'won') { stopTimer(); message.textContent = `Meadow cleared in ${elapsed} seconds. Nicely done.`; sound(options, 'win'); }
    else { message.textContent = 'The number tells you how many mines touch that square.'; sound(options, 'move'); }
    render();
  }
  function pause() {
    if (!generated || status !== 'playing' || paused) return;
    paused = true; stopTimer(); message.textContent = 'Paused. The meadow is covered until you return.'; render();
  }
  function resume() { if (!paused || destroyed || life.document.hidden) return; paused = false; startTimer(); message.textContent = 'Welcome back to the meadow.'; render(); }
  life.listen(container, 'click', event => {
    const button = event.target.closest('button'); if (!button || !container.contains(button)) return;
    if (button.dataset.index !== undefined) { const index = Number(button.dataset.index); flagMode ? flag(index) : reveal(index); }
    if (button.dataset.action === 'reset') reset();
    if (button.dataset.action === 'flag') { flagMode = !flagMode; render(); }
    if (button.dataset.action === 'pause') paused ? resume() : pause();
  });
  life.listen(grid, 'contextmenu', event => { const cell = event.target.closest('[data-index]'); if (cell) { event.preventDefault(); flag(Number(cell.dataset.index)); } });
  life.listen(grid, 'keydown', event => {
    const square = event.target.closest('[data-index]'); if (!square) return;
    const index = Number(square.dataset.index), row = Math.floor(index / 9), col = index % 9;
    let next = index;
    if (event.key === 'ArrowLeft') next = row * 9 + Math.max(0, col - 1);
    else if (event.key === 'ArrowRight') next = row * 9 + Math.min(8, col + 1);
    else if (event.key === 'ArrowUp') next = Math.max(0, row - 1) * 9 + col;
    else if (event.key === 'ArrowDown') next = Math.min(8, row + 1) * 9 + col;
    else if (event.key === 'Home') next = row * 9;
    else if (event.key === 'End') next = row * 9 + 8;
    else if (event.key.toLowerCase() === 'f') { event.preventDefault(); flag(index); return; }
    else return;
    event.preventDefault(); squares.forEach((button, i) => { button.tabIndex = i === next ? 0 : -1; }); squares[next].focus();
  });
  life.listen(grid, 'focusin', event => { const square = event.target.closest('[data-index]'); if (square) squares.forEach(button => { button.tabIndex = button === square ? 0 : -1; }); });
  life.listen(life.document, 'visibilitychange', () => { if (life.document.hidden) pause(); });
  reset();
  return { pause, destroy() { destroyed = true; stopTimer(); life.destroy(); } };
}

export function mountPaddle(container, options = {}) {
  const life = lifecycle(container);
  container.innerHTML = `<section class="oc-game oc-paddle"><div class="oc-game-top"><span>PADDLE BREAK</span><output aria-live="polite">You 0 : 0 CPU</output></div><canvas width="400" height="280" tabindex="0" aria-label="Paddle Break. Move the left paddle using up and down arrows, W S, or your pointer. First to five points wins."></canvas><div class="oc-game-controls"><button type="button" data-action="start">Start</button><button type="button" data-action="pause" disabled>Pause</button><button type="button" data-action="reset">New match</button></div><div class="oc-paddle-touch" aria-label="Paddle controls"><button type="button" data-axis="-1" aria-label="Move paddle up">↑ Hold</button><button type="button" data-axis="1" aria-label="Move paddle down">↓ Hold</button></div><p class="oc-game-hint">↑ ↓ / W S · Mouse or touch · First to five</p><p class="oc-game-status" role="status">Ready for a little back and forth?</p></section>`;
  const canvas = container.querySelector('canvas'), context = canvasContext(canvas), output = container.querySelector('output');
  const startButton = container.querySelector('[data-action="start"]'), pauseButton = container.querySelector('[data-action="pause"]');
  const message = container.querySelector('.oc-game-status');
  let state = createPaddleState(), axis = 0, targetY = null, frame = null, previous = 0, destroyed = false;
  const held = new Set();
  function stopFrame() { if (frame !== null) life.view.cancelAnimationFrame(frame); frame = null; previous = 0; }
  function draw() {
    context.fillStyle = CREAM; context.fillRect(0, 0, 400, 280); context.fillStyle = '#d1d6bb';
    for (let y = 10; y < 280; y += 16) context.fillRect(199, y, 2, 8);
    context.fillStyle = GREEN; context.fillRect(14, Math.round(state.leftY), 8, state.paddleHeight);
    context.fillStyle = '#b47b36'; context.fillRect(378, Math.round(state.rightY), 8, state.paddleHeight);
    context.fillStyle = INK; context.fillRect(Math.round(state.ball.x) - 4, Math.round(state.ball.y) - 4, 8, 8);
    if (state.status === 'ready') overlay(context, 400, 280, 'A friendly little rally.', 'Press Start · You play on the left');
    if (state.status === 'paused') overlay(context, 400, 280, 'No rush.', 'Resume when you are ready');
    if (state.status === 'won') overlay(context, 400, 280, state.leftScore >= 5 ? 'A well-earned tea break.' : 'Another round sometime?', `${state.leftScore} : ${state.rightScore} · New match to play again`);
    output.textContent = `You ${state.leftScore} : ${state.rightScore} CPU`;
    startButton.textContent = state.status === 'paused' ? 'Resume' : 'Start'; startButton.disabled = state.status === 'running' || state.status === 'won';
    pauseButton.disabled = state.status !== 'running';
  }
  function animate(now) {
    if (destroyed || state.status !== 'running') return;
    const dt = previous ? (now - previous) / 1000 : 0; previous = now;
    state = stepPaddle(state, dt, { axis, targetY });
    if (state.event) sound(options, state.event);
    if (state.status === 'won') { stopFrame(); message.textContent = state.leftScore >= 5 ? 'You won the match. Good rally!' : 'The computer takes this one. Good rally!'; sound(options, state.leftScore >= 5 ? 'win' : 'lose'); }
    draw();
    if (state.status === 'running') frame = life.view.requestAnimationFrame(animate);
  }
  function start() {
    if (destroyed || !['ready', 'paused'].includes(state.status) || life.document.hidden) return;
    state = { ...state, status: 'running' }; stopFrame(); previous = 0; frame = life.view.requestAnimationFrame(animate);
    message.textContent = 'You are the green paddle on the left.'; sound(options, 'start'); draw();
  }
  function clearInput() { held.clear(); axis = 0; targetY = null; }
  function pause() { if (state.status !== 'running') return; stopFrame(); clearInput(); state = { ...state, status: 'paused' }; message.textContent = 'Paused. Take your time.'; draw(); }
  function reset() { stopFrame(); clearInput(); state = createPaddleState(); message.textContent = 'A fresh match. You serve first.'; draw(); }
  function pointer(event) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.height) return;
    targetY = clamp((event.clientY - rect.top) / rect.height * 280, 0, 280);
  }
  life.listen(canvas, 'pointerdown', event => { event.preventDefault(); life.focus(); canvas.setPointerCapture?.(event.pointerId); pointer(event); });
  life.listen(canvas, 'pointermove', event => { if (event.pointerType !== 'touch' || canvas.hasPointerCapture?.(event.pointerId)) pointer(event); });
  life.listen(canvas, 'pointerup', event => { if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId); });
  life.listen(container, 'click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.action === 'start') start(); if (button.dataset.action === 'pause') pause(); if (button.dataset.action === 'reset') reset();
  });
  life.listen(container, 'keydown', event => {
    if (!life.focused()) return;
    if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(event.key)) { event.preventDefault(); held.add(event.key.toLowerCase()); targetY = null; axis = (held.has('arrowdown') || held.has('s') ? 1 : 0) - (held.has('arrowup') || held.has('w') ? 1 : 0); }
    if (event.code === 'Space' && event.target.tagName !== 'BUTTON') { event.preventDefault(); state.status === 'running' ? pause() : start(); }
  });
  life.listen(container, 'keyup', event => { held.delete(event.key.toLowerCase()); axis = (held.has('arrowdown') || held.has('s') ? 1 : 0) - (held.has('arrowup') || held.has('w') ? 1 : 0); });
  life.listen(container, 'focusout', event => { if (!container.contains(event.relatedTarget)) clearInput(); });
  for (const button of container.querySelectorAll('[data-axis]')) {
    life.listen(button, 'pointerdown', event => { event.preventDefault(); button.focus(); button.setPointerCapture?.(event.pointerId); targetY = null; axis = Number(button.dataset.axis); });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) life.listen(button, name, () => { axis = 0; });
  }
  life.listen(life.document, 'visibilitychange', () => { if (life.document.hidden) pause(); });
  draw();
  return { pause, destroy() { destroyed = true; stopFrame(); clearInput(); life.destroy(); } };
}
