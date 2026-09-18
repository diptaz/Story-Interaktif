# Homepage Beasiswa BCA — catatan desain & handoff

## Referensi yang diperiksa

Pada 18 September 2026, https://hackthenorth.com/ dibuka dan diperiksa langsung di browser:

- Hero dan section "About" memakai komposisi visual besar, foto/objek berlapis,
  dan momen reveal yang mengikuti guliran.
- Navigasi anchor membawa pengunjung ke bagian cerita yang relevan.
- Showcase proyek memakai pilihan objek; memilih ROSS mengganti judul, deskripsi,
  ilustrasi pilihan, dan video. Interaksi ini dicoba langsung.
- FAQ berbentuk accordion; pertanyaan dapat dibuka untuk menampilkan jawabannya.

Adaptasi BCA memakai latar biru berlapis, foto mahasiswa editorial lokal, galeri tiga
adegan yang sticky dan masuk dari dua arah, ilustrasi kampus SVG untuk tour, tab
PPTI/PPBP, tips seleksi, dan FAQ. Tidak menyalin ilustrasi, musik, tekstur, atau teks
referensi. Tidak memakai scroll-jacking, autoplay audio/video, atau dependensi baru.

## Arah visual terkini

`src/styles/landing.css` memuat fondasi komponen dan perilaku galeri;
`src/styles/landing-editorial.css` adalah lapisan art direction homepage yang diimpor
sesudahnya dari `src/main.js`. Tour fullscreen memiliki stylesheet terpisah dan tidak
terpengaruh. Hero memakai bidang navy dan fotografi asimetris dengan dua pilihan jalur
interaktif. Menyorot/memfokuskan PPTI atau PPBP mengganti pratinjau foto; mengkliknya
menyimpan pilihan sekaligus memilih panel program di bawah. Keempat manfaat kini berupa
panel foto bernomor: foto lembut saat diam, makin jelas saat hover/fokus/klik, dengan
gradasi dan bayangan teks agar keterangan tetap terbaca. Klik kedua kali menutup pilihan;
hanya satu panel dapat terpilih. Ada jeda foto full-bleed
antara manfaat dan program, lalu tab program vertikal di desktop. Galeri tetap tiga
adegan sticky dengan foto yang masuk dari dua arah, tetapi bingkainya kini lebih
fotografis. Di ponsel, urutan berubah menjadi narasi satu kolom tanpa scroll horizontal.

## Struktur pengalaman

Hero foto → fakta program → cerita foto (belajar, bertemu, berkarya) → manfaat →
pengalaman belajar → program & persyaratan → tour → seleksi → FAQ → pendaftaran resmi.
Homepage menggunakan scrolling biasa. Tour bersifat fullscreen dan dimuat on demand.
Kembali dari tour melakukan reload untuk melepaskan WebGL/audio/listener; progres cerita
tetap tersimpan, lalu anchor `#campus-tour` dipulihkan.

## Aset foto dan cara menggantinya

Delapan foto ilustratif dibuat menggunakan imagegen bawaan, lalu dioptimalkan ke WebP
lokal (total sekitar 740 KB):

- `public/assets/photos/students-hero.webp` — mahasiswa berjalan bersama; hero.
- `public/assets/photos/students-study.webp` — diskusi kelas; adegan belajar.
- `public/assets/photos/students-community.webp` — kebersamaan kampus; adegan bertemu.
- `public/assets/photos/students-project.webp` — presentasi proyek; adegan berkarya.
- `public/assets/photos/benefit-study-support.webp` — belajar mandiri; dukungan biaya.
- `public/assets/photos/benefit-skills.webp` — diskusi dengan buku/laptop; keterampilan.
- `public/assets/photos/benefit-residence.webp` — keseharian bersama di ruang tinggal.
- `public/assets/photos/benefit-work.webp` — kolaborasi magang dengan mentor.

Prompt final yang digunakan (seluruhnya meminta fotografi realistis, pencahayaan
alami, mahasiswa Indonesia usia kuliah, komposisi editorial premium, tanpa logo,
tanpa merek, dan tanpa teks terbaca):

1. Empat mahasiswa berjalan dan bercakap di gedung pembelajaran modern yang lapang;
   bidang visual lebar dengan ruang kosong di kiri untuk headline situs beasiswa.
2. Tiga mahasiswa bekerja bersama di depan laptop dalam kelas kontemporer;
   interaksi spontan dan fokus pada ekspresi belajar.
3. Empat mahasiswa berbincang santai setelah kelas di area kampus yang terang;
   tangkap pertemanan dan kolaborasi yang natural.
4. Mahasiswi mempresentasikan ide proyek kepada dua temannya di studio belajar;
   fokus pada keberanian menyampaikan gagasan dan proses berkarya.
5. Mahasiswi Indonesia belajar tenang dengan buku catatan dan laptop dalam ruang belajar
   tanpa merek; subjek di sisi atas, bagian bawah lebih tenang untuk teks manfaat biaya.
6. Sekelompok mahasiswa Indonesia berlatih bersama memakai buku dan laptop di meja kelas;
   cahaya alami, interaksi candid, bagian bawah lebih tenang untuk teks keterampilan.
7. Dua mahasiswa Indonesia berbincang sambil makan siang di ruang komunal tempat tinggal
   yang sederhana; suasana hangat, bukan klaim dokumentasi asrama BCA.
8. Mahasiswa magang Indonesia bekerja dengan mentor di depan komputer dalam kantor
   tanpa merek; nuansa dokumenter, tanpa layar atau tulisan yang terbaca.

Ini bukan foto peserta, gedung, atau fasilitas BCA. Label ilustratif muncul di hero,
galeri, dan bagian manfaat. Untuk foto resmi, ganti berkas dengan nama yang sama;
teks adegan galeri, alt, dan urutan bisa disesuaikan di `src/landing-gallery.js`.

## Sumber dan batasan informasi

- https://karir.bca.co.id/beasiswa-bca (diperiksa 18 September 2026).
- Pengumuman periode 2027: https://www.bca.co.id/id/tentang-bca/media-riset/pressroom/siaran-pers/2026/06/09/08/56/beasiswa-ppbp-dan-ppti-bca-tahun-ajaran-2027-telah-dibuka-hingga-oktober
- Empat screenshot user: landing, detail PPTI/PPBP, dan profil; **data pribadi tidak disalin**.
- Tujuh tahap seleksi mengikuti screenshot detail program. Halaman ringkasan resmi
  mengelompokkan tahap secara berbeda; jadwal/urutan final harus mengikuti undangan BCA.
- Teks tips persiapan merupakan saran umum, bukan instruksi resmi pelaksanaan tes.
- Persyaratan adalah ringkasan, bukan alat penentuan kelayakan calon penerima.
- Ilustrasi kampus bukan denah/foto asli; panorama tour masih fallback prosedural.
- Foto mahasiswa di hero/galeri adalah visual sintetis, bukan dokumentasi BCA.
- Teks BCA merupakan fallback teks, bukan logo resmi. Ganti dengan aset resmi berizin
  ketika tersedia. Tidak ada klaim bahwa prototipe ini dimiliki/disahkan oleh BCA.
- Checklist hanya state DOM sementara; tidak disimpan atau dikirim. Tidak ada form pelamar.

## Aksesibilitas & performa

- Tab program/tahapan memakai aria-selected, aria-controls, roving tabindex, panah, Home/End.
- Menu mobile memiliki aria-expanded, Escape, dan menutup saat anchor dipilih.
- FAQ memakai native details/summary. Ada skip link, focus ring, dan label tombol ikon.
- Pilihan hero dan manfaat memakai tombol dengan aria-pressed; klik, Enter, dan Space
  sama-sama memilih, sementara hover/fokus memberi pratinjau sementara.
- prefers-reduced-motion mematikan animasi CSS dan smooth-scroll buatan homepage.
- prefers-reduced-motion menampilkan tiga adegan galeri sebagai konten statis, bukan
  ruang sticky dengan gambar yang tersembunyi.
- Reveal bersifat progressive enhancement: konten tidak ditinggalkan tersembunyi.
- Homepage tidak mengimpor Three.js/GSAP/Howler secara statis. Build memisahkan chunk tour.
- Konten dan tampilan berasal dari file lokal; tidak perlu layanan tambahan untuk berjalan.

## Pengujian

- `npm test`: status pendaftaran termasuk batas tanggal, ID/tautan program, data tahap/FAQ,
  dan keunikan ID ilustrasi SVG.
- Browser: desktop 1440×900 dan mobile 375×812; tidak ada horizontal page overflow.
- Browser: memilih PPBP di hero mengubah foto dan memilih tab PPBP; panel manfaat
  berpindah satu-per-satu, dapat ditutup lagi dengan Space, dan foto tetap terbaca.
- Browser: hero foto dan galeri di desktop/mobile; adegan belajar ke bertemu berganti
  saat scroll, foto masuk dari arah berbeda, judul dan foto tetap terbaca.
- Browser: ganti PPBP/PPTI, ArrowLeft, tahap Wawancara HR, FAQ kesempatan kerja, checklist.
- Browser: buka menu mobile, tutup dengan Escape, pilih anchor program, pastikan menu tertutup.
- Browser: tahap terakhir seleksi pada mobile dan tombol Home kembali ke tahap pertama;
  disclosure persyaratan dapat dibuka.
- Browser: CTA tour berhasil memuat experience hingga layar Chapter 01; tautan BCA kembali
  ke homepage `#campus-tour`, posisi section 80px dari atas di mobile dan canvas disembunyikan.
- Console homepage tanpa error; tour hanya memperingatkan panorama manuscript belum tersedia
  lalu memakai fallback yang memang disediakan. Seluruh chapter/cabang tidak diuji ulang.
- Saat QA ditemukan event SVG toggle membuat menu langsung tertutup; diperbaiki memakai
  composedPath dan perilaku buka/tutup diuji ulang.

Uji flow story lengkap diperlukan bila alur/engine story diubah; perubahan ini fokus homepage
dan pemisahan bootstrap, bukan perubahan isi chapter.
