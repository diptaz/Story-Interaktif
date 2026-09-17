// Pilihan bercabang (mis. PPTI atau PPBP). Menyimpan flag ke store supaya
// step berikutnya bisa pakai `when: { flag, equals }`.
// option.claims -> item yang langsung di-claim saat opsi dipilih.
import gsap from 'gsap';
import { store } from '../core/store.js';
import { audio } from '../core/audio.js';
import { el, esc } from '../core/text-fx.js';
import { createShell } from './shared.js';

export function choice(config, { notif }) {
  const shell = createShell('ix-choice');
  const { root } = shell;
  root.innerHTML = `<p class="choice-prompt">${esc(config.prompt ?? 'Pilih salah satu')}</p><div class="choice-row"></div>`;
  const row = root.querySelector('.choice-row');
  let picked = false;

  const cards = (config.options ?? []).map((opt, i) => {
    const card = el('button', 'choice-card');
    card.type = 'button';
    card.style.setProperty('--tilt', `${i % 2 ? 2.5 : -2.5}deg`);
    if (opt.color) card.style.setProperty('--card-bg', opt.color);
    card.innerHTML = `
      <span class="choice-inner">
        ${opt.icon ? `<span class="choice-icon" aria-hidden="true">${esc(opt.icon)}</span>` : ''}
        <span class="choice-label">${esc(opt.label)}</span>
        ${opt.sub ? `<span class="choice-sub">${esc(opt.sub)}</span>` : ''}
      </span>`;
    card.addEventListener('click', () => pick(opt, card));
    row.append(card);
    return card;
  });

  gsap.from(root.querySelector('.choice-prompt'), { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' });
  gsap.from(cards, { yPercent: 80, opacity: 0, rotation: (i) => (i % 2 ? 10 : -10), duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.15 });

  async function pick(opt, card) {
    if (picked) return;
    picked = true;
    audio.sfx('click');
    if (config.flag) store.setFlag(config.flag, opt.value);
    const others = cards.filter((c) => c !== card);
    card.classList.add('is-picked');
    gsap.to(others, { yPercent: 140, rotation: 14, opacity: 0, duration: 0.6, ease: 'power2.in' });
    await gsap.to(card, { scale: 1.08, rotation: 0, duration: 0.6, ease: 'back.out(1.6)' });
    for (const item of opt.claims ?? []) notif.claim(item);
    shell.resolve({ value: opt.value });
  }

  return { ...shell, skip: () => config.options?.[0] && pick(config.options[0], cards[0]) };
}
