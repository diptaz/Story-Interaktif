// Registry interaksi. Tambah tipe baru: buat file, lalu daftarkan di sini.
// Kontrak: fn(config, api) -> { root, done: Promise, destroy(), skip() }
import { carousel } from './carousel.js';
import { hotspots } from './hotspots.js';
import { choice } from './choice.js';
import { race } from './race.js';
import { hold } from './hold.js';
import { drag } from './drag.js';

export const interactions = { carousel, hotspots, choice, race, hold, drag };
