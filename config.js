// ──────────────────────────────────────────────────────────────
//  Contenu éditable du site (catalogue, textes, liens, IP serveur).
//  Le paiement passe par le bot EXIL (Railway) via backendUrl/api/order,
//  exactement comme l'ancien site lexil.net.
// ──────────────────────────────────────────────────────────────

window.CONFIG = {
  discordUrl: "https://discord.gg/t46RE8hYs7",

  // Backend comptes + commandes (Steam login, /api/account, /api/order…)
  backendUrl: "https://lexil-auth-production.up.railway.app",

  serveur: {
    ip: "", // ex: "51.83.XX.XX:2402" — laisse vide pour afficher "à configurer"
    info: [
      { label: "Carte", value: "Chernarus" },
      { label: "Joueurs max", value: "100" },
      { label: "Localisation", value: "France" },
    ],
  },

  connexionSteps: [
    { title: "Installe DayZ", text: "Disponible sur Steam. Assure-toi d'avoir la dernière version du jeu." },
    { title: "Ouvre le navigateur de serveurs", text: "Dans le menu principal DayZ, clique sur « Serveurs communautaires »." },
    { title: "Entre l'IP du serveur", text: "Colle l'adresse IP ci-dessus dans la barre de recherche directe." },
    { title: "Connecte-toi & survis", text: "Rejoins le serveur et prépare-toi : ici, tout le monde peut te tuer." },
  ],

  // Grades donateur. `key` = nom exact du grade côté backend (= clé de GRADE_ROLES
  // et nom du rôle Discord attribué automatiquement). Ne pas le modifier sans
  // renommer aussi les rôles Discord, sinon l'attribution auto ne matche plus.
  ranks: [
    { glyph: "🥉", name: "Bronze", key: "Bronze", amt: "5 €" },
    { glyph: "🥈", name: "Argent", key: "Silver", amt: "15 €" },
    { glyph: "🥇", name: "Or", key: "Gold", amt: "30 €" },
    { glyph: "💠", name: "Platine", key: "Platinum", amt: "50 €" },
    { glyph: "💎", name: "Diamant", key: "Diamond", amt: "100 €" },
    { glyph: "🔥", name: "Maître", key: "Master", amt: "150 €" },
    { glyph: "👑", name: "Élite", key: "Elite", amt: "200 €" },
    { glyph: "⭐", name: "Légendaire", key: "Legendary", amt: "250 €" },
    { glyph: "🌟", name: "Ultime", key: "Ultimate", amt: "300 €" },
  ],

  features: [
    {
      title: "PvP hardcore",
      text: "Combats intenses, full loot, zéro pitié. Le serveur FR/EU le plus nerveux.",
      iconPath: "M6 3l12 12M14 3l-2.5 2.5M8.5 8.5 5 12l7 7 3.5-3.5M3 21l3-3",
    },
    {
      title: "Loot rare",
      text: "Tables de loot retravaillées : le bon stuff se mérite et se défend.",
      iconPath: "M12 2 4 7v10l8 5 8-5V7l-8-5ZM12 22V12M4 7l8 5 8-5",
    },
    {
      title: "Snipers customs maison",
      text: "Des armes de précision exclusives, modélisées par notre équipe.",
      iconPath: "M3 11h9l1.7 2H18v2.6h-2.8l-1-1H12V17M6 13v2.5M19 5l.9 2 2 .9-2 .9L19 12l-.9-2-2-.9 2-.9Z",
    },
    {
      title: "Traders & safezones",
      text: "Échange en sécurité dans nos safezones, puis replonge dans le chaos.",
      iconPath: "M12 2 4 5v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V5l-8-3ZM9 12l2 2 4-4",
    },
  ],

  // ── Catalogue boutique — MÊMES ids que le bot EXIL (livraison Railway) ──
  //  variantes : durées au choix (le lineKey envoyé au bot devient "id:key").
  durees: [
    { key: "30j", label: "30 jours", prix: 9.99 },
    { key: "life", label: "Lifetime", prix: 34.99 },
  ],
  catLabels: { confort: "Confort", cosmetique: "Cosmétique", armes: "Armes", vehicules: "Véhicules", couleurs: "Couleurs", discord: "Discord" },
  catalogue: [
    { id: "prio", cat: "confort", nom: "File prioritaire", court: "Passe devant la file d'attente (30 jours).", prix: 15, duree: "30 jours",
      long: "Fini les files interminables aux heures de pointe. Connecte-toi en priorité sur L'EXIL pendant 30 jours, même serveur plein.",
      features: ["Accès prioritaire à la connexion", "Valable 30 jours", "Idéal aux heures de pointe", "Activation automatique"] },
    { id: "item", cat: "cosmetique", nom: "Item cosmétique", court: "Une pièce retexturée à ton image.", prix: 11.99, duree: "À vie",
      long: "Une pièce d'équipement retexturée selon tes envies. Donne du caractère à ta tenue avec un design unique, validé par l'équipe.",
      features: ["1 pièce au choix", "Retexture simple", "100% cosmétique", "Validé par l'équipe"] },
    { id: "item-adv", cat: "cosmetique", nom: "Item — Retexture avancé", court: "Une pièce, design premium détaillé.", prix: 19.99, duree: "À vie",
      long: "Une pièce retexturée avec un niveau de détail premium : logos, motifs et finitions soignées pour vraiment te démarquer.",
      features: ["1 pièce au choix", "Design avancé & détaillé", "Logos / motifs / texte", "Pour se démarquer"] },
    { id: "tenue-s", cat: "cosmetique", nom: "Tenue complète — Simple", court: "Toute la tenue retexturée, style cohérent.", prix: 19.99, duree: "À vie",
      long: "Toute ta tenue retexturée dans un style cohérent. Le pack idéal pour un look complet sans te ruiner.",
      features: ["Tenue complète", "Retexture simple", "Style harmonisé", "100% cosmétique"] },
    { id: "tenue-s-plus", cat: "cosmetique", nom: "Tenue simple + protections", court: "Tenue simple + armure, casque, veste & sac.", prix: 29.99, duree: "À vie",
      long: "Ta tenue simple accompagnée des protections assorties : armure, casque, veste et sac coordonnés pour un set complet.",
      features: ["Tenue complète + protections", "Armure, casque, veste & sac", "Retexture simple", "Set entièrement coordonné"] },
    { id: "tenue-a", cat: "cosmetique", nom: "Tenue complète — Avancé", court: "Toute la tenue, design avancé détaillé.", prix: 34.99, duree: "À vie",
      long: "Toute ta tenue avec un design avancé : finitions détaillées, logos et motifs personnalisés pour un look qui claque.",
      features: ["Tenue complète", "Design avancé & détaillé", "Logos / motifs perso", "Look qui claque"] },
    { id: "tenue-a-plus", cat: "cosmetique", nom: "Tenue avancée + protections", court: "Le pack ultime : avancé + protections.", prix: 44.99, duree: "À vie", badge: "Meilleure offre",
      long: "Le pack ultime : tenue avancée + protections (armure, casque, veste, sac) au même niveau de détail premium.",
      features: ["Tenue + protections", "Design avancé sur tout le set", "Armure, casque, veste & sac", "Le set le plus complet"] },
    { id: "drip", cat: "cosmetique", nom: "Drip Menu", court: "Menu tenues cosmétiques in-game (30 jours).", prix: 14.99, duree: "30 jours", badge: "Populaire",
      long: "Accès au menu cosmétique en jeu : change de tenue à chaque respawn et affiche ton style à tout moment.",
      features: ["Accès menu tenues in-game", "Change de fit quand tu veux", "Valable 30 jours", "Style à chaque respawn"] },
    { id: "gun-b", cat: "armes", nom: "Retexture d'arme — Basic", court: "Reskin cosmétique de ton arme.", prix: 19.99, duree: "À vie",
      long: "Reskin cosmétique de ton arme préférée. Aucune incidence sur les stats — juste du style sur le champ de bataille.",
      features: ["Reskin d'1 arme", "100% cosmétique", "Aucun avantage de jeu", "Validé par l'équipe"] },
    { id: "gun-a", cat: "armes", nom: "Retexture d'arme — Avancé", court: "Reskin d'arme premium détaillé.", prix: 34.99, duree: "À vie",
      long: "Reskin d'arme avec un niveau de détail premium : camos, motifs et finitions avancées entièrement personnalisés.",
      features: ["Reskin d'1 arme", "Design avancé", "Camos & motifs détaillés", "Finition premium"] },
    { id: "heli-b", cat: "vehicules", nom: "Reskin hélico — Basic", court: "Livrée cosmétique pour ton hélico.", prix: 50, duree: "À vie",
      long: "Donne une livrée unique à ton hélicoptère. Repère-le de loin et impose le style en escadrille.",
      features: ["Reskin d'1 hélicoptère", "Livrée cosmétique", "100% cosmétique", "Visible par tous"] },
    { id: "heli-a", cat: "vehicules", nom: "Reskin hélico — Avancé", court: "Livrée d'hélico premium sur mesure.", prix: 65, duree: "À vie",
      long: "Livrée d'hélicoptère premium : design détaillé, logos et motifs sur mesure pour le top du style aérien.",
      features: ["Reskin d'1 hélicoptère", "Design avancé & détaillé", "Logos / motifs sur mesure", "Top du style aérien"] },
    { id: "col-kf", cat: "couleurs", nom: "Couleur de nom — Killfeed", court: "Ton pseudo coloré dans le killfeed.", variantes: true, badge: "Populaire",
      long: "Ton pseudo s'affiche dans la couleur de ton choix à chaque kill dans le killfeed. Visible par tous les joueurs.",
      features: ["Couleur de pseudo au killfeed", "Couleur au choix", "Visible par tous", "30 jours ou à vie"] },
    { id: "col-chat", cat: "couleurs", nom: "Couleur de chat", court: "Écris en couleur dans le chat.", variantes: true,
      long: "Écris dans le chat du serveur avec une couleur personnalisée et démarque-toi à chaque message.",
      features: ["Couleur de texte au chat", "Couleur au choix", "Visible par tous", "30 jours ou à vie"] },
    { id: "col-clan", cat: "couleurs", nom: "Couleur de clan tag", court: "Le tag de ton clan en couleur.", variantes: true,
      long: "Le tag de ton clan affiché dans une couleur unique et reconnaissable. À acheter par le chef de groupe.",
      features: ["Couleur de clan tag", "À acheter par le chef de groupe", "Unis ton équipe", "30 jours ou à vie"] },
    { id: "role", cat: "discord", nom: "Rôle Discord personnalisé", court: "Un rôle Discord sur-mesure rien qu'à toi.", prix: 15, duree: "Discord",
      long: "Un rôle Discord personnalisé rien qu'à toi : nom et couleur au choix sur le serveur Discord de L'EXIL. Affiche ton soutien.",
      features: ["Rôle Discord sur-mesure", "Nom & couleur au choix", "Visible sur le Discord", "Affiche ton soutien"] },
  ],

  // ── Styles KILLFEED (page dédiée killfeed.html) ──────────────────
  //  `key` = identifiant stable envoyé au backend / lu par le mod DayZ.
  //  `preview` = aperçu CSS provisoire ; `media` = photo/vidéo (à remplir plus tard,
  //  ex. "img/killfeed/feu.mp4" ou ".png" — laissé vide pour l'instant).
  killfeed: {
    colors: [
      { key: "rainbow", label: "Arc-en-ciel", desc: "Dégradé multicolore qui défile", preview: "linear-gradient(90deg,#ff004c,#ff8a00,#ffe017,#39d56b,#22c3ff,#7a2bff)", media: "" },
      { key: "fire", label: "Feu", desc: "Braises orange et rouge ardent", preview: "linear-gradient(90deg,#ffd200,#ff6a00,#d40000)", media: "" },
      { key: "toxic", label: "Toxique", desc: "Vert radioactif lumineux", preview: "linear-gradient(90deg,#b6ff00,#39d56b,#0aa15a)", media: "" },
      { key: "ice", label: "Glace", desc: "Bleu glacé cristallin", preview: "linear-gradient(90deg,#eafbff,#7fd6ff,#2aa5e0)", media: "" },
      { key: "neon", label: "Néon", desc: "Magenta et cyan électriques", preview: "linear-gradient(90deg,#ff2bd6,#7a2bff,#22e0ff)", media: "" },
      { key: "ocean", label: "Océan", desc: "Dégradé de bleus profonds", preview: "linear-gradient(90deg,#22c3ff,#0a5fd4,#083b8f)", media: "" },
      { key: "sunset", label: "Coucher de soleil", desc: "Orangé, rose et violet", preview: "linear-gradient(90deg,#ffcf40,#ff6a3d,#c73bd6)", media: "" },
      { key: "matrix", label: "Matrix", desc: "Vert digital sur fond sombre", preview: "linear-gradient(90deg,#0aff6a,#0a7a3a,#031f10)", media: "" },
      { key: "candy", label: "Bonbon", desc: "Pastel rose et bleu bonbon", preview: "linear-gradient(90deg,#ff8ad8,#a98bff,#8ad0ff)", media: "" },
      { key: "ember", label: "Braise", desc: "Rouge chauffé à blanc", preview: "linear-gradient(90deg,#ffb03d,#d43a1a,#5a0f0a)", media: "" },
      { key: "blood", label: "Sang", desc: "Rouge sang sombre", preview: "linear-gradient(90deg,#e11d2a,#8f0f14,#3a0608)", media: "" },
      { key: "void", label: "Néant", desc: "Noir violacé du néant", preview: "linear-gradient(90deg,#6a3bd6,#2b0a4a,#050308)", media: "" },
    ],
    slots: [
      { key: "off", label: "Désactivé", desc: "Aucun effet de fond", preview: "linear-gradient(135deg,#141d34,#0d1526)", media: "" },
      { key: "chromatic", label: "Chromatique", desc: "Bordure chromatique changeante", preview: "linear-gradient(90deg,#ff2bd6,#22e0ff,#ffe017,#ff2bd6)", media: "" },
      { key: "symbiote", label: "Symbiote", desc: "Coulures organiques animées", preview: "linear-gradient(135deg,#1a1030,#3a1550,#0a0512)", media: "" },
      { key: "shockwave", label: "Onde de choc", desc: "Onde diffusée à chaque kill", preview: "radial-gradient(circle at 30% 50%,#22e0ff,#0a5fd4 60%,#081226)", media: "" },
      { key: "sweep", label: "Ligne de balayage", desc: "Faisceau lumineux qui balaie", preview: "linear-gradient(110deg,#0d1526 40%,#e8bb45 50%,#0d1526 60%)", media: "" },
      { key: "embers", label: "Braises", desc: "Braises qui montent du slot", preview: "linear-gradient(0deg,#ff6a00,#d40000 50%,#1a0806)", media: "" },
    ],
    motions: [
      { key: "flat", label: "Plat", desc: "Texte fixe, sans animation", preview: "linear-gradient(135deg,#141d34,#0d1526)", media: "" },
      { key: "wave", label: "Vague", desc: "Ondulation façon vague", preview: "linear-gradient(135deg,#0a5fd4,#22c3ff)", media: "" },
      { key: "breathing", label: "Respiration", desc: "Pulsation douce de luminosité", preview: "radial-gradient(circle,#e8bb45,#7a5a12)", media: "" },
      { key: "marquee", label: "Enseigne", desc: "Défilement type enseigne", preview: "linear-gradient(90deg,#ffcf40,#ff6a3d,#ffcf40)", media: "" },
      { key: "static", label: "Statique", desc: "Grésillement électrique", preview: "linear-gradient(135deg,#2a2f3a,#0d1526)", media: "" },
      { key: "beat", label: "Battement", desc: "Battement rythmé", preview: "radial-gradient(circle,#e11d2a,#5a0810)", media: "" },
      { key: "fade", label: "Fondu", desc: "Fondu entrée / sortie", preview: "linear-gradient(90deg,#0d1526,#8593ac,#0d1526)", media: "" },
    ],
  },

  // ── Ambiance "site vivant" (purement visuel, éditable librement) ──
  live: {
    customCursor: true,
    joueursMax: 100,
    joueursBase: 67,
    survivants: 1274,
    ticker: [
      "Bienvenue sur L'EXIL — serveur DayZ PvP FR/EU",
      "Livraison automatique en jeu après chaque achat",
      "100% cosmétique — jamais de pay-to-win",
      "Rejoins le Discord pour les événements & airdrops",
      "File prioritaire disponible dans la boutique",
    ],
  },
};
