/**
 * Photo Interactions — Double-Tap Like + Comments
 * ─────────────────────────────────────────────────────────────────────────────
 * • Double-tap / double-click any gallery image → heart burst animation + like
 * • Single tap on ♡ button → like/unlike toggle
 * • Tap 💬 button → slide-up comment panel
 * • All data persisted in localStorage
 * ─────────────────────────────────────────────────────────────────────────────
 */

(() => {
  /* ── Helpers ────────────────────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const store = {
    get: (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set: (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  };

  const SVG_HEART_FULL = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  const SVG_HEART_EMPTY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  const SVG_COMMENT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  const SVG_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
  const SVG_SEND  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;

  /* Van Gogh heart colours */
  const HEART_COLORS = ["#c8911a","#d4a030","#e8b840","#6b96b8","#7b5ea8","#7a9870","#bec9d8"];

  function randomHeart() { return HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)]; }

  /* ── 1. INJECT INTERACTION BAR on each work-card ───────────────────────── */
  function injectBars() {
    $$(".work-card[data-id]").forEach(card => {
      const id    = card.dataset.id;
      const liked = store.get(`like_${id}`, false);
      const count = store.get(`likes_${id}`, Math.floor(Math.random() * 80 + 10)); // seed realistic count
      store.set(`likes_${id}`, count); // persist the seed

      const bar = document.createElement("div");
      bar.className = "photo-bar";
      bar.innerHTML = `
        <button class="photo-btn like-btn ${liked ? "is-liked" : ""}" data-id="${id}" aria-label="${liked ? "Unlike" : "Like"} photo" title="Like (or double-tap image)">
          <span class="like-icon">${liked ? SVG_HEART_FULL : SVG_HEART_EMPTY}</span>
          <span class="like-count">${count}</span>
        </button>
        <button class="photo-btn comment-btn" data-id="${id}" aria-label="Comment on photo" title="Comment">
          ${SVG_COMMENT}
          <span class="comment-count">${store.get(`comments_${id}`,[]).length || ""}</span>
        </button>
      `;
      card.appendChild(bar);
    });
  }

  /* ── 2. HEART BURST ANIMATION ───────────────────────────────────────────── */
  function burstHearts(x, y, container) {
    /* large centre heart */
    const big = document.createElement("div");
    big.className = "heart-burst-big";
    big.innerHTML = SVG_HEART_FULL;
    big.style.cssText = `left:${x}px;top:${y}px;color:${randomHeart()};`;
    container.appendChild(big);
    setTimeout(() => big.remove(), 900);

    /* scatter mini hearts */
    const count = 7;
    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2 - Math.PI / 2;
      const radius = 45 + Math.random() * 30;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius;
      const mini = document.createElement("div");
      mini.className = "heart-burst-mini";
      mini.innerHTML = SVG_HEART_FULL;
      mini.style.cssText = `
        left:${x}px; top:${y}px;
        color:${randomHeart()};
        --tx:${tx}px; --ty:${ty}px;
        animation-delay:${i * 30}ms;
      `;
      container.appendChild(mini);
      setTimeout(() => mini.remove(), 900 + i * 30);
    }

    /* +1 float */
    const plus = document.createElement("div");
    plus.className = "heart-plus-one";
    plus.textContent = "+1";
    plus.style.cssText = `left:${x + 18}px; top:${y - 10}px;`;
    container.appendChild(plus);
    setTimeout(() => plus.remove(), 800);
  }

  /* ── 3. LIKE LOGIC ──────────────────────────────────────────────────────── */
  function toggleLike(id, fromDoubleTap = false) {
    const card    = document.querySelector(`.work-card[data-id="${id}"]`);
    const btn     = card ? card.querySelector(".like-btn") : null;
    if (!card || !btn) return;

    let liked = store.get(`like_${id}`, false);
    let count = store.get(`likes_${id}`, 0);

    if (fromDoubleTap && liked) return; // already liked — no double action from double-tap

    liked = !liked;
    count = liked ? count + 1 : Math.max(0, count - 1);
    store.set(`like_${id}`, liked);
    store.set(`likes_${id}`, count);

    btn.classList.toggle("is-liked", liked);
    btn.setAttribute("aria-label", liked ? "Unlike photo" : "Like photo");
    btn.querySelector(".like-icon").innerHTML = liked ? SVG_HEART_FULL : SVG_HEART_EMPTY;
    btn.querySelector(".like-count").textContent = count;

    if (liked) {
      btn.classList.add("like-pop");
      setTimeout(() => btn.classList.remove("like-pop"), 400);
    }
  }

  /* ── 4. DOUBLE-TAP DETECTION ────────────────────────────────────────────── */
  function setupDoubleTap() {
    const taps  = new Map(); // id → { time, x, y }

    $$(".work-card[data-id]").forEach(card => {
      const id    = card.dataset.id;
      const media = card.querySelector(".work-media");
      if (!media) return;

      function handleTap(x, y) {
        const rect  = media.getBoundingClientRect();
        const lx    = x - rect.left;
        const ly    = y - rect.top;
        const now   = Date.now();
        const prev  = taps.get(id);

        if (prev && (now - prev.time) < 350) {
          /* ── DOUBLE TAP ── */
          taps.delete(id);
          toggleLike(id, true);

          // Position burst inside media element
          const mx = lx;
          const my = ly;
          media.style.position = "relative"; // ensure stacking
          burstHearts(mx, my, media);
        } else {
          taps.set(id, { time: now, x: lx, y: ly });
          setTimeout(() => { if (taps.get(id)?.time === now) taps.delete(id); }, 400);
        }
      }

      /* Touch support */
      media.addEventListener("touchend", e => {
        if (e.touches.length > 0) return; // ignore multi-touch
        const t = e.changedTouches[0];
        e.preventDefault(); // prevent ghost click
        handleTap(t.clientX, t.clientY);
      }, { passive: false });

      /* Mouse support */
      media.addEventListener("click", e => {
        // Skip if it was a link/button click
        if (e.target.closest("a, button")) return;
        handleTap(e.clientX, e.clientY);
      });
    });

    /* Like button single click */
    document.addEventListener("click", e => {
      const btn = e.target.closest(".like-btn");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      toggleLike(btn.dataset.id);
    });
  }

  /* ── 5. COMMENT PANEL ───────────────────────────────────────────────────── */
  function createCommentPanel() {
    const panel = document.createElement("div");
    panel.id = "comment-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Comments");
    panel.innerHTML = `
      <div class="cpanel-backdrop"></div>
      <div class="cpanel-sheet">
        <div class="cpanel-header">
          <div class="cpanel-photo-info">
            <span class="cpanel-title" id="cpanel-title"></span>
            <span class="cpanel-loc" id="cpanel-loc"></span>
          </div>
          <button class="cpanel-close" aria-label="Close comments">${SVG_CLOSE}</button>
        </div>
        <div class="cpanel-body">
          <ul class="cpanel-list" id="cpanel-list" aria-live="polite"></ul>
          <p class="cpanel-empty" id="cpanel-empty">No comments yet — be the first! ✨</p>
        </div>
        <div class="cpanel-footer">
          <div class="cpanel-avatar" aria-hidden="true">You</div>
          <div class="cpanel-input-wrap">
            <textarea class="cpanel-input" id="cpanel-input" placeholder="Leave a thoughtful comment…" rows="1" maxlength="280" aria-label="Write a comment"></textarea>
          </div>
          <button class="cpanel-send" id="cpanel-send" aria-label="Post comment">${SVG_SEND}</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    return panel;
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  const GUEST_NAMES = ["AlpineWanderer","StarlightLens","GoldenHourFan","IrisCollector","CoastalDreamer","QuietObserver","DustAndGold","SkyChaser"];
  function guestName() { return GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)]; }
  function guestInitials(name) { return name.slice(0, 2).toUpperCase(); }

  function setupComments() {
    const panel     = createCommentPanel();
    const backdrop  = panel.querySelector(".cpanel-backdrop");
    const closeBtn  = panel.querySelector(".cpanel-close");
    const list      = panel.querySelector("#cpanel-list");
    const empty     = panel.querySelector("#cpanel-empty");
    const input     = panel.querySelector("#cpanel-input");
    const sendBtn   = panel.querySelector("#cpanel-send");
    const titleEl   = panel.querySelector("#cpanel-title");
    const locEl     = panel.querySelector("#cpanel-loc");

    let activeId = null;

    function renderComments(id) {
      const comments = store.get(`comments_${id}`, []);
      list.innerHTML = "";
      if (comments.length === 0) {
        empty.hidden = false;
        return;
      }
      empty.hidden = true;
      comments.forEach(c => {
        const li = document.createElement("li");
        li.className = "cpanel-comment";
        li.innerHTML = `
          <div class="cpanel-avatar sm" style="--av-color:${c.color}">${guestInitials(c.name)}</div>
          <div class="cpanel-comment-body">
            <div class="cpanel-comment-meta">
              <strong>${c.name}</strong>
              <span>${timeAgo(c.ts)}</span>
            </div>
            <p>${c.text}</p>
          </div>
        `;
        list.appendChild(li);
      });
      list.scrollTop = list.scrollHeight;
    }

    function openPanel(id) {
      activeId = id;
      const card  = document.querySelector(`.work-card[data-id="${id}"]`);
      titleEl.textContent = card?.querySelector(".work-title")?.textContent || "";
      locEl.textContent   = card?.querySelector(".work-location")?.textContent || "";
      renderComments(id);
      panel.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(() => input.focus(), 300);
    }

    function closePanel() {
      panel.classList.remove("is-open");
      document.body.style.overflow = "";
      activeId = null;
      input.value = "";
    }

    function postComment() {
      const text = input.value.trim();
      if (!text || !activeId) return;

      const comments = store.get(`comments_${activeId}`, []);
      const avColors = ["#c8911a","#6b96b8","#7b5ea8","#7a9870","#3a6080","#d4a030"];
      const color    = avColors[comments.length % avColors.length];
      const name     = store.get("my_name", guestName());
      store.set("my_name", name);

      comments.push({ text, name, ts: Date.now(), color });
      store.set(`comments_${activeId}`, comments);
      input.value = "";
      input.style.height = "auto";
      renderComments(activeId);

      /* Update badge */
      const badge = document.querySelector(`.work-card[data-id="${activeId}"] .comment-count`);
      if (badge) badge.textContent = comments.length;

      /* Send animation */
      sendBtn.classList.add("send-pop");
      setTimeout(() => sendBtn.classList.remove("send-pop"), 300);
    }

    /* Comment button opens panel */
    document.addEventListener("click", e => {
      const btn = e.target.closest(".comment-btn");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      openPanel(btn.dataset.id);
    });

    backdrop.addEventListener("click", closePanel);
    closeBtn.addEventListener("click", closePanel);

    /* Send on button or Ctrl+Enter */
    sendBtn.addEventListener("click", postComment);
    input.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") postComment();
    });

    /* Auto-resize textarea */
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
    });

    /* Keyboard close */
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && panel.classList.contains("is-open")) closePanel();
    });
  }

  /* ── BOOT ───────────────────────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", () => {
    injectBars();
    setupDoubleTap();
    setupComments();
  });

})();
