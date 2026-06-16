// The Alien Gambit — White vs the Caro-Kann (1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4
// Nf6 5.Ng5 h6 6.Nxf7!?). A Tabia original: objectively losing, practically lethal.
export const repertoire = {
  id: 'alien', name: 'Alien Gambit', color: 'w', eco: 'B10', tabiaOriginal: true,
  oneLiner: '1.e4 c6 … 6.Nxf7!? — sacrifice the knight on f7 and hunt the king. 👽 Engine says no, the 1500s say yes.',
  offBook: ['The hunt only works on the rails — {exp} keeps the king cornered.', 'Drift here and Black consolidates. {exp} keeps the fire lit.', 'Off the abduction route 👽 — {exp} is the move.'],
  trunk: '1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4 Nf6 5.Ng5 h6 6.Nxf7',
  groups: { hunt: { label: 'The Sacrifice', blurb: '6.Nxf7 and the king-hunt' } },
  lines: [
    { id: 'alien-main', name: 'Main King-Hunt (7…e6)', group: 'hunt', star: true,
      idea: 'Objectively a knight down — Stockfish gives Black ≈ −2.7. But f7 is shattered, the king is stranded in the centre, and below ~1500 White scores around 60%. Pure chaos: Black has to find only-moves to survive.',
      messages: { done: ['The aliens have landed. 👽', 'A knight down and winning — that’s the Alien Gambit.'] },
      moves: [
        ['e4'], ['c6'], ['d4'], ['d5'], ['Nd2'], ['dxe4'], ['Nxe4'], ['Nf6'],
        ['Ng5', '5.Ng5 — the knight leaps toward f7.'], ['h6', '5…h6 — “shooing” the knight, straight into the trap.'],
        ['Nxf7', '6.Nxf7!? — the Alien Gambit. The fork on d8/h8 makes …Kxf7 forced (else the queen falls to Nxd8).'], ['Kxf7'],
        ['Bc4+', '7.Bc4+ — drag the king into the open; the checks begin.'], ['e6'],
        ['Qf3', '8.Qf3 — pile on f6 and e6 (Qxf6+ and Bxe6+ loom). The king has no shelter.'],
      ] },
    { id: 'alien-ke8', name: 'King retreats (7…Ke8)', group: 'hunt',
      idea: 'If Black scurries the king back to e8 instead of blocking, develop fast. Nf3, Ne5 and Qf3/Qe2 keep the king stuck in the centre with no castling and a lasting initiative for the piece.',
      moves: [
        ['e4'], ['c6'], ['d4'], ['d5'], ['Nd2'], ['dxe4'], ['Nxe4'], ['Nf6'], ['Ng5'], ['h6'], ['Nxf7'], ['Kxf7'],
        ['Bc4+', '7.Bc4+ — the bishop joins the hunt.'], ['Ke8', '7…Ke8 — retreating, but castling rights are gone for good.'],
        ['Nf3', '8.Nf3 — the last piece; Ne5 and Qe2 keep the king in the crossfire.'],
      ] },
  ],
};
