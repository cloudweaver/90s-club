# Offline Club

**A little internet time machine.**

### [Step inside Offline Club →](https://offline-club-98.btc0days.chatgpt.site)

![A recording of Offline Club's pixel-computer intro and browser desktop](docs/offline-club-preview.gif)

A beige computer for a slower afternoon. This small retreat, inspired by the early internet, holds three games, a pixel paint pad, a notebook, and a soft rain radio. Move the windows around, make a little picture, or leave yourself a thought.

The animation above records the actual site. Its opening intro can be skipped immediately and replayed from **What is this?**; reduced-motion preferences show a still scene. [View a still desktop preview](docs/desktop-preview.jpg).

Everything runs in your browser. Notes and drawings stay in that browser when local storage is available; sound starts when you choose to play it.

## Open locally

Use Node.js 22+ for checks and Python 3 for the preview server. There are no npm runtime dependencies.

```sh
npm run dev
```

Open `http://127.0.0.1:4178`. The complete website lives in `dist/` and can be hosted as static files.

## Inside the computer

- **Snake:** arrow keys, WASD, or touch controls; collect seeds and avoid the edges. Start, pause, and restart whenever you like.
- **Mines:** a 9×9 board with 10 hidden stones. The first reveal protects the clicked square and its neighbours. Right-click, press F, or use flag mode. Arrow keys move around the board.
- **Paddle:** a short match against the computer. Use the keyboard, a pointer, or touch controls. First to five points.
- **Paint Pad:** pixel brushes, ten colours, an eraser, undo, and a user-triggered PNG download. Arrow keys move the drawing cursor; Space paints.
- **Notebook:** notes saved in local browser storage, with an undoable Clear action.
- **Rain Radio:** two original procedural ambient sounds, generated with Web Audio. Sound starts only after pressing Play.

Windows can be moved, minimized, maximized, closed, and reopened from the taskbar. Start also has a **Take a break** screen. Active games and audio pause when hidden or minimized. Game sounds are off by default and are separate from the radio's own controls.

Notes and drawings are stored only in that browser when storage is available. Clearing site data removes them. The site has no accounts, social feeds, analytics, external font requests, or AI service integration. Loading the hosted site still requires a network connection; this is not a service-worker offline app.

## Verification

```sh
npm run check
npm test
```

Tests cover snake movement and collisions, mine placement and flood reveal, and paddle collision/scoring logic. Browser checks cover launching the apps, game start/pause, safe first reveal and flags, notebook persistence, paint undo, and opt-in radio playback. Responsive layouts are checked at phone and desktop sizes.

## Source and hosting

- `dist/index.html`, `dist/styles.css`, `dist/app.js`: the desktop shell and window manager.
- `dist/modules/games.js` and `games.css`: the three original games.
- `dist/modules/apps.js` and `apps.css`: paint, notes, and radio.
- `dist/assets/icons.js`: original pixel SVG icons.
- `.openai/hosting.json`: Sites identity and static deployment directory.

GitHub holds a copy of the source. Sites manages the hosted deployment; pushing to GitHub alone does not deploy the site. Keep the existing Sites project ID when publishing updates.

## Font credit

Pixelify Sans is bundled from the official [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/pixelifysans), by the Pixelify Sans Project Authors. Its SIL Open Font License is included at `dist/assets/fonts/OFL-PixelifySans.txt`.
