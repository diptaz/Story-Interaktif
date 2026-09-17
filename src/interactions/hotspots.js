// Titik-titik yang bisa diklik (mis. dapur, UKS, musola).
// Di foto 360: posisi pakai { yaw, pitch } (derajat) -> titik menempel di dunia 360 dan ikut
//   bergeser saat kamera diputar. Cari angkanya dengan membuka  ?debug  lalu klik lokasi di foto.
// Di foto biasa: posisi pakai { x, y } (persen layar).
// Selesai setelah semua titik ditemukan (requireAll: false -> cukup satu).
import gsap from 'gsap';
import { audio } from '../core/audio.js';
import { el, esc } from '../core/text-fx.js';
import { createShell, paperCard } from './shared.js';

export function hotspots(config, { painter, notif }) {
  const spots = config.spots ?? [];
  const shell = createShell('ix-hotspots');
  const { root } = shell;
  const found = new Set();
  const need = config.requireAll === false ? 1 : spots.length;

  const counter = el('div', 'hotspot-counter');
  root.append(counter);
  const updateCounter = () =>
    (counter.innerHTML = `<span>${esc(config.prompt ?? 'Temukan semua titik')}</span> <b>${found.size}/${spots.length}</b>`);
  updateCounter();

  let popup = null;
  let popupSpot = null;
  function closePopup() {
    if (!popup) return;
    const p = popup;
    popup = popupSpot = null;
    gsap.to(p, { scale: 0.9, opacity: 0, duration: 0.25, onComplete: () => p.remove() });
  }

  const is360 = (spot) => spot.yaw !== undefined && painter.isPano;
  const place = (node, spot, offsetY = 0) => {
    if (is360(spot)) {
      const pr = painter.project(spot.yaw, spot.pitch ?? 0);
      node.style.left = `${pr.x}px`;
      node.style.top = `${pr.y + offsetY}px`;
      node.classList.toggle('is-offscreen', !pr.visible);
      return pr.visible;
    }
    node.style.left = `${spot.x ?? 50}%`;
    node.style.top = `calc(${spot.y ?? 50}% + ${offsetY}px)`;
    return true;
  };

  const buttons = spots.map((spot, i) => {
    const btn = el('button', 'hotspot');
    btn.type = 'button';
    btn.setAttribute('aria-label', spot.label);
    btn.innerHTML = `<span class="hotspot-dot" aria-hidden="true"></span><span class="hotspot-label">${esc(spot.label)}</span>`;
    gsap.from(btn.children, { scale: 0, opacity: 0, duration: 0.6, delay: 0.3 + i * 0.12, ease: 'back.out(2)' });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.sfx('click');
      closePopup();
      if (is360(spot)) painter.lookAt({ yaw: spot.yaw, pitch: spot.pitch ?? 0 }, { duration: 1.1 });
      if (spot.media) painter.show(spot.media, { duration: 1 });
      popup = paperCard({ kicker: spot.kicker ?? spot.label, title: spot.title, text: spot.text }, 'hotspot-popup');
      popupSpot = spot;
      root.append(popup);
      place(popup, spot, 58);
      gsap.fromTo(popup, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' });
      if (!found.has(i)) {
        found.add(i);
        btn.classList.add('is-found');
        if (spot.claim) notif.claim(spot.claim);
        updateCounter();
        if (found.size >= need) shell.resolve({ found: [...found] });
      }
    });
    root.append(btn);
    return btn;
  });

  // posisi diperbarui tiap frame (kamera 360 bisa berputar)
  const sync = () => {
    buttons.forEach((b, i) => place(b, spots[i]));
    if (popup && popupSpot) place(popup, popupSpot, 58);
  };
  sync();
  shell.onDestroy(painter.onFrame(sync));
  shell.onDestroy(painter.lockAutoRotate());

  // klik area kosong (canvas) menutup popup
  shell.onDestroy(painter.on('tap', closePopup));
  return { ...shell, skip: () => shell.resolve({ found: [...found] }) };
}
