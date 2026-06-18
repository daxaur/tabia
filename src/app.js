import { Chess } from './vendor/chess.js?v=47';
import { Board } from './board.js?v=47';
import { openings, groupsOf, CATEGORIES } from './data/index.js?v=47';
import { Store } from './store.js?v=47';
import { evaluate, winPct, fmtEval } from './eval.js?v=47';
import { coachSay, MSG_FIELDS, messagesFor, saveMessages } from './coach.js?v=47';
import { Sound } from './sound.js?v=47';
import { Auth } from './auth.js?v=47';
import { ICON, siteIcon } from './icons.js?v=47';
import { Engine } from './engine.js?v=47';
import { CoachAI } from './coachai.js?v=47';
import { renderShareCard, downloadCard, shareCardImage } from './sharecard.js?v=47';

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
$('#footGh').href = REPO_URL;
// brand + nav logos
$('#ghIcon').innerHTML = ICON.github;
$('#footGhIcon').innerHTML = ICON.github;
$('#connectIcon').innerHTML = ICON.link;
$('#sfLogo').innerHTML = ICON.fish;
$('#cjsLogo').innerHTML = ICON.knight;
$('#liLogo').innerHTML = ICON.lichess;
$('#csCcLogo').innerHTML = ICON.chesscom;
$('#csLiLogo').innerHTML = ICON.lichess;
$('#navHomeIcon').innerHTML = ICON.home;
$('#navStudyIcon').innerHTML = ICON.study;
$('#navSavedIcon').innerHTML = ICON.star;
$('#navCreateIcon').innerHTML = ICON.plus;
$('#homeCreateIcon').innerHTML = ICON.plus;
$('#brandHome').onclick = () => showView('home');
$('#createCta').onclick = () => showView('create');
$('#homeCreate').onclick = () => showView('create');

// ---------- animated dot-matrix wordmark ----------
function dotWordmark(canvas, text, dotMax) {
  const ctx = canvas.getContext('2d'); const DPR = Math.min(2, window.devicePixelRatio || 1);
  const W = canvas.width, H = canvas.height;
  canvas.width = W * DPR; canvas.height = H * DPR; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  // sample the text onto an offscreen grid
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  const o = off.getContext('2d');
  o.fillStyle = '#fff'; o.textBaseline = 'middle';
  let fs = H * 0.82; o.font = `700 ${fs}px ${getComputedStyle(document.body).getPropertyValue('--mono')}`;
  while (o.measureText(text).width > W - 4 && fs > 6) { fs -= 1; o.font = `700 ${fs}px monospace`; }
  o.fillText(text, 2, H / 2 + 1);
  const img = o.getImageData(0, 0, W, H).data;
  const step = 3, dots = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    if (img[(y * W + x) * 4 + 3] > 110) dots.push({ x, y, ph: (x * 7 + y * 13) % 628 / 100 });
  }
  let t = 0, last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || now - last < 55) return;   // ~18fps, gentle, idle when tab hidden
    last = now; t += 0.1; ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const d of dots) {
      const a = 0.55 + 0.45 * Math.sin(t + d.ph - d.x * 0.03);  // left-to-right shimmer
      ctx.beginPath(); ctx.arc(d.x * DPR, d.y * DPR, (dotMax || 1.15) * DPR, 0, 6.28);
      ctx.fillStyle = `rgba(244,244,244,${a})`; ctx.fill();
    }
  }
  requestAnimationFrame(frame);
}
// on phones the dot-matrix wordmark is hidden (we show clean text) — don't burn a rAF loop on it
if (!window.matchMedia('(max-width:640px)').matches) {
  dotWordmark($('#brandLogo'), 'tabia', 1.55);
  dotWordmark($('#footLogo'), 'tabia', 1.2);
}

// ---------- crypto donate ----------
const DONATE = [
  { key: 'btc', name: 'Bitcoin',  logo: 'bitcoin',  addr: 'bc1q2cc6a8s6lufk662hmjq5ue6myj9x2kuu050rlm' },
  { key: 'eth', name: 'Ethereum', logo: 'ethereum', addr: '0x8D1D564832B8F56417D8646aE668f4bdf9994949' },
  { key: 'sol', name: 'Solana',   logo: 'solana',   addr: 'EH25TBYjLacSe95iNFm7o5sY9WH3dJDW9UQNSSDSL72t' },
];
$('#donate').innerHTML = DONATE.map(d =>
  `<button class="dcard" data-addr="${d.addr}" title="Copy ${d.name} address">
     <img class="dlogo" src="assets/logos/${d.logo}.svg" alt="">
     <span class="dinfo"><span class="dname">${d.name}</span><span class="daddr">${d.addr.slice(0, 6)}…${d.addr.slice(-4)}</span></span>
     <span class="dcopy">${ICON.copy}</span><span class="dok">${ICON.check} copied</span>
   </button>`).join('');
$('#donate').querySelectorAll('.dcard').forEach(b => b.onclick = async () => {
  try { await navigator.clipboard.writeText(b.dataset.addr); } catch {}
  b.classList.add('copied');
  setTimeout(() => b.classList.remove('copied'), 1500);
});

// ---------- settings: piece previews, move method, sound ----------
const PIECE_SETS = [{ id: 'cburnett', name: 'lichess' }, { id: 'cardinal', name: 'cardinal' }, { id: 'maestro', name: 'maestro' }, { id: 'pixel', name: 'pixel' }];
function buildPieceSeg() {
  $('#pieceSeg').innerHTML = PIECE_SETS.map(s =>
    `<button class="ptile ${s.id === pieceSet ? 'active' : ''}" data-piece="${s.id}">
       <img src="src/pieces/${s.id}/wN.svg" alt=""><img src="src/pieces/${s.id}/bQ.svg" alt=""><span>${s.name}</span>
     </button>`).join('');
  $('#pieceSeg').querySelectorAll('[data-piece]').forEach(b => b.onclick = () => setPieceSet(b.dataset.piece));
}
function setPieceSet(p) {
  pieceSet = p; Store.setPref('pieceSet', p);
  buildPieceSeg(); trBoard.setPieceSet(p); renderMoves(); renderHome();
}
let moveMethod = Store.prefs().moveMethod || 'both';
let soundOn = Store.prefs().sound !== false;
function syncSeg(id, val, attr) { document.querySelectorAll(`#${id} button`).forEach(b => b.classList.toggle('active', b.dataset[attr] === val)); }
document.querySelectorAll('#moveMethodSeg button').forEach(b => b.onclick = () => {
  moveMethod = b.dataset.mm; Store.setPref('moveMethod', moveMethod); trBoard.setMoveMethod(moveMethod); syncSeg('moveMethodSeg', moveMethod, 'mm');
});
document.querySelectorAll('#soundSeg button').forEach(b => b.onclick = () => {
  soundOn = b.dataset.snd === 'on'; Sound.enabled = soundOn; Store.setPref('sound', soundOn);
  syncSeg('soundSeg', soundOn ? 'on' : 'off', 'snd'); $('#trSound').textContent = soundOn ? '🔊' : '🔇'; $('#trSound').classList.toggle('on', soundOn);
  if (soundOn) Sound.move();
});

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
  // keep the Create gate in sync if the user (dis)connects while it's open
  if ($('#view-create')?.classList.contains('active')) enterCreate();
}
$('#connectBtn').onclick = () => { renderAccount(); $('#connectModal').hidden = false; };
$('#connectClose').onclick = () => { $('#connectModal').hidden = true; };
$('#connectLichess').onclick = () => Auth.startLichess();
Auth.handleRedirect().then(acc => { if (acc) { renderAccount(); $('#connectModal').hidden = false; } });

// ---------- Coach: match an opening to your style (free, from your public games) ----------
$('#navCoachIcon').innerHTML = ICON.spark;
$('#coachTeaser')?.addEventListener('click', () => showView('coach'));
let coachSite = 'chesscom';
document.querySelectorAll('#coachSite button').forEach(b => b.onclick = () => {
  coachSite = b.dataset.site;
  document.querySelectorAll('#coachSite button').forEach(x => x.classList.toggle('active', x === b));
});
let sampleDrawn = false;
function drawSample() {
  if (sampleDrawn) return; sampleDrawn = true;
  renderShareCard($('#sampleCanvas'), {
    handle: 'you', site: 'lichess', styleLabel: 'Aggressive',
    styleSub: 'You go for the throat — sharp lines, quick contact.',
    d1: 'e4', winRate: 57, avgMoves: 31, n: 80,
    white: { label: 'As White', name: 'Italian Game' },
    black: { label: 'As Black', name: 'Sicilian Defence' },
  });
}
function enterCoach() {
  const a = Auth.current();
  if (a && !$('#coachUser').value) {
    $('#coachUser').value = a.username;
    coachSite = a.site === 'lichess' ? 'lichess' : 'chesscom';
    document.querySelectorAll('#coachSite button').forEach(x => x.classList.toggle('active', x.dataset.site === coachSite));
  }
  drawSample();
}
function coachStatus(msg, cls) { const s = $('#coachStatus'); s.textContent = msg; s.className = 'coach-status ' + (cls || ''); }
async function runCoach() {
  const user = $('#coachUser').value.trim();
  if (!user) { coachStatus('Enter your username first.', 'err'); return; }
  coachStatus('Reading your recent games…', 'busy'); $('#coachResult').hidden = true; $('#coachGo').disabled = true;
  $('#coachWizard').classList.add('busy');
  try { const p = await CoachAI.profile(coachSite, user); coachStatus('', ''); $('#coachWizard').hidden = true; renderCoachResult(p); }
  catch (e) { coachStatus(e.message || 'Couldn’t analyse that account.', 'err'); }
  $('#coachWizard').classList.remove('busy');
  $('#coachGo').disabled = false;
}
function coachReset() {
  $('#coachResult').hidden = true; $('#coachResult').innerHTML = '';
  $('#coachWizard').hidden = false; coachStatus('', '');
  $('#coachUser').focus();
}
$('#coachGo').onclick = runCoach;
$('#coachUser').addEventListener('keydown', e => { if (e.key === 'Enter') runCoach(); });
// a compact, interactive "study this" row beneath the share card
function recRow(rec, side) {
  if (!rec) return '';
  const op = library().find(o => o.id === rec.id); if (!op) return '';
  return `<button class="recrow" data-study="${op.id}">
    <span class="recrow-side">${side === 'w' ? '♔' : '♚'}</span>
    <span class="recrow-body">
      <span class="recrow-label">As ${side === 'w' ? 'White' : 'Black'}${op.tabiaOriginal ? ' · ★ original' : ''}</span>
      <span class="recrow-name">${op.name}</span>
      <span class="recrow-one">${op.oneLiner || ''}</span>
    </span>
    <span class="recrow-go">Study ▸</span>
  </button>`;
}

const STYLE_SUB = {
  aggressive: 'You go for the throat — sharp lines, quick contact.',
  positional: 'You build slowly and grind — structure over fireworks.',
};
function renderCoachResult(p) {
  const styleLabel = p.aggressive ? 'Aggressive' : 'Positional';
  const wOp = library().find(o => o.id === p.rec.white?.id);
  const bOp = library().find(o => o.id === p.rec.black?.id);
  const tweet = encodeURIComponent(`tabia read my games — I play ${styleLabel.toLowerCase()}, so it picked the ${wOp?.name || 'right opening'} for me ♟️`);

  $('#coachResult').hidden = false;
  $('#coachResult').innerHTML = `
    <div class="result-head">
      <span class="rh-kicker">✦ your style read · @${p.username}</span>
      <button class="btn ghost sm" id="coachAgain">↻ Analyse another</button>
    </div>
    <div class="cardwrap">
      <div class="sharecard pop"><canvas id="coachCanvas" aria-label="Your tabia style card"></canvas></div>
    </div>
    <div class="cardacts">
      <button class="btn share" id="coachShare">𝕏 Share on X</button>
      <button class="btn ghost" id="coachDl">⤓ Download card</button>
    </div>
    <div class="recs-lead">Two openings matched to you — drill them now</div>
    <div class="recrows">${recRow(p.rec.white, 'w')}${recRow(p.rec.black, 'b')}</div>`;

  $('#coachResult').querySelectorAll('[data-study]').forEach(b => b.onclick = () => openOpening(b.dataset.study));
  $('#coachAgain').onclick = coachReset;

  const canvas = $('#coachCanvas');
  const cardData = {
    handle: p.username, site: p.site, styleLabel, styleSub: STYLE_SUB[styleLabel.toLowerCase()],
    d1: p.whiteD1, winRate: p.winRate, avgMoves: p.avgMoves, n: p.n,
    white: wOp ? { label: 'As White', name: wOp.name } : null,
    black: bOp ? { label: 'As Black', name: bOp.name } : null,
  };
  renderShareCard(canvas, cardData);

  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweet}&url=https%3A%2F%2Fdaxaur.github.io%2Ftabia%2F`;
  $('#coachShare').onclick = async () => {
    const shared = await shareCardImage(canvas, decodeURIComponent(tweet), p.username);
    if (!shared) window.open(tweetUrl, '_blank', 'noopener');
  };
  $('#coachDl').onclick = () => downloadCard(canvas, p.username);
}

// ---------- piece set + view nav ----------
let pieceSet = Store.prefs().pieceSet || 'cburnett';
function showView(v) {
  document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
  document.querySelectorAll('nav.top button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  if (v === 'home') renderHome();
  if (v === 'saved') renderSaved();
  if (v === 'opening') renderOpening();
  if (v === 'train') enterTrain();
  if (v === 'create') enterCreate();
  if (v === 'coach') enterCoach();
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
  if (!el) return null;
  const b = new Board(el, { interactive, pieceSet, orientation: op.color === 'b' ? 'black' : 'white' });
  const g = new Chess(); const main = op.lines.find(l => l.star) || op.lines[0];
  try { for (const [san] of (main?.moves || []).slice(0, plies)) g.move(san); } catch {}
  const h = g.history({ verbose: true });
  b.setFen(g.fen(), { lastMove: h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null, silent: true });
  return b;
}
const library = () => [...openings, ...Store.customOpenings()];
function opCardHtml(op, i, pfx) {
  const s = statsFor(op); const pct = s.ids.length ? Math.round(s.mastered / s.ids.length * 100) : 0;
  const starN = op.lines.filter(l => l.star).length;
  const ribbon = op.tabiaOriginal ? '<div class="op-ribbon">★ TABIA ORIGINAL</div>' : op.custom ? '<div class="op-ribbon yours">YOURS</div>' : '';
  return `<div class="opcard" data-op="${op.id}" style="animation-delay:${i * 70}ms">
    ${ribbon}
    <button class="opfav${Store.isFavorite(op.id) ? ' on' : ''}" data-fav="${op.id}" title="Save opening">${ICON.star}<span class="opfav-n">${starN}</span></button>
    <div class="opcard-board"><div id="${pfx}-${op.id}"></div></div>
    <div class="opcard-body">
      <span class="ct">${op.eco} · ${op.lines.length} lines${s.due ? ` · <b>${s.due} due</b>` : ''}</span>
      <h3>${op.name}</h3>
      <p>${op.oneLiner || ''}</p>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <span class="go">${pct ? `${pct}% mastered` : 'Start training'} →</span>
    </div></div>`;
}
function wireCards(container) {
  container.querySelectorAll('.opfav').forEach(b => b.onclick = e => { e.stopPropagation(); b.classList.toggle('on', Store.toggleFavorite(b.dataset.fav)); });
  container.querySelectorAll('[data-op]').forEach(c => c.onclick = () => openOpening(c.dataset.op));
}
let libCat = 'All';
function renderFilter() {
  const present = CATEGORIES.filter(c => library().some(o => o.category === c));
  const cats = ['All', ...present, ...(Store.customOpenings().length ? ['Yours'] : [])];
  if (!cats.includes(libCat)) libCat = 'All';
  $('#libFilter').innerHTML = cats.map(c => `<button class="fchip${c === libCat ? ' on' : ''}" data-cat="${c}">${c}</button>`).join('');
  $('#libFilter').querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { libCat = b.dataset.cat; renderHome(); });
}
let libSearch = '';
function matchesSearch(op, q) {
  if (!q) return true;
  const hay = `${op.name} ${op.eco || ''} ${op.oneLiner || ''} ${(op.lines || []).map(l => l.name).join(' ')}`.toLowerCase();
  return q.split(/\s+/).every(term => hay.includes(term));   // all terms must match
}
function renderHome() {
  renderFilter();
  // order: tabia originals first, then saved, then the rest (stable within each tier)
  const rank = o => (o.tabiaOriginal ? 2 : 0) + (Store.isFavorite(o.id) ? 1 : 0);
  let lib = library().slice().sort((a, b) => rank(b) - rank(a));
  if (libCat !== 'All') lib = lib.filter(o => libCat === 'Yours' ? o.custom : o.category === libCat);
  const q = libSearch.trim().toLowerCase();
  if (q) lib = lib.filter(o => matchesSearch(o, q));
  const label = q ? `${lib.length} match${lib.length === 1 ? '' : 'es'} for “${libSearch.trim()}”`
                  : `${lib.length} opening${lib.length === 1 ? '' : 's'}${libCat !== 'All' ? ' · ' + libCat.toLowerCase() : ' · drill any line'}`;
  $('#libSub').textContent = label;
  $('#library').innerHTML = lib.map((op, i) => opCardHtml(op, i, 'mini')).join('');
  lib.forEach(op => previewBoard(document.getElementById(`mini-${op.id}`), op, 7));
  wireCards($('#library'));
  const empty = $('#libEmpty');
  if (empty) { empty.hidden = lib.length > 0; empty.textContent = lib.length ? '' : (q ? `No openings match “${libSearch.trim()}”. Try a different term — or create your own.` : 'No openings here yet.'); }
  const s0 = statsFor(repo);
  $('#footStats').textContent = `${s0.reps} reps logged · ${s0.mastered}/${s0.ids.length} lines mastered`;
}
{
  const si = $('#libSearch');
  // debounce: renderHome() rebuilds all preview boards, so don't run it on every keystroke
  let stim;
  if (si) si.addEventListener('input', () => { libSearch = si.value; clearTimeout(stim); stim = setTimeout(renderHome, 140); });
}
function renderSaved() {
  const a = Auth.current();
  $('#savedWho').textContent = a ? `${a.username}’s openings` : 'Your saved openings';
  const favs = library().filter(o => Store.isFavorite(o.id));
  $('#savedLib').innerHTML = favs.length ? favs.map((op, i) => opCardHtml(op, i, 'smini')).join('')
    : '<div class="saved-empty">No saved openings yet. Tap the ★ on any opening to keep it here.</div>';
  favs.forEach(op => previewBoard(document.getElementById(`smini-${op.id}`), op, 7));
  wireCards($('#savedLib'));
}

// ============================== OPENING DETAIL (folders → branches) ==============================
let opPreview = null;
function openingById2(id) { return library().find(o => o.id === id); }
function openOpening(id) { currentOpening = openingById2(id) || openings[0]; showView('opening'); }
function renderOpening() {
  const op = currentOpening;
  $('#crumbName').textContent = op.name;
  $('#opEco').innerHTML = `${op.tabiaOriginal ? '<span class="op-badge">★ tabia original</span> ' : op.custom ? '<span class="op-badge yours">yours</span> ' : ''}${op.eco} · plays ${op.color === 'b' ? 'Black' : 'White'}`;
  $('#opName').textContent = op.name;
  $('#opOneliner').textContent = op.oneLiner || '';
  const fav = Store.isFavorite(op.id);
  $('.op-actions').innerHTML = `<button class="btn primary" id="opTrain">▶ Study this opening</button>` +
    `<button class="btn${fav ? ' saved' : ''}" id="opFav">${fav ? '★ Saved' : '☆ Save'}</button>` +
    (op.custom ? `<button class="btn" id="opEdit">✎ Edit</button><button class="btn ghost" id="opDelete">🗑 Delete</button>` : '');
  $('#opTrain').onclick = () => showView('train');
  $('#opFav').onclick = () => { const on = Store.toggleFavorite(op.id); $('#opFav').textContent = on ? '★ Saved' : '☆ Save'; $('#opFav').classList.toggle('saved', on); };
  if (op.custom) {
    $('#opEdit').onclick = () => loadIntoBuilder(op);
    $('#opDelete').onclick = () => { Store.deleteCustomOpening(op.id); showView('home'); };
  }
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

// ============================== CREATE (opening builder) ==============================
$('#navCreateIcon').innerHTML = ICON.plus;
$('#crCrumbHome').onclick = () => showView('home');
const CB_MSGS = [
  { key: 'correct',  label: 'On a correct move' },
  { key: 'wrong',    label: 'On a wrong move  ({exp} = the right move)' },
  { key: 'done',     label: 'Line finished clean' },
  { key: 'doneMiss', label: 'Line finished with a slip' },
];
const cb = { board: null, game: new Chess(), color: 'w', lines: [], editingId: null, stepMeta: {}, selStep: null };

function enterCreate() {
  // gate behind a connected account
  const authed = !!Auth.current();
  $('#crGate').hidden = authed;
  $('#crBuilder').style.display = authed ? '' : 'none';
  if (!authed) return;
  if (!cb.board) {
    cb.board = new Board($('#crBoard'), { pieceSet, onMove: cbMove });
    $('#crMsgBox').innerHTML = CB_MSGS.map(f =>
      `<div class="mf"><label>${f.label}</label><textarea data-cm="${f.key}" rows="2" placeholder="one message per line"></textarea></div>`).join('');
    $('#crMsgToggle').onclick = () => { const b = $('#crMsgBox'); b.hidden = !b.hidden; $('#crMsgToggle').textContent = b.hidden ? '＋ Line-wide coach messages' : '− Hide line messages'; };
    document.querySelectorAll('#crColor button').forEach(b => b.onclick = () => setCbColor(b.dataset.c));
    $('#crUndo').onclick = () => { delete cb.stepMeta[cb.game.history().length - 1]; cb.game.undo(); cb.selStep = null; cbSetBoard(); };
    $('#crResetLine').onclick = () => { cb.game = new Chess(); cb.stepMeta = {}; cb.selStep = null; cbSetBoard(); };
    $('#crFlip').onclick = () => cb.board.flip();
    $('#crAddLine').onclick = cbAddLine;
    $('#crSave').onclick = cbSave;
    $('#crCancel').onclick = () => { cbReset(); showView('home'); };
    $('#crPgnToggle').onclick = () => { const b = $('#crPgnBox'); b.hidden = !b.hidden; $('#crPgnToggle').textContent = b.hidden ? '⇪ Import from PGN' : '− Hide PGN import'; if (!b.hidden) $('#crPgnText').focus(); };
    $('#crPgnImport').onclick = cbImportPgn;
  }
  cb.board.setPieceSet(pieceSet);
  setCbColor(cb.color); cbSetBoard(); cbRenderLines();
}
$('#crGateConnect').onclick = () => { $('#connectModal').hidden = false; renderAccount(); };
function setCbColor(c) {
  cb.color = c;
  document.querySelectorAll('#crColor button').forEach(b => b.classList.toggle('active', b.dataset.c === c));
  cb.board?.setOrientation(c === 'b' ? 'black' : 'white');
}
function cbMove(from, to, promo) {
  const m = cb.game.move({ from, to, promotion: promo }); if (!m) return;
  cb.board.setFen(cb.game.fen(), { lastMove: { from, to } });
  cbRenderMoves();
}
function cbSetBoard() {
  const h = cb.game.history({ verbose: true });
  const lm = h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null;
  cb.board.setFen(cb.game.fen(), { lastMove: lm, silent: true });
  cbRenderMoves();
}
function cbRenderMoves() {
  const h = cb.game.history({ verbose: true });
  if (!h.length) { $('#crMoves').innerHTML = '<span class="mvempty">play the moves on the board…</span>'; $('#crStep').hidden = true; return; }
  let html = '';
  for (let i = 0; i < h.length; i++) {
    const m = h[i];
    if (i % 2 === 0) html += `<span class="mvno">${i / 2 + 1}.</span>`;
    const ic = m.piece === 'p' ? '' : `<img class="mvpc" src="src/pieces/${pieceSet}/${m.color}${GLYPH[m.piece]}.svg" alt="">`;
    const tagged = cb.stepMeta[i] ? ' tagged' : '';
    const sel = cb.selStep === i ? ' cur' : '';
    html += `<span class="mv${tagged}${sel}" data-step="${i}">${ic}${m.san}</span>`;
  }
  $('#crMoves').innerHTML = html;
  $('#crMoves').querySelectorAll('[data-step]').forEach(el => el.onclick = () => openStep(+el.dataset.step));
}
function openStep(i) {
  cb.selStep = i;
  const san = cb.game.history()[i];
  const sm = cb.stepMeta[i] || {};
  $('#crStep').hidden = false;
  $('#crStep').innerHTML = `
    <div class="cr-step-head">Move ${Math.floor(i / 2) + 1}${i % 2 ? '…' : '.'} <b>${san}</b> — this step
      <button class="cr-step-x" id="crStepX">✕</button></div>
    <input id="crStepComment" placeholder="Comment shown when this move is played" value="${(sm.comment || '').replace(/"/g, '&quot;')}">
    <label>Custom “correct” lines (one per line)</label>
    <textarea id="crStepCorrect" rows="2" placeholder="overrides the line/global message">${(sm.correct || []).join('\n')}</textarea>
    <label>Custom “wrong” lines (one per line)</label>
    <textarea id="crStepWrong" rows="2" placeholder="overrides the line/global message">${(sm.wrong || []).join('\n')}</textarea>
    <div class="cr-step-act"><button class="btn primary sm" id="crStepSave">Save this step</button><button class="btn ghost sm" id="crStepClear">Clear</button></div>`;
  $('#crStepX').onclick = () => { cb.selStep = null; $('#crStep').hidden = true; cbRenderMoves(); };
  $('#crStepSave').onclick = () => {
    const meta = {};
    const c = $('#crStepComment').value.trim(); if (c) meta.comment = c;
    const ok = $('#crStepCorrect').value.split('\n').map(s => s.trim()).filter(Boolean); if (ok.length) meta.correct = ok;
    const wr = $('#crStepWrong').value.split('\n').map(s => s.trim()).filter(Boolean); if (wr.length) meta.wrong = wr;
    if (Object.keys(meta).length) cb.stepMeta[i] = meta; else delete cb.stepMeta[i];
    cb.selStep = null; $('#crStep').hidden = true; cbRenderMoves(); cbStatus('Step saved.', 'ok');
  };
  $('#crStepClear').onclick = () => { delete cb.stepMeta[i]; cb.selStep = null; $('#crStep').hidden = true; cbRenderMoves(); };
}
function cbStatus(msg, cls = '') { const s = $('#crStatus'); s.textContent = msg; s.className = 'cr-status ' + cls; }
function cbAddLine() {
  const moves = cb.game.history();
  if (!moves.length) { cbStatus('Play at least one move for this line.', 'err'); return; }
  const name = $('#crLineName').value.trim() || `Line ${cb.lines.length + 1}`;
  const group = $('#crLineGroup').value.trim() || 'Main';
  const idea = $('#crLineIdea').value.trim();
  const messages = {};
  $('#crMsgBox').querySelectorAll('textarea').forEach(t => {
    const ls = t.value.split('\n').map(s => s.trim()).filter(Boolean); if (ls.length) messages[t.dataset.cm] = ls;
  });
  // bake per-step comments + messages into each move tuple: [san] | [san,comment] | [san,comment,{correct,wrong}]
  const lineMoves = moves.map((san, i) => {
    const sm = cb.stepMeta[i]; if (!sm) return [san];
    const msgs = {}; if (sm.correct) msgs.correct = sm.correct; if (sm.wrong) msgs.wrong = sm.wrong;
    const tuple = [san, sm.comment || ''];
    if (Object.keys(msgs).length) tuple.push(msgs);
    return tuple;
  });
  const line = { id: 'l' + Date.now().toString(36) + Math.floor(Math.random() * 1e4), name, group, idea, moves: lineMoves };
  if (Object.keys(messages).length) line.messages = messages;
  cb.lines.push(line);
  cb.game = new Chess(); cb.stepMeta = {}; cb.selStep = null; cbSetBoard();
  $('#crLineName').value = ''; $('#crLineIdea').value = '';
  $('#crMsgBox').querySelectorAll('textarea').forEach(t => t.value = '');
  cbRenderLines(); cbStatus(`Added “${name}”.`, 'ok');
}
// ---- import lines from a pasted PGN (one game = one line) ----
function splitPgnGames(text) {
  const t = (text || '').trim();
  if (!t) return [];
  // each game begins at an [Event ...] tag; movetext-only PGNs are a single game
  const parts = t.split(/(?=\[Event\s)/g).map(s => s.trim()).filter(Boolean);
  return parts.length ? parts : [t];
}
function pgnLineName(pgn, n) {
  const tag = re => (pgn.match(re) || [])[1];
  const opening = tag(/\[Opening\s+"([^"]+)"/) || tag(/\[ECO\s+"([^"]+)"/);
  if (opening && opening !== '?') return opening;
  const w = tag(/\[White\s+"([^"]+)"/), b = tag(/\[Black\s+"([^"]+)"/);
  if ((w && w !== '?') || (b && b !== '?')) return `${w || '?'} – ${b || '?'}`;
  return `Imported line ${n}`;
}
function cbImportPgn() {
  const raw = $('#crPgnText').value;
  const games = splitPgnGames(raw);
  if (!games.length) { cbStatus('Paste a PGN first.', 'err'); return; }
  let added = 0, skipped = 0;
  for (const g of games) {
    let hist;
    try { const c = new Chess(); c.loadPgn(g, { strict: false }); hist = c.history(); }
    catch { skipped++; continue; }
    if (!hist || !hist.length) { skipped++; continue; }
    const moves = hist.map(san => [san]);   // same tuple shape as the manual builder
    const name = pgnLineName(g, cb.lines.length + 1);
    cb.lines.push({ id: 'l' + Date.now().toString(36) + Math.floor(Math.random() * 1e4) + added, name, group: 'Imported', idea: '', moves });
    added++;
  }
  cbRenderLines();
  if (added) {
    $('#crPgnText').value = '';
    cbStatus(`Imported ${added} line${added > 1 ? 's' : ''}${skipped ? ` (${skipped} skipped)` : ''}.`, 'ok');
  } else cbStatus('Couldn’t read any games from that PGN — check the format.', 'err');
}

function cbRenderLines() {
  $('#crLineCount').textContent = cb.lines.length;
  $('#crLines').innerHTML = cb.lines.length ? cb.lines.map((l, i) =>
    `<div class="cr-li"><div class="cr-li-info"><b>${l.name}</b> <span class="cr-li-g">${l.group}</span>
       <div class="cr-li-m">${l.moves.map((m, j) => (j % 2 ? '' : (j / 2 | 0) + 1 + '.') + m[0]).join(' ')}</div></div>
     <button class="cr-del" data-i="${i}" title="Remove line">${ICON.trash}</button></div>`).join('')
    : '<div class="cr-empty">No lines yet — build one on the board, then “Add this line”.</div>';
  $('#crLines').querySelectorAll('.cr-del').forEach(b => b.onclick = () => { cb.lines.splice(+b.dataset.i, 1); cbRenderLines(); });
}
function cbSave() {
  const name = $('#crName').value.trim();
  if (!name) { cbStatus('Give your opening a name.', 'err'); return; }
  if (!cb.lines.length) { cbStatus('Add at least one line first.', 'err'); return; }
  const id = cb.editingId || ('custom-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 22) + '-' + Date.now().toString(36));
  const op = { id, name, color: cb.color, eco: ($('#crEco').value.trim() || 'CUST'), oneLiner: $('#crOne').value.trim(), custom: true, lines: cb.lines };
  Store.saveCustomOpening(op);
  cbReset();
  currentOpening = op; showView('opening');
}
function cbReset() {
  cb.game = new Chess(); cb.lines = []; cb.editingId = null; cb.stepMeta = {}; cb.selStep = null;
  ['crName', 'crEco', 'crOne', 'crLineName', 'crLineGroup', 'crLineIdea'].forEach(id => { const e = $('#' + id); if (e) e.value = ''; });
  if ($('#crStep')) $('#crStep').hidden = true;
  setCbColor('w'); if (cb.board) cbSetBoard(); cbRenderLines(); cbStatus('');
  $('#crTitle').textContent = 'Create an opening';
}
function loadIntoBuilder(op) {                 // edit an existing custom opening
  cb.editingId = op.id; cb.lines = JSON.parse(JSON.stringify(op.lines));
  cb.game = new Chess();
  $('#crName').value = op.name; $('#crEco').value = op.eco === 'CUST' ? '' : (op.eco || ''); $('#crOne').value = op.oneLiner || '';
  setCbColor(op.color || 'w');
  $('#crTitle').textContent = 'Edit · ' + op.name;
  showView('create');
}

// ============================== STUDY HUB (modes + bot + eval + sound) ==============================
const GLYPH = { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' };
const MODE_META = {
  learn:    { icon: '📖', name: 'Learn',    intro: 'Learn mode — I’ll walk you through each line. Press Start, then use › / ‹ (or arrow keys) to step.' },
  practice: { icon: '🎯', name: 'Practice', intro: 'Practice mode — free play, nothing is scored or scheduled. Slip up as many times as you like; just rehearse.' },
  drill:    { icon: '🥁', name: 'Drill',    intro: 'Drill mode — the scored one. Spaced repetition: get a line clean and it won’t come back for a while.' },
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
function paintEval(whiteEval) {             // whiteEval = pawns, White's perspective
  const whitePct = Math.max(2, Math.min(98, winPct(whiteEval)));
  const fill = $('#trEvalFill');
  fill.style.height = whitePct + '%';
  // white's slice sits on white's side of the board (bottom when white-oriented, top when flipped)
  if (trBoard.orientation === 'black') { fill.style.top = '0'; fill.style.bottom = 'auto'; }
  else { fill.style.top = 'auto'; fill.style.bottom = '0'; }
  // readout from YOUR side, with sign (+ = you're better)
  const e = userColor() === 'w' ? whiteEval : -whiteEval;
  const r = $('#trEvalRead'); r.textContent = fmtEval(e);
  r.className = 'evread ' + (e > 0.4 ? 'up' : e < -0.4 ? 'down' : '');
}
function updateEval() {
  const fen = trGame.fen();
  paintEval(evaluate(fen));                                          // instant heuristic (white-relative)
  if (Engine.available) Engine.evaluate(fen, white => {             // real Stockfish, streams as depth climbs
    if (trGame.fen() === fen) paintEval(white);
  });
}
function setArrows() {
  const inLearn = drill.mode === 'learn' && drill.active && drill.line;
  const floor = userColor() === 'b' ? 1 : 0;   // keep White's opening move for Black repertoires
  $('#trNext').disabled = !inLearn || drill.ply >= drill.line.moves.length;
  $('#trPrev').disabled = !drill.active || trGame.history().length <= floor;   // back works in every mode
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
  // NOTE: do NOT scrollIntoView here — the move list wraps and isn't a scroll
  // container, so it would scroll the whole PAGE (jumped mobile to the bottom on every move).
  setArrows();   // keep the ‹ back button state in sync after every move
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
  if (drill.mode === 'learn') {                       // walk the line: drag the next move, or step ‹ ›
    trBoard.setUserColor(null); trBoard.lock(false);
    coach(coachSay('learn') + ' ' + (line.idea || '')); setArrows(); return;
  }
  // practice / drill — if the trainee is Black, the opponent (White) opens
  if (userColor() === 'b') {
    trBoard.lock(true);
    setTimeout(() => {
      if (drill.line !== line || drill.ply !== 0) return;   // a new line/opening took over — drop this stale move
      const m = trGame.move(line.moves[0][0]); if (!m) return;
      trBoard.setFen(trGame.fen(), { lastMove: { from: m.from, to: m.to } });
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

function learnMove(from, to, promo) {              // Learn mode: drag the next move to advance
  if (drill.ply >= drill.line.moves.length) return;
  const exp = drill.line.moves[drill.ply][0], before = trGame.fen();
  const mv = trGame.move({ from, to, promotion: promo }); if (!mv) return;
  if (norm(mv.san) === norm(exp)) {
    const cm = drill.line.moves[drill.ply][1];
    trBoard.setFen(trGame.fen(), { lastMove: { from, to } }); trBoard.setShapes([]);
    coach(`${mv.color === 'w' ? '▲' : '▼'} ${mv.san}${cm ? ' — ' + cm : ''}`);
    drill.ply++; updateEval(); renderMoves(); setArrows();
    if (drill.ply >= drill.line.moves.length) coach('That’s the whole line. Switch to Practice to play it yourself.', 'ok');
  } else {
    trGame.undo(); trBoard.setFen(before, { silent: true }); Sound.error();
    const m = trGame.move(exp); const f = m.from, t = m.to; trGame.undo();
    trBoard.setShapes([{ from: f, to: t }]);
    coach(`Not that one — the next move is ${exp}. Drag it, or press ›.`);
  }
}
function trMove(from, to, promo) {
  if (!drill.active) return;
  if (drill.mode === 'learn') return learnMove(from, to, promo);
  if (drill.mode === 'hyper') return hyperUserMove(from, to, promo);
  if (trGame.turn() !== userColor()) return;
  const exp = expectedSan(), before = trGame.fen();
  const mv = trGame.move({ from, to, promotion: promo });
  if (!mv) return;
  if (norm(mv.san) === norm(exp)) {
    drill.correct += drill.hinted ? 0 : 1; $('#trCorrect').textContent = drill.correct;
    trBoard.setFen(trGame.fen(), { lastMove: { from, to } });
    trBoard.flash(to, 'ok'); trBoard.setShapes([]);
    const step = drill.line.moves[drill.ply];
    const cm = step[1];
    const ov = step[2]?.correct ? { correct: step[2].correct } : drill.line.messages;   // per-step > per-line > global
    coach(coachSay('correct', {}, ov) + (cm ? ' ' + cm : ''), 'ok');
    drill.ply++; drill.hinted = false; updateEval(); renderMoves();
    setTimeout(afterUserMove, 360);
  } else {
    trGame.undo(); trBoard.setFen(before, { silent: true }); Sound.error();
    drill.mistake = true; drill.wrong++; $('#trWrong').textContent = drill.wrong;
    const wov = drill.line.moves[drill.ply]?.[2]?.wrong ? { wrong: drill.line.moves[drill.ply][2].wrong } : drill.line.messages;
    coach(coachSay('wrong', { exp }, wov), 'bad'); trBoard.flash(to, 'bad');
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
    // per-opening custom off-book line if the repertoire defines one, else the global default
    const ov = repo.offBook?.length ? { offBook: repo.offBook } : null;
    coach(exp ? coachSay('offBook', { exp }, ov) : 'That leaves your repertoire.', 'bad');
    trBoard.flash(to, 'bad');
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
$('#trPrev').onclick = goBack;
$('#trHint').onclick = doHint;
$('#trSound').onclick = () => {
  Sound.enabled = !Sound.enabled; Store.setPref('sound', Sound.enabled);
  const b = $('#trSound'); b.classList.toggle('on', Sound.enabled); b.textContent = Sound.enabled ? '🔊' : '🔇';
  if (Sound.enabled) Sound.move();
};
// step back to your previous move — works in Learn, Practice, Drill and Hyper
function goBack() {
  if (!drill.active) return;
  if (drill.mode === 'learn') return learnStep(-1);
  const floor = userColor() === 'b' ? 1 : 0;     // keep White's opening move for Black repertoires
  if (trGame.history().length <= floor) return;
  trGame.undo();                                  // undo the opponent's reply…
  if (trGame.turn() !== userColor() && trGame.history().length > floor) trGame.undo();  // …and your move
  drill.ply = trGame.history().length; drill.mistake = false; drill.hinted = false;
  if (drill.mode === 'hyper' && hyper) {          // re-widen the bot's candidate lines from the new history
    const hist = trGame.history();
    hyper.ply = hist.length;
    hyper.candidates = scopedLines().filter(l => hist.every((s, i) => l.moves[i] && norm(l.moves[i][0]) === norm(s)));
    if (!hyper.candidates.length) hyper.candidates = scopedLines().slice();
  }
  const h = trGame.history({ verbose: true });
  trBoard.clearPremove(); trBoard.lock(false);
  trBoard.setFen(trGame.fen(), { lastMove: h.length ? { from: h[h.length - 1].from, to: h[h.length - 1].to } : null, silent: true });
  trBoard.setShapes([]); updateEval(); renderMoves(); setArrows();
  coach('⟲ Rewound — your move.');
}
document.addEventListener('keydown', e => {
  if (!$('#view-train').classList.contains('active') || !drill.active) return;
  if (e.key === 'ArrowRight' && drill.mode === 'learn') learnStep(1);
  if (e.key === 'ArrowLeft') goBack();
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
  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    // idle when tab hidden or the home view isn't on screen, cap ~30fps
    if (document.hidden || !$('#view-home').classList.contains('active') || now - last < 33) return;
    last = now; t += 0.03; ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      const amp = d.disp * d.disp * 15 * DPR;
      const x = d.x0 + Math.cos(t * d.sp + d.ph) * amp, y = d.y0 + Math.sin(t * d.sp * 1.3 + d.ph) * amp;
      const a = 0.05 + d.disp * 0.24 + Math.sin(t * 2 + d.ph) * 0.04;
      ctx.beginPath(); ctx.arc(x, y, (0.8 + d.disp * 1.2) * DPR, 0, 6.28);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, a)})`; ctx.fill();
    }
  }
  resize(); window.addEventListener('resize', resize); requestAnimationFrame(frame);
}

// ---------- boot ----------
Engine.init();
buildPieceSeg();
trBoard.setMoveMethod(moveMethod);
syncSeg('moveMethodSeg', moveMethod, 'mm');
syncSeg('soundSeg', soundOn ? 'on' : 'off', 'snd');
setMode('drill');
refreshMastery(); renderHome(); heroFx(); updateEval(); renderAccount();
$('#trSound').textContent = Sound.enabled ? '🔊' : '🔇';
$('#trSound').classList.toggle('on', Sound.enabled);
const ROUTES = ['home', 'train', 'create', 'saved', 'coach'];
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); showView(ROUTES.includes(h) ? h : 'home'); });
{ const h = location.hash.slice(1); showView(ROUTES.includes(h) ? h : 'home'); }
