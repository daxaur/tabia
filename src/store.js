// tabia — all state lives in the browser (localStorage). No server, no account.
const KEY = 'tabia.v1';
// Leitner-style spaced repetition intervals (ms). box 0 = due now.
const DAY = 86400000;
const INTERVALS = [0, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY, 90 * DAY];

function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function write(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

export const Store = {
  s: read(),
  _flush() { write(this.s); },

  prefs() {
    const p = (this.s.prefs ||= {});
    if (p.sound === undefined) p.sound = true;
    if (!p.orientation) p.orientation = 'white';
    if (!p.pieceChosen && p.pieceSet !== 'cburnett') p.pieceSet = 'cburnett'; // default to the lichess set
    return p;
  },
  setPref(k, v) { const p = this.prefs(); p[k] = v; if (k === 'pieceSet') p.pieceChosen = true; this._flush(); },
  account() { return this.s.account || null; },
  setAccount(a) { this.s.account = a; this._flush(); },
  clearAccount() { delete this.s.account; this._flush(); },

  // ---- user-created openings (live only in this browser) ----
  customOpenings() { return this.s.custom || []; },
  saveCustomOpening(op) {
    this.s.custom ||= [];
    const i = this.s.custom.findIndex(o => o.id === op.id);
    if (i >= 0) this.s.custom[i] = op; else this.s.custom.push(op);
    this._flush();
  },
  deleteCustomOpening(id) { this.s.custom = (this.s.custom || []).filter(o => o.id !== id); this._flush(); },

  // ---- saved / favourite openings ----
  favorites() { return this.s.favs || []; },
  isFavorite(id) { return (this.s.favs || []).includes(id); },
  toggleFavorite(id) {
    this.s.favs ||= [];
    const i = this.s.favs.indexOf(id);
    if (i >= 0) this.s.favs.splice(i, 1); else this.s.favs.push(id);
    this._flush();
    return this.isFavorite(id);
  },

  _rep(repId) { this.s.reps ||= {}; this.s.reps[repId] ||= { lines: {} }; return this.s.reps[repId]; },
  line(repId, lineId) {
    const r = this._rep(repId);
    r.lines[lineId] ||= { box: 0, due: 0, seen: 0, ok: 0, fail: 0 };
    return r.lines[lineId];
  },
  // SRS update after drilling a whole line
  record(repId, lineId, success) {
    const l = this.line(repId, lineId);
    l.seen++;
    if (success) { l.ok++; l.box = Math.min(INTERVALS.length - 1, l.box + 1); }
    else { l.fail++; l.box = Math.max(0, l.box - 1); }
    l.due = Date.now() + INTERVALS[l.box];
    this._flush();
    return l;
  },
  isDue(repId, lineId) { return this.line(repId, lineId).due <= Date.now(); },
  discover(repId, lineId) { const l = this.line(repId, lineId); if (!l.disc) { l.disc = 1; this._flush(); } },
  isDiscovered(repId, lineId) { return !!this.line(repId, lineId).disc; },
  discoveredCount(repId, lineIds) { return lineIds.filter(id => this.isDiscovered(repId, id)).length; },
  // pick the next line to drill from a list of lineIds: most overdue / lowest box first
  pickNext(repId, lineIds) {
    const now = Date.now();
    const scored = lineIds.map(id => {
      const l = this.line(repId, id);
      const overdue = now - l.due;           // bigger = more overdue
      return { id, box: l.box, overdue, seen: l.seen };
    });
    scored.sort((a, b) => {
      const aDue = a.overdue >= 0, bDue = b.overdue >= 0;
      if (aDue !== bDue) return aDue ? -1 : 1;          // due lines first
      if (a.box !== b.box) return a.box - b.box;          // weakest first
      return b.overdue - a.overdue;                       // most overdue first
    });
    return scored[0]?.id;
  },
  dueCount(repId, lineIds) { return lineIds.filter(id => this.isDue(repId, id)).length; },
  mastery(repId, lineId) { return this.line(repId, lineId).box; },
  reset(repId) { delete this._rep(repId).lines; this.s.reps[repId] = { lines: {} }; this._flush(); },
};
