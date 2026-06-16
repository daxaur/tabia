// The Benoni Gambit — Black repertoire (1.d4 c5). Offer the c-pawn. If White
// TAKES (2.dxc5) you regain it with tempo — and if White gets greedy trying to
// HOLD it, there's a piece-winning trap. If White declines (2.d5), the Old Benoni.
export const repertoire = {
  id: 'oldbenoni', name: 'Benoni Gambit', color: 'b', eco: 'A43', tabiaOriginal: true,
  oneLiner: '1.d4 c5!? — offer the c-pawn. Take it back cleanly after 2.dxc5, spring a piece-winning trap if White clings to it, or get the sharp Old Benoni after 2.d5.',
  offBook: ['The trap only springs on the right move-order — {exp}.', 'Grab it back the clean way: {exp}.', 'Off the gambit script — {exp} is the move.'],
  trunk: '1.d4 c5',
  groups: {
    accepted: { label: 'Accepted · 2.dxc5', blurb: 'White takes — you regain it (with a trap)' },
    declined: { label: 'Declined · 2.d5', blurb: 'The Old Benoni' },
  },
  lines: [
    { id: 'accepted', name: 'Accepted Main (…e6 & …Bxc5)', group: 'accepted', star: true,
      idea: 'White grabs the c-pawn — a dubious move that just loses time. Play …e6 and …Bxc5: you regain the pawn with a developing tempo and a comfortable, fully equal game (≈ +0.1). The clean way to refute the capture.',
      messages: { correct: ['Right — take the pawn back with tempo.', 'Clean. That pawn was never really White’s.'] },
      moves: [
        ['d4'], ['c5', '1…c5!? — the Benoni Gambit; offer the pawn.'],
        ['dxc5', '2.dxc5 — accepted; but this loses time.'], ['e6', '2…e6 — prepare …Bxc5 to round the pawn up.'],
        ['e4'], ['Bxc5', '3…Bxc5 — pawn regained, bishop developed with tempo.'],
        ['Bd3'], ['Ne7'], ['Nc3'], ['Nbc6'], ['Nf3'], ['O-O', 'Fully developed and equal — the gambit has done its job.'],
      ] },
    { id: 'b4-trap', name: 'The b4 Greed Trap', group: 'accepted', star: true,
      idea: 'If White clings to the pawn with the natural-looking 3.b4, punish it: …a5 cracks the queenside open and …Qf6 traps the a1-rook on the bared long diagonal. White loses a piece by force (≈ −2.7). The reason humans fear taking the pawn.',
      messages: {
        done: ['A whole piece — that’s why nobody should grab the c-pawn. 🪤', 'Trap sprung. Greed punished.'],
        wrong: ['The trap is move-perfect — it was {exp}.', 'Slip and White wriggles out. The move is {exp}.'],
      },
      moves: [
        ['d4'], ['c5'], ['dxc5'], ['e6'],
        ['b4', '3.b4?! — greedily clinging to the extra pawn.'], ['a5', '3…a5! — strike the b4-pawn at once.'],
        ['c3'], ['axb4'], ['cxb4', '5.cxb4 — …and the a1–h8 diagonal is wide open.'],
        ['Qf6', '5…Qf6! — the trap: the a1-rook has no defence down the open diagonal.'],
        ['Nc3'], ['Qxc3+', '6…Qxc3+ — fork the king and the loose pieces; the greed costs a knight.'],
        ['Bd2'], ['Qa3', '7…Qa3 — pocket the piece and consolidate. Winning.'],
      ] },
    { id: 'qa5-regain', name: 'Quick Regain (2…Qa5+)', group: 'accepted',
      idea: 'The simplest way to win the pawn straight back: …Qa5+ and …Qxc5. You concede a touch of time (≈ +0.5), but it’s clean and easy if you don’t want the …e6 theory.',
      moves: [
        ['d4'], ['c5'], ['dxc5'], ['Qa5+', '2…Qa5+ — check, then …Qxc5 rounds up the pawn.'],
        ['c3'], ['Qxc5'], ['e4'], ['Nf6'], ['Bd3'], ['Qc7', 'Pawn back, a slightly passive but solid game.'],
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
