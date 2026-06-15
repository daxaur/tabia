import { Chess } from './vendor/chess.js';
import { Board } from './board.js';
import { openings, groupsOf } from './data/index.js';
import { Store } from './store.js';
import { evaluate, winPct, fmtEval } from './eval.js';
import { coachSay, MSG_FIELDS, messagesFor, saveMessages } from './coach.js';
import { Sound } from './sound.js';
import { Auth } from './auth.js';
import { ICON, siteIcon } from './icons.js';

let repo = openings[0];             // the opening currently loaded in the study hub
let currentOpening = openings[0];
const userColor = () => (repo.color === 'b' ? 'b' : 'w');
const userOrient = () => (userColor() === 'b' ? 'black' : 'white');

const REPO_URL = 'https://github.com/daxaur/tabia';
const $ = s => document.querySelector(s);
const norm = s => s.replace(/[+#!?]/g, '');
const groupPill = g => ({ accepted: 'acc', declined: 'dec', ryder: 'ryd' }[g] || '');
const groupLabel = g => ({ accepted: 'Accepted', declined: 'Declined', ryder: 'Ryder' }[g] || g);

document.getElementById('ghlink').href = REPO_URL;
// brand logos
$('#ghIcon').innerHTML = ICON.github;
$('#connectIcon').innerHTML = ICON.link;
$('#liLogo').innerHTML = ICON.lichess;
$('#ccLogo').innerHTML = ICON.chesscom;

// ---------- connect account (Lichess OAuth / Chess.com public) ----------
function renderAccount() {
  const a = Auth.current();
  $('#connectIcon').innerHTML = a ? siteIcon(a.site) : ICON.link;
  $('#connectLabel').textContent = a ? a.username : 'Connect';
  $('#connectBtn').classList.toggle('linked', !!a);
  const st = $('#connectStatus');
  if (a) {
    st.hidden = false;
    st.innerHTML = `<div class="cs-on"><span class="bi">${siteIcon(a.site)}</span> <b>${a.username}</b> · ${a.site === 'lichess' ? 'Lichess' : 'Chess.com'}${a.rating ? ' · ' + a.rating : ''}
      <a href="${a.url}" target="_blank" class="cs-link">view profile ↗</a></div>
      <button class="btn ghost sm" id="connectDisc">Disconnect</button>`;
    $('#connectDisc').onclick = () => { Auth.disconnect(); renderAccount(); };
  } else { st.hidden = true; st.innerHTML = ''; }
}
$('#connectBtn').onclick = () => { renderAccount(); $('#connectModal').hidden = false; };
$('#connectClose').onclick = () => { $('#connectModal').hidden = true; };
$('#connectLichess').onclick = () => Auth.startLichess();
$('#connectChesscom').onclick = async () => {
  const st = $('#connectStatus'); st.hidden = false; st.innerHTML = '<div class="cs-busy">Linking…</div>';
  try { await Auth.connectChesscom($('#ccUser').value); renderAccount(); }
  catch (e) { st.hidden = false; st.innerHTML = `<div class="cs-err">${e.message}</div>`; }
};
Auth.handleRedirect().then(acc => { if (acc) { renderAccount(); $('#connectModal').hidden = false; } });

// ---------- piece set + view nav ----------
let pieceSet = Store.prefs().pieceSet || 'cardinal';
document.querySelectorAll('#pieceSeg button').forEach(b => {
  b.classList.toggle('active', b.dataset.piece === pieceSet);
  b.addEventListener('click', () => {
    pieceSet = b.dataset.piece; Store.setPref('pieceSet', pieceSet);
    document.querySelectorAll('#pieceSeg button').forEach(x => x.classList.toggle('active', x === b));
    trBoard.setPieceSet(pieceSet); renderMoves();
  });
});
function showView(v) {
  document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
  document.querySelectorAll('nav.top button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  if (v === 'home') renderHome();
  if (v === 'opening') renderOpening();
  if (v === 'train') enterTrain();
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
  const b = new Board(el, { interactive, pieceSet, orientation: op.color === 'b' ? 'black' : 'white' });
  const g = new Chess(); const main = op.lines.find(l => l.star) || op.lines[0];
  for (const [san] of main.moves.slice(0, plies)) g.move(san);
  const h = g.history({ verbose: true });
  b.setFen(g.fen(), { lastMove: h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null, silent: true });
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
  const s0 = statsFor(repo);
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
  $('#opTree').querySelectorAll('.branch').forEach(b => b.onclick = () => { showView('train'); trSelectLine(b.dataset.line); });
}
$('#crumbHome').onclick = () => showView('home');
$('#opTrain').onclick = () => showView('train');

// ============================== STUDY HUB (modes + bot + eval + sound) ==============================
const GLYPH = { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' };
const MODE_META = {
  learn:    { icon: '📖', name: 'Learn',    intro: 'Learn mode — I’ll walk you through each line. Press Start, then use › / ‹ (or arrow keys) to step.' },
  practice: { icon: '🎯', name: 'Practice', intro: 'Practice mode — play the moves yourself. Slip up as many times as you like; nothing is penalised.' },
  drill:    { icon: '🥁', name: 'Drill',    intro: 'Drill mode — spaced repetition. Get a line clean and it won’t come back for a while.' },
  hyper:    { icon: '⚡', name: 'Hyper',    intro: 'Hyper mode — I become your opponent and play a random line. Hold your repertoire, then start another round.' },
};

const trBoard = new Board($('#trBoard'), { pieceSet, onMove: trMove });
let trGame = new Chess();
const drill = { active: false, mode: 'drill', scope: 'all', line: null, ply: 0, mistake: false, correct: 0, wrong: 0, rounds: 0, hinted: false };
let hyper = null;   // { candidates:[lines], ply } while a Hyper round is live

Sound.enabled = Store.prefs().sound !== false;

function scopedLines() { return repo.lines.filter(l => drill.scope === 'all' || l.group === drill.scope); }
function scopedLineIds() { return scopedLines().map(l => l.id); }
function lineById(id) { return repo.lines.find(l => l.id === id); }

function setScope(s) {
  drill.scope = s;
  document.querySelectorAll('#trScope button').forEach(b => b.classList.toggle('active', b.dataset.scope === s));
  refreshMastery();
}
// rebuild the scope chips from the loaded opening's own groups
function buildScope() {
  if (!repo.lines.some(l => l.group === drill.scope)) drill.scope = 'all';
  const groups = groupsOf(repo);
  $('#trScope').innerHTML = `<button data-scope="all" class="${drill.scope === 'all' ? 'active' : ''}">All</button>` +
    groups.map(g => `<button data-scope="${g.key}" class="${drill.scope === g.key ? 'active' : ''}">${g.label.split('·')[0].trim().slice(0, 8)}</button>`).join('');
  $('#trScope').querySelectorAll('button').forEach(b => b.onclick = () => setScope(b.dataset.scope));
}

function setMode(m) {
  drill.mode = m;
  document.querySelectorAll('#trModes .modetile').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
  $('#trModeIcon').textContent = MODE_META[m].icon;
  $('#trModeName').textContent = MODE_META[m].name;
  $('#trRestart').hidden = m !== 'hyper';
  $('#trSkip').hidden = m === 'hyper';
  $('#trStart').textContent = m === 'hyper' ? '▶ Start round' : '▶ Start';
  $('#linesPanel').style.display = m === 'hyper' ? 'none' : '';   // Hyper picks lines itself
  drill.active = false; drill.line = null; hyper = null;
  resetIdle();
  $('#trLineIdx').textContent = '';
  $('#trOpName').textContent = repo.name;
  coach(MODE_META[m].intro);
}
document.querySelectorAll('#trModes .modetile').forEach(b => b.onclick = () => setMode(b.dataset.mode));

// ---- coach + eval + helpers ----
function coach(text, cls = '') {
  const b = $('#trBubble'); b.textContent = text; b.className = 'coach-bubble' + (cls ? ' ' + cls : '');
  const av = $('#trAvatar'); av.className = 'coach-av' + (cls ? ' ' + cls : '');
}
function updateEval() {
  const raw = evaluate(trGame.fen());
  const e = userColor() === 'w' ? raw : -raw;   // always from the trainee's side
  const pct = Math.max(2, Math.min(98, winPct(e)));
  $('#trEvalFill').style.height = pct + '%';
  const r = $('#trEvalRead'); r.textContent = fmtEval(e);
  r.className = 'evread ' + (e > 0.4 ? 'up' : e < -0.4 ? 'down' : '');
}
function setArrows() {
  const learn = drill.mode === 'learn' && drill.active && drill.line;
  $('#trNext').disabled = !learn || drill.ply >= drill.line.moves.length;
  $('#trPrev').disabled = !learn || drill.ply === 0;
}
function renderMoves() {
  const h = trGame.history({ verbose: true });
  if (!h.length) { $('#trMoves').innerHTML = '<span class="mvempty">—</span>'; return; }
  let html = '';
  for (let i = 0; i < h.length; i++) {
    const m = h[i];
    if (i % 2 === 0) html += `<span class="mvno">${i / 2 + 1}.</span>`;
    const ic = m.piece === 'p' ? '' : `<img class="mvpc" src="src/pieces/${pieceSet}/${m.color}${GLYPH[m.piece]}.svg" alt="">`;
    html += `<span class="mv${i === h.length - 1 ? ' cur' : ''}">${ic}${m.san}</span>`;
  }
  $('#trMoves').innerHTML = html;
  $('#trMoves .cur')?.scrollIntoView({ block: 'nearest' });
}
function resetIdle() {
  trGame = new Chess(); trBoard.setOrientation(userOrient()); trBoard.setUserColor(userColor()); trBoard.clearPremove();
  trBoard.setFen(trGame.fen(), { silent: true }); trBoard.setShapes([]); trBoard.lock(true);
  updateEval(); renderMoves(); setArrows();
}
// (re)load the opening the user picked, ready an idle board
function enterTrain() {
  if (repo !== currentOpening) { repo = currentOpening; drill.active = false; drill.line = null; hyper = null; }
  buildScope();
  refreshMastery();
  setMode(drill.mode);
}
function setLineHeader(line) {
  $('#trOpName').textContent = repo.name;
  $('#trLineIdx').textContent = `#${repo.lines.indexOf(line) + 1} · ${line.name}`;
}

// ---- Learn / Practice / Drill ----
function startSession() {
  drill.active = true; drill.correct = 0; drill.wrong = 0;
  $('#trCorrect').textContent = 0; $('#trWrong').textContent = 0;
  coach(coachSay('start'));
  nextLine();
}
function nextLine() {
  const ids = scopedLineIds();
  beginLine(lineById(Store.pickNext(repo.id, ids) || ids[0]));
}
function beginLine(line) {
  drill.line = line; drill.ply = 0; drill.mistake = false; drill.hinted = false;
  trGame = new Chess(); trBoard.setOrientation(userOrient()); trBoard.setUserColor(userColor()); trBoard.clearPremove();
  trBoard.setFen(trGame.fen(), { silent: true }); trBoard.setShapes([]);
  Store.discover(repo.id, line.id);
  setLineHeader(line); refreshMastery(); updateEval(); renderMoves();
  if (drill.mode === 'learn') { trBoard.lock(true); coach(coachSay('learn') + ' ' + (line.idea || '')); setArrows(); return; }
  // practice / drill — if the trainee is Black, the opponent (White) opens
  if (userColor() === 'b') {
    trBoard.lock(true);
    setTimeout(() => {
      const m = trGame.move(line.moves[0][0]);
      trBoard.setFen(trGame.fen(), { lastMove: m ? { from: m.from, to: m.to } : null });
      drill.ply = 1; updateEval(); renderMoves(); trBoard.lock(false);
      coach(line.idea || 'Your move.'); trBoard.tryPremove();
    }, 350);
  } else {
    trBoard.lock(false); coach(line.idea || 'Your move — play your repertoire move.');
  }
  setArrows();
}
function expectedSan() { return drill.line.moves[drill.ply]?.[0]; }

function learnStep(dir) {
  if (!drill.active || drill.mode !== 'learn' || !drill.line) return;
  if (dir > 0) {
    if (drill.ply >= drill.line.moves.length) return;
    const [san, cm] = drill.line.moves[drill.ply];
    const m = trGame.move(san); if (!m) return;
    trBoard.setFen(trGame.fen(), { lastMove: { from: m.from, to: m.to } });
    coach(`${m.color === 'w' ? '▲' : '▼'} ${m.san}${cm ? ' — ' + cm : ''}`);
    drill.ply++;
    if (drill.ply >= drill.line.moves.length) coach('That’s the whole line. Try Practice, or pick another line.', 'ok');
  } else {
    if (drill.ply <= 0) return;
    trGame.undo(); drill.ply--;
    const h = trGame.history({ verbose: true });
    trBoard.setFen(trGame.fen(), { lastMove: h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null, silent: true });
    coach(drill.ply > 0 ? (drill.line.moves[drill.ply - 1][1] || drill.line.idea || '…') : 'Start of the line.');
  }
  updateEval(); renderMoves(); setArrows();
}

function trMove(from, to, promo) {
  if (!drill.active) return;
  if (drill.mode === 'hyper') return hyperUserMove(from, to, promo);
  if (drill.mode === 'learn' || trGame.turn() !== userColor()) return;
  const exp = expectedSan(), before = trGame.fen();
  const mv = trGame.move({ from, to, promotion: promo });
  if (!mv) return;
  if (norm(mv.san) === norm(exp)) {
    drill.correct += drill.hinted ? 0 : 1; $('#trCorrect').textContent = drill.correct;
    trBoard.setFen(trGame.fen(), { lastMove: { from, to } });
    trBoard.flash(to, 'ok'); trBoard.setShapes([]);
    const cm = drill.line.moves[drill.ply][1];
    coach(coachSay('correct', {}, drill.line.messages) + (cm ? ' ' + cm : ''), 'ok');
    drill.ply++; drill.hinted = false; updateEval(); renderMoves();
    setTimeout(afterUserMove, 360);
  } else {
    trGame.undo(); trBoard.setFen(before, { silent: true }); Sound.error();
    drill.mistake = true; drill.wrong++; $('#trWrong').textContent = drill.wrong;
    coach(coachSay('wrong', { exp }, drill.line.messages), 'bad'); trBoard.flash(to, 'bad');
    if (drill.mode !== 'practice') {           // drill: reveal the move, then continue
      trBoard.lock(true);
      setTimeout(() => {
        const m2 = trGame.move(exp);
        trBoard.setFen(trGame.fen(), { lastMove: { from: m2.from, to: m2.to } });
        drill.ply++; updateEval(); renderMoves();
        setTimeout(afterUserMove, 460);
      }, 520);
    }                                          // practice: just let them retry
  }
}
function afterUserMove() {
  trBoard.lock(false);
  if (drill.ply >= drill.line.moves.length) return finishLine();
  const bsan = drill.line.moves[drill.ply][0];
  const m = trGame.move(bsan);
  trBoard.setFen(trGame.fen(), { lastMove: m ? { from: m.from, to: m.to } : null });
  drill.ply++; updateEval(); renderMoves();
  if (drill.ply >= drill.line.moves.length) return finishLine();
  coach('Your move.'); trBoard.tryPremove();
}
function finishLine() {
  trBoard.lock(true);
  const ok = !drill.mistake;
  Store.record(repo.id, drill.line.id, ok);
  refreshMastery();
  coach(coachSay(ok ? 'done' : 'doneMiss', {}, drill.line.messages), ok ? 'ok' : 'bad');
  if (ok) Sound.success();
  setTimeout(() => { if (drill.active && drill.mode !== 'learn') nextLine(); }, 1300);
}

// ---- Hyper: the bot plays a random line as your opponent ----
function startRound() {
  drill.active = true; drill.mode = 'hyper'; drill.mistake = false; drill.hinted = false;
  hyper = { candidates: scopedLines().slice(), ply: 0 };
  trGame = new Chess(); trBoard.setOrientation(userOrient()); trBoard.setUserColor(userColor()); trBoard.clearPremove();
  trBoard.setFen(trGame.fen(), { silent: true }); trBoard.setShapes([]);
  drill.rounds++; $('#trRounds').textContent = drill.rounds;
  $('#trOpName').textContent = repo.name; $('#trLineIdx').textContent = `live game · round ${drill.rounds}`;
  updateEval(); renderMoves(); setArrows();
  Sound.round();
  if (trGame.turn() !== userColor()) {       // trainee is Black — the bot (White) opens
    trBoard.lock(true);
    coach(`Round ${drill.rounds} — I open as White; answer with your repertoire.`);
    setTimeout(hyperBotMove, 500);
  } else {
    trBoard.lock(false);
    coach(`Round ${drill.rounds} — you’re ${userColor() === 'w' ? 'White' : 'Black'}. Play your repertoire and I’ll answer.`);
  }
}
function hyperExpected() {
  if (!hyper) return null;
  return [...new Set(hyper.candidates.map(l => l.moves[hyper.ply]?.[0]).filter(Boolean))][0];
}
function hyperUserMove(from, to, promo) {
  if (!hyper || trGame.turn() !== userColor()) return;
  const before = trGame.fen();
  const mv = trGame.move({ from, to, promotion: promo });
  if (!mv) return;
  const matching = hyper.candidates.filter(l => l.moves[hyper.ply] && norm(l.moves[hyper.ply][0]) === norm(mv.san));
  if (!matching.length) {
    trGame.undo(); trBoard.setFen(before, { silent: true }); Sound.error();
    const exp = hyperExpected();
    coach(`That leaves the book${exp ? ` — the move is ${exp}` : ''}.`, 'bad'); trBoard.flash(to, 'bad');
    return;
  }
  hyper.candidates = matching; hyper.ply++;
  trBoard.setFen(trGame.fen(), { lastMove: { from, to } });
  trBoard.flash(to, 'ok'); trBoard.setShapes([]); updateEval(); renderMoves();
  if (!hyper.candidates.some(l => l.moves[hyper.ply])) return hyperWin();
  coach('Good — my turn…'); trBoard.lock(true);
  setTimeout(hyperBotMove, 500);
}
function hyperBotMove() {
  if (!hyper) return;
  const cands = hyper.candidates.filter(l => l.moves[hyper.ply]);
  if (!cands.length) return hyperWin();
  const pick = cands[Math.floor(Math.random() * cands.length)];
  const bsan = pick.moves[hyper.ply][0];
  const m = trGame.move(bsan);
  trBoard.setFen(trGame.fen(), { lastMove: m ? { from: m.from, to: m.to } : null });
  hyper.candidates = cands.filter(l => norm(l.moves[hyper.ply][0]) === norm(bsan));
  hyper.ply++; updateEval(); renderMoves(); trBoard.lock(false);
  if (!hyper.candidates.some(l => l.moves[hyper.ply])) return hyperWin();
  coach('Your move.'); trBoard.tryPremove();
}
function hyperWin() {
  trBoard.lock(true);
  const name = hyper.candidates[0]?.name;
  coach(`You held the line${name ? ` — ${name}` : ''}! Press ↻ New round to face another.`, 'ok');
  Sound.success();
  if (hyper.candidates[0]) Store.record(repo.id, hyper.candidates[0].id, true);
  refreshMastery();
}

function doHint() {
  if (!drill.active) return;
  if (drill.mode === 'learn') return learnStep(1);
  const exp = drill.mode === 'hyper' ? hyperExpected() : (trGame.turn() === userColor() ? expectedSan() : null);
  if (!exp) return;
  const m = trGame.move(exp); if (!m) return; const f = m.from, t = m.to; trGame.undo();
  if (drill.mode !== 'hyper') drill.hinted = true;
  trBoard.setShapes([{ from: f, to: t }]);
  coach('The arrow marks the move.');
}

function refreshMastery() {
  const ids = scopedLineIds();
  $('#trDue').textContent = Store.dueCount(repo.id, ids);
  $('#trDiscovered').innerHTML = `· <b>${Store.discoveredCount(repo.id, ids)}</b>/${ids.length}`;
  const dots = b => '●'.repeat(b) + '○'.repeat(6 - b);
  $('#trMastery').innerHTML = scopedLines().map(l => {
    const box = Store.mastery(repo.id, l.id);
    const sel = drill.line && drill.line.id === l.id ? 'sel' : '';
    const disc = Store.isDiscovered(repo.id, l.id);
    const due = Store.isDue(repo.id, l.id) ? `<span class="pill ${groupPill(l.group)}">due</span>` : '';
    return `<div class="varitem ${sel}" data-line="${l.id}">
      <div><span class="nm">${disc ? '' : '<i class="undisc">•</i>'}${l.name}</span><div class="mastery">${dots(box)}</div></div>
      ${due}</div>`;
  }).join('');
  $('#trMastery').querySelectorAll('[data-line]').forEach(el => el.onclick = () => {
    if (drill.mode === 'hyper') setMode('drill');
    drill.active = true; beginLine(lineById(el.dataset.line));
  });
}
function trSelectLine(id) {
  const l = lineById(id); if (!l) return;
  if (drill.mode === 'hyper') setMode('drill');
  drill.active = true; beginLine(l);
}

$('#trStart').onclick = () => (drill.mode === 'hyper' ? startRound() : startSession());
$('#trRestart').onclick = startRound;
$('#trSkip').onclick = () => { if (drill.active && drill.mode !== 'hyper') nextLine(); };
$('#trFlip').onclick = () => trBoard.flip();
$('#trNext').onclick = () => learnStep(1);
$('#trPrev').onclick = () => learnStep(-1);
$('#trHint').onclick = doHint;
$('#trSound').onclick = () => {
  Sound.enabled = !Sound.enabled; Store.setPref('sound', Sound.enabled);
  const b = $('#trSound'); b.classList.toggle('on', Sound.enabled); b.textContent = Sound.enabled ? '🔊' : '🔇';
  if (Sound.enabled) Sound.move();
};
document.addEventListener('keydown', e => {
  if (!$('#view-train').classList.contains('active') || drill.mode !== 'learn' || !drill.active) return;
  if (e.key === 'ArrowRight') learnStep(1);
  if (e.key === 'ArrowLeft') learnStep(-1);
});

// ---- custom coach messages ----
(function buildMsgCfg() {
  $('#trMsgFields').innerHTML = MSG_FIELDS.map(f =>
    `<div class="mf"><label>${f.label}</label><textarea data-msg="${f.key}" rows="3"></textarea></div>`).join('');
  function load() {
    $('#trMsgFields').querySelectorAll('textarea').forEach(t => {
      t.value = messagesFor(t.dataset.msg).join('\n');
    });
  }
  $('#trSettings').onclick = () => { load(); $('#trMsgCfg').hidden = false; };
  $('#trMsgClose').onclick = () => { $('#trMsgCfg').hidden = true; };
  $('#trMsgSave').onclick = () => {
    $('#trMsgFields').querySelectorAll('textarea').forEach(t => saveMessages(t.dataset.msg, t.value));
    $('#trMsgCfg').hidden = true;
    coach('Messages saved.', 'ok');
  };
  $('#trMsgReset').onclick = () => {
    const p = Store.prefs(); p.messages = {}; Store.setPref('messages', {}); load();
  };
})();

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
setMode('drill');
refreshMastery(); renderHome(); heroFx(); updateEval(); renderAccount();
$('#trSound').textContent = Sound.enabled ? '🔊' : '🔇';
$('#trSound').classList.toggle('on', Sound.enabled);
window.addEventListener('hashchange', () => showView(location.hash.slice(1) || 'home'));
showView(location.hash.slice(1) === 'train' ? 'train' : 'home');
