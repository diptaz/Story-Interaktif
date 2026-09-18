// Pilar TUNJUKKAN (galeri bukti) & SEBARKAN (BK kit) dari proposal.
//
// PENTING: seluruh kartu di bawah adalah CONTOH STRUKTUR, bukan dokumentasi atau
// testimoni asli. Ganti dengan cerita peserta/alumni yang sudah memberi izin,
// lengkap dengan nama, angkatan, dan foto milik sendiri sebelum dipublikasikan.
import { scholarship } from './landing-content.js';

export const evidenceCategories = [
  { id: 'semua', label: 'Semua bukti' },
  { id: 'akademik', label: 'Kegiatan akademik' },
  { id: 'kehidupan', label: 'Kehidupan di BLI' },
  { id: 'pengembangan', label: 'Pengembangan diri' },
  { id: 'magang', label: 'Magang & kerja' },
  { id: 'alumni', label: 'Cerita alumni' },
  { id: 'lulusan', label: 'Perjalanan lulusan' },
];

// Tiap item menjawab empat hal yang diminta proposal: siapa, kegiatan apa,
// apa yang dipelajari, dan kaitannya dengan perjalanan peserta.
export const evidenceItems = [
  {
    id: 'kelas-proyek',
    category: 'akademik',
    who: 'Peserta PPTI · tahun pertama',
    activity: 'Presentasi proyek aplikasi kelompok',
    title: 'Ide yang diuji di depan kelas.',
    learned: 'Menyusun alur aplikasi, membagi peran, lalu mempertahankan keputusan teknis saat ditanya.',
    journey: 'Menjadi bekal saat masuk on the job training di unit kerja.',
    photo: '/assets/photos/students-project.webp',
    alt: 'Peserta mempresentasikan rancangan proyek kepada rekan sekelas',
    sample: true,
  },
  {
    id: 'kelas-diskusi',
    category: 'akademik',
    who: 'Peserta PPBP · tahun pertama',
    activity: 'Studi kasus bisnis dan perbankan',
    title: 'Belajar membaca angka, bukan menghafalnya.',
    learned: 'Membedah kasus nyata, menghitung dampaknya, dan menyampaikan rekomendasi secara ringkas.',
    journey: 'Melatih cara berpikir yang dipakai saat menangani pekerjaan di unit bisnis.',
    photo: '/assets/photos/students-study.webp',
    alt: 'Peserta berdiskusi mengerjakan studi kasus di ruang kelas',
    sample: true,
  },
  {
    id: 'asrama',
    category: 'kehidupan',
    who: 'Peserta lintas angkatan',
    activity: 'Keseharian di asrama BLI',
    title: 'Rumah kedua yang mengatur ritme harian.',
    learned: 'Mengelola waktu, hidup berbagi ruang, dan menjaga kedisiplinan tanpa diawasi orang tua.',
    journey: 'Kesiapan mandiri yang biasanya baru terasa saat mulai bekerja.',
    photo: '/assets/360/kelas.jpg',
    alt: 'Suasana area belajar dan berkumpul peserta',
    sample: true,
  },
  {
    id: 'kompetisi',
    category: 'pengembangan',
    who: 'Peserta lintas program',
    activity: 'Pentas bakat dan turnamen antarangkatan',
    title: 'Ada ruang untuk bakat dan sorak bersama.',
    learned: 'Kekompakan tim, keberanian tampil, dan cara menikmati kompetisi tanpa kehilangan fokus belajar.',
    journey: 'Jaringan pertemanan lintas angkatan yang bertahan sampai setelah program.',
    photo: '/assets/photos/activity-performance.webp',
    alt: 'Penampilan tari kelompok peserta di panggung kampus',
    sample: true,
  },
  {
    id: 'turnamen',
    category: 'pengembangan',
    who: 'Peserta antarangkatan',
    activity: 'Turnamen basket antarangkatan',
    title: 'Kompetisi yang mengakrabkan.',
    learned: 'Kerja sama di bawah tekanan, menerima kalah, dan menjaga sportivitas antarangkatan.',
    journey: 'Cara paling cepat mengenal kakak dan adik angkatan di luar jam kelas.',
    photo: '/assets/photos/activity-sport.webp',
    alt: 'Pertandingan basket antarangkatan di lapangan kampus',
    sample: true,
  },
  {
    id: 'organisasi',
    category: 'pengembangan',
    who: 'Peserta tahun kedua',
    activity: 'Kepanitiaan acara kampus',
    title: 'Belajar memimpin dari acara kecil.',
    learned: 'Menyusun rencana, membagi tugas, dan menyelesaikan masalah mendadak bersama tim.',
    journey: 'Soft skill kepemimpinan yang disebut sebagai bagian pembekalan program.',
    photo: '/assets/photos/students-community.webp',
    alt: 'Peserta berkoordinasi menyiapkan kegiatan kampus',
    sample: true,
  },
  {
    id: 'ojt',
    category: 'magang',
    who: 'Peserta tahap on the job training',
    activity: 'Praktik di unit kerja BCA',
    title: 'Dari ruang kelas ke meja kerja.',
    learned: 'Menjalankan pekerjaan nyata dengan standar dan tenggat yang berlaku di unit kerja.',
    journey: 'Pengalaman kerja yang menjadi pembeda saat program selesai.',
    photo: '/assets/photos/benefit-work.webp',
    alt: 'Peserta menjalani praktik kerja di lingkungan kantor',
    sample: true,
  },
  {
    id: 'alumni-ppti',
    category: 'alumni',
    who: 'Alumni PPTI · angkatan sebelumnya',
    activity: 'Cerita setelah menyelesaikan program',
    title: 'Mulai dari nol pengetahuan teknologi.',
    learned: 'Dasar pemrograman dan cara belajar mandiri yang dipakai terus setelah lulus.',
    journey: 'Contoh jalur yang bisa ditanyakan langsung saat sesi berbagi alumni di sekolah.',
    photo: '/assets/photos/students-hero.webp',
    alt: 'Alumni berbagi pengalaman kepada peserta baru',
    sample: true,
  },
  {
    id: 'lulusan',
    category: 'lulusan',
    who: 'Lulusan program',
    activity: 'Perjalanan setelah 30 bulan',
    title: 'Jalur setelah lulus tidak hanya satu.',
    learned: 'Ada yang menerima penawaran kerja di BCA, ada yang melanjutkan studi atau jalur lain.',
    journey: 'Bukti bahwa program non-gelar tetap membuka pilihan, sesuai ketentuan resminya.',
    photo: '/assets/photos/benefit-skills.webp',
    alt: 'Lulusan program dalam kegiatan kerja',
    sample: true,
  },
];

export function filterEvidence(category = 'semua', list = evidenceItems) {
  return category === 'semua' ? list : list.filter((item) => item.category === category);
}

export function countEvidence(list = evidenceItems) {
  return evidenceCategories
    .filter((c) => c.id !== 'semua')
    .map((c) => ({ ...c, total: list.filter((item) => item.category === c.id).length }))
    .filter((c) => c.total > 0);
}

/* ------------------------------------------------------------------ */
/* BK kit — bahan bagi guru BK/sekolah yang belum punya jaringan alumni */
/* ------------------------------------------------------------------ */
export const bkKit = {
  points: [
    ['Apa yang dibagikan', 'Ringkasan program, persyaratan utama, periode pendaftaran, dan tautan resmi dalam satu halaman siap cetak.'],
    ['Untuk siapa', 'Guru BK, wali kelas, atau siapa pun yang biasa menjadi tempat siswa bertanya soal lanjut studi.'],
    ['Cara pakai', 'Cetak satu lembar untuk mading, atau tampilkan kode QR-nya saat sesi bimbingan kelas.'],
    ['Kenapa penting', 'Sekolah tanpa alumni tidak punya sumber informasi pertama. Guru BK bisa menggantikan peran itu.'],
  ],
  agenda: [
    'Sebutkan dua program dan bedanya (PPTI teknologi, PPBP bisnis dan perbankan).',
    'Tunjukkan kota tes terdekat supaya siswa tahu tesnya terjangkau.',
    'Jelaskan trade-off-nya: non-gelar, 30 bulan, tinggal di asrama Sentul.',
    'Ajak siswa mencoba cek kelayakan mandiri dan kisah awardee 360°.',
    'Arahkan pendaftaran hanya ke portal resmi BCA.',
  ],
};

// Kode sekolah untuk QR/shortlink. Deterministik supaya satu sekolah
// selalu mendapat kode yang sama, tanpa perlu server.
export function schoolCode(name = '') {
  const clean = name.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  const slug = clean
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word.slice(0, 6))
    .join('-');
  let hash = 0;
  for (const char of clean.toUpperCase()) hash = (hash * 31 + char.charCodeAt(0)) % 46656;
  return `${slug}-${hash.toString(36).toUpperCase().padStart(3, '0')}`;
}

export function referralLink(code, base = 'https://beasiswa-bca.example/hub') {
  const url = new URL(base);
  if (code) url.searchParams.set('ref', code);
  return url.toString();
}

export function bkSummaryText(code = '', link = '') {
  return [
    'Info Beasiswa BCA (PPTI & PPBP) untuk siswa kelas XII:',
    '- Beasiswa pendidikan 30 bulan di BCA Learning Institute, Sentul. Non-gelar, tanpa ikatan dinas.',
    '- Tanpa biaya pendidikan dan tanpa pungutan pada pendaftaran maupun seleksi.',
    '- Syarat utama: usia maksimal 19 tahun, rata-rata rapor minimal 75,00, tidak pernah tinggal kelas.',
    `- Periode pendaftaran tahun ajaran ${scholarship.year} sampai ${scholarship.deadline}.`,
    '- Tes tersedia di puluhan kota, jadi siswa tidak harus ke Jakarta.',
    code ? `Kode sekolah: ${code}` : '',
    link ? `Tautan berbagi: ${link}` : '',
    `Informasi resmi: ${scholarship.source}`,
  ]
    .filter(Boolean)
    .join('\n');
}
