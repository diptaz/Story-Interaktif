// Umur sebuah scene. Setelah leave(), semua promise yang di-guard tidak pernah
// selesai -> alur async scene berhenti dengan sendirinya.
import gsap from 'gsap';

export function createScope() {
  let alive = true;
  const cleanups = [];
  const halt = new Promise(() => {});
  return {
    get alive() {
      return alive;
    },
    add(fn) {
      cleanups.push(fn);
      return fn;
    },
    guard(promise) {
      return Promise.resolve(promise).then((v) => (alive ? v : halt));
    },
    wait(seconds) {
      return this.guard(new Promise((r) => gsap.delayedCall(seconds, r)));
    },
    leave() {
      alive = false;
      cleanups.splice(0).reverse().forEach((fn) => fn());
    },
  };
}

// Syarat step: when: { flag, equals } | { flag, not } | { flag, in: [...] } | { flag }
export function passes(when, flags) {
  if (!when) return true;
  const v = flags[when.flag];
  if ('equals' in when) return v === when.equals;
  if ('not' in when) return v !== when.not;
  if ('in' in when) return when.in.includes(v);
  return !!v;
}
