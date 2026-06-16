// tabia Coach — "find the opening that fits you". Pulls your recent games from
// the Lichess / Chess.com PUBLIC APIs (no paid AI, no server), profiles your
// style, and matches a Tabia opening. All client-side.

// which Tabia opening fits which kind of player
const TABIA_META = {
  // White repertoires
  bdg:       { side: 'w', d1: 'd4', style: 'aggressive' },
  jobava:    { side: 'w', d1: 'd4', style: 'aggressive' },
  alien:     { side: 'w', d1: 'e4', style: 'aggressive' },
  italian:   { side: 'w', d1: 'e4', style: 'classical' },
  ruylopez:  { side: 'w', d1: 'e4', style: 'classical' },
  qg:        { side: 'w', d1: 'd4', style: 'classical' },
  // Black repertoires (vs White's first move)
  sicilian:  { side: 'b', vs: 'e4', style: 'aggressive' },
  french:    { side: 'b', vs: 'e4', style: 'solid' },
  carokann:  { side: 'b', vs: 'e4', style: 'solid' },
  budapest:  { side: 'b', vs: 'd4', style: 'aggressive' },
  benoni:    { side: 'b', vs: 'd4', style: 'aggressive' },
  oldbenoni: { side: 'b', vs: 'd4', style: 'aggressive' },
};
const DRAW = new Set(['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient']);
const clean = s => (s || '').replace(/[+#!?]/g, '');
const cat = m => (m === 'e4' ? 'e4' : m === 'd4' ? 'd4' : m === 'c4' ? 'c4' : m === 'Nf3' ? 'Nf3' : 'other');

async function fetchChesscom(username, max = 80) {
  const u = username.trim().toLowerCase().replace(/^@/, '');
  const arch = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(u)}/games/archives`)
    .then(r => r.ok ? r.json() : Promise.reject(new Error('No such Chess.com player')));
  const urls = (arch.archives || []).slice(-3).reverse();
  let out = [];
  for (const url of urls) {
    const data = await fetch(url).then(r => r.ok ? r.json() : { games: [] }).catch(() => ({ games: [] }));
    for (const g of (data.games || [])) {
      if (g.rules && g.rules !== 'chess') continue;
      const white = (g.white?.username || '').toLowerCase();
      const youWhite = white === u;
      const pgn = g.pgn || '';
      const mt = pgn.split(/\n\n/).slice(1).join('\n') || pgn;
      const d1w = clean((mt.match(/\b1\.\s*([A-Za-z][^\s]*)/) || [])[1]);
      const nums = [...mt.matchAll(/(\d+)\.\s/g)].map(m => +m[1]);
      const plies = (nums.length ? Math.max(...nums) : 0) * 2;
      const myRes = youWhite ? g.white?.result : g.black?.result;
      const result = myRes === 'win' ? 'win' : DRAW.has(myRes) ? 'draw' : 'loss';
      out.push({ youWhite, d1w, plies, result });
    }
    if (out.length >= max) break;
  }
  if (!out.length) throw new Error('No standard games found for that player');
  return out.slice(0, max);
}

async function lichessRaw(username, max, rated) {
  const u = encodeURIComponent(username.trim().replace(/^@/, ''));
  const url = `https://lichess.org/api/games/user/${u}?max=${max}&moves=true&perfType=ultraBullet,bullet,blitz,rapid,classical${rated ? '&rated=true' : ''}`;
  const res = await fetch(url, { headers: { Accept: 'application/x-ndjson' } });
  if (res.status === 404) throw new Error('No Lichess player by that name.');
  if (res.status === 429) throw new Error('Lichess is busy (rate-limited) — wait a few seconds and retry.');
  if (!res.ok) throw new Error('Lichess request failed — try again in a moment.');
  const text = await res.text();
  if (!text.trim()) return [];
  return text.trim().split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
async function fetchLichess(username, max = 80) {
  let raw = await lichessRaw(username, max, true);            // rated first — cleanest style signal
  if (!raw.length) raw = await lichessRaw(username, max, false);  // fall back to casual games
  if (!raw.length) throw new Error('That account has no standard games to read yet.');
  const lc = username.trim().toLowerCase().replace(/^@/, '');
  return raw.map(g => {
    const white = (g.players?.white?.user?.name || '').toLowerCase();
    const youWhite = white === lc;
    const mv = (g.moves || '').split(' ').filter(Boolean);
    const result = g.winner ? ((g.winner === 'white') === youWhite ? 'win' : 'loss') : 'draw';
    return { youWhite, d1w: clean(mv[0]), plies: mv.length, result };
  });
}

function analyze(games) {
  const n = games.length;
  const tally = a => a.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
  const top = o => Object.entries(o).filter(([k]) => k !== 'other').sort((a, b) => b[1] - a[1])[0]?.[0];
  const whites = games.filter(g => g.youWhite), blacks = games.filter(g => !g.youWhite);
  const whiteFirst = tally(whites.map(g => cat(g.d1w)));
  const faced = tally(blacks.map(g => cat(g.d1w)));        // opponent's first move when you're Black
  const wins = games.filter(g => g.result === 'win').length;
  const withPlies = games.filter(g => g.plies > 0);
  const avgPlies = withPlies.length ? withPlies.reduce((a, g) => a + g.plies, 0) / withPlies.length : 0;
  const shortPct = Math.round(withPlies.filter(g => g.plies < 60).length / Math.max(1, withPlies.length) * 100);
  const aggressive = (avgPlies > 0 && avgPlies < 70) || shortPct > 32;
  return {
    n, whiteD1: top(whiteFirst) || 'e4', faced: top(faced) || 'e4',
    winRate: Math.round(wins / Math.max(1, n) * 100), avgMoves: Math.round(avgPlies / 2), shortPct, aggressive,
  };
}

function pick(fn) { const id = Object.keys(TABIA_META).find(k => fn(TABIA_META[k])); return id ? { id, ...TABIA_META[id] } : null; }
function suggest(p) {
  const wStyle = p.aggressive ? 'aggressive' : 'classical';
  const bStyle = p.aggressive ? 'aggressive' : 'solid';
  const wD1 = (p.whiteD1 === 'e4' || p.whiteD1 === 'd4') ? p.whiteD1 : 'd4';
  const bVs = (p.faced === 'e4' || p.faced === 'd4') ? p.faced : 'e4';
  const white = pick(o => o.side === 'w' && o.d1 === wD1 && o.style === wStyle) || pick(o => o.side === 'w' && o.d1 === wD1) || pick(o => o.side === 'w');
  const black = pick(o => o.side === 'b' && o.vs === bVs && o.style === bStyle) || pick(o => o.side === 'b' && o.vs === bVs) || pick(o => o.side === 'b');
  return { white, black, wD1, bVs, wStyle, bStyle };
}

export const CoachAI = {
  async profile(site, username) {
    const games = site === 'lichess' ? await fetchLichess(username) : await fetchChesscom(username);
    const p = analyze(games);
    return { ...p, rec: suggest(p), site, username: username.trim() };
  },
};
