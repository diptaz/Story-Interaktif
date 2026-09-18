// Snapshot 18 September 2026. Verifikasi ulang informasi sebelum publikasi.
// Konten homepage terpisah dari narasi Campus Tour di story.js.
export const scholarship = {
  year: 2027,
  opens: '2026-04-13T00:00:00+07:00',
  closes: '2026-10-20T23:59:59+07:00',
  deadline: '20 Oktober 2026',
  verified: '18 September 2026',
  source: 'https://karir.bca.co.id/beasiswa-bca',
};

export const programs = [
  {
    id: 'ppti', acronym: 'PPTI', category: 'Teknologi',
    title: 'Bangun solusi.\nCiptakan dampak.',
    fullName: 'Program Pendidikan Teknik Informatika',
    description: 'Ubah rasa ingin tahu tentang teknologi menjadi kemampuan untuk membangun aplikasi, mengolah data, dan memahami sistem digital.',
    topics: ['Pemrograman', 'Data & aplikasi', 'Network system'],
    audience: 'Untuk siswa kelas XII atau lulusan SMA/SMK. Ada ketentuan mata pelajaran dan jurusan, khususnya untuk SMK bidang Teknik Informatika.',
    url: 'https://karir.bca.co.id/beasiswa-bca/daftar/program-pendidikan-teknologi-informasi-ppti',
  },
  {
    id: 'ppbp', acronym: 'PPBP', category: 'Bisnis & perbankan',
    title: 'Pahami bisnis.\nBuka peluang.',
    fullName: 'Program Pendidikan Bisnis dan Perbankan',
    description: 'Kenali bagaimana bisnis dan perbankan bekerja, sambil mengembangkan kemampuan analitis, komunikasi, dan kerja sama tim.',
    topics: ['Bisnis & manajemen', 'Pemasaran', 'Data & pengenalan IT'],
    audience: 'Untuk siswa kelas XII atau lulusan SMA/SMK dari berbagai jurusan yang tertarik pada bisnis dan perbankan.',
    url: 'https://karir.bca.co.id/beasiswa-bca/daftar/program-pendidikan-bisnis-dan-perbankan',
  },
];

// Tahapan mengikuti screenshot detail program dari user, bukan jadwal seleksi.
export const selectionSteps = [
  ['Seleksi administrasi', 'Mulai dari data yang lengkap.', 'Siapkan informasi pendidikan dan nilai rapor. Periksa kembali seluruh isian sebelum mengirim pendaftaran di portal resmi.'],
  ['Tes online', 'Siapkan ruang untuk fokus.', 'Ikuti instruksi pada undangan tes. Pastikan perangkat dan koneksi internet siap sebelum jadwal dimulai.'],
  ['Psikotes', 'Kenali caramu berpikir.', 'Baca petunjuk dengan teliti, kelola waktu, dan ikuti rangkaian tes sesuai arahan penyelenggara.'],
  ['Wawancara HR', 'Ceritakan motivasimu.', 'Persiapkan alasan memilih program, pengalaman belajar, serta contoh kerja sama dan tantangan yang pernah kamu hadapi.'],
  ['Pemeriksaan kesehatan', 'Ikuti pemeriksaan terjadwal.', 'Perhatikan lokasi, jadwal, dan dokumen yang diminta dalam undangan resmi pemeriksaan.'],
  ['Perjanjian kerja', 'Pahami setiap ketentuannya.', 'Baca dokumen yang diberikan dengan saksama. Tanyakan hal yang belum jelas melalui kanal resmi sebelum menyetujuinya.'],
  ['Diterima', 'Perjalanan baru dimulai.', 'Ikuti informasi kelanjutan program dan persiapan yang disampaikan oleh pihak BCA.'],
];

export const questions = [
  ['Apakah pendaftarannya dipungut biaya?', 'Tidak. Proses pendaftaran dan seleksi BCA tidak memungut biaya. Selalu gunakan kanal resmi dan waspadai pihak yang meminta pembayaran.'],
  ['Apa perbedaan PPTI dan PPBP?', 'PPTI berfokus pada teknologi informasi, sedangkan PPBP pada bisnis dan perbankan. Keduanya menggabungkan pembelajaran kelas, pengembangan soft skill, dan on-the-job training.'],
  ['Berapa lama dan di mana saya belajar?', 'Program berlangsung selama 30 bulan di BCA Learning Institute, Sentul. Jadwal belajar yang tercantum di halaman resmi adalah Senin–Jumat, pukul 08.00–17.00 WIB.'],
  ['Apakah setelah lulus pasti bekerja di BCA?', 'Program tidak memiliki ikatan dinas. Ada kesempatan memperoleh penawaran kerja setelah menyelesaikan program, bukan jaminan otomatis diterima bekerja.'],
  ['Apakah kisah awardee ini bagian dari seleksi?', 'Tidak. Ini pengalaman interaktif untuk mengenal gambaran kehidupan belajar. Pilihan dan benefit di dalam cerita tidak memengaruhi pendaftaran atau hasil seleksi.'],
  ['Bagaimana cara melanjutkan pendaftaran?', 'Pilih program, baca persyaratan lengkap, lalu lanjutkan melalui portal resmi BCA. Website konsep ini tidak mengumpulkan data pelamar atau menerima pendaftaran.'],
];

export function registrationStatus(now = Date.now()) {
  if (now < Date.parse(scholarship.opens)) return 'Pendaftaran segera dibuka';
  if (now > Date.parse(scholarship.closes)) return 'Periode pendaftaran telah berakhir';
  return 'Pendaftaran dibuka';
}
