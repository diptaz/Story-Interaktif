# PROMPT: Campus Tour 360° PPTI & PPBP

Prompt siap tempel untuk AI agent mana pun (Claude, ChatGPT/Codex, Cursor, Gemini, dsb).

## Prompt terbaru: lanjutkan homepage + story dalam satu website

```text
Baca AGENTS.md, README.md, dan HOMEPAGE.md sebelum mengedit.
Lanjutkan website Beasiswa BCA yang sudah ada. Story 360° adalah bagian dari website,
bukan pengganti homepage. Pertahankan desain biru-putih BCA yang simple dan minimalist.

Homepage terinspirasi Hack the North: ilustrasi perjalanan besar, narasi section yang
mengalir, pilihan showcase yang mengganti konten, dan FAQ. Adaptasikan pola interaksinya,
jangan menyalin aset, warna, teks, atau menambah keramaian visual yang tidak perlu.

Homepage sudah memiliki hero peta kampus konseptual, tab PPTI/PPBP, manfaat, persyaratan,
timeline seleksi, CTA Campus Tour, FAQ, checklist, menu mobile dan navigasi keyboard.
Edit konten program/periode di src/landing-content.js, visual di src/landing-art.js,
layout di src/landing.js + src/styles/landing.css. Jangan menghardcode fakta baru tanpa
sumber. Simpan informasi pendaftaran di portal resmi BCA, jangan kumpulkan data pribadi
atau mengklaim bahwa prototype ini situs resmi. Jangan membuat logo BCA palsu.

Alur story seluruhnya di src/story.js. Pertahankan engine, efek lukisan, teks bergerak,
chapter, hotspot, pilihan bercabang, claim benefit, dan penyimpanan progres yang sudah ada.
Pertahankan lazy-loading tour dan tombol kembali ke homepage.

PERUBAHAN YANG KUMAU:
[ISI PERUBAHAN TAMPILAN/KONTEN]

ALUR CERITA BARU:
[ISI NARASI, CHAPTER, LOKASI, INTERAKSI, CABANG, DAN PENUTUP DI SINI]

Gunakan aset milikku jika tersedia; media kosong harus memiliki fallback yang jelas.
Jalankan npm test dan npm run build. Uji browser desktop 1440×900 dan mobile 375×812:
menu, tab + keyboard, FAQ, checklist, CTA resmi, masuk/keluar tour. Jika alur story diubah,
uji juga seluruh chapter dan cabangnya. Laporkan batasan yang belum selesai dengan jujur.
```

Bagian A–D di bawah tetap menjadi spesifikasi rinci engine story dan template alur.

- **Bagian A**: prompt lengkap untuk membangun dari nol (spesifikasi final).
- **Bagian B**: prompt singkat untuk melanjutkan codebase di folder ini.
- **Bagian C**: template alur cerita. Isi, lalu tempel ke A atau B.
- **Bagian D**: panduan foto 360 & aset.
- **Lampiran**: hasil bedah web referensi.

---

## BAGIAN A: Prompt lengkap (bangun dari nol)

```text
Kamu adalah creative developer senior (kelas studio Awwwards). Bangun web cerita interaktif
satu halaman berbahasa Indonesia: "Campus Tour 360° PPTI & PPBP", pengenalan beasiswa BCA di
kampus BCA Learning Institute (BLI).

KONSEP
- Pengguna "berkeliling kampus" lewat FOTO 360° yang dirender seperti lukisan hidup, mengikuti alur
  cerita per chapter, melakukan interaksi kecil, dan meng-CLAIM benefit seperti transaksi m-banking.
- Terinspirasi rasa gerak web Pasticcino Bag World Tour (monogrid), TAPI desainnya orisinal:
  identitas BCA (hanya warna & logo resmi yang disediakan), bahasa visual kartu bank / m-banking.

STACK
- Vite + JavaScript ES modules (tanpa framework UI), three.js, GSAP, Howler.js.
- Semua konten di SATU file data src/story.js. Engine tidak berisi teks cerita.

LAYER
0 canvas lukisan (Three.js)  1 #stage (DOM scene)  2 #ui (header, buku saku, subtitle, menu)
3 #overlay (notif, transisi, loader). Container overflow: clip.

TEMA BCA
- Token: biru #0060af, biru tua #0a52a0, navy #00336e, navy gelap #001f45, cyan #1ba0e2,
  cyan muda #7fd0f5, biru es #eaf4fc, putih, teks #16263b, abu #5b6b80, aksen emas #ffc20e.
- Gradien hero 135deg #0a4fa0 -> #0060af -> #1ba0e2. Grid titik putih transparan & gelombang/arc
  besar sebagai dekorasi. Kartu putih radius 18-24px, bayangan navy lembut.
- Font: Plus Jakarta Sans 400-800 (judul 800, sering italic untuk aksen).
- Logo resmi dari file user (public/assets/brand/logo.png, versi putih). Jika tidak ada, tampilkan
  wordmark teks. Jangan menggambar ulang logo.

RENDERER LUKISAN 360 (fragment shader, 1 quad)
- Mode pano: arah sinar per piksel dari kamera (yaw, pitch, fov) -> equirect uv
  (lon = atan(d.x, -d.z), lat = asin(d.y)); tekstur RepeatWrapping.
- Mode flat: cover-fit + parallax depth map + mouse.
- Kontrol: drag untuk memutar (derajat per px = fov / tinggi layar), inersia 0.92, wheel = fov 40-95,
  putar otomatis pelan saat diam 4 detik (dimatikan selama interaksi hotspot), parallax mouse kecil.
- API: show(media, {view}), lookAt({yaw,pitch,fov}) jalur terpendek power3.inOut,
  project(yaw,pitch) -> posisi layar, unproject(x,y) -> yaw/pitch, setProgress(p) -> fov zoom.
- Efek: Kuwahara 4 kuadran radius 2 (grid diputar oleh field noise) dicampur `paint`,
  relief sapuan kuas (3 arah fbm, normal dFdx/dFdy), goresan rambut tipis, duotone
  (bayangan #0a2a66 -> highlight #fff9f0, kekuatan ~0.18), vignette, grain,
  TEPI KUAS SOBEK berwarna biru BCA #0a4a9c, transisi antar media larut bernoise 1.6s.
- Placeholder panorama prosedural (indoor/outdoor) jika file belum ada.
- Mode ?debug menampilkan yaw/pitch dan koordinat titik yang diklik (untuk menaruh hotspot).

ALUR PENGALAMAN
1. LOADER: gradien navy->biru, kata "memuat" raksasa italic dengan glow cyan, progress bar pill,
   gelombang putih transparan bergerak di bawah.
2. GERBANG "KARTU PESERTA": kartu bank bergradien biru (chip emas, label "KARTU PESERTA", arc/gelombang,
   grid titik, nomor "NO. 2026 · 360°", tag PPTI/PPBP). Masuk berputar 3D (rotateY -70 -> 0),
   lalu MIRING 3D mengikuti pointer (±14° / ±10°) dengan kilau bergerak. Hover tombol = kilau menyapu.
   Tombol kapsul putih "Mulai jelajah" (klik = unlock audio), kartu "di-tap" lalu terbang ke atas.
3. PROLOG: panorama The Manuscript + narasi kata-per-kata + "LEWATI INTRO".
4. CHAPTER: cover (label melengkung + judul raksasa mengambang + "JELAJAHI") -> buku saku muncul ->
   step berurutan: [panorama + arah kamera] -> [judul step + kalimat dalam kapsul blur] ->
   [interaksi] -> [claim] -> [kicker kapsul putih + judul hasil italic bergelombang] -> "Lanjut".
   Step terakhir berlabel custom. Petunjuk "360° Geser layar untuk melihat sekeliling" sekali per sesi.
5. OUTRO: narasi penutup, lalu Kartu Peserta "TUR SELESAI" berisi judul, dompet benefit (chip),
   tombol "Ulangi perjalanan" (+ link opsional).

UI TETAP
- Header: logo | garis pemisah | "Campus Tour 360°" + "PPTI · PPBP". Tombol kapsul putih "☰ Menu".
- Tombol suara bulat putih kiri bawah (ikon speaker, silang saat mute).
- HUD step: kapsul putih pin lokasi + deretan KOTAK BERNOMOR (seperti "Tahapan Seleksi" BCA):
  selesai = cyan ✓, aktif = putih bercahaya, belum = navy transparan.
- MENU "DOMPET KARTU": latar navy radial + grid titik; kartu chapter berbentuk kartu bank (rasio 1.7,
  chip emas, label, judul, nomor "•••• •••• 2026 01", badge 🔒 Terkunci / ✓ Selesai, garis putus-putus
  untuk chapter aktif), ditumpuk bertingkat & miring, hover terangkat. Di bawah: "DOMPET BENEFIT" (chip).
- BUKU SAKU kiri: panel putih radius kanan 28px, header gradien biru + grid titik + gelombang putih,
  isi: paragraf abu, caps biru, ornamen titik, daftar fasilitas sebagai grid chip biru muda,
  foto radius 16px, tumpukan foto polaroid (klik = tukar). Tertutup: hanya tab putih "+" mengintip.
- SUBTITLE: kartu putih radius 16px border kiri cyan, label "● NARASI", teks tebal; kontrol kapsul
  putih (CC, play/pause, ulang).
- NOTIF CLAIMED gaya push m-banking: kartu putih masuk dari kanan, ikon kotak gradien + centang hijau,
  konfeti kecil (cyan/biru/emas/putih), pill biru "CLAIMED" dihantam masuk, bar timer menyusut, antre.
- TRANSISI: tiga lapis gelombang (cyan muda, cyan, biru/navy) naik bergantian dengan tepi melengkung,
  lapis teratas menampilkan "CHAPTER 02 / ASRAMA", lalu terbuka ke atas.
- CTA hover: glow ::after cyan blur 40px plus-lighter, label rotate(-3deg) scale(1.06).

EFEK TEKS (WAJIB, ini yang paling disukai)
#1 Narasi kata-per-kata: span per kata inline-block, teks gradien putih -> #bfe6fb (background-clip),
   drop-shadow glow cyan, halo navy blur di belakang paragraf.
   ROT = [-.68,.22,-.37,1.82,-.5,.3,-1.2,.8,-.4,.6,-.9,1.1]; set opacity 0, y 20, rotation ROT[i],
   origin center bottom; per = durasi/jumlahKata; gap = min(per*.6,.28); dur = min(per*2,1.1);
   to {opacity 1, y 0, rotation ROT[i]*.18, power3.out} di i*gap.
#2 Judul besar: Plus Jakarta Sans 800 uppercase, letter-spacing -.04em, tiap kata miring sendiri
   (rotate --rot, skew -4deg), text-shadow navy tebal yang bergeser (--shadow-dx/dy) + glow cyan,
   elips glow biru blur 60px di belakang. Reveal mask yPercent 110 stagger .14 1.1s power3.out.
   Mengambang: yoyo x/y ±.04/.06em & rotasi ±.8° periode 1.5s sine.inOut, bayangan menyusul
   delay .45 + i*.08, glow ikut bergeser; random ber-seed (LCG 16807). Parallax pointer ±14/±10px.
#3 Huruf melingkar pada tombol bundar (rotate(angle) translateY(-37cqh)), cincin putus-putus berputar.
#4 Judul hasil bergelombang: huruf yPercent -15 lalu kembali, stagger .04, repeat.

INTERAKSI (data-driven, semua punya "Lewati")
- carousel: kartu putih bawah, kotak cyan nomor "01 dari 04", judul biru, teks abu, tombol bulat biru;
  item boleh ganti panorama atau memutar kamera (view). Selesai setelah N item dilihat.
- hotspots: pin bulat cyan berdenyut + label kapsul, posisi {yaw,pitch} di dunia 360 (atau x/y %);
  klik = kamera menghadap titik + popup kartu putih; penghitung "x/y" di kapsul navy blur.
- choice: kartu besar bergaya kartu bank (PPTI biru / PPBP biru muda) dengan ikon bulat putih,
  opsi lain jatuh, simpan flag, claim item.
- race ("war"): hitung mundur 3-2-1-WAR!, tap tombol/Spasi melawan bar rival (emas), menang/kalah -> flag.
- hold: tahan tombol bundar, bar segmen kapsul terisi, kamera zoom (fov).
- drag: seret pegangan bundar mengikuti jalur putus-putus, jejak cyan bercahaya.
- Cabang: step punya when: { flag, equals }.

AUDIO: musik per scene (fade), narasi per step dengan cue subtitle (tanpa file = jam virtual),
SFX (tanpa file = bunyi sintetis WebAudio). Mute global.

PROGRES: localStorage (sound, subtitles, unlocked, completed, flags, claims), chapter terkunci,
hash #chapter-n, ?unlock, ?reset, ?debug.

AKSESIBILITAS & RESPONSIF: aria-label, prefers-reduced-motion, Escape, 375px (buku layar penuh,
HUD turun, tombol lanjut di atas kartu).

ALUR CERITA:
[TEMPEL BAGIAN C]

KRITERIA SELESAI: build sukses, tanpa error console, alur penuh bisa diselesaikan termasuk semua
cabang, tampil rapi di 1440×900 dan 375×812.
```

---

## BAGIAN B: Prompt lanjutan (pakai codebase ini)

```text
Baca AGENTS.md dan src/story.js dulu. Ini web cerita interaktif 360° (Vite + three.js + GSAP + Howler)
bertema BCA. Engine sudah jadi; isi cerita ada di src/story.js.

Tugas:
1. [contoh] Foto 360 sudah ada di public/assets/360/. Pasang ke step yang sesuai, atur `view`
   dan posisi hotspot {yaw, pitch} (cari dengan membuka ?debug lalu klik titik di foto).
2. [contoh] Sesuaikan teks narasi/buku saku dengan ALUR CERITA di bawah.
3. [contoh] Tambah interaksi baru "quiz" di src/interactions/ mengikuti kontrak yang sama.

Aturan: jangan menaruh teks cerita di engine; pertahankan efek teks & shader; hanya pakai warna dari
tokens.css; jalankan `npm run dev` dan tes seluruh alur (termasuk cabang) sebelum selesai.

ALUR CERITA:
[TEMPEL BAGIAN C]
```

---

## BAGIAN C: Template alur cerita

```text
[PROLOG]
360 pembuka  : The Manuscript (monumen kampus BLI)        -> 360/manuscript.jpg
Narasi       : "Kita mulai perjalanan dari pengenalan kampus dan lingkungan belajar."

[CHAPTER 01: LINGKUNGAN BELAJAR]
-> The Manuscript            | 360: manuscript.jpg | narasi: [...]
-> Ruang Kelas               | 360: kelas.jpg | narasi: [...]
-> Break pagi depan kelas    | (case/moment) [...] | NOTIF CLAIMED: Break Siang
-> Pembagian fasilitas       | PILIHAN: PPTI -> claim Laptop, PPBP -> claim Kalkulator
                               + semua claim Almamater (identitas kampus)
-> War makanan               | MINI-GAME: menang -> Stall (bisa cek kondisi sebelahnya)
                                            kalah  -> Buffet
-> Stall / Buffet            | cabang sesuai hasil war [...]
-> Kelas lagi                | membicarakan tempat istirahat -> lanjut ke ASRAMA

[CHAPTER 02: ASRAMA]
Cover 360    : depan asrama                                -> 360/depan-asrama.jpg
-> Fasilitas kamar           | CAROUSEL + kamera berputar ke tiap fasilitas: [...]
-> Ruang serba guna          | HOTSPOT 360: dapur (dekat serba guna), UKS, musola
-> Plaza                     | [...]
-> Theater                   | TAHAN tombol: [...]
-> Komunal 1, 2, 3, 5        | CAROUSEL, tiap item ganti foto 360
-> Co-working space          | GESER kartu akses -> NOTIF CLAIMED: Asrama

[PENUTUP]
Narasi       : [...]
Kartu akhir  : judul [SAMPAI JUMPA], dompet benefit, tombol [Ulangi perjalanan] [+ link opsional]
```

---

## BAGIAN D: Foto 360 & aset

- **Format**: equirectangular 2:1, JPG kualitas 80-85%, **4096×2048** (maks 8192×4096). Kamera 360
  (Insta360/Ricoh Theta) atau HP mode panorama 360 / Google Street View app → ekspor equirectangular.
- Tinggi kamera ±150 cm, di tengah ruangan, hindari orang lewat.
- `yaw 0` = tengah foto. Arahkan bagian terpenting ke tengah saat ekspor supaya `view` mudah.
- Video 360 (opsional): mp4 H.264 equirectangular 3840×1920 30fps / 2560×1280 untuk HP, tanpa audio.
- Efek lukisan terlalu kuat untuk foto tertentu? turunkan `art.paint` (0 = foto asli).
- Daftar nama file ada di `public/assets/README.md`.

---

## Lampiran: hasil bedah web referensi (untuk konteks)

Diuji langsung di browser: https://weekend-mm-2026-pasticcino-bag-master.monogrid.io/en/
- Stack: Vue 3, three.js (video 15fps + diffuse/depth .ktx2 + bump/normal overlay + alpha vignette
  untuk efek lukisan & tepi sobek), GSAP, Howler, UnoCSS/Tailwind, font Nimbus Sans / Nimbus Sans Extended.
- Alur: loading pita film -> "Start now" (aktifkan suara) -> intro kereta (narasi kata-per-kata,
  skip intro) -> form email (skip) -> 3 chapter (cover judul + Explore; carousel kain; tahan untuk
  memahat marmer; 3 mini-step drag gunting/lem) -> "Unlock the gift" -> outro kereta -> form hadiah.
- UI: logo kiri atas, tombol menu kayu, tombol musik kayu, menu kartu chapter bertumpuk dengan stiker
  "locked chapter", buku info kiri (panel miring 4° mengintip, isi scroll + tumpukan foto),
  subtitle di kertas bergaris kanan bawah + kontrol CC/play/replay, transisi pola kain diagonal.
- Parameter efek teks yang diambil: lihat EFEK TEKS di Bagian A (#1-#4).
