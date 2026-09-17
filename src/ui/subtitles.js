// Kertas subtitle kanan bawah (miring -2°, garis kolom seperti buku kas)
// + panel kontrol kayu: CC on/off, play/pause narasi, ulang narasi.
import gsap from 'gsap';
import { store } from '../core/store.js';
import { audio } from '../core/audio.js';
import { el, esc } from '../core/text-fx.js';

const ICONS = {
  cc: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 10.2a2.4 2.4 0 1 0 0 3.6M17.5 10.2a2.4 2.4 0 1 0 0 3.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/></svg>`,
  replay: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4.5H9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

export function createSubtitles(root) {
  const wrap = el('div', 'sfx-panel is-hidden');
  wrap.innerHTML = `
    <div class="subtitle-note" aria-live="polite">
      <span class="note-columns" aria-hidden="true"><i></i><i></i><i></i></span>
      <div class="note-text"></div>
    </div>
    <div class="controls wood-panel">
      <button type="button" class="ctrl ctrl-cc">${ICONS.cc}</button>
      <button type="button" class="ctrl ctrl-play">${ICONS.pause}</button>
      <button type="button" class="ctrl ctrl-replay" aria-label="Ulangi narasi">${ICONS.replay}</button>
    </div>`;
  root.append(wrap);
  const note = wrap.querySelector('.subtitle-note');
  const text = wrap.querySelector('.note-text');
  const btnCc = wrap.querySelector('.ctrl-cc');
  const btnPlay = wrap.querySelector('.ctrl-play');
  const btnReplay = wrap.querySelector('.ctrl-replay');

  let narration = null;
  let offs = [];
  let currentText = null;
  let noteShown = false;

  function showNote(show) {
    const want = show && store.state.subtitles && !!currentText;
    if (want === noteShown) return;
    noteShown = want;
    gsap.to(note, { y: want ? 0 : 140, rotation: want ? -2 : 4, opacity: want ? 1 : 0, duration: want ? 0.7 : 0.45, ease: want ? 'back.out(1.4)' : 'power2.in' });
  }
  gsap.set(note, { y: 140, opacity: 0 });

  function setText(value) {
    if (value === currentText) return;
    currentText = value;
    if (!value) return showNote(false);
    gsap.to(text, {
      opacity: 0,
      duration: 0.15,
      onComplete: () => {
        text.innerHTML = esc(value);
        gsap.to(text, { opacity: 1, duration: 0.25 });
      },
    });
    showNote(true);
  }

  function syncCc() {
    btnCc.classList.toggle('is-off', !store.state.subtitles);
    btnCc.setAttribute('aria-label', store.state.subtitles ? 'Matikan subtitle' : 'Nyalakan subtitle');
    showNote(true);
  }
  function syncPlay(playing) {
    btnPlay.innerHTML = playing ? ICONS.pause : ICONS.play;
    btnPlay.setAttribute('aria-label', playing ? 'Jeda narasi' : 'Putar narasi');
  }
  syncCc();
  store.on('subtitles', syncCc);

  btnCc.addEventListener('click', () => {
    audio.sfx('click');
    store.set({ subtitles: !store.state.subtitles });
  });
  btnPlay.addEventListener('click', () => {
    audio.sfx('click');
    if (!narration) return;
    narration.playing ? narration.pause() : narration.play();
  });
  btnReplay.addEventListener('click', () => {
    audio.sfx('click');
    narration?.replay();
  });

  return {
    // Hubungkan ke objek narasi dari audio.narration()
    attach(n) {
      this.detach();
      narration = n;
      wrap.classList.remove('is-hidden');
      gsap.fromTo(wrap.querySelector('.controls'), { y: 80 }, { y: 0, duration: 0.6, ease: 'power3.out' });
      offs = [n.on('time', (t, cue) => setText(cue?.text ?? null)), n.on('state', syncPlay), n.on('end', () => setText(null))];
      syncPlay(n.playing);
    },
    detach() {
      offs.forEach((off) => off());
      offs = [];
      narration = null;
      setText(null);
    },
    hide() {
      this.detach();
      wrap.classList.add('is-hidden');
    },
  };
}
