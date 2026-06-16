// The Jobava London — White repertoire (1.d4 + Nc3 + Bf4). A Tabia original:
// our own curated, aggressive take on the most fashionable London sideline.
// Tuple form: [SAN, comment?]. You play every White move.

export const repertoire = {
  id: 'jobava',
  name: 'Jobava London',
  color: 'w',
  eco: 'D00',
  tabiaOriginal: true,
  oneLiner: '1.d4 d5 2.Nc3 Nf6 3.Bf4 — the London with teeth: Nb5 jumps, h4 storms, no dull symmetry.',
  offBook: ['The teeth are in the plan — {exp} keeps Nb5 and h4 live.', 'Play it straight and it’s just a dull London. {exp} keeps the bite.', 'Off the storm — {exp} is the move.'],
  trunk: '1.d4 d5 2.Nc3 Nf6 3.Bf4',
  groups: {
    main:   { label: 'Main · 3…e6', blurb: 'The classical centre' },
    side:   { label: 'Sidelines',   blurb: '…a6, …Bf5, …c6' },
    attack: { label: 'Attack',      blurb: 'When Black invites a fight' },
  },
  lines: [
    // ---------------- MAIN ----------------
    { id: 'nb5-jump', name: 'Nb5 Jump (3…e6)', group: 'main', star: true,
      idea: 'The signature Jobava idea: 4.Nb5 provokes the awkward …Na6, then the knight returns home having ruined Black’s queenside.',
      moves: [
        ['d4'], ['d5'], ['Nc3'], ['Nf6'], ['Bf4', '3.Bf4 — the London bishop comes out before e3.'], ['e6'],
        ['Nb5', '4.Nb5! — eyeing c7 and d6; Black must react.'], ['Na6', '4…Na6 — the only good defence of c7, but the knight is offside.'],
        ['e3'], ['Be7'], ['Bd3'], ['O-O'], ['Nf3'], ['c6'],
        ['Nc3', '8.Nc3 — mission done: the knight returns and Black’s Na6 is misplaced.'],
      ] },
    { id: 'e6-classical', name: 'Classical 4.e3 Bd6', group: 'main',
      idea: 'Black challenges the bishop with …Bd6; you keep it with Bg3 and recapture toward the centre, opening the h-file.',
      moves: [
        ['d4'], ['d5'], ['Nc3'], ['Nf6'], ['Bf4'], ['e6'], ['e3'], ['Bd6'],
        ['Bg3', '5.Bg3 — keep the good bishop.'], ['O-O'], ['Bd3'], ['Bxg3'],
        ['hxg3', '7.hxg3 — recapture toward the centre; the h-file is yours for the attack.'], ['c5'], ['Nf3'],
      ] },

    // ---------------- SIDELINES ----------------
    { id: 'a6-antinb5', name: 'Anti-Nb5 (3…a6)', group: 'side',
      idea: 'Black spends a tempo on …a6 to stop Nb5. Just build the London setup — that free tempo tells later.',
      moves: [
        ['d4'], ['d5'], ['Nc3'], ['Nf6'], ['Bf4'], ['a6', '3…a6 — prophylaxis against Nb5.'], ['e3'], ['e6'],
        ['Bd3'], ['Bd6'], ['Bg3'], ['O-O'], ['Nf3'], ['c5'], ['Ne5'],
      ] },
    { id: 'bf5', name: 'Early …Bf5', group: 'side',
      idea: 'Black mirrors with …Bf5. Play f3 and e4 to blast open the centre while Black’s bishop is offside.',
      moves: [
        ['d4'], ['d5'], ['Nc3'], ['Nf6'], ['Bf4'], ['Bf5'], ['f3', '4.f3 — restrain …Ne4 and prepare e4.'], ['c6'],
        ['e4', '5.e4! — the central break, the whole point of f3.'], ['dxe4'], ['fxe4'], ['Bg6'],
        ['Bd3', '7.Bd3 — a big pawn centre and the bishop pair pointed at the king.'],
      ] },

    // ---------------- ATTACK ----------------
    { id: 'c5-break', name: 'Aggressive …c5', group: 'attack', star: true,
      idea: 'Black strikes with …c5. Take it, jump to b5, and develop with tempo while Black scrambles to regain the pawn.',
      moves: [
        ['d4'], ['d5'], ['Nc3'], ['Nf6'], ['Bf4'], ['c5'],
        ['dxc5', '4.dxc5 — grab it; Black must spend time recapturing.'], ['e6'],
        ['Nb5', '5.Nb5! — heading for d6, hitting the loose dark squares.'], ['Bxc5'],
        ['Nf3'], ['O-O'], ['e3'], ['a6'], ['Nbd4'],
      ] },
    { id: 'kingside-g6', name: 'h4 vs …g6', group: 'attack',
      idea: 'Against the fianchetto, the Jobava bayonet: h4–h5 to rip open the king before Black is ready.',
      moves: [
        ['d4'], ['Nf6'], ['Nc3'], ['g6'], ['Bf4'], ['Bg7'], ['e3'], ['d6'],
        ['h4', '5.h4! — the bayonet; …h5 is forced or g6 collapses.'], ['h5'], ['Nf3'], ['O-O'], ['Be2'], ['c5'], ['Qd2'],
      ] },
  ],
};
