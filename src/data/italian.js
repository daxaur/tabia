// The Italian Game — White repertoire (1.e4 e5 2.Nf3 Nc6 3.Bc4).
export const repertoire = {
  id: 'italian', name: 'Italian Game', color: 'w', eco: 'C50',
  oneLiner: '1.e4 e5 2.Nf3 Nc6 3.Bc4 — the oldest opening: target f7, then choose calm or carnage.',
  trunk: '1.e4 e5 2.Nf3 Nc6 3.Bc4',
  groups: { quiet: { label: 'Giuoco Piano', blurb: 'The slow, modern build' }, sharp: { label: 'Sharp', blurb: 'Two Knights & Evans' } },
  lines: [
    { id: 'giuoco-pianissimo', name: 'Giuoco Pianissimo (c3/d3)', group: 'quiet', star: true,
      idea: 'The modern Italian: a small centre with c3 and d3, castle, regroup Nbd2–f1–g3, and build a slow kingside attack.',
      moves: [['e4'], ['e5'], ['Nf3'], ['Nc6'], ['Bc4'], ['Bc5'], ['c3', '4.c3 — prepare d4 and a slow build.'], ['Nf6'],
        ['d3'], ['d6'], ['O-O'], ['O-O'], ['Re1'], ['a6'], ['Nbd2', '8.Nbd2 — heading Nf1–g3.']] },
    { id: 'two-knights', name: 'Two Knights (3…Nf6 4.Ng5)', group: 'sharp',
      idea: 'The aggressive 4.Ng5 hits f7. After …d5 you snatch a pawn and hold the extra pawn against Black’s initiative (≈ equal — Black has real compensation).',
      moves: [['e4'], ['e5'], ['Nf3'], ['Nc6'], ['Bc4'], ['Nf6', '3…Nf6 — the Two Knights.'], ['Ng5', '4.Ng5!? — straight at f7.'], ['d5'],
        ['exd5'], ['Na5'], ['Bb5+'], ['c6'], ['dxc6'], ['bxc6'], ['Be2'], ['h6'], ['Nf3'], ['e4'], ['Ne5', '10.Ne5 — hold the extra pawn.']] },
    { id: 'evans', name: 'Evans Gambit (4.b4)', group: 'sharp',
      idea: 'A romantic pawn sac: deflect the bishop, grab the centre with c3 and d4, and come crashing at f7.',
      moves: [['e4'], ['e5'], ['Nf3'], ['Nc6'], ['Bc4'], ['Bc5'], ['b4', '4.b4!? — the Evans Gambit.'], ['Bxb4'],
        ['c3'], ['Ba5'], ['d4', '6.d4 — rip open the centre for the sac.'], ['exd4'], ['O-O']] },
  ],
};
