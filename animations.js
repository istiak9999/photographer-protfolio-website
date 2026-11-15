/**
 * Van Gogh Interactive Animations
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Starry Night Canvas  — swirling particles behind the hero section
 * 2. Paintbrush Cursor    — golden paint-stroke trail that follows the mouse
 * 3. Floating Dust Motes  — ambient drifting particles on scroll sections
 * 4. Magnetic Tilt Cards  — work cards tilt to follow the mouse (perspective)
 * 5. Brush-stroke Counter — count-up numbers animate with a watercolour pulse
 * ─────────────────────────────────────────────────────────────────────────────
 */

(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── Van Gogh Palette ──────────────────────────────────────────────────── */
  const VG = {
    cobalt:     "#6b96b8",
    deepblue:   "#3a6080",
    periwinkle: "#bec9d8",
    sunflower:  "#c8911a",
    wheat:      "#d4c47a",
    straw:      "#e8d8a0",
    midnight:   "#141c2d",
    iris:       "#7b5ea8",
    sage:       "#7a9870",
    white:      "rgba(255,255,255,0.85)",
  };

  /* ══════════════════════════════════════════════════════════════════════════
     1. STARRY NIGHT HERO CANVAS
     Swirling Van Gogh-style particles in the hero background
  ══════════════════════════════════════════════════════════════════════════ */
  function initStarryNight() {
    const heroSection = document.querySelector(".hero");
    if (!heroSection) return;

    const canvas = document.createElement("canvas");
    canvas.id = "starry-canvas";
    canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.55;
    `;
    heroSection.style.position = "relative";
    heroSection.insertBefore(canvas, heroSection.firstChild);

    const ctx = canvas.getContext("2d");
    let W, H, stars, mouse = { x: -999, y: -999 };

    const starColors = [
      VG.sunflower, VG.wheat, VG.straw, VG.white,
      VG.cobalt, VG.periwinkle, VG.iris,
    ];

    class Star {
      constructor() { this.reset(true); }

      reset(initial = false) {
        this.x  = Math.random() * W;
        this.y  = initial ? Math.random() * H : -10;
        this.r  = Math.random() * 2.2 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = Math.random() * 0.4 + 0.1;
        this.alpha = Math.random() * 0.7 + 0.3;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.025 + 0.008;
        this.color = starColors[Math.floor(Math.random() * starColors.length)];
        // swirl parameters
        this.angle = Math.random() * Math.PI * 2;
        this.swirlR = Math.random() * 60 + 20;
        this.swirlSpeed = (Math.random() - 0.5) * 0.012;
        this.cx = this.x; this.cy = this.y;
      }

      update() {
        this.pulse += this.pulseSpeed;
        this.angle += this.swirlSpeed;

        // Swirl motion
        this.x = this.cx + Math.cos(this.angle) * this.swirlR * 0.3;
        this.y += this.vy;
        this.cx += this.vx;

        // Mouse repel
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          const force = (90 - dist) / 90;
          this.cx += (dx / dist) * force * 1.4;
          this.y   += (dy / dist) * force * 0.7;
        }

        if (this.y > H + 10 || this.cx < -50 || this.cx > W + 50) this.reset();
      }

      draw() {
        const a = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse));
        ctx.save();
        ctx.globalAlpha = a;
        // glow
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3.5);
        grd.addColorStop(0, this.color);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
        ctx.fill();
        // core
        ctx.globalAlpha = Math.min(a * 1.4, 1);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    /* Swirl streams — Van Gogh's distinctive brushstroke curves */
    class SwirlStream {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.pts = [];
        this.maxPts = Math.floor(Math.random() * 40 + 20);
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1.2 + 0.4;
        this.turn  = (Math.random() - 0.5) * 0.08;
        this.color = [VG.cobalt, VG.deepblue, VG.periwinkle, VG.midnight][Math.floor(Math.random() * 4)];
        this.alpha = Math.random() * 0.12 + 0.04;
        this.width = Math.random() * 2.5 + 0.5;
      }
      update() {
        this.angle += this.turn + Math.sin(Date.now() * 0.0003 + this.x * 0.01) * 0.04;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.pts.push({ x: this.x, y: this.y });
        if (this.pts.length > this.maxPts) this.pts.shift();
        if (this.x < -60 || this.x > W + 60 || this.y < -60 || this.y > H + 60) this.reset();
      }
      draw() {
        if (this.pts.length < 2) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(this.pts[0].x, this.pts[0].y);
        for (let i = 1; i < this.pts.length; i++) {
          const mx = (this.pts[i - 1].x + this.pts[i].x) / 2;
          const my = (this.pts[i - 1].y + this.pts[i].y) / 2;
          ctx.quadraticCurveTo(this.pts[i - 1].x, this.pts[i - 1].y, mx, my);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    function resize() {
      W = canvas.width  = heroSection.offsetWidth;
      H = canvas.height = heroSection.offsetHeight;
    }

    function init() {
      resize();
      const count = Math.min(Math.floor(W * H / 5000), 160);
      stars   = Array.from({ length: count }, () => new Star());
      streams = Array.from({ length: 18 }, () => new SwirlStream());
    }

    let streams = [];
    let raf;

    function loop() {
      ctx.clearRect(0, 0, W, H);
      streams.forEach(s => { s.update(); s.draw(); });
      stars.forEach(s => { s.update(); s.draw(); });
      raf = requestAnimationFrame(loop);
    }

    heroSection.addEventListener("mousemove", e => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroSection.addEventListener("mouseleave", () => { mouse.x = -999; mouse.y = -999; });

    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(heroSection);

    init();
    if (!reduced) loop();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2. PAINTBRUSH CURSOR TRAIL
     Golden paint strokes follow the mouse across the whole page
  ══════════════════════════════════════════════════════════════════════════ */
  function initCursorTrail() {
    if (window.matchMedia("(hover: none)").matches) return; // skip on touch

    const canvas = document.createElement("canvas");
    canvas.id = "cursor-canvas";
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: multiply;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const trailColors = [
      VG.sunflower, VG.wheat, VG.cobalt,
      VG.iris, VG.sage, VG.straw,
    ];

    class PaintDrop {
      constructor(x, y) {
        this.x     = x;
        this.y     = y;
        this.vx    = (Math.random() - 0.5) * 1.8;
        this.vy    = (Math.random() - 0.5) * 1.8 - 0.5;
        this.r     = Math.random() * 5 + 2;
        this.life  = 1;
        this.decay = Math.random() * 0.025 + 0.018;
        this.color = trailColors[Math.floor(Math.random() * trailColors.length)];
        // squash/stretch for brushstroke feel
        this.scaleX = Math.random() * 1.5 + 0.5;
        this.scaleY = Math.random() * 0.6 + 0.3;
        this.rot    = Math.random() * Math.PI;
      }
      update() {
        this.x    += this.vx;
        this.y    += this.vy;
        this.vy   += 0.04; // gravity drip
        this.life -= this.decay;
        this.r    *= 0.985;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.life * 0.55;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.scale(this.scaleX, this.scaleY);
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
        grd.addColorStop(0, this.color);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      get dead() { return this.life <= 0; }
    }

    let drops = [];
    let lastX = -999, lastY = -999;
    let frame = 0;

    document.addEventListener("mousemove", e => {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      if (speed > 2) {
        const count = Math.min(Math.floor(speed / 4) + 1, 5);
        for (let i = 0; i < count; i++) drops.push(new PaintDrop(e.clientX, e.clientY));
      }
      lastX = e.clientX; lastY = e.clientY;
    });

    window.addEventListener("resize", () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drops = drops.filter(d => !d.dead);
      drops.forEach(d => { d.update(); d.draw(); });
      requestAnimationFrame(loop);
    }

    if (!reduced) loop();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3. FLOATING AMBIENT PARTICLES (Dust Motes)
     Gentle floating painted dots in the work/journal sections
  ══════════════════════════════════════════════════════════════════════════ */
  function initAmbientParticles() {
    const sections = document.querySelectorAll(".work, .journal, .about");
    sections.forEach(section => {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0.4;
      `;
      if (getComputedStyle(section).position === "static") {
        section.style.position = "relative";
      }
      section.insertBefore(canvas, section.firstChild);

      const ctx = canvas.getContext("2d");
      let W, H;
      const colors = [VG.sunflower, VG.wheat, VG.cobalt, VG.iris, VG.sage];

      class Mote {
        constructor() { this.reset(true); }
        reset(initial = false) {
          this.x     = Math.random() * W;
          this.y     = initial ? Math.random() * H : H + 10;
          this.r     = Math.random() * 3 + 1;
          this.vx    = (Math.random() - 0.5) * 0.3;
          this.vy    = -(Math.random() * 0.4 + 0.1);
          this.alpha = Math.random() * 0.5 + 0.2;
          this.pulse = Math.random() * Math.PI * 2;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.wobble = Math.random() * 0.02;
        }
        update() {
          this.pulse += 0.012;
          this.x += this.vx + Math.sin(this.pulse * 2) * this.wobble * 10;
          this.y += this.vy;
          if (this.y < -10) this.reset();
        }
        draw() {
          const a = this.alpha * (0.6 + 0.4 * Math.sin(this.pulse));
          ctx.save();
          ctx.globalAlpha = a;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      let motes = [];

      function resize() {
        W = canvas.width  = section.offsetWidth;
        H = canvas.height = section.offsetHeight;
      }

      function init() {
        resize();
        const count = Math.min(Math.floor(W / 20), 50);
        motes = Array.from({ length: count }, () => new Mote());
      }

      let visible = false;
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
      }, { threshold: 0.1 });
      observer.observe(section);

      function loop() {
        if (visible) {
          ctx.clearRect(0, 0, W, H);
          motes.forEach(m => { m.update(); m.draw(); });
        }
        requestAnimationFrame(loop);
      }

      const ro = new ResizeObserver(init);
      ro.observe(section);
      init();
      if (!reduced) loop();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4. MAGNETIC TILT CARDS
     Work cards + journal cards tilt in 3D toward the mouse
  ══════════════════════════════════════════════════════════════════════════ */
  function initMagneticCards() {
    if (window.matchMedia("(hover: none)").matches) return;

    const cards = document.querySelectorAll(".work-card, .journal-card");

    cards.forEach(card => {
      let raf;

      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `
            perspective(700px)
            rotateY(${dx * 8}deg)
            rotateX(${-dy * 6}deg)
            translateZ(6px)
          `;
          card.style.transition = "transform 0.08s linear";

          // paint-brush highlight shimmer
          const pct = `${((dx + 1) / 2) * 100}%`;
          card.style.setProperty("--shimmer-x", pct);
        });
      });

      card.addEventListener("mouseleave", () => {
        cancelAnimationFrame(raf);
        card.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
        card.style.transform  = "perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5. BRUSHSTROKE RIPPLE on Click
     A Van Gogh paint-splash ripple whenever the user clicks anywhere
  ══════════════════════════════════════════════════════════════════════════ */
  function initClickRipple() {
    const canvas = document.createElement("canvas");
    canvas.id = "ripple-canvas";
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const rippleColors = [
      VG.sunflower, VG.cobalt, VG.iris,
      VG.sage, VG.wheat, VG.periwinkle,
    ];

    class Ripple {
      constructor(x, y) {
        this.x     = x;
        this.y     = y;
        this.r     = 0;
        this.maxR  = Math.random() * 60 + 50;
        this.alpha = 0.7;
        this.color = rippleColors[Math.floor(Math.random() * rippleColors.length)];
        this.speed = Math.random() * 2.5 + 2;
        // splatter drops
        this.drops = Array.from({ length: 8 }, () => ({
          angle: Math.random() * Math.PI * 2,
          dist:  0,
          speed: Math.random() * 3 + 1.5,
          r:     Math.random() * 4 + 2,
          alpha: 0.8,
        }));
      }
      update() {
        this.r     += this.speed;
        this.alpha  = Math.max(0, 0.7 * (1 - this.r / this.maxR));
        this.drops.forEach(d => {
          d.dist  += d.speed;
          d.alpha  = Math.max(0, 0.8 * (1 - d.dist / (this.maxR * 0.9)));
        });
      }
      draw() {
        // ring
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth   = 2.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.stroke();
        // splatter
        this.drops.forEach(d => {
          const dx = this.x + Math.cos(d.angle) * d.dist;
          const dy = this.y + Math.sin(d.angle) * d.dist;
          ctx.globalAlpha = d.alpha;
          ctx.fillStyle   = this.color;
          ctx.beginPath();
          ctx.arc(dx, dy, d.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
      get dead() { return this.alpha <= 0; }
    }

    let ripples = [];

    document.addEventListener("click", e => {
      for (let i = 0; i < 3; i++) {
        ripples.push(new Ripple(e.clientX, e.clientY));
      }
    });

    window.addEventListener("resize", () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    function loop() {
      ctx.clearRect(0, 0, W, H);
      ripples = ripples.filter(r => !r.dead);
      ripples.forEach(r => { r.update(); r.draw(); });
      requestAnimationFrame(loop);
    }

    if (!reduced) loop();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6. SECTION TRANSITION WIPE
     A subtle Van Gogh brush-coloured wipe reveals each section on scroll
  ══════════════════════════════════════════════════════════════════════════ */
  function initScrollBrush() {
    const sections = document.querySelectorAll("section");
    sections.forEach(section => {
      const sweep = document.createElement("div");
      sweep.style.cssText = `
        position: absolute;
        top: 0; left: -100%; width: 100%; height: 4px;
        background: linear-gradient(90deg, transparent, ${VG.sunflower}, ${VG.cobalt}, transparent);
        pointer-events: none;
        z-index: 10;
        transition: left 0.9s cubic-bezier(0.22,0.61,0.36,1), opacity 0.6s ease;
        opacity: 0;
        border-radius: 2px;
      `;
      if (getComputedStyle(section).position === "static") section.style.position = "relative";
      section.appendChild(sweep);

      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          sweep.style.opacity = "1";
          sweep.style.left    = "0";
          setTimeout(() => { sweep.style.opacity = "0"; sweep.style.left = "100%"; }, 900);
          obs.disconnect();
        }
      }, { threshold: 0.15 });
      obs.observe(section);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════════════════════════════════ */
  document.addEventListener("DOMContentLoaded", () => {
    initStarryNight();
    initCursorTrail();
    initAmbientParticles();
    initMagneticCards();
    initClickRipple();
    initScrollBrush();
  });

})();
