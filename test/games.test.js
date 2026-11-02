import test from 'node:test';
import assert from 'node:assert/strict';
import { createSnakeState, stepSnake, createMinefield, mineNeighbors, revealMinefield, createPaddleState, stepPaddle } from '../dist/modules/games.js';

function seeded(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

test('snake grows on food without mutating its prior state and rejects reversal', () => {
  const before = { ...createSnakeState(10, 8, seeded(1)), food: [6, 4] };
  const next = stepSnake(before, 'left', seeded(2));
  assert.deepEqual(next.body[0], [6, 4]);
  assert.equal(next.score, 10); assert.equal(next.body.length, 4);
  assert.equal(before.body.length, 3); assert.equal(before.score, 0);
  assert.ok(!next.body.some(([x, y]) => x === next.food[0] && y === next.food[1]));
});

test('snake handles wall/self collisions and can enter a square vacated by its tail', () => {
  const state = { ...createSnakeState(6, 6), body: [[0, 0], [1, 0], [2, 0]], direction: 'left', food: [5, 5] };
  assert.equal(stepSnake(state).status, 'lost');
  const loop = { ...state, body: [[2, 2], [2, 3], [1, 3], [1, 2]], direction: 'up' };
  assert.equal(stepSnake(loop, 'left').status, 'running');
  const collision = { ...loop, body: [[2, 2], [2, 3], [1, 3], [1, 2], [1, 1]], direction: 'up' };
  assert.equal(stepSnake(collision, 'left').status, 'lost');
});

test('mine placement has exact count and a clear first neighborhood over many openings', () => {
  for (const first of [0, 8, 40, 72, 80]) {
    const board = createMinefield(9, 9, 10, first, seeded(first + 1));
    assert.equal(board.filter(cell => cell.mine).length, 10);
    for (const i of [first, ...mineNeighbors(first)]) assert.equal(board[i].mine, false);
    for (let i = 0; i < board.length; i++) assert.equal(board[i].adjacent, mineNeighbors(i).filter(n => board[n].mine).length);
  }
  assert.throws(() => createMinefield(3, 3, 1, 4), /Too many mines/);
});

test('mine reveals flood safely, respect flags, and only win after every safe cell is revealed', () => {
  const board = createMinefield(9, 9, 10, 40, seeded(9));
  board[40].flagged = true;
  const ignored = revealMinefield(board, 40); assert.equal(ignored.board[40].revealed, false);
  board[40].flagged = false;
  const opened = revealMinefield(board, 40);
  assert.equal(opened.board[40].revealed, true); assert.equal(board[40].revealed, false);
  assert.ok(opened.board.filter(cell => cell.revealed).every(cell => !cell.mine));
  const mine = board.findIndex(cell => cell.mine);
  assert.equal(revealMinefield(board, mine).status, 'lost');
  let result = opened;
  for (let i = 0; i < board.length; i++) if (!board[i].mine) result = revealMinefield(result.board, i);
  assert.equal(result.status, 'won');
});

test('paddle physics bounds movement, reflects paddle collisions, and awards the correct player', () => {
  const state = { ...createPaddleState(), status: 'running' };
  const moved = stepPaddle(state, 100, { axis: -1 });
  assert.ok(moved.leftY >= 0); assert.ok(state.leftY > moved.leftY);
  assert.equal(state.ball.x, 200);
  const rebound = stepPaddle({ ...state, ball: { x: 28, y: 140, vx: -170, vy: 0 } }, .035);
  assert.ok(rebound.ball.vx > 0); assert.equal(rebound.event, 'move');
  const goal = stepPaddle({ ...state, leftScore: 4, ball: { x: 410, y: 0, vx: 170, vy: 0 } }, .01);
  assert.equal(goal.leftScore, 5); assert.equal(goal.rightScore, 0); assert.equal(goal.status, 'won');
  assert.equal(goal.event, 'score');
});
