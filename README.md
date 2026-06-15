<p align="center">
  <img src="assets/banner.png" alt="tabia — open source chess drills" width="640">
</p>

<p align="center">
  <b>Open-source, browser-local chess opening trainer.</b><br>
  Drill your repertoire with spaced repetition until the moves are muscle memory.<br>
  No account. No server. No tracking — your prep lives in <i>your</i> browser.
</p>

<p align="center">
  <a href="https://daxaur.github.io/tabia/"><b>▶ Live demo</b></a> ·
  <a href="#run-it">Run it</a> ·
  <a href="#add-your-own-opening">Add an opening</a> ·
  MIT
</p>

---

## Why

Most repertoire trainers lock your prep behind an account and a database you don't control.
**tabia** is the open version: a **static site** with **zero backend**. Your progress and
spaced-repetition schedule live in `localStorage`. Fork it, self-host it, run it offline —
it's just HTML, CSS and ES modules.

## What it does

- **Spaced-repetition drilling** — clean a line and it won't come back for a while; miss it and it returns soon.
- **Openings as folders, lines as branches** — each opening is a folder holding a tree of named variations you can browse and drill.
- **Explore** — step through any line with the plan annotated move by move, or branch off and try your own ideas.
- **Train** — the trainer plays the opponent; you play your move and get instant ✓ / ✗ feedback, with a hint when you're stuck.
- **Buttery board** — big, fast, smooth drag-and-drop with animated piece slides. Multiple swappable piece sets.
- **Browser-local** — no sign-up, no server call, your data never leaves the tab.
- **Verified data** — every bundled line is replayed through `chess.js` (`npm run validate`); illegal moves can't ship.

## Run it

It's a static site — no build step.

```bash
git clone https://github.com/daxaur/tabia
cd tabia
python3 -m http.server 4173    # or: npm run dev
# open http://localhost:4173
```

Deploys to **GitHub Pages** / any static host as-is.

## Add your own opening

An opening is a plain data module: a folder name and a list of lines, each an array of
`[SAN, "comment"]` moves from move 1. The trainer derives the drill positions automatically
(shared prefixes merge by position). Copy a file in `src/data/`, change the moves, and the
opening shows up on the home page. Run `npm run validate` to legality-check every line.

## Project layout

```
index.html          app shell (Home / Explore / Train)
src/style.css       theme + board styling
src/board.js        dependency-free interactive board (drag + animation), chess.js-backed
src/app.js          views + spaced-repetition drill engine
src/store.js        localStorage persistence + SRS scheduling
src/data/*          openings (folders) and their branch lines
src/vendor/chess.js chess.js (move legality), vendored
src/pieces/*        piece sets (SVG)
tools/validate.mjs  legality check for every line
```

## Roadmap

- [ ] Import / export openings as PGN / JSON
- [ ] Publish & share openings (peer-to-peer, no server)
- [ ] Per-position SRS (not just per-line)
- [ ] Community opening library

## Credits & license

Code: **MIT** © 2026. Move legality by [chess.js](https://github.com/jhlywa/chess.js) (BSD).
Piece sets are sourced from the [Lichess / lila](https://github.com/lichess-org/lila) project
under their original licenses. Contributions welcome — open an issue or PR.
