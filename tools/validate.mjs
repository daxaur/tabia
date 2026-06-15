import { Chess } from '../src/vendor/chess.js';
import { repertoire } from '../src/data/bdg.js';
let bad=0;
for(const line of repertoire.lines){
  const c=new Chess(); let ok=true, err='';
  for(const [san] of line.moves){
    try{ if(!c.move(san)){ok=false;err=san;break;} }catch(e){ ok=false; err=san+' ('+e.message+')'; break; }
  }
  console.log((ok?'PASS':'FAIL@'+err).padEnd(36), line.id, '·', line.moves.length+' plies');
  if(!ok) bad++;
}
console.log(bad? `\n${bad} LINE(S) FAILED`: `\nALL ${repertoire.lines.length} LINES LEGAL ✓`);
process.exit(bad?1:0);
