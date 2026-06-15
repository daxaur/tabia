import { Chess } from './vendor/chess.js';
import { Board } from './board.js';
import { openings, groupsOf } from './data/index.js';
import { Store } from './store.js';

const repertoire = openings[0];     // single opening for explore/train (multi-opening ready)
let currentOpening = openings[0];

const REPO_URL = 'https://github.com/daxaur/tabia';
const $ = s => document.querySelector(s);
const norm = s => s.replace(/[+#!?]/g, '');
const groupPill = g => ({ accepted: 'acc', declined: 'dec', ryder: 'ryd' }[g] || '');
const groupLabel = g => ({ accepted: 'Accepted', declined: 'Declined', ryder: 'Ryder' }[g] || g);

document.getElementById('ghlink').href = REPO_URL;

// ---------- piece set + view nav ----------
let pieceSet = Store.prefs().pieceSet || 'cardinal';
document.querySelectorAll('#pieceSeg button').forEach(b => {
  b.classList.toggle('active', b.dataset.piece === pieceSet);
  b.addEventListener('click', () => {
    pieceSet = b.dataset.piece; Store.setPref('pieceSet', pieceSet);
    document.querySelectorAll('#pieceSeg button').forEach(x => x.classList.toggle('active', x === b));
    exBoard.setPieceSet(pieceSet); trBoard.setPieceSet(pieceSet);
  });
});
function showView(v) {
  document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
  document.querySelectorAll('nav.top button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  if (v === 'home') renderHome();
  if (v === 'opening') renderOpening();
  if (v === 'train') refreshMastery();
  window.scrollTo(0, 0);
}
document.querySelectorAll('nav.top button').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));

// ============================== HOME (library) ==============================
function statsFor(op) {
  const ids = op.lines.map(l => l.id);
  return { ids, due: Store.dueCount(op.id, ids), mastered: ids.filter(id => Store.mastery(op.id, id) >= 4).length,
    reps: ids.reduce((a, id) => a + Store.line(op.id, id).seen, 0) };
}
function previewBoard(el, op, plies, interactive = false) {
  const b = new Board(el, { interactive, pieceSet });
  const g = new Chess(); const main = op.lines.find(l => l.star) || op.lines[0];
  for (const [san] of main.moves.slice(0, plies)) g.move(san);
  const h = g.history({ verbose: true });
  b.setFen(g.fen(), { lastMove: h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null });
  return b;
}
function renderHome() {
  $('#libSub').textContent = `${openings.length} opening${openings.length > 1 ? 's' : ''} · drill any line`;
  $('#library').innerHTML = openings.map((op, i) => {
    const s = statsFor(op); const pct = Math.round(s.mastered / s.ids.length * 100);
    return `<div class="opcard" data-op="${op.id}" style="animation-delay:${i * 80}ms">
      <div class="opcard-board"><div id="mini-${op.id}"></div></div>
      <div class="opcard-body">
        <span class="ct">${op.eco} · ${op.lines.length} lines${s.due ? ` · <b>${s.due} due</b>` : ''}</span>
        <h3>${op.name}</h3>
        <p>${op.oneLiner}</p>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <span class="go">${pct ? `${pct}% mastered` : 'Start training'} →</span>
      </div></div>`;
  }).join('');
  openings.forEach(op => previewBoard(document.getElementById(`mini-${op.id}`), op, 7));
  $('#library').querySelectorAll('[data-op]').forEach(c => c.onclick = () => openOpening(c.dataset.op));
  const s0 = statsFor(repertoire);
  $('#footStats').textContent = `${s0.reps} reps logged · ${s0.mastered}/${s0.ids.length} lines mastered`;
}

// ============================== OPENING DETAIL (folders → branches) ==============================
let opPreview = null;
function openOpening(id) { currentOpening = openings.find(o => o.id === id) || openings[0]; showView('opening'); }
function renderOpening() {
  const op = currentOpening;
  $('#crumbName').textContent = op.name;
  $('#opEco').textContent = `opening · ${op.eco}`;
  $('#opName').textContent = op.name;
  $('#opOneliner').textContent = op.oneLiner;
  $('#opBoard').innerHTML = ''; opPreview = previewBoard($('#opBoard'), op, 9);
  $('#opTree').innerHTML = groupsOf(op).map(grp => `
    <div class="folder" data-folder="${grp.key}">
      <div class="fhead"><span class="fchev">▸</span> ${grp.label} <span class="cnt">${grp.lines.length} lines · ${grp.blurb}</span></div>
      <div class="fbody">${grp.lines.map(l => {
        const box = Store.mastery(op.id, l.id), due = Store.isDue(op.id, l.id);
        const fm = l.moves.slice(0, 8).map((m, i) => i % 2 ? m[0] : `${Math.floor(i / 2) + 1}.${m[0]}`).join(' ');
        return `<div class="branch" data-line="${l.id}">
          <div><div class="nm">${l.name}</div><div class="mv">${fm}…</div></div>
          <div class="bend">${due ? '<span class="pill due">due</span>' : ''}<span class="mastery">${'●'.repeat(box) + '○'.repeat(6 - box)}</span></div>
        </div>`;}).join('')}</div>
    </div>`).join('');
  $('#opTree').querySelectorAll('.fhead').forEach(h => h.onclick = () => h.parentElement.classList.toggle('closed'));
  $('#opTree').querySelectorAll('.branch').forEach(b => b.onclick = () => { exSelectLine(b.dataset.line); showView('explore'); });
}
$('#crumbHome').onclick = () => showView('home');
$('#opTrain').onclick = () => showView('train');
$('#opExplore').onclick = () => showView('explore');

// ============================== EXPLORE ==============================
const exBoard = new Board($('#exBoard'), { pieceSet, onMove: exMove });
let exGame = new Chess(), exLine = null, exPly = 0;
function buildExSelect() {
  $('#exSelect').innerHTML = repertoire.lines.map((l, i) =>
    `<option value="${i}">${groupLabel(l.group)} — ${l.name}</option>`).join('');
}
function loadExLine(i) {
  exLine = repertoire.lines[i]; exGame = new Chess(); exPly = 0;
  exBoard.setOrientation('white'); exBoard.setFen(exGame.fen());
  $('#exIdea').textContent = exLine.idea || '';
  renderExMoves(); $('#exComment').textContent = 'Step through to read the plan move by move.';
}
function renderExMoves() {
  const hist = exGame.history();
  let out = '';
  for (let i = 0; i < exLine.moves.length; i += 2) {
    const w = exLine.moves[i]?.[0], b = exLine.moves[i + 1]?.[0];
    const wc = i === exPly ? 'cur' : '', bc = i + 1 === exPly ? 'cur' : '';
    out += `<span class="num">${i / 2 + 1}.</span> <span class="${wc}">${w || ''}</span> <span class="${bc}">${b || ''}</span> `;
  }
  $('#exMoves').innerHTML = out;
}
function exStep(dir) {
  if (dir > 0 && exPly < exLine.moves.length) {
    const [san, comment] = exLine.moves[exPly];
    const mv = exGame.move(san);
    exBoard.setFen(exGame.fen(), { lastMove: mv ? [mv.from, mv.to] : null });
    $('#exComment').textContent = comment || (exPly % 2 === 0 ? '' : '…');
    exPly++;
  } else if (dir < 0 && exPly > 0) {
    exGame.undo(); exPly--;
    const h = exGame.history({ verbose: true });
    exBoard.setFen(exGame.fen(), { lastMove: h.length ? [h[h.length - 1].from, h[h.length - 1].to] : null });
    $('#exComment').textContent = exPly > 0 ? (exLine.moves[exPly - 1][1] || '') : 'Start of the line.';
  }
  renderExMoves();
}
function exGoto(target) { while (exPly < target) exStep(1); while (exPly > target) exStep(-1); }
function exMove(from, to, promo) {  // free exploration
  const mv = exGame.move({ from, to, promotion: promo });
  if (!mv) return;
  exPly = exGame.history().length;
  exBoard.setFen(exGame.fen(), { lastMove: [from, to] });
  $('#exComment').textContent = 'Free exploration — Reset (⏮) to return to the line.';
  renderExMoves();
}
$('#exNext').onclick = () => exStep(1);
$('#exPrev').onclick = () => exStep(-1);
$('#exFirst').onclick = () => exGoto(0);
$('#exLast').onclick = () => exGoto(exLine.moves.length);
$('#exFlip').onclick = () => exBoard.flip();
$('#exSelect').onchange = e => loadExLine(+e.target.value);
function exSelectLine(id) { const i = repertoire.lines.findIndex(l => l.id === id); if (i >= 0) { $('#exSelect').value = i; loadExLine(i); } }
document.addEventListener('keydown', e => {
  if (!$('#view-explore').classList.contains('active')) return;
  if (e.key === 'ArrowRight') exStep(1);
  if (e.key === 'ArrowLeft') exStep(-1);
});

// ============================== TRAIN (drill) ==============================
const trBoard = new Board($('#trBoard'), { pieceSet, onMove: trMove });
let trGame = new Chess();
const drill = { active: false, scope: 'all', line: null, ply: 0, mistake: false, correct: 0, wrong: 0, hinted: false };

function scopedLineIds() {
  return repertoire.lines.filter(l => drill.scope === 'all' || l.group === drill.scope).map(l => l.id);
}
function setScope(s) {
  drill.scope = s;
  document.querySelectorAll('#trScope button').forEach(b => b.classList.toggle('active', b.dataset.scope === s));
  refreshMastery();
}
document.querySelectorAll('#trScope button').forEach(b => b.onclick = () => setScope(b.dataset.scope));

function lineById(id) { return repertoire.lines.find(l => l.id === id); }

function startSession() {
  drill.active = true; drill.correct = 0; drill.wrong = 0;
  $('#trCorrect').textContent = 0; $('#trWrong').textContent = 0;
  nextLine();
}
function nextLine() {
  const ids = scopedLineIds();
  const pick = Store.pickNext(repertoire.id, ids);
  beginLine(lineById(pick));
}
function beginLine(line) {
  drill.line = line; drill.ply = 0; drill.mistake = false; drill.hinted = false;
  trGame = new Chess();
  trBoard.setOrientation('white');
  trBoard.setFen(trGame.fen());
  trBoard.lock(false);
  $('#trLine').textContent = `${groupLabel(line.group)} — ${line.name}`;
  setStatus('neu', 'Your move — play White’s repertoire move.', line.idea || '');
}
function setStatus(cls, msg, sub = '') {
  const s = $('#trStatus'); s.className = 'status ' + cls; s.textContent = msg;
  $('#trSub').textContent = sub;
}
function expectedSan() { return drill.line.moves[drill.ply]?.[0]; }

function trMove(from, to, promo) {
  if (!drill.active || trGame.turn() !== 'w') return;
  const exp = expectedSan();
  const before = trGame.fen();
  const mv = trGame.move({ from, to, promotion: promo });
  if (!mv) return;
  if (norm(mv.san) === norm(exp)) {
    drill.correct += drill.hinted ? 0 : 1;
    $('#trCorrect').textContent = drill.correct;
    trBoard.setFen(trGame.fen(), { lastMove: { from, to } });
    trBoard.flash(to, 'ok');
    const cm = drill.line.moves[drill.ply][1];
    setStatus('ok', `✓ ${mv.san}`, cm || '');
    drill.ply++; drill.hinted = false;
    setTimeout(afterUserMove, 380);
  } else {
    trGame.undo();
    trBoard.setFen(before);              // sync revert — snap the dragged piece home
    drill.wrong++; drill.mistake = true;
    $('#trWrong').textContent = drill.wrong;
    setStatus('bad', `✗ Not the move — it’s ${exp}`, 'Watch it, then continue.');
    trBoard.lock(true);
    setTimeout(() => {
      const m2 = trGame.move(exp);
      trBoard.setFen(trGame.fen(), { lastMove: { from: m2.from, to: m2.to } });
      trBoard.flash(m2.to, 'bad');
      drill.ply++;
      setTimeout(afterUserMove, 460);
    }, 420);
  }
}
function afterUserMove() {
  trBoard.lock(false);
  if (drill.ply >= drill.line.moves.length) return finishLine();
  // opponent (Black) reply
  const bsan = drill.line.moves[drill.ply][0];
  const m = trGame.move(bsan);
  trBoard.setFen(trGame.fen(), { lastMove: m ? [m.from, m.to] : null });
  drill.ply++;
  if (drill.ply >= drill.line.moves.length) return finishLine();
  setStatus('neu', 'Your move.', '');
}
function finishLine() {
  trBoard.lock(true);
  const ok = !drill.mistake;
  Store.record(repertoire.id, drill.line.id, ok);
  refreshMastery();
  setStatus(ok ? 'ok' : 'bad',
    ok ? '✓ Clean line! Filed away — back later.' : '↻ Logged — this one returns soon.',
    'Next line loading…');
  setTimeout(() => { if (drill.active) nextLine(); }, 1300);
}
function refreshMastery() {
  const ids = scopedLineIds();
  $('#trDue').textContent = Store.dueCount(repertoire.id, ids);
  const dots = b => '●'.repeat(b) + '○'.repeat(6 - b);
  $('#trMastery').innerHTML = repertoire.lines
    .filter(l => drill.scope === 'all' || l.group === drill.scope)
    .map(l => {
      const box = Store.mastery(repertoire.id, l.id);
      const sel = drill.line && drill.line.id === l.id ? 'sel' : '';
      const dueDot = Store.isDue(repertoire.id, l.id) ? '<span class="pill ' + groupPill(l.group) + '">due</span>' : '';
      return `<div class="varitem ${sel}" data-line="${l.id}">
        <div><span class="nm">${l.name}</span><div class="mastery">${dots(box)}</div></div>
        ${dueDot}</div>`;
    }).join('');
  $('#trMastery').querySelectorAll('[data-line]').forEach(el => el.onclick = () => {
    if (!drill.active) drill.active = true;
    beginLine(lineById(el.dataset.line));
  });
}
$('#trStart').onclick = startSession;
$('#trSkip').onclick = () => { if (drill.active) nextLine(); };
$('#trFlip').onclick = () => trBoard.flip();
$('#trHint').onclick = () => {
  if (!drill.active || trGame.turn() !== 'w') return;
  const exp = expectedSan(); if (!exp) return;
  const m = trGame.move(exp); const from = m.from, to = m.to; trGame.undo();
  drill.hinted = true;
  trBoard.setShapes([{ from, to }]);
  setStatus('neu', '💡 Hint', 'The arrow marks your move.');
};

// ---------- hero dot-dispersion animation ----------
function heroFx() {
  const c = document.getElementById('heroFx'); if (!c) return;
  const ctx = c.getContext('2d'); const DPR = Math.min(2, window.devicePixelRatio || 1);
  let w, h, dots = [], t = 0;
  function build() {
    dots = []; const gap = 17 * DPR;
    for (let y = gap; y < h - gap; y += gap) for (let x = gap; x < w - gap; x += gap) {
      const disp = Math.max(0, (x / w - 0.42)) / 0.58;
      dots.push({ x0: x, y0: y, disp, ph: Math.random() * 6.28, sp: 0.4 + Math.random() });
    }
  }
  function resize() {
    const r = c.parentElement.getBoundingClientRect();
    w = c.width = Math.max(1, r.width * DPR); h = c.height = Math.max(1, r.height * DPR);
    c.style.width = r.width + 'px'; c.style.height = r.height + 'px'; build();
  }
  function frame() {
    t += 0.012; ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      const amp = d.disp * d.disp * 15 * DPR;
      const x = d.x0 + Math.cos(t * d.sp + d.ph) * amp, y = d.y0 + Math.sin(t * d.sp * 1.3 + d.ph) * amp;
      const a = 0.05 + d.disp * 0.24 + Math.sin(t * 2 + d.ph) * 0.04;
      ctx.beginPath(); ctx.arc(x, y, (0.8 + d.disp * 1.2) * DPR, 0, 6.28);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, a)})`; ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  resize(); window.addEventListener('resize', resize); frame();
}

// ---------- boot ----------
buildExSelect(); loadExLine(0);
refreshMastery(); renderHome(); heroFx();
window.addEventListener('hashchange', () => showView(location.hash.slice(1) || 'home'));
showView(['explore', 'train'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home');
