// tabia — lightweight, engine-free position eval. Runs in the browser, no server.
// Not Stockfish — a fast heuristic (material + mobility + development + king safety)
// so the "winning" bar moves honestly and shows gambit compensation, instantly.
import { Chess } from './vendor/chess.js';

const VAL = { p: 1, n: 3, b: 3.25, r: 5, q: 9, k: 0 };
const HOME_MINOR = { w: ['b1', 'c1', 'f1', 'g1'], b: ['b8', 'c8', 'f8', 'g8'] };
const CENTER = new Set(['d4', 'e4', 'd5', 'e5']);

function flipTurn(fen) {
  const p = fen.split(' ');
  p[1] = p[1] === 'w' ? 'b' : 'w';
  p[3] = '-'; // drop en-passant so the position stays legal after the swap
  return p.join(' ');
}
function mobility(fen) {
  try { return new Chess(fen).moves().length; } catch { return 0; }
}

// Returns evaluation in pawns from White's perspective (+ = White better).
export function evaluate(fen) {
  let g; try { g = new Chess(fen); } catch { return 0; }
  let mat = 0, dev = 0, center = 0;
  for (const row of g.board()) for (const sq of row) {
    if (!sq) continue;
    const s = sq.color === 'w' ? 1 : -1;
    mat += s * (VAL[sq.type] || 0);
    if ((sq.type === 'n' || sq.type === 'b') && !HOME_MINOR[sq.color].includes(sq.square)) dev += s * 0.18;
    if (sq.type === 'p' && CENTER.has(sq.square)) center += s * 0.12;
    if (sq.type === 'k' && sq.square !== (sq.color === 'w' ? 'e1' : 'e8')) dev += s * 0.25; // moved/castled king
  }
  const turn = g.turn();
  const mine = mobility(fen);
  const theirs = mobility(flipTurn(fen));
  const wMob = turn === 'w' ? mine : theirs;
  const bMob = turn === 'w' ? theirs : mine;
  const mob = 0.05 * (wMob - bMob);

  let e = mat + dev + center + mob;
  if (g.isCheckmate()) e = turn === 'w' ? -100 : 100;
  return Math.max(-100, Math.min(100, e));
}

// Map a pawn eval to a White win-probability percent (lichess-style sigmoid).
export function winPct(evalPawns) {
  const cp = evalPawns * 100;
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}
export function fmtEval(e) {
  if (e >= 99) return 'M';
  if (e <= -99) return '-M';
  return (e >= 0 ? '+' : '') + e.toFixed(1);
}
