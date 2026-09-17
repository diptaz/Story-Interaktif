// Layar loading: pita film bergerak + tulisan "loading" besar + persen.
// Memuat font dan semua gambar yang disebut di story.js.
import gsap from 'gsap';
import { el } from '../core/text-fx.js';

function collectImages(obj, out = new Set()) {
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && ['image', 'src', 'poster'].includes(k) && /\.(jpe?g|png|webp|avif)$/i.test(v)) out.add(v);
    else if (typeof v === 'object') collectImages(v, out);
  }
  return out;
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

export async function runLoader(root, story, painter) {
  const view = el('div', 'loader');
  view.innerHTML = `
    <div class="loader-dots" aria-hidden="true"></div>
    <div class="loader-word" role="status">
      <span>${story.meta.loadingLabel ?? 'memuat'}</span>
      <div class="loader-bar" aria-hidden="true"><i></i></div>
      <small class="loader-pct">0%</small>
    </div>
    <div class="loader-waves" aria-hidden="true"><i></i><i></i></div>`;
  root.append(view);
  const pct = view.querySelector('.loader-pct');
  const bar = view.querySelector('.loader-bar i');

  const tasks = [document.fonts?.ready ?? Promise.resolve(), ...[...collectImages(story)].map(preloadImage), painter.load(story.intro.gate.media ?? {})];
  let done = 0;
  const started = performance.now();
  await Promise.all(
    tasks.map((t) =>
      Promise.resolve(t).finally(() => {
        done += 1;
        const p = done / tasks.length;
        pct.textContent = `${Math.round(p * 100)}%`;
        gsap.to(bar, { scaleX: p, duration: 0.4, ease: 'power2.out' });
      }),
    ),
  );
  const minTime = 1400 - (performance.now() - started);
  if (minTime > 0) await new Promise((r) => setTimeout(r, minTime));

  await gsap
    .timeline()
    .to(view.querySelector('.loader-word'), { yPercent: -30, opacity: 0, duration: 0.5, ease: 'power2.in' })
    .to(view.querySelector('.loader-waves'), { yPercent: -400, duration: 0.8, ease: 'power3.in' }, 0.1)
    .to(view, { opacity: 0, duration: 0.5 }, 0.45);
  view.remove();
}
