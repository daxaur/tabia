// The Vienna Gambit — White repertoire (1.e4 e5 2.Nc3 Nf6 3.f4). Offer the f-pawn
// to blow open the centre and hunt the king. Every line is Stockfish-checked
// (depth 20–22). Tuple form: [SAN, comment?]. You play every White move.

export const repertoire = {
  id: 'viennagambit',
  name: 'Vienna Gambit',
  color: 'w',
  eco: 'C29',
  oneLiner: '1.e4 e5 2.Nc3 Nf6 3.f4 — the Vienna Gambit: rip open the f-file, push e5, and attack. Sharp, sound, and full of traps.',
  offBook: ['The gambit runs on the e5 push and the open f-file — {exp} keeps it alive.', 'Play it slow and the pawn just matters; {exp} keeps the attack.', 'Off the plan — {exp} is the move.'],
  trunk: '1.e4 e5 2.Nc3 Nf6 3.f4',
  groups: {
    main:   { label: 'Main lines',    blurb: '3…exf4 accepted & 3…d5' },
    attack: { label: 'Attack & traps', blurb: 'punishing …g5' },
    side:   { label: 'Sidelines',     blurb: '3…d6, 3…Nc6' },
  },
  lines: [
    // ---------------- MAIN ----------------
    { id: 'accepted', name: 'Accepted 3…exf4 4.e5', group: 'main', star: true,
      idea: 'The main gambit. 4.e5! kicks the knight to g8, then you build the big centre and regain the pawn with Qe2/Qxe5 — engine-approved, White is clearly better (≈ +0.6).',
      moves: [
        ['e4'], ['e5'], ['Nc3'], ['Nf6'], ['f4', '3.f4 — the Vienna Gambit; offer the f-pawn.'], ['exf4'],
        ['e5', '4.e5! — the point: hit the f6-knight before Black is ready.'], ['Ng8', '4…Ng8 — forced back to the corner.'],
        ['Nf3'], ['d6'], ['d4', '6.d4 — the broad centre, the pawn long forgotten.'], ['dxe5'],
        ['Qe2', '7.Qe2! — pin the e5-pawn to the king instead of recapturing.'], ['Be7'],
        ['Qxe5', '8.Qxe5 — pawn regained, big lead in development. White is clearly better (≈ +0.6).'],
      ] },
    { id: 'd5-main', name: 'Main 3…d5 (Black’s best)', group: 'main', star: true,
      idea: 'Black’s strongest reply: counter in the centre. After 4.fxe5 Nxe4 it’s a sharp, balanced game (≈ equal) — develop naturally and play for the initiative on the f-file.',
      moves: [
        ['e4'], ['e5'], ['Nc3'], ['Nf6'], ['f4'], ['d5', '3…d5 — the principled strike back, Black’s best.'],
        ['fxe5'], ['Nxe4'], ['Nf3', '5.Nf3 — develop and eye the kingside.'], ['Bc5'],
        ['d4', '6.d4 — grab the centre and hit the c5-bishop.'], ['Bb4'],
        ['Bd2', '7.Bd2 — unpin; a roughly equal, double-edged middlegame (≈ 0.0).'],
      ] },

    // ---------------- ATTACK & TRAPS ----------------
    { id: 'g5-trap', name: 'Greedy …g5 — h4 & Ng5! trap', group: 'attack',
      idea: 'If Black clings to the pawn with …g5, smash it: 6.h4! g4 7.Ng5! and the e6-break tears Black open. Engine says White is clearly better (≈ +0.8).',
      moves: [
        ['e4'], ['e5'], ['Nc3'], ['Nf6'], ['f4'], ['exf4'], ['e5'], ['Ng8'], ['Nf3'],
        ['g5', '5…g5? — greedily defending f4; this is the mistake.'],
        ['h4', '6.h4! — strike the over-extended pawns at once.'], ['g4'],
        ['Ng5', '7.Ng5! — leap in; f7 and the open lines are the target.'], ['d5'],
        ['d4'], ['Be7'], ['e6', '9.e6! — the breakthrough; rip open the centre.'], ['Bxe6'],
        ['Bxf4', '10.Bxf4 — development complete, Black’s king stuck. White is clearly better (≈ +0.8).'],
      ] },

    // ---------------- SIDELINES ----------------
    { id: 'd6-passive', name: 'Passive 3…d6', group: 'side',
      idea: 'Black props the centre passively with …d6. Just develop — Bb5, d4, Bxf4 — and you reach a dream Vienna: a huge centre and the bishop pair (≈ +1.0).',
      moves: [
        ['e4'], ['e5'], ['Nc3'], ['Nf6'], ['f4'], ['d6', '3…d6 — solid but passive.'],
        ['Nf3'], ['Nc6'], ['Bb5', '5.Bb5 — pin and pressure.'], ['exf4'],
        ['d4', '6.d4 — the full centre.'], ['Bd7'],
        ['Bxf4', '7.Bxf4 — pawn back, both bishops out, big centre. White is clearly better (≈ +1.0).'],
      ] },
    { id: 'nc6', name: 'Natural 3…Nc6', group: 'side',
      idea: 'A very natural move that’s simply bad: 4.fxe5 Nxe5 5.d4 chases the knight around, 6.e5 wins more space, and Bc4 finishes a crushing centre (≈ +1.4).',
      moves: [
        ['e4'], ['e5'], ['Nc3'], ['Nf6'], ['f4'], ['Nc6', '3…Nc6? — natural, but it walks into the steamroller.'],
        ['fxe5'], ['Nxe5'], ['d4', '5.d4 — hit the knight and seize the centre.'], ['Ng6'],
        ['e5', '6.e5 — kick the f6-knight too.'], ['Ng8'], ['Nf3'], ['d6'],
        ['Bc4', '8.Bc4 — eye f7; a dream centre and a near-winning grip (≈ +1.4).'],
      ] },
  ],
};
