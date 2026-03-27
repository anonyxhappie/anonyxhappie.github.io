(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const isMobileLayout = () => window.matchMedia?.('(max-width: 720px)')?.matches ?? (window.innerWidth <= 720);

  // ---------- Paper texture background (static) ----------
  const canvas = document.getElementById('bg');
  const ctx = canvas?.getContext('2d', { alpha: true });

  function mulberry32(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawPaperTexture() {
    if (!canvas || !ctx || prefersReducedMotion) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    // Deterministic seed so it doesn't "animate" between refreshes.
    const seed = Math.floor(w * 13 + h * 17);
    const rand = mulberry32(seed);

    // Base tint wash (static, subtle)
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.filter = 'blur(18px)';
    const stains = 6;
    for (let i = 0; i < stains; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = (0.25 + rand() * 0.45) * Math.min(w, h);
      const hue = 95 + Math.floor(rand() * 35);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${hue}, 16%, 46%, 0.06)`);
      g.addColorStop(0.5, `hsla(${hue}, 14%, 48%, 0.03)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Fibers (tiny lines)
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = 'rgba(40, 48, 36, 0.35)';
    ctx.lineWidth = 1;
    const fibers = Math.floor((w * h) / 18000);
    for (let i = 0; i < fibers; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const len = 6 + rand() * 20;
      const ang = (rand() - 0.5) * 0.9; // mostly horizontal
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.restore();

    // Grain (single-pixel specks)
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = 'rgba(40, 48, 36, 0.25)';
    const specks = Math.floor((w * h) / 3200);
    for (let i = 0; i < specks; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const s = (rand() < 0.08) ? 2 : 1;
      ctx.fillRect(x, y, s, s);
    }
    ctx.restore();
  }

  // ---------- Matter.js cards ----------
  const cardsRoot = document.getElementById('cards');
  const gravityBtn = document.getElementById('gravity-toggle');
  const resetBtn = document.getElementById('reset');
  const modeHint = document.getElementById('mode-hint');

  let engine = null;
  let runner = null;
  let bodies = [];
  let mouseConstraint = null;
  let walls = [];

  const safeMatter = () => window.Matter && typeof window.Matter.Engine?.create === 'function';

  function teardownPhysics() {
    if (!safeMatter()) return;
    if (runner) window.Matter.Runner.stop(runner);
    if (engine) {
      window.Matter.World.clear(engine.world, false);
      window.Matter.Engine.clear(engine);
    }
    runner = null;
    engine = null;
    bodies = [];
    walls = [];
    mouseConstraint = null;
  }

  function setCardTransform(el, body) {
    el.style.transform = `translate3d(${body.position.x - body.render.w / 2}px, ${body.position.y - body.render.h / 2}px, 0) rotate(${body.angle}rad)`;
  }

  function buildWalls(stageEl) {
    const { Bodies, World } = window.Matter;
    const rect = stageEl.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const thickness = 120;
    const opts = { isStatic: true, render: { visible: false } };

    const left = Bodies.rectangle(-thickness / 2, h / 2, thickness, h * 2, opts);
    const right = Bodies.rectangle(w + thickness / 2, h / 2, thickness, h * 2, opts);
    const top = Bodies.rectangle(w / 2, -thickness / 2, w * 2, thickness, opts);
    const bottom = Bodies.rectangle(w / 2, h + thickness / 2, w * 2, thickness, opts);
    walls = [left, right, top, bottom];
    World.add(engine.world, walls);
  }

  function initPhysics() {
    if (!safeMatter() || !cardsRoot || isMobileLayout()) {
      teardownPhysics();
      if (modeHint) modeHint.textContent = 'Tip: on mobile, cards use a clean stacked layout.';
      return;
    }

    const stage = cardsRoot.closest('.stage');
    if (!stage) return;

    teardownPhysics();
    const { Engine, Runner, World, Bodies, Body, Mouse, MouseConstraint } = window.Matter;

    engine = Engine.create();
    engine.gravity.y = 1;
    runner = Runner.create();

    buildWalls(stage);

    const els = [...cardsRoot.querySelectorAll('[data-card]')];
    const stageRect = stage.getBoundingClientRect();
    const w = stageRect.width;
    const h = stageRect.height;

    bodies = els.map((el, i) => {
      const elRect = el.getBoundingClientRect();
      const bw = Math.min(380, Math.max(280, elRect.width || 320));
      const bh = Math.max(150, Math.min(230, elRect.height || 170));

      const x = w * 0.22 + (i % 3) * (w * 0.26) + (Math.random() - 0.5) * 20;
      const y = 90 + Math.floor(i / 3) * 140 + (Math.random() - 0.5) * 20;

      const body = Bodies.rectangle(x, y, bw, bh, {
        restitution: 0.12,
        friction: 0.18,
        frictionAir: 0.035,
        density: 0.0012,
      });

      body.render.visible = false;
      body.render.w = bw;
      body.render.h = bh;

      Body.setAngle(body, (Math.random() - 0.5) * 0.12);
      el.style.width = `${bw}px`;
      el.style.height = `${bh}px`;
      setCardTransform(el, body);

      return { el, body };
    });

    World.add(engine.world, bodies.map(b => b.body));

    // Dragging
    const mouse = Mouse.create(stage);
    mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.15,
        damping: 0.2,
        render: { visible: false },
      }
    });
    World.add(engine.world, mouseConstraint);

    Runner.run(runner, engine);

    // Sync loop
    const tick = () => {
      if (!engine) return;
      for (const { el, body } of bodies) {
        setCardTransform(el, body);
      }
      requestAnimationFrame(tick);
    };
    tick();

    if (modeHint) modeHint.textContent = 'Tip: you can gently drag cards around.';
  }

  function setGravity(on) {
    if (!engine) return;
    engine.gravity.y = on ? 0.75 : 0;
    if (gravityBtn) {
      gravityBtn.textContent = `Motion: ${on ? 'On' : 'Off'}`;
      gravityBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function resetLayout() {
    if (!engine) return;
    const { Body } = window.Matter;
    const stage = cardsRoot.closest('.stage');
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const w = rect.width;

    bodies.forEach((b, i) => {
      const x = w * 0.22 + (i % 3) * (w * 0.26) + (Math.random() - 0.5) * 18;
      const y = 80 + Math.floor(i / 3) * 140 + (Math.random() - 0.5) * 18;
      Body.setPosition(b.body, { x, y });
      Body.setVelocity(b.body, { x: 0, y: 0 });
      Body.setAngularVelocity(b.body, 0);
      Body.setAngle(b.body, (Math.random() - 0.5) * 0.10);
    });
  }

  // ---------- Boot ----------
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    drawPaperTexture();
    // rebuild physics when crossing breakpoint
    initPhysics();
  }, { passive: true });

  if (gravityBtn) {
    gravityBtn.addEventListener('click', () => {
      if (!engine) return;
      const on = !(engine.gravity.y > 0);
      setGravity(on);
    });
  }

  if (resetBtn) resetBtn.addEventListener('click', resetLayout);

  drawPaperTexture();
  initPhysics();
  setGravity(true);
})();

