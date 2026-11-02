// Original 16 × 16 pixel drawings. All geometry and colors are local constants.
const colors = Object.freeze({
  ink: '#35463d', shadow: '#788576', paper: '#fff3d2', cream: '#e6d9b3',
  green: '#7f9b79', forest: '#466b55', mint: '#afc0a0', amber: '#d4a15c',
  gold: '#eed08c', blue: '#829eaa', navy: '#536e7b', rose: '#bb7f6e',
});

// Rectangular paths keep every edge on the pixel grid at any integer scale.
const pixels = blocks => blocks.map(([x, y, w, h, color]) =>
  `<path fill="${colors[color]}" d="M${x} ${y}h${w}v${h}h-${w}z"/>`
).join('');

const drawings = Object.freeze({
  computer: pixels([
    [1, 1, 14, 11, 'ink'], [2, 2, 12, 9, 'paper'], [3, 3, 10, 6, 'forest'],
    [4, 4, 8, 1, 'green'], [4, 5, 1, 2, 'mint'], [5, 7, 3, 1, 'mint'],
    [12, 10, 1, 1, 'amber'], [7, 12, 2, 1, 'ink'], [4, 13, 8, 2, 'ink'],
    [5, 13, 6, 1, 'cream'], [2, 10, 9, 1, 'cream'],
  ]),
  snake: pixels([
    [2, 2, 7, 4, 'ink'], [1, 3, 4, 8, 'ink'], [2, 8, 11, 4, 'ink'],
    [9, 4, 5, 8, 'ink'], [11, 3, 4, 4, 'ink'], [3, 3, 5, 2, 'green'],
    [2, 4, 2, 6, 'green'], [3, 9, 9, 2, 'green'], [10, 5, 3, 5, 'green'],
    [12, 4, 2, 2, 'mint'], [13, 4, 1, 1, 'ink'], [4, 3, 3, 1, 'mint'],
    [5, 13, 3, 2, 'rose'], [6, 12, 1, 1, 'forest'], [5, 13, 1, 1, 'gold'],
  ]),
  mines: pixels([
    [7, 1, 2, 3, 'ink'], [7, 12, 2, 3, 'ink'], [1, 7, 3, 2, 'ink'],
    [12, 7, 3, 2, 'ink'], [3, 3, 2, 2, 'ink'], [11, 3, 2, 2, 'ink'],
    [3, 11, 2, 2, 'ink'], [11, 11, 2, 2, 'ink'], [5, 3, 6, 10, 'ink'],
    [3, 5, 10, 6, 'ink'], [5, 4, 6, 8, 'navy'], [4, 5, 8, 6, 'navy'],
    [8, 6, 4, 5, 'ink'], [6, 10, 4, 2, 'ink'], [5, 5, 3, 2, 'paper'],
    [5, 7, 1, 1, 'cream'],
  ]),
  paddle: pixels([
    [7, 1, 1, 2, 'blue'], [7, 5, 1, 2, 'blue'], [7, 9, 1, 2, 'blue'],
    [7, 13, 1, 2, 'blue'], [1, 3, 4, 10, 'ink'], [2, 4, 2, 8, 'green'],
    [2, 4, 1, 7, 'mint'], [11, 5, 4, 10, 'ink'], [12, 6, 2, 8, 'amber'],
    [12, 6, 1, 7, 'gold'], [8, 3, 3, 3, 'ink'], [8, 3, 2, 2, 'paper'],
  ]),
  paint: pixels([
    [4, 1, 7, 1, 'ink'], [2, 2, 11, 2, 'ink'], [1, 4, 13, 7, 'ink'],
    [2, 11, 11, 2, 'ink'], [4, 13, 6, 1, 'ink'], [4, 2, 6, 1, 'paper'],
    [3, 3, 9, 8, 'paper'], [2, 5, 11, 5, 'paper'], [4, 11, 6, 2, 'cream'],
    [3, 5, 2, 2, 'blue'], [5, 3, 2, 2, 'rose'], [9, 3, 2, 2, 'amber'],
    [3, 9, 2, 2, 'green'], [8, 8, 2, 3, 'ink'], [9, 7, 2, 2, 'ink'],
    [10, 6, 2, 2, 'amber'], [11, 4, 2, 3, 'amber'], [12, 3, 2, 2, 'ink'],
    [13, 1, 2, 3, 'ink'], [13, 2, 1, 2, 'blue'],
  ]),
  notes: pixels([
    [3, 1, 8, 1, 'ink'], [2, 2, 11, 13, 'ink'], [3, 2, 7, 12, 'paper'],
    [10, 5, 2, 9, 'cream'], [10, 2, 1, 3, 'cream'], [11, 3, 1, 2, 'cream'],
    [10, 5, 2, 1, 'ink'], [5, 6, 5, 1, 'blue'], [5, 8, 5, 1, 'blue'],
    [5, 10, 4, 1, 'blue'], [5, 12, 3, 1, 'blue'], [4, 2, 1, 2, 'amber'],
  ]),
  radio: pixels([
    [4, 2, 7, 3, 'ink'], [5, 3, 5, 2, 'cream'], [11, 2, 1, 3, 'ink'],
    [12, 1, 2, 1, 'ink'], [1, 5, 14, 9, 'ink'], [2, 6, 12, 7, 'cream'],
    [3, 7, 5, 5, 'forest'], [4, 7, 1, 5, 'green'], [6, 7, 1, 5, 'green'],
    [3, 8, 5, 1, 'green'], [3, 10, 5, 1, 'green'], [9, 7, 4, 2, 'navy'],
    [9, 7, 3, 1, 'blue'], [11, 7, 1, 2, 'gold'], [9, 11, 2, 2, 'ink'],
    [9, 11, 1, 1, 'amber'], [12, 11, 1, 1, 'ink'], [3, 14, 2, 1, 'ink'],
    [11, 14, 2, 1, 'ink'],
  ]),
  folder: pixels([
    [2, 3, 5, 1, 'ink'], [1, 4, 13, 9, 'ink'], [2, 4, 5, 2, 'gold'],
    [2, 6, 11, 6, 'amber'], [7, 5, 6, 1, 'gold'], [6, 6, 5, 4, 'paper'],
    [7, 7, 3, 1, 'blue'], [0, 7, 15, 7, 'ink'], [1, 8, 13, 5, 'gold'],
    [1, 8, 13, 1, 'paper'], [2, 12, 11, 1, 'amber'], [14, 8, 1, 5, 'shadow'],
  ]),
  sun: pixels([
    [7, 0, 2, 3, 'amber'], [7, 13, 2, 3, 'amber'], [0, 7, 3, 2, 'amber'],
    [13, 7, 3, 2, 'amber'], [2, 2, 2, 2, 'amber'], [12, 2, 2, 2, 'amber'],
    [2, 12, 2, 2, 'amber'], [12, 12, 2, 2, 'amber'], [5, 4, 6, 8, 'ink'],
    [4, 5, 8, 6, 'ink'], [5, 5, 6, 6, 'amber'], [6, 5, 4, 1, 'gold'],
    [5, 6, 1, 3, 'gold'], [6, 7, 1, 1, 'ink'], [9, 7, 1, 1, 'ink'],
    [7, 9, 2, 1, 'ink'],
  ]),
  moon: pixels([
    [6, 1, 5, 1, 'ink'], [4, 2, 5, 1, 'ink'], [3, 3, 5, 2, 'ink'],
    [2, 5, 5, 6, 'ink'], [3, 11, 5, 2, 'ink'], [4, 13, 8, 1, 'ink'],
    [6, 14, 6, 1, 'ink'], [8, 10, 6, 3, 'ink'], [12, 9, 2, 2, 'ink'],
    [6, 2, 2, 1, 'gold'], [4, 3, 3, 2, 'gold'], [3, 5, 3, 6, 'gold'],
    [4, 10, 4, 2, 'gold'], [5, 12, 7, 1, 'gold'], [7, 13, 4, 1, 'gold'],
    [8, 11, 5, 1, 'gold'], [12, 10, 1, 1, 'gold'], [3, 6, 1, 3, 'paper'],
    [11, 3, 1, 1, 'blue'], [13, 5, 2, 1, 'blue'], [14, 4, 1, 3, 'blue'],
  ]),
  flower: pixels([
    [7, 8, 2, 8, 'ink'], [8, 9, 1, 6, 'green'], [3, 10, 4, 2, 'ink'],
    [4, 11, 3, 2, 'ink'], [4, 10, 2, 1, 'green'], [5, 11, 2, 1, 'green'],
    [9, 12, 4, 2, 'ink'], [10, 11, 3, 2, 'ink'], [10, 12, 2, 1, 'green'],
    [6, 1, 4, 10, 'ink'], [3, 4, 10, 4, 'ink'], [4, 3, 8, 6, 'ink'],
    [7, 2, 2, 8, 'rose'], [4, 5, 8, 2, 'rose'], [5, 4, 6, 4, 'rose'],
    [6, 4, 4, 4, 'ink'], [7, 5, 2, 2, 'gold'], [6, 5, 1, 1, 'amber'],
    [5, 4, 1, 1, 'paper'],
  ]),
  arrow: pixels([
    [8, 2, 2, 12, 'ink'], [10, 4, 2, 8, 'ink'], [12, 6, 2, 4, 'ink'],
    [14, 7, 1, 2, 'ink'], [1, 6, 8, 4, 'ink'], [2, 7, 8, 2, 'green'],
    [9, 4, 1, 8, 'green'], [10, 6, 2, 4, 'green'], [12, 7, 1, 2, 'green'],
    [2, 7, 7, 1, 'mint'], [9, 5, 1, 2, 'mint'],
  ]),
  volume: pixels([
    [1, 6, 5, 5, 'ink'], [5, 4, 2, 9, 'ink'], [7, 2, 2, 13, 'ink'],
    [2, 7, 3, 3, 'cream'], [5, 6, 1, 5, 'blue'], [6, 5, 1, 7, 'blue'],
    [7, 4, 1, 9, 'blue'], [5, 6, 1, 1, 'paper'], [10, 5, 1, 2, 'ink'],
    [11, 7, 1, 3, 'ink'], [10, 10, 1, 2, 'ink'], [12, 3, 1, 2, 'forest'],
    [13, 5, 1, 2, 'forest'], [14, 7, 1, 3, 'forest'], [13, 10, 1, 2, 'forest'],
    [12, 12, 1, 2, 'forest'],
  ]),
  clock: pixels([
    [5, 1, 6, 14, 'ink'], [3, 2, 10, 12, 'ink'], [2, 3, 12, 10, 'ink'],
    [1, 5, 14, 6, 'ink'], [5, 2, 6, 12, 'paper'], [3, 3, 10, 10, 'paper'],
    [2, 5, 12, 6, 'paper'], [4, 12, 8, 1, 'cream'], [12, 5, 1, 6, 'cream'],
    [7, 3, 2, 1, 'shadow'], [7, 12, 2, 1, 'shadow'], [3, 7, 1, 2, 'shadow'],
    [12, 7, 1, 2, 'shadow'], [7, 5, 2, 4, 'ink'], [8, 8, 4, 2, 'ink'],
    [7, 5, 1, 3, 'amber'], [7, 8, 2, 1, 'amber'],
  ]),
});

export const ICON_NAMES = Object.freeze(Object.keys(drawings));

/** Returns trusted SVG markup. Unknown names use the computer drawing. */
export function icon(name, size = 32) {
  const drawing = Object.hasOwn(drawings, name) ? drawings[name] : drawings.computer;
  const dimension = Number.isFinite(size) ? Math.max(8, Math.min(256, Math.round(size))) : 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${drawing}</svg>`;
}
