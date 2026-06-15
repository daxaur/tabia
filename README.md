# tabia ♟

**An open-source, browser-local chess opening trainer.** Drill your repertoire with spaced
repetition until the moves are muscle memory — no account, no server, no tracking. Everything
lives in *your* browser.

Ships with a complete, hand-checked **Blackmar-Diemer Gambit** repertoire to drill today.

> *tabia* (طبيعة / تابية) — the standard, memorized starting position of an opening variation.
> The thing you're trying to get into your bones.

---

## Why

Repertoire trainers like to lock your prep behind an account and a database you don't control.
tabia is the cypherpunk version: a **static site** with **zero backend**. Your progress and
spaced-repetition schedule are stored in `localStorage`. Fork it, self-host it, run it offline —
it's just HTML, CSS and ES modules.

## Features

- **Spaced-repetition drilling** (Leitner boxes) — clean a line and it won't come back for a
  while; miss it and it returns soon.
- **Explore mode** — step through every variation with plans and annotations, or branch off and
  try your own ideas.
- **Train mode** — the trainer plays the opponent; you play your repertoire move and get instant
  ✓ / ✗ feedback, with a hint arrow when you're stuck.
- **A board that isn't the default everywhere** — cool-slate squares, electric-cyan move dots,
  and three swappable piece sets (`maestro`, `pixel`, `fresca`).
- **Browser-local** — no sign-up, no server call, your data never leaves the tab.
- **Verified data** — every line in the bundled repertoire is replayed through `chess.js` in CI
  (`npm run validate`); illegal moves can't ship.

## The bundled repertoire — Blackmar-Diemer Gambit

`1.d4 d5 2.e4!? dxe4 3.Nc3 Nf6 4.f3` — give a pawn, open the f-file, attack.

| Group | Variations |
|---|---|
| **Accepted** (`5.Nxf3`) | Teichmann · Bogoljubow · Euwe · Gunderam · Ziegler · 5…Nc6 |
| **Ryder** (`5.Qxf3`) | Halosar Trap · Queen Raid (Qxb7) |
| **Declined** | Vienna (4…Bf5) · Langeheinecke (4…e3) · Lemberger (4…e5) · O'Kelly (4…c6) |

13 lines, all annotated with the plan behind the moves.

## Run it

It's a static site — no build step.

```bash
git clone https://github.com/daxaur/tabia
cd tabia
python3 -m http.server 4173    # or: npm run dev
# open http://localhost:4173
```

Deploys to **GitHub Pages** / any static host as-is.

```bash
npm run validate   # replay every repertoire line through chess.js
```

## Add your own repertoire

A repertoire is a plain data module: a list of lines, each an array of `[SAN, "comment"]` moves
from move 1. The trainer derives the drill positions automatically (shared prefixes merge by
position). See [`src/data/bdg.js`](src/data/bdg.js) — copy it, change the moves, point the app at it.

## Project layout

```
index.html          app shell (Home / Explore / Train)
src/style.css       cypherpunk theme + board styling
src/board.js        dependency-free interactive board (click-to-move), chess.js-backed
src/app.js          views + spaced-repetition drill engine
src/store.js        localStorage persistence + SRS scheduling
src/data/bdg.js     the Blackmar-Diemer repertoire (annotated)
src/vendor/chess.js chess.js (move legality), vendored
src/pieces/*        piece sets (SVG)
tools/validate.mjs  legality check for every line
```

## Roadmap

- [ ] Import/export repertoires as PGN / JSON
- [ ] Publish & share repertoires (peer-to-peer, no server)
- [ ] Per-position SRS (not just per-line)
- [ ] More built-in repertoires
- [ ] Engine eval bar (local WASM)

## Credits & license

Code: **MIT** © 2026. Move legality by [chess.js](https://github.com/jhlywa/chess.js) (BSD).
Piece sets (`maestro`, `pixel`, `fresca`) are from the [Lichess / lila](https://github.com/lichess-org/lila)
project and remain under their original licenses — full credit to their authors.

Contributions welcome — open an issue or PR.
