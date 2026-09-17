// Carousel kartu bawah: panah kiri/kanan, swipe, keyboard.
// Tiap item boleh ganti lukisan latar (item.media).
// Selesai (done) setelah `unlockAfter` item dilihat, tapi tetap bisa dipakai.
import gsap from 'gsap';
import { audio } from '../core/audio.js';
import { esc } from '../core/text-fx.js';
import { createShell } from './shared.js';

const pad = (n) => String(n).padStart(2, '0');

export function carousel(config, { painter, notif }) {
  const items = config.items ?? [];
  const shell = createShell('ix-carousel');
  const { root } = shell;
  root.innerHTML = `
    <div class="carousel-card">
      <span class="carousel-strip" aria-hidden="true"></span>
      <div class="carousel-body" aria-live="polite">
        <small class="carousel-count"></small>
        <h3 class="carousel-title"></h3>
        <p class="carousel-text"></p>
        <p class="carousel-note"></p>
      </div>
      <span class="carousel-strip" aria-hidden="true"></span>
      <button type="button" class="chev chev--prev" aria-label="Sebelumnya">‹</button>
      <button type="button" class="chev chev--next" aria-label="Berikutnya">›</button>
    </div>`;
  const body = root.querySelector('.carousel-body');
  const q = (s) => root.querySelector(s);
  const seen = new Set();
  const unlockAfter = Math.min(config.unlockAfter ?? items.length, items.length);
  let index = 0;
  let busy = false;

  function fill(i) {
    const it = items[i];
    q('.carousel-count').innerHTML = `<b>${pad(i + 1)}</b><small>dari ${pad(items.length)}</small>`;
    q('.carousel-title').textContent = it.title ?? '';
    q('.carousel-text').textContent = it.text ?? '';
    q('.carousel-note').innerHTML = it.note ? esc(it.note) : '';
    q('.chev--prev').disabled = !config.loop && i === 0;
    q('.chev--next').disabled = !config.loop && i === items.length - 1;
  }

  function visit(i) {
    const it = items[i];
    seen.add(i);
    if (it.media) painter.show(it.media, { duration: 1.1, view: it.view });
    else if (it.view) painter.lookAt(it.view, { duration: 1.2 });
    if (it.claim) notif.claim(it.claim);
    if (seen.size >= unlockAfter) shell.resolve({ seen: [...seen] });
  }

  async function go(dir) {
    if (busy) return;
    let next = index + dir;
    if (config.loop) next = (next + items.length) % items.length;
    if (next < 0 || next >= items.length) return;
    busy = true;
    audio.sfx('click');
    await gsap.to(body, { x: -40 * dir, opacity: 0, duration: 0.22, ease: 'power2.in' });
    index = next;
    fill(index);
    visit(index);
    await gsap.fromTo(body, { x: 40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
    busy = false;
  }

  q('.chev--prev').addEventListener('click', () => go(-1));
  q('.chev--next').addEventListener('click', () => go(1));

  let startX = null;
  root.addEventListener('pointerdown', (e) => (startX = e.clientX));
  root.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  });
  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };
  addEventListener('keydown', onKey);
  shell.onDestroy(() => removeEventListener('keydown', onKey));

  fill(0);
  visit(0);
  gsap.from(q('.carousel-card'), { yPercent: 120, rotation: 4, duration: 0.9, ease: 'power3.out' });

  return { ...shell, skip: () => shell.resolve({ seen: [...seen] }) };
}
