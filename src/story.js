// =============================================================================
//  STORY.JS: SEMUA ISI CERITA ADA DI SINI
//  Edit teks, urutan step, dan path foto/video/audio tanpa menyentuh engine.
//
//  FOTO 360: taruh file equirectangular 2:1 (mis. 4096×2048 .jpg) di public/assets/360/
//            lalu tulis  pano('/assets/360/nama.jpg')
//  Kalau file belum ada, otomatis diganti panorama placeholder (tetap jalan).
//  Semua foto diberi efek lukisan oleh shader (atur di bagian `art`).
//
//  ARAH KAMERA 360: view: { yaw, pitch, fov }  (derajat)
//    yaw 0 = tengah foto, + ke kanan, - ke kiri; pitch + ke atas; fov 40..95 (zoom)
//    Cari angkanya: buka  http://localhost:5190/?debug  lalu klik titik di foto -> lihat pojok kiri bawah.
//
//  Tipe interaksi: 'carousel' | 'hotspots' | 'choice' | 'race' | 'hold' | 'drag'
//  Alur bercabang: choice/race menyimpan flag -> step pakai  when: { flag, equals }
//  Notif CLAIMED: claim: { id, icon, label, kicker?, text? }  (di step / option / hotspot / chapter)
// =============================================================================

// Media 360 (equirectangular). kind placeholder: 'indoor' | 'outdoor'
const pano = (src, kind = 'indoor', palette) => ({ pano: src, placeholder: { kind, palette, seed: src } });
// Media foto biasa (bukan 360). kind placeholder: 'room' | 'landscape' | 'table' | 'fabric'
// eslint-disable-next-line no-unused-vars
const photo = (image, kind = 'room', palette) => ({ image, placeholder: { kind, palette, seed: image } });
// Video 360 (mp4 equirectangular):  { pano: true, video: '/assets/360/x.mp4', placeholder: {...} }

const PAL = {
  kelas: ['#eef3f7', '#cfdbe4', '#8a6d52', '#0060af', '#1ba0e2'],
  makan: ['#f6efe6', '#e2d3bf', '#a57c55', '#d9534f', '#1ba0e2'],
  asrama: ['#eef2f5', '#d6e1ea', '#7c6048', '#00336e', '#1ba0e2'],
  publik: ['#f1f1ee', '#dcd7cc', '#6f5a45', '#0a7fc4', '#ffc20e'],
};

export default {
  meta: {
    title: 'Campus Tour 360° PPTI & PPBP',
    lang: 'id',
    loadingLabel: 'memuat',
    hint360: 'Geser layar untuk melihat sekeliling',
    brand: {
      // Logo resmi (PNG/SVG versi putih) -> public/assets/brand/logo.png
      // Kalau file tidak ada, dipakai wordmark teks.
      logo: '/assets/brand/logo.png',
      wordmark: 'BCA',
      title: 'Campus Tour 360°',
      subtitle: 'PPTI · PPBP',
      ariaLabel: 'Campus Tour 360 BCA Learning Institute',
    },
  },

  // Gaya lukisan + kamera 360 (lihat src/core/painter.js)
  art: {
    paint: 0.85, // 0 = foto asli, 1 = full lukisan
    brush: 2.2, // besar sapuan kuas (px)
    stroke: 0.4, // relief kuas 0..1
    scratch: 0.05,
    edge: 26, // tebal tepi kuas (px)
    edgeColor: '#0a4a9c', // biru BCA
    grade: 0.18, // duotone biru 0..0.5
    shadowTint: '#0a2a66',
    highlightTint: '#fff9f0',
    fov: 75,
    autoRotate: 1.2, // derajat/detik saat diam (0 = mati)
  },

  audio: {
    // Isi path mp3 kalau sudah ada; kosong = bunyi sintetis.
    sfx: { click: null, hover: null, whoosh: null, success: null },
  },

  /* ============================== PROLOG ================================ */
  intro: {
    gate: {
      media: pano('/assets/360/manuscript.jpg', 'outdoor'),
      view: { yaw: 0, pitch: 8, fov: 80 },
      cardLabel: 'Kartu Peserta',
      kicker: 'Selamat datang di',
      rows: ['CAMPUS', 'TOUR 360°'],
      kickerBottom: 'BCA Learning Institute',
      text: 'Jelajahi setiap sudut kampus dan claim semua benefitnya.',
      tags: ['PPTI', 'PPBP'],
      number: 'NO. 2026 · 360°',
      cta: 'Mulai jelajah',
      hint: 'Nyalakan suara untuk pengalaman terbaik.',
    },
    media: pano('/assets/360/manuscript.jpg', 'outdoor'),
    view: { yaw: 0, pitch: 4, fov: 70 },
    music: null, // '/assets/audio/track-intro.mp3'
    narration: { src: null, duration: 9 }, // src: '/assets/audio/vo-prolog.mp3'
    staggerSeconds: 8,
    lines: ['Di depan The Manuscript,', 'kita mulai perjalanan', 'dari pengenalan kampus', 'dan lingkungan belajar.'],
    skipLabel: 'Lewati intro',
  },

  chapters: [
    /* ======================= CHAPTER 01: KAMPUS ======================== */
    {
      id: 'kampus',
      label: 'Chapter 01',
      title: 'Lingkungan\nBelajar',
      theme: { card: '#0060af', card2: '#1ba0e2', glow: 'blue', waves: ['#7fd0f5', '#1ba0e2', '#0060af'] },
      cover: {
        media: pano('/assets/360/manuscript.jpg', 'outdoor'),
        view: { yaw: 20, pitch: 10, fov: 85 },
        rows: ['LINGKUNGAN', 'BELAJAR'],
        explore: 'Jelajahi',
      },
      music: null,
      nextLabel: 'Menuju asrama',

      book: {
        kicker: 'Buku saku',
        title: 'Kampus BLI',
        sections: [
          { type: 'p', text: '[Tulis pengenalan singkat kampus di sini.]' },
          { type: 'image', src: '/assets/foto/manuscript.jpg', caption: 'The Manuscript' },
          { type: 'caps', text: 'PPTI · PPBP' },
          { type: 'p', text: '[Cerita tentang lingkungan belajar, jadwal, atau budaya kampus.]' },
          { type: 'ornament' },
          {
            type: 'photos',
            items: [
              { src: '/assets/foto/kelas.jpg', caption: 'Ruang kelas' },
              { src: '/assets/foto/break.jpg', caption: 'Break di depan kelas' },
              { src: '/assets/foto/makan.jpg', caption: 'Area makan' },
            ],
          },
        ],
      },

      steps: [
        {
          id: 'manuscript',
          location: 'The Manuscript',
          media: pano('/assets/360/manuscript.jpg', 'outdoor'),
          view: { yaw: 0, pitch: 12, fov: 70 },
          narration: { cues: [{ t: 0, text: 'Ini The Manuscript, ikon kampus kita.' }, { t: 3.2, text: '[Tambahkan narasi tentang monumen ini.]' }] },
          intro: { rows: ['The Manuscript'], text: '[Deskripsi singkat monumen The Manuscript.]' },
          nextLabel: 'Masuk ke kelas',
        },
        {
          id: 'kelas',
          location: 'Ruang Kelas',
          media: pano('/assets/360/kelas.jpg', 'indoor', PAL.kelas),
          view: { yaw: 0, pitch: -4 },
          narration: { cues: [{ t: 0, text: 'Di ruang kelas inilah hari-hari belajar dimulai.' }] },
          intro: { rows: ['Ruang', 'Kelas'], text: '[Ceritakan suasana ruang kelas.]' },
        },
        {
          id: 'break-pagi',
          location: 'Depan Kelas',
          media: pano('/assets/360/depan-kelas.jpg', 'indoor', PAL.kelas),
          view: { yaw: 90, pitch: 0 },
          narration: { cues: [{ t: 0, text: 'Break pagi! Waktunya santai sebentar di depan kelas.' }] },
          intro: { rows: ['Break', 'Pagi'], text: '[Momen/case saat break pagi.]' },
          claim: { id: 'break-siang', icon: '☕', kicker: 'Notifikasi', label: 'Break Siang', text: 'Jadwal break siang sudah terbuka.' },
        },
        {
          id: 'benefit',
          location: 'Ruang Kelas',
          media: pano('/assets/360/kelas.jpg', 'indoor', PAL.kelas),
          view: { yaw: -30, pitch: -6 },
          narration: { cues: [{ t: 0, text: 'Kembali ke kelas: saatnya pembagian fasilitas belajar.' }] },
          intro: { rows: ['Fasilitas', 'Belajar'], text: 'Benefit untuk setiap peserta. Pilih programmu.', hold: 2.4 },
          interaction: {
            type: 'choice',
            prompt: 'Kamu peserta program apa?',
            flag: 'program',
            options: [
              {
                value: 'PPTI',
                label: 'PPTI',
                sub: 'Claim laptop',
                icon: '💻',
                color: '#0060af',
                claims: [{ id: 'laptop', icon: '💻', kicker: 'Benefit PPTI', label: 'Laptop', text: 'Fasilitas belajar untuk peserta PPTI.' }],
              },
              {
                value: 'PPBP',
                label: 'PPBP',
                sub: 'Claim kalkulator',
                icon: '🧮',
                color: '#0a86cc',
                claims: [{ id: 'kalkulator', icon: '🧮', kicker: 'Benefit PPBP', label: 'Kalkulator', text: 'Fasilitas belajar untuk peserta PPBP.' }],
              },
            ],
          },
          // semua peserta juga dapat almamater
          claim: { id: 'almamater', icon: '🎓', kicker: 'Identitas kampus', label: 'Almamater', text: 'Identitas resmi sebagai bagian dari kampus.' },
          result: { kicker: 'Benefit sudah di tangan', title: 'Siap belajar!' },
        },
        {
          id: 'war-makan',
          location: 'Area Makan',
          media: pano('/assets/360/area-makan.jpg', 'indoor', PAL.makan),
          view: { yaw: 0, pitch: -8 },
          narration: { cues: [{ t: 0, text: 'Break siang tiba. Stall favorit cepat penuh!' }] },
          intro: { rows: ['War', 'Makan Siang'], text: 'Tekan tombol (atau Spasi) secepatnya untuk rebutan stall.', hold: 2.4 },
          interaction: {
            type: 'race',
            prompt: 'Rebutan antrean stall!',
            flag: 'makan',
            youLabel: 'Kamu',
            rivalLabel: 'Antrean lain',
            tapLabel: 'tap tap tap tap',
            icon: '🍜',
            target: 28,
            rivalRate: 5,
            timeLimit: 8,
            win: { value: 'stall', kicker: 'Kamu menang!', title: 'Dapat stall', text: 'Sekalian intip kondisi di sebelahnya.' },
            lose: { value: 'buffet', kicker: 'Yah, kalah cepat.', title: 'Ke buffet', text: '[Cerita saat makan di buffet.]' },
          },
          skipLabel: 'Lewati (anggap kalah)',
        },
        {
          id: 'stall',
          when: { flag: 'makan', equals: 'stall' },
          location: 'Stall',
          media: pano('/assets/360/stall.jpg', 'indoor', PAL.makan),
          view: { yaw: -30, pitch: -5 },
          intro: { rows: ['Stall'], text: 'Karena menang, kamu bisa cek sebelahnya juga. Putar kamera!', hold: 2 },
          interaction: {
            type: 'hotspots',
            prompt: 'Intip sekitar',
            spots: [
              { yaw: -30, pitch: -8, label: 'Stall', title: 'Stall', text: '[Menu/cerita di stall.]' },
              { yaw: 70, pitch: -6, label: 'Sebelah', title: 'Buffet sebelah', text: '[Kondisi buffet di sebelah.]' },
            ],
          },
        },
        {
          id: 'buffet',
          when: { flag: 'makan', equals: 'buffet' },
          location: 'Buffet',
          media: pano('/assets/360/buffet.jpg', 'indoor', PAL.makan),
          view: { yaw: 0, pitch: -6 },
          intro: { rows: ['Buffet'], text: '[Deskripsi buffet.]' },
        },
        {
          id: 'kelas-lagi',
          location: 'Ruang Kelas',
          media: pano('/assets/360/kelas.jpg', 'indoor', PAL.kelas),
          view: { yaw: 150, pitch: -2 },
          narration: { cues: [{ t: 0, text: 'Kelas berlanjut. Lalu obrolan beralih ke tempat istirahat…' }] },
          intro: { rows: ['Kembali', 'ke Kelas'], text: 'Setelah kelas, di mana kita beristirahat?' },
        },
      ],
    },

    /* ======================= CHAPTER 02: ASRAMA ======================== */
    {
      id: 'asrama',
      label: 'Chapter 02',
      title: 'Asrama',
      theme: { card: '#0a4a9c', card2: '#38b6f0', glow: 'blue', waves: ['#1ba0e2', '#0060af', '#00336e'] },
      cover: {
        media: pano('/assets/360/depan-asrama.jpg', 'outdoor', ['#6fb3e6', '#d7ebf7', '#7d9a6a', '#e9eef2', '#00336e']),
        view: { yaw: 0, pitch: 12, fov: 85 },
        rows: ['ASRAMA'],
        explore: 'Masuk',
      },
      music: null,
      nextLabel: 'Menuju akhir',

      book: {
        kicker: 'Buku saku',
        title: 'Asrama',
        sections: [
          { type: 'image', src: '/assets/foto/depan-asrama.jpg', caption: 'Depan asrama' },
          { type: 'p', text: '[Pengenalan asrama.]' },
          { type: 'caps', text: 'Fasilitas' },
          { type: 'list', items: ['Kamar', 'Ruang serba guna', 'Dapur', 'UKS', 'Musola', 'Plaza', 'Theater', 'Komunal 1, 2, 3, 5', 'Co-working space'] },
        ],
      },

      steps: [
        {
          id: 'kamar',
          location: 'Kamar',
          media: pano('/assets/360/kamar.jpg', 'indoor', PAL.asrama),
          view: { yaw: 0, pitch: -5 },
          narration: { cues: [{ t: 0, text: 'Mulai dari kamar, tempatmu beristirahat setiap hari.' }] },
          intro: { rows: ['Fasilitas', 'Kamar'], text: 'Lihat apa saja yang ada di kamar.', hold: 2.2 },
          interaction: {
            type: 'carousel',
            unlockAfter: 2,
            items: [
              // view: kamera berputar ke fasilitas yang sedang dibahas
              { title: 'Fasilitas 1', text: '[Ganti dengan fasilitas kamar asli.]', view: { yaw: -45, pitch: -10 } },
              { title: 'Fasilitas 2', text: '[Ganti dengan fasilitas kamar asli.]', view: { yaw: 45, pitch: -8 } },
              { title: 'Fasilitas 3', text: '[Ganti dengan fasilitas kamar asli.]', view: { yaw: 135, pitch: -5 } },
            ],
          },
        },
        {
          id: 'serba-guna',
          location: 'Ruang Serba Guna',
          media: pano('/assets/360/serba-guna.jpg', 'indoor', PAL.publik),
          view: { yaw: -45, pitch: -2 },
          narration: { cues: [{ t: 0, text: 'Ini ruang publik: ruang serba guna. Putar kamera dan perhatikan sekitarnya.' }] },
          intro: { rows: ['Ruang', 'Serba Guna'], text: 'Ada fasilitas penting di dekatnya. Temukan semuanya.', hold: 2.4 },
          interaction: {
            type: 'hotspots',
            prompt: 'Temukan di sekitar ruang serba guna',
            spots: [
              { yaw: -45, pitch: -6, label: 'Dapur', title: 'Dapur', text: 'Dapur ada di dekat ruang serba guna. [Detail]' },
              { yaw: 45, pitch: -4, label: 'UKS', title: 'UKS', text: '[Detail UKS.]' },
              { yaw: 135, pitch: -6, label: 'Musola', title: 'Musola', text: '[Detail musola.]' },
            ],
          },
        },
        {
          id: 'plaza',
          location: 'Plaza',
          media: pano('/assets/360/plaza.jpg', 'outdoor', ['#7cbbe8', '#e1f0f8', '#8fa979', '#eceff1', '#0060af']),
          view: { yaw: 0, pitch: 6, fov: 85 },
          narration: { cues: [{ t: 0, text: 'Plaza, tempat berkumpul di ruang terbuka.' }] },
          intro: { rows: ['Plaza'], text: '[Deskripsi plaza.]' },
        },
        {
          id: 'theater',
          location: 'Theater',
          media: pano('/assets/360/theater.jpg', 'indoor', ['#2a2f3a', '#3b4250', '#40332a', '#0060af', '#ffc20e']),
          view: { yaw: 0, pitch: 0 },
          narration: { cues: [{ t: 0, text: 'Theater. Tahan tombolnya untuk menyalakan panggung.' }] },
          intro: { rows: ['Theater'], text: '[Deskripsi theater.]', hold: 2 },
          // progres tahan -> kamera zoom (fov mengecil)
          interaction: { type: 'hold', label: 'tahan untuk menyalakan', icon: '🎬', duration: 2.2 },
          result: { kicker: 'Lampu menyala', title: 'Showtime!' },
        },
        {
          id: 'komunal',
          location: 'Ruang Komunal',
          media: pano('/assets/360/komunal-1.jpg', 'indoor', PAL.asrama),
          narration: { cues: [{ t: 0, text: 'Ada beberapa ruang komunal. Lihat satu per satu.' }] },
          intro: { rows: ['Ruang', 'Komunal'], text: 'Geser kartu untuk melihat Komunal 1, 2, 3, dan 5.', hold: 2.2 },
          interaction: {
            type: 'carousel',
            unlockAfter: 4,
            items: [
              { title: 'Komunal 1', text: '[Deskripsi.]', media: pano('/assets/360/komunal-1.jpg', 'indoor', PAL.asrama), view: { yaw: 0 } },
              { title: 'Komunal 2', text: '[Deskripsi.]', media: pano('/assets/360/komunal-2.jpg', 'indoor', PAL.publik), view: { yaw: 90 } },
              { title: 'Komunal 3', text: '[Deskripsi.]', media: pano('/assets/360/komunal-3.jpg', 'indoor', PAL.kelas), view: { yaw: -90 } },
              { title: 'Komunal 5', text: '[Deskripsi.]', media: pano('/assets/360/komunal-5.jpg', 'indoor', PAL.makan), view: { yaw: 180 } },
            ],
          },
        },
        {
          id: 'coworking',
          location: 'Co-working Space',
          media: pano('/assets/360/coworking.jpg', 'indoor', PAL.kelas),
          view: { yaw: 20, pitch: -4 },
          narration: { cues: [{ t: 0, text: 'Terakhir, co-working space untuk belajar bareng.' }] },
          intro: { rows: ['Co-working', 'Space'], text: 'Geser kartu akses mengikuti jalurnya.', hold: 2.2 },
          interaction: { type: 'drag', label: 'geser kartu akses', icon: '💳', path: [[22, 70], [40, 62], [60, 66], [78, 56]] },
          claim: { id: 'asrama', icon: '🏠', kicker: 'Fasilitas didapat', label: 'Asrama', text: 'Selamat datang di rumah keduamu.' },
          result: { kicker: 'Akses diterima', title: 'Welcome home!' },
        },
      ],
    },
  ],

  /* ============================== PENUTUP ================================ */
  outro: {
    theme: { waves: ['#7fd0f5', '#1ba0e2', '#00336e'] },
    transitionKicker: 'Penutup',
    transitionTitle: 'Sampai jumpa',
    media: pano('/assets/360/depan-asrama.jpg', 'outdoor', ['#6fb3e6', '#d7ebf7', '#7d9a6a', '#e9eef2', '#00336e']),
    view: { yaw: 180, pitch: 10, fov: 80 },
    music: null,
    narration: { src: null, duration: 9 },
    staggerSeconds: 8,
    lines: ['Dari The Manuscript sampai asrama,', 'kamu sudah melihat tempat', 'di mana perjalanan PPTI & PPBP dimulai.', 'Sampai jumpa di kampus!'],
    holdAfter: 1.5,
    final: {
      cardLabel: 'Tur selesai',
      kicker: 'Terima kasih',
      rows: ['SAMPAI', 'JUMPA'],
      kickerBottom: 'di BCA Learning Institute',
      tags: ['PPTI', 'PPBP'],
      number: 'NO. 2026 · 360°',
      claimsLabel: 'Dompet benefit kamu',
      replayLabel: 'Ulangi perjalanan',
      link: null, // { label: 'Info Beasiswa BCA', href: 'https://...' }
    },
  },
};
