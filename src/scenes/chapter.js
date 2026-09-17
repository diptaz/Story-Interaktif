// CHAPTER
// Cover (label melengkung + judul besar mengambang + "Jelajahi")
// -> rangkaian step: [lokasi] -> intro teks -> interaksi -> claim -> hasil -> lanjut
import gsap from 'gsap';
import { store } from '../core/store.js';
import { audio } from '../core/audio.js';
import { el, esc, floatTitle, hideTitle, renderTitle, revealTitle, revealUp, waveChars } from '../core/text-fx.js';
import { interactions } from '../interactions/index.js';
import { cta, waitClick } from '../ui/cta.js';
import { createScope, passes } from './scope.js';

const PERSISTENT = new Set(['carousel', 'hotspots']); // tetap bisa dipakai setelah selesai

export function chapterScene(ctx, index) {
  const { story, painter, stage, ui, router } = ctx;
  const ch = story.chapters[index];
  const total = story.chapters.length;
  const scope = createScope();
  const view = el('section', `scene scene-chapter chapter-${index + 1}`);
  view.style.setProperty('--ink', ch.theme?.ink ?? '#d9cdad');
  stage.append(view);
  ui.chrome.showMenuButton(true);

  let narration = null;
  const playNarration = (data) => {
    narration?.stop();
    narration = audio.narration(data);
    ui.subtitles.attach(narration);
    narration.play();
  };
  scope.add(() => {
    narration?.stop();
    ui.subtitles.hide();
    ui.book.hide();
  });

  // HUD: lokasi (pin) + kotak bernomor progres step (seperti "Tahapan Seleksi")
  const hud = el('div', 'step-hud');
  hud.innerHTML = `<span class="step-location"></span><span class="step-steps" aria-hidden="true"></span>`;
  const updateHud = (step) => {
    const visible = ch.steps.filter((s) => passes(s.when, store.state.flags));
    const at = visible.indexOf(step);
    hud.querySelector('.step-location').innerHTML = step.location
      ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a7 7 0 0 0-7 7c0 5.2 7 12 7 12s7-6.8 7-12a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>${esc(step.location)}`
      : '';
    hud.querySelector('.step-steps').innerHTML = visible
      .map((_, i) => `<i class="${i < at ? 'done' : i === at ? 'now' : ''}">${i < at ? '✓' : i + 1}</i>`)
      .join('');
    gsap.fromTo(hud, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
  };

  // petunjuk "geser untuk melihat 360°" (sekali per sesi, hilang saat user menggeser)
  function show360Hint() {
    if (!painter.isPano || ctx.seen360Hint) return;
    ctx.seen360Hint = true;
    const hint = el('div', 'hint-360', `<span class="hint-360-icon" aria-hidden="true">360°</span>${esc(story.meta.hint360 ?? 'Geser layar untuk melihat sekeliling')}`);
    view.append(hint);
    gsap.fromTo(hint, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.8, ease: 'power3.out' });
    const hide = () => {
      off();
      gsap.to(hint, { opacity: 0, y: 10, duration: 0.4, onComplete: () => hint.remove() });
    };
    const off = painter.on('look', hide);
    scope.add(off);
    gsap.delayedCall(9, hide);
  }

  async function runStep(step, isLastCandidate) {
    const layer = el('div', 'step');
    view.append(layer);
    updateHud(step);
    painter.setProgress(0); // lepas zoom sisa interaksi hold/drag sebelumnya
    if (step.media) painter.show(step.media, { view: step.view }).then(() => scope.alive && show360Hint());
    else if (step.view) painter.lookAt(step.view);
    if (step.book) ui.book.setContent(step.book);
    if (step.music) audio.playMusic(step.music);
    if (step.narration) playNarration(step.narration);

    // --- intro teks step (judul glow + kalimat) ---
    if (step.intro) {
      const intro = el('div', 'step-intro');
      const title = renderTitle({ rows: step.intro.rows ?? [step.intro.title ?? ''], glow: ch.theme?.glow ?? 'blue', className: 'title-root--step' });
      intro.append(title);
      if (step.intro.text) intro.append(el('p', 'step-intro-text', esc(step.intro.text)));
      layer.append(intro);
      revealTitle(title, { delay: 0.15 });
      const stopFloat = floatTitle(title);
      revealUp(intro.querySelectorAll('.step-intro-text'), { delay: 0.6 });
      if (step.interaction) {
        await scope.wait(step.intro.hold ?? 2.8);
        await scope.guard(hideTitle(title));
        gsap.to(intro.querySelectorAll('.step-intro-text'), { opacity: 0, duration: 0.3 });
        stopFloat();
        intro.remove();
      } else {
        scope.add(stopFloat);
      }
    }

    // --- interaksi ---
    let result = {};
    let ix = null;
    if (step.interaction) {
      const make = interactions[step.interaction.type];
      if (!make) throw new Error(`Interaksi "${step.interaction.type}" tidak dikenal (lihat src/interactions/index.js)`);
      ix = make(step.interaction, { painter, notif: ui.notif, store });
      layer.append(ix.root);
      scope.add(() => ix.destroy());
      let skip = null;
      if (step.skippable !== false) {
        skip = cta(step.skipLabel ?? 'Lewati', { variant: 'ghost', className: 'step-skip', onClick: () => ix.skip() });
        layer.append(skip);
        gsap.fromTo(skip, { opacity: 0 }, { opacity: 1, delay: 1.5, duration: 0.5 });
      }
      result = (await scope.guard(ix.done)) ?? {};
      skip?.remove();
      if (!PERSISTENT.has(step.interaction.type)) ix.destroy();
    }

    // --- claim ---
    for (const item of [].concat(step.claim ?? [])) ui.notif.claim(item);

    // --- hasil ---
    const outcome = step.interaction?.type === 'race' ? (result.win ? step.interaction.win : step.interaction.lose) : step.result;
    if (outcome?.title || outcome?.text) {
      const res = el('div', `step-result ${PERSISTENT.has(step.interaction?.type) ? 'is-top' : ''}`);
      res.innerHTML = `
        ${outcome.kicker ? `<p class="result-kicker">${esc(outcome.kicker)}</p>` : ''}
        ${outcome.title ? `<h2 class="result-title">${esc(outcome.title)}</h2>` : ''}
        ${outcome.text ? `<p class="result-text">${esc(outcome.text)}</p>` : ''}`;
      layer.append(res);
      revealUp(res.children, { stagger: 0.12 });
      const t = res.querySelector('.result-title');
      if (t) scope.add(waveChars(t));
    }
    if (outcome?.media) painter.show(outcome.media, { view: outcome.view });
    else if (outcome?.view) painter.lookAt(outcome.view);

    // --- tombol lanjut ---
    const isLast = isLastCandidate();
    const label = isLast ? (ch.nextLabel ?? (index === total - 1 ? 'Menuju akhir' : 'Chapter berikutnya')) : (step.nextLabel ?? 'Lanjut');
    const next = cta(label, { className: 'step-next' });
    layer.append(next);
    gsap.fromTo(next, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: 'power3.out' });
    await scope.guard(waitClick(next));

    ix?.destroy();
    gsap.to(hud, { opacity: 0, duration: 0.3 });
    await scope.guard(gsap.to(layer, { opacity: 0, duration: 0.4 }));
    layer.remove();
    return { goto: result.goto ?? outcome?.goto };
  }

  (async () => {
    /* ------------------------------ cover ------------------------------ */
    audio.playMusic(ch.music);
    painter.setProgress(0);
    painter.show(ch.cover?.media ?? {}, { view: ch.cover?.view });
    const cover = el('div', 'chapter-cover');
    const title = renderTitle({ label: ch.label, rows: ch.cover?.rows ?? ch.title.split('\n'), glow: ch.theme?.glow ?? 'blue' });
    const explore = cta(ch.cover?.explore ?? 'Jelajahi', { variant: 'text', className: 'explore' });
    cover.append(title, explore);
    view.append(cover);
    revealTitle(title);
    const stopFloat = scope.add(floatTitle(title));
    gsap.fromTo(explore, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, delay: 1, ease: 'power3.out' });

    await scope.guard(waitClick(explore));
    gsap.to(explore, { opacity: 0, duration: 0.3 });
    await scope.guard(hideTitle(title));
    stopFloat();
    cover.remove();

    ui.book.setContent(ch.book);
    if (ch.book) ui.book.show();
    view.append(hud);
    if (ch.narration) playNarration(ch.narration);

    /* ------------------------------ steps ------------------------------ */
    const steps = ch.steps ?? [];
    let i = 0;
    while (i < steps.length) {
      const step = steps[i];
      if (!passes(step.when, store.state.flags)) {
        i += 1;
        continue;
      }
      const at = i;
      const isLastCandidate = () => !steps.slice(at + 1).some((s) => passes(s.when, store.state.flags));
      const { goto } = await runStep(step, isLastCandidate);
      const jump = goto ? steps.findIndex((s) => s.id === goto) : -1;
      i = jump >= 0 ? jump : i + 1;
    }

    /* ------------------------------ selesai ---------------------------- */
    store.completeChapter(index, total);
    for (const item of [].concat(ch.claim ?? [])) await scope.guard(ui.notif.claim(item));
    router.go(index === total - 1 ? 'outro' : `chapter-${index + 2}`);
  })();

  return { leave: () => (scope.leave(), view.remove()) };
}
