// Audio: musik latar per scene, narasi (voice over), dan SFX.
// Semua file opsional: kalau src kosong, SFX memakai bunyi sintetis kecil
// dan narasi memakai "jam virtual" supaya subtitle tetap jalan.
import { Howl, Howler } from 'howler';
import { store } from './store.js';

const howls = new Map();
let sfxMap = {};
let music = null;
let musicSrc = null;

function getHowl(src, opts = {}) {
  const key = `${src}|${opts.loop ? 1 : 0}|${opts.html5 ? 1 : 0}`;
  if (!howls.has(key)) {
    howls.set(
      key,
      new Howl({
        src: [src],
        loop: !!opts.loop,
        html5: !!opts.html5,
        volume: opts.volume ?? 1,
        onloaderror: () => console.warn('[audio] gagal memuat', src),
      }),
    );
  }
  return howls.get(key);
}

// Bunyi sintetis pengganti SFX yang belum ada filenya.
function synth(type) {
  const ctx = Howler.ctx;
  if (!ctx || !Howler.masterGain) return;
  const presets = {
    hover: { f: 880, f2: 1320, d: 0.06, v: 0.025, wave: 'sine' },
    click: { f: 520, f2: 260, d: 0.09, v: 0.06, wave: 'triangle' },
    whoosh: { f: 180, f2: 60, d: 0.5, v: 0.05, wave: 'sawtooth' },
    success: { f: 660, f2: 990, d: 0.35, v: 0.05, wave: 'sine' },
  };
  const p = presets[type] ?? presets.click;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = p.wave;
  osc.frequency.setValueAtTime(p.f, t);
  osc.frequency.exponentialRampToValueAtTime(p.f2, t + p.d);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(p.v, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + p.d);
  osc.connect(gain).connect(Howler.masterGain);
  osc.start(t);
  osc.stop(t + p.d + 0.02);
}

export const audio = {
  init(story) {
    sfxMap = story.audio?.sfx ?? {};
    Howler.mute(!store.state.sound);
    store.on('sound', (on) => Howler.mute(!on));
  },

  // Wajib dipanggil dari klik user (kebijakan autoplay browser).
  unlock() {
    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'suspended') ctx.resume();
  },

  playMusic(src, volume = 0.45) {
    if (src === musicSrc) return;
    const prev = music;
    if (prev) {
      prev.fade(prev.volume(), 0, 900);
      setTimeout(() => prev.stop(), 950);
    }
    musicSrc = src ?? null;
    music = null;
    if (!src) return;
    music = getHowl(src, { loop: true, html5: true });
    music.volume(0);
    music.play();
    music.fade(0, volume, 1200);
  },

  sfx(name) {
    const src = sfxMap[name];
    if (src) getHowl(src).play();
    else synth(name);
  },

  // Narasi + subtitle. cues: [{ t: detik, text }] (akhir cue = awal cue berikutnya)
  narration({ src = null, cues = [], duration = null } = {}) {
    return createNarration(src, cues, duration);
  },
};

function createNarration(src, cues, duration) {
  const sorted = [...cues].sort((a, b) => a.t - b.t);
  const fallbackDuration = duration ?? (sorted.length ? sorted.at(-1).t + 3 : 6);
  const handlers = { time: new Set(), end: new Set(), state: new Set() };
  let voice = src ? getHowl(src, { html5: true }) : null;
  // File narasi gagal dimuat -> pakai jam virtual.
  const onVoiceError = () => {
    voice = null;
  };
  voice?.once('loaderror', onVoiceError);

  let playing = false;
  let virtualTime = 0;
  let lastTick = 0;
  let raf = 0;
  let ended = false;

  const total = () => (voice && voice.duration() ? voice.duration() : fallbackDuration);
  const now = () => (voice ? voice.seek() || 0 : virtualTime);

  function cueAt(t) {
    let current = null;
    for (const cue of sorted) if (t >= cue.t) current = cue;
    return current;
  }

  function tick(ts) {
    if (!playing) return;
    if (!voice) {
      virtualTime += lastTick ? (ts - lastTick) / 1000 : 0;
      lastTick = ts;
    }
    const t = now();
    handlers.time.forEach((fn) => fn(t, cueAt(t)));
    if (!ended && t >= total() - 0.05) {
      ended = true;
      api.pause();
      handlers.end.forEach((fn) => fn());
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  const api = {
    get playing() {
      return playing;
    },
    get duration() {
      return total();
    },
    play() {
      if (playing) return;
      if (voice && voice.state() === 'unloaded') voice = null; // sudah gagal dimuat sebelumnya
      if (ended) api.seek(0);
      playing = true;
      lastTick = 0;
      voice?.play();
      raf = requestAnimationFrame(tick);
      handlers.state.forEach((fn) => fn(true));
    },
    pause() {
      playing = false;
      cancelAnimationFrame(raf);
      voice?.pause();
      handlers.state.forEach((fn) => fn(false));
    },
    seek(t) {
      ended = false;
      virtualTime = t;
      voice?.seek(t);
    },
    replay() {
      api.pause();
      api.seek(0);
      api.play();
    },
    stop() {
      api.pause();
      voice?.stop();
      voice?.off('end', onVoiceEnd);
      voice?.off('loaderror', onVoiceError);
      Object.values(handlers).forEach((set) => set.clear());
    },
    on(event, fn) {
      handlers[event].add(fn);
      return () => handlers[event].delete(fn);
    },
  };
  function onVoiceEnd() {
    if (ended) return;
    ended = true;
    api.pause();
    handlers.end.forEach((fn) => fn());
  }
  voice?.on('end', onVoiceEnd);
  return api;
}
