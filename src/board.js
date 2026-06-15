// tabia board — absolutely-positioned pieces that *slide*, buttery pointer-drag,
// click-to-move, animated programmatic moves, crisp arrows. Dependency-free, chess.js-backed.
import { Chess } from './vendor/chess.js';

const FILES = 'abcdefgh';
const GLYPH = { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' };

export class Board {
  /** @param {HTMLElement} root  @param {object} opts {orientation,pieceSet,interactive,onMove,animMs} */
  constructor(root, opts = {}) {
    this.root = root;
    this.orientation = opts.orientation || 'white';
    this.pieceSet = opts.pieceSet || 'maestro';
    this.interactive = opts.interactive !== false;
    this.onMove = opts.onMove || (() => {});
    this.animMs = opts.animMs ?? 180;
    this.chess = new Chess();
    this.pieces = {};      // square -> { el, type, color }
    this.squares = {};     // square -> square div
    this.selected = null;
    this.lastMove = null;
    this.drag = null;
    this._build();
    this._placeAll(false);
  }

  // ---------- geometry ----------
  _colrow(sq) {
    const f = FILES.indexOf(sq[0]), r = +sq[1];
    return this.orientation === 'white' ? [f, 8 - r] : [7 - f, r - 1];
  }
  _sqAt(col, row) {
    const f = this.orientation === 'white' ? col : 7 - col;
    const r = this.orientation === 'white' ? 8 - row : row + 1;
    return (f < 0 || f > 7 || r < 1 || r > 8) ? null : FILES[f] + r;
  }
  _xy(sq) { const [c, r] = this._colrow(sq); return [c * 100, r * 100]; }

  // ---------- build ----------
  _build() {
    this.root.classList.add('tb');
    this.root.innerHTML =
      `<div class="tb-squares"></div><div class="tb-pieces"></div>` +
      `<svg class="tb-shapes" viewBox="0 0 8 8" preserveAspectRatio="none">` +
      `<defs><marker id="tb-ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">` +
      `<path d="M0 1 L9 5 L0 9 z" fill="currentColor"/></marker></defs></svg>`;
    this.sqLayer = this.root.querySelector('.tb-squares');
    this.pieceLayer = this.root.querySelector('.tb-pieces');
    this.svg = this.root.querySelector('.tb-shapes');
    this._buildSquares();
    if (this.interactive) {
      this.pieceLayer.addEventListener('pointerdown', e => this._onDown(e));
      this.sqLayer.addEventListener('pointerdown', e => this._onDown(e));
    }
  }
  _buildSquares() {
    this.sqLayer.innerHTML = '';
    this.squares = {};
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
      const sq = this._sqAt(col, row);
      const f = FILES.indexOf(sq[0]), r = +sq[1];
      const d = document.createElement('div');
      d.className = 'tb-sq ' + ((f + r) % 2 ? 'lt' : 'dk');
      d.dataset.sq = sq;
      if (row === 7) d.insertAdjacentHTML('beforeend', `<span class="tb-cf">${sq[0]}</span>`);
      if (col === 0) d.insertAdjacentHTML('beforeend', `<span class="tb-cr">${r}</span>`);
      this.sqLayer.appendChild(d);
      this.squares[sq] = d;
    }
  }

  // ---------- public ----------
  setPieceSet(s) { this.pieceSet = s; for (const sq in this.pieces) this._setImg(this.pieces[sq]); }
  flip() { this.orientation = this.orientation === 'white' ? 'black' : 'white'; this._buildSquares(); this._placeAll(false); this._markLast(); this._drawShapes(this._shapes || []); }
  setOrientation(o) { if (o !== this.orientation) this.flip(); }
  lock(v) { this.locked = !!v; this.root.classList.toggle('locked', this.locked); }
  getFen() { return this.chess.fen(); }
  turn() { return this.chess.turn(); }

  /** Drive the board to a position. If lastMove given, the moved piece slides. */
  setFen(fen, { lastMove = null, shapes = [], animate = !!lastMove } = {}) {
    this._clearSel();
    if (Array.isArray(lastMove)) lastMove = lastMove[0] ? { from: lastMove[0], to: lastMove[1] } : null;
    const prev = this.chess.fen();
    this.chess.load(fen);
    this.lastMove = lastMove;
    if (animate && lastMove && prev !== fen) this._animateTo(lastMove);
    else this._placeAll(false);
    this._markLast();
    this._drawShapes(shapes);
  }

  // ---------- piece rendering ----------
  _setImg(p) { p.el.style.backgroundImage = `url(src/pieces/${this.pieceSet}/${p.color}${GLYPH[p.type]}.svg)`; }
  _mkPiece(sq, type, color) {
    const el = document.createElement('div');
    el.className = 'tb-pc';
    const p = { el, type, color };
    this._setImg(p);
    const [x, y] = this._xy(sq);
    el.style.transform = `translate(${x}%, ${y}%)`;
    this.pieceLayer.appendChild(el);
    return p;
  }
  _placeAll(animate) {
    this.pieceLayer.innerHTML = '';
    this.pieces = {};
    const b = this.chess.board();
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const cell = b[r][f]; if (!cell) continue;
      const sq = FILES[f] + (8 - r);
      this.pieces[sq] = this._mkPiece(sq, cell.type, cell.color);
    }
  }
  _animateTo({ from, to }) {
    // slide the moving piece; handle capture, castle, en-passant, promotion
    const mover = this.pieces[from];
    const newBoard = this.chess.board();
    const occ = (sq) => { const f = FILES.indexOf(sq[0]); const r = 8 - +sq[1]; return newBoard[r][f]; };
    // remove captured / vanished
    const target = occ(to);
    if (this.pieces[to] && this.pieces[to] !== mover) { this.pieces[to].el.classList.add('gone'); const g = this.pieces[to].el; setTimeout(() => g.remove(), 140); }
    if (mover) {
      delete this.pieces[from];
      const [x, y] = this._xy(to);
      mover.el.style.transform = `translate(${x}%, ${y}%)`;
      // promotion: swap image if type changed
      if (target && target.type !== mover.type) { mover.type = target.type; this._setImg(mover); }
      this.pieces[to] = mover;
    }
    // castling: rook hop
    const isCastle = mover && mover.type === 'k' && Math.abs(FILES.indexOf(from[0]) - FILES.indexOf(to[0])) === 2;
    if (isCastle) {
      const rank = from[1];
      const rookFrom = (to[0] === 'g' ? 'h' : 'a') + rank;
      const rookTo = (to[0] === 'g' ? 'f' : 'd') + rank;
      const rk = this.pieces[rookFrom];
      if (rk) { delete this.pieces[rookFrom]; const [rx, ry] = this._xy(rookTo); rk.el.style.transform = `translate(${rx}%, ${ry}%)`; this.pieces[rookTo] = rk; }
    }
    // en passant: a pawn vanished off `to`
    const epRank = to[1];
    if (mover && mover.type === 'p' && from[0] !== to[0] && !target) { /* shouldn't happen (target set) */ }
    // reconcile any drift on next frame (cheap safety net, no flicker)
    setTimeout(() => this._reconcile(), this.animMs + 30);
  }
  _reconcile() {
    const b = this.chess.board();
    const want = {};
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { const c = b[r][f]; if (c) want[FILES[f] + (8 - r)] = c; }
    // if mismatch in count, hard reset (rare edge cases)
    if (Object.keys(want).length !== Object.keys(this.pieces).length) this._placeAll(false);
  }

  // ---------- highlights ----------
  _markLast() {
    for (const d of Object.values(this.squares)) d.classList.remove('last');
    if (this.lastMove) { this.squares[this.lastMove.from]?.classList.add('last'); this.squares[this.lastMove.to]?.classList.add('last'); }
  }
  _dests(sq) { return this.chess.moves({ square: sq, verbose: true }).map(m => m.to); }
  _select(sq) {
    this._clearSel(); this.selected = sq;
    this.squares[sq].classList.add('sel');
    for (const d of this._dests(sq)) this.squares[d].classList.add(this.chess.get(d) ? 'cap' : 'dest');
  }
  _clearSel() {
    if (this.selected != null) for (const d of Object.values(this.squares)) d.classList.remove('sel', 'dest', 'cap');
    this.selected = null;
  }
  flash(sq, cls) { const d = this.squares[sq]; if (!d) return; d.classList.add(cls); setTimeout(() => d.classList.remove(cls), 600); }

  // ---------- input: click + drag ----------
  _pointSquare(e) {
    const r = this.root.getBoundingClientRect();
    let col = Math.floor((e.clientX - r.left) / r.width * 8);
    let row = Math.floor((e.clientY - r.top) / r.height * 8);
    col = Math.max(0, Math.min(7, col)); row = Math.max(0, Math.min(7, row));
    return this._sqAt(col, row);
  }
  _tryMove(from, to) {
    if (!this._dests(from).includes(to)) return false;
    const promo = this.chess.get(from)?.type === 'p' && (to[1] === '8' || to[1] === '1') ? 'q' : undefined;
    this.onMove(from, to, promo);
    return true;
  }
  _onDown(e) {
    if (this.locked || !this.interactive || e.button !== 0) return;
    const sq = this._pointSquare(e); if (!sq) return;
    const piece = this.chess.get(sq);
    // click-to-move target
    if (this.selected && sq !== this.selected) {
      if (this._tryMove(this.selected, sq)) { this._clearSel(); return; }
      if (piece && piece.color === this.chess.turn()) { this._select(sq); return; }
      this._clearSel(); return;
    }
    if (!piece || piece.color !== this.chess.turn()) { this._clearSel(); return; }
    // begin drag of own piece
    e.preventDefault();
    this._select(sq);
    const p = this.pieces[sq]; if (!p) return;
    const rect = this.root.getBoundingClientRect();
    this.drag = { from: sq, p, rect, moved: false };
    p.el.classList.add('drag');
    this._moveDragEl(e);
    window.addEventListener('pointermove', this._mv = ev => this._onMoveDrag(ev));
    window.addEventListener('pointerup', this._up = ev => this._onUp(ev));
    try { this.pieceLayer.setPointerCapture?.(e.pointerId); } catch {}
  }
  _moveDragEl(e) {
    const { rect, p } = this.drag;
    const sz = rect.width / 8;
    const x = (e.clientX - rect.left - sz / 2) / rect.width * 800;  // % of one square units
    const y = (e.clientY - rect.top - sz / 2) / rect.height * 800;
    p.el.style.transform = `translate(${x}%, ${y}%) scale(1.08)`;
  }
  _onMoveDrag(e) { if (!this.drag) return; this.drag.moved = true; this._moveDragEl(e); const sq = this._pointSquare(e); this._hoverSquare(sq); }
  _hoverSquare(sq) {
    for (const d of Object.values(this.squares)) d.classList.remove('hover');
    if (sq && this._dests(this.drag.from).includes(sq)) this.squares[sq].classList.add('hover');
  }
  _onUp(e) {
    window.removeEventListener('pointermove', this._mv);
    window.removeEventListener('pointerup', this._up);
    for (const d of Object.values(this.squares)) d.classList.remove('hover');
    const d = this.drag; this.drag = null; if (!d) return;
    d.p.el.classList.remove('drag');
    const to = this._pointSquare(e);
    const moved = d.moved && to && to !== d.from && this._dests(d.from).includes(to);
    if (moved) { this._snapHome(d.p, d.from); this._tryMove(d.from, to); this._clearSel(); }
    else {
      this._snapHome(d.p, d.from);              // snap back to origin
      if (!d.moved) { /* was a click — keep selection for click-to-move */ }
      else this._clearSel();
    }
  }
  _snapHome(p, sq) { const [x, y] = this._xy(sq); p.el.style.transform = `translate(${x}%, ${y}%)`; }

  // ---------- arrows ----------
  setShapes(shapes) { this._drawShapes(shapes); }
  _drawShapes(shapes) {
    this._shapes = shapes || [];
    this.svg.querySelectorAll('line,circle').forEach(n => n.remove());
    for (const s of this._shapes) {
      const [fc, fr] = this._colrow(s.from), [tc, tr] = this._colrow(s.to);
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      // shorten so the arrowhead sits nicely
      const x1 = fc + .5, y1 = fr + .5, x2 = tc + .5, y2 = tr + .5;
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
      const ex = x2 - dx / len * .42, ey = y2 - dy / len * .42;
      ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
      ln.setAttribute('x2', ex); ln.setAttribute('y2', ey);
      ln.setAttribute('class', 'tb-arrow ' + (s.kind || ''));
      ln.setAttribute('marker-end', 'url(#tb-ah)');
      this.svg.appendChild(ln);
    }
  }
}
