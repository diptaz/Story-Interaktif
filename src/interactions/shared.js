import gsap from 'gsap';
import { arcText, el, esc } from '../core/text-fx.js';

// Tombol bundar dengan huruf melingkar + cincin putus-putus berputar.
export function ringButton(label, { icon = '●', color = 'beige' } = {}) {
  const btn = el('button', `ring-btn color-${color}`);
  btn.type = 'button';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = `
    <span class="ring-outer" aria-hidden="true"></span>
    <span class="ring-inner" aria-hidden="true"><span class="ring-icon">${esc(icon)}</span></span>
    <span class="arc-text" aria-hidden="true">${arcText(label)}</span>`;
  const spin = gsap.to(btn.querySelectorAll('.arc-text, .ring-outer'), { rotation: 360, duration: 24, ease: 'none', repeat: -1 });
  const pulse = gsap.to(btn.querySelector('.ring-inner'), { scale: 1.06, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  btn.kill = () => (spin.kill(), pulse.kill());
  return btn;
}

// Bar progres bersegmen (seperti bar "carve" referensi)
export function segmentBar(segments = 12) {
  const bar = el('div', 'segment-bar');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.innerHTML = Array.from({ length: segments }, () => '<i></i>').join('');
  const cells = [...bar.children];
  bar.set = (p) => {
    const on = Math.round(p * segments);
    cells.forEach((c, i) => c.classList.toggle('on', i < on));
    bar.setAttribute('aria-valuenow', String(Math.round(p * 100)));
  };
  return bar;
}

// Kartu kertas kecil berisi judul + teks (popup hotspot, hasil)
export function paperCard({ kicker = '', title = '', text = '' }, className = '') {
  const card = el('div', `paper-card ${className}`);
  card.innerHTML = `
    ${kicker ? `<small>${esc(kicker)}</small>` : ''}
    ${title ? `<h3>${esc(title)}</h3>` : ''}
    ${text ? `<p>${esc(text)}</p>` : ''}`;
  return card;
}

// Pembungkus standar: { root, done, resolve, destroy(), skip() }
export function createShell(className) {
  const root = el('div', `ix ${className}`);
  let resolve;
  const done = new Promise((r) => (resolve = r));
  const cleanups = [];
  return {
    root,
    done,
    resolve: (value) => resolve(value),
    onDestroy: (fn) => cleanups.push(fn),
    destroy() {
      cleanups.splice(0).forEach((fn) => fn());
      gsap.to(root, { opacity: 0, duration: 0.35, onComplete: () => root.remove() });
    },
  };
}
