// "Tahan untuk ..." : tekan & tahan tombol bundar (atau Spasi).
// Progres naik saat ditahan, turun pelan saat dilepas. Lukisan zoom/scrub video.
import gsap from 'gsap';
import { audio } from '../core/audio.js';
import { createShell, ringButton, segmentBar } from './shared.js';

export function hold(config, { painter }) {
  const duration = config.duration ?? 2.6;
  const shell = createShell('ix-hold');
  const { root } = shell;
  const btn = ringButton(config.label ?? 'tahan untuk lanjut', { icon: config.icon ?? '✋' });
  const bar = segmentBar(config.segments ?? 12);
  root.append(btn, bar);

  let pressed = false;
  let progress = 0;
  let last = 0;
  let done = false;
  let raf = 0;

  function loop(ts) {
    const dt = last ? (ts - last) / 1000 : 0;
    last = ts;
    progress += pressed ? dt / duration : -dt * 0.35;
    progress = Math.min(Math.max(progress, 0), 1);
    bar.set(progress);
    painter.setProgress(progress);
    if (progress >= 1 && !done) {
      done = true;
      pressed = false;
      audio.sfx('success');
      gsap.to(btn, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.in(2)' });
      gsap.to(bar, { opacity: 0, duration: 0.4, delay: 0.3 });
      shell.resolve({});
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  const down = (e) => {
    e.preventDefault();
    if (done) return;
    pressed = true;
    btn.classList.add('is-pressed');
  };
  const up = () => {
    pressed = false;
    btn.classList.remove('is-pressed');
  };
  btn.addEventListener('pointerdown', down);
  addEventListener('pointerup', up);
  addEventListener('pointercancel', up);
  const keyDown = (e) => e.code === 'Space' && !e.repeat && down(e);
  const keyUp = (e) => e.code === 'Space' && up();
  addEventListener('keydown', keyDown);
  addEventListener('keyup', keyUp);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());

  raf = requestAnimationFrame(loop);
  gsap.from(btn, { scale: 0.4, opacity: 0, duration: 0.8, ease: 'back.out(1.8)' });
  shell.onDestroy(() => {
    cancelAnimationFrame(raf);
    btn.kill();
    removeEventListener('pointerup', up);
    removeEventListener('pointercancel', up);
    removeEventListener('keydown', keyDown);
    removeEventListener('keyup', keyUp);
    if (!done) painter.setProgress(0);
  });

  return { ...shell, skip: () => ((progress = 1), (pressed = true)) };
}
