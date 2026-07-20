// ──────────────────────────────────────────────────────────────
//  fx.js — Ambiance & animations de la boutique L'EXIL.
//  100% visuel : aucun impact sur le checkout Stripe ni sur l'API.
//  Respecte prefers-reduced-motion (tout est désactivé si demandé).
// ──────────────────────────────────────────────────────────────
(() => {
  const CFG = window.CONFIG || {};
  const LIVE = CFG.live || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Signale au script du catalogue qu'il peut ajouter les classes d'animation.
  window.FX_ACTIVE = !reduceMotion;
  if (!reduceMotion) document.body.classList.add("fx-on");

  /* ══════════ 1. PARTICULES — cendres / poussière ══════════ */
  const canvas = document.getElementById("fxAsh");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, parts = [], raf = 0;
    const count = () => Math.max(24, Math.min(70, Math.round(window.innerWidth / 20)));

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const spawn = (anywhere) => ({
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 10,
      r: 0.6 + Math.random() * 1.7,
      vy: -(0.08 + Math.random() * 0.32),
      vx: (Math.random() - 0.5) * 0.14,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.002 + Math.random() * 0.006,
      alpha: 0.06 + Math.random() * 0.26,
      gold: Math.random() < 0.25,
    });
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.18;
        p.y += p.vy;
        if (p.y < -12 || p.x < -12 || p.x > W + 12) Object.assign(p, spawn(false));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(232,187,69,${p.alpha})`
          : `rgba(180,190,210,${p.alpha * 0.7})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    parts = Array.from({ length: count() }, () => spawn(true));
    window.addEventListener("resize", () => {
      resize();
      parts = Array.from({ length: count() }, () => spawn(true));
    });
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    });
    raf = requestAnimationFrame(tick);
  }

  /* ══════════ 2. TITRE — machine à écrire + glitch ══════════ */
  const line1 = document.querySelector(".hero h1 .line-1");
  const line2 = document.querySelector(".hero h1 .line-2");
  if (line1 && line2 && !reduceMotion) {
    const full = line1.textContent;
    line2.classList.add("fx-pending");
    line1.textContent = "";
    line1.classList.add("typing");
    let i = 0;
    const iv = setInterval(() => {
      line1.textContent = full.slice(0, ++i);
      if (i >= full.length) {
        clearInterval(iv);
        setTimeout(() => line1.classList.remove("typing"), 900);
        line2.classList.remove("fx-pending");
        line2.classList.add("glitch-in");
      }
    }, 62);
  }

  /* ══════════ 3. APPARITION AU SCROLL (cascade) ══════════ */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

    const observeReveals = () => {
      document.querySelectorAll(".reveal:not(.rv-seen)").forEach((el) => {
        el.classList.add("rv-seen");
        io.observe(el);
      });
    };

    // Éléments statiques à animer + décalage en cascade par groupe.
    document
      .querySelectorAll(".sec-head, .feature-card, .rank-chip, .rule-item, .connect-card, .ip-box, .trust-item")
      .forEach((el) => el.classList.add("reveal"));
    document
      .querySelectorAll(".features-grid, .ranks-row, .connect-grid, .rules-grid, .trust-bar .wrap")
      .forEach((group) => {
        [...group.children].forEach((el, i) => el.style.setProperty("--d", i * 90 + "ms"));
      });

    // Une fois l'animation finie, on la retire pour libérer transform (tilt 3D).
    document.addEventListener("animationend", (e) => {
      if (e.animationName === "revealUp") {
        e.target.classList.add("rv-done");
        e.target.classList.remove("in-view");
      }
    });

    observeReveals();
    document.addEventListener("grid:rendered", observeReveals);
  }

  /* ══════════ 4. TILT 3D sur les cartes produits ══════════ */
  const grid = document.getElementById("grid");
  if (grid && finePointer && !reduceMotion) {
    let raf = 0;
    grid.addEventListener("pointermove", (ev) => {
      const card = ev.target.closest(".card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.classList.add("tilting");
        card.style.transform =
          `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-4px)`;
      });
    });
    grid.addEventListener("pointerout", (ev) => {
      const card = ev.target.closest(".card");
      if (!card || (ev.relatedTarget && card.contains(ev.relatedTarget))) return;
      card.classList.remove("tilting");
      card.style.transform = "";
    });
  }

  /* ══════════ 5. RIPPLE au clic sur les boutons ══════════ */
  if (!reduceMotion) {
    document.addEventListener("pointerdown", (ev) => {
      const btn = ev.target.closest(".btn, .filter-btn, .ip-copy-btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const s = document.createElement("span");
      s.className = "fx-ripple";
      s.style.width = s.style.height = size + "px";
      s.style.left = ev.clientX - r.left - size / 2 + "px";
      s.style.top = ev.clientY - r.top - size / 2 + "px";
      btn.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
    });
  }

  /* ══════════ 6. WIDGETS VIVANTS ══════════ */

  // — Compteur de joueurs simulé (pill du hero + bandeau stats) —
  const maxP = LIVE.joueursMax ?? 60;
  let players = Math.min(maxP, LIVE.joueursBase ?? 43);
  const pillCount = document.getElementById("playersCount");
  const livePlayers = document.getElementById("livePlayers");
  const renderPlayers = () => {
    const txt = players + "/" + maxP;
    if (pillCount) pillCount.textContent = txt;
    if (livePlayers) {
      livePlayers.textContent = txt;
      livePlayers.classList.remove("tick-flash");
      void livePlayers.offsetWidth; // relance l'animation flash
      livePlayers.classList.add("tick-flash");
    }
  };
  renderPlayers();
  (function wander() {
    setTimeout(() => {
      const delta = [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)];
      const floor = Math.round(maxP * 0.4);
      players = Math.max(floor, Math.min(maxP, players + delta));
      renderPlayers();
      wander();
    }, 3500 + Math.random() * 4500);
  })();

  // — Compteur "survivants" qui monte progressivement —
  const membersEl = document.getElementById("liveMembers");
  if (membersEl) {
    const target = LIVE.survivants ?? 1200;
    const fmtInt = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n));
    if (reduceMotion || !("IntersectionObserver" in window)) {
      membersEl.textContent = fmtInt(target);
    } else {
      const obs = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        const t0 = performance.now(), dur = 1800;
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          membersEl.textContent = fmtInt(target * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.4 });
      obs.observe(membersEl);
    }
  }

  // — Horloge de Chernarus (UTC+3), temps réel —
  const clockEl = document.getElementById("chernarusClock");
  if (clockEl) {
    const tickClock = () => {
      clockEl.textContent = new Date(Date.now() + 3 * 3600e3).toISOString().slice(11, 19);
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  // — Ticker / bandeau défilant —
  const track = document.getElementById("tickerTrack");
  if (track) {
    const msgs = Array.isArray(LIVE.ticker) && LIVE.ticker.length
      ? LIVE.ticker
      : ["Bienvenue sur L'EXIL"];
    const seq = msgs.map((m) => `<span class="ticker-item">${m}</span>`).join("");
    // Deux copies pour une boucle sans couture ; la 2e est masquée aux lecteurs d'écran.
    track.innerHTML =
      `<span class="ticker-seq">${seq}</span><span class="ticker-seq" aria-hidden="true">${seq}</span>`;
    if (!reduceMotion) {
      requestAnimationFrame(() => {
        const dur = Math.max(18, Math.round(track.scrollWidth / 2 / 55));
        track.style.setProperty("--ticker-dur", dur + "s");
        track.classList.add("scrolling");
      });
    }
  }

  /* ══════════ 7. CURSEUR VISEUR (desktop, optionnel) ══════════ */
  const cursor = document.getElementById("fxCursor");
  if (cursor && finePointer && !reduceMotion && LIVE.customCursor !== false) {
    document.body.classList.add("fx-cursor-on");
    let x = 0, y = 0, tx = 0, ty = 0, shown = false;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) { x = tx; y = ty; shown = true; cursor.classList.add("visible"); }
    });
    document.documentElement.addEventListener("pointerleave", () => {
      shown = false;
      cursor.classList.remove("visible");
    });
    document.addEventListener("pointerover", (e) => {
      cursor.classList.toggle("on-target", !!e.target.closest("a, button"));
    });
    document.addEventListener("pointerdown", () => cursor.classList.add("firing"));
    document.addEventListener("pointerup", () => cursor.classList.remove("firing"));
    (function follow() {
      x += (tx - x) * 0.3;
      y += (ty - y) * 0.3;
      cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
      requestAnimationFrame(follow);
    })();
  }
})();
