# AGENTS.md: panduan untuk AI agent (Claude, Codex, Cursor, Copilot, Gemini, dll.)

Baca file ini sebelum mengubah kode. Semua agent memakai aturan yang sama.

## Ringkasan project

**Campus Tour 360° PPTI & PPBP**: web cerita interaktif untuk pengenalan beasiswa PPTI/PPBP di kampus
BCA Learning Institute (BLI). Pengguna menjelajah foto **360°** yang dirender bergaya **lukisan**
(shader Three.js), mengikuti alur cerita per chapter, melakukan interaksi kecil, dan meng-**claim**
benefit (notifikasi + dompet benefit).

- Referensi pengalaman: https://weekend-mm-2026-pasticcino-bag-master.monogrid.io/en/ (hanya rasa gerak
  dan struktur; **jangan** menyalin aset, teks, atau logonya).
- Tema visual: warna BCA (biru #0060af, navy #00336e, cyan #1ba0e2, putih). Logo resmi disediakan user
  di `public/assets/brand/logo.png`; jangan menggambar ulang atau memalsukan logo.
- Bahasa UI & konten: Bahasa Indonesia.

## Perintah

```bash
npm install
npm run dev        # http://localhost:5190
npm run build      # hasil di dist/
npm run preview
```

Parameter URL untuk tes:
- `?unlock`: buka semua chapter & outro
- `?reset`: hapus progres (localStorage `web-cerita:v1`)
- `?debug`: tampilkan yaw/pitch kamera; klik foto 360 untuk mendapat koordinat hotspot/view
- `#chapter-2` / `#outro`: langsung ke sana setelah menekan tombol mulai (harus sudah terbuka)

## Arsitektur

```
index.html            layer: canvas#painter, main#stage, #ui, #overlay
src/main.js           bootstrap: painter, audio, UI, router, loader, ?debug
src/story.js          SEMUA konten cerita (satu-satunya file yang diedit untuk alur)
src/core/
  painter.js          renderer Three.js: 360 (equirect) + flat, efek lukisan, kamera, project/unproject
  placeholder.js      gambar/panorama prosedural jika file media belum ada
  text-fx.js          efek teks (narasi kata-per-kata, judul mengambang, huruf melingkar, gelombang)
  audio.js            Howler: musik, narasi+cue subtitle (jam virtual jika tanpa file), SFX sintetis
  store.js            state + localStorage (sound, subtitles, unlocked, completed, flags, claims)
  router.js           intro -> chapter-n -> outro, kunci chapter, transisi
src/scenes/
  scope.js            umur scene (guard promise, cleanup) + passes(when, flags)
  intro.js            Kartu Peserta (gerbang) + prolog
  chapter.js          cover chapter + runner step (intro teks -> interaksi -> claim -> hasil -> lanjut)
  outro.js            narasi penutup + Kartu "Tur selesai"
src/interactions/     carousel, hotspots, choice, race, hold, drag (+ shared.js, index.js registry)
src/ui/               chrome (header/logo/musik), menu (dompet kartu), book (buku saku kiri),
                      subtitles (catatan narasi + kontrol), notif (CLAIMED), transition (gelombang), loader
src/styles/           tokens.css (warna BCA), base.css, ui.css, scenes.css, interactions.css
public/assets/        media (lihat public/assets/README.md)
```

### Kontrak penting

**Scene**: `fooScene(ctx, ...)` langsung mengembalikan `{ leave() }`; alur async dijalankan di dalam IIFE
dan setiap `await` dibungkus `scope.guard()` / `scope.wait()` supaya berhenti saat scene ditinggalkan.

**Interaksi**: `fn(config, { painter, notif, store })` mengembalikan
`{ root, done: Promise<result>, destroy(), skip() }` (buat dengan `createShell()` dari `shared.js`).
- `result.goto` (opsional) = id step tujuan.
- Tipe `carousel` & `hotspots` tetap aktif setelah `done` (lihat `PERSISTENT` di chapter.js).
- Daftarkan tipe baru di `src/interactions/index.js`.

**Painter**:
- `show(media, { duration, view })`: media `{ pano | image | video, placeholder, depth?, scrub?, zoomFov? }`
- `lookAt({ yaw, pitch, fov }, { duration })`: derajat; yaw 0 = tengah foto, + ke kanan
- `project(yaw, pitch)` -> `{ x, y, visible }` (px layar); `unproject(x, y)` -> `{ yaw, pitch }`
- `setProgress(p)`: zoom (flat: skala, 360: fov) + scrub video
- `onFrame(fn)`, `on('look'|'tap', fn)`, `lockAutoRotate()` -> fungsi pelepas

**story.js (skema step)**:
```js
{
  id, location, when: { flag, equals | not | in },
  media: pano('/assets/360/x.jpg', 'indoor'), view: { yaw, pitch, fov },
  narration: { src?, cues: [{ t, text }], duration? },
  intro: { rows: ['Judul'], text, hold },
  interaction: { type, ...config },
  claim: { id, icon, kicker, label, text } | [ ... ],
  result: { kicker, title, text, media?, view?, goto? },
  book: { kicker, title, sections: [...] },   // override buku saku
  nextLabel, skipLabel, skippable,
}
```

## Aturan desain (jangan dilanggar tanpa diminta)

1. **Efek teks** di `text-fx.js` adalah ciri utama yang disukai user: narasi kata-per-kata
   (ROT array, `gap = min(per*.6,.28)`, `dur = min(per*2,1.1)`, power3.out), judul dengan mask reveal
   (yPercent 110, stagger .14), judul mengambang dengan bayangan tertinggal (`--shadow-dx/dy`) + glow.
   Boleh ubah warna/font, jangan ubah timing tanpa alasan.
2. **Gaya lukisan** di shader (Kuwahara + relief kuas + duotone + tepi kuas biru) dipertahankan;
   atur intensitas lewat `story.art`, bukan menghapus pass.
3. Warna UI hanya dari token di `tokens.css`. Komponen bergaya kartu bank/m-banking (kartu peserta,
   dompet kartu, push notif), bentuk bulat, bayangan navy lembut, grid titik & gelombang.
4. Teks cerita **tidak boleh** ditulis di engine; semua di `story.js`.
5. Semua media opsional: file hilang -> placeholder, aplikasi tidak boleh crash.
6. Aksesibilitas: `aria-label` di tombol, `prefers-reduced-motion`, Escape menutup menu/buku,
   bisa dipakai di 375px.
7. Jangan menaruh elemen yang bisa diklik di atas canvas tanpa `pointer-events: auto` (canvas menerima drag 360).

## Checklist verifikasi sebelum selesai

- [ ] `npm run build` sukses, console browser tanpa error.
- [ ] Alur penuh: loader -> kartu peserta -> prolog -> chapter 1 (termasuk cabang stall & buffet)
      -> chapter 2 -> outro -> ulangi perjalanan.
- [ ] Drag 360 berputar, hotspot menempel di posisi dunia, popup mengikuti.
- [ ] Menu: chapter terkunci tidak bisa diklik, dompet benefit tampil.
- [ ] Tampilan 1440×900 dan 375×812 tidak ada yang bertumpuk.

## Ide lanjutan (belum dibuat)

- Giroskop HP untuk 360 (DeviceOrientation + izin iOS).
- Mini-map kampus di menu, kuis, video 360 per lokasi, i18n EN.
