// Alur scene: intro -> chapter-1 ... chapter-n -> outro
// Route disimpan di hash URL (#chapter-2) supaya mudah dites.
import { store } from './store.js';
import { introScene } from '../scenes/intro.js';
import { chapterScene } from '../scenes/chapter.js';
import { outroScene } from '../scenes/outro.js';

export function createRouter(ctx) {
  const { story } = ctx;
  const total = story.chapters.length;
  let current = null;
  let busy = false;

  const chapterIndex = (route) => (/^chapter-\d+$/.test(route ?? '') ? Number(route.split('-')[1]) - 1 : -1);

  function canEnter(route) {
    if (route === 'intro') return true;
    if (route === 'outro') return store.state.completed.includes(total - 1);
    const i = chapterIndex(route);
    return i >= 0 && i < total && i < store.state.unlocked;
  }

  function title(route) {
    const i = chapterIndex(route);
    const part = i >= 0 ? story.chapters[i].label : route === 'outro' ? 'Akhir' : 'Intro';
    return `${part} | ${story.meta.title}`;
  }

  async function go(route, { transition = true } = {}) {
    if (busy) return;
    if (!canEnter(route)) {
      console.warn(`[router] "${route}" masih terkunci`);
      return;
    }
    busy = true;
    const swap = async () => {
      current?.leave();
      ctx.stage.innerHTML = '';
      store.set({ route });
      history.replaceState(null, '', `#${route}`);
      document.title = title(route);
      const i = chapterIndex(route);
      current = i >= 0 ? chapterScene(ctx, i) : route === 'outro' ? outroScene(ctx) : introScene(ctx);
    };
    const i = chapterIndex(route);
    const ch = story.chapters[i];
    const wipeOpts = ch
      ? { kicker: ch.label, title: ch.title, colors: ch.theme?.waves }
      : route === 'outro'
        ? { kicker: story.outro.transitionKicker ?? 'Penutup', title: story.outro.transitionTitle ?? '', colors: story.outro.theme?.waves }
        : { title: story.meta.title };
    try {
      if (transition && current) await ctx.wipe(swap, wipeOpts);
      else await swap();
    } finally {
      busy = false;
    }
  }

  return { go, canEnter, chapterIndex };
}
