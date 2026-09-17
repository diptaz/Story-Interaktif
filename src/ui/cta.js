// Tombol-tombol dengan glow hover (blur 50px + plus-lighter) seperti referensi.
import { audio } from '../core/audio.js';
import { el, esc } from '../core/text-fx.js';

const CHEVRON = `<svg class="cta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4l9 8-9 8" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// variant: 'pill' (kapsul krem) | 'text' (teks besar + chevron) | 'ghost'
export function cta(label, { variant = 'pill', icon = variant === 'text', onClick, className = '', ariaLabel } = {}) {
  const btn = el('button', `cta cta--${variant} ${className}`);
  btn.type = 'button';
  if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);
  btn.innerHTML = `<span class="cta-label">${esc(label)}${icon ? CHEVRON : ''}</span>`;
  if (onClick) {
    btn.addEventListener('click', (e) => {
      audio.sfx('click');
      onClick(e);
    });
  }
  return btn;
}

// Promise yang selesai saat tombol diklik (untuk alur async di scene)
export function waitClick(btn) {
  return new Promise((resolve) => btn.addEventListener('click', resolve, { once: true }));
}

// SFX hover global untuk semua tombol
export function installHoverSfx() {
  let last = 0;
  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest?.('button, [data-hover-sfx]');
    if (!target || target.disabled || target.contains(e.relatedTarget)) return;
    const now = performance.now();
    if (now - last < 90) return;
    last = now;
    audio.sfx('hover');
  });
}
