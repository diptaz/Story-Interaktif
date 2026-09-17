// OUTRO: panorama penutup + narasi kata-per-kata (efek sama dengan intro),
// lalu Kartu Peserta "lulus tur" berisi judul glow, dompet benefit yang sudah di-claim, dan tombol.
import gsap from 'gsap';
import { store } from '../core/store.js';
import { audio } from '../core/audio.js';
import { el, esc, floatTitle, hideStagger, playStagger, renderStagger, revealTitle, revealUp } from '../core/text-fx.js';
import { cta } from '../ui/cta.js';
import { passCard, tiltCard } from './intro.js';
import { createScope } from './scope.js';

export function outroScene(ctx) {
  const { story, painter, stage, ui, router } = ctx;
  const outro = story.outro;
  const scope = createScope();
  const view = el('section', 'scene scene-outro');
  stage.append(view);
  ui.chrome.showMenuButton(true);

  (async () => {
    audio.playMusic(outro.music);
    painter.setProgress(0);
    painter.show(outro.media ?? {}, { view: outro.view });
    const narration = audio.narration(outro.narration);
    scope.add(() => narration.stop());

    const lines = el('div', 'stagger-block');
    view.append(lines);
    const words = renderStagger(lines, outro.lines ?? []);
    await scope.wait(1);
    playStagger(words, outro.staggerSeconds ?? 8);
    narration.play();
    await scope.guard(new Promise((r) => narration.on('end', r)));
    await scope.wait(outro.holdAfter ?? 2);
    await scope.guard(hideStagger(words));
    lines.remove();

    /* --------------------------- kartu penutup --------------------------- */
    const fin = outro.final ?? {};
    const { card, title } = passCard(fin, { className: 'pass--final' });
    const extra = card.querySelector('.pass-extra');
    const claims = store.state.claims;
    if (claims.length) {
      extra.innerHTML = `<small class="final-claims-title">${esc(fin.claimsLabel ?? 'Dompet benefit')}</small>
        <div class="final-claims">${claims.map((c) => `<span class="claim-chip"><i>${esc(c.icon ?? '★')}</i>${esc(c.label)}</span>`).join('')}</div>`;
    }
    const actions = el('div', 'final-actions');
    actions.append(
      cta(fin.replayLabel ?? 'Ulangi perjalanan', {
        onClick: () => {
          store.resetProgress();
          router.go('intro');
        },
      }),
    );
    if (fin.link) {
      const a = el('a', 'cta cta--ghost', `<span class="cta-label">${esc(fin.link.label)}</span>`);
      a.href = fin.link.href;
      a.target = '_blank';
      a.rel = 'noopener';
      actions.append(a);
    }
    extra.append(actions);

    view.append(card);
    const inner = card.querySelector('.pass-card');
    gsap.fromTo(inner, { rotationY: 70, y: 80, opacity: 0, scale: 0.9 }, { rotationY: 0, y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' });
    revealTitle(title, { delay: 0.5 });
    scope.add(floatTitle(title));
    revealUp(card.querySelectorAll('.pass-text, .claim-chip, .final-actions > *'), { delay: 0.9, stagger: 0.06 });
    await scope.wait(1.2);
    scope.add(tiltCard(card));
  })();

  return { leave: () => (scope.leave(), view.remove()) };
}
