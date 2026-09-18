# Aset media

Semua file opsional. Kalau belum ada, aplikasi memakai placeholder otomatis.
Nama file di bawah sesuai `src/story.js` (ubah di sana kalau mau nama lain).
Tiga foto dari pengguna sudah dipasang: `360/kelas.jpg` (panorama ruang kelas),
`360/depan-kelas.jpg` (panorama koridor/area break), dan
`photos/manuscript-building.webp` (foto biasa The Manuscript untuk cover/prolog).
Foto The Manuscript **bukan** equirectangular 2:1, jadi ditampilkan sebagai gambar datar,
bukan panorama 360° palsu. Pastikan izin penggunaan foto sebelum publikasi.

## brand/
| File | Keterangan |
| --- | --- |
| `logo.png` | Logo resmi versi **putih** (PNG transparan/SVG), tinggi ±88px |

## 360/ (equirectangular 2:1, disarankan 4096×2048 JPG ±1-2 MB)
| File | Dipakai di |
| --- | --- |
| `kelas.jpg` ✅ | Ruang kelas, pembagian fasilitas, kelas lagi |
| `depan-kelas.jpg` ✅ | Break pagi |
| `area-makan.jpg` | War makan siang |
| `stall.jpg` | Cabang menang (stall) |
| `buffet.jpg` | Cabang kalah (buffet) |
| `depan-asrama.jpg` | Cover asrama & penutup |
| `kamar.jpg` | Fasilitas kamar |
| `serba-guna.jpg` | Ruang serba guna (hotspot dapur, UKS, musola) |
| `plaza.jpg` | Plaza |
| `theater.jpg` | Theater |
| `komunal-1.jpg`, `komunal-2.jpg`, `komunal-3.jpg`, `komunal-5.jpg` | Ruang komunal |
| `coworking.jpg` | Co-working space |

## photos/ dan foto/
`photos/manuscript-building.webp` ✅ dipakai di cover homepage, prolog, step
The Manuscript, dan buku saku. Buku saku juga memakai dua panorama yang tersedia
untuk foto ruang kelas/break. Yang masih belum ada: foto area makan dan depan asrama.

## audio/ (mp3)
- Musik: `track-intro.mp3`, `track-kampus.mp3`, ... (isi `music` di story.js)
- Narasi: `vo-*.mp3` (isi `narration.src`, cue subtitle tetap di `narration.cues`)
- SFX: `sfx-click.mp3`, `sfx-hover.mp3`, `sfx-whoosh.mp3`, `sfx-success.mp3` (isi `audio.sfx`)
