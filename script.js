(() => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");
  const main = document.querySelector("main");
  const footer = document.querySelector(".site-footer");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================================
     01. Header Scroll State
     ========================================================================== */
  const setHeaderState = () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  /* ==========================================================================
     02. Mobile Menu
     ========================================================================== */
  let menuOpen = false;

  const setMenu = (open, returnFocus = true) => {
    menuOpen = open;
    body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.inert = !open;
    if (main) main.inert = open;
    if (footer) footer.inert = open;
    if (open) {
      const firstLink = mobileMenu.querySelector(".menu-nav a");
      if (firstLink) setTimeout(() => firstLink.focus(), prefersReducedMotion ? 0 : 300);
    } else if (returnFocus) { menuToggle.focus({ preventScroll: true }); }
  };

  menuToggle.addEventListener("click", () => setMenu(!menuOpen));
  document.querySelector(".brand").addEventListener("click", () => { if (menuOpen) setMenu(false, false); });
  mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  window.addEventListener("resize", () => { if (window.innerWidth > 900 && menuOpen) setMenu(false, false); });

  /* ==========================================================================
     03. Reveal on Scroll
     ========================================================================== */
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => observer.observe(el));
  } else { revealElements.forEach(el => el.classList.add("is-visible")); }

  /* Image Loading */
  document.querySelectorAll(".work-media img, .journal-media img, .about-image img, .hero-bg img, .interlude-bg img").forEach(img => {
    const show = () => img.classList.add("is-loaded");
    img.complete ? show() : img.addEventListener("load", show, { once: true });
  });

  /* ==========================================================================
     04. Gallery Filtering
     ========================================================================== */
  const filterButtons = [...document.querySelectorAll(".filter-btn")];
  const workCards = [...document.querySelectorAll(".work-card")];

  const setFilter = (filter) => {
    filterButtons.forEach(btn => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    workCards.forEach(card => {
      const visible = filter === "all" || card.dataset.category === filter;
      card.hidden = !visible;
    });
  };

  filterButtons.forEach(btn => btn.addEventListener("click", () => setFilter(btn.dataset.filter)));

  /* ==========================================================================
     05. Lightbox
     ========================================================================== */
  const lightbox = document.querySelector("#lightbox");
  const lightboxImg = document.querySelector("#lightbox-img");
  const lightboxTitle = document.querySelector("#lightbox-title");
  const lightboxMeta = document.querySelector("#lightbox-meta");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");
  const lightboxCounter = document.querySelector("#lightbox-counter");
  const lightboxOverlay = document.querySelector(".lightbox-overlay");

  let visibleCards = [];
  let currentIndex = 0;
  let lastTrigger = null;

  const getVisibleCards = () => workCards.filter(card => !card.hidden);

  const renderLightbox = () => {
    const card = visibleCards[currentIndex];
    if (!card) return;
    const link = card.querySelector(".work-link");
    const src = link?.dataset.full;
    const title = card.querySelector(".work-title")?.textContent || "";
    const cat = card.querySelector(".work-cat")?.textContent || "";
    const loc = card.querySelector(".work-location")?.textContent || "";
    
    lightbox.classList.add("is-loading");
    lightboxImg.src = src;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxMeta.textContent = `${cat} · ${loc}`;
    lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(visibleCards.length).padStart(2, "0")}`;
    lightboxPrev.hidden = visibleCards.length < 2;
    lightboxNext.hidden = visibleCards.length < 2;
    
    const done = () => lightbox.classList.remove("is-loading");
    lightboxImg.onload = done;
    lightboxImg.onerror = done;
    if (lightboxImg.complete) done();
  };

  const openLightbox = (card) => {
    visibleCards = getVisibleCards();
    currentIndex = visibleCards.indexOf(card);
    if (currentIndex === -1) return;
    lastTrigger = card.querySelector(".work-link") || document.activeElement;
    renderLightbox();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("lightbox-open");
    setTimeout(() => lightboxClose.focus(), prefersReducedMotion ? 0 : 60);
  };

  const closeLightbox = () => {
    if (!lightbox.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open", "is-loading");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("lightbox-open");
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  };

  const showPrev = () => {
    if (visibleCards.length < 2) return;
    currentIndex = (currentIndex - 1 + visibleCards.length) % visibleCards.length;
    renderLightbox();
  };
  const showNext = () => {
    if (visibleCards.length < 2) return;
    currentIndex = (currentIndex + 1) % visibleCards.length;
    renderLightbox();
  };

  workCards.forEach(card => {
    const link = card.querySelector(".work-link");
    link?.addEventListener("click", e => { e.preventDefault(); openLightbox(card); });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", showPrev);
  lightboxNext.addEventListener("click", showNext);
  lightboxOverlay?.addEventListener("click", closeLightbox);

  /* ==========================================================================
     06. Article Reader Modal
     ========================================================================== */
  const articles = {
    "prepare-portrait": {
      title: "Making room for a portrait to feel like you",
      meta: "Portraits · Feb 2026 · 6 min read",
      image: "assets/images/about.jpg",
      alt: "Photographer adjusting a portrait session in soft natural light",
      body: `
        <p>Most people arrive at a portrait session with a list of things they do not want: not too posed, not too serious, not that angle. I love that list. It tells me where the edges are. But the photographs we remember are rarely made at the edges — they are made in the small, unguarded middle.</p>
        <p>Here is what actually helps.</p>
        <h3>Bring something to do</h3>
        <p>A camera is easier to forget when your hands are busy. Bring a book, a cup of coffee, a guitar, your dog. The session does not have to begin with you looking into a lens. Sometimes it begins with you laughing at how badly the coffee is spilling.</p>
        <h3>Wear what you already love</h3>
        <p>Trends photograph like trends. A favourite jumper photographs like you. Choose textures and tones that feel like your ordinary life, then let the light do the rest.</p>
        <blockquote>Comfort is not the opposite of beauty. Most of the time, it is the doorway.</blockquote>
        <h3>Give yourself ten minutes</h3>
        <p>The first ten minutes are always a little strange. That is normal. We will shoot through it, look at a frame or two together, and settle into a rhythm. By the end, the camera is usually the least interesting thing in the room.</p>
        <p>If you take one thing away: you do not need to perform. You need to arrive, breathe, and let the hour be yours.</p>
      `
    },
    "coastal-fog": {
      title: "Chasing fog on the Oregon coast",
      meta: "Field Notes · Jan 2026 · 4 min read",
      image: "assets/images/salt-wind.jpg",
      alt: "Waves meeting a pale shoreline under soft coastal light",
      body: `
        <p>The forecast said rain. The coast said nothing at all, which is its way of warning you that the good light is hiding somewhere behind the grey.</p>
        <p>I drove north before sunrise with two rolls of film and a thermos that leaked. By the time I parked, the headlands had disappeared. There was only the sound of water and the pale suggestion of a horizon.</p>
        <h3>Shoot the weather, not around it</h3>
        <p>Fog compresses a landscape. It removes the things you thought you came for — the wide view, the postcard composition — and replaces them with layers, texture, and a kind of quiet intimacy. You stop describing a place and start describing a feeling.</p>
        <blockquote>Some mornings the coast gives you nothing but grey. That is usually when it gives you everything.</blockquote>
        <p>I made eleven frames that morning. Nine of them are fog and nothing else. Two have a single figure walking a dog along the tideline, small enough to be a comma in the sentence. Those are the ones I kept.</p>
      `
    },
    "shooting-film": {
      title: "Why I still shoot 35mm in a digital world",
      meta: "Process · Dec 2025 · 5 min read",
      image: "assets/images/forest.jpg",
      alt: "Sunbeams falling through a quiet forest canopy",
      body: `
        <p>I own a very good digital camera. I use it for most commissions, because it is fast, forgiving, and the files are ready before I leave the car park. So why do I still carry a 35mm body on nearly every personal shoot?</p>
        <h3>Because film counts</h3>
        <p>Thirty-six frames is a finite number. When a roll runs out, the thinking stops and the next roll begins. That limit changes the way I move: I wait longer, look harder, and stop making pictures just because the shutter is there.</p>
        <h3>Because the delay is a gift</h3>
        <p>With digital, the picture arrives instantly and the judgement arrives with it. With film, there is a gap — a week, sometimes two — between the moment and the evidence. By the time the scans come back, I have forgotten what I expected. I can see what is actually there.</p>
        <blockquote>Film does not make a photograph better. It makes me slower, and slower is often the point.</blockquote>
      `
    }
  };

  const reader = document.querySelector("#reader");
  const readerClose = document.querySelector(".reader-close");
  const readerOverlay = document.querySelector(".reader-overlay");
  const readerTitle = document.querySelector("#reader-title");
  const readerMeta = document.querySelector("#reader-meta");
  const readerImg = document.querySelector("#reader-img");
  const readerBody = document.querySelector("#reader-body");
  const articleLinks = [...document.querySelectorAll("[data-article]")];
  let lastReaderTrigger = null;

  const closeReader = () => {
    if (!reader?.classList.contains("is-open")) return;
    reader.classList.remove("is-open");
    reader.setAttribute("aria-hidden", "true");
    body.classList.remove("reader-open");
    if (lastReaderTrigger) lastReaderTrigger.focus({ preventScroll: true });
  };

  const openReader = (key, trigger) => {
    const article = articles[key];
    if (!reader || !article) return;
    readerTitle.textContent = article.title;
    readerMeta.textContent = article.meta;
    readerImg.src = article.image;
    readerImg.alt = article.alt;
    readerBody.innerHTML = article.body;
    lastReaderTrigger = trigger;
    reader.querySelector(".reader-panel")?.scrollTo(0, 0);
    reader.classList.add("is-open");
    reader.setAttribute("aria-hidden", "false");
    body.classList.add("reader-open");
    setTimeout(() => readerClose.focus(), prefersReducedMotion ? 0 : 60);
  };

  articleLinks.forEach(link => link.addEventListener("click", e => { e.preventDefault(); openReader(link.dataset.article, link); }));
  readerClose?.addEventListener("click", closeReader);
  readerOverlay?.addEventListener("click", closeReader);
  reader?.addEventListener("click", e => { if (e.target === reader) closeReader(); });

  /* ==========================================================================
     07. Scroll Progress Bar
     ========================================================================== */
  const progressBar = document.querySelector("#scroll-progress-bar");
  if (progressBar) {
    let raf = null;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, max > 0 ? window.scrollY / max : 0))})`;
      raf = null;
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
  }

  /* ==========================================================================
     08. Animated Counters
     ========================================================================== */
  const counters = [...document.querySelectorAll("[data-count]")];
  const animate = (el) => {
    const target = +el.dataset.count;
    if (!Number.isFinite(target)) return;
    const dur = 1600, start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (counters.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach(el => { el.textContent = el.dataset.count; });
    } else {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          counterObserver.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(counter => counterObserver.observe(counter));
    }
  }

  /* ========================================================================
     09. Subtle hero parallax
     ======================================================================== */
  const hero = document.querySelector(".hero");
  const heroImage = hero?.querySelector(".hero-bg img");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hero && heroImage && canHover && !prefersReducedMotion) {
    let pointerFrame = null;
    hero.addEventListener("pointermove", event => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * -8;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -8;
        heroImage.style.setProperty("--hero-x", `${x}px`);
        heroImage.style.setProperty("--hero-y", `${y}px`);
      });
    });
    hero.addEventListener("pointerleave", () => {
      heroImage.style.setProperty("--hero-x", "0px");
      heroImage.style.setProperty("--hero-y", "0px");
    });
  }

  /* ==========================================================================
     09. Keyboard Navigation
     ========================================================================== */
  const trap = (e, els) => {
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const focusable = (root) => [...root.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])")].filter(el => !el.hidden && el.offsetParent !== null);

  document.addEventListener("keydown", e => {
    if (lightbox?.classList.contains("is-open")) {
      if (e.key === "Escape") { e.preventDefault(); closeLightbox(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); showPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); showNext(); }
      else if (e.key === "Tab") trap(e, focusable(lightbox));
      return;
    }
    if (reader?.classList.contains("is-open")) {
      if (e.key === "Escape") { e.preventDefault(); closeReader(); }
      else if (e.key === "Tab") trap(e, focusable(reader));
      return;
    }
    if (menuOpen) {
      if (e.key === "Escape") { e.preventDefault(); setMenu(false); }
      else if (e.key === "Tab") trap(e, [menuToggle, ...mobileMenu.querySelectorAll("a, button")].filter(el => el.offsetParent !== null));
    }
  });
})();
