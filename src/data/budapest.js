// The Budapest Gambit — Black repertoire (1.d4 Nf6 2.c4 e5!?). A Tabia original:
// a punchy, low-theory weapon that ambushes 1.d4 players who expect a quiet game.
// Tuple form: [SAN, comment?]. You play every Black move.

export const repertoire = {
  id: 'budapest',
  name: 'Budapest Gambit',
  color: 'b',
  eco: 'A52',
  tabiaOriginal: true,
  oneLiner: '1.d4 Nf6 2.c4 e5!? — sac a pawn for fast, active piece play and tricks on the dark squares.',
  trunk: '1.d4 Nf6 2.c4 e5 3.dxe5 Ng4',
  groups: {
    adler:  { label: 'Accepted · Ng4', blurb: 'The main road — win the pawn back' },
    fajaro: { label: 'Fajarowicz · Ne4', blurb: 'The wild knight leap' },
    decl:   { label: 'Declined',        blurb: 'When White won’t take' },
  },
  lines: [
    // ---------------- ACCEPTED 3…Ng4 ----------------
    { id: 'adler-main', name: 'Adler Main (4.Bf4)', group: 'adler', star: true,
      idea: 'The main line. Pin with …Bb4+, pile on e5 with …Qe7, and regain the pawn with a comfortable, active game.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['e5', '2…e5! — the gambit; offer the pawn for activity.'],
        ['dxe5'], ['Ng4', '3…Ng4 — hop back to round up the e5-pawn.'],
        ['Bf4', '4.Bf4 — White clings to the extra pawn.'], ['Nc6'],
        ['Nf3'], ['Bb4+', '5…Bb4+ — develop with check and add a defender of …Ngxe5.'],
        ['Nbd2'], ['Qe7', '6…Qe7 — triple the pressure on e5.'],
        ['a3'], ['Ngxe5', '7…Ngxe5 — the pawn comes back; Black is fully equal and active.'],
        ['Nxe5'], ['Nxe5'], ['e3'], ['Bxd2+'], ['Qxd2'],
      ] },
    { id: 'rubinstein', name: 'Rubinstein (…Bc5)', group: 'adler',
      idea: 'A sharper try: …Bc5 hits f2. White must watch the …Ng4xf2 and …Bxf2+ tricks while you round up e5.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['e5'], ['dxe5'], ['Ng4'],
        ['Nf3'], ['Bc5', '4…Bc5 — train the bishop on f2; tactics loom.'],
        ['e3'], ['Nc6'], ['Be2'], ['Ngxe5', '6…Ngxe5 — recapture; the dark-squared pressure persists.'],
        ['Nxe5'], ['Nxe5'], ['Nc3'], ['O-O'], ['O-O'], ['Re8'],
      ] },
    { id: 'alekhine-e4', name: 'Alekhine 4.e4', group: 'adler',
      idea: 'White grabs the centre with 4.e4. Take on e5 at once and harass the big pawns with …Bb4+ and …d6.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['e5'], ['dxe5'], ['Ng4'],
        ['e4', '4.e4 — the Alekhine line, a broad centre.'], ['Nxe5'],
        ['Nf3'], ['Nbc6', '5…Nbc6 — develop the second knight.'],
        ['Be2'], ['Bb4+'], ['Nc3'], ['Bxc3+'], ['bxc3'], ['d6'],
      ] },

    // ---------------- FAJAROWICZ 3…Ne4 ----------------
    { id: 'fajarowicz', name: 'Fajarowicz (3…Ne4)', group: 'fajaro',
      idea: 'The bold cousin: the knight leaps to e4. Quick development with …Bc5 and …Nc6 sets nasty tricks against an unprepared White.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['e5'], ['dxe5'], ['Ne4', '3…Ne4!? — the Fajarowicz, daring and tricky.'],
        ['Nf3'], ['Bc5', '4…Bc5 — eye f2 and develop fast.'],
        ['e3'], ['Nc6'], ['Be2'], ['d6', '6…d6 — strike back at e5 before White consolidates.'],
        ['exd6'], ['Bxd6'],
      ] },

    // ---------------- DECLINED ----------------
    { id: 'declined-d5', name: 'Declined 3.d5', group: 'decl',
      idea: 'White locks the centre with 3.d5 instead of taking. Treat it like a Czech Benoni in reverse: clamp with …Bc5 and …d6.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['e5'], ['d5', '3.d5 — White declines and grabs space.'], ['Bc5'],
        ['Nc3'], ['d6'], ['e4'], ['O-O'], ['Nf3'], ['Ng4', '6…Ng4 — provoke a weakening or trade dark-squared bishops.'],
      ] },
    { id: 'declined-nf3', name: 'Declined 3.Nf3', group: 'decl',
      idea: 'White holds the centre with 3.Nf3. Push …e4 to gain space and chase the knight; Black gets a pleasant game.',
      moves: [
        ['d4'], ['Nf6'], ['c4'], ['e5'], ['Nf3'], ['e4', '3…e4 — gain space and kick the knight.'],
        ['Nfd2'], ['Nc6'], ['Nc3'], ['Bb4'], ['a3'], ['Bxc3'], ['bxc3'], ['d6'],
      ] },
  ],
};
