// The Scotch Gambit — White repertoire (1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4).
// Offer the d4-pawn for a fast, attacking initiative against f7. Every move is
// engine-checked (Stockfish d20–22). Tuple form: [SAN, comment?].

export const repertoire = {
  id: 'scotchgambit',
  name: 'Scotch Gambit',
  color: 'w',
  eco: 'C44',
  oneLiner: '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 — sac the centre pawn for a screaming initiative on f7. Sound, sharp, and full of traps.',
  offBook: ['The gambit lives on the initiative — {exp} keeps the fire on f7.', 'Slow down and the pawn just matters; {exp} keeps it sharp.', 'Off the attack — {exp} is the move.'],
  trunk: '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4',
  groups: {
    main:     { label: 'Main lines',  blurb: '4…Bc5 and 4…Nf6' },
    attack:   { label: 'Attack & traps', blurb: 'Max Lange + the f7 traps' },
    declined: { label: 'Declined',    blurb: 'Black plays it safe' },
  },
  lines: [
    // ---------------- MAIN ----------------
    { id: 'classical-main', name: 'Classical 4…Bc5 5.c3', group: 'main', star: true,
      idea: 'The main line. You sac a piece with 9.d5! for a raging attack and full compensation — engine-perfect, it’s dynamic equality (≈ 0.0) but a nightmare for Black to defend.',
      moves: [
        ['e4'], ['e5'], ['Nf3'], ['Nc6'], ['d4'], ['exd4'],
        ['Bc4', '4.Bc4 — the Scotch Gambit: develop and aim at f7 instead of recapturing.'], ['Bc5'],
        ['c3', '5.c3 — challenge the d4-pawn and open lines.'], ['Nf6'],
        ['cxd4'], ['Bb4+'], ['Nc3', '7.Nc3 — the sharp choice; block with the knight.'], ['Nxe4'],
        ['O-O', '8.O-O — ignore the pawns, get the king safe and the rook to e1.'], ['Bxc3'],
        ['d5', '9.d5! — the point: sac the piece, hit the Nc6, and open everything.'], ['Bf6'],
        ['Re1', '10.Re1 — pin the e4-knight to the king.'], ['Ne7'],
        ['Rxe4', '11.Rxe4 — win the knight back; you’re a pawn down with a crushing initiative (≈ 0.0).'], ['d6'],
        ['Bg5', '12.Bg5 — pile on the pins; full comp and a dangerous attack.'],
      ] },
    { id: 'nf6-e5', name: '4…Nf6 5.e5', group: 'main',
      idea: 'If Black develops with …Nf6, kick it with 5.e5 and regain the pawn with Nxd4. A normal, sound game (≈ equal) — no fireworks, just a pleasant Italian-style centre.',
      moves: [
        ['e4'], ['e5'], ['Nf3'], ['Nc6'], ['d4'], ['exd4'], ['Bc4'], ['Nf6'],
        ['e5', '5.e5 — gain space and chase the knight.'], ['d5'],
        ['Bb5', '6.Bb5 — pin the c6-knight before it’s defended.'], ['Ne4'], ['Nxd4'], ['Bd7'],
        ['Bxc6'], ['bxc6'], ['O-O'], ['Bc5'], ['Be3', '10.Be3 — develop, trade if invited; a balanced middlegame (≈ equal).'],
      ] },

    // ---------------- ATTACK & TRAPS ----------------
    { id: 'max-lange', name: 'Max Lange Attack', group: 'attack', star: true,
      idea: 'The legendary Max Lange: 6.e5! and a forced storm down the e-file and at f7. Engine-approved — White is a touch better (≈ +0.2) with a ferocious initiative.',
      moves: [
        ['e4'], ['e5'], ['Nf3'], ['Nc6'], ['d4'], ['exd4'], ['Bc4'], ['Nf6'],
        ['O-O', '5.O-O — invite …Bc5 and the Max Lange.'], ['Bc5'],
        ['e5', '6.e5! — the Max Lange Attack; the f6-knight is hit.'], ['d5'],
        ['exf6', '7.exf6 — open the e-file with tempo.'], ['dxc4'], ['Re1+', '8.Re1+ — the check that powers the attack.'], ['Be6'],
        ['Ng5', '9.Ng5 — hit the pinned bishop on e6.'], ['Qd5'], ['Nc3', '10.Nc3 — develop with tempo on the queen.'], ['Qf5'],
        ['Nce4', '11.Nce4 — the knights swarm the kingside.'], ['Bf8'], ['fxg7'], ['Bxg7', 'White is slightly better (≈ +0.2) with a raging attack; Nxf7! is in the air.'],
      ] },
    { id: 'dxc3-trap', name: 'Greedy 5…dxc3 — Bxf7+ trap', group: 'attack',
      idea: 'If Black gets greedy and grabs 5…dxc3, punish it: 6.Bxf7+! rips open the king. After the forced sequence White is clearly better (≈ +0.7), Black castle-less and exposed.',
      moves: [
        ['e4'], ['e5'], ['Nf3'], ['Nc6'], ['d4'], ['exd4'], ['Bc4'], ['Bc5'], ['c3'],
        ['dxc3', '5…dxc3? — too greedy; the second pawn costs Black the king’s safety.'],
        ['Bxf7+', '6.Bxf7+! — the trap. Blow open f7.'], ['Kxf7'],
        ['Qd5+', '7.Qd5+ — fork the king and the Bc5.'], ['Kf8'],
        ['Qxc5+', '8.Qxc5+ — collect the bishop with check.'], ['d6'],
        ['Qxc3', '8…d6 9.Qxc3 — material is level but Black has lost castling and is passive (≈ +0.7). Develop and attack.'],
      ] },

    // ---------------- DECLINED ----------------
    { id: 'be7-declined', name: 'Solid 4…Be7', group: 'declined',
      idea: 'Black sidesteps the fireworks with …Be7. Just take the pawn back with Nxd4 and enjoy a comfortable, better centre (≈ +0.4) — no gambit needed.',
      moves: [
        ['e4'], ['e5'], ['Nf3'], ['Nc6'], ['d4'], ['exd4'], ['Bc4'], ['Be7', '4…Be7 — the safe, solid try.'],
        ['Nxd4', '5.Nxd4 — no need to gamble; regain the pawn with a fine position.'], ['Nf6'],
        ['Nc3'], ['O-O'], ['O-O'], ['d6'], ['h3', '8.h3 — tuck the bishop’s retreat in; White is comfortably better (≈ +0.4).'],
      ] },
  ],
};
