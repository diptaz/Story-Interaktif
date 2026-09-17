// Mini-game "war": tekan tombol / Spasi secepatnya, lawan bar rival.
// Menang/kalah disimpan ke flag -> step berikutnya bercabang lewat `when`.
import gsap from 'gsap';
import { store } from '../core/store.js';
import { audio } from '../core/audio.js';
import { el, esc } from '../core/text-fx.js';
import { createShell, ringButton } from './shared.js';

export function race(config, { notif }) {
  const target = config.target ?? 28; // jumlah tap untuk finish
  const rivalRate = config.rivalRate ?? 5.2; // tap per detik rival
  const timeLimit = config.timeLimit ?? 8; // detik
  const shell = createShell('ix-race');
  const { root } = shell;
  root.innerHTML = `
    <p class="race-prompt">${esc(config.prompt ?? 'Siap-siap!')}</p>
    <div class="race-tracks">
      <div class="race-track race-track--you"><span class="race-name">${esc(config.youLabel ?? 'Kamu')}</span><span class="race-fill"></span></div>
      <div class="race-track race-track--rival"><span class="race-name">${esc(config.rivalLabel ?? 'Rival')}</span><span class="race-fill"></span></div>
    </div>
    <div class="race-count" aria-live="assertive"></div>`;
  const tap = ringButton(config.tapLabel ?? 'tap tap tap tap', { icon: config.icon ?? '🍽' });
  tap.disabled = true;
  root.append(tap);
  const fillYou = root.querySelector('.race-track--you .race-fill');
  const fillRival = root.querySelector('.race-track--rival .race-fill');
  const count = root.querySelector('.race-count');

  let taps = 0;
  let rival = 0;
  let running = false;
  let finished = false;
  let last = 0;
  let elapsed = 0;

  const render = () => {
    gsap.set(fillYou, { scaleX: Math.min(taps / target, 1) });
    gsap.set(fillRival, { scaleX: Math.min(rival / target, 1) });
  };

  function hit(e) {
    e?.preventDefault?.();
    if (!running) return;
    taps += 1;
    audio.sfx('hover');
    gsap.fromTo(tap.querySelector('.ring-inner'), { scale: 0.9 }, { scale: 1, duration: 0.25, ease: 'back.out(3)', overwrite: true });
    render();
    if (taps >= target) finish(true);
  }

  function loop(ts) {
    if (!running) return;
    const dt = last ? (ts - last) / 1000 : 0;
    last = ts;
    elapsed += dt;
    rival += dt * rivalRate * (0.75 + Math.random() * 0.5);
    render();
    if (rival >= target) return finish(false);
    if (elapsed >= timeLimit) return finish(taps > rival);
    requestAnimationFrame(loop);
  }

  async function finish(win) {
    if (finished) return;
    finished = true;
    running = false;
    tap.disabled = true;
    const out = win ? config.win : config.lose;
    if (config.flag && out?.value !== undefined) store.setFlag(config.flag, out.value);
    count.textContent = win ? (config.winLabel ?? 'MENANG!') : (config.loseLabel ?? 'KALAH!');
    audio.sfx(win ? 'success' : 'whoosh');
    await gsap.fromTo(count, { scale: 2, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: -3, duration: 0.5, ease: 'back.out(2)' });
    for (const item of out?.claims ?? []) notif.claim(item);
    await new Promise((r) => setTimeout(r, 900));
    shell.resolve({ win, value: out?.value });
  }

  async function countdown() {
    for (const n of ['3', '2', '1', config.goLabel ?? 'WAR!']) {
      if (finished) return;
      count.textContent = n;
      audio.sfx('click');
      await gsap.fromTo(count, { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' });
      await new Promise((r) => setTimeout(r, 380));
    }
    if (finished) return;
    gsap.to(count, { opacity: 0, duration: 0.3 });
    running = true;
    tap.disabled = false;
    tap.focus({ preventScroll: true });
    requestAnimationFrame(loop);
  }

  tap.addEventListener('pointerdown', hit);
  const onKey = (e) => {
    if (e.code === 'Space' && !e.repeat) hit(e);
  };
  addEventListener('keydown', onKey);
  shell.onDestroy(() => {
    running = false;
    tap.kill();
    removeEventListener('keydown', onKey);
  });

  gsap.from(root.querySelectorAll('.race-prompt, .race-track, .ring-btn'), { opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: 'power3.out' });
  setTimeout(countdown, config.startDelay ?? 900);

  return { ...shell, skip: () => finish(false) };
}
