// tabia board — absolutely-positioned pieces that *slide*, buttery pointer-drag,
// click-to-move, animated programmatic moves, crisp arrows. Dependency-free, chess.js-backed.
import { Chess } from './vendor/chess.js?v=37';
import { Sound } from './sound.js?v=37';

const FILES = 'abcdefgh';
const GLYPH = { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' };

export class Board {
  /** @param {HTMLElement} root  @param {object} opts {orientation,pieceSet,interactive,onMove,animMs} */
  constructor(root, opts = {}) {
    this.root = root;
    this.orientation = opts.orientation || 'white';
    this.pieceSet = opts.pieceSet || 'cburnett';
    this.interactive = opts.interactive !== false;
    this.onMove = opts.onMove || (() => {});
    this.animMs = opts.animMs ?? 180;
    this.chess = new Chess();
    this.pieces = {};      // square -> { el, type, color }
    this.squares = {};     // square -> square div
    this.selected = null;
    this.lastMove = null;
    this.drag = null;
    this.userColor = opts.userColor || null;   // the human's side (enables pre-moves)
    this.premove = null;                        // { from, to, promo } queued for next turn
    this.moveMethod = opts.moveMethod || 'both';// 'both' | 'drag' | 'click'
    this._build();
    this._placeAll(false);
  }

  setUserColor(c) { this.userColor = c; }
  setMoveMethod(m) { this.moveMethod = m; }
  clearPremove() { this._clearPremove(); }
  // can the human make a normal move *right now*?
  _canMove() { return !this.locked && (!this.userColor || this.chess.turn() === this.userColor); }
  // if a pre-move is queued and now legal, play it
  tryPremove() {
    if (!this.premove) return false;
    const { from, to, promo } = this.premove;
    this.premove = null; this._markPremove();
    if (this._dests(from).includes(to)) { this.onMove(from, to, promo); return true; }
    return false;
  }
  _setPremove(from, to) {
    const promo = this.chess.get(from)?.type === 'p' && (to[1] === '8' || to[1] === '1') ? 'q' : undefined;
    this.premove = { from, to, promo }; this._markPremove();
  }
  _clearPremove() { this.premove = null; this._markPremove(); }
  _markPremove() {
    for (const d of Object.values(this.squares)) d.classList.remove('pre');
    if (this.premove) { this.squares[this.premove.from]?.classList.add('pre'); this.squares[this.premove.to]?.classList.add('pre'); }
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
    this._userShapes = [];          // right-click arrows {from,to}
    this._userCircles = new Set();  // right-click square highlights
    this._draw = null;              // in-progress right-drag
    if (this.interactive) {
      this.pieceLayer.addEventListener('pointerdown', e => this._onDown(e));
      this.sqLayer.addEventListener('pointerdown', e => this._onDown(e));
      this.root.addEventListener('contextmenu', e => e.preventDefault());
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
  setFen(fen, { lastMove = null, shapes = [], animate = !!lastMove, silent = false } = {}) {
    this._clearSel();
    if (Array.isArray(lastMove)) lastMove = lastMove[0] ? { from: lastMove[0], to: lastMove[1] } : null;
    const prev = this.chess.fen();
    // detect move character BEFORE we load the new position (pieces map = old state)
    let snd = null;
    if (!silent && lastMove && prev !== fen) {
      const mover = this.pieces[lastMove.from];
      const capture = !!this.pieces[lastMove.to] ||
        (mover && mover.type === 'p' && lastMove.from[0] !== lastMove.to[0] && !this.pieces[lastMove.to]); // incl. en passant
      const castle = mover && mover.type === 'k' &&
        Math.abs(FILES.indexOf(lastMove.from[0]) - FILES.indexOf(lastMove.to[0])) === 2;
      snd = { capture, castle };
    }
    this.chess.load(fen);
    this.lastMove = lastMove;
    // only slide if the moving piece is actually present on `from`; otherwise just
    // place every piece from scratch (prevents phantom animations losing pieces)
    if (animate && lastMove && prev !== fen && this.pieces[lastMove.from]) this._animateTo(lastMove);
    else this._placeAll(false);
    this._markLast();
    this._markPremove();   // keep a queued pre-move highlighted across the opponent's reply
    this._drawShapes(shapes);
    if (snd) {
      const inChk = (this.chess.isCheck?.() || this.chess.inCheck?.()) ?? false;
      if (inChk) Sound.check();
      else if (snd.castle) Sound.castle();
      else if (snd.capture) Sound.capture();
      else Sound.move();
    }
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
    // self-heal to the EXACT position: hard reset if any square is missing or wrong
    let bad = Object.keys(want).length !== Object.keys(this.pieces).length;
    if (!bad) for (const sq in want) { const p = this.pieces[sq]; if (!p || p.type !== want[sq].type || p.color !== want[sq].color) { bad = true; break; } }
    if (bad) this._placeAll(false);
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
    if (!this.interactive) return;
    if (e.button === 2) { e.preventDefault(); this._startDraw(e); return; }   // right-click: draw
    if (e.button !== 0) return;
    this._clearUser(); this._clearPremove();                                  // left-click clears annotations + premove
    const sq = this._pointSquare(e); if (!sq) return;
    if (!this._canMove()) {                                                   // not our turn → queue a pre-move
      const pc = this.chess.get(sq);
      if (this.selected && sq !== this.selected) {                            // click-to-move premove (2nd click)
        this._setPremove(this.selected, sq); this._clearSel(); return;
      }
      if (this.userColor && pc && pc.color === this.userColor) this._startPremoveDrag(e, sq);
      else this._clearSel();
      return;
    }
    const piece = this.chess.get(sq);
    // click-to-move target
    if (this.selected && sq !== this.selected) {
      if (this._tryMove(this.selected, sq)) { this._clearSel(); return; }
      if (piece && piece.color === this.chess.turn()) { this._select(sq); return; }
      this._clearSel(); return;
    }
    if (!piece || piece.color !== this.chess.turn()) { this._clearSel(); return; }
    // select the piece
    e.preventDefault();
    this._select(sq);
    if (this.moveMethod === 'click') return;     // click-only: move happens on the next click
    // begin drag of own piece
    const p = this.pieces[sq]; if (!p) return;
    const rect = this.root.getBoundingClientRect();
    this.drag = { from: sq, p, rect, moved: false };
    p.el.classList.add('drag');
    this._moveDragEl(e);
    window.addEventListener('pointermove', this._mv = ev => this._onMoveDrag(ev));
    window.addEventListener('pointerup', this._up = ev => this._onUp(ev));
    try { this.pieceLayer.setPointerCapture?.(e.pointerId); } catch {}
  }
  _startPremoveDrag(e, sq) {
    e.preventDefault();
    this._select(sq);
    const p = this.pieces[sq]; if (!p) return;
    const rect = this.root.getBoundingClientRect();
    this.drag = { from: sq, p, rect, moved: false, pre: true };
    p.el.classList.add('drag');
    this._moveDragEl(e);
    window.addEventListener('pointermove', this._mv = ev => this._onMoveDrag(ev));
    window.addEventListener('pointerup', this._up = ev => this._onUp(ev));
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
    if (d.pre) {                                  // queue a pre-move (any target square)
      this._snapHome(d.p, d.from);
      if (d.moved && to && to !== d.from) { this._setPremove(d.from, to); this._clearSel(); }
      // a plain click (no drag): keep the piece selected so a 2nd click can target it
      return;
    }
    const moved = d.moved && to && to !== d.from && this._dests(d.from).includes(to);
    if (moved) { this._snapHome(d.p, d.from); this._tryMove(d.from, to); this._clearSel(); }
    else {
      this._snapHome(d.p, d.from);              // snap back to origin
      if (!d.moved) { if (this.moveMethod === 'drag') this._clearSel(); /* else keep selection for click-to-move */ }
      else this._clearSel();
    }
  }
  _snapHome(p, sq) { const [x, y] = this._xy(sq); p.el.style.transform = `translate(${x}%, ${y}%)`; }

  // ---------- right-click annotations (lichess-style) ----------
  _startDraw(e) {
    const sq = this._pointSquare(e); if (!sq) return;
    this._draw = { from: sq, to: sq };
    window.addEventListener('pointermove', this._dmv = ev => this._onDraw(ev));
    window.addEventListener('pointerup', this._dup = ev => this._endDraw(ev));
    this._renderShapes();
  }
  _onDraw(e) {
    if (!this._draw) return;
    const sq = this._pointSquare(e); if (sq) this._draw.to = sq;
    this._renderShapes();
  }
  _endDraw(e) {
    window.removeEventListener('pointermove', this._dmv);
    window.removeEventListener('pointerup', this._dup);
    const d = this._draw; this._draw = null; if (!d) return;
    if (d.from === d.to) {                       // a tap = toggle a circle
      this._userCircles.has(d.from) ? this._userCircles.delete(d.from) : this._userCircles.add(d.from);
    } else {                                     // a drag = toggle an arrow
      const i = this._userShapes.findIndex(s => s.from === d.from && s.to === d.to);
      i >= 0 ? this._userShapes.splice(i, 1) : this._userShapes.push({ from: d.from, to: d.to });
    }
    this._renderShapes();
  }
  _clearUser() {
    if (!this._userShapes.length && !this._userCircles.size) return;
    this._userShapes = []; this._userCircles.clear(); this._renderShapes();
  }

  // ---------- arrows + circles (crisp shaft + filled triangular head) ----------
  setShapes(shapes) { this._shapes = shapes || []; this._renderShapes(); }
  _drawShapes(shapes) { this._shapes = shapes || []; this._renderShapes(); }
  _renderShapes() {
    this.svg.querySelectorAll('.tb-arrow,.tb-circle').forEach(n => n.remove());
    const arrows = [...this._shapes, ...this._userShapes.map(s => ({ ...s, user: true }))];
    if (this._draw && this._draw.from !== this._draw.to) arrows.push({ ...this._draw, user: true, live: true });
    for (const s of arrows) this._arrow(s);
    const circles = new Set(this._userCircles);
    if (this._draw && this._draw.from === this._draw.to) circles.add(this._draw.from);
    for (const sq of circles) this._circle(sq);
  }
  _arrow(s) {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 0.17, HEAD = 0.42, HALF = 0.26, TAIL = 0.32; // square units
    const [fc, fr] = this._colrow(s.from), [tc, tr] = this._colrow(s.to);
    let x1 = fc + .5, y1 = fr + .5; const x2 = tc + .5, y2 = tr + .5;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, px = -uy, py = ux;
    x1 += ux * TAIL; y1 += uy * TAIL;                  // clear the origin piece
    const bx = x2 - ux * HEAD, by = y2 - uy * HEAD;    // base of the head
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'tb-arrow ' + (s.user ? 'user ' : '') + (s.live ? 'live ' : '') + (s.kind || ''));
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
    ln.setAttribute('x2', bx); ln.setAttribute('y2', by);
    ln.setAttribute('stroke-width', W); ln.setAttribute('stroke-linecap', 'round');
    const head = document.createElementNS(NS, 'polygon');
    head.setAttribute('points',
      `${x2},${y2} ${bx + px * HALF},${by + py * HALF} ${bx - px * HALF},${by - py * HALF}`);
    g.appendChild(ln); g.appendChild(head);
    this.svg.appendChild(g);
  }
  _circle(sq) {
    const NS = 'http://www.w3.org/2000/svg';
    const [c, r] = this._colrow(sq);
    const el = document.createElementNS(NS, 'circle');
    el.setAttribute('cx', c + .5); el.setAttribute('cy', r + .5); el.setAttribute('r', 0.46);
    el.setAttribute('class', 'tb-circle');
    el.setAttribute('fill', 'none'); el.setAttribute('stroke-width', 0.06);
    this.svg.appendChild(el);
  }
}
