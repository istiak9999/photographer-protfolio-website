/**
 * Van Gogh & Photography Interactive Animations
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Starry Night Hero Canvas    — Impressionist swirling sky in the hero
 * 2. Fluid Oil-Brush Ribbon      — Seamless calligraphic paint ribbon on mouse move (NO dots!)
 * 3. Camera Lens Viewfinder      — Interactive photographer reticle with AF-lock on photos
 * 4. Impressionist Wind Swirls   — Elegant painterly wind lines in content sections
 * 5. Magnetic Tilt Cards         — 3D perspective tilt with golden sheen
 * 6. Shutter Aperture Pulse      — Clean photographer light-flare on click (no splatter dots)
 * 7. Section Brush Sweep         — Gradient stroke wipe on scroll reveal
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
    sunGold:    "#e2a82b",
    wheat:      "#d4c47a",
    straw:      "#e8d8a0",
    midnight:   "#141c2d",
    iris:       "#7b5ea8",
    sage:       "#7a9870",
    white:      "rgba(255,255,255,0.9)",
  };

  /* ══════════════════════════════════════════════════════════════════════════
     1. STARRY NIGHT HERO CANVAS
     Swirling brushstroke streams and luminous celestial glow in hero
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
    let W, H;
    let stars = [];
    let streams = [];

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
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = Math.random() * 0.35 + 0.08;
        this.alpha = Math.random() * 0.65 + 0.25;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.008;
        this.color = starColors[Math.floor(Math.random() * starColors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.swirlR = Math.random() * 50 + 15;
        this.swirlSpeed = (Math.random() - 0.5) * 0.01;
        this.cx = this.x; this.cy = this.y;
      }

      update() {
        this.pulse += this.pulseSpeed;
        this.angle += this.swirlSpeed;
        this.x = this.cx + Math.cos(this.angle) * this.swirlR * 0.25;
        this.y += this.vy;
        this.cx += this.vx;

        if (this.y > H + 10 || this.cx < -50 || this.cx > W + 50) this.reset();
      }

      draw() {
        const a = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse));
        ctx.save();
        ctx.globalAlpha = a;
        const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3.5);
        grd.addColorStop(0, this.color);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = Math.min(a * 1.3, 1);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class SwirlStream {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.pts = [];
        this.maxPts = Math.floor(Math.random() * 45 + 20);
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1.1 + 0.35;
        this.turn  = (Math.random() - 0.5) * 0.06;
        this.color = [VG.cobalt, VG.deepblue, VG.periwinkle, VG.midnight][Math.floor(Math.random() * 4)];
        this.alpha = Math.random() * 0.12 + 0.04;
        this.width = Math.random() * 2.5 + 0.6;
      }
      update() {
        this.angle += this.turn + Math.sin(Date.now() * 0.0003 + this.x * 0.01) * 0.035;
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
      const count = Math.min(Math.floor(W * H / 6500), 110);
      stars   = Array.from({ length: count }, () => new Star());
      streams = Array.from({ length: 16 }, () => new SwirlStream());
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      streams.forEach(s => { s.update(); s.draw(); });
      stars.forEach(s => { s.update(); s.draw(); });
      requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(heroSection);

    init();
    if (!reduced) loop();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2. FLUID OIL-BRUSH RIBBON (REPLACES DOT PARTICLES)
     A continuous, smooth painterly oil stroke follows mouse motion gracefully.
     Dynamically varies thickness with movement velocity, blending gold & cobalt.
  ══════════════════════════════════════════════════════════════════════════ */
  function initFluidBrushRibbon() {
    if (window.matchMedia("(hover: none)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.id = "brush-ribbon-canvas";
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9997;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    let points = [];
    let lastX = -1, lastY = -1;
    let lastTime = Date.now();

    window.addEventListener("resize", () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    document.addEventListener("mousemove", e => {
      const now = Date.now();
      const dt = Math.max(now - lastTime, 16);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (lastX < 0 || dist > 2) {
        // Calculate velocity-driven stroke width (faster = thinner calligraphic taper)
        const speed = dist / dt;
        const targetWidth = Math.max(3.5, Math.min(18, 16 - speed * 3.5));

        points.push({
          x: e.clientX,
          y: e.clientY,
          time: now,
          width: targetWidth,
        });

        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = now;
      }
    });

    document.addEventListener("mouseleave", () => {
      lastX = -1;
      lastY = -1;
    });

    const RIBBON_LIFETIME = 520; // milliseconds

    function renderRibbon() {
      ctx.clearRect(0, 0, W, H);
      const now = Date.now();

      // Prune old points
      points = points.filter(p => now - p.time < RIBBON_LIFETIME);

      if (points.length >= 2) {
        for (let i = 1; i < points.length; i++) {
          const p0 = points[i - 1];
          const p1 = points[i];
          const ageRatio = (now - p1.time) / RIBBON_LIFETIME;
          const alpha = Math.max(0, (1 - ageRatio) * 0.65);

          if (alpha <= 0.01) continue;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);

          // Van Gogh dual-tone gradient along the stroke
          const grad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
          grad.addColorStop(0, `rgba(200, 145, 26, ${alpha})`);           // sunflower gold
          grad.addColorStop(0.5, `rgba(226, 168, 43, ${alpha * 0.95})`); // warm amber
          grad.addColorStop(1, `rgba(107, 150, 184, ${alpha * 0.85})`);   // starry cobalt

          ctx.strokeStyle = grad;
          ctx.lineWidth = p1.width * (1 - ageRatio * 0.4);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();

          // Inner luminous core stroke
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(255, 248, 220, ${alpha * 0.5})`;
          ctx.lineWidth = Math.max(1.2, p1.width * 0.35);
          ctx.stroke();

          ctx.restore();
        }
      }

      requestAnimationFrame(renderRibbon);
    }

    if (!reduced) renderRibbon();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3. CAMERA LENS VIEWFINDER (PHOTOGRAPHER FOCUS RETICLE)
     An interactive optical focus ring & viewfinder brackets that smoothly track
     the cursor, lock focus on photos [AF-LOCK], and snap shutter on click.
  ══════════════════════════════════════════════════════════════════════════ */
  function initViewfinderCursor() {
    if (window.matchMedia("(hover: none)").matches) return;

    const reticle = document.createElement("div");
    reticle.id = "lens-viewfinder";
    reticle.innerHTML = `
      <div class="vf-corner vf-tl"></div>
      <div class="vf-corner vf-tr"></div>
      <div class="vf-corner vf-bl"></div>
      <div class="vf-corner vf-br"></div>
      <div class="vf-crosshair"></div>
      <div class="vf-ring"></div>
      <div class="vf-badge">AF</div>
    `;
    document.body.appendChild(reticle);

    let mouseX = -100, mouseY = -100;
    let curX = -100, curY = -100;
    let isVisible = false;

    document.addEventListener("mousemove", e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        curX = mouseX;
        curY = mouseY;
        isVisible = true;
        reticle.classList.add("is-visible");
      }
    });

    document.addEventListener("mouseleave", () => {
      isVisible = false;
      reticle.classList.remove("is-visible");
    });

    // Detect hover over gallery photos vs buttons
    document.addEventListener("mouseover", e => {
      const card = e.target.closest(".work-card, .work-media");
      const btn = e.target.closest("a, button, .btn, .filter-btn, input, textarea, select");

      if (card) {
        reticle.classList.add("focus-photo");
      } else {
        reticle.classList.remove("focus-photo");
      }

      if (btn && !card) {
        reticle.classList.add("focus-btn");
      } else {
        reticle.classList.remove("focus-btn");
      }
    });

    // Camera shutter snap on click
    document.addEventListener("mousedown", () => {
      reticle.classList.add("shutter-snap");
    });
    document.addEventListener("mouseup", () => {
      setTimeout(() => reticle.classList.remove("shutter-snap"), 180);
    });

    // Smooth spring physics loop
    function updateReticle() {
      if (isVisible) {
        curX += (mouseX - curX) * 0.22;
        curY += (mouseY - curY) * 0.22;
        reticle.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      }
      requestAnimationFrame(updateReticle);
    }

    if (!reduced) updateReticle();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4. IMPRESSIONIST WIND SWIRLS (REPLACES DUST DOTS IN SECTIONS)
     Soft, flowing painterly brush curves that drift peacefully through
     content sections, recalling Van Gogh's waving cypress & wheat currents.
  ══════════════════════════════════════════════════════════════════════════ */
  function initImpressionistWind() {
    const sections = document.querySelectorAll(".work, .journal, .about");
    sections.forEach(section => {
      const canvas = document.createElement("canvas");
      canvas.className = "section-wind-canvas";
      canvas.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0.35;
      `;
      if (getComputedStyle(section).position === "static") {
        section.style.position = "relative";
      }
      section.insertBefore(canvas, section.firstChild);

      const ctx = canvas.getContext("2d");
      let W, H;

      const colors = [VG.sunflower, VG.wheat, VG.cobalt, VG.periwinkle, VG.straw];

      class WindArc {
        constructor() { this.reset(true); }

        reset(initial = false) {
          this.x = Math.random() * W;
          this.y = initial ? Math.random() * H : H + 20;
          this.len = Math.random() * 70 + 40;
          this.curve = (Math.random() - 0.5) * 35;
          this.vx = Math.random() * 0.4 + 0.15;
          this.vy = -(Math.random() * 0.5 + 0.2);
          this.width = Math.random() * 1.8 + 0.8;
          this.alpha = Math.random() * 0.3 + 0.1;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.angle = Math.random() * Math.PI * 2;
        }

        update() {
          this.angle += 0.012;
          this.x += this.vx + Math.sin(this.angle) * 0.4;
          this.y += this.vy;
          if (this.y < -this.len || this.x > W + 50) this.reset();
        }

        draw() {
          ctx.save();
          ctx.globalAlpha = this.alpha;
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.width;
          ctx.lineCap = "round";

          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.quadraticCurveTo(
            this.x + this.len * 0.5,
            this.y + this.curve,
            this.x + this.len,
            this.y - 12
          );
          ctx.stroke();
          ctx.restore();
        }
      }

      let arcs = [];

      function resize() {
        W = canvas.width  = section.offsetWidth;
        H = canvas.height = section.offsetHeight;
      }

      function init() {
        resize();
        const count = Math.min(Math.floor(W / 90), 22);
        arcs = Array.from({ length: count }, () => new WindArc());
      }

      let visible = false;
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
      }, { threshold: 0.1 });
      observer.observe(section);

      function loop() {
        if (visible) {
          ctx.clearRect(0, 0, W, H);
          arcs.forEach(a => { a.update(); a.draw(); });
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
     5. MAGNETIC TILT CARDS
     Work & journal cards tilt in 3D perspective toward the mouse with sheen
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
            perspective(750px)
            rotateY(${dx * 7}deg)
            rotateX(${-dy * 5.5}deg)
            translateZ(6px)
          `;
          card.style.transition = "transform 0.08s linear";

          const pct = `${((dx + 1) / 2) * 100}%`;
          card.style.setProperty("--shimmer-x", pct);
        });
      });

      card.addEventListener("mouseleave", () => {
        cancelAnimationFrame(raf);
        card.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
        card.style.transform  = "perspective(750px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6. OPTICAL SHUTTER CLICK PULSE (NO SPLATTER DOTS)
     A clean, luminous optical lens flare ring on click
  ══════════════════════════════════════════════════════════════════════════ */
  function initClickOptics() {
    const canvas = document.createElement("canvas");
    canvas.id = "optics-click-canvas";
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

    class LensPulse {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 6;
        this.maxR = 68;
        this.alpha = 0.85;
      }
      update() {
        this.r += (this.maxR - this.r) * 0.16 + 1.2;
        this.alpha = Math.max(0, 0.85 * (1 - this.r / this.maxR));
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Golden luminous aperture ring
        const grad = ctx.createRadialGradient(this.x, this.y, Math.max(0, this.r - 8), this.x, this.y, this.r);
        grad.addColorStop(0, "rgba(200, 145, 26, 0)");
        grad.addColorStop(0.8, "rgba(226, 168, 43, 0.65)");
        grad.addColorStop(1, "rgba(107, 150, 184, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();

        // Delicate crisp ring
        ctx.strokeStyle = `rgba(245, 208, 128, ${this.alpha * 0.9})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
      get dead() { return this.alpha <= 0.01 || this.r >= this.maxR; }
    }

    let pulses = [];

    document.addEventListener("click", e => {
      pulses.push(new LensPulse(e.clientX, e.clientY));
    });

    window.addEventListener("resize", () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    function loop() {
      ctx.clearRect(0, 0, W, H);
      pulses = pulses.filter(p => !p.dead);
      pulses.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    }

    if (!reduced) loop();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7. SECTION TRANSITION BRUSH SWEEP
     Subtle Van Gogh golden-cobalt line sweep on scroll reveal
  ══════════════════════════════════════════════════════════════════════════ */
  function initScrollBrush() {
    const sections = document.querySelectorAll("section");
    sections.forEach(section => {
      const sweep = document.createElement("div");
      sweep.style.cssText = `
        position: absolute;
        top: 0; left: -100%; width: 100%; height: 3px;
        background: linear-gradient(90deg, transparent, ${VG.sunflower}, ${VG.cobalt}, transparent);
        pointer-events: none;
        z-index: 10;
        transition: left 0.85s cubic-bezier(0.22,0.61,0.36,1), opacity 0.5s ease;
        opacity: 0;
        border-radius: 2px;
      `;
      if (getComputedStyle(section).position === "static") section.style.position = "relative";
      section.appendChild(sweep);

      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          sweep.style.opacity = "1";
          sweep.style.left    = "0";
          setTimeout(() => { sweep.style.opacity = "0"; sweep.style.left = "100%"; }, 850);
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
    initFluidBrushRibbon();
    initViewfinderCursor();
    initImpressionistWind();
    initMagneticCards();
    initClickOptics();
    initScrollBrush();
  });

})();
