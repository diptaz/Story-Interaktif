// Notifikasi "CLAIMED" bergaya push notification m-banking:
// kartu putih turun dari kanan atas, ikon item + centang, stempel CLAIMED, konfeti kecil.
// Antrean: kalau beberapa claim sekaligus, muncul bergantian.
import gsap from 'gsap';
import { store } from '../core/store.js';
import { audio } from '../core/audio.js';
import { el, esc, reducedMotion } from '../core/text-fx.js';

const CONFETTI = ['#1ba0e2', '#0060af', '#ffc20e', '#ffffff', '#7fd0f5'];

export function createNotif(root) {
  const holder = el('div', 'notif-holder');
  holder.setAttribute('aria-live', 'assertive');
  root.append(holder);
  let chain = Promise.resolve();

  function confetti(card) {
    if (reducedMotion()) return;
    const icon = card.querySelector('.notif-icon');
    for (let i = 0; i < 14; i++) {
      const bit = el('i', 'confetti');
      bit.style.background = CONFETTI[i % CONFETTI.length];
      icon.append(bit);
      const angle = (i / 14) * Math.PI * 2;
      const dist = 38 + Math.random() * 30;
      gsap.fromTo(
        bit,
        { x: 0, y: 0, scale: 1, rotation: 0 },
        { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0, rotation: 180, duration: 0.9, ease: 'power3.out', onComplete: () => bit.remove() },
      );
    }
  }

  function show(item) {
    return new Promise((resolve) => {
      const card = el('div', 'notif');
      card.innerHTML = `
        <span class="notif-icon" aria-hidden="true">${esc(item.icon ?? '★')}<b class="notif-check">✓</b></span>
        <span class="notif-body">
          <small>${esc(item.kicker ?? 'Benefit diterima')}</small>
          <b>${esc(item.label)}</b>
          ${item.text ? `<span>${esc(item.text)}</span>` : ''}
        </span>
        <span class="stamp" aria-hidden="true">CLAIMED</span>
        <span class="notif-timer" aria-hidden="true"></span>`;
      holder.append(card);
      audio.sfx('success');
      gsap
        .timeline({ onComplete: () => (card.remove(), resolve()) })
        .fromTo(card, { xPercent: 115, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.3)' })
        .fromTo(card.querySelector('.notif-check'), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 0.35)
        .add(() => confetti(card), 0.4)
        .fromTo(card.querySelector('.stamp'), { scale: 2.4, rotation: -30, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.35, ease: 'power4.in' }, 0.5)
        .fromTo(card.querySelector('.notif-timer'), { scaleX: 1 }, { scaleX: 0, duration: 3, ease: 'none' }, 0.6)
        .to(card, { xPercent: 115, opacity: 0, duration: 0.45, ease: 'power2.in' }, 3.6);
    });
  }

  return {
    // Simpan ke koleksi (tanpa duplikat) lalu tampilkan notifikasinya.
    claim(item) {
      store.claim(item);
      chain = chain.then(() => show(item));
      return chain;
    },
  };
}
