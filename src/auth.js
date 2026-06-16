// tabia — connect a Lichess (OAuth2 PKCE public client) or Chess.com (public API)
// account. No server and no client secret: tokens live only in this browser.
import { Store } from './store.js?v=26';

const LICHESS = 'https://lichess.org';
const CLIENT_ID = 'tabia.openpaw';   // arbitrary id for a PKCE public client

const redirectUri = () => location.origin + location.pathname;
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const sha256 = s => crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
function rand(n = 48) { const a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a.buffer); }

export const Auth = {
  current() { return Store.account(); },
  disconnect() { Store.clearAccount(); },

  // --- Lichess: redirect to the OAuth consent screen ---
  async startLichess() {
    const verifier = rand();
    const challenge = b64url(await sha256(verifier));
    const state = rand(12);
    sessionStorage.setItem('tabia.pkce', JSON.stringify({ verifier, state }));
    const u = new URL(LICHESS + '/oauth');
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('client_id', CLIENT_ID);
    u.searchParams.set('redirect_uri', redirectUri());
    u.searchParams.set('code_challenge_method', 'S256');
    u.searchParams.set('code_challenge', challenge);
    u.searchParams.set('state', state);
    location.href = u.toString();
  },

  // --- called on every load; finishes the Lichess flow if we just came back ---
  async handleRedirect() {
    const q = new URLSearchParams(location.search);
    const code = q.get('code');
    if (!code) return null;
    const state = q.get('state');
    const saved = JSON.parse(sessionStorage.getItem('tabia.pkce') || 'null');
    history.replaceState({}, '', redirectUri());     // scrub ?code= from the URL
    if (!saved || saved.state !== state) return null;
    sessionStorage.removeItem('tabia.pkce');
    try {
      const tok = await fetch(LICHESS + '/api/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code', code, code_verifier: saved.verifier,
          redirect_uri: redirectUri(), client_id: CLIENT_ID,
        }),
      }).then(r => r.json());
      if (!tok.access_token) return null;
      const acc = await fetch(LICHESS + '/api/account', { headers: { Authorization: 'Bearer ' + tok.access_token } }).then(r => r.json());
      const account = {
        site: 'lichess', username: acc.username,
        url: 'https://lichess.org/@/' + acc.username,
        rating: acc.perfs?.blitz?.rating || acc.perfs?.rapid?.rating || acc.perfs?.classical?.rating || null,
        token: tok.access_token,
      };
      Store.setAccount(account);
      return account;
    } catch { return null; }
  },

  // --- Chess.com: no OAuth for third parties, so link by public username ---
  async connectChesscom(username) {
    const u = (username || '').trim().toLowerCase().replace(/^@/, '');
    if (!u) throw new Error('Enter a username');
    const p = await fetch('https://api.chess.com/pub/player/' + encodeURIComponent(u))
      .then(r => r.ok ? r.json() : Promise.reject(new Error('No such Chess.com player')));
    const stats = await fetch('https://api.chess.com/pub/player/' + encodeURIComponent(u) + '/stats')
      .then(r => r.ok ? r.json() : {}).catch(() => ({}));
    const account = {
      site: 'chesscom', username: p.username || u,
      url: p.url || 'https://www.chess.com/member/' + u, avatar: p.avatar || null,
      rating: stats.chess_blitz?.last?.rating || stats.chess_rapid?.last?.rating || stats.chess_bullet?.last?.rating || null,
    };
    Store.setAccount(account);
    return account;
  },
};
