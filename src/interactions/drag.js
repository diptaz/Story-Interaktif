// "Geser mengikuti jalur": seret pegangan bundar sepanjang garis putus-putus.
// path: [[x%, y%], ...] relatif layar. Progres hanya maju kalau dekat jalur.
import gsap from 'gsap';
import { audio } from '../core/audio.js';
import { createShell, ringButton } from './shared.js';

function project(points, px, py) {
  let best = { dist: Infinity, t: 0, x: 0, y: 0 };
  let acc = 0;
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  for (let i = 0; i < lengths.length; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const len = lengths[i] || 1;
    const u = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / (len * len)));
    const x = ax + (bx - ax) * u;
    const y = ay + (by - ay) * u;
    const dist = Math.hypot(px - x, py - y);
    if (dist < best.dist) best = { dist, t: (acc + len * u) / total, x, y };
    acc += len;
  }
  return best;
}

export function drag(config, { painter }) {
  const shell = createShell('ix-drag');
  const { root } = shell;
  const pathPct = config.path ?? [[20, 70], [40, 60], [60, 66], [80, 55]];
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add('drag-svg');
  svg.setAttribute('aria-hidden', 'true');
  const guide = document.createElementNS(svgNS, 'polyline');
  guide.classList.add('drag-guide');
  const trail = document.createElementNS(svgNS, 'polyline');
  trail.classList.add('drag-trail');
  svg.append(guide, trail);
  const handle = ringButton(config.label ?? 'geser di sini', { icon: config.icon ?? '✂' });
  handle.classList.add('drag-handle');
  root.append(svg, handle);

  let pts = [];
  let progress = 0;
  let dragging = false;
  let done = false;

  function layout() {
    pts = pathPct.map(([x, y]) => [(x / 100) * innerWidth, (y / 100) * innerHeight]);
    svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    guide.setAttribute('points', pts.map((p) => p.join(',')).join(' '));
    place(progress);
  }

  function pointAt(t) {
    const lengths = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let target = t * lengths.reduce((a, b) => a + b, 0);
    const walked = [pts[0]];
    for (let i = 0; i < lengths.length; i++) {
      if (target <= lengths[i]) {
        const u = lengths[i] ? target / lengths[i] : 0;
        const p = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
        walked.push(p);
        return { p, walked };
      }
      target -= lengths[i];
      walked.push(pts[i + 1]);
    }
    return { p: pts.at(-1), walked };
  }

  function place(t) {
    const { p, walked } = pointAt(t);
    gsap.set(handle, { x: p[0], y: p[1], xPercent: -50, yPercent: -50 });
    trail.setAttribute('points', walked.map((q) => q.join(',')).join(' '));
  }

  const tolerance = () => Math.max(60, innerWidth * 0.06);
  handle.addEventListener('pointerdown', (e) => {
    if (done) return;
    dragging = true;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      /* event sintetis (tes otomatis) tidak punya pointer aktif */
    }
    handle.classList.add('is-pressed');
  });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const hit = project(pts, e.clientX, e.clientY);
    if (hit.dist > tolerance() || hit.t < progress || hit.t > progress + 0.2) return;
    progress = hit.t;
    place(progress);
    painter.setProgress(progress);
    if (Math.random() < 0.15) audio.sfx('hover');
    if (progress > 0.98) complete();
  });
  const release = () => {
    dragging = false;
    handle.classList.remove('is-pressed');
  };
  handle.addEventListener('pointerup', release);
  handle.addEventListener('pointercancel', release);

  function complete() {
    if (done) return;
    done = true;
    release();
    audio.sfx('success');
    gsap.to(handle, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.in(2)' });
    gsap.to(svg, { opacity: 0, duration: 0.6, delay: 0.2 });
    shell.resolve({});
  }

  layout();
  addEventListener('resize', layout);
  gsap.from(svg, { opacity: 0, duration: 0.8 });
  shell.onDestroy(() => {
    removeEventListener('resize', layout);
    handle.kill();
    if (!done) painter.setProgress(0);
  });
  return { ...shell, skip: () => ((progress = 1), place(1), complete()) };
}
