// The Caro-Kann Defence — Black repertoire (1.e4 c6).
export const repertoire = {
  id: 'carokann', name: 'Caro-Kann', color: 'b', eco: 'B10',
  oneLiner: '1.e4 c6 — solid as granite: a sound structure, the good bishop out early, no weaknesses.',
  trunk: '1.e4 c6 2.d4 d5',
  groups: { main: { label: 'Main · 3.Nc3', blurb: 'Classical development' }, other: { label: 'Other', blurb: 'Advance & Panov' } },
  lines: [
    { id: 'classical-ck', name: 'Classical (4…Bf5)', group: 'main', star: true,
      idea: 'Develop the light-squared bishop outside the chain to f5/g6, finish development cleanly, and stand rock-solid.',
      moves: [['e4'], ['c6'], ['d4'], ['d5'], ['Nc3'], ['dxe4'], ['Nxe4'], ['Bf5', '4…Bf5 — the good bishop comes out.'],
        ['Ng3'], ['Bg6'], ['h4'], ['h6'], ['Nf3'], ['Nd7', 'Solid, harmonious development.']] },
    { id: 'advance-ck', name: 'Advance (3.e5 Bf5)', group: 'other',
      idea: 'Unlike the French, the bishop escapes to f5 before …e6. Develop behind it and chip at d4 with …c5.',
      moves: [['e4'], ['c6'], ['d4'], ['d5'], ['e5', '3.e5 — the Advance.'], ['Bf5'], ['Nf3'], ['e6'],
        ['Be2'], ['Nd7'], ['O-O'], ['h6', 'No bad bishop — the Caro point.']] },
    { id: 'panov', name: 'Panov–Botvinnik (Exchange c4)', group: 'other',
      idea: 'White takes on d5 and plays c4 for an IQP game. Blockade d5, develop actively, and target the isolated pawn.',
      moves: [['e4'], ['c6'], ['d4'], ['d5'], ['exd5'], ['cxd5'], ['c4', '4.c4 — the Panov.'], ['Nf6'],
        ['Nc3'], ['e6'], ['Nf3'], ['Be7', 'Blockade and pressure the IQP.']] },
  ],
};
