// ──────────────────────────────────────────────────────────────
//  shop.js — Catalogue, panier, comptes Steam & commandes.
//  Mêmes flux que l'ancien site lexil.net :
//   · login Steam / comptes  → backendUrl (lexil-auth sur Railway)
//   · commande               → POST backendUrl/api/order → checkoutUrl (bot EXIL → Stripe)
//   · retour paiement        → ?paye=ok | ?paye=annule
//   · stockage local         → lexil_cart / lexil_steamid / lexil_user
// ──────────────────────────────────────────────────────────────
(() => {
  const CFG = window.CONFIG;
  const B = (CFG.backendUrl || "").trim();
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => n.toFixed(2).replace(".", ",").replace(",00", "") + "€";
  const store = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v === null ? fb : v; } catch { return fb; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  const safe = (label, fn) => { try { fn(); } catch (e) { console.warn("[shop] " + label + ":", e); } };

  // ── État ──
  // Le panier de l'ancien site (mêmes clés localStorage) est repris tel quel,
  // mais on filtre toute entrée invalide pour ne jamais planter l'affichage.
  let cart = {};
  try {
    const raw = JSON.parse(store.get("lexil_cart", "null")) || {};
    for (const k of Object.keys(raw)) {
      const e = raw[k];
      if (e && typeof e.prix === "number" && isFinite(e.prix) && e.qty > 0) {
        cart[k] = { nom: String(e.nom || k), sub: String(e.sub || ""), prix: e.prix, qty: Math.round(e.qty) };
      }
    }
  } catch { cart = {}; }
  let steamId = store.get("lexil_steamid", "");
  let user = null;
  try { user = JSON.parse(store.get("lexil_user", "null")); } catch {}
  let account = null;
  let isFounder = false;
  let selectedVariant = {}; // { productId: "30j" | "life" }
  let activeCategory = "tous";

  /* ══════════ CATALOGUE ══════════ */
  // Icônes officielles L'EXIL (badges hexagonaux, /img/icons/<fichier>.png).
  // Pour les couleurs, l'icône suit la durée choisie (30 jours / Lifetime).
  const iconFileFor = (p) => (p.variantes ? p.id + "-" + (selectedVariant[p.id] || CFG.durees[0].key) : p.id);
  const iconBadge = (p) =>
    `<img class="card-icon" src="/img/icons/${iconFileFor(p)}.png" alt="" loading="lazy" decoding="async" />`;

  const tierOf = (prix) => (prix >= 50 ? "legendary" : prix >= 30 ? "rare" : "common");
  const priceOf = (p) => (p.variantes ? CFG.durees.find((d) => d.key === (selectedVariant[p.id] || CFG.durees[0].key)).prix : p.prix);

  // Pictogrammes du bandeau de catégories de la planche officielle.
  const CAT_ICON = {
    confort: "cat-confort", cosmetique: "cat-cosmetique", armes: "cat-armes",
    vehicules: "cat-vehicules", couleurs: "cat-killfeed", discord: "cat-discord",
  };

  function renderFilters() {
    const cats = ["tous", ...new Set(CFG.catalogue.map((p) => p.cat))];
    $("filters").innerHTML = cats
      .map((c) => {
        const label = c === "tous" ? "Tous" : CFG.catLabels[c] || c;
        const count = c === "tous" ? CFG.catalogue.length : CFG.catalogue.filter((p) => p.cat === c).length;
        const ico = CAT_ICON[c] ? `<img class="filter-ico" src="/img/icons/${CAT_ICON[c]}.png" alt="" loading="lazy" />` : "";
        return `<button class="filter-btn ${c === activeCategory ? "active" : ""}" data-cat="${c}">${ico}${label}<span>${count}</span></button>`;
      })
      .join("");
    $("filters").querySelectorAll(".filter-btn").forEach((btn) =>
      btn.addEventListener("click", () => { activeCategory = btn.dataset.cat; renderFilters(); renderGrid(); })
    );
  }

  function renderGrid() {
    const list = activeCategory === "tous" ? CFG.catalogue : CFG.catalogue.filter((p) => p.cat === activeCategory);
    $("grid").innerHTML = list
      .map((p, idx) => {
        const prix = priceOf(p);
        const dureeChip = p.variantes
          ? (selectedVariant[p.id] || "30j") === "30j" ? "30 jours" : "À vie"
          : p.duree;
        const variantsHtml = p.variantes
          ? `<div class="variant-row">${CFG.durees.map((d) => `
              <button class="variant-btn ${(selectedVariant[p.id] || CFG.durees[0].key) === d.key ? "active" : ""}"
                data-id="${p.id}" data-variant="${d.key}">${d.label} · ${fmt(d.prix)}</button>`).join("")}</div>`
          : "";
        return `
        <article class="card tier-${tierOf(prix)}${window.FX_ACTIVE ? " reveal" : ""}" data-pid="${p.id}" style="--d:${(idx % 8) * 70}ms">
          <div class="card-media">
            ${p.badge ? `<span class="card-badge ${p.badge === "Populaire" ? "badge-gold" : "badge-green"}">${p.badge}</span>` : ""}
            <span class="card-cat">${CFG.catLabels[p.cat] || p.cat}</span>
            ${iconBadge(p)}
            <span class="card-duree">${dureeChip}</span>
          </div>
          <div class="card-body">
            <h3>${esc(p.nom)}</h3>
            <p class="desc">${esc(p.court)}</p>
            ${variantsHtml}
            <div class="card-row">
              <div class="price-col"><span class="price-prefix">Prix</span><span class="price">${fmt(prix)}</span></div>
              <button class="btn btn-gold" data-add="${p.id}">Ajouter</button>
            </div>
          </div>
        </article>`;
      })
      .join("");

    $("grid").querySelectorAll("[data-variant]").forEach((btn) =>
      btn.addEventListener("click", (e) => { e.stopPropagation(); selectedVariant[btn.dataset.id] = btn.dataset.variant; renderGrid(); })
    );
    $("grid").querySelectorAll("[data-add]").forEach((btn) =>
      btn.addEventListener("click", (e) => { e.stopPropagation(); addToCart(CFG.catalogue.find((p) => p.id === btn.dataset.add)); })
    );
    // Cliquer la carte (hors boutons) ouvre la fiche produit.
    $("grid").querySelectorAll(".card").forEach((card) =>
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        openProduct(card.dataset.pid);
      })
    );
    document.dispatchEvent(new Event("grid:rendered"));
  }

  /* ══════════ FICHE PRODUIT ══════════ */
  let prodOpenId = null;

  function renderProduct() {
    const p = CFG.catalogue.find((x) => x.id === prodOpenId);
    if (!p) return;
    const prix = priceOf(p);
    const duree = p.variantes
      ? (selectedVariant[p.id] || CFG.durees[0].key) === "30j" ? "30 jours" : "À vie"
      : p.duree;

    $("prodMedia").innerHTML = iconBadge(p);
    $("prodTags").innerHTML =
      `<span class="prod-tag cat">${esc(CFG.catLabels[p.cat] || p.cat)}</span>` +
      `<span class="prod-tag duree">${esc(duree)}</span>` +
      (p.badge ? `<span class="prod-tag badge">${esc(p.badge)}</span>` : "");
    $("prodName").textContent = p.nom;
    $("prodLong").textContent = p.long || p.court || "";
    $("prodFeatures").innerHTML = (p.features || []).map((f) => `<li>${esc(f)}</li>`).join("");
    $("prodVariants").innerHTML = p.variantes
      ? `<div class="prod-variants-label">Durée</div><div class="variant-row">${CFG.durees.map((d) => `
          <button class="variant-btn ${(selectedVariant[p.id] || CFG.durees[0].key) === d.key ? "active" : ""}"
            data-pvariant="${d.key}">${d.label} · ${fmt(d.prix)}</button>`).join("")}</div>`
      : "";
    $("prodPrice").textContent = fmt(prix);
    $("prodVariants").querySelectorAll("[data-pvariant]").forEach((b) =>
      b.addEventListener("click", () => { selectedVariant[p.id] = b.dataset.pvariant; renderProduct(); renderGrid(); })
    );
  }

  function openProduct(id) {
    prodOpenId = id;
    renderProduct();
    $("prodModal").classList.add("open");
  }
  function closeProduct() { $("prodModal").classList.remove("open"); prodOpenId = null; }

  /* ══════════ PANIER (localStorage lexil_cart, format identique à l'ancien site) ══════════ */
  function saveCart() { store.set("lexil_cart", JSON.stringify(cart)); renderCart(); }

  function addToCart(p) {
    let prix = p.prix, sub = CFG.catLabels[p.cat], lineKey = p.id;
    if (p.variantes) {
      const vk = selectedVariant[p.id] || CFG.durees[0].key;
      const v = CFG.durees.find((x) => x.key === vk);
      prix = v.prix; sub = "Couleur — " + v.label; lineKey = p.id + ":" + vk;
    }
    cart[lineKey] = { nom: p.nom, sub, prix, qty: (cart[lineKey] ? cart[lineKey].qty : 0) + 1 };
    saveCart();
    openCart(true);
  }

  const cartTotal = () => Object.keys(cart).reduce((a, k) => a + cart[k].prix * cart[k].qty, 0);
  const cartCount = () => Object.keys(cart).reduce((a, k) => a + cart[k].qty, 0);

  function renderCart() {
    $("cartCount").textContent = cartCount();
    $("cartTotal").textContent = fmt(cartTotal());
    const keys = Object.keys(cart);
    $("cartItems").innerHTML = keys.length
      ? keys.map((k) => `
        <div class="cart-line">
          <div class="cart-line-info">
            <div class="cart-line-name">${esc(cart[k].nom)}</div>
            <div class="cart-line-sub">${esc(cart[k].sub || "")} · ${fmt(cart[k].prix)}</div>
          </div>
          <div class="cart-qty">
            <button data-qty="${k}" data-d="-1">−</button>
            <span>${cart[k].qty}</span>
            <button data-qty="${k}" data-d="1">+</button>
          </div>
        </div>`).join("")
      : `<p class="cart-empty">Ton panier est vide. Ajoute un cosmétique depuis la boutique !</p>`;
    $("cartItems").querySelectorAll("[data-qty]").forEach((b) =>
      b.addEventListener("click", () => {
        const k = b.dataset.qty, d = +b.dataset.d;
        if (!cart[k]) return;
        cart[k].qty += d;
        if (cart[k].qty <= 0) delete cart[k];
        saveCart();
      })
    );
  }

  function openCart(open) {
    $("cartDrawer").classList.toggle("open", open);
    $("cartOverlay").classList.toggle("open", open);
    if (open && steamId && !$("steamIdInput").value) $("steamIdInput").value = steamId;
  }

  // ── Passer commande → POST /api/order → checkoutUrl (bot EXIL → Stripe) ──
  async function checkout() {
    const id = $("steamIdInput").value.trim();
    const msg = $("cartMsg");
    if (!Object.keys(cart).length) { msg.textContent = "Ton panier est vide."; return; }
    if (!/^7656\d{13}$/.test(id)) { msg.textContent = "SteamID64 invalide — 17 chiffres commençant par 7656."; return; }
    store.set("lexil_steamid", id);
    const items = Object.keys(cart).map((k) => ({
      id: k,
      label: cart[k].nom + (cart[k].sub ? " · " + cart[k].sub : "") + " ×" + cart[k].qty,
      total: fmt(cart[k].prix * cart[k].qty),
      prix: cart[k].prix,
      qty: cart[k].qty,
    }));
    const btn = $("checkoutBtn");
    btn.disabled = true; btn.textContent = "Redirection…"; msg.textContent = "";
    try {
      const data = await fetch(B + "/api/order", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total: fmt(cartTotal()), steamId: id }),
      }).then((r) => r.json());
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl; return; }
      msg.textContent = data.error || "Commande impossible pour le moment — réessaie ou passe par le Discord.";
    } catch {
      msg.textContent = "Backend injoignable — réessaie dans un instant.";
    }
    btn.disabled = false; btn.textContent = "Passer commande";
  }

  /* ══════════ AUTH STEAM & COMPTE (lexil-auth) ══════════ */
  function renderAuth() {
    const area = $("authArea");
    if (!user) {
      area.innerHTML = `<a class="btn btn-steam" href="${B}/auth/steam">Connexion Steam</a>`;
      return;
    }
    const discordLinked = !!user.discordName;
    area.innerHTML = `
      <button class="user-chip" id="userChip">
        ${user.avatar ? `<img src="${esc(user.avatar)}" alt=""/>` : ""}
        <span>${esc(user.name || user.steamId)}</span>
        <span class="chev">▾</span>
      </button>
      <div class="user-menu" id="userMenu">
        <div class="user-menu-head">Comptes liés</div>
        <div class="user-menu-linked"><span>${esc(user.steamName || user.name || "Steam")}</span><b class="ok">✓ Lié</b></div>
        ${discordLinked
          ? `<div class="user-menu-linked"><span>${esc(user.discordName)}</span><b class="ok">✓ Lié</b></div>`
          : `<a class="user-menu-item" href="${B}/auth/discord?steamId=${encodeURIComponent(user.steamId)}">Lier Discord</a>`}
        <div class="user-menu-sep"></div>
        <a class="user-menu-item" href="compte.html#profil">Mon profil</a>
        <a class="user-menu-item" href="compte.html#achats">Mes achats</a>
        <a class="user-menu-item" href="compte.html#perso">Personnalisation</a>
        <a class="user-menu-item" href="compte.html#abonnements">Abonnements</a>
        <a class="user-menu-item" href="compte.html#fileprio">File prioritaire</a>
        <a class="user-menu-item" href="https://steamcommunity.com/profiles/${encodeURIComponent(user.steamId)}" target="_blank">Profil Steam</a>
        ${isFounder ? `<div class="user-menu-sep"></div><a class="user-menu-item gold" href="admin.html">Dashboard admin</a>` : ""}
        <div class="user-menu-sep"></div>
        <button class="user-menu-item danger" id="signOutBtn">Se déconnecter</button>
      </div>`;
    $("userChip").addEventListener("click", (e) => { e.stopPropagation(); $("userMenu").classList.toggle("open"); });
    $("signOutBtn").addEventListener("click", signOut);
  }
  document.addEventListener("click", (e) => {
    const menu = $("userMenu");
    if (menu && !e.target.closest("#authArea")) menu.classList.remove("open");
  });

  function signOut() {
    const done = () => {
      user = null; steamId = ""; account = null; isFounder = false;
      store.del("lexil_user"); store.del("lexil_steamid");
      renderAuth();
    };
    if (B) fetch(B + "/api/logout", { method: "POST", credentials: "include" }).catch(() => {}).finally(done);
    else done();
  }

  async function loadAccount(sid) {
    if (!sid || !B) return;
    try {
      const d = await fetch(B + "/api/account?steamId=" + encodeURIComponent(sid)).then((r) => r.json());
      if (!d) return;
      account = d;
      user = {
        steamId: sid,
        name: (d.steam && d.steam.name) || sid,
        steamName: (d.steam && d.steam.name) || "",
        avatar: (d.steam && d.steam.avatar) || "",
        discordName: (d.discord && d.discord.discordName) || "",
      };
      store.set("lexil_user", JSON.stringify(user));
      renderAuth();
    } catch {}
    try {
      const f = await fetch(B + "/api/is-founder?steamId=" + encodeURIComponent(sid)).then((r) => r.json());
      if (f && f.founder) { isFounder = true; renderAuth(); }
    } catch {}
  }

  /* ══════════ RETOUR PAIEMENT (?paye=ok|annule) + LOGIN (?steamId / ?login=success) ══════════ */
  function handleReturns() {
    const params = new URLSearchParams(location.search);
    const paye = params.get("paye");
    if (paye === "ok") {
      cart = {}; saveCart();
      showBanner("✅ Merci pour ton achat ! Ta commande est confirmée — livraison automatique à ta prochaine connexion sur le serveur.", true);
    } else if (paye === "annule") {
      showBanner("Paiement annulé — ton panier est toujours là si tu changes d'avis.", false);
    }
    const sid = params.get("steamId");
    if (sid && /^7656\d{13}$/.test(sid)) { steamId = sid; store.set("lexil_steamid", sid); }
    // Jeton d'identité signé émis par le backend → prouve l'auth Steam sans cookie.
    const tok = params.get("t");
    if (sid && /^7656\d{13}$/.test(sid) && /^[a-f0-9]{64}$/.test(tok || "")) store.set("lexil_token", tok);
    if (paye || sid || params.get("login") || params.get("t")) history.replaceState({}, "", location.pathname);
    if (params.get("login") === "success" && B) {
      fetch(B + "/api/me", { credentials: "include" }).then((r) => r.json()).then((d) => {
        if (d.loggedIn && d.user) {
          user = d.user; steamId = d.user.steamId || steamId;
          store.set("lexil_user", JSON.stringify(user)); store.set("lexil_steamid", steamId);
          renderAuth(); loadAccount(steamId);
        }
      }).catch(() => {});
    }
  }

  function showBanner(text, ok) {
    const b = $("payeBanner");
    b.textContent = text;
    b.className = "paye-banner " + (ok ? "ok" : "ko");
    b.style.display = "block";
    setTimeout(() => { b.style.display = "none"; }, 9000);
  }

  /* ══════════ INIT ══════════ */
  document.addEventListener("DOMContentLoaded", () => {
    // Liens Discord
    document.querySelectorAll("#discordNavLink, #discordCta, #discordFooterLink, #discordMembersLink")
      .forEach((el) => (el.href = CFG.discordUrl));

    // Sections statiques (grades, features, connexion, infos serveur)
    $("ranksRow").innerHTML = CFG.ranks.map((r) => `
      <div class="rank-chip"><span class="rank-glyph">${r.glyph}</span><div class="rank-name">${r.name}</div><div class="rank-amt">${r.amt}</div></div>`).join("");
    $("featuresGrid").innerHTML = CFG.features.map((f) => `
      <div class="feature-card"><div class="feature-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8bb45" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${f.iconPath}"></path></svg></div><h3>${f.title}</h3><p>${f.text}</p></div>`).join("");
    $("stepsList").innerHTML = CFG.connexionSteps.map((s, i) => `
      <div class="step"><div class="step-num">${i + 1}</div><div><div class="step-title">${s.title}</div><div class="step-text">${s.text}</div></div></div>`).join("");
    $("serverInfoList").innerHTML = CFG.serveur.info.map((i) => `
      <div class="server-info-row"><span class="label">${i.label}</span><span class="value">${i.value}</span></div>`).join("");

    // IP + copier
    if (CFG.serveur.ip) $("ipValue").textContent = CFG.serveur.ip;
    else { $("ipValue").textContent = "Non configurée"; $("ipHint").style.display = "flex"; }
    $("copyIpBtn").addEventListener("click", async () => {
      if (!CFG.serveur.ip) return;
      await navigator.clipboard.writeText(CFG.serveur.ip);
      const label = $("copyIpBtn").querySelector("span");
      label.textContent = "Copié !";
      setTimeout(() => (label.textContent = "Copier"), 1500);
    });

    // Boutique + panier — chaque bloc est isolé : un pépin n'empêche pas le reste.
    safe("boutique", () => { renderFilters(); renderGrid(); });
    safe("fiche produit", () => {
      $("prodClose").addEventListener("click", closeProduct);
      $("prodModal").addEventListener("click", (e) => { if (e.target === $("prodModal")) closeProduct(); });
      $("prodAdd").addEventListener("click", () => {
        const p = CFG.catalogue.find((x) => x.id === prodOpenId);
        if (p) { addToCart(p); closeProduct(); }
      });
    });
    // Échap ferme la fiche produit ou le panier (jamais de blocage).
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeProduct();
      openCart(false);
    });
    safe("panier", () => {
      renderCart();
      $("cartBtn").addEventListener("click", () => openCart(true));
      $("cartClose").addEventListener("click", () => openCart(false));
      $("cartOverlay").addEventListener("click", () => openCart(false));
      $("checkoutBtn").addEventListener("click", checkout);
    });

    // Compte
    safe("auth", renderAuth);
    safe("retours", handleReturns);
    if (steamId) safe("compte", () => loadAccount(steamId));

    // Bannière cookies
    safe("cookies", () => {
      if (!store.get("lexil_cookies_ok", "")) $("cookieBar").style.display = "flex";
      $("cookieOk").addEventListener("click", () => { store.set("lexil_cookies_ok", "1"); $("cookieBar").style.display = "none"; });
    });
  });
})();
