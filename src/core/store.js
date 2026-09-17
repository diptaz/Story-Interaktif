// State global + event kecil + simpan progres ke localStorage.
const KEY = 'web-cerita:v1';
const PERSIST = ['sound', 'subtitles', 'unlocked', 'completed', 'flags', 'claims'];

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

const saved = load();
const listeners = new Map();

export const store = {
  state: {
    sound: saved.sound ?? true,
    subtitles: saved.subtitles ?? true,
    unlocked: saved.unlocked ?? 1, // jumlah chapter yang sudah terbuka (min 1)
    completed: saved.completed ?? [], // id chapter yang sudah selesai
    flags: saved.flags ?? {}, // hasil pilihan pemain (untuk alur bercabang)
    claims: saved.claims ?? [], // item yang sudah di-claim: [{ id, label, icon }]
    route: null, // 'intro' | 'chapter-1' | ... | 'outro'
    menuOpen: false,
    bookOpen: false,
  },

  set(patch) {
    Object.assign(this.state, patch);
    try {
      const data = Object.fromEntries(PERSIST.map((k) => [k, this.state[k]]));
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* private mode: progres tidak tersimpan, aplikasi tetap jalan */
    }
    for (const key of Object.keys(patch)) emit(key, this.state[key]);
  },

  on(key, fn) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(fn);
    return () => listeners.get(key).delete(fn);
  },

  setFlag(name, value) {
    this.set({ flags: { ...this.state.flags, [name]: value } });
  },

  // true kalau item baru (belum pernah di-claim)
  claim(item) {
    if (this.state.claims.some((c) => c.id === item.id)) return false;
    this.set({ claims: [...this.state.claims, item] });
    return true;
  },

  completeChapter(index, total) {
    const completed = [...new Set([...this.state.completed, index])];
    this.set({ completed, unlocked: Math.min(total, Math.max(this.state.unlocked, index + 2)) });
  },

  resetProgress() {
    this.set({ unlocked: 1, completed: [], flags: {}, claims: [] });
  },
};

function emit(key, value) {
  listeners.get(key)?.forEach((fn) => fn(value));
}
