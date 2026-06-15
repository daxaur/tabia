// tabia — custom, dependency-free interactive board (click-to-move + drag), chess.js-backed.
import { Chess } from './vendor/chess.js';

const FILES = 'abcdefgh';
const GLYPH = { p:'P', n:'N', b:'B', r:'R', q:'Q', k:'K' };

export class Board {
  /**
   * @param {HTMLElement} root
   * @param {object} opts  { orientation, pieceSet, interactive, onMove(from,to,promo)->void }
   */
  constructor(root, opts = {}) {
    this.root = root;
    this.orientation = opts.orientation || 'white';
    this.pieceSet = opts.pieceSet || 'maestro';
    this.interactive = opts.interactive !== false;
    this.onMove = opts.onMove || (() => {});
    this.chess = new Chess();
    this.selected = null;
    this.lastMove = null;     // [from,to]
    this.shapes = [];          // [{from,to,kind}]
    this.locked = false;       // block input (e.g. during opponent reply)
    this._cells = {};
    this._build();
    this.render();   // show the starting position immediately
  }

  setPieceSet(s) { this.pieceSet = s; this.render(); }
  flip() { this.orientation = this.orientation === 'white' ? 'black' : 'white'; this._build(); this.render(); }
  setOrientation(o) { if (o !== this.orientation) { this.orientation = o; this._build(); } this.render(); }
  lock(v) { this.locked = v; this.root.classList.toggle('locked', !!v); }

  setFen(fen, { lastMove = null, shapes = [] } = {}) {
    this.chess.load(fen);
    this.lastMove = lastMove;
    this.shapes = shapes;
    this.selected = null;
    this.render();
  }
  getFen() { return this.chess.fen(); }
  turn() { return this.chess.turn(); }

  _orderedSquares() {
    const ranks = this.orientation === 'white' ? [8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8];
    const files = this.orientation === 'white' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
    const out = [];
    for (const r of ranks) for (const f of files) out.push(FILES[f] + r);
    return out;
  }

  _build() {
    this.root.innerHTML = '';
    this.root.classList.add('tb-board');
    this._cells = {};
    for (const sq of this._orderedSquares()) {
      const f = FILES.indexOf(sq[0]), r = +sq[1];
      const light = (f + r) % 2 === 1;
      const cell = document.createElement('div');
      cell.className = 'tb-sq ' + (light ? 'tb-light' : 'tb-dark');
      cell.dataset.sq = sq;
      // coordinates on the edges
      const lastRank = this.orientation === 'white' ? 1 : 8;
      const firstFile = this.orientation === 'white' ? 'a' : 'h';
      if (r === lastRank) { const c = document.createElement('span'); c.className = 'tb-cf'; c.textContent = sq[0]; cell.appendChild(c); }
      if (sq[0] === firstFile) { const c = document.createElement('span'); c.className = 'tb-cr'; c.textContent = r; cell.appendChild(c); }
      if (this.interactive) cell.addEventListener('click', () => this._onClick(sq));
      this.root.appendChild(cell);
      this._cells[sq] = cell;
    }
  }

  _onClick(sq) {
    if (this.locked || !this.interactive) return;
    const piece = this.chess.get(sq);
    if (this.selected) {
      if (sq === this.selected) { this._clearSelection(); return; }
      // attempt move selected -> sq
      const dests = this._destsFrom(this.selected);
      if (dests.includes(sq)) {
        const from = this.selected;
        this._clearSelection();
        const needsPromo = this._isPromotion(from, sq);
        this.onMove(from, sq, needsPromo ? 'q' : undefined);
        return;
      }
      // re-select own piece
      if (piece && piece.color === this.chess.turn()) { this._select(sq); return; }
      this._clearSelection();
      return;
    }
    if (piece && piece.color === this.chess.turn()) this._select(sq);
  }

  _isPromotion(from, to) {
    const p = this.chess.get(from);
    return p && p.type === 'p' && (to[1] === '8' || to[1] === '1');
  }

  _destsFrom(sq) {
    return this.chess.moves({ square: sq, verbose: true }).map(m => m.to);
  }

  _select(sq) {
    this._clearSelection();
    this.selected = sq;
    this._cells[sq].classList.add('tb-selected');
    for (const d of this._destsFrom(sq)) {
      const target = this.chess.get(d);
      this._cells[d].classList.add(target ? 'tb-capture' : 'tb-dest');
    }
  }
  _clearSelection() {
    if (this.selected) {
      for (const c of this.root.querySelectorAll('.tb-selected,.tb-dest,.tb-capture'))
        c.classList.remove('tb-selected', 'tb-dest', 'tb-capture');
    }
    this.selected = null;
  }

  flash(sq, cls) {
    const c = this._cells[sq]; if (!c) return;
    c.classList.add(cls);
    setTimeout(() => c.classList.remove(cls), 650);
  }

  render() {
    const board = this.chess.board(); // 8x8 from rank8..rank1
    for (const sq in this._cells) {
      const cell = this._cells[sq];
      // remove piece + state classes
      const img = cell.querySelector('.tb-piece'); if (img) img.remove();
      cell.classList.remove('tb-last');
    }
    if (this.lastMove) for (const s of this.lastMove) this._cells[s]?.classList.add('tb-last');
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) continue;
      const sq = FILES[f] + (8 - r);
      const cell = this._cells[sq]; if (!cell) continue;
      const img = document.createElement('img');
      img.className = 'tb-piece';
      img.draggable = false;
      img.src = `src/pieces/${this.pieceSet}/${p.color === 'w' ? 'w' : 'b'}${GLYPH[p.type]}.svg`;
      img.alt = p.color + p.type;
      cell.appendChild(img);
    }
    // arrows / shapes
    this._renderShapes();
  }

  _renderShapes() {
    let svg = this.root.querySelector('.tb-shapes');
    if (svg) svg.remove();
    if (!this.shapes.length) return;
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'tb-shapes');
    svg.setAttribute('viewBox', '0 0 8 8');
    for (const sh of this.shapes) {
      const [fx, fy] = this._coord(sh.from), [tx, ty] = this._coord(sh.to);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', fx); line.setAttribute('y1', fy);
      line.setAttribute('x2', tx); line.setAttribute('y2', ty);
      line.setAttribute('class', 'tb-arrow ' + (sh.kind || ''));
      svg.appendChild(line);
    }
    this.root.appendChild(svg);
  }
  _coord(sq) {
    let f = FILES.indexOf(sq[0]), r = +sq[1];
    if (this.orientation === 'white') return [f + 0.5, 8 - r + 0.5];
    return [7 - f + 0.5, r - 1 + 0.5];
  }
}
