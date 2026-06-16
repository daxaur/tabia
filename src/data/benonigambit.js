// The Benoni Gambit — Black repertoire (1.d4 c5). Offer the c-pawn: if White
// TAKES (2.dxc5, the Benoni Gambit Accepted) you regain it with a tempo and easy
// equality; if White locks with 2.d5 it's the offbeat Old Benoni.
export const repertoire = {
  id: 'oldbenoni', name: 'Benoni Gambit', color: 'b', eco: 'A43', tabiaOriginal: true,
  oneLiner: '1.d4 c5!? — offer the c-pawn. If White takes (2.dxc5) you win it straight back with a free tempo; if White declines (2.d5) you get the sharp Old Benoni.',
  trunk: '1.d4 c5',
  groups: {
    accepted: { label: 'Accepted · 2.dxc5', blurb: 'White takes — you regain it' },
    declined: { label: 'Declined · 2.d5', blurb: 'The Old Benoni' },
  },
  lines: [
    { id: 'accepted', name: 'Gambit Accepted (2.dxc5)', group: 'accepted', star: true,
      idea: 'White grabs the c-pawn — a dubious move that loses time. Play …e6 and …Bxc5: you regain the pawn with a developing tempo and a comfortable, fully equal game (≈ +0.2). The point of the whole gambit.',
      messages: { correct: ['Right — snatch the pawn back with tempo.', 'Clean. The c5-pawn was never really White’s.'] },
      moves: [
        ['d4'], ['c5', '1…c5!? — the Benoni Gambit; offer the pawn.'],
        ['dxc5', '2.dxc5 — accepted; but this just loses time.'], ['e6', '2…e6 — prepare …Bxc5 to round the pawn up.'],
        ['e4'], ['Bxc5', '3…Bxc5 — pawn regained, bishop developed with tempo.'],
        ['Bd3'], ['Ne7'], ['Nc3'], ['Nbc6'], ['Nf3'], ['O-O', 'A pleasant, equal middlegame — Black is fully developed.'],
      ] },
    { id: 'czech', name: 'Declined — Locked Centre (2.d5 e5)', group: 'declined',
      idea: 'If White declines with 2.d5, bolt the centre with …e5 (a Czech-Benoni shape). Honest: White gets a real space edge here (≈ +1.4 with the h4–h5 push) — an offbeat surprise weapon, not an equalizer.',
      moves: [
        ['d4'], ['c5'], ['d5', '2.d5 — declined; the Old Benoni.'], ['e5', '2…e5 — clamp the centre.'],
        ['e4'], ['d6'], ['Nc3'], ['g6'], ['Nf3'], ['Bg7'], ['Be2'], ['Ne7', '6…Ne7 — heading …Ng6 and the …f5 lever.'],
      ] },
    { id: 'kid', name: 'Declined — King’s-Indian Setup (2.d5 d6)', group: 'declined',
      idea: 'Against 2.d5, treat it like a King’s Indian: fianchetto, castle, and break with …e6 or …b5 against White’s big centre.',
      moves: [
        ['d4'], ['c5'], ['d5'], ['d6'], ['e4'], ['g6'], ['Nc3'], ['Bg7'], ['Nf3'], ['Nf6'],
        ['Be2'], ['O-O', '6…O-O — a KID-Benoni structure with …e6/…b5 to come.'],
      ] },
  ],
};
