import { scholarship, programs, selectionSteps, questions, registrationStatus } from './landing-content.js';
import { afterProgram, eligibilityQuestions, evaluateEligibility, filterCities, groupByRegion, parentFacts, parentSummaryText, testCities } from './decision-content.js';
import { bkKit, bkSummaryText, countEvidence, evidenceCategories, evidenceItems, filterEvidence, referralLink, schoolCode } from './outreach-content.js';
import { programArt } from './landing-art.js';
import { galleryMarkup, setupGallery } from './landing-gallery.js';

const icon = (name) => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    external: '<path d="M7 17 17 7M7 7h10v10"/>',
    play: '<path d="m9 6 10 6-10 6z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    pin: '<path d="M12 21s7-5 7-11a7 7 0 1 0-14 0c0 6 7 11 7 11Z"/><circle cx="12" cy="10" r="2"/>',
    book: '<path d="M12 6C8 3 4 4 2 5v14c4-2 7-1 10 1 3-2 6-3 10-1V5c-2-1-6-2-10 1Zm0 0v14"/>',
    wallet: '<path d="M20 8V5H5a2 2 0 0 0 0 4h16v11H5a2 2 0 0 1-2-2V7"/><path d="M21 12h-6v5h6"/>',
    home: '<path d="m3 10 9-7 9 7v11H3V10Z"/><path d="M9 21v-8h6v8"/>',
    briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c5 4 13 4 18 0m-9 0v5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    share: '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 3v13m0-13 4 4m-4-4-4 4"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    family: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20v-1a5 5 0 0 1 10 0v1M15 20v-1a4 4 0 0 1 6-3.4"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.arrow}</svg>`;
};
const number = (i) => String(i + 1).padStart(2, '0');
const external = 'target="_blank" rel="noopener noreferrer"';
const brand = `<span class="bca-text">BCA</span><span class="brand-caption">Beasiswa<br/><b>PPTI · PPBP</b></span>`;

// Arrow keys + Home/End, roving tabindex, focus tetap di tab terpilih.
function setupTabs(root, selector) {
  const tabs = [...root.querySelectorAll(selector)];
  const activate = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      root.querySelector(`#${tab.getAttribute('aria-controls')}`).hidden = i !== index;
    });
    if (focus) tabs[index].focus({ preventScroll: true });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', (event) => {
      const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      activate(keys[event.key], true);
      tabs[keys[event.key]].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    });
  });
  return activate;
}

export function createLanding(root, { onTour }) {
  root.innerHTML = `<div class="scholarship-site">
    <a class="skip-link" href="#main-content">Lewati ke konten</a>
    <div class="site-notice"><span>${icon('check')} Pendaftaran dan seleksi BCA tidak dipungut biaya.</span><span class="concept-label">Eksplorasi desain · Bukan situs resmi</span></div>
    <header class="site-header"><div class="site-wrap header-inner">
      <a class="site-brand" href="#beranda" aria-label="Beasiswa BCA — Beranda">${brand}</a>
      <nav id="main-nav" class="site-nav" aria-label="Navigasi utama"><a href="#cerita">Cerita kampus</a><a href="#manfaat">Manfaat</a><a href="#program">Program</a><a href="#lokasi-tes">Lokasi tes</a><a href="#kecocokan">Cek kelayakan</a><a href="#campus-tour">Kisah Awardee <span>360°</span></a><a href="#bukti">Galeri bukti</a><a href="#setelah-program">Setelah program</a><a href="#orang-tua">Orang tua</a><a href="#guru-bk">Guru BK</a><a href="#faq">FAQ</a><a class="mobile-apply-link" href="${scholarship.source}" ${external}>Daftar Sekarang ${icon('external')}<span class="sr-only"> (tab baru)</span></a></nav>
      <a class="site-button button-small header-apply" href="${scholarship.source}" ${external}><span class="header-apply-full">Daftar Sekarang</span><span class="header-apply-short">Daftar</span>${icon('external')}<span class="sr-only"> (tab baru)</span></a>
      <button class="mobile-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Buka navigasi">${icon('menu')}</button>
    </div><div class="reading-progress" aria-hidden="true"><i></i></div></header>
    <main id="main-content" tabindex="-1">
      <section class="scholarship-hero" id="beranda" aria-labelledby="hero-heading">
        <div class="site-wrap hero-shell">
          <div class="hero-copy">
            <p class="hero-overline"><span>BEASISWA BCA</span><span>ANGKATAN ${scholarship.year}</span></p>
            <a href="#pendaftaran" class="registration-badge"><span class="status-dot"></span><span>${registrationStatus()} · ${scholarship.year}</span>${icon('external')}</a>
            <h1 id="hero-heading">Teknologi<br/><span>atau</span> bisnis?</h1>
            <p>PPTI mendalami teknologi. PPBP berfokus pada bisnis dan perbankan. Pilih satu; foto dan rincian program ikut berubah.</p>
            <div class="hero-choices" role="group" aria-label="Pratinjau dua program beasiswa"><button type="button" class="hero-choice" data-hero-program="ppti" aria-pressed="false"><span>01 / TEKNOLOGI</span><strong>PPTI</strong><small>Teknik Informatika</small>${icon('arrow')}</button><button type="button" class="hero-choice" data-hero-program="ppbp" aria-pressed="false"><span>02 / BISNIS</span><strong>PPBP</strong><small>Bisnis &amp; Perbankan</small>${icon('arrow')}</button></div>
            <div class="hero-actions"><a class="site-button" href="#program" data-hero-detail>Bandingkan program ${icon('arrow')}</a><button class="hero-tour-link" type="button" data-tour>${icon('play')} Coba kisah awardee</button></div>
          </div>
          <div class="hero-visual" data-preview="overview">
            <div class="hero-photo-frame"><img class="hero-image hero-image--overview" src="/assets/photos/manuscript-building.webp" alt="" fetchpriority="high" decoding="async" width="1280" height="960"/><img class="hero-image hero-image--ppti" src="/assets/photos/students-study.webp" alt="" loading="lazy" decoding="async" width="1536" height="1024"/><img class="hero-image hero-image--ppbp" src="/assets/photos/students-project.webp" alt="" loading="lazy" decoding="async" width="1536" height="1024"/><div class="hero-photo-shade"></div><div class="hero-photo-stamp"><span data-hero-stamp-label>BCA LEARNING INSTITUTE</span><strong data-hero-stamp-title>The Manuscript</strong></div></div>
            <figure class="hero-mini-photo"><img src="/assets/photos/students-study.webp" alt="" loading="lazy" decoding="async" width="1536" height="1024"/><figcaption>MOMEN 01 / BELAJAR</figcaption></figure>
            <span class="hero-photo-index" aria-hidden="true">01<span>—</span>03</span>
            <span class="hero-vertical-note" data-hero-photo-note>FOTO LOKASI DARI PENGGUNA · KONSEP NONRESMI</span>
          </div>
        </div>
        <div class="site-wrap hero-bottom"><a class="scroll-cue" href="#cerita">Ikuti ceritanya <span>↓</span></a><span>BEASISWA BCA / PPTI &amp; PPBP</span></div>
      </section>
      <div class="site-wrap facts-strip" aria-label="Sekilas program"><div><strong>30 <small>bulan</small></strong><span>Belajar &amp; praktik langsung</span></div><div><strong>2 <small>program</small></strong><span>Pilih sesuai minatmu</span></div><div><strong>1 <small>langkah awal</small></strong><span>Untuk masa depan yang kamu pilih</span></div><a href="#program">Kenali beasiswanya ${icon('arrow')}</a></div>

      ${galleryMarkup()}

      <section class="site-section" id="manfaat" aria-labelledby="benefit-heading">
        <div class="site-wrap section-intro" data-reveal><div><p class="site-eyebrow">01 / BEKAL MASA DEPAN</p><h2 id="benefit-heading">Lebih dari beasiswa.<br/><span>Ruang untuk bertumbuh.</span></h2></div><p>Pendidikan yang membuka wawasan. Pengalaman yang membangun kesiapan. Dukungan yang membuatmu fokus pada hal terpenting: mengembangkan diri.</p></div>
        <div class="site-wrap benefit-grid">${[
          ['wallet', 'Fokus belajar,\ntanpa biaya pendidikan.', 'Dukungan biaya pendidikan dan uang saku bulanan selama program.', 'benefit-study-support.webp'],
          ['book', 'Bekal ilmu.\nBekal keterampilan.', 'Buku pelajaran, pembelajaran soft skill, serta fasilitas laptop khusus PPTI.', 'benefit-skills.webp'],
          ['home', 'Tempat belajar.\nTempat bertumbuh.', 'Fasilitas asrama dan makan siang mendukung keseharianmu.', 'benefit-residence.webp'],
          ['briefcase', 'Pengalaman nyata.\nPeluang berkarya.', 'On-the-job training dan kesempatan penawaran kerja, bukan jaminan penempatan.', 'benefit-work.webp'],
        ].map(([symbol, title, description, photo], i) => `<article class="benefit-item" data-reveal><h3 class="sr-only" id="benefit-title-${i}">${title.replace('\n', ' ')}</h3><button class="benefit-trigger" type="button" aria-pressed="false" aria-labelledby="benefit-title-${i}" aria-describedby="benefit-description-${i}"><span class="benefit-photo" aria-hidden="true"><img src="/assets/photos/${photo}" alt="" loading="lazy" decoding="async" width="1792" height="1024"/></span><span class="benefit-overlay" aria-hidden="true"></span><span class="benefit-content"><span class="benefit-icon">${icon(symbol)}<span>${number(i)}</span></span><span class="benefit-title">${title.replace('\n', '<br/>')}</span><span class="benefit-description" id="benefit-description-${i}">${description}</span><span class="benefit-hint"><span class="benefit-hint-off">SOROT ATAU KETUK UNTUK MELIHAT ↗</span><span class="benefit-hint-on">FOTO DIPILIH · KETUK LAGI UNTUK TUTUP ↗</span></span></span></button></article>`).join('')}</div>
        <p class="site-wrap benefit-photo-note">Foto merupakan ilustrasi konsep, bukan dokumentasi fasilitas atau peserta BCA.</p>
      </section>

      <section class="editorial-feature" aria-labelledby="feature-heading">
        <div class="editorial-feature-photo"><img src="/assets/photos/students-project.webp" alt="Ilustrasi mahasiswi menyampaikan ide proyek kepada rekan belajarnya" loading="lazy" decoding="async" width="1536" height="1024"/><span>FOTO ILUSTRATIF · BUKAN DOKUMENTASI BCA</span></div>
        <div class="editorial-feature-copy" data-reveal><p class="site-eyebrow">PENGALAMAN BELAJAR / 30 BULAN</p><h2 id="feature-heading">Dari kelas,<br/>ke <span>pengalaman nyata.</span></h2><p>Di PPTI dan PPBP, pembelajaran di kelas dilengkapi on-the-job training di unit kerja BCA. Kenali jalurnya, lalu pilih yang sesuai dengan minatmu.</p><a class="feature-link" href="#program">Bandingkan PPTI &amp; PPBP ${icon('arrow')}</a><small>Kesempatan penawaran kerja setelah lulus mengikuti kebutuhan perusahaan, bukan jaminan penempatan.</small></div>
      </section>

      <section class="site-section program-section" id="program" aria-labelledby="program-heading"><div class="site-wrap">
        <div class="section-intro" data-reveal><div><p class="site-eyebrow">02 / PILIH JALURMU</p><h2 id="program-heading">Beda minat.<br/><span>Sama-sama melesat.</span></h2></div><p>Teknologi atau bisnis? Kenali kedua program, lalu temukan jalur yang paling dekat dengan rasa ingin tahumu.</p></div>
        <div class="program-tabs" role="tablist" aria-label="Pilih program beasiswa">${programs.map((p, i) => `<button type="button" role="tab" id="tab-${p.id}" aria-controls="panel-${p.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span>${number(i)}</span><b>${p.acronym}</b><small>${p.category}</small>${icon('arrow')}</button>`).join('')}</div>
        ${programs.map((p, i) => `<div class="program-panel" role="tabpanel" id="panel-${p.id}" aria-labelledby="tab-${p.id}" tabindex="0" ${i ? 'hidden' : ''}><div class="program-panel-main"><div class="program-copy"><p class="site-eyebrow">${p.fullName}</p><h3>${p.title.replace('\n', '<br/>')}</h3><p>${p.description}</p><ul class="topic-tags">${p.topics.map(t => `<li>${t}</li>`).join('')}</ul><p class="program-audience">${p.audience}</p><a class="site-button" href="${p.url}" ${external}>Detail resmi ${p.acronym} ${icon('external')}<span class="sr-only"> (tab baru)</span></a></div>${programArt(p.id)}</div><div class="program-bottom"><span>${icon('check')} 30 bulan pembelajaran</span><span>${icon('pin')} BLI, Sentul</span><span>${icon('briefcase')} On-the-job training</span></div></div>`).join('')}
        <details class="requirements"><summary><span>${icon('check')} Apa saja persyaratan utamanya?</span><span class="disclosure-plus" aria-hidden="true">+</span></summary><div><ul><li>Warga Negara Indonesia; usia maksimal 19 tahun saat mendaftar.</li><li>Rata-rata rapor, Matematika, dan nilai penjurusan kelas X–XII minimal 75,00, sesuai ketentuan program.</li><li>Memiliki kemampuan bahasa Inggris dasar dan tidak pernah tinggal kelas.</li><li>Tidak pernah terlibat narkoba atau pelanggaran hukum lainnya; mengikuti dan lulus proses seleksi.</li></ul><p>Ini ringkasan, bukan pemeriksaan kelayakan. Ketentuan jurusan, pengisian nilai, dokumen, dan pembaruan periode harus dicek di <a href="${scholarship.source}" ${external}>portal resmi BCA ↗</a>.</p></div></details>
      </div></section>

      <section class="site-section cities-section" id="lokasi-tes" aria-labelledby="cities-heading"><div class="site-wrap">
        <div class="section-intro" data-reveal><div><p class="site-eyebrow">LOKASI TES · TANPA PERLU AKUN</p><h2 id="cities-heading">Tesnya bisa<br/><span>dekat dari rumah.</span></h2></div><p>Salah satu pertanyaan pertama: “saya tesnya di mana?”. Cari kotamu di sini dulu, tanpa membuat akun.</p></div>
        <div class="city-finder" data-reveal>
          <div class="city-controls">
            <label class="city-search">${icon('search')}<span class="sr-only">Cari kota atau wilayah lokasi tes</span><input type="search" id="city-search" placeholder="Cari kota atau wilayah…" autocomplete="off" spellcheck="false"/></label>
            <div class="city-filters" role="group" aria-label="Saring menurut program">
              <button type="button" data-program="all" aria-pressed="true">Semua</button>
              <button type="button" data-program="ppti" aria-pressed="false">PPTI</button>
              <button type="button" data-program="ppbp" aria-pressed="false">PPBP</button>
            </div>
          </div>
          <p class="city-count" role="status" aria-live="polite"></p>
          <div class="city-results"></div>
          <p class="city-note">${icon('pin')} Dicatat dari halaman resmi PPTI &amp; PPBP pada ${scholarship.verified}. Jadwal, alamat, dan konfirmasi lokasi final mengikuti undangan tes dari BCA.</p>
        </div>
      </div></section>

      <section class="site-section fit-section" id="kecocokan" aria-labelledby="fit-heading"><div class="site-wrap">
        <div class="section-intro" data-reveal><div><p class="site-eyebrow">CEK KELAYAKAN SENDIRI</p><h2 id="fit-heading">Sebelum mendaftar,<br/><span>cek dulu kecocokannya.</span></h2></div><p>Enam pernyataan singkat dari persyaratan resmi. Jawabanmu tidak dikirim ke mana pun dan tidak memengaruhi seleksi.</p></div>
        <div class="fit-layout">
          <form class="fit-form" data-reveal>${eligibilityQuestions.map((q, i) => `<fieldset class="fit-item"><legend><b>${number(i)}</b><span>${q.text}</span></legend><p class="fit-hint">${q.hint}</p><div class="fit-choices"><label><input type="radio" name="${q.id}" value="ya"/><span>Ya</span></label><label><input type="radio" name="${q.id}" value="tidak"/><span>Belum</span></label></div></fieldset>`).join('')}
            <button class="fit-reset" type="reset">Ulangi jawaban</button>
          </form>
          <aside class="fit-result" data-reveal><div class="fit-result-card" role="status" aria-live="polite"><span class="fit-progress"><i></i></span><p class="fit-status">Terjawab 0 dari ${eligibilityQuestions.length}</p><h3>Hasilnya muncul di sini</h3><p class="fit-text">Jawab semua pernyataan untuk melihat hasilnya.</p><ul class="fit-blockers"></ul><a class="site-button fit-cta" href="${scholarship.source}" ${external} hidden>Lanjut ke pendaftaran resmi ${icon('external')}<span class="sr-only"> (tab baru)</span></a></div><p class="fit-privacy">${icon('check')} Hasil hanya tampil di perangkatmu. Tidak ada data yang disimpan atau dikirim.</p></aside>
        </div>
      </div></section>

      <section class="site-section tour-section" id="campus-tour" aria-labelledby="tour-heading"><div class="site-wrap tour-card">
        <div class="tour-copy" data-reveal><p class="site-eyebrow">03 / WHAT IF I WERE AN AWARDEE?</p><h2 id="tour-heading">Bagaimana jika<br/><span>kamu jadi awardee?</span></h2><p>Mulai dari The Manuscript, masuk ke ruang kelas, lalu nikmati jeda di depan kelas dalam 360°. Pilihanmu akan membentuk sisa perjalanan.</p><button class="site-button button-white" type="button" data-tour>${icon('play')} Mulai ceritanya</button><p class="tour-meta">2 chapter <span>·</span> Foto 360° <span>·</span> Tanpa perlu akun</p><small class="tour-disclaimer">Foto lokasi berasal dari materi pengguna. Beberapa adegan masih visual pengganti; ini bukan situs resmi BCA.</small></div>
        <div class="tour-preview"><div class="tour-preview-heading"><span>${icon('pin')} BCA Learning Institute</span><b>360°</b></div><img class="tour-preview-photo" src="/assets/360/kelas.jpg" alt="Panorama ruang kelas dengan meja komputer dan layar presentasi" loading="lazy" decoding="async" width="1280" height="640"/><button class="tour-play" type="button" data-tour aria-label="Mulai cerita interaktif awardee PPTI dan PPBP">${icon('play')}</button><div class="tour-preview-footer"><span><i></i> KELAS &amp; AREA BREAK</span><span>Geser. Temukan. Jelajahi.</span></div></div>
      </div></section>

      <section class="site-section evidence-section" id="bukti" aria-labelledby="evidence-heading"><div class="site-wrap">
        <div class="section-intro" data-reveal><div><p class="site-eyebrow">GALERI BUKTI · PESERTA &amp; ALUMNI</p><h2 id="evidence-heading">Bukan klaim.<br/><span>Ini yang dijalani.</span></h2></div><p>Kalau kamu tidak punya kakak kelas atau alumni untuk ditanyai, mulailah dari sini: kegiatan, kehidupan di BLI, sampai perjalanan setelah lulus.</p></div>
        <div class="evidence-filters" role="group" aria-label="Saring jenis bukti" data-reveal>${evidenceCategories.map((c, i) => `<button type="button" data-evidence="${c.id}" aria-pressed="${i === 0}">${c.label}${c.id === 'semua' ? '' : `<span>${countEvidence().find(x => x.id === c.id)?.total ?? 0}</span>`}</button>`).join('')}</div>
        <p class="evidence-count" role="status" aria-live="polite"></p>
        <div class="evidence-grid"></div>
        <p class="evidence-note">${icon('check')} Foto kegiatan berasal dari dokumentasi pribadi pengguna. <b>Narasi di tiap kartu masih contoh struktur</b>, bukan testimoni resmi — ganti dengan cerita peserta dan alumni asli yang sudah memberi izin, lengkap dengan nama dan angkatannya.</p>
      </div></section>

      <section class="site-section after-section" id="setelah-program" aria-labelledby="after-heading"><div class="site-wrap">
        <div class="section-intro" data-reveal><div><p class="site-eyebrow">SETELAH PROGRAM</p><h2 id="after-heading">Apa yang terjadi<br/><span>setelah 30 bulan?</span></h2></div><p>Bagian ini sengaja ditulis apa adanya, termasuk hal yang perlu kamu pertimbangkan sebelum memutuskan.</p></div>
        <div class="after-grid">
          <div class="after-facts">${afterProgram.facts.map(([title, text], i) => `<article data-reveal><span class="after-index">${number(i)}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
          <aside class="after-tradeoffs" data-reveal><h3>Yang perlu dipertimbangkan</h3><ul>${afterProgram.tradeoffs.map(item => `<li>${item}</li>`).join('')}</ul><p>Bukan untuk menakuti, tetapi supaya keputusanmu berdasar informasi yang utuh.</p></aside>
        </div>
      </div></section>

      <section class="site-section parent-section" id="orang-tua" aria-labelledby="parent-heading"><div class="site-wrap parent-card">
        <div class="parent-copy" data-reveal><p class="site-eyebrow">${icon('family')} UNTUK ORANG TUA &amp; WALI</p><h2 id="parent-heading">Biar keluarga<br/><span>ikut paham.</span></h2><p>Keputusan sebesar ini jarang diambil sendirian. Ringkasan berikut bisa langsung kamu bagikan, tanpa perlu membuat akun.</p>
          <div class="parent-actions"><button class="site-button button-white" type="button" data-parent-share>${icon('share')} Bagikan ringkasan</button><button class="site-button button-ghost" type="button" data-parent-copy>${icon('copy')} Salin teks</button></div>
          <p class="parent-feedback" role="status" aria-live="polite"></p>
        </div>
        <div class="parent-facts" data-reveal>${parentFacts.map(([q, a]) => `<div class="parent-fact"><h3>${q}</h3><p>${a}</p></div>`).join('')}<a class="text-link" href="${scholarship.source}" ${external}>Halaman resmi Beasiswa BCA ${icon('external')}</a></div>
      </div></section>

      <section class="site-section bk-section" id="guru-bk" aria-labelledby="bk-heading"><div class="site-wrap">
        <div class="section-intro" data-reveal><div><p class="site-eyebrow">UNTUK GURU BK &amp; SEKOLAH</p><h2 id="bk-heading">Satu lembar,<br/><span>untuk satu sekolah.</span></h2></div><p>Di sekolah yang belum punya alumni, guru BK sering jadi sumber informasi pertama. Siapkan bahannya di sini, cetak, lalu bagikan ke kelas.</p></div>
        <div class="bk-layout">
          <div class="bk-points" data-reveal>${bkKit.points.map(([title, text], i) => `<article><span class="bk-index">${number(i)}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
          <div class="bk-tool" data-reveal>
            <label class="bk-field" for="bk-school">Nama sekolah<input id="bk-school" type="text" placeholder="Contoh: SMAN 1 Kupang" autocomplete="organization" maxlength="60"/></label>
            <p class="bk-hint">Kode unik dibuat otomatis supaya BCA bisa melihat sekolah mana yang benar-benar menghasilkan pendaftar. Nama sekolah tidak dikirim ke mana pun dari halaman ini.</p>
            <div class="bk-output" aria-live="polite">
              <div class="bk-code"><span>Kode sekolah</span><b data-bk-code>—</b></div>
              <div class="bk-qr" data-bk-qr><p class="bk-qr-empty">Kode QR muncul setelah nama sekolah diisi.</p></div>
              <p class="bk-link" data-bk-link></p>
            </div>
            <div class="bk-actions"><button class="site-button" type="button" data-bk-print>${icon('book')} Cetak satu lembar</button><button class="site-button button-ghost-blue" type="button" data-bk-copy>${icon('copy')} Salin teks info</button></div>
            <p class="bk-feedback" role="status" aria-live="polite"></p>
          </div>
        </div>
        <div class="bk-agenda" data-reveal><h3>Urutan 5 menit saat sesi bimbingan</h3><ol>${bkKit.agenda.map(item => `<li>${item}</li>`).join('')}</ol></div>
      </div></section>

      <section class="site-section process-section" id="alur" aria-labelledby="process-heading"><div class="site-wrap"><div class="section-intro" data-reveal><div><p class="site-eyebrow">04 / LANGKAH DEMI LANGKAH</p><h2 id="process-heading">Perjalanan besar,<br/><span>dimulai dari persiapan.</span></h2></div><p>Klik setiap tahap untuk melihat tips persiapannya. Jadwal dan instruksi final mengikuti informasi resmi BCA.</p></div>
        <div class="selection-tabs" role="tablist" aria-label="Tahapan seleksi">${selectionSteps.map(([title], i) => `<button role="tab" type="button" id="step-${i}" aria-controls="step-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span>${number(i)}</span><b>${title}</b></button>`).join('')}</div>
        ${selectionSteps.map(([title, heading, text], i) => `<div class="selection-panel" id="step-panel-${i}" role="tabpanel" aria-labelledby="step-${i}" tabindex="0" ${i ? 'hidden' : ''}><span class="step-large" aria-hidden="true">${number(i)}</span><div><p class="site-eyebrow">${title}</p><h3>${heading}</h3><p>${text}</p></div><span class="step-count">${number(i)} / 07</span></div>`).join('')}
        <p class="source-note">Urutan berdasarkan halaman detail program pada referensi September 2026. Tahapan dapat diperbarui oleh BCA.</p>
      </div></section>

      <section class="site-section faq-section" id="faq" aria-labelledby="faq-heading"><div class="site-wrap faq-layout"><div data-reveal><p class="site-eyebrow">05 / MASIH PENASARAN?</p><h2 id="faq-heading">Pertanyaanmu,<br/><span>terjawab di sini.</span></h2><p>Kenali dulu, baru tentukan langkahmu.</p><a class="text-link" href="${scholarship.source}" ${external}>Informasi lengkap di BCA ${icon('external')}</a></div><div class="faq-list">${questions.map(([q, a], i) => `<details name="scholarship-faq" ${i === 0 ? 'open' : ''}><summary>${q}<span class="disclosure-plus" aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div></div></section>

      <section class="apply-section" id="pendaftaran" aria-labelledby="apply-heading"><div class="site-wrap apply-layout"><div><p class="site-eyebrow">SEKARANG, GILIRANMU</p><h2 id="apply-heading">Satu langkah lebih dekat<br/><span>dengan masa depanmu.</span></h2><p>Periode tahun ajaran ${scholarship.year} · Batas pendaftaran ${scholarship.deadline}. Pastikan kembali jadwal di portal resmi.</p><a class="site-button" href="${scholarship.source}" ${external}>Buka pendaftaran resmi ${icon('external')}<span class="sr-only"> (tab baru)</span></a></div><div class="preparation-card"><div class="preparation-heading"><h3>Sebelum melangkah</h3><span class="checklist-count" role="status" aria-live="polite">0/3 siap</span></div><p>Checklist kecil untuk persiapanmu.</p>${['Sudah membandingkan PPTI dan PPBP', 'Sudah membaca persyaratan lengkap', 'Sudah menyiapkan informasi nilai rapor'].map((item, i) => `<label class="preparation-item"><input type="checkbox" name="preparation-${i}"/><span>${item}</span></label>`).join('')}<small>Checklist hanya untukmu, tidak dikirim atau disimpan.</small></div></div></section>
    </main>
    <footer class="site-footer"><div class="site-wrap"><div class="footer-top"><a class="site-brand" href="#beranda" aria-label="Kembali ke beranda Beasiswa BCA">${brand}</a><p>Belajar. Bertumbuh. Melangkah bersama.</p><a class="back-top" href="#beranda" aria-label="Kembali ke atas">↑</a></div><div class="footer-bottom"><p>Konsep redesign Beasiswa BCA · Bukan situs resmi.<br/>BCA adalah merek milik PT Bank Central Asia Tbk.</p><p>Informasi dicek ${scholarship.verified}.<br/><a href="${scholarship.source}" ${external}>Sumber: portal Beasiswa BCA ↗</a></p></div></div></footer>
  </div>`;

  const activateProgram = setupTabs(root, '.program-tabs [role="tab"]');
  setupTabs(root, '.selection-tabs [role="tab"]');
  const heroVisual = root.querySelector('.hero-visual');
  const heroChoices = [...root.querySelectorAll('[data-hero-program]')];
  const heroDetail = root.querySelector('[data-hero-detail]');
  const heroLabels = {
    overview: ['BCA LEARNING INSTITUTE', 'The Manuscript', 'Bandingkan program', 'FOTO LOKASI DARI PENGGUNA · KONSEP NONRESMI'],
    ppti: ['01 / TEKNOLOGI', 'Kenali PPTI', 'Lihat detail PPTI', 'FOTO ILUSTRATIF · BUKAN DOKUMENTASI BCA'],
    ppbp: ['02 / BISNIS', 'Kenali PPBP', 'Lihat detail PPBP', 'FOTO ILUSTRATIF · BUKAN DOKUMENTASI BCA'],
  };
  let selectedHero = null;
  const previewHero = id => {
    const [label, title, action, photoNote] = heroLabels[id || 'overview'];
    heroVisual.dataset.preview = id || 'overview';
    heroVisual.querySelector('[data-hero-stamp-label]').textContent = label;
    heroVisual.querySelector('[data-hero-stamp-title]').textContent = title;
    heroVisual.querySelector('[data-hero-photo-note]').textContent = photoNote;
    heroDetail.innerHTML = `${action} ${icon('arrow')}`;
  };
  heroChoices.forEach(choice => {
    const id = choice.dataset.heroProgram;
    choice.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') previewHero(id); });
    choice.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') previewHero(selectedHero); });
    choice.addEventListener('focus', () => previewHero(id));
    choice.addEventListener('blur', () => previewHero(selectedHero));
    choice.addEventListener('click', () => {
      selectedHero = selectedHero === id ? null : id;
      heroChoices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.heroProgram === selectedHero)));
      previewHero(selectedHero || (window.matchMedia('(hover: hover)').matches && choice.matches(':hover') ? id : null));
      if (selectedHero) activateProgram(selectedHero === 'ppti' ? 0 : 1);
    });
  });
  heroDetail.addEventListener('click', () => {
    const id = heroVisual.dataset.preview;
    if (id === 'ppti' || id === 'ppbp') activateProgram(id === 'ppti' ? 0 : 1);
  });

  const benefitButtons = [...root.querySelectorAll('.benefit-trigger')];
  benefitButtons.forEach(button => button.addEventListener('click', () => {
    const wasPressed = button.getAttribute('aria-pressed') === 'true';
    benefitButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button && !wasPressed)));
  }));
  root.querySelectorAll('[data-tour]').forEach(button => button.addEventListener('click', onTour));
  root.querySelectorAll('.preparation-item input').forEach(input => input.addEventListener('change', () => {
    const checked = root.querySelectorAll('.preparation-item input:checked').length;
    root.querySelector('.checklist-count').textContent = `${checked}/3 siap`;
  }));

  /* ------------------------- pencarian lokasi tes ------------------------- */
  const citySearch = root.querySelector('#city-search');
  const cityResults = root.querySelector('.city-results');
  const cityCount = root.querySelector('.city-count');
  const cityFilters = [...root.querySelectorAll('.city-filters button')];
  let cityProgram = 'all';
  const renderCities = () => {
    const matches = filterCities(citySearch.value, cityProgram);
    const groups = groupByRegion(matches);
    const programLabel = cityProgram === 'all' ? 'PPTI & PPBP' : cityProgram.toUpperCase();
    cityCount.textContent = matches.length
      ? `${matches.length} kota tes untuk ${programLabel}${citySearch.value.trim() ? ` cocok dengan “${citySearch.value.trim()}”` : ''}.`
      : `Kota “${citySearch.value.trim()}” belum ada di daftar. Coba nama kota besar terdekat atau nama wilayahnya.`;
    cityResults.innerHTML = groups
      .map(({ region, cities }) => `<div class="city-group"><h3>${region} <span>${cities.length}</span></h3><ul>${cities
        .map(({ city, programs: list }) => `<li><span>${city}</span>${list.length === 1 ? `<b class="city-tag">${list[0].toUpperCase()} saja</b>` : ''}</li>`)
        .join('')}</ul></div>`)
      .join('');
  };
  citySearch.addEventListener('input', renderCities);
  cityFilters.forEach(button => button.addEventListener('click', () => {
    cityProgram = button.dataset.program;
    cityFilters.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    renderCities();
  }));
  renderCities();

  /* --------------------------- cek kelayakan ---------------------------- */
  const fitForm = root.querySelector('.fit-form');
  const fitCard = root.querySelector('.fit-result-card');
  const renderFit = () => {
    const answers = Object.fromEntries(new FormData(fitForm).entries());
    const result = evaluateEligibility(answers);
    fitCard.dataset.status = result.status;
    fitCard.querySelector('.fit-progress i').style.transform = `scaleX(${result.answered / result.total})`;
    fitCard.querySelector('.fit-status').textContent = `Terjawab ${result.answered} dari ${result.total}`;
    fitCard.querySelector('h3').textContent = result.headline;
    fitCard.querySelector('.fit-text').textContent = result.text;
    fitCard.querySelector('.fit-blockers').innerHTML = result.blockers.map(item => `<li>${item}</li>`).join('');
    fitCard.querySelector('.fit-cta').hidden = result.status !== 'fit';
  };
  fitForm.addEventListener('change', renderFit);
  fitForm.addEventListener('reset', () => setTimeout(renderFit));
  renderFit();

  /* ------------------------- ringkasan orang tua ------------------------- */
  const parentFeedback = root.querySelector('.parent-feedback');
  const say = (message) => { parentFeedback.textContent = message; };
  root.querySelector('[data-parent-share]').addEventListener('click', async () => {
    const text = parentSummaryText();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Beasiswa BCA PPTI & PPBP', text, url: scholarship.source });
        say('Ringkasan dibagikan.');
        return;
      }
      await navigator.clipboard.writeText(text);
      say('Browser ini belum mendukung berbagi langsung, jadi ringkasannya sudah disalin.');
    } catch (error) {
      if (error?.name !== 'AbortError') say('Berbagi gagal. Gunakan tombol “Salin teks”, lalu tempel di WhatsApp.');
    }
  });
  root.querySelector('[data-parent-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(parentSummaryText());
      say('Ringkasan tersalin. Tinggal tempel di chat keluarga.');
    } catch {
      say('Penyalinan diblokir browser. Pilih teks di kartu sebelah, lalu salin manual.');
    }
  });

  /* --------------------------- galeri bukti --------------------------- */
  const evidenceGrid = root.querySelector('.evidence-grid');
  const evidenceCount = root.querySelector('.evidence-count');
  const evidenceButtons = [...root.querySelectorAll('[data-evidence]')];
  const renderEvidence = (category) => {
    const items = filterEvidence(category);
    const label = evidenceCategories.find(c => c.id === category)?.label ?? 'Semua bukti';
    evidenceCount.textContent = `${items.length} dari ${evidenceItems.length} bukti · ${label}`;
    evidenceGrid.innerHTML = items
      .map(item => `<article class="evidence-card">
        <figure><img src="${item.photo}" alt="${item.alt}" loading="lazy" decoding="async" width="1536" height="1024"/>${item.sample ? '<figcaption>NARASI CONTOH</figcaption>' : ''}</figure>
        <div class="evidence-body">
          <p class="evidence-who">${item.who}</p>
          <h3>${item.title}</h3>
          <p class="evidence-activity">${item.activity}</p>
          <dl><dt>Yang dipelajari</dt><dd>${item.learned}</dd><dt>Kaitannya</dt><dd>${item.journey}</dd></dl>
        </div>
      </article>`)
      .join('');
  };
  evidenceButtons.forEach(button => button.addEventListener('click', () => {
    evidenceButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    renderEvidence(button.dataset.evidence);
  }));
  renderEvidence('semua');

  /* ------------------------------- BK kit ------------------------------- */
  const bkInput = root.querySelector('#bk-school');
  const bkCode = root.querySelector('[data-bk-code]');
  const bkQr = root.querySelector('[data-bk-qr]');
  const bkLink = root.querySelector('[data-bk-link]');
  const bkFeedback = root.querySelector('.bk-feedback');
  let bkState = { code: '', link: '', qr: '' };
  const renderBk = async () => {
    const code = schoolCode(bkInput.value);
    const link = code ? referralLink(code, location.origin + location.pathname) : '';
    bkState = { ...bkState, code, link };
    bkCode.textContent = code || '—';
    bkLink.textContent = link ? `Tautan: ${link}` : '';
    if (!code) {
      bkQr.innerHTML = '<p class="bk-qr-empty">Kode QR muncul setelah nama sekolah diisi.</p>';
      bkState.qr = '';
      return;
    }
    try {
      // qrcode hanya diunduh saat fitur ini dipakai.
      const { default: QRCode } = await import('qrcode');
      bkState.qr = await QRCode.toDataURL(link, { margin: 1, width: 320, color: { dark: '#00336e', light: '#ffffff' } });
      if (schoolCode(bkInput.value) !== code) return; // input sudah berubah
      bkQr.innerHTML = `<img src="${bkState.qr}" alt="Kode QR menuju halaman beasiswa dengan kode sekolah ${code}" width="160" height="160"/>`;
    } catch {
      bkQr.innerHTML = '<p class="bk-qr-empty">Kode QR gagal dibuat. Tautan di bawah tetap bisa dibagikan.</p>';
    }
  };
  bkInput.addEventListener('input', renderBk);
  renderBk();

  root.querySelector('[data-bk-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(bkSummaryText(bkState.code, bkState.link));
      bkFeedback.textContent = 'Teks info tersalin. Tinggal tempel di grup sekolah.';
    } catch {
      bkFeedback.textContent = 'Penyalinan diblokir browser. Gunakan tombol cetak, atau salin manual dari lembar cetak.';
    }
  });

  root.querySelector('[data-bk-print]').addEventListener('click', () => {
    const school = bkInput.value.trim() || 'Sekolahmu';
    const sheet = document.createElement('div');
    sheet.className = 'bk-print-sheet';
    sheet.innerHTML = `
      <header><div><p>BEASISWA BCA · PPTI &amp; PPBP</p><h1>Informasi untuk siswa ${school}</h1></div>${bkState.qr ? `<img src="${bkState.qr}" alt="Kode QR halaman beasiswa untuk ${school}" width="120" height="120"/>` : ''}</header>
      <section><h2>Apa ini?</h2><p>Beasiswa pendidikan dari BCA untuk lulusan SMA/SMK. Program 30 bulan di BCA Learning Institute, Sentul: belajar di kelas sekaligus praktik kerja. Non-gelar dan tanpa ikatan dinas.</p></section>
      <section><h2>Syarat utama</h2><ul>${eligibilityQuestions.map(q => `<li>${q.text.replace(/^Saya /, '')}</li>`).join('')}</ul></section>
      <section><h2>Periode</h2><p>Tahun ajaran ${scholarship.year} · batas pendaftaran ${scholarship.deadline}. Dicatat ${scholarship.verified}; pastikan kembali di portal resmi.</p></section>
      <section><h2>Tes di mana?</h2><p>${testCities.length} kota tes tersebar di ${groupByRegion().map(g => g.region).join(', ')}. Siswa tidak harus ke Jakarta.</p></section>
      <section><h2>Urutan 5 menit di kelas</h2><ol>${bkKit.agenda.map(item => `<li>${item}</li>`).join('')}</ol></section>
      <footer><p>Pendaftaran hanya melalui ${scholarship.source} — tidak ada pungutan biaya.</p>${bkState.code ? `<p>Kode sekolah: <b>${bkState.code}</b></p>` : ''}<p class="bk-print-note">Lembar konsep, bukan dokumen resmi BCA.</p></footer>`;
    document.body.append(sheet);
    const cleanup = () => { sheet.remove(); window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 1000);
  });

  // Kode referral dari QR: ditampilkan supaya mekanisme pelacakannya terlihat.
  const refCode = new URLSearchParams(location.search).get('ref');
  if (refCode) {
    bkFeedback.textContent = `Kunjungan ini membawa kode sekolah “${refCode}”. Di implementasi asli, kode inilah yang dicatat sebagai asal pendaftar.`;
  }

  // Foto yang belum tersedia diganti blok gradien + teks, bukan ikon rusak.
  root.addEventListener('error', (event) => {
    const img = event.target;
    if (img.tagName !== 'IMG' || img.dataset.fallback) return;
    img.dataset.fallback = 'true';
    const holder = document.createElement('span');
    holder.className = 'photo-missing';
    holder.textContent = img.alt || 'Foto menyusul';
    img.replaceWith(holder);
  }, true);

  const menu = root.querySelector('.mobile-toggle');
  const nav = root.querySelector('.site-nav');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Buka navigasi'); menu.innerHTML = icon('menu'); nav.classList.remove('is-open'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Tutup navigasi' : 'Buka navigasi');
    menu.innerHTML = icon(open ? 'close' : 'menu');
    nav.classList.toggle('is-open', open);
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
  });
  root.addEventListener('click', event => {
    // The toggle replaces its SVG. composedPath retains the original header path
    // even when the clicked SVG node has already been detached.
    if (!event.composedPath().includes(root.querySelector('.site-header'))) closeMenu();
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateGallery = setupGallery(root.querySelector('#cerita'), reducedMotion);
  root.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    closeMenu();
    history.pushState(null, '', link.hash);
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  root.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

  const sections = [...root.querySelectorAll('main section[id]')];
  const navLinks = [...nav.querySelectorAll('a')];
  let frame = 0;
  const updateScroll = () => {
    frame = 0;
    if (root.hidden) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    root.querySelector('.reading-progress i').style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    const current = [...sections].reverse().find(section => section.getBoundingClientRect().top < 180)?.id;
    navLinks.forEach(link => { if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    updateGallery();
  };
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateScroll); }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  // Target hash belum ada saat browser pertama kali memuat HTML kosong.
  const restoreAnchor = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target && root.contains(target)) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  window.addEventListener('popstate', restoreAnchor);
  requestAnimationFrame(restoreAnchor);
}
