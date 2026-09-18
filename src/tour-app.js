import './styles/ui.css';
import './styles/scenes.css';
import './styles/interactions.css';

import story from './story.js';
import { store } from './core/store.js';
import { audio } from './core/audio.js';
import { Painter } from './core/painter.js';
import { createRouter } from './core/router.js';
import { createChrome } from './ui/chrome.js';
import { createBook } from './ui/book.js';
import { createSubtitles } from './ui/subtitles.js';
import { createNotif } from './ui/notif.js';
import { createMenu } from './ui/menu.js';
import { createTransition } from './ui/transition.js';
import { runLoader } from './ui/loader.js';
import { installHoverSfx } from './ui/cta.js';


const $ = (selector) => document.querySelector(selector);

export async function mountTour({ resumeRoute = 'intro', onHome }) {
  const params = new URLSearchParams(location.search);
  if (params.has('reset')) store.resetProgress();
  if (params.has('unlock')) store.set({ unlocked: story.chapters.length, completed: story.chapters.map((_, i) => i) });
  installHoverSfx();
  const painter = new Painter($('#painter'), story.art);
  audio.init(story);
  const ctx = {
    story,
    painter,
    stage: $('#stage'),
    // chapter/outro langsung dibuka setelah pengguna menekan tombol kartu pembuka.
    resumeRoute: resumeRoute === 'intro' ? null : resumeRoute,
  };
  const uiRoot = $('#ui');
  const overlay = $('#overlay');
  ctx.ui = {
    chrome: createChrome(uiRoot, story, { onMenu: () => ctx.ui.menu.toggle(), onHome }),
    book: createBook(uiRoot),
    subtitles: createSubtitles(uiRoot),
    menu: createMenu(uiRoot, story, { onSelect: (i) => ctx.router.go(`chapter-${i + 1}`) }),
    notif: createNotif(overlay),
  };
  ctx.wipe = createTransition(overlay);
  ctx.router = createRouter(ctx);

  // ?debug -> menampilkan yaw/pitch kamera dan titik hotspot 360.
  if (params.has('debug')) {
    const box = document.createElement('pre');
    box.className = 'debug-box';
    overlay.append(box);
    let last = '';
    painter.onFrame(() => {
      const c = painter.cam;
      const yaw = ((((c.yaw % 360) + 540) % 360) - 180).toFixed(0);
      box.textContent = `view: { yaw: ${yaw}, pitch: ${Math.round(c.pitch)}, fov: ${Math.round(c.fov)} }\n${last}`;
    });
    painter.on('tap', (e) => {
      const p = painter.unproject(e.clientX, e.clientY);
      last = `klik: { yaw: ${p.yaw}, pitch: ${p.pitch} }`;
      console.info('[debug] titik 360 ->', `{ yaw: ${p.yaw}, pitch: ${p.pitch} }`);
    });
  }

  await runLoader(overlay, story, painter);
  ctx.router.go('intro', { transition: false });
  Object.assign(window, { __story: ctx });
}
