// ──────────────────────────────────────────────────────────────
//  kf-chooser.js — Sélecteur de style Killfeed réutilisable.
//  Monte 3 listes déroulantes (couleur / slot / motion) + aperçu en direct
//  dans un conteneur donné. Enregistre via /api/customize/killfeed si le
//  joueur possède la couleur killfeed, sinon mode aperçu.
//    window.LEXIL_KF.mount(rootElement)
//  Styles : classes .kf-* dans style.css. Données : window.CONFIG.killfeed.
// ──────────────────────────────────────────────────────────────
(() => {
  const CFG = window.CONFIG || {};
  const KF = CFG.killfeed || {};
  const B = (CFG.backendUrl || "").trim();
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const get = (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } };
  const byKey = (arr, k) => (arr || []).find((o) => o.key === k) || null;

  // Toast global partagé (créé une seule fois).
  function toast(txt, ok) {
    let m = document.getElementById("kfMsg");
    if (!m) { m = document.createElement("div"); m.id = "kfMsg"; m.className = "kf-msg"; document.body.appendChild(m); }
    m.textContent = txt; m.className = "kf-msg show " + (ok ? "ok" : "ko");
    clearTimeout(toast._t); toast._t = setTimeout(() => (m.className = "kf-msg"), 3000);
  }

  function thumb(o, field) {
    if (o.media) {
      return /\.(mp4|webm)$/i.test(o.media)
        ? `<span class="kf-thumb"><video src="${esc(o.media)}" autoplay muted loop playsinline></video></span>`
        : `<span class="kf-thumb"><img src="${esc(o.media)}" alt="" loading="lazy"/></span>`;
    }
    return field === "color"
      ? `<span class="kf-thumb"><span class="sw" style="background:${o.preview};opacity:.2"></span><span class="demo" style="--sw:${o.preview}">Ab</span></span>`
      : `<span class="kf-thumb"><span class="sw" style="background:${o.preview}"></span></span>`;
  }

  function mount(root) {
    if (!root || !KF.colors) return;

    // Capture SteamID / jeton depuis l'URL (retour Steam) ou le stockage.
    const qs = new URLSearchParams(location.search);
    const urlTok = qs.get("t");
    if (/^[a-f0-9]{64}$/.test(urlTok || "")) { try { localStorage.setItem("lexil_token", urlTok); } catch {} }
    const steamId = qs.get("steamId") || get("lexil_steamid");
    const authToken = () => get("lexil_token");
    const hasToken = () => /^[a-f0-9]{64}$/.test(authToken());
    // Reconnexion Steam qui revient sur la page courante (le backend lit ?return=).
    const steamLogin = B + "/auth/steam?return=" + encodeURIComponent(location.pathname + location.search);

    const OPTS = { color: KF.colors, slot: KF.slots, motion: KF.motions };
    const sel = { color: "", slot: "off", motion: "flat" };
    let data = { steamId: "", steam: null, account: {}, killfeed: {} };
    let canSave = false;
    let needReconnect = false;   // possède la couleur mais jeton manquant

    const ownsKillfeed = () => {
      const A = (data && data.account) || {};
      const keys = new Set();
      (A.orders || []).forEach((o) => (o.items || []).forEach((it) => it.key && keys.add(it.key)));
      const activeSubs = new Set((A.subscriptions || []).filter((s) => s.active).map((s) => s.key));
      return keys.has("col-kf:life") || activeSubs.has("col-kf:30j");
    };

    const $q = (s) => root.querySelector(s);

    function updatePreview() {
      const line = $q(".kf-line"), name = $q(".kf-name");
      if (!line) return;
      const col = byKey(KF.colors, sel.color);
      name.style.setProperty("--kf-grad", col ? col.preview : "linear-gradient(90deg,#f2efe9,#f2efe9)");
      line.className = "kf-line" + (sel.slot && sel.slot !== "off" ? " kf-slot-" + sel.slot : "") + (sel.motion ? " kf-motion-" + sel.motion : "");
    }

    async function save(field, key) {
      const prev = sel[field];
      if (prev === key) return;
      sel[field] = key; syncField(field); updatePreview();
      if (!canSave) {
        toast(needReconnect ? "Reconnecte-toi via Steam pour enregistrer (bouton en haut)." : "Aperçu — débloque la couleur killfeed pour enregistrer.", false);
        return;
      }
      try {
        const r = await fetch(B + "/api/customize/killfeed", {
          method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ steamId: data.steamId, token: authToken(), [field]: key }),
        });
        const d = await r.json();
        if (d.ok) { data.killfeed = d.killfeed || data.killfeed; toast("Style enregistré ✓", true); return; }
        sel[field] = prev; syncField(field); updatePreview();
        if (r.status === 401) { canSave = false; needReconnect = true; showReconnectBanner(); toast("Reconnecte-toi via Steam pour enregistrer (bouton en haut).", false); }
        else toast(d.error || "Enregistrement impossible.", false);
      } catch { sel[field] = prev; syncField(field); updatePreview(); toast("Serveur injoignable — réessaie.", false); }
    }

    // Insère la bannière de reconnexion en haut du sélecteur si absente.
    function showReconnectBanner() {
      if (root.querySelector(".kf-banner")) return;
      root.insertAdjacentHTML("afterbegin", bannerReconnect);
    }

    function syncField(field) {
      const wrap = root.querySelector(`.kf-select[data-field="${field}"]`);
      if (!wrap) return;
      const o = byKey(OPTS[field], sel[field]) || OPTS[field][0];
      wrap.querySelector(".kf-select-cur").innerHTML = `<div class="t">${esc(o.label)}</div><div class="d">${esc(o.desc)}</div>`;
      const btnThumb = wrap.querySelector(".kf-btn-thumb");
      if (btnThumb) btnThumb.outerHTML = thumb(o, field).replace('class="kf-thumb"', 'class="kf-thumb kf-btn-thumb"');
      wrap.querySelectorAll(".kf-opt").forEach((op) => op.classList.toggle("on", op.dataset.key === sel[field]));
    }

    function dropdown(title, field) {
      const opts = OPTS[field];
      const cur = byKey(opts, sel[field]) || opts[0];
      return `
        <div class="kf-select" data-field="${field}">
          <label>${title} <span style="color:var(--muted-4);font-size:11px">· ${opts.length} options</span></label>
          <div class="kf-select-wrap">
            <button class="kf-select-btn" type="button" aria-expanded="false">
              ${thumb(cur, field).replace('class="kf-thumb"', 'class="kf-thumb kf-btn-thumb"')}
              <span class="kf-select-cur"><div class="t">${esc(cur.label)}</div><div class="d">${esc(cur.desc)}</div></span>
              <span class="kf-chev">▾</span>
            </button>
            <div class="kf-panel" hidden>
              ${opts.map((o) => `
                <button class="kf-opt ${o.key === sel[field] ? "on" : ""}" type="button" data-key="${o.key}">
                  ${thumb(o, field)}
                  <span class="info"><div class="t">${esc(o.label)}</div><div class="d">${esc(o.desc)}</div></span>
                  <span class="kf-opt-check">✓</span>
                </button>`).join("")}
            </div>
          </div>
        </div>`;
    }

    function closeAll(except) {
      root.querySelectorAll(".kf-select-btn").forEach((b) => {
        if (b === except) return;
        b.setAttribute("aria-expanded", "false");
        b.parentElement.querySelector(".kf-panel").hidden = true;
      });
    }

    function renderChooser(banner) {
      root.innerHTML = `
        ${banner || ""}
        <div class="kf-preview">
          <div class="kf-preview-label">Aperçu en direct</div>
          <div class="kf-feed">
            <div class="kf-line">
              <span class="kf-name">${esc((data.steam && data.steam.name) || "Ton pseudo")}</span>
              <span class="kf-skull">☠</span>
              <span class="kf-victim">Victime_42</span>
            </div>
          </div>
        </div>
        ${dropdown("Couleur du nom", "color")}
        ${dropdown("Slot style", "slot")}
        ${dropdown("Name motion", "motion")}`;

      root.querySelectorAll(".kf-select").forEach((wrap) => {
        const field = wrap.dataset.field;
        const btn = wrap.querySelector(".kf-select-btn");
        const panel = wrap.querySelector(".kf-panel");
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const open = btn.getAttribute("aria-expanded") === "true";
          closeAll(open ? null : btn);
          btn.setAttribute("aria-expanded", String(!open));
          panel.hidden = open;
        });
        panel.querySelectorAll(".kf-opt").forEach((op) =>
          op.addEventListener("click", (e) => {
            e.stopPropagation();
            save(field, op.dataset.key);
            btn.setAttribute("aria-expanded", "false"); panel.hidden = true;
          })
        );
      });
      updatePreview();
    }

    document.addEventListener("click", () => closeAll(null));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(null); });

    const bannerGuest = `<div class="kf-banner"><p>👀 <b>Mode aperçu</b> — connecte-toi avec Steam et débloque la couleur killfeed pour enregistrer ton style.</p><a class="btn btn-gold" href="${steamLogin}">Connexion Steam</a></div>`;
    const bannerLocked = `<div class="kf-banner"><p>👀 <b>Mode aperçu</b> — tu ne possèdes pas encore la couleur killfeed. Débloque-la pour enregistrer ton style en jeu.</p><a class="btn btn-gold" href="/produit.html?id=col-kf">Débloquer</a></div>`;
    const bannerReconnect = `<div class="kf-banner"><p>🔑 <b>Reconnexion requise</b> — tu possèdes bien la couleur killfeed, mais ta session doit être réactivée pour enregistrer. Reconnecte-toi via Steam (une seule fois).</p><a class="btn btn-gold" href="${steamLogin}">Reconnexion Steam</a></div>`;

    if (!B || !steamId || !/^7656\d{13}$/.test(steamId)) {
      canSave = false;
      renderChooser(B ? bannerGuest : "");
      return;
    }
    fetch(B + "/api/account?steamId=" + encodeURIComponent(steamId))
      .then((r) => r.json())
      .then((d) => {
        data = d || {}; data.steamId = data.steamId || steamId;
        const kf = data.killfeed || {};
        if (kf.color) sel.color = kf.color;
        if (kf.slot) sel.slot = kf.slot;
        if (kf.motion) sel.motion = kf.motion;
        const owns = ownsKillfeed();
        // Possède + jeton valide → enregistrement actif. Possède sans jeton →
        // reconnexion Steam requise. Ne possède pas → invitation à acheter.
        canSave = owns && hasToken();
        needReconnect = owns && !hasToken();
        renderChooser(!owns ? bannerLocked : (canSave ? "" : bannerReconnect));
      })
      .catch(() => { renderChooser(bannerLocked); });
  }

  window.LEXIL_KF = { mount };
})();
