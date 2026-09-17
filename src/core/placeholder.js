// Generator "lukisan" sementara (canvas 2D) supaya project langsung jalan tanpa aset.
// Shader di painter.js akan membuatnya terlihat seperti cat minyak.
// Ganti dengan gambar/video asli lewat story.js: media: { image, video, depth }.

function seeded(str) {
  let h = 2166136261;
  for (const c of String(str)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const W = 1600;
const H = 1000;

function canvas() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return [c, c.getContext('2d')];
}

function lg(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}

function blob(ctx, rnd, x, y, r, color, alpha = 0.25) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r * (0.6 + rnd() * 0.8), r * (0.4 + rnd() * 0.5), rnd() * Math.PI, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function landscape(ctx, rnd, [sky, far, near, accent], x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [sky, '#e9dcc0']);
  ctx.fillRect(x, y, w, h);
  for (let layer = 0; layer < 3; layer++) {
    const base = y + h * (0.45 + layer * 0.17);
    ctx.fillStyle = [far, near, accent][layer];
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    for (let i = 0; i <= 12; i++) ctx.lineTo(x + (w * i) / 12, base - rnd() * h * 0.12);
    ctx.lineTo(x + w, y + h);
    ctx.fill();
  }
  // pohon cemara / pohon tinggi
  for (let i = 0; i < 7; i++) {
    const tx = x + rnd() * w;
    const th = h * (0.18 + rnd() * 0.25);
    const ty = y + h * (0.55 + rnd() * 0.2);
    ctx.fillStyle = '#2d3a1f';
    ctx.beginPath();
    ctx.ellipse(tx, ty - th / 2, th * 0.09, th / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

const KINDS = {
  // Interior dengan jendela (mis. gerbong kereta, kamar, studio)
  room(ctx, rnd, p) {
    ctx.fillStyle = lg(ctx, 0, 0, 0, H, [p[0], p[1], p[0]]);
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = p[2];
    ctx.fillRect(0, H * 0.72, W, H * 0.28);
    const wx = W * 0.32, wy = H * 0.3, ww = W * 0.36, wh = H * 0.3;
    ctx.fillStyle = '#3b2a1c';
    ctx.fillRect(wx - 18, wy - 18, ww + 36, wh + 36);
    landscape(ctx, rnd, [p[4] ?? '#b9c7c9', '#8e9a62', '#6f7c3f', '#58652d'], wx, wy, ww, wh);
    ctx.strokeStyle = '#c9b48a';
    ctx.lineWidth = 8;
    ctx.strokeRect(wx, wy, ww, wh);
    // kursi kiri & kanan
    ctx.fillStyle = '#1f2220';
    ctx.fillRect(0, H * 0.5, W * 0.22, H * 0.5);
    ctx.fillRect(W * 0.78, H * 0.52, W * 0.22, H * 0.48);
    // koper + objek utama
    ctx.fillStyle = '#c9a66b';
    ctx.fillRect(W * 0.16, H * 0.66, W * 0.2, H * 0.12);
    ctx.fillStyle = p[3];
    ctx.beginPath();
    ctx.ellipse(W * 0.26, H * 0.63, W * 0.07, H * 0.05, 0, Math.PI, 0);
    ctx.fill();
  },
  // Pemandangan luas
  landscape(ctx, rnd, p) {
    landscape(ctx, rnd, [p[0], p[1], p[2], p[3]], 0, 0, W, H);
  },
  // Meja kerja tampak atas (untuk scene "kerajinan")
  table(ctx, rnd, p) {
    ctx.fillStyle = lg(ctx, 0, 0, W, H, [p[0], p[1]]);
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = p[2];
    ctx.save();
    ctx.translate(W * 0.5, H * 0.55);
    ctx.rotate(-0.08);
    ctx.fillRect(-W * 0.34, -H * 0.3, W * 0.68, H * 0.6);
    ctx.restore();
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = p[3 + (i % 2)] ?? p[3];
      ctx.save();
      ctx.translate(W * (0.2 + rnd() * 0.6), H * (0.25 + rnd() * 0.55));
      ctx.rotate(rnd() * Math.PI);
      if (i % 3 === 0) ctx.fillRect(-120, -8, 240, 16);
      else {
        ctx.beginPath();
        ctx.arc(0, 0, 18 + rnd() * 40, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },
  // Motif kain (untuk carousel kain/pola)
  fabric(ctx, rnd, p) {
    ctx.fillStyle = p[0];
    ctx.fillRect(0, 0, W, H);
    const s = 60 + Math.floor(rnd() * 50);
    for (let y = 0; y < H + s; y += s) {
      for (let x = 0; x < W + s; x += s) {
        ctx.fillStyle = (x / s + y / s) % 2 ? p[1] : p[2];
        ctx.beginPath();
        ctx.moveTo(x, y - s / 2);
        ctx.lineTo(x + s / 2, y);
        ctx.lineTo(x, y + s / 2);
        ctx.lineTo(x - s / 2, y);
        ctx.fill();
        ctx.fillStyle = p[3];
        ctx.beginPath();
        ctx.arc(x, y, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
};

export function makePlaceholder({ kind = 'room', palette, seed = kind } = {}) {
  const rnd = seeded(seed);
  const p = palette ?? ['#6b4a2b', '#8d6a3f', '#4a3321', '#6f8a55', '#c5d0c6'];
  const [c, ctx] = canvas();
  (KINDS[kind] ?? KINDS.room)(ctx, rnd, p);
  // sapuan warna acak supaya ada variasi saat difilter kuas
  for (let i = 0; i < 90; i++) blob(ctx, rnd, rnd() * W, rnd() * H, 30 + rnd() * 140, p[i % p.length], 0.08);
  return c;
}

/* ------------------------------------------------------------------------ */
/* Panorama 360 sementara (equirectangular 2:1).                            */
/* kind: 'indoor' (ruangan) | 'outdoor' (area terbuka, ada monumen di depan) */
/* ------------------------------------------------------------------------ */
export function makePanorama({ kind = 'indoor', palette, seed = kind } = {}) {
  const PW = 2048;
  const PH = 1024;
  const rnd = seeded(seed);
  const c = document.createElement('canvas');
  c.width = PW;
  c.height = PH;
  const ctx = c.getContext('2d');
  const horizon = PH * 0.52;

  if (kind === 'outdoor') {
    const p = palette ?? ['#5fa8e0', '#cfe6f5', '#7e9b6a', '#dfe7ec', '#0060af'];
    ctx.fillStyle = lg(ctx, 0, 0, 0, horizon, [p[0], p[1]]);
    ctx.fillRect(0, 0, PW, horizon);
    ctx.fillStyle = lg(ctx, 0, horizon, 0, PH, [p[2], '#4f6a45']);
    ctx.fillRect(0, horizon, PW, PH - horizon);
    // awan
    for (let i = 0; i < 26; i++) blob(ctx, rnd, rnd() * PW, rnd() * horizon * 0.7, 40 + rnd() * 90, '#ffffff', 0.35);
    // gedung-gedung di sekeliling horizon
    for (let x = 0; x < PW; ) {
      const w = 90 + rnd() * 180;
      const h = 60 + rnd() * 170;
      ctx.fillStyle = rnd() > 0.5 ? p[3] : '#b9c6cf';
      ctx.fillRect(x, horizon - h, w - 12, h);
      ctx.fillStyle = 'rgba(0,60,120,.35)';
      for (let wy = horizon - h + 16; wy < horizon - 14; wy += 26) {
        for (let wx = x + 12; wx < x + w - 30; wx += 26) ctx.fillRect(wx, wy, 12, 14);
      }
      x += w;
    }
    // pepohonan
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = rnd() > 0.5 ? '#3f6b3a' : '#56804a';
      ctx.beginPath();
      ctx.arc(rnd() * PW, horizon + rnd() * 30, 18 + rnd() * 30, 0, Math.PI * 2);
      ctx.fill();
    }
    // jalan setapak + monumen di tengah (yaw 0)
    ctx.fillStyle = '#d9d2c3';
    ctx.beginPath();
    ctx.moveTo(PW * 0.47, horizon + 10);
    ctx.lineTo(PW * 0.53, horizon + 10);
    ctx.lineTo(PW * 0.66, PH);
    ctx.lineTo(PW * 0.34, PH);
    ctx.fill();
    ctx.fillStyle = p[4];
    ctx.fillRect(PW * 0.485, horizon - 230, PW * 0.03, 240);
    ctx.fillStyle = '#f2f2f2';
    ctx.beginPath();
    ctx.moveTo(PW * 0.47, horizon - 230);
    ctx.lineTo(PW * 0.53, horizon - 230);
    ctx.lineTo(PW * 0.5, horizon - 300);
    ctx.fill();
  } else {
    const p = palette ?? ['#e9eef2', '#c9d6df', '#8a6d52', '#0060af', '#1ba0e2'];
    ctx.fillStyle = lg(ctx, 0, 0, 0, PH * 0.3, ['#f7f9fb', p[0]]);
    ctx.fillRect(0, 0, PW, PH * 0.3);
    ctx.fillStyle = lg(ctx, 0, PH * 0.3, 0, PH * 0.66, [p[0], p[1]]);
    ctx.fillRect(0, PH * 0.3, PW, PH * 0.36);
    ctx.fillStyle = lg(ctx, 0, PH * 0.66, 0, PH, [p[2], '#5a4633']);
    ctx.fillRect(0, PH * 0.66, PW, PH * 0.34);
    // lampu plafon
    for (let x = 60; x < PW; x += 170) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fillRect(x, PH * 0.12, 90, 10);
    }
    // 4 dinding: jendela, pintu, papan
    for (let wall = 0; wall < 4; wall++) {
      const x0 = (PW / 4) * wall;
      const type = Math.floor(rnd() * 3);
      if (type === 0) {
        ctx.fillStyle = '#9fcbe8';
        ctx.fillRect(x0 + 90, PH * 0.34, PW / 4 - 180, PH * 0.2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.strokeRect(x0 + 90, PH * 0.34, PW / 4 - 180, PH * 0.2);
      } else if (type === 1) {
        ctx.fillStyle = p[3];
        ctx.fillRect(x0 + PW / 8 - 60, PH * 0.4, 120, PH * 0.26);
        ctx.fillStyle = '#ffd24d';
        ctx.beginPath();
        ctx.arc(x0 + PW / 8 + 40, PH * 0.54, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fdfdfd';
        ctx.fillRect(x0 + 110, PH * 0.36, PW / 4 - 220, PH * 0.16);
        ctx.fillStyle = p[4];
        ctx.fillRect(x0 + 110, PH * 0.36, PW / 4 - 220, 14);
      }
    }
    // perabot di lantai
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 ? p[3] : '#f0f0f0';
      const x = rnd() * PW;
      ctx.fillRect(x, PH * (0.68 + rnd() * 0.12), 60 + rnd() * 110, 26 + rnd() * 30);
    }
  }
  for (let i = 0; i < 70; i++) blob(ctx, rnd, rnd() * PW, rnd() * PH, 20 + rnd() * 90, '#ffffff', 0.05);
  return c;
}

// Depth map palsu: bawah = dekat (terang), tengah atas = jauh (gelap).
export function makeDepth(kind = 'room') {
  const [c, ctx] = canvas();
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, ['#555', '#333', '#fff']);
  ctx.fillRect(0, 0, W, H);
  if (kind === 'room') {
    ctx.fillStyle = '#111';
    ctx.fillRect(W * 0.32, H * 0.3, W * 0.36, H * 0.3);
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, H * 0.5, W * 0.22, H * 0.5);
    ctx.fillRect(W * 0.78, H * 0.52, W * 0.22, H * 0.48);
  }
  return c;
}
