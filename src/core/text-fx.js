// Efek teks. Timing animasi diambil dari hasil bedah web referensi
// (Pasticcino Bag World Tour, monogrid) supaya "rasa" geraknya sama; tampilannya tema BCA.
import gsap from 'gsap';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function esc(text = '') {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function el(tag, className = '', html = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  return node;
}

/* -------------------------------------------------------------------------- */
/* 1. Narasi intro/outro: kata muncul satu-satu, miring sedikit, gradasi krem  */
/*    + glow blur di belakang.                                                 */
/* -------------------------------------------------------------------------- */
const WORD_ROT = [-0.68, 0.22, -0.37, 1.82, -0.5, 0.3, -1.2, 0.8, -0.4, 0.6, -0.9, 1.1];

export function renderStagger(container, lines) {
  container.classList.add('stagger-text');
  container.innerHTML = `<span class="glow" aria-hidden="true"></span>`;
  const p = el('p');
  p.setAttribute('aria-label', lines.join(' '));
  for (const line of lines) {
    const row = el('span', 'stagger-line');
    row.setAttribute('aria-hidden', 'true');
    row.innerHTML = line
      .split(' ')
      .map((w) => `<span class="stagger-word">${esc(w)}</span>`)
      .join(' ');
    p.append(row);
  }
  container.append(p);
  return [...container.querySelectorAll('.stagger-word')];
}

// total = durasi narasi (detik); kata-kata dibagi rata sepanjang durasi itu.
export function playStagger(words, total = 8) {
  gsap.set(words, {
    opacity: 0,
    y: 20,
    rotation: (i) => WORD_ROT[i % WORD_ROT.length],
    display: 'inline-block',
    transformOrigin: 'center bottom',
  });
  if (reducedMotion()) return gsap.set(words, { opacity: 1, y: 0, rotation: 0 });
  const per = total / words.length;
  const gap = Math.min(per * 0.6, 0.28);
  const dur = Math.min(per * 2, 1.1);
  const tl = gsap.timeline();
  words.forEach((w, i) => {
    tl.to(w, { opacity: 1, y: 0, rotation: WORD_ROT[i % WORD_ROT.length] * 0.18, duration: dur, ease: 'power3.out', force3D: true }, i * gap);
  });
  return tl;
}

export function hideStagger(words) {
  return gsap.to(words, { opacity: 0, y: -12, duration: 0.45, stagger: 0.012, ease: 'power2.in' });
}

/* -------------------------------------------------------------------------- */
/* 2. Judul besar (cover chapter, tiket): kata per baris dengan mask reveal,  */
/*    lalu "mengambang" pelan + bayangan yang ikut bergeser + glow bergerak.   */
/* -------------------------------------------------------------------------- */
// rows: ['THE ARCHIVE', 'OF TEXTILES'] ; label: teks melengkung di atas judul
// glow: 'blue' | 'navy' | 'light'
export function renderTitle({ label = '', rows = [], glow = 'blue', className = '' }) {
  const root = el('div', `title-root ${className}`);
  const arcId = `arc-${Math.random().toString(36).slice(2, 8)}`;
  let wordIndex = 0;
  root.innerHTML = `
    <span class="glow glow--${glow}" aria-hidden="true"></span>
    ${
      label
        ? `<svg class="label-arc" viewBox="0 0 400 60" aria-hidden="true">
            <path id="${arcId}" d="M 30 56 Q 200 6 370 56" fill="none" />
            <text class="label-text"><textPath href="#${arcId}" startOffset="50%" text-anchor="middle">${esc(label)}</textPath></text>
          </svg>`
        : ''
    }
    <h2 class="title-rows" aria-label="${esc([label, ...rows].join(' '))}">
      ${rows
        .map(
          (row) =>
            `<span class="title-row" aria-hidden="true">${row
              .split(' ')
              .map((w) => {
                const rot = WORD_ROT[wordIndex++ % WORD_ROT.length] * 1.4;
                return `<span class="title-mask"><span class="word-tilt" style="--rot:${rot.toFixed(2)}deg"><span class="word">${esc(w)}</span></span></span>`;
              })
              .join('')}</span>`,
        )
        .join('')}
    </h2>`;
  return root;
}

export function revealTitle(root, { delay = 0.3 } = {}) {
  const words = root.querySelectorAll('.word');
  const label = root.querySelector('.label-arc');
  const tl = gsap.timeline({
    delay,
    onComplete: () => root.querySelectorAll('.title-mask').forEach((m) => (m.style.overflow = 'visible')),
  });
  if (reducedMotion()) return tl;
  if (label) tl.from(label, { opacity: 0, y: 10, duration: 0.8, ease: 'power3.out' }, 0);
  tl.from(words, { yPercent: 110, duration: 1.1, stagger: 0.14, ease: 'power3.out' }, 0.05);
  tl.from(root.querySelector('.glow'), { opacity: 0, scale: 0.6, duration: 1.6, ease: 'power2.out' }, 0);
  return tl;
}

export function hideTitle(root) {
  root.querySelectorAll('.title-mask').forEach((m) => (m.style.overflow = 'hidden'));
  return gsap.to(root.querySelectorAll('.word, .label-arc, .glow'), {
    yPercent: -110,
    opacity: 0,
    duration: 0.6,
    stagger: 0.05,
    ease: 'power2.in',
  });
}

// Konstanta dari usePointerParallax web referensi.
const FLOAT = { period: 3, amp: { x: 0.04, y: 0.06, rot: 0.8 }, glowAmp: { x: 0.12, y: 0.09 }, glowDelay: 0.25, shadowBase: 0.45, shadowStep: 0.08 };

function seeded(seed) {
  let e = seed + 1;
  return () => ((e = (e * 16807) % 2147483647), (e - 1) / 2147483646);
}
const amp = (rnd, a) => (rnd() > 0.5 ? 1 : -1) * (a * 0.6 + rnd() * a * 0.4);

export function floatTitle(root) {
  if (reducedMotion()) return () => {};
  const words = [...root.querySelectorAll('.word')];
  const glow = root.querySelector('.glow');
  const ctx = gsap.context(() => {
    words.forEach((word, i) => {
      const rnd = seeded(i);
      const off = { x: amp(rnd, FLOAT.amp.x), y: amp(rnd, FLOAT.amp.y) };
      const rot = amp(rnd, FLOAT.amp.rot);
      const delay = (i / Math.max(words.length, 1)) * FLOAT.period * 0.5;
      const fs = parseFloat(getComputedStyle(word).fontSize);
      gsap.to(word, { x: off.x * fs, y: off.y * fs, rotation: rot, duration: FLOAT.period * 0.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay });
      // bayangan tertinggal sedikit dari huruf -> kesan tebal/3D
      const s = { x: 0, y: 0 };
      gsap.to(s, {
        x: off.x * fs,
        y: off.y * fs,
        duration: FLOAT.period * 0.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: delay + FLOAT.shadowBase + i * FLOAT.shadowStep,
        onUpdate: () => {
          word.style.setProperty('--shadow-dx', `${s.x}px`);
          word.style.setProperty('--shadow-dy', `${s.y}px`);
        },
      });
    });
    if (glow && words[0]) {
      const rnd = seeded(99);
      const fs = parseFloat(getComputedStyle(words[0]).fontSize);
      gsap.to(glow, { x: amp(rnd, FLOAT.glowAmp.x) * fs, y: amp(rnd, FLOAT.glowAmp.y) * fs, duration: FLOAT.period * 0.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: FLOAT.glowDelay });
    }
  }, root);

  // parallax mouse: judul ikut mouse, label melengkung bergerak berlawanan
  const rows = root.querySelector('.title-rows');
  const label = root.querySelector('.label-arc');
  const qx = gsap.quickTo(rows, 'x', { duration: 0.9, ease: 'power2.out' });
  const qy = gsap.quickTo(rows, 'y', { duration: 0.9, ease: 'power2.out' });
  const lx = label && gsap.quickTo(label, 'x', { duration: 1.1, ease: 'power2.out' });
  const ly = label && gsap.quickTo(label, 'y', { duration: 1.1, ease: 'power2.out' });
  const onMove = (e) => {
    const nx = (e.clientX / innerWidth - 0.5) * 2;
    const ny = (e.clientY / innerHeight - 0.5) * 2;
    qx(nx * 14);
    qy(ny * 10);
    lx?.(nx * 14 * -0.4);
    ly?.(ny * 10 * -0.4);
  };
  addEventListener('pointermove', onMove);
  return () => {
    removeEventListener('pointermove', onMove);
    ctx.revert();
  };
}

/* -------------------------------------------------------------------------- */
/* 3. Huruf melingkar (tombol interaksi "TAHAN UNTUK ..." / "GESER DI SINI")  */
/* -------------------------------------------------------------------------- */
export function arcText(text) {
  const chars = [...text.toUpperCase()];
  const step = 360 / (chars.length + 2);
  return chars
    .map((c, i) => `<span class="arc-character" style="--arc-angle:${(i * step).toFixed(2)}deg">${c === ' ' ? '&nbsp;' : esc(c)}</span>`)
    .join('');
}

/* -------------------------------------------------------------------------- */
/* 4. Gelombang huruf berulang (judul hasil, label CTA)                        */
/* -------------------------------------------------------------------------- */
export function splitChars(node) {
  const text = node.textContent;
  node.setAttribute('aria-label', text);
  node.innerHTML = [...text]
    .map((c) => (c === ' ' ? ' ' : `<span class="reveal-char" aria-hidden="true">${esc(c)}</span>`))
    .join('');
  return [...node.querySelectorAll('.reveal-char')];
}

export function waveChars(node, { startDelay = 1.3 } = {}) {
  if (reducedMotion()) return () => {};
  const chars = splitChars(node);
  const stagger = 0.04;
  const hold = (chars.length - 1) * stagger * 0.35;
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.2, delay: startDelay });
  chars.forEach((c, i) => {
    tl.to(c, { yPercent: -15, duration: 0.3, ease: 'power3.out' }, i * stagger).to(c, { yPercent: 0, duration: 0.3, ease: 'power3.in' }, i * stagger + 0.3 + hold);
  });
  return () => tl.kill();
}

// Muncul lembut untuk blok teks biasa (mask naik)
export function revealUp(nodes, { delay = 0, stagger = 0.08 } = {}) {
  if (reducedMotion()) return gsap.set(nodes, { opacity: 1 });
  return gsap.fromTo(nodes, { opacity: 0, y: 24, rotation: -1 }, { opacity: 1, y: 0, rotation: 0, duration: 0.9, delay, stagger, ease: 'power3.out' });
}
