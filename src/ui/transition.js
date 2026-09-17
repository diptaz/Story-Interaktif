// Transisi antar scene: tiga lapis gelombang biru (cyan -> biru -> navy) naik menutupi layar,
// label tujuan muncul di tengah, lalu gelombang lanjut naik membuka scene baru.
import gsap from 'gsap';
import { audio } from '../core/audio.js';
import { el, esc, reducedMotion } from '../core/text-fx.js';

export function createTransition(root) {
  const wrap = el('div', 'wave-wipe');
  wrap.innerHTML = `
    <div class="wave-layer wave-layer--1"></div>
    <div class="wave-layer wave-layer--2"></div>
    <div class="wave-layer wave-layer--3"><div class="wave-label"><small></small><b></b></div></div>`;
  wrap.hidden = true;
  root.append(wrap);
  const layers = [...wrap.querySelectorAll('.wave-layer')];
  const label = wrap.querySelector('.wave-label');

  // opts: { kicker, title, colors: [cyan, biru, navy] }
  return async function wipe(swap, { kicker = '', title = '', colors } = {}) {
    if (reducedMotion()) {
      await swap();
      return;
    }
    if (colors) layers.forEach((l, i) => colors[i] && l.style.setProperty('--wave', colors[i]));
    label.querySelector('small').textContent = kicker;
    label.querySelector('b').innerHTML = esc(title).replace(/\n/g, '<br/>');
    wrap.hidden = false;
    audio.sfx('whoosh');
    gsap.set(layers, { yPercent: 105 });
    gsap.set(label, { opacity: 0, y: 30 });
    await gsap
      .timeline()
      .to(layers, { yPercent: -8, duration: 0.8, stagger: 0.09, ease: 'power3.inOut' })
      .to(label, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 0.55);
    await swap();
    await gsap
      .timeline({ delay: 0.35 })
      .to(label, { opacity: 0, y: -24, duration: 0.3, ease: 'power2.in' })
      .to([...layers].reverse(), { yPercent: -125, duration: 0.85, stagger: 0.08, ease: 'power3.inOut' }, 0.1);
    wrap.hidden = true;
  };
}
