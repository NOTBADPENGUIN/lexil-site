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

  // Grades donateur — mêmes paliers que lexil.net / les rôles Discord.
  ranks: [
    { glyph: "🥉", name: "Bronze", amt: "5 €" },
    { glyph: "🥈", name: "Argent", amt: "15 €" },
    { glyph: "🥇", name: "Or", amt: "30 €" },
    { glyph: "💎", name: "Diamant", amt: "50 €" },
    { glyph: "💠", name: "Saphir", amt: "100 €" },
    { glyph: "🔥", name: "Élite", amt: "150 €" },
    { glyph: "👑", name: "Royal", amt: "200 €" },
    { glyph: "⭐", name: "Prestige", amt: "250 €" },
    { glyph: "🌟", name: "Légende", amt: "300 €" },
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
    { id: "prio", cat: "confort", nom: "File prioritaire", court: "Passe devant la file d'attente (30 jours).", prix: 15, duree: "30 jours" },
    { id: "item", cat: "cosmetique", nom: "Item cosmétique", court: "Une pièce retexturée à ton image.", prix: 11.99, duree: "À vie" },
    { id: "item-adv", cat: "cosmetique", nom: "Item — Retexture avancé", court: "Une pièce, design premium détaillé.", prix: 19.99, duree: "À vie" },
    { id: "tenue-s", cat: "cosmetique", nom: "Tenue complète — Simple", court: "Toute la tenue retexturée, style cohérent.", prix: 19.99, duree: "À vie" },
    { id: "tenue-s-plus", cat: "cosmetique", nom: "Tenue simple + protections", court: "Tenue simple + armure, casque, veste & sac.", prix: 29.99, duree: "À vie" },
    { id: "tenue-a", cat: "cosmetique", nom: "Tenue complète — Avancé", court: "Toute la tenue, design avancé détaillé.", prix: 34.99, duree: "À vie" },
    { id: "tenue-a-plus", cat: "cosmetique", nom: "Tenue avancée + protections", court: "Le pack ultime : avancé + protections.", prix: 44.99, duree: "À vie", badge: "Meilleure offre" },
    { id: "drip", cat: "cosmetique", nom: "Drip Menu", court: "Menu tenues cosmétiques in-game (30 jours).", prix: 14.99, duree: "30 jours", badge: "Populaire" },
    { id: "gun-b", cat: "armes", nom: "Retexture d'arme — Basic", court: "Reskin cosmétique de ton arme.", prix: 19.99, duree: "À vie" },
    { id: "gun-a", cat: "armes", nom: "Retexture d'arme — Avancé", court: "Reskin d'arme premium détaillé.", prix: 34.99, duree: "À vie" },
    { id: "heli-b", cat: "vehicules", nom: "Reskin hélico — Basic", court: "Livrée cosmétique pour ton hélico.", prix: 50, duree: "À vie" },
    { id: "heli-a", cat: "vehicules", nom: "Reskin hélico — Avancé", court: "Livrée d'hélico premium sur mesure.", prix: 65, duree: "À vie" },
    { id: "col-kf", cat: "couleurs", nom: "Couleur de nom — Killfeed", court: "Ton pseudo coloré dans le killfeed.", variantes: true, badge: "Populaire" },
    { id: "col-chat", cat: "couleurs", nom: "Couleur de chat", court: "Écris en couleur dans le chat.", variantes: true },
    { id: "col-clan", cat: "couleurs", nom: "Couleur de clan tag", court: "Le tag de ton clan en couleur.", variantes: true },
    { id: "role", cat: "discord", nom: "Rôle Discord personnalisé", court: "Un rôle Discord sur-mesure rien qu'à toi.", prix: 15, duree: "Discord" },
  ],

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
