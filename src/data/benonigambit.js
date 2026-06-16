// The Benoni Gambit (Old Benoni) — Black repertoire (1.d4 c5 2.d5). The direct,
// offbeat cousin of the Modern Benoni: grab the centre tension at once. A Tabia
// original — punchy and surprise-friendly, if objectively a touch loose.
export const repertoire = {
  id: 'oldbenoni', name: 'Benoni Gambit', color: 'b', eco: 'A43', tabiaOriginal: true,
  oneLiner: '1.d4 c5 2.d5 — the Old Benoni: throw …c5 in on move one. Offbeat and a touch loose — a surprise weapon, not an equalizer.',
  trunk: '1.d4 c5 2.d5',
  groups: { main: { label: 'Old Benoni', blurb: 'Direct 1…c5 systems' } },
  lines: [
    { id: 'czech', name: 'Locked Centre (2…e5)', group: 'main', star: true,
      idea: 'Bolt the centre with …e5 (a Czech-Benoni shape) and manoeuvre …Ne7–g6 toward the …f5 break. Be honest: White gets a real space edge here (≈ +1.4 with the h4–h5 push) — this is an offbeat surprise weapon, not a way to equalize.',
      moves: [
        ['d4'], ['c5'], ['d5'], ['e5', '2…e5 — clamp the centre, fight for the dark squares.'],
        ['e4'], ['d6'], ['Nc3'], ['g6'], ['Nf3'], ['Bg7'], ['Be2'], ['Ne7', '6…Ne7 — heading …Ng6 and the …f5 lever.'],
      ] },
    { id: 'kid', name: 'King’s-Indian Setup (2…d6)', group: 'main',
      idea: 'Treat it like a King’s Indian: fianchetto, castle, and break with …e6 or …b5 against White’s big centre.',
      moves: [
        ['d4'], ['c5'], ['d5'], ['d6'], ['e4'], ['g6'], ['Nc3'], ['Bg7'], ['Nf3'], ['Nf6'],
        ['Be2'], ['O-O', '6…O-O — a KID-Benoni structure with …e6/…b5 to come.'],
      ] },
    { id: 'e6-thrust', name: 'Open Lines (2…e6)', group: 'main',
      idea: 'Strike at d5 immediately. After dxe6 fxe6 you get the half-open f-file and a mobile e/d pawn duo — sharp, aggressive piece play.',
      moves: [
        ['d4'], ['c5'], ['d5'], ['e6', '2…e6 — challenge d5 at once.'],
        ['dxe6'], ['fxe6', '3…fxe6 — the half-open f-file is yours.'],
        ['e4'], ['Nc6'], ['Nf3'], ['Nf6'], ['Nc3'], ['d5', '6…d5 — build a broad pawn centre with the initiative.'],
      ] },
  ],
};
