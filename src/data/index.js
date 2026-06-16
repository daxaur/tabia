// Opening library. Each opening is a "folder"; its lines are the branches.
// Add a new opening by importing its module and pushing it here.
import { repertoire as bdg } from './bdg.js?v=14';
import { repertoire as jobava } from './jobava.js?v=14';
import { repertoire as budapest } from './budapest.js?v=14';
import { repertoire as qg } from './queensgambit.js?v=14';
import { repertoire as ruylopez } from './ruylopez.js?v=14';
import { repertoire as italian } from './italian.js?v=14';
import { repertoire as sicilian } from './sicilian.js?v=14';
import { repertoire as french } from './french.js?v=14';
import { repertoire as carokann } from './carokann.js?v=14';

export const openings = [qg, ruylopez, italian, sicilian, french, carokann, bdg, jobava, budapest];

// fallback labels for openings that don't carry their own group metadata
export const groupMeta = {
  accepted: { label: 'Accepted', blurb: 'Black takes the pawn' },
  ryder:    { label: 'Ryder',    blurb: 'The double-pawn gambit' },
  declined: { label: 'Declined', blurb: 'Black gives the pawn back' },
};

export function openingById(id) { return openings.find(o => o.id === id); }
export function groupsOf(op) {
  const seen = [];
  for (const l of op.lines) if (!seen.includes(l.group)) seen.push(l.group);
  const meta = op.groups || groupMeta;
  return seen.map(g => ({ key: g, ...(meta[g] || groupMeta[g] || { label: g, blurb: '' }), lines: op.lines.filter(l => l.group === g) }));
}
// the signature position to show on an opening's preview board (a few plies in)
export function previewFen(op, plies = 7) {
  return { moves: (op.lines.find(l => l.star) || op.lines[0]).moves.slice(0, plies).map(m => m[0]) };
}
