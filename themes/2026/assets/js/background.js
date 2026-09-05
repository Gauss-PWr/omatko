document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("lorenz-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const host = canvas.parentElement;
  const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
  const mobileMq = window.matchMedia("(max-width: 768px)");

  const SIGMA = 10;
  const BETA = 8 / 3;
  const RHO = 28;
  const EQ = Math.sqrt(BETA * (RHO - 1));
  const ZC = RHO - 1;
  // "Core" particles run below the Hopf point, so they spiral into the lobe centre
  // (about 10% tighter per loop), filling the hole the chaotic band leaves.
  const RHO_CORE = 20;
  const EQ_CORE = Math.sqrt(BETA * (RHO_CORE - 1));
  const CORE_XY = EQ - EQ_CORE;
  const CORE_Z = RHO - RHO_CORE;
  const CORE_RESET = 1.1;
  const TAU = Math.PI * 2;

  // Plane of the C+ lobe (principal components of the attractor): its normal and the
  // in-plane direction from the lobe centre towards the seam where lobes are switched.
  // The C- lobe follows from the (x, y, z) -> (-x, -y, z) symmetry.
  const NORMAL = [0.842, -0.456, -0.29];
  const SEAM = [-0.537, -0.765, -0.356];

  const SEAM_X = 4;
  const BLEND_K = 1.2;
  const DT_LOOP = 0.008;
  const DT_SEAM = 0.003;
  const SPEED = 0.45;
  const CHUNK = 50;
  const BANDS = 6;
  const BAND_ALPHA = [1, 0.86, 0.72, 0.58, 0.44, 0.3];
  const SWEEP_ALPHA = 0.55;
  const DOTS_PER_TRAIL = 3;

  const systems = [
    {
      colors: ["145,193,63", "242,143,45"],
      lobes: [
        { cx: 0.12, cy: 0.18, rot: 0.25, flat: 0.78, size: 1 },
        { cx: 0.86, cy: 0.3, rot: -0.2, flat: 0.78, size: 1 },
      ],
      ctrl: [0.5, -0.28],
      seedShift: 0,
    },
    {
      colors: ["79,189,195", "95,175,225"],
      lobes: [
        { cx: 0.15, cy: 0.83, rot: Math.PI + 0.15, flat: 0.78, size: 1 },
        { cx: 0.84, cy: 0.76, rot: Math.PI - 0.2, flat: 0.3, size: 1.25 },
      ],
      ctrl: [0.5, 1.28],
      seedShift: 3.3,
    },
  ];

  let maps = null;
  let px = 0;
  let py = 0;
  const pt = [0, 0];
  let W = 0;
  let H = 0;
  let running = false;
  let pageVisible = document.visibilityState === "visible";
  let inView = false;
  let raf = 0;
  let lastTs = 0;
  let frameParity = 0;

  function rk2(s, o, dt, rho) {
    const x = s[o];
    const y = s[o + 1];
    const z = s[o + 2];
    const hx = x + 0.5 * dt * SIGMA * (y - x);
    const hy = y + 0.5 * dt * (x * (rho - z) - y);
    const hz = z + 0.5 * dt * (x * y - BETA * z);
    s[o] = x + dt * SIGMA * (hy - hx);
    s[o + 1] = y + dt * (hx * (rho - hz) - hy);
    s[o + 2] = z + dt * (hx * hy - BETA * hz);
  }

  function dtFor(x) {
    return x < SEAM_X && x > -SEAM_X ? DT_SEAM : DT_LOOP;
  }

  // Core particles are stored shifted so their (smaller) attractor is centred on the band's lobes.
  function store(sys, i, h) {
    const { state, pts, len } = sys;
    const so = i * 3;
    const o = (i * len + h) * 3;
    if (i < sys.nBand) {
      pts[o] = state[so];
      pts[o + 1] = state[so + 1];
      pts[o + 2] = state[so + 2];
    } else {
      const k = CORE_XY * Math.tanh(state[so]);
      pts[o] = state[so] + k;
      pts[o + 1] = state[so + 1] + k;
      pts[o + 2] = state[so + 2] + CORE_Z;
    }
  }

  function seed(sys, nBand, nCore, chunks) {
    const n = nBand + nCore;
    const len = chunks * CHUNK;
    sys.n = n;
    sys.nBand = nBand;
    sys.len = len;
    sys.chunks = chunks;
    sys.state = new Float64Array(n * 3);
    sys.pts = new Float32Array(n * len * 3);
    sys.head = new Int32Array(n);
    sys.headChunk = new Int32Array(n);
    sys.carry = new Float32Array(n);
    sys.paths = new Array(n * chunks * 4).fill(null);
    sys.maps = new Float64Array(16);
    const { state } = sys;

    const s = [1.2 + sys.seedShift, 0.7, 1.05 + sys.seedShift];
    for (let t = 0; t < 8; t += DT_LOOP) rk2(s, 0, DT_LOOP, RHO);
    for (let i = 0; i < n; i++) {
      const so = i * 3;
      let rho = RHO;
      if (i < nBand) {
        for (let t = 0, gap = 1.9 + 0.83 * i; t < gap; t += DT_LOOP) rk2(s, 0, DT_LOOP, RHO);
        state[so] = s[0];
        state[so + 1] = s[1];
        state[so + 2] = s[2];
      } else {
        rho = RHO_CORE;
        const sgn = i & 1 ? -1 : 1;
        const ang = 1.7 * i;
        const r = 2.5 + 2.2 * (i - nBand);
        state[so] = sgn * EQ_CORE + r * Math.cos(ang);
        state[so + 1] = sgn * EQ_CORE + r * Math.sin(ang);
        state[so + 2] = RHO_CORE - 1 + 0.4 * r * Math.cos(ang * 2);
        for (let t = 0; t < 1; t += DT_LOOP) rk2(state, so, DT_LOOP, rho);
      }
      for (let j = 0; j < len; j++) {
        rk2(state, so, dtFor(state[so]), rho);
        store(sys, i, j);
      }
      sys.head[i] = len - 1;
      sys.headChunk[i] = chunks - 1;
    }
  }

  function advance(sys, dtWall) {
    const { n, nBand, len, pts, state, head, carry } = sys;
    for (let i = 0; i < n; i++) {
      const so = i * 3;
      let h = head[i];
      let rem = carry[i] + dtWall * SPEED;
      let rho = RHO;
      if (i >= nBand) {
        rho = RHO_CORE;
        const x = state[so];
        const c = x < 0 ? -EQ_CORE : EQ_CORE;
        const dx = x - c;
        const dy = state[so + 1] - c;
        const dz = state[so + 2] - (RHO_CORE - 1);
        if (dx * dx + dy * dy + dz * dz < CORE_RESET * CORE_RESET) {
          // Spiralled into the centre: jump back onto the chaotic band, breaking the trail.
          const bo = ((i - nBand) % nBand) * 3;
          state[so] = state[bo] * 0.97;
          state[so + 1] = state[bo + 1] * 0.97;
          state[so + 2] = state[bo + 2] - CORE_Z * 0.5;
          h = h + 1 === len ? 0 : h + 1;
          pts[(i * len + h) * 3] = NaN;
        }
      }
      let dt = dtFor(state[so]);
      while (rem >= dt) {
        rk2(state, so, dt, rho);
        rem -= dt;
        h = h + 1 === len ? 0 : h + 1;
        store(sys, i, h);
        dt = dtFor(state[so]);
      }
      head[i] = h;
      carry[i] = rem;
    }
  }

  // Affine map (Lorenz coords -> canvas px) for one lobe: orthographic view down the
  // lobe normal with the seam direction pointing up, then flattened, tilted and placed.
  function lobeMap(sys, li, scale) {
    const lobe = sys.lobes[li];
    const out = sys.maps;
    const off = li * 8;
    const sgn = li === 0 ? -1 : 1;
    const dx = sgn * NORMAL[0];
    const dy = sgn * NORMAL[1];
    const dz = NORMAL[2];
    const mx = sgn * SEAM[0];
    const my = sgn * SEAM[1];
    const mz = SEAM[2];

    const md = mx * dx + my * dy + mz * dz;
    let vx = mx - md * dx;
    let vy = my - md * dy;
    let vz = mz - md * dz;
    const inv = 1 / Math.hypot(vx, vy, vz);
    vx *= inv;
    vy *= inv;
    vz *= inv;

    // mirrored for the left lobe so the two lobes are mirror images
    const m = li === 0 ? -1 : 1;
    const ux = m * (dy * vz - dz * vy);
    const uy = m * (dz * vx - dx * vz);
    const uz = m * (dx * vy - dy * vx);

    const sc = scale * lobe.size;
    const cr = Math.cos(lobe.rot);
    const sr = Math.sin(lobe.rot);
    const f = lobe.flat;
    const rx0 = sc * (cr * ux + sr * f * vx);
    const rx1 = sc * (cr * uy + sr * f * vy);
    const rx2 = sc * (cr * uz + sr * f * vz);
    const ry0 = sc * (sr * ux - cr * f * vx);
    const ry1 = sc * (sr * uy - cr * f * vy);
    const ry2 = sc * (sr * uz - cr * f * vz);
    const c = sgn * EQ;
    // portrait screens: push the lobes further into the corners, clear of the logo
    const cy = W < H ? (lobe.cy < 0.5 ? lobe.cy * 0.7 : 1 - (1 - lobe.cy) * 0.7) : lobe.cy;
    out[off] = lobe.cx * W - (rx0 * c + rx1 * c + rx2 * ZC);
    out[off + 1] = rx0;
    out[off + 2] = rx1;
    out[off + 3] = rx2;
    out[off + 4] = cy * H - (ry0 * c + ry1 * c + ry2 * ZC);
    out[off + 5] = ry0;
    out[off + 6] = ry1;
    out[off + 7] = ry2;
  }

  // Projects a point; lobe switches are bent through the system's control point.
  // Returns the colour bucket: 0/3 = left/right lobe, 1/2 = left/right half of a sweep.
  function project(x, y, z) {
    if (x >= SEAM_X) {
      pt[0] = maps[8] + maps[9] * x + maps[10] * y + maps[11] * z;
      pt[1] = maps[12] + maps[13] * x + maps[14] * y + maps[15] * z;
      return 3;
    }
    if (x <= -SEAM_X) {
      pt[0] = maps[0] + maps[1] * x + maps[2] * y + maps[3] * z;
      pt[1] = maps[4] + maps[5] * x + maps[6] * y + maps[7] * z;
      return 0;
    }
    const w = 0.5 + 0.5 * Math.tanh(BLEND_K * x);
    const a = (1 - w) * (1 - w);
    const b = 2 * w * (1 - w);
    const c = w * w;
    pt[0] =
      a * (maps[0] + maps[1] * x + maps[2] * y + maps[3] * z) +
      b * px +
      c * (maps[8] + maps[9] * x + maps[10] * y + maps[11] * z);
    pt[1] =
      a * (maps[4] + maps[5] * x + maps[6] * y + maps[7] * z) +
      b * py +
      c * (maps[12] + maps[13] * x + maps[14] * y + maps[15] * z);
    return x < 0 ? 1 : 2;
  }

  // Rebuilds the cached Path2D objects (one per colour bucket) of one chunk of a trail.
  // The chunk starts from the last point of the preceding chunk so trails stay connected.
  function buildChunk(sys, i, ck, count) {
    const { len, pts, paths, chunks, head } = sys;
    const base = i * len;
    const start = ck * CHUNK;
    const po = (i * chunks + ck) * 4;
    paths[po] = paths[po + 1] = paths[po + 2] = paths[po + 3] = null;
    let prev = -1;
    const prevPos = start === 0 ? len - 1 : start - 1;
    if (prevPos !== head[i]) {
      const o = (base + prevPos) * 3;
      const x = pts[o];
      if (x === x) {
        prev = project(x, pts[o + 1], pts[o + 2]);
        paths[po + prev] = new Path2D();
        paths[po + prev].moveTo(pt[0], pt[1]);
      }
    }
    for (let j = 0; j < count; j++) {
      const o = (base + start + j) * 3;
      const x = pts[o];
      if (x !== x) {
        prev = -1;
        continue;
      }
      const cb = project(x, pts[o + 1], pts[o + 2]);
      if (cb !== prev) {
        if (prev >= 0) paths[po + prev].lineTo(pt[0], pt[1]);
        let p = paths[po + cb];
        if (!p) p = paths[po + cb] = new Path2D();
        p.moveTo(pt[0], pt[1]);
        prev = cb;
      } else {
        paths[po + cb].lineTo(pt[0], pt[1]);
      }
    }
  }

  function useSystem(sys) {
    maps = sys.maps;
    px = sys.ctrl[0] * W;
    py = sys.ctrl[1] * H;
  }

  function rebuildAll(sys) {
    useSystem(sys);
    for (let i = 0; i < sys.n; i++) {
      const hc = (sys.head[i] / CHUNK) | 0;
      sys.headChunk[i] = hc;
      for (let ck = 0; ck < sys.chunks; ck++) {
        buildChunk(sys, i, ck, ck === hc ? (sys.head[i] % CHUNK) + 1 : CHUNK);
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 0.9;
    ctx.lineJoin = "bevel";
    const baseAlpha = darkMq.matches ? 0.78 : 0.72;
    const dotR = 2.3;

    for (let si = 0; si < systems.length; si++) {
      const sys = systems[si];
      useSystem(sys);
      const { n, len, pts, head, headChunk, chunks, paths, colors } = sys;

      const agg = new Array(BANDS * 4).fill(null);
      for (let i = 0; i < n; i++) {
        const h = head[i];
        const hc = (h / CHUNK) | 0;
        if (hc !== headChunk[i]) {
          buildChunk(sys, i, headChunk[i], CHUNK);
          headChunk[i] = hc;
        }
        buildChunk(sys, i, hc, (h % CHUNK) + 1);

        for (let a = 0; a < chunks - 1; a++) {
          let ck = hc - a;
          if (ck < 0) ck += chunks;
          const band = ((a * BANDS) / (chunks - 1)) | 0;
          const po = (i * chunks + ck) * 4;
          for (let cb = 0; cb < 4; cb++) {
            const p = paths[po + cb];
            if (!p) continue;
            let g = agg[band * 4 + cb];
            if (!g) g = agg[band * 4 + cb] = new Path2D();
            g.addPath(p);
          }
        }
      }

      for (let b = 0; b < agg.length; b++) {
        const g = agg[b];
        if (!g) continue;
        const cb = b & 3;
        const alpha = baseAlpha * BAND_ALPHA[b >> 2] * (cb === 1 || cb === 2 ? SWEEP_ALPHA : 1);
        ctx.strokeStyle = `rgba(${colors[cb >> 1]},${alpha})`;
        ctx.stroke(g);
      }

      // The oldest chunk fades out as the head chunk fills up, so tails never pop.
      for (let i = 0; i < n; i++) {
        const fade = BAND_ALPHA[BANDS - 1] * (1 - ((head[i] % CHUNK) + 1) / CHUNK);
        if (fade <= 0.01) continue;
        let ck = headChunk[i] + 1;
        if (ck === chunks) ck = 0;
        const po = (i * chunks + ck) * 4;
        for (let cb = 0; cb < 4; cb++) {
          const p = paths[po + cb];
          if (!p) continue;
          const alpha = baseAlpha * fade * (cb === 1 || cb === 2 ? SWEEP_ALPHA : 1);
          ctx.strokeStyle = `rgba(${colors[cb >> 1]},${alpha})`;
          ctx.stroke(p);
        }
      }

      for (let i = 0; i < n; i++) {
        const base = i * len;
        for (let k = 0; k < DOTS_PER_TRAIL; k++) {
          let idx = head[i] - (((k * len) / DOTS_PER_TRAIL) | 0);
          if (idx < 0) idx += len;
          const o = (base + idx) * 3;
          const x = pts[o];
          if (x !== x) continue;
          const cb = project(x, pts[o + 1], pts[o + 2]);
          ctx.fillStyle = `rgba(${colors[cb >> 1]},${k === 0 ? 0.9 : 0.5})`;
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], k === 0 ? dotR : dotR * 0.8, 0, TAU);
          ctx.fill();
        }
      }
    }
  }

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w < 2 || h < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, mobileMq.matches ? 1.25 : 1.5);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w;
    H = h;
    const scale = 0.0115 * Math.min(1.4 * W, 1.45 * H);
    for (let si = 0; si < systems.length; si++) {
      lobeMap(systems[si], 0, scale);
      lobeMap(systems[si], 1, scale);
      rebuildAll(systems[si]);
    }
    if (!running) render();
  }

  function frame(ts) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (W < 2) return;
    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.1) : 0;
    lastTs = ts;
    for (let si = 0; si < systems.length; si++) advance(systems[si], dt);
    if (mobileMq.matches && (frameParity ^= 1)) return;
    render();
  }

  function sync() {
    const should = pageVisible && inView && !reducedMq.matches;
    if (should && !running) {
      running = true;
      lastTs = 0;
      raf = requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  const mobile = mobileMq.matches;
  for (let si = 0; si < systems.length; si++) {
    seed(systems[si], mobile ? 4 : 7, mobile ? 2 : 3, mobile ? 8 : 15);
  }
  resize();

  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      sync();
    },
    { threshold: 0.02 },
  ).observe(host);
  document.addEventListener("visibilitychange", () => {
    pageVisible = document.visibilityState === "visible";
    sync();
  });
  reducedMq.addEventListener("change", () => {
    sync();
    if (!running) render();
  });
  darkMq.addEventListener("change", () => {
    if (!running) render();
  });
});
