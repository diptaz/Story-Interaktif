// Foto ilustratif: aset lokal hasil imagegen, bukan dokumentasi peserta BCA.
// Semuanya tetap bisa diganti dengan foto resmi tanpa mengubah logika scroll.
const shots = [
  {
    label: '01 / BELAJAR',
    title: 'Di sini, rasa ingin tahu punya tempat.',
    text: 'Dari pertanyaan sederhana sampai ide yang dibahas bersama. Belajar terasa lebih hidup saat kamu bisa mencoba, berdiskusi, dan menemukan cara berpikirmu sendiri.',
    main: 'students-study.webp',
    mainAlt: 'Ilustrasi tiga mahasiswa berdiskusi di depan laptop dalam ruang kelas',
    detail: 'students-hero.webp',
    detailAlt: 'Ilustrasi mahasiswa berjalan bersama sambil membawa buku',
    note: 'RUANG UNTUK BELAJAR',
    word: 'BELAJAR',
  },
  {
    label: '02 / BERTEMU',
    title: 'Perjalanan yang terasa lebih dekat.',
    text: 'Di sela kelas dan kegiatan, ada percakapan, kerja sama, serta pertemanan yang membuat setiap langkah jadi lebih berarti.',
    main: 'students-community.webp',
    mainAlt: 'Ilustrasi empat mahasiswa berbincang di area kampus',
    detail: 'students-study.webp',
    detailAlt: 'Ilustrasi mahasiswa saling membantu mengerjakan tugas',
    note: 'RUANG UNTUK BERTEMU',
    word: 'BERTEMU',
  },
  {
    label: '03 / BERKARYA',
    title: 'Lalu ide itu mulai menjadi nyata.',
    text: 'Berani menyampaikan gagasan, mencoba solusi, dan terus belajar dari prosesnya. Inilah bekal yang kamu bawa untuk melangkah lebih jauh.',
    main: 'students-project.webp',
    mainAlt: 'Ilustrasi mahasiswi mempresentasikan rancangan proyek kepada teman-temannya',
    detail: 'students-community.webp',
    detailAlt: 'Ilustrasi kebersamaan mahasiswa setelah kegiatan belajar',
    note: 'RUANG UNTUK BERKARYA',
    word: 'BERKARYA',
  },
  {
    label: '04 / BERKOMPETISI',
    title: 'Ada ruang untuk bakat dan sorak bersama.',
    text: 'Di tengah kesibukan perkuliahan, ada ruang untuk menunjukkan bakat, membangun kekompakan, dan menikmati semangat kompetisi bersama.',
    main: 'activity-performance.webp',
    mainAlt: 'Penampilan tari kelompok mahasiswa di panggung kampus',
    detail: 'activity-sport.webp',
    detailAlt: 'Pertandingan basket antarangkatan di lapangan kampus',
    note: 'PANGGUNG & LAPANGAN',
    credit: 'FOTO DOKUMENTASI PRIBADI PENGGUNA',
    word: 'BERSAMA',
  },
];

const photo = (filename) => `/assets/photos/${filename}`;

export function galleryMarkup() {
  return `<section class="student-gallery" id="cerita" aria-labelledby="gallery-heading">
    <div class="gallery-stage">
      <div class="gallery-decor gallery-decor--one" aria-hidden="true"></div>
      <div class="gallery-decor gallery-decor--two" aria-hidden="true"></div>
      <div class="gallery-dots" aria-hidden="true"></div>
      <div class="site-wrap gallery-stage-inner">
        <div class="gallery-topline"><span>BEASISWA BCA / CERITA PERJALANAN</span><span class="gallery-counter" aria-hidden="true">01 / ${String(shots.length).padStart(2,"0")}</span></div>
        <div class="gallery-heading"><p>GALERI MAHASISWA</p><h2 id="gallery-heading">Setiap langkah punya cerita.</h2></div>
        <div class="gallery-scenes">
          ${shots.map((shot, i) => `<article class="gallery-scene" data-gallery-scene="${i}">
            <div class="gallery-scene-copy"><p class="gallery-kicker">${shot.label}</p><h3>${shot.title}</h3><p>${shot.text}</p><span class="gallery-rule" aria-hidden="true"></span><small>${shot.credit ?? 'FOTO ILUSTRATIF · BUKAN DOKUMENTASI BCA'}</small></div>
            <div class="gallery-photos"><span class="gallery-big-word" aria-hidden="true">${shot.word}</span>
              <figure class="gallery-photo gallery-photo--main"><img src="${photo(shot.main)}" alt="${shot.mainAlt}" loading="lazy" decoding="async" width="1536" height="1024"/><figcaption><b>0${i + 1}</b><span>${shot.note}</span></figcaption></figure>
              <figure class="gallery-photo gallery-photo--detail"><img src="${photo(shot.detail)}" alt="${shot.detailAlt}" loading="lazy" decoding="async" width="1536" height="1024"/><figcaption>BEASISWA BCA / 2027</figcaption></figure>
              <span class="gallery-orbit" aria-hidden="true"></span><span class="gallery-star" aria-hidden="true">✳</span>
            </div>
          </article>`).join('')}
        </div>
        <div class="gallery-bottomline"><span>SCROLL UNTUK MENGIKUTI CERITA ↓</span><div class="gallery-track" aria-hidden="true"><i></i></div><span>${String(shots.length).padStart(2,"0")} MOMEN / 01 PERJALANAN</span></div>
      </div>
    </div>
  </section>`;
}

const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => { const t = clamp(x); return t * t * (3 - 2 * t); };

export function setupGallery(root, reducedMotion) {
  if (!root || reducedMotion.matches) return () => {};
  const scenes = [...root.querySelectorAll('[data-gallery-scene]')];
  const counter = root.querySelector('.gallery-counter');
  const track = root.querySelector('.gallery-track i');
  let active = -1;

  function update() {
    if (reducedMotion.matches) return;
    const rect = root.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / travel);
    const count = scenes.length;
    const span = 1 / count; // panjang tiap adegan, mengikuti jumlah shots
    const current = Math.min(count - 1, Math.floor(progress / span));

    scenes.forEach((scene, i) => {
      const arrival = i === 0 ? 1 : smooth((progress - (i * span - 0.1)) / 0.2);
      const departure = i === count - 1 ? 0 : smooth((progress - ((i + 1) * span - 0.1)) / 0.2);
      const visible = arrival * (1 - departure);
      const main = scene.querySelector('.gallery-photo--main');
      const detail = scene.querySelector('.gallery-photo--detail');
      const copy = scene.querySelector('.gallery-scene-copy');

      scene.style.opacity = visible.toFixed(3);
      main.style.transform = `translate3d(${Math.round((1 - arrival) * 68 - departure * 35)}vw, ${Math.round((1 - arrival) * 22 - departure * 12)}vh, 0) rotate(${(-5 + (1 - arrival) * 20 - departure * 10).toFixed(2)}deg) scale(${(0.83 + arrival * 0.17).toFixed(3)})`;
      detail.style.transform = `translate3d(${Math.round((1 - arrival) * -65 + departure * 30)}vw, ${Math.round((1 - arrival) * -20 + departure * 18)}vh, 0) rotate(${(9 - (1 - arrival) * 25 + departure * 12).toFixed(2)}deg) scale(${(0.75 + arrival * 0.25).toFixed(3)})`;
      copy.style.transform = `translate3d(0, ${Math.round((1 - arrival) * 45 - departure * 24)}px, 0)`;
    });

    if (current !== active) {
      active = current;
      scenes.forEach((scene, i) => scene.setAttribute('aria-hidden', String(i !== current)));
      counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
    }
    track.style.transform = `scaleX(${progress.toFixed(3)})`;
  }

  update();
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      scenes.forEach(scene => {
        scene.removeAttribute('style');
        scene.removeAttribute('aria-hidden');
        scene.querySelectorAll('.gallery-photo, .gallery-scene-copy').forEach(el => el.removeAttribute('style'));
      });
    } else update();
  });
  return update;
}
