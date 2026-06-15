import { Chess } from '../src/vendor/chess.js';
import { openings } from '../src/data/index.js';
let bad = 0, total = 0;
for (const op of openings) {
  console.log(`\n## ${op.name} (${op.id}) — plays ${op.color === 'w' ? 'White' : 'Black'}`);
  for (const line of op.lines) {
    total++;
    const c = new Chess(); let ok = true, err = '';
    for (const [san] of line.moves) {
      try { if (!c.move(san)) { ok = false; err = san; break; } }
      catch (e) { ok = false; err = san + ' (' + e.message + ')'; break; }
    }
    console.log((ok ? 'PASS' : 'FAIL@' + err).padEnd(34), line.id, '·', line.moves.length + ' plies');
    if (!ok) bad++;
  }
}
console.log(bad ? `\n${bad}/${total} LINE(S) FAILED` : `\nALL ${total} LINES LEGAL ✓`);
process.exit(bad ? 1 : 0);
