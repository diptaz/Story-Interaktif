// Menu overlay: kartu chapter bertumpuk (miring, bisa diangkat saat hover),
// chapter terkunci diberi stiker "terkunci", plus koleksi item yang di-claim.
import gsap from 'gsap';
import { store } from '../core/store.js';
import { audio } from '../core/audio.js';
import { el, esc } from '../core/text-fx.js';

export function createMenu(root, story, { onSelect }) {
  const overlay = el('div', 'menu-overlay');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Daftar chapter');
  overlay.hidden = true;
  overlay.innerHTML = `<div class="menu-stack"></div><div class="menu-claims" aria-live="polite"></div>`;
  root.append(overlay);
  const stack = overlay.querySelector('.menu-stack');
  const claimsEl = overlay.querySelector('.menu-claims');

  function build() {
    const n = story.chapters.length;
    const currentIndex = store.state.route?.startsWith('chapter-') ? Number(store.state.route.split('-')[1]) - 1 : -1;
    stack.innerHTML = '';
    story.chapters.forEach((ch, i) => {
      const locked = i >= store.state.unlocked;
      // slot = posisi tumpukan (CSS), card = dianimasikan GSAP, inner = efek hover (CSS)
      const slot = el('div', 'menu-slot');
      slot.style.setProperty('--y', `${(i - (n - 1) / 2) * 62}%`);
      slot.style.setProperty('--r', `${i % 2 ? -3 : 2}deg`);
      slot.style.zIndex = String(n - i);
      const card = el('button', 'menu-card');
      card.type = 'button';
      card.disabled = locked;
      card.classList.toggle('is-locked', locked);
      card.classList.toggle('is-current', i === currentIndex);
      card.style.setProperty('--card-a', ch.theme?.card ?? '#0060af');
      card.style.setProperty('--card-b', ch.theme?.card2 ?? '#1ba0e2');
      card.setAttribute('aria-label', `${ch.label} — ${ch.title.replace(/\n/g, ' ')}${locked ? ' — terkunci' : ''}`);
      const done = store.state.completed.includes(i);
      // kartu chapter bergaya kartu bank: chip, label, judul, nomor
      card.innerHTML = `
        <span class="menu-card-inner">
          <span class="menu-card-waves" aria-hidden="true"></span>
          <span class="menu-card-top">
            <span class="menu-card-chip" aria-hidden="true"></span>
            ${locked ? `<span class="badge badge--locked" aria-hidden="true">🔒 Terkunci</span>` : done ? `<span class="badge badge--done" aria-hidden="true">✓ Selesai</span>` : ''}
          </span>
          <span class="menu-card-label">${esc(ch.label)}</span>
          <span class="menu-card-title">${esc(ch.title)}</span>
          <span class="menu-card-number" aria-hidden="true">•••• •••• 2026 ${String(i + 1).padStart(2, '0')}</span>
        </span>`;
      card.addEventListener('click', () => {
        audio.sfx('click');
        close().then(() => onSelect(i));
      });
      slot.append(card);
      stack.append(slot);
    });

    const claims = store.state.claims;
    claimsEl.innerHTML = claims.length
      ? `<span class="menu-claims-title">Dompet benefit</span>${claims.map((c) => `<span class="claim-chip" title="${esc(c.label)}"><i>${esc(c.icon ?? '★')}</i>${esc(c.label)}</span>`).join('')}`
      : '';
  }

  let tl = null;
  function open() {
    build();
    overlay.hidden = false;
    store.set({ menuOpen: true });
    audio.sfx('whoosh');
    tl?.kill();
    tl = gsap.timeline();
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35 })
      .fromTo(
        stack.querySelectorAll('.menu-card'),
        { yPercent: -160, rotation: (i) => (i % 2 ? 8 : -8), opacity: 0 },
        { yPercent: 0, rotation: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
        0.05,
      )
      .fromTo(claimsEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 0.4);
    stack.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
  }

  function close() {
    if (overlay.hidden) return Promise.resolve();
    store.set({ menuOpen: false });
    tl?.kill();
    return new Promise((resolve) => {
      tl = gsap.timeline({ onComplete: () => ((overlay.hidden = true), resolve()) });
      tl.to(stack.querySelectorAll('.menu-card'), { yPercent: -160, opacity: 0, duration: 0.45, stagger: 0.04, ease: 'power2.in' }).to(overlay, { opacity: 0, duration: 0.25 }, 0.25);
    });
  }

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && store.state.menuOpen) close();
  });

  return { open, close, toggle: () => (store.state.menuOpen ? close() : open()) };
}
