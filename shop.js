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
  // Icônes monoline par produit (badge hexagonal argenté, style lexil.net).
  const ICON = {
    prio: "M7 21V9 M3 13l4-4 4 4 M15 21V4 M11 9l4-5 4 5",
    item: "M3.5 12.5 12 4h6.5v6.5L10 19zM15.5 7.5h.01",
    "item-adv": "M3.5 12.5 12 4h5v5L9.5 16.5zM14.5 6.5h.01 M18 13l1 2.2 2.2 1-2.2 1L18 20.4l-1-2.2-2.2-1 2.2-1z",
    "tenue-s": "M8.5 4 4 7l2 3.2 2.2-1.2V20h7.6V9l2.2 1.2 2-3.2L17.5 4 15 6.3h-4z",
    "tenue-s-plus": "M8.5 4 4 7l2 3.2 2.2-1.2V20h6V9l2.2 1.2 2-3.2L17.5 4 15 6.3h-4z M17.5 12.5l3.5 1.2v3.3c0 2.3-1.7 3.4-3.5 4-1.8-.6-3.5-1.7-3.5-4v-3.3z",
    "tenue-a": "M8.5 4 4 7l2 3.2 2.2-1.2V20h7.6V9l2.2 1.2 2-3.2L17.5 4 15 6.3h-4z M12 11l.9 2 2 .9-2 .9L12 17l-.9-2-2-.9 2-.9z",
    "tenue-a-plus": "M8 4 4.5 7l1.6 3 1.9-1V19h5.5V9l1.9 1 1.6-3L15.5 4 13.5 6h-3.5z M16.5 11.5l3.5 1.2v3.3c0 2.3-1.7 3.4-3.5 4-1.8-.6-3.5-1.7-3.5-4v-3.3z",
    drip: "M12 4a2 2 0 0 1 1.2 3.6L12 8.5V10 M4 17l8-5 8 5-1 3.5H5z",
    "gun-b": "M3 10h11l2 2.2h5v3h-3.2l-1.2-1.2H13V18 M6 12.2v3 M14 10V7.5",
    "gun-a": "M3 11h9l1.7 2H18v2.6h-2.8l-1-1H12V17 M6 13v2.5 M19 5l.9 2 2 .9-2 .9L19 12l-.9-2-2-.9 2-.9z",
    "heli-b": "M3 6h18 M12 6v3.5 M6 12.5h9.5l2 3.2H8z M11 15.7v3 M8 18.7h7 M16 9.5l4-2.2",
    "heli-a": "M3 6h13 M10 6v3.2 M5 12h8l1.7 2.8H6.6z M9.6 14.8v2.8 M7 17.6h6 M19 4.5l.9 2 2 .9-2 .9L19 11.2l-.9-2-2-.9 2-.9z",
    "col-kf": "M12 3v3.2 M12 17.8V21 M3 12h3.2 M17.8 12H21 M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6 M12 11.7v.01",
    "col-chat": "M4 5.5h16v9.5H9.5L5.5 19v-4H4z M8 9.5h8 M8 12.3h5",
    "col-clan": "M6 3.5v17 M6 4.5h11.5l-2.2 3.4 2.2 3.4H6",
    role: "M9 9.2c-1.5 0-2.6 1.3-2.6 3s1.1 3 2.6 3 M15 9.2c1.5 0 2.6 1.3 2.6 3s-1.1 3-2.6 3 M7.2 17.3c1.4.9 3 1.4 4.8 1.4s3.4-.5 4.8-1.4 M8.8 6.2a10 10 0 0 1 6.4 0",
  };
  const iconBadge = (id) => `
    <svg class="card-icon" viewBox="0 0 100 100" width="112" height="112" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="50,6 88,27 88,73 50,94 12,73 12,27" stroke-width="2.4"></polygon>
      <svg x="27" y="27" width="46" height="46" viewBox="0 0 24 24" stroke-width="1.7">
        <path d="${ICON[id] || ICON.item}"></path>
      </svg>
    </svg>`;
  const tierOf = (prix) => (prix >= 50 ? "legendary" : prix >= 30 ? "rare" : "common");
  const priceOf = (p) => (p.variantes ? CFG.durees.find((d) => d.key === (selectedVariant[p.id] || CFG.durees[0].key)).prix : p.prix);

  function renderFilters() {
    const cats = ["tous", ...new Set(CFG.catalogue.map((p) => p.cat))];
    $("filters").innerHTML = cats
      .map((c) => {
        const label = c === "tous" ? "Tous" : CFG.catLabels[c] || c;
        const count = c === "tous" ? CFG.catalogue.length : CFG.catalogue.filter((p) => p.cat === c).length;
        return `<button class="filter-btn ${c === activeCategory ? "active" : ""}" data-cat="${c}">${label}<span>${count}</span></button>`;
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
            ${iconBadge(p.id)}
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

    $("prodMedia").innerHTML = iconBadge(p.id).replace('width="112" height="112"', 'width="168" height="168"');
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
        <button class="user-menu-item" data-page="profil">Mon profil</button>
        <button class="user-menu-item" data-page="achats">Mes achats</button>
        <button class="user-menu-item" data-page="perso">Personnalisation</button>
        <button class="user-menu-item" data-page="abonnements">Abonnements</button>
        <button class="user-menu-item" data-page="fileprio">File prioritaire</button>
        <a class="user-menu-item" href="https://steamcommunity.com/profiles/${encodeURIComponent(user.steamId)}" target="_blank">Profil Steam</a>
        ${isFounder ? `<div class="user-menu-sep"></div><a class="user-menu-item gold" href="admin.html">Dashboard admin</a>` : ""}
        <div class="user-menu-sep"></div>
        <button class="user-menu-item danger" id="signOutBtn">Se déconnecter</button>
      </div>`;
    $("userChip").addEventListener("click", (e) => { e.stopPropagation(); $("userMenu").classList.toggle("open"); });
    area.querySelectorAll("[data-page]").forEach((b) => b.addEventListener("click", () => openPage(b.dataset.page)));
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

  /* ══════════ PAGES COMPTE (modale) ══════════ */
  const PAGE_TITLES = { profil: "Mon profil", achats: "Mes achats", perso: "Personnalisation", abonnements: "Abonnements", fileprio: "File prioritaire" };

  function pageContent(page) {
    const A = (account && account.account) || {};
    if (page === "profil") {
      const s = A.stats || { totalSpent: "0€", orderCount: 0, grade: { glyph: "—", name: "Aucun" }, progress: 0 };
      const g = s.grade || { glyph: "—", name: "Aucun" };
      const n = s.nextGrade;
      return `
        <div class="acct-profil">
          ${user.avatar ? `<img class="acct-avatar" src="${esc(user.avatar)}" alt=""/>` : ""}
          <div class="acct-name">${esc(user.name)}</div>
          <div class="acct-sub">${user.discordName ? "Discord : " + esc(user.discordName) : "Discord non lié"}</div>
        </div>
        <div class="acct-stats">
          <div><b>${esc(s.totalSpent)}</b><span>Total dépensé</span></div>
          <div><b>${s.orderCount || 0}</b><span>Commandes</span></div>
          <div><b>${g.glyph}</b><span>Grade ${esc(g.name)}</span></div>
        </div>
        ${n ? `
        <div class="acct-progress">
          <div class="acct-progress-label">Prochain grade : ${n.glyph || ""} ${esc(n.name)} (${esc(String(n.min || ""))})</div>
          <div class="acct-bar"><div style="width:${Math.min(100, s.progress || 0)}%"></div></div>
        </div>` : `<div class="acct-progress-label">Grade maximum atteint 🌟</div>`}`;
    }
    if (page === "achats") {
      const orders = A.orders || [];
      if (!orders.length) return `<p class="acct-empty">Aucun achat pour le moment. Ta première commande apparaîtra ici.</p>`;
      return orders.map((o) => `
        <div class="acct-order">
          <div class="acct-order-head"><span>${esc(o.date || "")}</span><b class="ok">${esc(o.status || "Livré")} ✓</b></div>
          ${(o.items || []).map((it) => `<div class="acct-order-line">${esc(it.label)}</div>`).join("")}
          <div class="acct-order-total">Total : ${esc(o.total || "")}</div>
        </div>`).join("");
    }
    if (page === "perso") {
      const c = (account && account.colors) || {};
      const role = account && account.customRole;
      const sw = (label, v) => `
        <div class="acct-color"><span class="swatch" style="background:${esc(v || "#2a3a5c")}"></span>
        <span>${label}</span><b>${v ? esc(v) : "Non activée"}</b></div>`;
      return `
        ${sw("Couleur killfeed", c.killfeed)}${sw("Couleur chat", c.chat)}${sw("Couleur clan tag", c.clan)}
        <div class="acct-color"><span class="swatch" style="background:${esc((role && role.color) || "#2a3a5c")}"></span>
        <span>Rôle Discord</span><b>${role ? esc(role.name) : "Non activé"}</b></div>
        <p class="acct-hint">Les couleurs sont activées par le staff après achat — ouvre un ticket Discord pour choisir tes teintes.</p>`;
    }
    if (page === "abonnements") {
      const subs = A.subscriptions || [];
      if (!subs.length) return `<p class="acct-empty">Aucun abonnement actif. Les produits « 30 jours » apparaîtront ici.</p>`;
      return subs.map((s) => `
        <div class="acct-order">
          <div class="acct-order-head"><span>${esc(s.name)}</span><b class="${s.active ? "ok" : "ko"}">${esc(s.status || (s.active ? "Actif" : "Expiré"))}</b></div>
          <div class="acct-order-line">${esc(s.cat || "")}${s.expiry ? " · expire : " + esc(s.expiry) : ""}</div>
        </div>`).join("");
    }
    if (page === "fileprio") {
      const p = A.priority || { active: false, daysLeft: 0 };
      return `
        <div class="acct-prio ${p.active ? "on" : ""}">
          <div class="acct-prio-icon">${p.active ? "🟢" : "🔴"}</div>
          <div>
            <b>File prioritaire ${p.active ? "active" : "inactive"}</b>
            <p>${p.active ? `Tu passes devant la file encore ${p.daysLeft} jour(s).` : "Achète la file prioritaire dans la boutique pour passer devant tout le monde pendant 30 jours."}</p>
          </div>
        </div>`;
    }
    return "";
  }

  function openPage(page) {
    $("userMenu") && $("userMenu").classList.remove("open");
    $("acctTitle").textContent = PAGE_TITLES[page] || "";
    $("acctBody").innerHTML = pageContent(page);
    $("acctModal").classList.add("open");
    if (steamId) loadAccount(steamId).then(() => { if ($("acctModal").classList.contains("open")) $("acctBody").innerHTML = pageContent(page); });
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
    if (paye || sid || params.get("login")) history.replaceState({}, "", location.pathname);
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
    // Échap ferme la fiche, la modale compte ou le panier (jamais de blocage).
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeProduct();
      $("acctModal").classList.remove("open");
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
    safe("modale", () => {
      $("acctClose").addEventListener("click", () => $("acctModal").classList.remove("open"));
      $("acctModal").addEventListener("click", (e) => { if (e.target === $("acctModal")) $("acctModal").classList.remove("open"); });
    });

    // Bannière cookies
    safe("cookies", () => {
      if (!store.get("lexil_cookies_ok", "")) $("cookieBar").style.display = "flex";
      $("cookieOk").addEventListener("click", () => { store.set("lexil_cookies_ok", "1"); $("cookieBar").style.display = "none"; });
    });
  });
})();
