// UI tetap: logo kiri atas, tombol menu kanan atas, tombol musik kiri bawah.
// Logo resmi: taruh file (disarankan PNG/SVG putih) lalu isi story.meta.brand.logo.
import { store } from '../core/store.js';
import { audio } from '../core/audio.js';
import { el, esc } from '../core/text-fx.js';

export function createChrome(root, story, { onMenu, onHome }) {
  const { brand = {} } = story.meta;

  const header = el('header', 'chrome-header');
  header.innerHTML = `
    <a class="brand" href="#campus-tour" aria-label="Kembali ke halaman Beasiswa BCA" title="Kembali ke halaman Beasiswa BCA">
      ${
        brand.logo
          ? `<img class="brand-logo" src="${esc(brand.logo)}" alt="" />`
          : `<span class="brand-wordmark">${esc(brand.wordmark ?? 'LOGO')}</span>`
      }
      <span class="brand-divider" aria-hidden="true"></span>
      <span class="brand-title"><b>${esc(brand.title ?? '')}</b><small>${esc(brand.subtitle ?? '')}</small></span>
    </a>
    <button class="glass-btn menu-btn" type="button" aria-label="Buka menu">
      <span class="menu-icon" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="menu-text">Menu</span>
    </button>`;
  header.querySelector('.brand').addEventListener('click', (e) => {
    e.preventDefault();
    onHome?.();
  });
  // logo gagal dimuat -> kembali ke wordmark teks
  header.querySelector('.brand-logo')?.addEventListener('error', (e) => {
    e.target.replaceWith(Object.assign(el('span', 'brand-wordmark'), { textContent: brand.wordmark ?? 'LOGO' }));
  });

  const menuBtn = header.querySelector('.menu-btn');
  menuBtn.addEventListener('click', () => {
    audio.sfx('click');
    onMenu();
  });
  store.on('menuOpen', (open) => {
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    menuBtn.querySelector('.menu-text').textContent = open ? 'Tutup' : 'Menu';
  });

  const sound = el('button', 'glass-btn sound-btn');
  sound.type = 'button';
  sound.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path class="wave" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="mute-line" d="M16 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  const syncSound = (on) => {
    sound.classList.toggle('is-muted', !on);
    sound.setAttribute('aria-label', on ? 'Matikan suara' : 'Nyalakan suara');
  };
  syncSound(store.state.sound);
  store.on('sound', syncSound);
  sound.addEventListener('click', () => {
    store.set({ sound: !store.state.sound });
    audio.sfx('click');
  });

  root.append(header, sound);

  return {
    showMenuButton(visible) {
      menuBtn.classList.toggle('is-hidden', !visible);
    },
  };
}
