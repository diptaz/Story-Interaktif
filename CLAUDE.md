# CLAUDE.md

Instruksi lengkap project ada di AGENTS.md (dipakai bersama agent lain):

@AGENTS.md

## Khusus Claude Code

- Dev server untuk preview ada di `D:\lomba\Project\.claude\launch.json` dengan nama `web-cerita`
  (port 5190). Gunakan preview browser untuk memverifikasi perubahan tampilan/alur.
- Cara cepat mengetes: `http://localhost:5190/?unlock#chapter-2` lalu klik "Mulai jelajah".
  Objek debug tersedia di console: `window.__story` (painter, router, ui, story).
- Saat menambah fitur, perbarui juga AGENTS.md (kontrak/skema) dan PROMPT.md bila spesifikasinya berubah.
