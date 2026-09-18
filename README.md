# Beasiswa BCA — Homepage & Campus Tour 360°

Website konsep Beasiswa BCA dengan homepage informatif dan pengalaman cerita 360°.
Homepage memakai ilustrasi perjalanan orisinal, tab PPTI/PPBP, ringkasan manfaat,
tahapan seleksi interaktif, FAQ, dan checklist persiapan. Tour tetap mempertahankan
panorama bergaya lukisan, alur per chapter, interaksi kecil, dan claim benefit.

Desain homepage terinspirasi struktur perjalanan dan showcase interaktif
[Hack the North](https://hackthenorth.com/), dengan identitas biru-putih BCA yang minimal.
Ini **bukan situs resmi** dan tidak mengumpulkan data pendaftaran.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5190

Homepage ada di `/`; tour dibuka lewat CTA atau `/#tour`. Klik teks BCA di dalam tour
untuk kembali ke bagian Campus Tour pada homepage. Engine 360° dimuat secara lazy.

## Fitur keputusan (sesuai proposal)

- `#lokasi-tes`: cari kota tes (60 kota, tag PPTI/PPBP) tanpa login.
- `#kecocokan`: cek kelayakan 6 pernyataan; hasil hanya di perangkat, tidak dikirim.
- `#setelah-program`: fakta setelah 30 bulan + hal yang perlu dipertimbangkan.
- `#orang-tua`: ringkasan untuk keluarga, bisa dibagikan/disalin.
- `#bukti`: galeri bukti peserta, alumni, dan lulusan dengan filter kategori.
- `#guru-bk`: BK kit — kode sekolah, QR, tautan ber-kode, dan lembar cetak satu halaman.
Kontennya di `src/decision-content.js` dan `src/outreach-content.js` (tes di folder `tests/`).
QR dibuat di browser lewat import dinamis, jadi tidak menambah beban halaman awal.

## Mengubah homepage

- `src/landing-content.js`: program, periode pendaftaran, FAQ, tips seleksi, tautan resmi.
- `src/landing.js`: struktur komponen dan interaksi DOM.
- `src/landing-art.js`: SVG kampus konseptual dan ilustrasi program, bukan denah/foto asli.
- `src/styles/landing.css`: layout responsif, seluruh selector di-scope ke homepage.
- `src/styles/tokens.css`: token warna BCA.
- `src/main.js`: entry ringan homepage dan pemuatan tour.
- `src/tour-app.js`: bootstrap experience 360° yang lama.

Informasi merupakan snapshot **18 September 2026**. Periksa lagi sumber BCA sebelum
publikasi; badge periode otomatis berubah setelah tanggal tutup, tetapi konten periode
baru perlu diperbarui manual. Logo resmi dan panorama asli belum disediakan; gunakan
aset berizin milikmu, jangan menganggap ilustrasi sebagai dokumentasi fasilitas asli.

## Verifikasi

```bash
npm test
npm run build
```

Catatan desain, hasil uji, dan batasan: `HOMEPAGE.md`.

| URL | Fungsi |
| --- | --- |
| `?unlock` | buka semua chapter |
| `?reset` | hapus progres tersimpan |
| `?debug` | tampilkan yaw/pitch kamera, klik foto 360 = koordinat hotspot |
| `#chapter-2`, `#outro` | langsung ke bagian itu setelah klik "Mulai jelajah" |

Build untuk hosting (Netlify/Vercel/GitHub Pages): `npm run build` → upload folder `dist/`.

## Mengubah cerita

Semua isi ada di **`src/story.js`**: teks, urutan step, foto, narasi, pilihan, claim.
Engine tidak perlu disentuh.

1. Taruh foto 360 di `public/assets/360/` (nama file lihat `public/assets/README.md`).
2. Buka `?debug`, putar kamera, klik titik penting → salin `{ yaw, pitch }` ke `view` atau `spots`.
3. Ganti teks `[...]` di `story.js`.

Tipe interaksi: `carousel`, `hotspots`, `choice`, `race`, `hold`, `drag`.
Cabang alur: `choice`/`race` menyimpan flag → step lain pakai `when: { flag, equals }`.

## Dokumen

- `PROMPT.md`: prompt untuk AI lain (bangun dari nol / lanjutkan / template alur).
- `AGENTS.md`: panduan teknis untuk AI agent (arsitektur, kontrak, aturan desain, checklist).
- `CLAUDE.md`: tambahan khusus Claude Code.
