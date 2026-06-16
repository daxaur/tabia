// tabia — the coach. Speaks before/after moves. Messages are user-configurable
// and stored in the browser; these are just the defaults.
import { Store } from './store.js?v=38';

export const DEFAULT_MESSAGES = {
  start:    ['Let\'s drill. Play the repertoire move.', 'Board\'s set. Show me the line.', 'Warm up those reflexes — your move.'],
  correct:  ['Clean.', 'That\'s the one.', 'Exactly right.', 'Booked.', 'Crisp move.'],
  wrong:    ['Not quite — look again.', 'That\'s off-book. The move was {exp}.', 'Close, but {exp} is the line.', 'Reset and feel it: {exp}.'],
  done:     ['Line complete. Filed away.', 'Whole line, clean. Nice.', 'Done — that one\'s in the muscle now.'],
  doneMiss: ['Logged — we\'ll see this one again soon.', 'A slip in there; it comes back sooner.', 'Not clean, but you\'ll get it next pass.'],
  learn:    ['Watch how it flows.', 'Here\'s the idea — follow the plan.', 'Study the shape, then you\'ll drill it.'],
  offBook:  ['That leaves your prep — {exp} keeps you in the lines.', 'Off your repertoire here. The move is {exp}.', 'Not in your book — play {exp}.'],
};

export const MSG_FIELDS = [
  { key: 'start',   label: 'Session start' },
  { key: 'correct', label: 'Correct move' },
  { key: 'wrong',   label: 'Wrong move ({exp} = right move)' },
  { key: 'done',    label: 'Line finished clean' },
  { key: 'doneMiss',label: 'Line finished with a slip' },
  { key: 'offBook', label: 'Off-book in Hyper ({exp} = right move)' },
];

export function messagesFor(key) {
  const custom = Store.prefs().messages || {};
  const list = (custom[key] && custom[key].length) ? custom[key] : DEFAULT_MESSAGES[key];
  return list && list.length ? list : DEFAULT_MESSAGES[key] || [''];
}
export function coachSay(key, vars = {}, lineMsgs = null) {
  const list = (lineMsgs && lineMsgs[key] && lineMsgs[key].length) ? lineMsgs[key] : messagesFor(key);
  let m = list[Math.floor(Math.random() * list.length)] || '';
  return m.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
export function saveMessages(key, text) {
  const p = Store.prefs();
  p.messages ||= {};
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  if (lines.length) p.messages[key] = lines; else delete p.messages[key];
  Store.setPref('messages', p.messages);
}
