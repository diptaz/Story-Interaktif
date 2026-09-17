// INTRO
// 1) Gerbang: "Kartu Peserta" (gaya kartu bank) muncul berputar 3D, miring mengikuti mouse,
//    judul glow + tombol "Mulai" (klik ini sekaligus membuka audio).
// 2) Prolog: panorama pembuka + narasi kata-per-kata + "Lewati intro"
import gsap from 'gsap';
import { audio } from '../core/audio.js';
import { el, esc, floatTitle, hideStagger, playStagger, reducedMotion, renderStagger, renderTitle, revealTitle } from '../core/text-fx.js';
import { cta, waitClick } from '../ui/cta.js';
import { createScope } from './scope.js';

export function passCard(data, { className = '' } = {}) {
  const card = el('div', `pass ${className}`);
  card.innerHTML = `
    <div class="pass-card">
      <span class="pass-waves" aria-hidden="true"></span>
      <span class="pass-dots" aria-hidden="true"></span>
      <span class="pass-shine" aria-hidden="true"></span>
      <div class="pass-top">
        <span class="pass-chip" aria-hidden="true"></span>
        <span class="pass-type">${esc(data.cardLabel ?? 'Kartu Peserta')}</span>
      </div>
      <div class="pass-body">
        ${data.kicker ? `<span class="pass-kicker">${esc(data.kicker)}</span>` : ''}
        <div class="pass-title-slot"></div>
        ${data.kickerBottom ? `<span class="pass-kicker">${esc(data.kickerBottom)}</span>` : ''}
        ${data.text ? `<p class="pass-text">${esc(data.text)}</p>` : ''}
        <div class="pass-extra"></div>
      </div>
      <div class="pass-foot">
        <span class="pass-tags">${(data.tags ?? []).map((t) => `<i>${esc(t)}</i>`).join('')}</span>
        <span class="pass-no">${esc(data.number ?? '')}</span>
      </div>
    </div>`;
  const title = renderTitle({ rows: data.rows ?? [], glow: 'blue', className: 'title-root--pass' });
  card.querySelector('.pass-title-slot').append(title);
  return { card, title };
}

// Kartu miring 3D mengikuti pointer + kilau bergerak
export function tiltCard(card) {
  if (reducedMotion()) return () => {};
  const inner = card.querySelector('.pass-card');
  const shine = card.querySelector('.pass-shine');
  const rx = gsap.quickTo(inner, 'rotationX', { duration: 0.8, ease: 'power3.out' });
  const ry = gsap.quickTo(inner, 'rotationY', { duration: 0.8, ease: 'power3.out' });
  const onMove = (e) => {
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    ry(nx * 14);
    rx(-ny * 10);
    gsap.to(shine, { xPercent: nx * 60, yPercent: ny * 40, duration: 0.8, overwrite: 'auto' });
  };
  addEventListener('pointermove', onMove);
  return () => removeEventListener('pointermove', onMove);
}

export function introScene(ctx) {
  const { story, painter, stage, ui, router } = ctx;
  const intro = story.intro;
  const scope = createScope();
  const view = el('section', 'scene scene-intro');
  stage.append(view);
  ui.chrome.showMenuButton(false);

  (async () => {
    /* ---------------------------- 1. gerbang ---------------------------- */
    painter.show(intro.gate.media ?? {}, { duration: 0, view: intro.gate.view });
    const gate = el('div', 'gate');
    const { card, title } = passCard(intro.gate);
    const start = cta(intro.gate.cta ?? 'Mulai', { variant: 'pill', className: 'gate-cta' });
    const hint = el('p', 'gate-hint', `<span aria-hidden="true">🎧</span> ${esc(intro.gate.hint ?? '')}`);
    gate.append(card, start, hint);
    view.append(gate);

    const inner = card.querySelector('.pass-card');
    gsap.fromTo(inner, { rotationY: -70, rotationX: 20, y: -60, opacity: 0, scale: 0.9 }, { rotationY: 0, rotationX: 0, y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' });
    gsap.fromTo([start, hint], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.8 });
    revealTitle(title, { delay: 0.5 });
    scope.add(floatTitle(title));
    await scope.wait(1.1);
    scope.add(tiltCard(card));
    // hover tombol -> kilau menyapu kartu
    start.addEventListener('pointerenter', () =>
      gsap.fromTo(card.querySelector('.pass-shine'), { xPercent: -120 }, { xPercent: 120, duration: 0.9, ease: 'power2.inOut', overwrite: true }),
    );

    await scope.guard(waitClick(start));
    audio.unlock();
    audio.playMusic(intro.music);

    // kalau URL punya #chapter-n yang sudah terbuka -> langsung ke sana
    if (ctx.resumeRoute && ctx.resumeRoute !== 'intro' && router.canEnter(ctx.resumeRoute)) {
      const target = ctx.resumeRoute;
      ctx.resumeRoute = null;
      router.go(target);
      return;
    }

    // kartu "di-tap": mengecil sedikit, lalu terbang ke atas sambil berputar
    await scope.guard(
      gsap
        .timeline()
        .to([start, hint], { opacity: 0, y: 10, duration: 0.2, ease: 'power2.in' }, 0)
        .to(inner, { scale: 0.94, rotationX: 0, rotationY: 0, duration: 0.18, ease: 'power2.out' }, 0)
        .to(inner, { y: '-110vh', rotationX: 35, rotationZ: -6, duration: 0.8, ease: 'power3.in' }),
    );
    gate.remove();

    /* ---------------------------- 2. prolog ----------------------------- */
    ui.chrome.showMenuButton(true);
    painter.show(intro.media ?? intro.gate.media ?? {}, { duration: 2, view: intro.view });
    const narration = audio.narration(intro.narration);
    scope.add(() => narration.stop());

    const lines = el('div', 'stagger-block');
    view.append(lines);
    const words = renderStagger(lines, intro.lines ?? []);
    const skip = cta(intro.skipLabel ?? 'Lewati intro', { variant: 'text', className: 'skip-intro' });
    view.append(skip);
    gsap.fromTo(skip, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.2 });

    playStagger(words, intro.staggerSeconds ?? 8);
    narration.play();
    const ended = new Promise((r) => narration.on('end', r));
    await scope.guard(Promise.race([ended.then(() => scope.wait(intro.holdAfter ?? 1.5)), waitClick(skip)]));

    await scope.guard(hideStagger(words));
    router.go('chapter-1');
  })();

  return { leave: () => (scope.leave(), view.remove()) };
}
