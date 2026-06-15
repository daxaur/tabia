// tabia — real Stockfish eval in the browser (single-threaded asm.js, no server,
// no special headers). Streams the score as depth climbs so the bar animates live.
// Falls back silently to the heuristic if the engine can't load.
let sf = null, ready = false, token = 0, onScore = null, curWhiteTurn = true;

function handle(line) {
  if (typeof line !== 'string') line = line?.data ?? '';
  if (line === 'uciok') { sf.postMessage('isready'); return; }
  if (line === 'readyok') { ready = true; Engine.available = true; return; }
  const m = line.match(/score (cp|mate) (-?\d+)/);
  if (m && onScore) {
    let e;
    if (m[1] === 'mate') e = (+m[2] > 0 ? 100 : -100);
    else e = (+m[2]) / 100;
    if (!curWhiteTurn) e = -e;            // UCI score is side-to-move relative → make it White-relative
    onScore(Math.max(-100, Math.min(100, e)), token);
  }
}

export const Engine = {
  available: false,
  init() {
    if (sf) return;
    try {
      sf = new Worker(new URL('./vendor/stockfish.js', import.meta.url));
      sf.onmessage = handle;
      sf.onerror = () => { Engine.available = false; sf = null; };
      sf.postMessage('uci');
    } catch { sf = null; }
  },
  // evaluate(fen, cb): cb(whiteEvalPawns, requestId) fires repeatedly as depth grows
  evaluate(fen, cb, depth = 14) {
    if (!sf || !ready) return;
    token++; onScore = cb; curWhiteTurn = fen.split(' ')[1] !== 'b';
    sf.postMessage('stop');
    sf.postMessage('position fen ' + fen);
    sf.postMessage('go depth ' + depth);
  },
  token: () => token,
};
