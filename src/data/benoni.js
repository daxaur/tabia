// The Benoni Defence — Black repertoire (1.d4 Nf6 2.c4 c5). Sharp, asymmetric
// counterplay: trade the e-pawn for the d-file majority and dark-square pressure.
export const repertoire = {
  id: 'benoni', name: 'Benoni Defence', color: 'b', eco: 'A60',
  oneLiner: '1.d4 Nf6 2.c4 c5 3.d5 e6 — the Benoni: hand White the centre, get a queenside majority and a raging dark-squared bishop.',
  trunk: '1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6',
  groups: {
    modern: { label: 'Modern Benoni', blurb: 'The main lines after 3…e6' },
    side:   { label: 'Sidelines', blurb: 'Czech Benoni & Benko Gambit' },
  },
  lines: [
    { id: 'classical', name: 'Classical Main (8.Be2)', group: 'modern', star: true,
      idea: 'The main Modern Benoni. Fianchetto, castle, and uncoil with …Re8, …Na6–c7 and the thematic …b5 break. Objectively White is a shade better (≈ +0.7), but it’s one of the richest, most double-edged structures in chess — you play for the win as Black.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['c5'], ['d5'], ['e6', '3…e6 — challenge the d5-pawn.'],
        ['Nc3'], ['exd5'], ['cxd5'], ['d6'], ['e4'], ['g6', '6…g6 — the Benoni bishop heads to g7.'],
        ['Nf3'], ['Bg7'], ['Be2'], ['O-O'], ['O-O'], ['Re8', '9…Re8 — pressure e4, prepare …Na6 and …b5.'],
        ['Nd2'], ['Na6', '10…Na6 — reroute to c7 to support …b5; rich, fighting middlegame.'],
      ] },
    { id: 'fianchetto', name: 'Fianchetto (7.g3)', group: 'modern',
      idea: 'White fianchettoes to blunt your bishop. Develop solidly and aim for …Re8/…Na6 and the …b5 lever; the d6/c5 majority is your trump.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['c5'], ['d5'], ['e6'], ['Nc3'], ['exd5'], ['cxd5'], ['d6'],
        ['Nf3'], ['g6'], ['g3', '7.g3 — the Fianchetto Variation.'], ['Bg7'], ['Bg2'], ['O-O'],
        ['O-O'], ['Na6', '9…Na6 — the modern setup; …Nc7 and …b5 to come.'],
      ] },
    { id: 'four-pawns', name: 'Four Pawns Attack (7.f4)', group: 'modern',
      idea: 'White grabs the whole centre with f4. Meet the Bb5+ check with …Nfd7 (the main antidote), castle, and counter the over-extended pawns with …Na6 and …b5.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['c5'], ['d5'], ['e6'], ['Nc3'], ['exd5'], ['cxd5'], ['d6'],
        ['e4'], ['g6'], ['f4', '7.f4 — the Four Pawns Attack, the most ambitious try.'], ['Bg7'],
        ['Bb5+'], ['Nfd7', '8…Nfd7! — the key move; the big centre becomes a target.'],
        ['a4'], ['O-O'], ['Nf3'], ['Na6', '10…Na6 — pressure the over-extended pawns.'],
      ] },
    { id: 'czech', name: 'Czech Benoni (3…e5)', group: 'side',
      idea: 'Lock the centre with …e5. A patient manoeuvring game: reroute the knight …Ne8–g7 and prepare the …f5 break.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['c5'], ['d5'], ['e5', '3…e5 — the Czech Benoni, a closed, strategic battle.'],
        ['Nc3'], ['d6'], ['e4'], ['Be7'], ['Nf3'], ['O-O'], ['Be2'], ['Ne8', '7…Ne8 — heading …Ng7 and …f5.'],
      ] },
    { id: 'benko', name: 'Benko Gambit (3…b5)', group: 'side',
      idea: 'Sacrifice a wing pawn for long-term pressure: the half-open a- and b-files and a powerful g7-bishop give lasting, low-risk initiative.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['c5'], ['d5'], ['b5', '3…b5!? — the Benko Gambit.'],
        ['cxb5'], ['a6'], ['bxa6'], ['Bxa6'], ['Nc3'], ['d6'], ['e4'], ['Bxf1'],
        ['Kxf1'], ['g6', 'Black has full compensation: the open queenside files and the long diagonal.'],
      ] },
  ],
};
