// tabia Coach — renders the result as a real, shareable image card on a <canvas>.
// What you see is exactly what downloads / gets posted to X. All client-side.

const VIOLET = '#8b7bff', GOLD = '#f7d64b', INK = '#f4f4f4', DIM = '#8a8a93';
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const SANS = "'Inter', system-ui, sans-serif";

// shrink a font until the text fits `max` px wide; returns the px size used
function fit(ctx, text, weight, start, min, max, family = SANS) {
  let s = start;
  for (; s > min; s--) { ctx.font = `${weight} ${s}px ${family}`; if (ctx.measureText(text).width <= max) break; }
  ctx.font = `${weight} ${s}px ${family}`;
  return s;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function pill(ctx, x, y, label, val) {
  ctx.font = `500 18px ${MONO}`;
  const lw = ctx.measureText(label + ' ').width;
  ctx.font = `700 18px ${MONO}`;
  const vw = ctx.measureText(val).width;
  const w = lw + vw + 36, h = 40;
  roundRect(ctx, x, y, w, h, 20);
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.font = `500 18px ${MONO}`; ctx.fillStyle = DIM; ctx.fillText(label + ' ', x + 18, y + h / 2 + 1);
  ctx.font = `700 18px ${MONO}`; ctx.fillStyle = INK; ctx.fillText(val, x + 18 + lw, y + h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
  return w;
}

// data: { handle, site, styleLabel, styleSub, d1, winRate, avgMoves, n, white, black }
//   white/black: { side:'White'|'Black', label, name } | null
export async function renderShareCard(canvas, data) {
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch {}
  const W = 1200, H = 675, DPR = 2;
  canvas.width = W * DPR; canvas.height = H * DPR;
  canvas.style.aspectRatio = '1200 / 675';
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  // backdrop
  ctx.fillStyle = '#08080a'; ctx.fillRect(0, 0, W, H);
  const g1 = ctx.createRadialGradient(250, 150, 0, 250, 150, 560);
  g1.addColorStop(0, 'rgba(139,123,255,.22)'); g1.addColorStop(1, 'rgba(139,123,255,0)');
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(1000, 640, 0, 1000, 640, 520);
  g2.addColorStop(0, 'rgba(247,214,75,.13)'); g2.addColorStop(1, 'rgba(247,214,75,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

  // faint dot grid
  ctx.fillStyle = 'rgba(255,255,255,.035)';
  for (let y = 40; y < H; y += 26) for (let x = 40; x < W; x += 26) { ctx.beginPath(); ctx.arc(x, y, .9, 0, 6.28); ctx.fill(); }

  // frame
  roundRect(ctx, 22, 22, W - 44, H - 44, 26);
  ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 1.5; ctx.stroke();

  const PAD = 64;
  // header: wordmark + handle
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 30px ${MONO}`; ctx.fillStyle = INK; ctx.fillText('tabia', PAD, 84);
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(PAD + ctx.measureText('tabia').width + 12, 75, 4, 0, 6.28); ctx.fill();
  const siteLabel = data.site === 'lichess' ? 'lichess' : 'chess.com';
  ctx.textAlign = 'right';
  ctx.font = `500 20px ${MONO}`; ctx.fillStyle = INK;
  ctx.fillText('@' + data.handle, W - PAD, 84);
  ctx.font = `400 14px ${MONO}`; ctx.fillStyle = DIM; ctx.fillText(siteLabel, W - PAD, 108);
  ctx.textAlign = 'left';

  // kicker
  ctx.font = `600 14px ${MONO}`; ctx.fillStyle = GOLD;
  ctx.fillText('Y O U R   S T Y L E', PAD, 168);

  // hero verdict: "<Style>  · 1.e4"
  const verdict = `${data.styleLabel}`;
  const vs = fit(ctx, verdict, 800, 78, 40, W - PAD * 2 - 180);
  ctx.font = `800 ${vs}px ${SANS}`; ctx.fillStyle = INK;
  const baseY = 168 + 12 + vs;
  ctx.fillText(verdict, PAD, baseY);
  const vWidth = ctx.measureText(verdict).width;
  ctx.font = `600 ${Math.round(vs * .5)}px ${SANS}`; ctx.fillStyle = VIOLET;
  ctx.fillText(`· 1.${data.d1}`, PAD + vWidth + 20, baseY);

  // sub line
  if (data.styleSub) { ctx.font = `400 19px ${SANS}`; ctx.fillStyle = DIM; ctx.fillText(data.styleSub, PAD, baseY + 34); }

  // stat pills
  let px = PAD; const py = baseY + 56;
  px += pill(ctx, px, py, 'WIN', data.winRate + '%') + 12;
  px += pill(ctx, px, py, 'AVG', data.avgMoves + ' moves') + 12;
  px += pill(ctx, px, py, '', data.n + ' games') + 12;

  // divider
  ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, py + 74); ctx.lineTo(W - PAD, py + 74); ctx.stroke();

  // recommendations
  const recs = [data.white, data.black].filter(Boolean);
  ctx.font = `600 13px ${MONO}`; ctx.fillStyle = DIM;
  ctx.fillText('W H A T   T O   P L A Y', PAD, py + 74 + 34);
  let ry = py + 74 + 64;
  for (const r of recs) {
    ctx.font = `600 15px ${MONO}`; ctx.fillStyle = GOLD;
    ctx.fillText(r.label.toUpperCase(), PAD, ry + 18);
    const ns = fit(ctx, r.name, 700, 34, 22, W - PAD * 2 - 200);
    ctx.font = `700 ${ns}px ${SANS}`; ctx.fillStyle = INK;
    ctx.fillText(r.name, PAD + 190, ry + 22);
    ry += 56;
  }

  // footer
  ctx.font = `400 17px ${MONO}`; ctx.fillStyle = DIM;
  ctx.fillText('daxaur.github.io/tabia', PAD, H - 56);
  ctx.textAlign = 'right'; ctx.fillStyle = INK; ctx.font = `600 17px ${MONO}`;
  ctx.fillText('find your opening  →', W - PAD, H - 56);
  ctx.textAlign = 'left';
  return canvas;
}

// download the rendered canvas as a PNG
export function downloadCard(canvas, name) {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tabia-${name || 'coach'}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

// try the native share sheet with the image file (mobile); resolves false if unavailable
export async function shareCardImage(canvas, text, name) {
  try {
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (!blob) return false;
    const file = new File([blob], `tabia-${name || 'coach'}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text, url: 'https://daxaur.github.io/tabia/' });
      return true;
    }
  } catch {}
  return false;
}
