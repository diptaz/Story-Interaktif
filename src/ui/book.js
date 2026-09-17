// "Buku" kiri: panel info tambahan yang mengintip dari tepi kiri (miring 4°),
// terbuka dengan animasi geser + putar. Isi bisa di-scroll, ada tumpukan foto
// yang bisa ditukar (klik).
import gsap from 'gsap';
import { store } from '../core/store.js';
import { audio } from '../core/audio.js';
import { el, esc } from '../core/text-fx.js';

function photo(src, caption = '', className = '') {
  const alt = esc(caption);
  const media = src ? `<img src="${esc(src)}" alt="${alt}" loading="lazy" />` : `<span class="photo-fallback">${alt || 'Foto'}</span>`;
  return `<figure class="${className}">${media}${caption ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
}

function renderSection(s) {
  switch (s.type) {
    case 'kicker':
      return `<p class="book-kicker">${esc(s.text)}</p>`;
    case 'title':
      return `<h3 class="book-title">${esc(s.text)}</h3>`;
    case 'caps':
      return `<p class="book-caps">${esc(s.text)}</p>`;
    case 'ornament':
      return `<p class="book-ornament" aria-hidden="true">✳</p>`;
    case 'list':
      return `<ul class="book-list">${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'image':
      return photo(s.src, s.caption, 'book-image');
    case 'photos':
      return `<div class="photo-stack" role="button" tabindex="0" aria-label="Tukar foto">${s.items
        .map((p, i) => `<div class="photo-card" style="--i:${i}">${photo(p.src, p.caption)}</div>`)
        .join('')}</div>`;
    default:
      return `<p class="book-p">${esc(s.text)}</p>`;
  }
}

export function createBook(root) {
  const book = el('aside', 'book is-hidden');
  book.innerHTML = `
    <div class="book-panel">
      <div class="book-frame"><div class="book-scroll" tabindex="0"><div class="book-content"></div></div></div>
      <button class="book-tab" type="button" aria-label="Buka info tambahan"><span aria-hidden="true">+</span></button>
    </div>`;
  root.append(book);
  const panel = book.querySelector('.book-panel');
  const content = book.querySelector('.book-content');
  const scroll = book.querySelector('.book-scroll');
  const tab = book.querySelector('.book-tab');

  let visible = false;
  // lebar strip buku yang mengintip saat tertutup (di HP cukup tab-nya saja)
  const peek = () => (innerWidth < 640 ? 0 : 26);
  const pose = () => {
    const w = panel.offsetWidth;
    if (!visible) return { x: -(w + 120), y: innerHeight * 0.3, rotation: 4 };
    if (!store.state.bookOpen) return { x: -(w - peek()), y: innerHeight * 0.3, rotation: innerWidth < 640 ? 0 : 4 };
    return { x: 0, y: 0, rotation: 0 };
  };
  const apply = (duration = 0.9) => gsap.to(panel, { ...pose(), duration, ease: 'power3.out', overwrite: true });
  gsap.set(panel, pose());

  function setOpen(open) {
    if (!visible) return;
    store.set({ bookOpen: open });
    book.classList.toggle('is-open', open);
    tab.setAttribute('aria-label', open ? 'Tutup info tambahan' : 'Buka info tambahan');
    audio.sfx('whoosh');
    apply(open ? 0.9 : 0.7);
  }

  tab.addEventListener('click', () => {
    audio.sfx('click');
    setOpen(!store.state.bookOpen);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && store.state.bookOpen) setOpen(false);
  });
  addEventListener('resize', () => gsap.set(panel, pose()));

  // Foto belum ada -> kotak placeholder berisi caption
  content.addEventListener(
    'error',
    (e) => {
      if (e.target.tagName !== 'IMG') return;
      const fallback = el('span', 'photo-fallback');
      fallback.textContent = e.target.alt || 'Foto';
      e.target.replaceWith(fallback);
    },
    true,
  );

  // Tumpukan foto: klik -> foto teratas pindah ke belakang
  content.addEventListener('click', (e) => swap(e.target.closest('.photo-stack')));
  content.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') swap(e.target.closest('.photo-stack'), e);
  });
  function swap(stackEl, e) {
    if (!stackEl) return;
    e?.preventDefault();
    const cards = [...stackEl.querySelectorAll('.photo-card')];
    const top = cards.at(-1);
    audio.sfx('click');
    gsap
      .timeline()
      .to(top, { x: 120, rotation: 12, duration: 0.3, ease: 'power2.in' })
      .add(() => stackEl.prepend(top))
      .to(top, { x: 0, rotation: 0, duration: 0.45, ease: 'power3.out' });
  }

  return {
    setContent(data) {
      if (!data) {
        this.hide();
        return;
      }
      content.innerHTML = `
        ${data.kicker ? `<p class="book-kicker">${esc(data.kicker)}</p>` : ''}
        ${data.title ? `<h3 class="book-title">${esc(data.title)}</h3>` : ''}
        ${(data.sections ?? []).map(renderSection).join('')}`;
      scroll.scrollTop = 0;
    },
    show() {
      visible = true;
      book.classList.remove('is-hidden');
      apply(1.1);
    },
    hide() {
      if (store.state.bookOpen) store.set({ bookOpen: false });
      book.classList.remove('is-open');
      visible = false;
      apply(0.6);
      setTimeout(() => !visible && book.classList.add('is-hidden'), 650);
    },
    close: () => setOpen(false),
  };
}
