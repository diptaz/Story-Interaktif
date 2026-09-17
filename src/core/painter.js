// Renderer "lukisan hidup" (Three.js, satu quad layar penuh).
//
// Dua mode media:
//  - pano (360°): foto/video equirectangular 2:1, bisa di-drag untuk melihat sekeliling,
//    kamera (yaw/pitch/fov) bisa dianimasikan per step, titik hotspot menempel di dunia 360.
//  - flat: foto/video biasa (cover), parallax dari depth map + mouse.
//
// Efek (dua mode): filter kuas (Kuwahara berputar), relief sapuan kuas, goresan halus,
// color grading duotone (bayangan biru BCA), vignette, grain, tepi kuas sobek,
// dan transisi larut bernoise antar media.
import * as THREE from 'three';
import gsap from 'gsap';
import { makeDepth, makePanorama, makePlaceholder } from './placeholder.js';

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform sampler2D uMapA;
uniform sampler2D uMapB;
uniform sampler2D uDepthA;
uniform sampler2D uDepthB;
uniform vec2 uSizeA;
uniform vec2 uSizeB;
uniform float uDepthOnA;
uniform float uDepthOnB;
uniform float uPanoA;
uniform float uPanoB;

uniform vec2 uScreen;
uniform float uMix;
uniform vec2 uMouse;
uniform float uTime;
uniform float uZoom;
uniform float uYaw;
uniform float uPitch;
uniform float uFov;

uniform float uPaint;
uniform float uBrush;
uniform float uStroke;
uniform float uScratch;
uniform float uParallax;
uniform float uEdge;
uniform vec3 uEdgeColor;
uniform float uGrain;
uniform float uGrade;
uniform vec3 uShadowTint;
uniform vec3 uHighlightTint;

const float PI = 3.14159265;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

vec2 coverScale(vec2 size) {
  float sa = uScreen.x / uScreen.y;
  float ta = size.x / size.y;
  return sa > ta ? vec2(1.0, ta / sa) : vec2(sa / ta, 1.0);
}

vec2 flatUv(vec2 uv, vec2 size, sampler2D depthTex, float depthOn) {
  vec2 c = (uv - 0.5) * coverScale(size) + 0.5;
  float fakeDepth = 1.0 - uv.y * 0.9;
  float d = mix(fakeDepth, texture2D(depthTex, c).r, depthOn);
  vec2 drift = vec2(sin(uTime * 0.07), cos(uTime * 0.05)) * 0.004;
  c = (c - 0.5) / (1.07 + uZoom) + 0.5;
  return c + uMouse * (d - 0.5) * uParallax + drift;
}

// Arah pandang per piksel -> koordinat equirectangular.
vec2 panoUv(vec2 uv) {
  vec2 ndc = uv * 2.0 - 1.0;
  float aspect = uScreen.x / uScreen.y;
  float t = tan(uFov * 0.5);
  float yaw = uYaw + uMouse.x * 0.02;
  float pitch = uPitch + uMouse.y * 0.012;
  vec3 f = vec3(sin(yaw) * cos(pitch), sin(pitch), -cos(yaw) * cos(pitch));
  vec3 r = normalize(vec3(-f.z, 0.0, f.x));
  vec3 u = cross(r, f);
  vec3 d = normalize(f + r * ndc.x * t * aspect + u * ndc.y * t);
  float lon = atan(d.x, -d.z);
  float lat = asin(clamp(d.y, -1.0, 1.0));
  return vec2(lon / (2.0 * PI) + 0.5, lat / PI + 0.5);
}

// Kuwahara 4 kuadran dengan grid yang diputar -> tampak seperti sapuan kuas.
vec3 kuwahara(sampler2D tex, vec2 uv, vec2 texel, mat2 rot) {
  vec3 m0 = vec3(0.0); vec3 m1 = vec3(0.0); vec3 m2 = vec3(0.0); vec3 m3 = vec3(0.0);
  vec3 s0 = vec3(0.0); vec3 s1 = vec3(0.0); vec3 s2 = vec3(0.0); vec3 s3 = vec3(0.0);
  for (int j = 0; j <= 2; j++) {
    for (int i = 0; i <= 2; i++) {
      vec2 o = vec2(float(i), float(j));
      vec3 c;
      c = texture2D(tex, uv + rot * vec2(-o.x, -o.y) * texel).rgb; m0 += c; s0 += c * c;
      c = texture2D(tex, uv + rot * vec2( o.x, -o.y) * texel).rgb; m1 += c; s1 += c * c;
      c = texture2D(tex, uv + rot * vec2( o.x,  o.y) * texel).rgb; m2 += c; s2 += c * c;
      c = texture2D(tex, uv + rot * vec2(-o.x,  o.y) * texel).rgb; m3 += c; s3 += c * c;
    }
  }
  m0 /= 9.0; m1 /= 9.0; m2 /= 9.0; m3 /= 9.0;
  s0 = abs(s0 / 9.0 - m0 * m0); s1 = abs(s1 / 9.0 - m1 * m1);
  s2 = abs(s2 / 9.0 - m2 * m2); s3 = abs(s3 / 9.0 - m3 * m3);
  float v0 = s0.r + s0.g + s0.b; float v1 = s1.r + s1.g + s1.b;
  float v2 = s2.r + s2.g + s2.b; float v3 = s3.r + s3.g + s3.b;
  vec3 col = m0; float mv = v0;
  if (v1 < mv) { mv = v1; col = m1; }
  if (v2 < mv) { mv = v2; col = m2; }
  if (v3 < mv) { mv = v3; col = m3; }
  return col;
}

vec3 slotColor(sampler2D map, vec2 size, sampler2D depth, float depthOn, float pano, mat2 rot) {
  vec2 uv;
  vec2 texel;
  if (pano > 0.5) {
    uv = panoUv(vUv);
    float a = uBrush * 2.0 * tan(uFov * 0.5) / uScreen.y;
    texel = vec2(a / (2.0 * PI), a / PI);
  } else {
    uv = flatUv(vUv, size, depth, depthOn);
    texel = vec2(uBrush) / uScreen * coverScale(size);
  }
  vec3 raw = texture2D(map, uv).rgb;
  if (uPaint < 0.01) return raw;
  return mix(raw, kuwahara(map, uv, texel, rot), uPaint);
}

float strokeHeight(vec2 px) {
  mat2 r1 = mat2(0.94, 0.34, -0.34, 0.94);
  mat2 r2 = mat2(0.5, -0.87, 0.87, 0.5);
  vec2 p1 = r1 * px;
  vec2 p2 = r2 * px;
  float a = fbm(vec2(p1.x / 46.0, p1.y / 3.4));
  float b = fbm(vec2(p2.x / 40.0, p2.y / 3.0));
  float c = fbm(vec2(px.x / 3.2, px.y / 36.0));
  float m1 = smoothstep(0.35, 0.65, fbm(px / 260.0));
  float m2 = smoothstep(0.4, 0.7, fbm(px / 330.0 + 9.0));
  return mix(mix(a, b, m1), c, m2 * 0.6);
}

float scratches(vec2 px) {
  vec2 p = px / 110.0;
  vec2 cell = floor(p);
  vec2 f = fract(p) - 0.5;
  if (hash(cell) > 0.3) return 0.0;
  float ang = hash(cell + 3.1) * 6.2831;
  vec2 d = vec2(cos(ang), sin(ang));
  float along = dot(f, d);
  float across = dot(f, vec2(-d.y, d.x)) + along * along * (hash(cell + 7.0) - 0.5) * 1.6;
  return smoothstep(0.014, 0.0, abs(across)) * smoothstep(0.32, 0.08, abs(along));
}

float tornMask(vec2 px) {
  float dx = min(px.x, uScreen.x - px.x);
  float dy = min(px.y, uScreen.y - px.y);
  float nx = fbm(vec2(px.y / 18.0, dx / 70.0));
  float ny = fbm(vec2(px.x / 18.0, dy / 70.0));
  float ex = dx - uEdge * (0.25 + nx * 1.5);
  float ey = dy - uEdge * (0.25 + ny * 1.5);
  float e = min(ex, ey);
  float dryX = step(0.64, noise(vec2(px.x / 2.5, px.y / 38.0)));
  float dryY = step(0.64, noise(vec2(px.x / 38.0, px.y / 2.5)));
  float dry = (dx < dy ? dryX : dryY) * (1.0 - smoothstep(0.0, uEdge * 0.9, e));
  return clamp(smoothstep(0.0, 1.5, e) - dry, 0.0, 1.0);
}

void main() {
  vec2 px = vUv * uScreen;
  float ang = fbm(px / 380.0) * 3.1416;
  mat2 rot = mat2(cos(ang), sin(ang), -sin(ang), cos(ang));

  vec3 col = slotColor(uMapA, uSizeA, uDepthA, uDepthOnA, uPanoA, rot);
  if (uMix > 0.001) {
    vec3 colB = slotColor(uMapB, uSizeB, uDepthB, uDepthOnB, uPanoB, rot);
    float n = fbm(vUv * vec2(uScreen.x / uScreen.y, 1.0) * 3.0);
    float t = smoothstep(n - 0.12, n + 0.12, uMix * 1.24 - 0.12);
    col = mix(col, colB, t);
  }

  // relief sapuan kuas
  float h = strokeHeight(px);
  vec3 nrm = normalize(vec3(-dFdx(h) * 5.0, -dFdy(h) * 5.0, 1.0));
  float lit = dot(nrm, normalize(vec3(-0.45, 0.6, 0.66)));
  col *= mix(1.0, 0.7 + lit * 0.42, uStroke);
  col += scratches(px) * uScratch;

  // grading duotone (bayangan -> biru, highlight -> putih hangat)
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, mix(uShadowTint, uHighlightTint, smoothstep(0.0, 1.0, l)), uGrade);
  float vig = smoothstep(1.2, 0.3, length((vUv - 0.5) * vec2(1.15, 1.3)));
  col *= mix(0.72, 1.0, vig);
  col += (hash(px + fract(uTime) * 91.0) - 0.5) * uGrain;

  vec3 edge = uEdgeColor * (0.82 + 0.36 * fbm(px / 30.0));
  col = mix(edge, col, tornMask(px));

  gl_FragColor = vec4(col, 1.0);
}
`;

const DEG = Math.PI / 180;

function prepare(tex, { repeat = false } = {}) {
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.wrapS = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function loadImage(src, opts) {
  return new THREE.TextureLoader().loadAsync(src).then((tex) => ({
    tex: prepare(tex, opts),
    size: [tex.image.naturalWidth || tex.image.width, tex.image.naturalHeight || tex.image.height],
  }));
}

function loadVideo(src, media, opts) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    Object.assign(video, { src, muted: true, loop: !media.scrub, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
    video.setAttribute('playsinline', '');
    const timer = setTimeout(() => reject(new Error('timeout video')), 12000);
    video.addEventListener(
      'loadeddata',
      () => {
        clearTimeout(timer);
        resolve({ tex: prepare(new THREE.VideoTexture(video), opts), size: [video.videoWidth, video.videoHeight], video });
      },
      { once: true },
    );
    video.addEventListener('error', () => reject(new Error('video error')), { once: true });
    video.load();
  });
}

// Warna dipakai apa adanya (shader tidak mengonversi sRGB).
const rawColor = (hex) => new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);

export class Painter {
  constructor(canvas, options = {}) {
    this.opts = {
      paint: 0.85, // kekuatan filter kuas 0..1 (0 = foto asli)
      brush: 2.2, // ukuran sapuan kuas (px)
      stroke: 0.4, // relief sapuan kuas 0..1
      scratch: 0.05,
      parallax: 0.035, // media flat
      edge: 26, // tebal tepi kuas (px)
      edgeColor: '#0a4a9c',
      grain: 0.035,
      grade: 0.2, // kekuatan duotone
      shadowTint: '#0a2a66',
      highlightTint: '#fff9f0',
      fov: 75, // derajat, media 360
      autoRotate: 1.2, // derajat/detik saat diam (0 = mati)
      maxDpr: 1.5,
      ...options,
    };
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.blank = prepare(new THREE.DataTexture(new Uint8Array([10, 40, 90, 255]), 1, 1));
    const u = (value) => ({ value });
    const o = this.opts;
    this.uniforms = {
      uMapA: u(this.blank), uMapB: u(this.blank), uDepthA: u(this.blank), uDepthB: u(this.blank),
      uSizeA: u(new THREE.Vector2(16, 10)), uSizeB: u(new THREE.Vector2(16, 10)),
      uDepthOnA: u(0), uDepthOnB: u(0), uPanoA: u(0), uPanoB: u(0),
      uScreen: u(new THREE.Vector2(1, 1)), uMix: u(0), uMouse: u(new THREE.Vector2()), uTime: u(0), uZoom: u(0),
      uYaw: u(0), uPitch: u(0), uFov: u(o.fov * DEG),
      uPaint: u(o.paint), uBrush: u(2), uStroke: u(o.stroke), uScratch: u(o.scratch), uParallax: u(o.parallax),
      uEdge: u(30), uEdgeColor: u(rawColor(o.edgeColor)), uGrain: u(o.grain),
      uGrade: u(o.grade), uShadowTint: u(rawColor(o.shadowTint)), uHighlightTint: u(rawColor(o.highlightTint)),
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: this.uniforms, depthTest: false });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    // kamera 360 (derajat). zoomFov dikurangi oleh progres interaksi.
    this.cam = { yaw: 0, pitch: 0, fov: o.fov, zoomFov: 0 };
    this.velocity = { yaw: 0, pitch: 0 };
    this.lastInput = 0;
    this.autoRotateLocks = 0;
    this.mouseTarget = new THREE.Vector2();
    this.cache = new Map();
    this.slotA = null;
    this.token = 0;
    this.frameListeners = new Set();

    addEventListener('pointermove', (e) => {
      this.mouseTarget.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
    });
    addEventListener('resize', () => this.resize());
    this.installLookControls();
    this.resize();
    this.render = this.render.bind(this);
    gsap.ticker.add(this.render);
  }

  get isPano() {
    return !!this.slotA?.pano;
  }

  /* ------------------------------ kontrol 360 ------------------------------ */
  installLookControls() {
    const c = this.canvas;
    let drag = null;
    c.addEventListener('pointerdown', (e) => {
      if (!this.isPano) return;
      drag = { x: e.clientX, y: e.clientY, moved: 0 };
      try {
        c.setPointerCapture(e.pointerId);
      } catch {
        /* abaikan */
      }
      this.velocity.yaw = this.velocity.pitch = 0;
      gsap.killTweensOf(this.cam, 'yaw,pitch');
      c.classList.add('is-dragging');
    });
    c.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const degPerPx = this.currentFov() / innerHeight;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      this.cam.yaw -= dx * degPerPx;
      this.cam.pitch = gsap.utils.clamp(-80, 80, this.cam.pitch + dy * degPerPx);
      this.velocity.yaw = -dx * degPerPx;
      this.velocity.pitch = dy * degPerPx;
      this.lastInput = performance.now();
      if (drag.moved > 6) this.emit('look');
    });
    const end = (e) => {
      if (!drag) return;
      if (drag.moved < 6) this.emit('tap', e);
      drag = null;
      c.classList.remove('is-dragging');
      this.lastInput = performance.now();
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener(
      'wheel',
      (e) => {
        if (!this.isPano) return;
        e.preventDefault();
        this.cam.fov = gsap.utils.clamp(40, 95, this.cam.fov + e.deltaY * 0.03);
        this.lastInput = performance.now();
      },
      { passive: false },
    );
  }

  handlers = { look: new Set(), tap: new Set() };
  on(event, fn) {
    this.handlers[event].add(fn);
    return () => this.handlers[event].delete(fn);
  }
  emit(event, data) {
    this.handlers[event].forEach((fn) => fn(data));
  }

  // Hentikan putar otomatis selama ada interaksi yang butuh klik presisi. Return: fungsi pelepas.
  lockAutoRotate() {
    this.autoRotateLocks += 1;
    let released = false;
    return () => {
      if (!released) this.autoRotateLocks -= 1;
      released = true;
    };
  }

  currentFov() {
    return gsap.utils.clamp(20, 110, this.cam.fov - this.cam.zoomFov);
  }

  // Putar kamera ke arah tertentu. view: { yaw, pitch, fov } (derajat)
  lookAt(view = {}, { duration = 1.6 } = {}) {
    const to = {};
    if (view.yaw !== undefined) {
      const delta = ((((view.yaw - this.cam.yaw) % 360) + 540) % 360) - 180; // jalur terpendek
      to.yaw = this.cam.yaw + delta;
    }
    if (view.pitch !== undefined) to.pitch = view.pitch;
    if (view.fov !== undefined) to.fov = view.fov;
    this.velocity.yaw = this.velocity.pitch = 0;
    this.lastInput = performance.now();
    if (!duration) return Object.assign(this.cam, to);
    return gsap.to(this.cam, { ...to, duration, ease: 'power3.inOut', overwrite: 'auto' });
  }

  // Posisi layar (px) dari koordinat 360. visible=false kalau di belakang kamera.
  project(yawDeg, pitchDeg) {
    const m = this.uniforms.uMouse.value;
    const yaw = this.cam.yaw * DEG + m.x * 0.02;
    const pitch = this.cam.pitch * DEG + m.y * 0.012;
    const f = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
    const rl = Math.hypot(f[2], f[0]) || 1;
    const r = [-f[2] / rl, 0, f[0] / rl];
    const up = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    const y = yawDeg * DEG;
    const p = pitchDeg * DEG;
    const d = [Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p)];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const z = dot(d, f);
    if (z <= 0.05) return { x: 0, y: 0, visible: false };
    const t = Math.tan((this.currentFov() * DEG) / 2);
    const sx = dot(d, r) / (z * t * (innerWidth / innerHeight));
    const sy = dot(d, up) / (z * t);
    return { x: (sx * 0.5 + 0.5) * innerWidth, y: (0.5 - sy * 0.5) * innerHeight, visible: Math.abs(sx) < 1.3 && Math.abs(sy) < 1.3 };
  }

  // Kebalikan project(): titik layar -> { yaw, pitch } (untuk mode ?debug)
  unproject(clientX, clientY) {
    const yaw = this.cam.yaw * DEG;
    const pitch = this.cam.pitch * DEG;
    const t = Math.tan((this.currentFov() * DEG) / 2);
    const nx = (clientX / innerWidth) * 2 - 1;
    const ny = 1 - (clientY / innerHeight) * 2;
    const f = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
    const rl = Math.hypot(f[2], f[0]) || 1;
    const r = [-f[2] / rl, 0, f[0] / rl];
    const up = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    const a = innerWidth / innerHeight;
    const d = [0, 1, 2].map((i) => f[i] + r[i] * nx * t * a + up[i] * ny * t);
    const len = Math.hypot(...d);
    return { yaw: Math.round(Math.atan2(d[0] / len, -d[2] / len) / DEG), pitch: Math.round(Math.asin(d[1] / len) / DEG) };
  }

  onFrame(fn) {
    this.frameListeners.add(fn);
    return () => this.frameListeners.delete(fn);
  }

  /* -------------------------------- render -------------------------------- */
  resize() {
    const dpr = Math.min(devicePixelRatio || 1, this.opts.maxDpr);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.uniforms.uScreen.value.set(innerWidth * dpr, innerHeight * dpr);
    this.uniforms.uBrush.value = this.opts.brush * dpr;
    this.uniforms.uEdge.value = Math.min(this.opts.edge, innerWidth * 0.04) * dpr;
  }

  render(time, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.1);
    const u = this.uniforms;
    u.uMouse.value.lerp(this.mouseTarget, 0.05);
    u.uTime.value = time;

    // inersia setelah drag + putar otomatis pelan saat diam
    const idle = performance.now() - this.lastInput;
    if (Math.abs(this.velocity.yaw) > 0.001 || Math.abs(this.velocity.pitch) > 0.001) {
      this.cam.yaw += this.velocity.yaw;
      this.cam.pitch = gsap.utils.clamp(-80, 80, this.cam.pitch + this.velocity.pitch);
      this.velocity.yaw *= 0.92;
      this.velocity.pitch *= 0.92;
    } else if (this.isPano && idle > 4000 && this.opts.autoRotate && !this.autoRotateLocks && !gsap.isTweening(this.cam)) {
      this.cam.yaw += this.opts.autoRotate * dt * Math.min(1, (idle - 4000) / 2000);
    }
    u.uYaw.value = this.cam.yaw * DEG;
    u.uPitch.value = this.cam.pitch * DEG;
    u.uFov.value = this.currentFov() * DEG;

    this.renderer.render(this.scene, this.camera);
    this.frameListeners.forEach((fn) => fn());
  }

  /* --------------------------------- media --------------------------------- */
  // media: { pano | image | video, depth?, scrub?, zoom?, placeholder? }
  load(media = {}) {
    const key = JSON.stringify(media);
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        (async () => {
          const isPano = !!media.pano || media.type === '360';
          const src = typeof media.pano === 'string' ? media.pano : (media.image ?? null);
          const opts = { repeat: isPano };
          let result = null;
          try {
            if (media.video) result = await loadVideo(media.video, media, opts);
            else if (src) result = await loadImage(src, opts);
          } catch (err) {
            console.warn(`[painter] ${src ?? media.video} belum ada/gagal dimuat -> pakai placeholder`, err?.message ?? '');
          }
          const ph = media.placeholder ?? {};
          if (!result) {
            const canvas = isPano ? makePanorama(ph) : makePlaceholder(ph);
            result = { tex: prepare(new THREE.CanvasTexture(canvas), opts), size: [canvas.width, canvas.height] };
          }
          let depth = null;
          if (!isPano) {
            if (media.depth) depth = await loadImage(media.depth).then((r) => r.tex).catch(() => null);
            else if (!src && !media.video) depth = prepare(new THREE.CanvasTexture(makeDepth(ph.kind)));
          }
          return { ...result, depth, media, key, pano: isPano };
        })(),
      );
    }
    return this.cache.get(key);
  }

  // Ganti media dengan transisi larut. options.view -> arahkan kamera 360 sekalian.
  async show(media, { duration = 1.6, view } = {}) {
    const token = ++this.token;
    const slot = await this.load(media);
    if (token !== this.token) return;
    if (view && slot.pano) this.lookAt(view, { duration: this.slotA ? Math.max(duration, 1.2) : 0 });
    if (slot.key === this.slotA?.key) return;
    this.tween?.progress(1);
    this.assign('B', slot);
    if (slot.video && !slot.media.scrub) slot.video.play().catch(() => {});
    if (!this.slotA || duration === 0) return this.promote(slot);
    await new Promise((resolve) => {
      this.tween = gsap.fromTo(
        this.uniforms.uMix,
        { value: 0 },
        { value: 1, duration, ease: 'power2.inOut', onComplete: () => (this.promote(slot), resolve()) },
      );
    });
  }

  assign(name, slot) {
    const u = this.uniforms;
    u[`uMap${name}`].value = slot.tex;
    u[`uSize${name}`].value.set(slot.size[0], slot.size[1]);
    u[`uDepth${name}`].value = slot.depth ?? this.blank;
    u[`uDepthOn${name}`].value = slot.depth ? 1 : 0;
    u[`uPano${name}`].value = slot.pano ? 1 : 0;
  }

  promote(slot) {
    const prev = this.slotA;
    this.assign('A', slot);
    this.uniforms.uMix.value = 0;
    this.slotA = slot;
    this.tween = null;
    this.canvas.classList.toggle('is-pano', slot.pano);
    if (prev?.video && prev !== slot) prev.video.pause();
  }

  // Progres interaksi 0..1 -> zoom halus (flat: skala, 360: fov) + scrub video
  setProgress(p) {
    const media = this.slotA?.media ?? {};
    gsap.to(this.uniforms.uZoom, { value: p * (media.zoom ?? 0.12), duration: 0.6, ease: 'power2.out', overwrite: true });
    gsap.to(this.cam, { zoomFov: p * (media.zoomFov ?? 22), duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
    const video = this.slotA?.video;
    if (video && media.scrub && video.duration) video.currentTime = p * (video.duration - 0.05);
  }
}
