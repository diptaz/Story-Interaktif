// Konten "decision information": hal-hal yang dibutuhkan calon pendaftar untuk
// memutuskan, dan sengaja dibuka tanpa login (lokasi tes, kelayakan, setelah
// program, ringkasan untuk orang tua). Terpisah dari narasi Campus Tour.
// Snapshot 18 September 2026 dari halaman resmi PPTI & PPBP. Verifikasi ulang sebelum publikasi.
import { scholarship } from './landing-content.js';

/* ------------------------------------------------------------------ */
/* Lokasi tes — menjawab "saya tes di mana?" sebelum membuat akun.      */
/* ------------------------------------------------------------------ */
const cityData = [
  ['Sumatera', ['Banda Aceh', 'Medan', 'Padang', 'Pekanbaru', 'Jambi', 'Palembang', 'Bengkulu', 'Bandar Lampung', 'Lubuk Linggau', 'Batam', 'Tanjung Pinang']],
  ['Jawa', ['Jabodetabek', 'Karawang', 'Purwakarta', 'Subang', 'Sukabumi', 'Bandung', 'Garut', 'Tasikmalaya', 'Cirebon', 'Majalengka', 'Tegal', 'Pemalang', 'Pekalongan', 'Purwokerto', 'Cilacap', 'Magelang', 'Semarang', 'Demak', 'Kudus', 'Solo', 'Yogyakarta', 'Madiun', 'Surabaya', 'Malang', 'Jember', 'Bangkalan']],
  ['Bali & Nusa Tenggara', ['Denpasar', 'Mataram', 'Kupang']],
  ['Kalimantan', ['Pontianak', 'Palangkaraya', 'Banjarmasin', 'Samarinda', 'Balikpapan', 'Berau']],
  ['Sulawesi', ['Makassar', 'Manado', 'Kendari', 'Luwuk', 'Morowali', 'Mamuju']],
  ['Maluku & Papua', ['Ambon', 'Ternate', 'Sorong', 'Jayapura', 'Merauke']],
];

// Kota yang pada catatan terakhir hanya tercantum di halaman PPBP.
const ppbpOnly = [['Jakarta', 'Jawa'], ['Banjarbaru', 'Kalimantan'], ['Tanjung Pandan', 'Sumatera']];

export const testCities = [
  ...cityData.flatMap(([region, cities]) => cities.map((city) => ({ city, region, programs: ['ppti', 'ppbp'] }))),
  ...ppbpOnly.map(([city, region]) => ({ city, region, programs: ['ppbp'] })),
].sort((a, b) => a.city.localeCompare(b.city, 'id'));

export const regions = cityData.map(([region]) => region);

// Pencarian sederhana: nama kota atau nama wilayah, opsional difilter per program.
export function filterCities(query = '', program = 'all', list = testCities) {
  const q = query.trim().toLowerCase();
  return list.filter((item) => {
    const matchProgram = program === 'all' || item.programs.includes(program);
    const matchQuery = !q || item.city.toLowerCase().includes(q) || item.region.toLowerCase().includes(q);
    return matchProgram && matchQuery;
  });
}

export function groupByRegion(list = testCities) {
  return regions
    .map((region) => ({ region, cities: list.filter((item) => item.region === region) }))
    .filter((group) => group.cities.length);
}

/* ------------------------------------------------------------------ */
/* Cek kelayakan mandiri — hasil hanya untuk pengguna, tidak dikirim.   */
/* ------------------------------------------------------------------ */
export const eligibilityQuestions = [
  { id: 'wni', text: 'Saya Warga Negara Indonesia.', hint: 'Persyaratan dasar kedua program.' },
  { id: 'jenjang', text: 'Saya siswa kelas XII atau lulusan SMA/SMK.', hint: 'Untuk PPTI, jurusan SMK perlu berkaitan dengan Teknik Informatika.' },
  { id: 'usia', text: 'Usia saya maksimal 19 tahun saat mendaftar.', hint: 'Dihitung pada saat pendaftaran.' },
  { id: 'rapor', text: 'Rata-rata nilai rapor kelas X–XII saya minimal 75,00.', hint: 'Termasuk nilai Matematika dan mata pelajaran penjurusan.' },
  { id: 'tinggal-kelas', text: 'Saya tidak pernah tinggal kelas sejak SD sampai SMA/SMK.', hint: 'Diperiksa pada seleksi administrasi.' },
  { id: 'komitmen', text: 'Saya siap menempuh program 30 bulan di BCA Learning Institute, Sentul.', hint: 'Program non-gelar, Senin–Jumat, dan berarti tinggal jauh dari rumah.' },
];

export function evaluateEligibility(answers = {}) {
  const total = eligibilityQuestions.length;
  const answered = eligibilityQuestions.filter((q) => answers[q.id]).length;
  const blockers = eligibilityQuestions.filter((q) => answers[q.id] === 'tidak');
  if (answered < total) {
    return {
      status: 'partial',
      answered,
      total,
      blockers: [],
      headline: `Terjawab ${answered} dari ${total}`,
      text: 'Jawab semua pernyataan untuk melihat hasilnya.',
    };
  }
  if (!blockers.length) {
    return {
      status: 'fit',
      answered,
      total,
      blockers: [],
      headline: 'Sejauh ini kamu memenuhi syarat dasar',
      text: 'Lanjutkan ke persyaratan lengkap di portal resmi. Keputusan akhir tetap ada pada proses seleksi BCA.',
    };
  }
  const soft = blockers.length <= 2;
  return {
    status: soft ? 'check' : 'not-yet',
    answered,
    total,
    blockers: blockers.map((q) => q.text),
    headline: soft ? 'Ada yang perlu kamu pastikan dulu' : 'Sepertinya belum sesuai untuk periode ini',
    text: soft
      ? 'Periksa poin berikut pada dokumen resmi sebelum mendaftar.'
      : 'Beberapa syarat dasar belum terpenuhi. Kamu tetap bisa mengenal programnya, atau mencoba pada periode berikutnya.',
  };
}

/* ------------------------------------------------------------------ */
/* Setelah program — menjawab "apa yang terjadi setelah lulus?"        */
/* ------------------------------------------------------------------ */
export const afterProgram = {
  facts: [
    ['Non-gelar, 30 bulan', 'Peserta belajar di kelas sekaligus mengikuti on the job training di unit kerja BCA. Yang dibangun adalah keahlian kerja, bukan gelar akademik.'],
    ['Tanpa ikatan dinas', 'Halaman resmi menyebutkan program ini tidak memiliki ikatan dinas, sehingga peserta tidak terikat kewajiban kerja setelah program selesai.'],
    ['Kesempatan kerja, bukan jaminan', 'Setelah lulus, peserta berkesempatan memperoleh penawaran kerja di BCA sesuai kebutuhan perusahaan dan hasil selama program.'],
    ['Bekal yang dibawa', 'Kemampuan teknis sesuai program, pengalaman kerja nyata, serta soft skill seperti kepemimpinan, kerja tim, dan perencanaan keuangan.'],
  ],
  tradeoffs: [
    'Tinggal di asrama Sentul dan jauh dari keluarga selama program berjalan.',
    'Jadwal belajar penuh Senin–Jumat, sehingga ruang untuk kegiatan lain lebih terbatas.',
    'Program ini tidak memberikan ijazah akademik; pertimbangkan bila kamu menargetkan gelar sarjana.',
  ],
};

/* ------------------------------------------------------------------ */
/* Mode Orang Tua — ringkasan yang bisa disalin atau dibagikan.        */
/* ------------------------------------------------------------------ */
export const parentFacts = [
  ['Siapa penyelenggaranya?', 'Program pendidikan dari BCA yang dijalankan di BCA Learning Institute, Sentul. Informasi resminya ada di karir.bca.co.id.'],
  ['Berapa biayanya?', 'Tidak ada biaya pendidikan, dan tidak ada pungutan pada proses pendaftaran maupun seleksi. Waspadai pihak yang meminta pembayaran.'],
  ['Anak saya tinggal di mana?', 'Peserta tinggal di asrama di area kampus, dengan fasilitas belajar dan kehidupan sehari-hari di dalamnya.'],
  ['Harus ke Jakarta untuk tes?', 'Tidak. Tes tersedia di puluhan kota di seluruh Indonesia, dan daftarnya bisa dilihat di halaman ini tanpa membuat akun.'],
  ['Setelah lulus bagaimana?', 'Program berdurasi 30 bulan, non-gelar, tanpa ikatan dinas, dengan kesempatan memperoleh penawaran kerja di BCA.'],
];

export function parentSummaryText(url = scholarship.source) {
  return [
    'Ringkasan Beasiswa BCA (PPTI & PPBP) untuk orang tua/wali:',
    '- Beasiswa pendidikan dari BCA untuk lulusan SMA/SMK, 30 bulan di BCA Learning Institute, Sentul.',
    '- Tanpa biaya pendidikan dan tanpa pungutan selama pendaftaran maupun seleksi.',
    '- Peserta tinggal di asrama; kegiatan belajar Senin-Jumat.',
    '- Program non-gelar dan tanpa ikatan dinas, dengan kesempatan penawaran kerja di BCA setelah lulus.',
    '- Tes seleksi tersedia di puluhan kota di Indonesia.',
    `Informasi resmi: ${url}`,
  ].join('\n');
}
