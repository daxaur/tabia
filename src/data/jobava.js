// The Jobava London — White repertoire (1.d4 + Nc3 + Bf4). A Tabia original:
// our own curated, aggressive take on the most fashionable London sideline.
// Tuple form: [SAN, comment?]. You play every White move.

export const repertoire = {
  id: 'jobava',
  name: 'Jobava London',
  color: 'w',
  eco: 'D00',
  tabiaOriginal: true,
  oneLiner: '1.d4 d5 2.Nc3 Nf6 3.Bf4 — an offbeat, aggressive London. Objectively Black equalizes, but the Nb5 jumps and h4 storms force awkward play and score well below master level.',
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
      idea: 'The signature Jobava try: 4.Nb5 provokes …Na6 and dictates the setup. Honest: with best play Black is fine (≈ −0.3) — the knight reroutes via …Nb4 — but the awkward …Na6 trips up club opponents constantly.',
      moves: [
        ['d4'], ['d5'], ['Nc3'], ['Nf6'], ['Bf4', '3.Bf4 — the London bishop comes out before e3.'], ['e6'],
        ['Nb5', '4.Nb5!? — eyeing c7 and d6; Black must react.'], ['Na6', '4…Na6 — defends c7, but the knight sits offside for now.'],
        ['e3'], ['Be7'], ['Bd3'], ['O-O'], ['Nf3'], ['c6'],
        ['Nc3', '8.Nc3 — the knight returns. Roughly level (≈ −0.3): you’re playing for the practical awkwardness of Black’s Na6, not an objective edge.'],
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
      idea: 'Black spends a tempo on …a6 to stop Nb5. Just build the London setup — it’s roughly level, with the extra …a6 a small practical plus for you.',
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
      idea: 'Black strikes with …c5. You grab it and jump Nb5, but Black recaptures cleanly with …Bxc5 and is comfortable (≈ −0.5). Play it as a sharp, fighting game — not a free pawn.',
      moves: [
        ['d4'], ['d5'], ['Nc3'], ['Nf6'], ['Bf4'], ['c5'],
        ['dxc5', '4.dxc5 — grab it; the pawn comes back, but you get a lead in development.'], ['e6'],
        ['Nb5', '5.Nb5!? — heading for d6, hitting the loose dark squares.'], ['Bxc5'],
        ['Nf3'], ['O-O'], ['e3'], ['a6'], ['Nbd4', '8.Nbd4 — Black is comfortable (≈ −0.5); play actively for the initiative, the pawn was always coming back.'],
      ] },
    { id: 'kingside-g6', name: 'h4 vs …g6', group: 'attack',
      idea: 'Against the fianchetto, the Jobava bayonet: h4–h5 to pry at the king. Double-edged and very practical — sound for Black, dangerous over the board.',
      moves: [
        ['d4'], ['Nf6'], ['Nc3'], ['g6'], ['Bf4'], ['Bg7'], ['e3'], ['d6'],
        ['h4', '5.h4!? — the bayonet; meet …h5 with a sharp game, or storm with h5 yourself.'], ['h5'], ['Nf3'], ['O-O'], ['Be2'], ['c5'], ['Qd2'],
      ] },
  ],
};
