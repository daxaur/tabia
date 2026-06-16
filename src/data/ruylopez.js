// The Ruy Lopez (Spanish) — White repertoire (1.e4 e5 2.Nf3 Nc6 3.Bb5).
// Mainline theory; [SAN, comment?]; you play every White move.
export const repertoire = {
  id: 'ruylopez', name: 'Ruy Lopez', color: 'w', eco: 'C60',
  oneLiner: '1.e4 e5 2.Nf3 Nc6 3.Bb5 — the Spanish: pressure the knight, the centre, and squeeze.',
  trunk: '1.e4 e5 2.Nf3 Nc6 3.Bb5',
  groups: { closed: { label: 'Closed · 3…a6', blurb: 'The main road' }, other: { label: 'Other defences', blurb: 'Berlin, Open, Exchange' } },
  lines: [
    { id: 'closed-main', name: 'Closed Main (Morphy)', group: 'closed', star: true,
      idea: 'The classical Spanish: retreat the bishop to b3, brace the centre with c3/h3, and build a kingside bind.',
      moves: [['e4'], ['e5'], ['Nf3'], ['Nc6'], ['Bb5', '3.Bb5 — the Spanish bishop.'], ['a6'], ['Ba4'], ['Nf6'],
        ['O-O'], ['Be7'], ['Re1'], ['b5'], ['Bb3'], ['d6'], ['c3'], ['O-O'], ['h3', '9.h3 — stop …Bg4; prepare d4.']] },
    { id: 'exchange', name: 'Exchange (4.Bxc6)', group: 'closed',
      idea: 'Trade on c6 and play the better pawn structure: four vs three on the kingside in the endgame.',
      moves: [['e4'], ['e5'], ['Nf3'], ['Nc6'], ['Bb5'], ['a6'], ['Bxc6', '4.Bxc6 — the Exchange.'], ['dxc6'],
        ['O-O'], ['f6'], ['d4'], ['exd4'], ['Nxd4'], ['c5'], ['Nb3'], ['Qxd1'], ['Rxd1', '9.Rxd1 — a healthy structural edge.']] },
    { id: 'berlin', name: 'Berlin Defence (3…Nf6)', group: 'other',
      idea: 'The Berlin Wall. Steer into the famous queenless endgame where your structure and the bishop pair give a nagging pull.',
      moves: [['e4'], ['e5'], ['Nf3'], ['Nc6'], ['Bb5'], ['Nf6', '3…Nf6 — the Berlin.'], ['O-O'], ['Nxe4'],
        ['d4'], ['Nd6'], ['Bxc6'], ['dxc6'], ['dxe5'], ['Nf5'], ['Qxd8+'], ['Kxd8'], ['Nc3', '9.Nc3 — the Berlin endgame.']] },
    { id: 'open', name: 'Open Spanish (5…Nxe4)', group: 'other',
      idea: 'Black grabs e4 for activity. Hit back with c3 and a timely d4-build; the centre and bishop tell.',
      moves: [['e4'], ['e5'], ['Nf3'], ['Nc6'], ['Bb5'], ['a6'], ['Ba4'], ['Nf6'], ['O-O'], ['Nxe4', '5…Nxe4 — the Open.'],
        ['d4'], ['b5'], ['Bb3'], ['d5'], ['dxe5'], ['Be6'], ['c3', '9.c3 — solid; the e5-pawn cramps Black.']] },
  ],
};
