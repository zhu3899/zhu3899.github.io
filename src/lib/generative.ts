export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^= h >>> 16) >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number) => a + t * (b - a);

export class Noise {
  private perm: Uint8Array;

  constructor(rand: () => number) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  private grad(h: number, x: number, y: number): number {
    switch (h & 7) {
      case 0: return x + y;
      case 1: return -x + y;
      case 2: return x - y;
      case 3: return -x - y;
      case 4: return x;
      case 5: return -x;
      case 6: return y;
      default: return -y;
    }
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const p = this.perm;
    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];
    return lerp(
      v,
      lerp(u, this.grad(aa, x, y), this.grad(ba, x - 1, y)),
      lerp(u, this.grad(ab, x, y - 1), this.grad(bb, x - 1, y - 1))
    );
  }
}

function palette(rand: () => number): string[] {
  const h1 = 150 + rand() * 42;
  const h2 = 254 + rand() * 36;
  const mk = (h: number, s: number, l: number) =>
    `hsl(${h.toFixed(1)} ${s}% ${l}%)`;
  return [
    mk(h1, 85, 64),
    mk(h1 + 20, 78, 72),
    mk(h2, 82, 70),
    mk(h2 + 24, 74, 78),
    mk((h1 + h2) / 2, 70, 74),
    mk(44 + rand() * 10, 88, 68),
  ];
}

export interface StaticOptions {
  density?: number;
}

function fitCanvas(canvas: HTMLCanvasElement): {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
} | null {
  const parent = canvas.parentElement;
  if (!parent) return null;
  const w = parent.clientWidth;
  const h = parent.clientHeight || parent.clientWidth * 0.45;
  if (!w || !h) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

export function drawStatic(
  canvas: HTMLCanvasElement,
  seed: string,
  opts: StaticOptions = {}
): void {
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, w, h } = fitted;
  const rand = mulberry32(hashSeed(seed));
  const noise = new Noise(mulberry32(hashSeed(`${seed}::noise`)));
  const pal = palette(rand);
  const strokes = opts.density ?? Math.max(70, Math.round((w * h) / 9000));
  const sc = 0.0022 + rand() * 0.0014;

  ctx.lineCap = 'round';
  for (let i = 0; i < strokes; i++) {
    let x = rand() * w;
    let y = rand() * h;
    const steps = 30 + Math.floor(rand() * 70);
    const len = 1.6 + rand() * 1.6;
    const highlight = rand() < 0.08;
    ctx.strokeStyle = pal[Math.floor(rand() * pal.length)];
    ctx.globalAlpha = highlight ? 0.3 : 0.05 + rand() * 0.09;
    ctx.lineWidth = highlight ? 1.6 : 0.5 + rand() * 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < steps; s++) {
      const a = noise.noise(x * sc, y * sc) * Math.PI * 3;
      x += Math.cos(a) * len;
      y += Math.sin(a) * len;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  bucket: number;
  sp: number;
  life: number;
}

export function startHero(
  canvas: HTMLCanvasElement,
  seed = 'devlog-hero'
): () => void {
  const prepared = fitCanvas(canvas);
  if (!prepared) return () => {};
  const { ctx } = prepared;
  let w = prepared.w;
  let h = prepared.h;
  let raf = 0;
  const state = { mx: -9999, my: -9999 };

  const rand = mulberry32(hashSeed(seed));
  const noise = new Noise(mulberry32(hashSeed(`${seed}::flow`)));
  const pal = palette(rand);
  const COUNT = 520;
  const SCALE = 0.0016;

  const spawn = (): Particle => {
    const x = rand() * w;
    const y = rand() * h;
    return {
      x,
      y,
      px: x,
      py: y,
      bucket: Math.floor(rand() * 3),
      sp: 0.5 + rand() * 1.1,
      life: 120 + rand() * 280,
    };
  };

  let pts: Particle[] = [];

  const paintBase = () => {
    ctx.fillStyle = '#090c15';
    ctx.fillRect(0, 0, w, h);
  };

  const resize = () => {
    const fitted = fitCanvas(canvas);
    if (!fitted) return;
    w = fitted.w;
    h = fitted.h;
    paintBase();
    pts = Array.from({ length: COUNT }, spawn);
  };
  resize();

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    state.mx = e.clientX - r.left;
    state.my = e.clientY - r.top;
  };
  const onLeave = () => {
    state.mx = -9999;
    state.my = -9999;
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave);

  let tick = 0;
  const frame = () => {
    tick += 1;
    ctx.fillStyle = 'rgba(9, 12, 21, 0.09)';
    ctx.fillRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let b = 0; b < 3; b++) {
      ctx.beginPath();
      ctx.strokeStyle = pal[b];
      for (let i = b; i < COUNT; i += 3) {
        const p = pts[i];
        const n = noise.noise(p.x * SCALE, p.y * SCALE + tick * 0.0012);
        let a = n * Math.PI * 3.2;
        const dx = p.x - state.mx;
        const dy = p.y - state.my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 25600) {
          const inf = 1 - Math.sqrt(d2) / 160;
          a = a * (1 - inf) + (Math.atan2(dy, dx) + Math.PI / 2) * inf;
        }
        p.px = p.x;
        p.py = p.y;
        p.x += Math.cos(a) * p.sp;
        p.y += Math.sin(a) * p.sp;
        p.life -= 1;
        if (p.life <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          Object.assign(p, spawn());
          continue;
        }
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    drawStatic(canvas, seed, { density: 220 });
  } else {
    raf = requestAnimationFrame(frame);
  }

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerleave', onLeave);
  };
}
