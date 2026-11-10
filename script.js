(() => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");
  const main = document.querySelector("main");
  const footer = document.querySelector(".site-footer");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ==========================================================================
     01. Procedural Analog Web Audio Soundscape
     ========================================================================== */
  let audioCtx = null;
  let soundEnabled = localStorage.getItem("ev_sound_enabled") === "true";

  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  };

  // Synthetic mechanical Leica shutter click sound
  const playShutter = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Click 1: Shutter Curtain Opening
      const bufferSize = ctx.sampleRate * 0.045;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

      // Click 2: Shutter Curtain Closing (60ms later)
      const closeNow = now + 0.06;
      const closeNoise = ctx.createBufferSource();
      closeNoise.buffer = buffer;

      const closeFilter = ctx.createBiquadFilter();
      closeFilter.type = "bandpass";
      closeFilter.frequency.setValueAtTime(950, closeNow);
      closeFilter.Q.setValueAtTime(3.0, closeNow);

      const closeGain = ctx.createGain();
      closeGain.gain.setValueAtTime(0.28, closeNow);
      closeGain.gain.exponentialRampToValueAtTime(0.001, closeNow + 0.05);

      closeNoise.connect(closeFilter);
      closeFilter.connect(closeGain);
      closeGain.connect(ctx.destination);
      closeNoise.start(closeNow);
    } catch (_) {}
  };

  // High-frequency miniature tactile dial click
  const playDial = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (_) {}
  };

  // Soft slide swoosh
  const playSlide = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  };

  // Sound Toggle Button setup
  const soundToggle = document.querySelector("#sound-toggle");
  const soundStatusText = document.querySelector("#sound-status-text");

  const updateSoundUI = () => {
    if (!soundToggle) return;
    soundToggle.classList.toggle("is-playing", soundEnabled);
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    if (soundStatusText) {
      soundStatusText.textContent = soundEnabled ? "On" : "Off";
    }
  };

  if (soundToggle) {
    updateSoundUI();
    soundToggle.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem("ev_sound_enabled", String(soundEnabled));
      updateSoundUI();
      if (soundEnabled) {
        getAudioContext();
        playShutter();
      }
    });
  }

  /* ==========================================================================
     02. Live Portland Studio Clock & Dynamic Sun Phase
     ========================================================================== */
  const studioTimeEl = document.querySelector("#studio-time");
  const studioPhaseEl = document.querySelector("#studio-phase");

  const updateStudioSolarState = () => {
    try {
      const now = new Date();
      // Format time in America/Los_Angeles (Portland, Oregon)
      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const hourFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        hour12: false,
      });

      const formattedTime = timeFormatter.format(now);
      const pdxHour = parseInt(hourFormatter.format(now), 10);

      if (studioTimeEl) studioTimeEl.textContent = formattedTime;

      // Determine photography sun phase in Oregon based on hour
      let phase = "Daylight";
      if (pdxHour >= 5 && pdxHour < 6) phase = "Civil Dawn";
      else if (pdxHour >= 6 && pdxHour < 8) phase = "Golden Hour (AM)";
      else if (pdxHour >= 8 && pdxHour < 16) phase = "Clear Light";
      else if (pdxHour >= 16 && pdxHour < 19) phase = "Golden Hour (PM)";
      else if (pdxHour >= 19 && pdxHour < 20) phase = "Blue Hour";
      else phase = "Darkroom Hours";

      if (studioPhaseEl) studioPhaseEl.textContent = phase;
    } catch (_) {}
  };

  updateStudioSolarState();
  window.setInterval(updateStudioSolarState, 30000);

  /* ==========================================================================
     03. Photographic Film Stock & Atmosphere Theme Switcher
     ========================================================================== */
  const savedTheme = localStorage.getItem("ev_theme") || "default";
  const paletteButtons = document.querySelectorAll(".palette-pill, .mobile-pal-btn");

  const setTheme = (themeName) => {
    body.setAttribute("data-theme", themeName);
    localStorage.setItem("ev_theme", themeName);

    paletteButtons.forEach((btn) => {
      const isActive = btn.dataset.theme === themeName;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    playDial();
  };

  setTheme(savedTheme);

  paletteButtons.forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });

  /* ==========================================================================
     04. Luxury Interactive Custom Cursor
     ========================================================================== */
  const customCursor = document.querySelector("#custom-cursor");
  const cursorBadge = document.querySelector("#cursor-badge");

  if (customCursor && canHover && !prefersReducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isMoving = false;

    const onPointerMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        customCursor.classList.add("is-active");
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    document.addEventListener("mouseleave", () => {
      customCursor.classList.remove("is-active");
      isMoving = false;
    });

    // Smooth lerp loop
    const renderCursor = () => {
      const ease = 0.18;
      cursorX += (mouseX - cursorX) * ease;
      cursorY += (mouseY - cursorY) * ease;
      customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      window.requestAnimationFrame(renderCursor);
    };
    window.requestAnimationFrame(renderCursor);

    // Click pulse
    window.addEventListener("mousedown", () => customCursor.classList.add("is-clicked"));
    window.addEventListener("mouseup", () => customCursor.classList.remove("is-clicked"));

    // Context states
    const addCursorContext = (selector, stateClass, badgeText) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("pointerenter", () => {
          customCursor.classList.add(stateClass);
          if (badgeText && cursorBadge) cursorBadge.textContent = badgeText;
        });
        el.addEventListener("pointerleave", () => {
          customCursor.classList.remove(stateClass);
        });
      });
    };

    addCursorContext(".work-button", "is-view", "VIEW");
    addCursorContext(".compare-stage", "is-drag", "← DRAG →");
    addCursorContext(".journal-button", "is-hover", "READ");
    addCursorContext("button, a, .scope-option", "is-hover", "");
  }

  /* ==========================================================================
     05. Hero Atmospheric Dust Particles Canvas
     ========================================================================== */
  const dustCanvas = document.querySelector("#hero-dust-canvas");
  if (dustCanvas && !prefersReducedMotion) {
    const ctx = dustCanvas.getContext("2d");
    let animationId = null;
    let width = 0;
    let height = 0;
    let particles = [];
    const particleCount = 42;

    const resizeDust = () => {
      width = dustCanvas.clientWidth;
      height = dustCanvas.clientHeight;
      dustCanvas.width = width;
      dustCanvas.height = height;
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.8 + 0.6,
          alpha: Math.random() * 0.45 + 0.15,
          speedX: (Math.random() - 0.5) * 0.35,
          speedY: (Math.random() - 0.5) * 0.35 - 0.15,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#fff";

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 230, ${p.alpha})`;
        ctx.fill();
      });

      animationId = window.requestAnimationFrame(drawParticles);
    };

    resizeDust();
    initParticles();
    drawParticles();

    window.addEventListener("resize", () => {
      resizeDust();
      initParticles();
    });

    // Pause canvas when out of view
    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) {
          if (animationId) window.cancelAnimationFrame(animationId);
          animationId = null;
        } else if (!animationId) {
          drawParticles();
        }
      });
      heroObserver.observe(dustCanvas);
    }
  }

  /* ==========================================================================
     06. Header Scroll State & Mobile Menu
     ========================================================================== */
  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

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
      if (firstLink) {
        window.setTimeout(() => firstLink.focus(), prefersReducedMotion ? 0 : 380);
      }
    } else if (returnFocus) {
      menuToggle.focus({ preventScroll: true });
    }
  };

  menuToggle.addEventListener("click", () => setMenu(!menuOpen));

  document.querySelector(".brand").addEventListener("click", () => {
    if (menuOpen) setMenu(false, false);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100 && menuOpen) setMenu(false, false);
  });

  /* ==========================================================================
     07. Reveal on Scroll
     ========================================================================== */
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* Image Loading State */
  document.querySelectorAll(".work-media img, .about-media img, .journal-media img").forEach((image) => {
    const showImage = () => image.classList.add("is-loaded");
    if (image.complete) {
      showImage();
    } else {
      image.addEventListener("load", showImage, { once: true });
    }
  });

  /* ==========================================================================
     08. Gallery Filtering & View Switcher (Masonry, Grid, Filmstrip)
     ========================================================================== */
  const filterButtons = [...document.querySelectorAll(".filter-btn")];
  const workCards = [...document.querySelectorAll(".work-card")];
  const gallery = document.querySelector("#gallery");
  const frameCount = document.querySelector("#frame-count");
  const viewButtons = document.querySelectorAll(".view-btn");

  const setFilter = (filter) => {
    playDial();
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    let visibleCount = 0;
    workCards.forEach((card) => {
      const isVisible = filter === "all" || card.dataset.category === filter;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (frameCount) frameCount.textContent = String(visibleCount).padStart(2, "0");
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  // View Switcher: Masonry / Grid / Filmstrip
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      playDial();
      const view = btn.dataset.view;
      viewButtons.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle("is-active", isCurrent);
        b.setAttribute("aria-pressed", String(isCurrent));
      });

      if (gallery) {
        gallery.classList.remove("view-masonry", "view-grid", "view-filmstrip");
        gallery.classList.add(`view-${view}`);
      }
    });
  });

  // Smooth mouse drag-to-scroll for horizontal filmstrip view
  if (gallery) {
    let isGalleryDown = false;
    let galleryStartX = 0;
    let galleryScrollLeft = 0;

    gallery.addEventListener("mousedown", (e) => {
      if (!gallery.classList.contains("view-filmstrip")) return;
      if (e.target.closest(".work-button, .work-bookmark-btn")) return;
      isGalleryDown = true;
      galleryStartX = e.pageX - gallery.offsetLeft;
      galleryScrollLeft = gallery.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      isGalleryDown = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isGalleryDown || !gallery.classList.contains("view-filmstrip")) return;
      e.preventDefault();
      const x = e.pageX - gallery.offsetLeft;
      const walk = (x - galleryStartX) * 1.5;
      gallery.scrollLeft = galleryScrollLeft - walk;
    });
  }

  /* ==========================================================================
     09. 3D Card Tilt & Specular Glare Tracking
     ========================================================================== */
  if (canHover && !prefersReducedMotion) {
    workCards.forEach((card) => {
      const media = card.querySelector(".work-media");

      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        if (media) {
          media.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
        }

        card.style.setProperty("--gx", `${((x / rect.width) * 100).toFixed(1)}%`);
        card.style.setProperty("--gy", `${((y / rect.height) * 100).toFixed(1)}%`);
      });

      card.addEventListener("pointerleave", () => {
        if (media) {
          media.style.transform = "";
          media.style.transition = "transform 0.4s var(--ease)";
          setTimeout(() => {
            if (media) media.style.transition = "";
          }, 400);
        }
      });
    });
  }

  /* ==========================================================================
     10. Client Curated Favorites Shortlist (Bookmarks)
     ========================================================================== */
  let curatedSet = new Set(JSON.parse(localStorage.getItem("ev_curated_frames") || "[]"));
  const curatedDock = document.querySelector("#curated-dock");
  const curatedCount = document.querySelector("#curated-count");
  const curatedPillIndicator = document.querySelector("#curated-pill-indicator");
  const curatedIndicatorCount = document.querySelector("#curated-indicator-count");
  const curatedTrigger = document.querySelector("#curated-trigger");
  const curatedModal = document.querySelector("#curated-modal");
  const curatedModalClose = document.querySelector("#curated-modal-close");
  const curatedGrid = document.querySelector("#curated-grid");
  const curatedEmptyNote = document.querySelector("#curated-empty-note");
  const curatedClearBtn = document.querySelector("#curated-clear-btn");

  const saveCurated = () => {
    localStorage.setItem("ev_curated_frames", JSON.stringify([...curatedSet]));
  };

  const updateCuratedUI = () => {
    const total = curatedSet.size;
    if (curatedCount) curatedCount.textContent = String(total);
    if (curatedIndicatorCount) curatedIndicatorCount.textContent = String(total);

    if (curatedDock) curatedDock.hidden = total === 0;
    if (curatedPillIndicator) curatedPillIndicator.hidden = total === 0;

    document.querySelectorAll(".work-bookmark-btn").forEach((btn) => {
      const id = btn.dataset.bookmark;
      const isBookmarked = curatedSet.has(id);
      btn.classList.toggle("is-bookmarked", isBookmarked);
      btn.setAttribute("aria-label", isBookmarked ? "Remove from shortlist" : "Add to shortlist");
    });
  };

  const renderCuratedModal = () => {
    if (!curatedGrid) return;
    curatedGrid.innerHTML = "";

    if (curatedSet.size === 0) {
      if (curatedEmptyNote) curatedEmptyNote.hidden = false;
      return;
    }
    if (curatedEmptyNote) curatedEmptyNote.hidden = true;

    curatedSet.forEach((id) => {
      const card = document.querySelector(`.work-card[data-id="${id}"]`);
      if (!card) return;

      const title = card.dataset.title;
      const imgSrc = card.querySelector("img")?.src || "";

      const item = document.createElement("div");
      item.className = "curated-item";
      item.innerHTML = `
        <img src="${imgSrc}" alt="${title}">
        <div class="curated-item-info">
          <span class="curated-item-name">${title}</span>
          <button class="curated-remove-btn" type="button" data-remove="${id}">Remove</button>
        </div>
      `;
      curatedGrid.appendChild(item);
    });

    curatedGrid.querySelectorAll(".curated-remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        curatedSet.delete(btn.dataset.remove);
        saveCurated();
        updateCuratedUI();
        renderCuratedModal();
        playDial();
      });
    });
  };

  document.querySelectorAll(".work-bookmark-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.bookmark;
      if (curatedSet.has(id)) {
        curatedSet.delete(id);
      } else {
        curatedSet.add(id);
        playDial();
      }
      saveCurated();
      updateCuratedUI();
    });
  });

  if (curatedTrigger && curatedModal) {
    curatedTrigger.addEventListener("click", () => {
      renderCuratedModal();
      curatedModal.classList.add("is-open");
      curatedModal.setAttribute("aria-hidden", "false");
      body.classList.add("curated-open");
      playDial();
    });

    const closeCuratedModal = () => {
      curatedModal.classList.remove("is-open");
      curatedModal.setAttribute("aria-hidden", "true");
      body.classList.remove("curated-open");
    };

    if (curatedModalClose) curatedModalClose.addEventListener("click", closeCuratedModal);

    curatedModal.addEventListener("click", (e) => {
      if (e.target === curatedModal) closeCuratedModal();
    });

    if (curatedClearBtn) {
      curatedClearBtn.addEventListener("click", () => {
        curatedSet.clear();
        saveCurated();
        updateCuratedUI();
        renderCuratedModal();
        playDial();
      });
    }

    const curatedInquireBtn = document.querySelector("#curated-inquire-btn");
    if (curatedInquireBtn) {
      curatedInquireBtn.addEventListener("click", () => {
        closeCuratedModal();
      });
    }
  }

  updateCuratedUI();

  /* ==========================================================================
     11. Interactive Darkroom Before / After Compare Slider
     ========================================================================== */
  const compareStage = document.querySelector("#compare-stage");
  const compareBefore = document.querySelector("#compare-before");
  const compareHandle = document.querySelector("#compare-handle");

  if (compareStage && compareBefore && compareHandle) {
    let isDraggingCompare = false;

    const setComparePosition = (percent) => {
      const clamped = Math.min(100, Math.max(0, percent));
      compareStage.style.setProperty("--split", `${clamped}%`);
      compareHandle.style.left = `${clamped}%`;
      compareHandle.setAttribute("aria-valuenow", String(Math.round(clamped)));
    };

    setComparePosition(50);

    const updateCompareFromEvent = (e) => {
      const rect = compareStage.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const offsetX = clientX - rect.left;
      const ratio = (offsetX / rect.width) * 100;
      setComparePosition(ratio);
    };

    compareStage.addEventListener("mousedown", (e) => {
      isDraggingCompare = true;
      updateCompareFromEvent(e);
      playDial();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDraggingCompare) return;
      updateCompareFromEvent(e);
    });

    window.addEventListener("mouseup", () => {
      isDraggingCompare = false;
    });

    compareStage.addEventListener("touchstart", (e) => {
      isDraggingCompare = true;
      updateCompareFromEvent(e);
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (!isDraggingCompare) return;
      updateCompareFromEvent(e);
    }, { passive: true });

    window.addEventListener("touchend", () => {
      isDraggingCompare = false;
    });

    compareHandle.addEventListener("keydown", (e) => {
      const current = parseFloat(compareHandle.getAttribute("aria-valuenow") || "50");
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setComparePosition(current - 5);
        playDial();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setComparePosition(current + 5);
        playDial();
      }
    });
  }

  /* ==========================================================================
     12. Next-Gen Darkroom Lightbox (Loupe, Sim Filters, Thumbnails Strip)
     ========================================================================== */
  const lightbox = document.querySelector("#lightbox");
  const lightboxImg = document.querySelector("#lightbox-img");
  const lightboxImgWrapper = document.querySelector("#lightbox-img-wrapper");
  const lightboxTitle = document.querySelector("#lightbox-title");
  const lightboxCategory = document.querySelector("#lightbox-category");
  const lightboxGearSpec = document.querySelector("#lightbox-gear-spec");
  const lightboxFilmTag = document.querySelector("#lightbox-film-tag");
  const lightboxCounter = document.querySelector("#lightbox-counter");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");
  const lightboxStrip = document.querySelector("#lightbox-strip");
  const loupeToggleBtn = document.querySelector("#loupe-toggle-btn");
  const lightboxLoupe = document.querySelector("#lightbox-loupe");
  const loupeZoom = document.querySelector("#loupe-zoom");
  const lightboxFsBtn = document.querySelector("#lightbox-fs-btn");
  const simButtons = document.querySelectorAll(".lightbox-sim-picker .sim-btn");

  let visibleCards = [];
  let currentIndex = 0;
  let lastTrigger = null;
  let loupeEnabled = false;

  const getVisibleCards = () => workCards.filter((card) => !card.hidden);

  // Render thumbnail strip inside lightbox
  const buildLightboxStrip = () => {
    if (!lightboxStrip) return;
    lightboxStrip.innerHTML = "";
    visibleCards.forEach((card, idx) => {
      const thumbBtn = document.createElement("button");
      thumbBtn.className = `lightbox-thumb ${idx === currentIndex ? "is-active" : ""}`;
      thumbBtn.type = "button";
      thumbBtn.setAttribute("aria-label", `Jump to frame ${idx + 1}`);

      const img = card.querySelector("img");
      if (img) {
        thumbBtn.innerHTML = `<img src="${img.src}" alt="${card.dataset.title}">`;
      }
      thumbBtn.addEventListener("click", () => {
        currentIndex = idx;
        renderLightbox();
        playSlide();
      });
      lightboxStrip.appendChild(thumbBtn);
    });
  };

  const renderLightbox = () => {
    const card = visibleCards[currentIndex];
    if (!card) return;

    const source = card.querySelector(".work-button")?.dataset.full;
    if (!source) return;

    lightbox.classList.add("is-loading");
    lightboxImg.src = source;
    lightboxImg.alt = card.dataset.title;
    lightboxTitle.textContent = card.dataset.title;
    lightboxCategory.textContent = card.dataset.label;

    if (lightboxGearSpec) {
      lightboxGearSpec.textContent = `${card.dataset.gear} · ${card.dataset.exposure}`;
    }
    if (lightboxFilmTag) {
      lightboxFilmTag.textContent = `${card.dataset.stock} · ${card.dataset.location}`;
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(visibleCards.length).padStart(2, "0")}`;
    }

    if (loupeZoom) {
      loupeZoom.style.backgroundImage = `url('${source}')`;
    }

    lightboxPrev.hidden = visibleCards.length < 2;
    lightboxNext.hidden = visibleCards.length < 2;

    // Highlight thumbnail
    if (lightboxStrip) {
      lightboxStrip.querySelectorAll(".lightbox-thumb").forEach((th, idx) => {
        th.classList.toggle("is-active", idx === currentIndex);
      });
    }

    const finishLoading = () => lightbox.classList.remove("is-loading");
    lightboxImg.onload = finishLoading;
    lightboxImg.onerror = finishLoading;
    if (lightboxImg.complete) finishLoading();
  };

  const openLightbox = (card) => {
    visibleCards = getVisibleCards();
    currentIndex = visibleCards.indexOf(card);
    if (currentIndex === -1) return;

    lastTrigger = card.querySelector(".work-button") || document.activeElement;
    buildLightboxStrip();
    renderLightbox();

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("lightbox-open");

    playShutter();
    window.setTimeout(() => lightboxClose.focus(), prefersReducedMotion ? 0 : 60);
  };

  const closeLightbox = () => {
    if (!lightbox.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open", "is-loading");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("lightbox-open");

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  };

  const showPrevious = () => {
    if (visibleCards.length < 2) return;
    currentIndex = (currentIndex - 1 + visibleCards.length) % visibleCards.length;
    renderLightbox();
    playSlide();
  };

  const showNext = () => {
    if (visibleCards.length < 2) return;
    currentIndex = (currentIndex + 1) % visibleCards.length;
    renderLightbox();
    playSlide();
  };

  workCards.forEach((card) => {
    const btn = card.querySelector(".work-button");
    if (btn) btn.addEventListener("click", () => openLightbox(card));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", showPrevious);
  lightboxNext.addEventListener("click", showNext);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-stage")) {
      closeLightbox();
    }
  });

  // Lightbox Film Simulation Filters
  simButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      simButtons.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle("is-active", isCurrent);
        b.setAttribute("aria-pressed", String(isCurrent));
      });
      lightbox.classList.remove("sim-normal", "sim-portra", "sim-bw", "sim-cool");
      if (btn.dataset.sim !== "normal") {
        lightbox.classList.add(`sim-${btn.dataset.sim}`);
      }
      playDial();
    });
  });

  // Optical Magnifier Loupe
  if (loupeToggleBtn && lightboxLoupe && lightboxImgWrapper) {
    loupeToggleBtn.addEventListener("click", () => {
      loupeEnabled = !loupeEnabled;
      loupeToggleBtn.classList.toggle("is-active", loupeEnabled);
      lightboxImgWrapper.classList.toggle("is-loupe-active", loupeEnabled);
      if (!loupeEnabled) lightboxLoupe.classList.remove("is-visible");
      playDial();
    });

    lightboxImgWrapper.addEventListener("pointermove", (e) => {
      if (!loupeEnabled) return;
      const rect = lightboxImg.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        lightboxLoupe.classList.remove("is-visible");
        return;
      }

      lightboxLoupe.classList.add("is-visible");
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      lightboxLoupe.style.left = `${x}px`;
      lightboxLoupe.style.top = `${y}px`;

      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;

      if (loupeZoom) {
        loupeZoom.style.backgroundPosition = `${percentX}% ${percentY}%`;
      }
    });

    lightboxImgWrapper.addEventListener("pointerleave", () => {
      lightboxLoupe.classList.remove("is-visible");
    });
  }

  // Fullscreen Button
  if (lightboxFsBtn) {
    lightboxFsBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        lightbox.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
      playDial();
    });
  }

  /* ==========================================================================
     13. Interactive Session Scope Estimator & Brief Builder
     ========================================================================== */
  const scopeState = {
    genre: "Portrait & Editorial",
    medium: "Hybrid (35mm Film + Digital RAW)",
    scope: "Half-Day Story (3-4 hours)",
  };

  const scopeOutput = document.querySelector("#scope-summary-output");
  const scopeDeliverables = document.querySelector("#scope-deliverables");
  const scopeEmailBtn = document.querySelector("#scope-email-btn");
  const scopeCopyBtn = document.querySelector("#scope-copy-btn");
  const scopeCopyText = document.querySelector("#scope-copy-text");

  const deliverablesMap = {
    "Portrait & Editorial": "Includes private online master gallery + 35mm film contact sheet + high-res licensing.",
    "Wedding & Elopement": "Includes full documentary coverage + custom archival print box + complete negative scans.",
    "Commercial Campaign": "Includes commercial worldwide usage + color grade master suites + RAW archival handoff.",
    "Landscape & Archival Print": "Includes museum-grade Hahnemühle rag prints signed and numbered + archival certification.",
  };

  const updateScopeSummary = () => {
    if (scopeOutput) {
      scopeOutput.textContent = `${scopeState.genre} · ${scopeState.medium} · ${scopeState.scope}`;
    }
    if (scopeDeliverables) {
      scopeDeliverables.textContent = deliverablesMap[scopeState.genre] || "";
    }

    // Curated bookmarks list if any
    const curatedTitles = [];
    curatedSet.forEach((id) => {
      const card = document.querySelector(`.work-card[data-id="${id}"]`);
      if (card) curatedTitles.push(card.dataset.title);
    });

    const curatedClause = curatedTitles.length
      ? `\n\nReferenced Shortlist Frames:\n- ${curatedTitles.join("\n- ")}`
      : "";

    const emailSubject = encodeURIComponent(`Session Inquiry: ${scopeState.genre}`);
    const emailBody = encodeURIComponent(
      `Hello Elias,\n\nI would love to inquire about booking a session with the following details:\n\n- Session Type: ${scopeState.genre}\n- Medium: ${scopeState.medium}\n- Scope & Duration: ${scopeState.scope}${curatedClause}\n\nLooking forward to speaking with you!\n\nBest regards,\n`
    );

    if (scopeEmailBtn) {
      scopeEmailBtn.href = `mailto:hello@eliasvance.com?subject=${emailSubject}&body=${emailBody}`;
    }
  };

  document.querySelectorAll(".scope-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.group;
      const val = btn.dataset.val;
      scopeState[group] = val;

      document.querySelectorAll(`.scope-option[data-group="${group}"]`).forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle("is-active", isCurrent);
        b.setAttribute("aria-checked", String(isCurrent));
      });

      playDial();
      updateScopeSummary();
    });
  });

  if (scopeCopyBtn) {
    scopeCopyBtn.addEventListener("click", () => {
      const brief = `Elias Vance Photography Session Brief:\n- Session Type: ${scopeState.genre}\n- Medium: ${scopeState.medium}\n- Timeframe: ${scopeState.scope}\n- Contact: hello@eliasvance.com`;
      navigator.clipboard.writeText(brief).then(() => {
        if (scopeCopyText) scopeCopyText.textContent = "Copied!";
        playDial();
        window.setTimeout(() => {
          if (scopeCopyText) scopeCopyText.textContent = "Copy Brief";
        }, 2200);
      });
    });
  }

  updateScopeSummary();

  /* ==========================================================================
     14. Keyboard Navigation & Accessibility Trap
     ========================================================================== */
  const trapFocus = (event, focusable) => {
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const getVisibleFocusable = (container) =>
    [...container.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])")].filter(
      (element) => !element.hidden && element.offsetParent !== null
    );

  document.addEventListener("keydown", (event) => {
    if (lightbox.classList.contains("is-open")) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      } else if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        lightboxFsBtn?.click();
      } else if (event.key === "z" || event.key === "Z") {
        event.preventDefault();
        loupeToggleBtn?.click();
      } else if (event.key === "Tab") {
        trapFocus(event, getVisibleFocusable(lightbox));
      }
      return;
    }

    if (menuOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false);
      } else if (event.key === "Tab") {
        const menuFocusable = [
          menuToggle,
          ...mobileMenu.querySelectorAll("a[href], button"),
        ].filter((element) => element.offsetParent !== null);
        trapFocus(event, menuFocusable);
      }
    }
  });

  /* ==========================================================================
     15. Scroll Progress Bar
     ========================================================================== */
  const progressBar = document.querySelector("#scroll-progress-bar");
  if (progressBar) {
    let progressFrame = null;
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
      progressFrame = null;
    };

    const requestProgress = () => {
      if (progressFrame) return;
      progressFrame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestProgress, { passive: true });
    window.addEventListener("resize", requestProgress);
  }

  /* ==========================================================================
     16. Animated Number Counters
     ========================================================================== */
  const counters = [...document.querySelectorAll("[data-count]")];

  const animateCounter = (element) => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;

    const duration = 1600;
    const start = window.performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  };

  if (counters.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  /* ==========================================================================
     17. Feedback Testimonial Slider
     ========================================================================== */
  const slider = document.querySelector("[data-slider]");

  if (slider) {
    const slides = [...slider.querySelectorAll(".feedback-slide")];
    const dots = [...slider.querySelectorAll("[data-slide-to]")];
    const dotsWrap = slider.querySelector(".feedback-dots");
    const currentLabel = slider.querySelector("#feedback-current");
    const prevButton = slider.querySelector("[data-slide-prev]");
    const nextButton = slider.querySelector("[data-slide-next]");
    const autoplayDelay = 6500;

    let slideIndex = 0;
    let autoplayId = null;

    const renderSlide = (index) => {
      slideIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        const active = i === slideIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });

      dots.forEach((dot, i) => {
        const active = i === slideIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", String(active));
        dot.tabIndex = active ? 0 : -1;
      });

      if (currentLabel) currentLabel.textContent = String(slideIndex + 1).padStart(2, "0");
    };

    const stopAutoplay = () => {
      if (autoplayId) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
    };

    const startAutoplay = () => {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayId = window.setInterval(() => renderSlide(slideIndex + 1), autoplayDelay);
    };

    const goToSlide = (index) => {
      renderSlide(index);
      startAutoplay();
      playSlide();
    };

    if (prevButton) prevButton.addEventListener("click", () => goToSlide(slideIndex - 1));
    if (nextButton) nextButton.addEventListener("click", () => goToSlide(slideIndex + 1));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => goToSlide(Number(dot.dataset.slideTo)));
    });

    if (dotsWrap) {
      dotsWrap.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        goToSlide(slideIndex + (event.key === "ArrowRight" ? 1 : -1));
        const activeDot = dots[slideIndex];
        if (activeDot) activeDot.focus();
      });
    }

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    slider.addEventListener("focusin", stopAutoplay);
    slider.addEventListener("focusout", (event) => {
      if (!slider.contains(event.relatedTarget)) startAutoplay();
    });

    renderSlide(0);
    startAutoplay();
  }

  /* ==========================================================================
     18. Journal Article Reader Modal
     ========================================================================== */
  const articles = {
    "prepare-portrait": {
      title: "How to prepare for a portrait that feels like you",
      meta: "Craft · Feb 2026 · 6 min read",
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
      `,
    },
    "coastal-fog": {
      title: "Chasing fog on the Oregon coast",
      meta: "Field notes · Jan 2026 · 4 min read",
      image: "assets/images/salt-wind.jpg",
      alt: "Waves meeting a pale shoreline under soft coastal light",
      body: `
        <p>The forecast said rain. The coast said nothing at all, which is its way of warning you that the good light is hiding somewhere behind the grey.</p>
        <p>I drove north before sunrise with two rolls of film and a thermos that leaked. By the time I parked, the headlands had disappeared. There was only the sound of water and the pale suggestion of a horizon.</p>
        <h3>Shoot the weather, not around it</h3>
        <p>Fog compresses a landscape. It removes the things you thought you came for — the wide view, the postcard composition — and replaces them with layers, texture, and a kind of quiet intimacy. You stop describing a place and start describing a feeling.</p>
        <blockquote>Some mornings the coast gives you nothing but grey. That is usually when it gives you everything.</blockquote>
        <p>I made eleven frames that morning. Nine of them are fog and nothing else. Two have a single figure walking a dog along the tideline, small enough to be a comma in the sentence. Those are the ones I kept.</p>
      `,
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
      `,
    },
  };

  const reader = document.querySelector("#reader");
  const readerPanel = reader ? reader.querySelector(".reader-panel") : null;
  const readerClose = reader ? reader.querySelector(".reader-close") : null;
  const readerTitle = reader ? reader.querySelector("#reader-title") : null;
  const readerMeta = reader ? reader.querySelector("#reader-meta") : null;
  const readerImage = reader ? reader.querySelector("#reader-img") : null;
  const readerBody = reader ? reader.querySelector("#reader-body") : null;
  const articleButtons = [...document.querySelectorAll("[data-article]")];

  let lastReaderTrigger = null;

  const closeReader = () => {
    if (!reader || !reader.classList.contains("is-open")) return;
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
    readerImage.src = article.image;
    readerImage.alt = article.alt;
    readerBody.innerHTML = article.body;

    lastReaderTrigger = trigger;
    if (readerPanel) readerPanel.scrollTop = 0;

    reader.classList.add("is-open");
    reader.setAttribute("aria-hidden", "false");
    body.classList.add("reader-open");
    playSlide();

    window.setTimeout(() => readerClose.focus(), prefersReducedMotion ? 0 : 60);
  };

  articleButtons.forEach((button) => {
    button.addEventListener("click", () => openReader(button.dataset.article, button));
  });

  if (reader) {
    readerClose.addEventListener("click", closeReader);
    reader.addEventListener("click", (event) => {
      if (event.target === reader) closeReader();
    });
    document.addEventListener("keydown", (event) => {
      if (reader.classList.contains("is-open") && event.key === "Escape") {
        event.preventDefault();
        closeReader();
      }
    });
  }

  /* ==========================================================================
     19. Awards Hover Preview Hologram
     ========================================================================== */
  const awardsSection = document.querySelector(".awards");
  const awardsList = document.querySelector(".awards-list");
  const awardRows = [...document.querySelectorAll(".award")];
  const awardsPreview = document.querySelector(".awards-preview");
  const awardsPreviewImage = document.querySelector("#awards-preview-img");

  if (
    awardsSection &&
    awardsList &&
    awardsPreview &&
    awardsPreviewImage &&
    awardRows.length &&
    canHover &&
    !prefersReducedMotion
  ) {
    let previewFrame = null;
    let previewX = 0;
    let previewY = 0;

    const positionPreview = () => {
      awardsPreview.style.setProperty("--px", `${previewX}px`);
      awardsPreview.style.setProperty("--py", `${previewY}px`);
      previewFrame = null;
    };

    awardsSection.addEventListener("pointermove", (event) => {
      const rect = awardsSection.getBoundingClientRect();
      previewX = event.clientX - rect.left;
      previewY = event.clientY - rect.top;
      if (previewFrame) return;
      previewFrame = window.requestAnimationFrame(positionPreview);
    });

    awardRows.forEach((row) => {
      row.addEventListener("pointerenter", () => {
        awardsPreviewImage.src = row.dataset.preview;
        awardsPreview.classList.add("is-visible");
      });
    });

    awardsList.addEventListener("pointerleave", () => {
      awardsPreview.classList.remove("is-visible");
    });
  }

  /* ==========================================================================
     20. Magnetic Pull Micro-Interactions
     ========================================================================== */
  if (canHover && !prefersReducedMotion) {
    document.querySelectorAll(".magnetic").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const offsetX = event.clientX - rect.left - rect.width / 2;
        const offsetY = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${offsetX * 0.18}px, ${offsetY * 0.28}px)`;
      });

      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
      });
    });
  }

  /* ==========================================================================
     21. Hero Parallax
     ========================================================================== */
  const hero = document.querySelector(".hero");
  const heroMedia = document.querySelector(".hero-media");

  if (hero && heroMedia && canHover && !prefersReducedMotion) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      heroMedia.style.setProperty("--hero-x", `${relX * -18}px`);
      heroMedia.style.setProperty("--hero-y", `${relY * -18}px`);
    });

    hero.addEventListener("pointerleave", () => {
      heroMedia.style.setProperty("--hero-x", "0px");
      heroMedia.style.setProperty("--hero-y", "0px");
    });
  }
})();
