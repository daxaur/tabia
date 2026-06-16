// The Sicilian Defence — Black repertoire (1.e4 c5). Open Sicilian main lines.
export const repertoire = {
  id: 'sicilian', name: 'Sicilian Defence', color: 'b', eco: 'B20',
  oneLiner: '1.e4 c5 — the fighting answer to 1.e4: unbalance the game and play for the win as Black.',
  trunk: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3',
  groups: { open: { label: 'Open Sicilian', blurb: 'Najdorf, Dragon, Sveshnikov' } },
  lines: [
    { id: 'najdorf', name: 'Najdorf (5…a6)', group: 'open', star: true,
      idea: 'The Najdorf: …a6 keeps options flexible, prepares …e5/…e6 and …b5, and fights for the centre and the dark squares.',
      moves: [['e4'], ['c5'], ['Nf3'], ['d6'], ['d4'], ['cxd4'], ['Nxd4'], ['Nf6'], ['Nc3'], ['a6', '5…a6 — the Najdorf.'],
        ['Be2'], ['e5'], ['Nb3'], ['Be7'], ['O-O'], ['O-O', 'A flexible, double-edged middlegame.']] },
    { id: 'dragon', name: 'Dragon (5…g6)', group: 'open',
      idea: 'Fianchetto the dragon bishop on g7; pressure the long diagonal and the c-file while you castle and counterattack.',
      moves: [['e4'], ['c5'], ['Nf3'], ['d6'], ['d4'], ['cxd4'], ['Nxd4'], ['Nf6'], ['Nc3'], ['g6', '5…g6 — the Dragon.'],
        ['Be3'], ['Bg7'], ['f3'], ['O-O'], ['Qd2'], ['Nc6', 'Castle and pile on the c-file.']] },
    { id: 'sveshnikov', name: 'Sveshnikov (4…Nf6 5…e5)', group: 'open',
      idea: 'Accept a backward d-pawn and the d5-hole for huge piece activity and the bishop pair after …e5 and …b5.',
      moves: [['e4'], ['c5'], ['Nf3'], ['Nc6'], ['d4'], ['cxd4'], ['Nxd4'], ['Nf6'], ['Nc3'], ['e5', '5…e5 — the Sveshnikov.'],
        ['Ndb5'], ['d6'], ['Bg5'], ['a6'], ['Na3'], ['b5', 'Active pieces for the d5 weakness.']] },
  ],
};
