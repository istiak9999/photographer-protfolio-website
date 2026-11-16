/**
 * Gear & Cameras Page Interactive Logic
 * ─────────────────────────────────────────────────────────────────────────────
 * • Category Filtering (Cameras, Lenses, Film & Analog, Support)
 * • Field Loadout Presets (Coastal Explorer, Street Walk, Commercial Expedition)
 * • Interactive Gear Specs Inspection Modal
 * ─────────────────────────────────────────────────────────────────────────────
 */

(() => {
  /* ── 1. Comprehensive Gear Database ─────────────────────────────────────── */
  const GEAR_DATA = {
    "leica-m6": {
      title: "Leica M6 (0.72x Classic)",
      category: "Cameras",
      tag: "35mm Analog Rangefinder",
      role: "Street, documentary, intimate portraits, and personal field journal.",
      weight: "585g (body only)",
      year: "1984 / Handcrafted in Wetzlar, Germany",
      mount: "Leica M-mount",
      shutter: "Mechanically controlled rubberised cloth, 1s – 1/1000s, B",
      metering: "Selective TTL light meter with dual LED triangles",
      whyInBag: "The Leica M6 is not just a tool; it's a way of moving through the world unnoticed. Looking through the rangefinder window lets you see beyond the frame boundaries before the subject enters, allowing anticipation rather than reaction. In an era of boundless megapixels and electronic viewfinders, the pure mechanical click of the M6 shutter anchors my concentration.",
      image: "assets/images/gear-leica-m6.jpg",
      sampleLink: "index.html#work",
      loadouts: ["street", "all"]
    },
    "hasselblad-500cm": {
      title: "Hasselblad 500C/M",
      category: "Cameras",
      tag: "Medium Format 120 Film",
      role: "Fine-art coastal landscapes, architecture, and slow, deliberate portrait sessions.",
      weight: "1,550g (with 80mm Planar & A12 back)",
      year: "1970s Classic / Göteborg, Sweden",
      mount: "Hasselblad V-System bayonet",
      shutter: "In-lens Synchro-Compur leaf shutter, flash sync up to 1/500s",
      metering: "Full manual — external Sekonic incident meter required",
      whyInBag: "Peering down into the acute matte waist-level screen is akin to seeing a moving, luminous Dutch oil painting in the palm of your hands. The 6x6 square format strips away compositional conventions and demands radical symmetry or deliberate tension. The thunderous, mechanical mirror slap confirms that every single frame matters.",
      image: "assets/images/gear-hasselblad.jpg",
      sampleLink: "index.html#work",
      loadouts: ["coastal", "all"]
    },
    "fujifilm-gfx100ii": {
      title: "Fujifilm GFX 100 II",
      category: "Cameras",
      tag: "Digital Medium Format",
      role: "High-end commercial campaigns, fine-art museum archival prints, and deep tonal gradations.",
      weight: "1,030g (with battery & EVF)",
      year: "2023 / Sendai, Japan",
      mount: "Fujifilm G-mount",
      shutter: "Focal plane shutter up to 1/4000s, electronic to 1/32000s, 8.0-stop IBIS",
      metering: "256-zone multi, spot, average, center-weighted",
      whyInBag: "When a commission demands colossal detail for multi-meter gallery prints, the 102-megapixel BSI medium format sensor renders texture with lifelike, breathing three-dimensionality. Its 16-bit RAW files hold highlight roll-off and shadow tonality that mimics large-format color negative film better than any full-frame sensor ever built.",
      image: "assets/images/gear-gfx100ii.jpg",
      sampleLink: "index.html#work",
      loadouts: ["commercial", "all"]
    },
    "sony-a7rv": {
      title: "Sony A7R V",
      category: "Cameras",
      tag: "High-Resolution 35mm Digital",
      role: "All-weather coastal storm chasing, low-light documentary, and expedition backup.",
      weight: "723g (with battery)",
      year: "2022 / Tokyo, Japan",
      mount: "Sony E-mount",
      shutter: "1/8000s mechanical, dual CFexpress Type-A, 8.0-stop IBIS",
      metering: "1200-zone evaluative with AI-subject tracking",
      whyInBag: "Weather seals that have endured sub-zero Pacific Northwest blizzards and soaking sea spray along Cape Kiwanda. The 61MP sensor provides surgical sharpness, while the 9.44M-dot electronic viewfinder provides an immaculate preview in pitch-black twilight.",
      image: "assets/images/gear-sony-a7rv.svg",
      sampleLink: "index.html#work",
      loadouts: ["coastal", "commercial", "all"]
    },
    "leica-35-summicron": {
      title: "Leica Summicron-M 35mm f/2 ASPH",
      category: "Lenses",
      tag: "Rangefinder Prime Glass",
      role: "Documentary, environmental portraiture, and all-day street observation.",
      weight: "255g",
      year: "Modern Classic / Solms, Germany",
      mount: "Leica M-mount (E39 filter thread)",
      shutter: "Manual aperture ring f/2 to f/16, 7 elements in 5 groups",
      metering: "Manual focus with ergonomic focus tab",
      whyInBag: "35mm is the focal length of human vision in context — it captures both the person and their room, the lone tree and the mountain range. This lens delivers biting contrast and surgical center sharpness, yet renders out-of-focus highlights with gentle, painterly delicacy.",
      image: "assets/images/gear-leica-35.jpg",
      sampleLink: "index.html#work",
      loadouts: ["street", "all"]
    },
    "zeiss-80-planar": {
      title: "Carl Zeiss Planar T* 80mm f/2.8",
      category: "Lenses",
      tag: "Medium Format Analog Prime",
      role: "The iconic Hasselblad portrait & fine-art square landscape lens.",
      weight: "510g",
      year: "Oberkochen, Germany",
      mount: "Hasselblad V-mount bayonet",
      shutter: "Leaf shutter integrated, syncs at all speeds",
      metering: "Manual focus with smooth metal helicoid",
      whyInBag: "A legendary optical formula created over a century ago. The T* anti-reflective coating maintains rich micro-contrast while allowing highlights to bloom organically. When photographing portraits at f/2.8 on 6x6 film, skin seems painted with warm light rather than merely scanned by pixels.",
      image: "assets/images/gear-zeiss-80.jpg",
      sampleLink: "index.html#work",
      loadouts: ["coastal", "all"]
    },
    "fuji-gf-55": {
      title: "Fujinon GF 55mm f/1.7 R WR",
      category: "Lenses",
      tag: "Large Format Prime Lens",
      role: "Desert island lens for the GFX medium format system (equiv. 43mm f/1.3 in 35mm terms).",
      weight: "780g",
      year: "2023 / Japan",
      mount: "Fujifilm G-mount (77mm filter)",
      shutter: "Aperture range f/1.7 – f/22, 11 rounded aperture blades",
      metering: "Linear motor autofocus, weather-sealed at 9 points",
      whyInBag: "An optical tour de force. An f/1.7 aperture on a medium-format sensor produces background separation and three-dimensional pop that feels like looking through an open window into reality. Perfect for twilight portraits where natural ambient light is fading fast.",
      image: "assets/images/gear-fuji-gf55.svg",
      sampleLink: "index.html#work",
      loadouts: ["commercial", "all"]
    },
    "sony-50-gm": {
      title: "Sony FE 50mm f/1.2 GM",
      category: "Lenses",
      tag: "Fast Full-Frame Prime",
      role: "Nocturnal portraits, wedding vows at blue hour, and cinematic isolation.",
      weight: "778g",
      year: "2021 / Japan",
      mount: "Sony E-mount (72mm filter)",
      shutter: "f/1.2 – f/16, 11-blade circular aperture, 4 XD linear motors",
      metering: "De-clickable aperture ring, customizable focus holds",
      whyInBag: "Shooting at f/1.2 feels like painting with melted light. The falloff from pin-sharp eyelashes into dreamy, liquid cream bokeh creates an intimate, cinematic atmosphere even in cluttered or mundane spaces.",
      image: "assets/images/gear-sony-50.jpg",
      sampleLink: "index.html#work",
      loadouts: ["commercial", "coastal", "all"]
    },
    "kodak-portra-400": {
      title: "Kodak Professional Portra 400",
      category: "Film",
      tag: "Color Negative 120 & 35mm",
      role: "Golden hour weddings, coastal dunes, and fine-art portraiture.",
      weight: "120 Roll & 135-36 Canister",
      year: "Rochester, New York",
      mount: "C-41 Color Processing",
      shutter: "Nominal ISO 400 (rated at 250 for extra shadow density)",
      metering: "Exposed for the shadows, overexposed by +1 to +2 stops",
      whyInBag: "Portra 400 possesses the most forgiving highlight latitude in photographic history. When the sun dips over the Oregon coast and burns the clouds with fiery pastel gold, digital sensors can clip to pure white. Portra simply absorbs the photons, translating them into creamy peach, pale lavender, and wheat tones.",
      image: "assets/images/gear-portra-400.svg",
      sampleLink: "index.html#work",
      loadouts: ["coastal", "all"]
    },
    "kodak-trix-400": {
      title: "Kodak Tri-X 400 (Pushed to 1600)",
      category: "Film",
      tag: "Classic Black & White",
      role: "Moody street photography, rain-slicked pavement, and raw emotion.",
      weight: "135-36 Canister",
      year: "Since 1954 / Rochester, NY",
      mount: "Standard B&W Chemistry (D-76 or Rodinal)",
      shutter: "Rated at ISO 1600, pushed +2 stops in developer",
      metering: "High-contrast shadow metering",
      whyInBag: "The signature look of 20th-century photojournalism. Pushing Tri-X to 1600 tightens the grain into charcoal grit, deepens blacks into pitch ink, and gives silver gelatin prints a raw, unapologetic honesty that no digital black-and-white filter can replicate.",
      image: "assets/images/gear-trix-400.jpg",
      sampleLink: "index.html#work",
      loadouts: ["street", "all"]
    },
    "cinestill-800t": {
      title: "CineStill 800T (Tungsten)",
      category: "Film",
      tag: "Cinematic 35mm Stock",
      role: "Nightscapes, neon-lit storefronts, dusk highways, and theatrical lighting.",
      weight: "135-36 Canister",
      year: "Modified Kodak Vision3 5219 Motion Picture Stock",
      mount: "C-41 Process without Remjet layer",
      shutter: "Nominal ISO 800",
      metering: "Tungsten balanced (3200K)",
      whyInBag: "Because the remjet anti-halation backing is removed, intense practical light sources—streetlamps, neon signs, headlights—develop iconic red and orange halation blooms around their perimeters. It transforms ordinary night scenes into moody, impressionist cinema stills.",
      image: "assets/images/gear-cinestill-800t.svg",
      sampleLink: "index.html#work",
      loadouts: ["street", "all"]
    },
    "gitzo-tripod": {
      title: "Gitzo Mountaineer Series 2",
      category: "Support",
      tag: "Carbon Fiber Support System",
      role: "Long exposure coastal tides, alpine dusk panoramas, and medium format stability.",
      weight: "1,860g (with Arca-Swiss ball head)",
      year: "Bassano del Grappa, Italy",
      mount: "3/8-inch stud with Arca-Swiss quick release plate",
      shutter: "Max height 166cm, supports up to 18kg load",
      metering: "Carbon eXact tubing with G-lock ultra leg locks",
      whyInBag: "When long swells crash against sea stacks in 40-knot gale winds, a lightweight travel tripod shudders and ruins a 30-second exposure. The Gitzo remains unmoving like granite, anchored in wet beach sand while saltwater rolls across its carbon feet.",
      image: "assets/images/gear-gitzo-tripod.svg",
      sampleLink: "index.html#work",
      loadouts: ["coastal", "all"]
    },
    "sekonic-meter": {
      title: "Sekonic L-308X-U Flashmate",
      category: "Support",
      tag: "Incident & Ambient Light Meter",
      role: "Precise exposure calibration for Hasselblad 120 and Leica M6 analog frames.",
      weight: "100g",
      year: "Tokyo, Japan",
      mount: "Sliding Lumisphere for incident and reflected light",
      shutter: "Measures 0 to 19.9 EV at ISO 100",
      metering: "Incident hemisphere with 1/10th stop accuracy",
      whyInBag: "In-camera meters read reflected light, easily fooled by dark basalt rocks or bright snowbanks. An incident light meter measures the actual light falling directly onto the scene. Walking up to a portrait subject, holding the lumisphere under their chin, and taking a reading turns exposure into a tactile, mindful ritual.",
      image: "assets/images/gear-sekonic-meter.svg",
      sampleLink: "index.html#work",
      loadouts: ["coastal", "street", "all"]
    },
    "wotancraft-bag": {
      title: "Wotancraft Pilot 10L Travel Bag",
      category: "Support",
      tag: "Waxed Canvas Field Bag",
      role: "Carrying two camera bodies, three prime lenses, film, and spare batteries in torrential weather.",
      weight: "1,150g",
      year: "Taipei, Taiwan",
      mount: "Waxed 500D Cordura, waterproof YKK zippers, leather accents",
      shutter: "Modular divider system with quick-draw top flap",
      metering: "Khaki colorway that blends into natural landscapes",
      whyInBag: "Most modern camera bags scream 'expensive electronics inside.' The Pilot looks like an old traveler's duffel seasoned by rain, mud, and dust. It sits snugly across the chest on cliff climbs and protects precious glass from sudden coastal downpours.",
      image: "assets/images/gear-wotancraft-bag.svg",
      sampleLink: "index.html#work",
      loadouts: ["street", "coastal", "commercial", "all"]
    }
  };

  /* ── 2. DOM Elements ────────────────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll(".gear-filter-btn");
  const presetBtns = document.querySelectorAll(".gear-preset-btn");
  const gearCards = document.querySelectorAll(".gear-card");
  const modal = document.querySelector("#gear-modal");
  const modalClose = document.querySelector("#gear-modal-close");
  const modalBackdrop = document.querySelector(".gear-modal-backdrop");

  let currentCategory = "all";
  let currentLoadout = "all";

  /* ── 3. Category Filter Logic ───────────────────────────────────────────── */
  function filterGear() {
    gearCards.forEach(card => {
      const id = card.dataset.gearId;
      const data = GEAR_DATA[id];
      if (!data) return;

      const matchesCat = (currentCategory === "all") || (data.category.toLowerCase() === currentCategory);
      const matchesLoadout = (currentLoadout === "all") || data.loadouts.includes(currentLoadout);

      if (matchesCat) {
        card.hidden = false;
        if (currentLoadout !== "all") {
          card.classList.toggle("is-highlighted", matchesLoadout);
          card.classList.toggle("is-dimmed", !matchesLoadout);
        } else {
          card.classList.remove("is-highlighted", "is-dimmed");
        }
      } else {
        card.hidden = true;
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      currentCategory = btn.dataset.filter.toLowerCase();
      filterGear();
    });
  });

  /* ── 4. Loadout Preset Logic ────────────────────────────────────────────── */
  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const loadout = btn.dataset.preset;
      presetBtns.forEach(b => b.classList.remove("is-active"));

      if (currentLoadout === loadout) {
        currentLoadout = "all";
        presetBtns[0]?.classList.add("is-active");
      } else {
        btn.classList.add("is-active");
        currentLoadout = loadout;
      }
      filterGear();
    });
  });

  /* ── 5. Modal Inspection Drawer ─────────────────────────────────────────── */
  function openGearModal(id) {
    const item = GEAR_DATA[id];
    if (!item || !modal) return;

    document.querySelector("#modal-tag").textContent = item.tag;
    document.querySelector("#modal-title").textContent = item.title;
    document.querySelector("#modal-subtitle").textContent = item.role;
    document.querySelector("#modal-why").textContent = item.whyInBag;

    const modalImg = document.querySelector("#modal-img");
    if (modalImg && item.image) {
      modalImg.src = item.image;
      modalImg.alt = item.title;
    }

    // Populate specs table
    const tableBody = document.querySelector("#modal-specs-table-body");
    tableBody.innerHTML = `
      <tr><td>System Category</td><td>${item.category}</td></tr>
      <tr><td>Year / Origin</td><td>${item.year}</td></tr>
      <tr><td>Total Weight</td><td>${item.weight}</td></tr>
      <tr><td>Lens Mount / Thread</td><td>${item.mount}</td></tr>
      <tr><td>Shutter System</td><td>${item.shutter}</td></tr>
      <tr><td>Exposure & Metering</td><td>${item.metering}</td></tr>
    `;

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    modalClose?.focus();
  }

  function closeGearModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", e => {
    const btn = e.target.closest(".gear-inspect-btn, .gear-card-visual");
    if (!btn) return;
    const card = btn.closest(".gear-card");
    if (!card) return;
    e.preventDefault();
    openGearModal(card.dataset.gearId);
  });

  modalClose?.addEventListener("click", closeGearModal);
  modalBackdrop?.addEventListener("click", closeGearModal);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) {
      closeGearModal();
    }
  });

})();
