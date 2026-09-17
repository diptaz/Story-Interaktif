# Campus Tour 360° PPTI & PPBP

Web cerita interaktif: jelajah kampus BLI lewat foto 360° bergaya lukisan, alur per chapter,
interaksi kecil, dan claim benefit. Tema warna BCA.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5190

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
