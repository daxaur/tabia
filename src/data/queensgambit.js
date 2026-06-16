// The Queen's Gambit — White repertoire (1.d4 d5 2.c4). Covers every major Black
// defence: QGD, QGA, Slav, Semi-Slav, Tarrasch, Chigorin, Albin, Baltic.
// Mainline theory. Tuple form: [SAN, comment?]. You play every White move.

export const repertoire = {
  id: 'qg',
  name: "Queen's Gambit",
  color: 'w',
  eco: 'D06',
  oneLiner: '1.d4 d5 2.c4 — the classical bid for the centre; meet every defence with a clean main line.',
  trunk: '1.d4 d5 2.c4',
  groups: {
    declined: { label: 'Declined · 2…e6', blurb: 'The QGD — Black holds the centre' },
    accepted: { label: 'Accepted · 2…dxc4', blurb: 'Black takes; you take the centre' },
    slav:     { label: 'Slav · 2…c6', blurb: 'Slav & Semi-Slav structures' },
    sideline: { label: 'Sidelines', blurb: 'Tarrasch, Chigorin, Albin, Baltic' },
  },
  lines: [
    // ---------------- QUEEN'S GAMBIT DECLINED ----------------
    { id: 'qgd-main', name: 'QGD Main (4.Bg5)', group: 'declined', star: true,
      idea: 'The classical QGD. Pin with Bg5, trade off on d5, and play with the slightly freer game and the c-file.',
      moves: [
        ['d4'], ['d5'], ['c4'], ['e6', '2…e6 — the Queen’s Gambit Declined.'], ['Nc3'], ['Nf6'],
        ['Bg5', '4.Bg5 — the classical pin on the f6-knight.'], ['Be7'], ['e3'], ['O-O'], ['Nf3'], ['h6'],
        ['Bh4', '7.Bh4 — keep the pin.'], ['b6', '7…b6 — the Tartakower, the soundest defence.'],
        ['cxd5'], ['Nxd5'], ['Bxe7'], ['Qxe7'], ['Nxd5'], ['exd5'],
        ['Rc1', '11.Rc1 — pressure down the half-open c-file; a tiny, durable edge.'],
      ] },
    { id: 'qgd-exchange', name: 'QGD Exchange (Minority Attack)', group: 'declined',
      idea: 'Trade on d5 early and launch the minority attack: b4–b5 to gouge a weakness on c6.',
      moves: [
        ['d4'], ['d5'], ['c4'], ['e6'], ['Nc3'], ['Nf6'],
        ['cxd5', '4.cxd5 — the Exchange; fix the structure for a queenside plan.'], ['exd5'],
        ['Bg5'], ['c6'], ['e3'], ['Be7'], ['Bd3'], ['O-O'], ['Qc2'], ['Re8'], ['Nge2'], ['Nbd7'],
        ['O-O'], ['Nf8'], ['Rab1', '11.Rab1 — preparing b4–b5, the minority attack.'],
      ] },
    { id: 'qgd-cambridge', name: 'Cambridge Springs (6…Qa5)', group: 'declined',
      idea: 'Black’s tricky …Qa5 hits the pinned knight. Calmly unpin with Nd2 and the pin backfires.',
      moves: [
        ['d4'], ['d5'], ['c4'], ['e6'], ['Nc3'], ['Nf6'], ['Bg5'], ['Nbd7'], ['Nf3'], ['c6'], ['e3'],
        ['Qa5', '6…Qa5 — the Cambridge Springs, eyeing the pin and c3.'],
        ['Nd2', '7.Nd2! — unpin and defend; the queen sortie loses its sting.'], ['Bb4'],
        ['Qc2'], ['O-O'], ['Be2', '9.Be2 — calmly finish development with a comfortable game.'],
      ] },

    // ---------------- QUEEN'S GAMBIT ACCEPTED ----------------
    { id: 'qga-main', name: 'QGA Main (3.Nf3)', group: 'accepted', star: true,
      idea: 'Don’t rush to regain the pawn — develop, recapture on c4, and enjoy a free, central game.',
      moves: [
        ['d4'], ['d5'], ['c4'], ['dxc4', '2…dxc4 — the Queen’s Gambit Accepted.'],
        ['Nf3', '3.Nf3 — stop …e5 first; the pawn isn’t running away.'], ['Nf6'], ['e3'], ['e6'],
        ['Bxc4', '5.Bxc4 — calmly regain the pawn.'], ['c5'], ['O-O'], ['a6'],
        ['dxc5'], ['Qxd1'], ['Rxd1'], ['Bxc5'], ['Nbd2', '9.Nbd2 — a pleasant edge in a queenless middlegame.'],
      ] },
    { id: 'qga-central', name: 'QGA Central (3.e4)', group: 'accepted',
      idea: 'The ambitious 3.e4 grabs a big centre at once. If Black hits it with …e5, don’t rush to regain d4 — develop and hit f7/b7 with Qb3, standing clearly better (≈ +1.1).',
      moves: [
        ['d4'], ['d5'], ['c4'], ['dxc4'], ['e4', '3.e4 — the central QGA, a broad pawn front.'],
        ['e5', '3…e5 — the principled strike.'], ['Nf3'], ['exd4'], ['Bxc4'], ['Nc6'],
        ['O-O'], ['Be7'], ['Qb3', '7.Qb3! — hit f7 and b7. Not 7.Nxd4?? Qxd4 (the d4-knight has two attackers, one defender — Black wins a piece). White is clearly better.'],
      ] },

    // ---------------- SLAV / SEMI-SLAV ----------------
    { id: 'slav-main', name: 'Slav Main (5.a4 Bf5)', group: 'slav',
      idea: 'Black keeps the c8-bishop active with …Bf5. Clamp with a4, regain the pawn on c4, and develop smoothly.',
      moves: [
        ['d4'], ['d5'], ['c4'], ['c6', '2…c6 — the rock-solid Slav.'], ['Nf3'], ['Nf6'], ['Nc3'], ['dxc4'],
        ['a4', '5.a4 — stop …b5 and prepare to round up c4.'], ['Bf5'], ['e3'], ['e6'], ['Bxc4'], ['Bb4'],
        ['O-O'], ['O-O'], ['Qe2', '9.Qe2 — connect the rooks, aim e3–e4.'],
      ] },
    { id: 'semi-slav-meran', name: 'Semi-Slav Meran (7…b5 8.Bd3)', group: 'slav',
      idea: 'The Meran: let Black grab queenside space, then blow open the centre with e3–e4.',
      moves: [
        ['d4'], ['d5'], ['c4'], ['c6'], ['Nf3'], ['Nf6'], ['Nc3'], ['e6', '4…e6 — the Semi-Slav.'], ['e3'], ['Nbd7'],
        ['Bd3'], ['dxc4'], ['Bxc4'], ['b5'], ['Bd3'], ['a6'],
        ['e4', '9.e4! — the Meran break; a rich, fighting centre.'],
      ] },

    // ---------------- SIDELINES ----------------
    { id: 'tarrasch', name: 'Tarrasch (3…c5)', group: 'sideline',
      idea: 'Black accepts an isolated d-pawn for activity. Fianchetto with g3/Bg2 to blockade and press d5 long-term.',
      moves: [
        ['d4'], ['d5'], ['c4'], ['e6'], ['Nc3'], ['c5', '3…c5 — the Tarrasch Defence.'],
        ['cxd5'], ['exd5'], ['Nf3'], ['Nc6'], ['g3', '6.g3 — the Rubinstein system; the bishop will eye d5.'],
        ['Nf6'], ['Bg2'], ['Be7'], ['O-O'], ['O-O'], ['Bg5', '9.Bg5 — pile up on the isolated d5-pawn.'],
      ] },
    { id: 'chigorin', name: 'Chigorin (2…Nc6)', group: 'sideline',
      idea: 'Black’s offbeat …Nc6. Take the bishop pair, prop the centre with e3 (note: e4? drops d4 to …Nxd4), and the doubled f-pawns are a small price (≈ +0.5).',
      moves: [
        ['d4'], ['d5'], ['c4'], ['Nc6', '2…Nc6 — the Chigorin, piece play over structure.'], ['Nf3'], ['Bg4'],
        ['cxd5'], ['Bxf3'], ['gxf3', '5.gxf3 — grab the bishop pair; the doubled f-pawns are fine.'], ['Qxd5'],
        ['e3', '6.e3 — solid: defend d4 first (6.Nc3? Qd6 7.e4?? Nxd4 wins the pawn).'], ['e5'],
        ['Nc3'], ['Bb4'], ['Bd2'], ['Bxc3'], ['bxc3', '9.bxc3 — two bishops, a broad centre, the long-term pull.'],
      ] },
    { id: 'albin', name: 'Albin Counter-Gambit (2…e5)', group: 'sideline',
      idea: 'A gambit reply. Take on e5, blockade the advanced d4-pawn, fianchetto, and just be up a pawn.',
      moves: [
        ['d4'], ['d5'], ['c4'], ['e5', '2…e5!? — the Albin Counter-Gambit.'], ['dxe5'], ['d4'],
        ['Nf3'], ['Nc6'], ['g3', '5.g3 — the modern antidote; bishop to g2 and round up d4.'], ['Be6'],
        ['Nbd2'], ['Qd7'], ['Bg2'], ['O-O-O'], ['O-O', '8.O-O — castled, a clean extra pawn, no counterplay.'],
      ] },
    { id: 'baltic', name: 'Baltic (2…Bf5)', group: 'sideline',
      idea: 'The …Bf5 sideline. Take on d5, win the bishop back with the Qa4+/Rxb1 trick, and emerge with the bishop pair and a pleasant space edge (≈ +0.5).',
      moves: [
        ['d4'], ['d5'], ['c4'], ['Bf5', '2…Bf5?! — developing the bishop before …e6 traps it in.'],
        ['cxd5', '3.cxd5 — the bishop on f5 is now loose.'], ['Bxb1'],
        ['Qa4+', '4.Qa4+! — the in-between check that rounds the bishop up.'], ['c6'],
        ['Rxb1', '5.Rxb1 — regaining the piece.'], ['Qxd5'],
        ['Nf3'], ['e6'], ['b4', '7.b4 — grab queenside space; a comfortable, lasting edge.'],
      ] },
  ],
};
