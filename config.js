// ──────────────────────────────────────────────────────────────
//  Config du site — connectée au vrai backend (lexil-auth + bot-exil sur Railway).
//  Le catalogue (prix/kind) est copié du backend (account.js / bot-exil) :
//  toute modification de prix doit être faite aux DEUX endroits (site + backend).
//  Les textes (desc/long/features/icônes/rangs/étapes) viennent du dossier
//  de handoff design (design_handoff_boutique_lexil).
//  ⚠️ Les valeurs "TODO_..." sont à remplacer par tes vraies infos.
// ──────────────────────────────────────────────────────────────

window.CONFIG = {
  authUrl: "https://lexil-auth-production.up.railway.app",
  discordUrl: "https://discord.gg/t46RE8hYs7",

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

  // Rangs donateur — cumulatif, calculé par le backend (account.js) sur le total dépensé.
  // Le backend renvoie un nom anglais (grade.name) ; RANK_DISPLAY traduit vers le nom/glyphe du design.
  ranks: [
    { glyph: "🥉", name: "Bronze", min: 5 },
    { glyph: "🥈", name: "Argent", min: 15 },
    { glyph: "🥇", name: "Or", min: 30 },
    { glyph: "💎", name: "Diamant", min: 50 },
    { glyph: "💠", name: "Saphir", min: 100 },
    { glyph: "🔥", name: "Élite", min: 150 },
    { glyph: "👑", name: "Royal", min: 200 },
    { glyph: "⭐", name: "Prestige", min: 250 },
    { glyph: "🌟", name: "Légende", min: 300 },
  ],

  // Traduction du nom de grade renvoyé par le backend (anglais) vers le nom/glyphe du design (français).
  rankDisplay: {
    Bronze: { name: "Bronze", glyph: "🥉" },
    Silver: { name: "Argent", glyph: "🥈" },
    Gold: { name: "Or", glyph: "🥇" },
    Platinum: { name: "Diamant", glyph: "💎" },
    Diamond: { name: "Saphir", glyph: "💠" },
    Master: { name: "Élite", glyph: "🔥" },
    Elite: { name: "Royal", glyph: "👑" },
    Legendary: { name: "Prestige", glyph: "⭐" },
    Ultimate: { name: "Légende", glyph: "🌟" },
    Aucun: { name: "Aucun", glyph: "—" },
  },

  features: [
    {
      title: "PvP hardcore",
      text: "Combats intenses, full loot, zéro pitié. Le serveur FR/EU le plus nerveux.",
      iconPath: "M12 3v3.2 M12 17.8V21 M3 12h3.2 M17.8 12H21 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    },
    {
      title: "Loot rare",
      text: "Tables de loot retravaillées : le bon stuff se mérite et se défend.",
      iconPath: "M3 8l9-4 9 4-9 4z M3 8v8l9 4 9-4V8 M12 12v8",
    },
    {
      title: "Snipers customs maison",
      text: "Des armes de précision exclusives, modélisées par notre équipe.",
      iconPath: "M3 11h9l2 2h6v2h-3l-1-1h-3v3 M12 4v3 M12 4a3 3 0 0 1 0 6 M6 13v3",
    },
    {
      title: "Traders & safezones",
      text: "Échange en sécurité dans nos safezones, puis replonge dans le chaos.",
      iconPath: "M12 2 4 5v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V5l-8-3Z M9 12l2 2 4-4",
    },
  ],

  // Catalogue — prix/kind copiés de bot-exil/src/index.js (CATALOG) + account.js (cat/kind, source de vérité prix).
  // Textes (desc/long/features/icon/badge) copiés de design_handoff_boutique_lexil (PRODUITS/ICON).
  // kind: 'lifetime' (à vie) | 'days30' (30 jours) | 'priority' (file prio 30j) | 'discord'
  catalog: [
    { key: "prio", name: "File prioritaire", price: 15.0, cat: "Confort", kind: "priority",
      desc: "Passe devant la file d'attente (30 jours).",
      long: "Fini les files interminables aux heures de pointe. Connecte-toi en priorité sur L'Exil pendant 30 jours, même serveur plein.",
      features: ["Accès prioritaire à la connexion", "Valable 30 jours", "Idéal aux heures de pointe", "Activation automatique"],
      iconPath: "M7 21V9 M3 13l4-4 4 4 M15 21V4 M11 9l4-5 4 5" },

    { key: "item", name: "Item cosmétique", price: 11.99, cat: "Cosmétique", kind: "lifetime",
      desc: "Une pièce retexturée à ton image.",
      long: "Une pièce d'équipement retexturée selon tes envies. Donne du caractère à ta tenue avec un design unique, validé par l'équipe.",
      features: ["1 pièce au choix", "Retexture simple", "100% cosmétique", "Validé par l'équipe"],
      iconPath: "M3.5 12.5 12 4h6.5v6.5L10 19zM15.5 7.5h.01" },

    { key: "item-adv", name: "Item — Retexture avancé", price: 19.99, cat: "Cosmétique", kind: "lifetime",
      desc: "Une pièce, design premium détaillé.",
      long: "Une pièce retexturée avec un niveau de détail premium : logos, motifs et finitions soignées pour vraiment te démarquer.",
      features: ["1 pièce au choix", "Design avancé & détaillé", "Logos / motifs / texte", "Pour se démarquer"],
      iconPath: "M3.5 12.5 12 4h5v5L9.5 16.5zM14.5 6.5h.01 M18 13l1 2.2 2.2 1-2.2 1L18 20.4l-1-2.2-2.2-1 2.2-1z" },

    { key: "tenue-s", name: "Tenue complète — Simple", price: 19.99, cat: "Cosmétique", kind: "lifetime",
      desc: "Toute la tenue retexturée, style cohérent.",
      long: "Toute ta tenue retexturée dans un style cohérent. Le pack idéal pour un look complet sans te ruiner.",
      features: ["Tenue complète", "Retexture simple", "Style harmonisé", "100% cosmétique"],
      iconPath: "M8.5 4 4 7l2 3.2 2.2-1.2V20h7.6V9l2.2 1.2 2-3.2L17.5 4 15 6.3h-4z" },

    { key: "tenue-s-plus", name: "Tenue simple + protections", price: 29.99, cat: "Cosmétique", kind: "lifetime",
      desc: "Tenue simple + armure, casque, veste & sac.",
      long: "Ta tenue simple accompagnée des protections assorties : armure, casque, veste et sac coordonnés pour un set complet.",
      features: ["Tenue complète + protections", "Armure, casque, veste & sac", "Retexture simple", "Set entièrement coordonné"],
      iconPath: "M8.5 4 4 7l2 3.2 2.2-1.2V20h6V9l2.2 1.2 2-3.2L17.5 4 15 6.3h-4z M17.5 12.5l3.5 1.2v3.3c0 2.3-1.7 3.4-3.5 4-1.8-.6-3.5-1.7-3.5-4v-3.3z" },

    { key: "tenue-a", name: "Tenue complète — Avancé", price: 34.99, cat: "Cosmétique", kind: "lifetime",
      desc: "Toute la tenue, design avancé détaillé.",
      long: "Toute ta tenue avec un design avancé : finitions détaillées, logos et motifs personnalisés pour un look qui claque.",
      features: ["Tenue complète", "Design avancé & détaillé", "Logos / motifs perso", "Look qui claque"],
      iconPath: "M8.5 4 4 7l2 3.2 2.2-1.2V20h7.6V9l2.2 1.2 2-3.2L17.5 4 15 6.3h-4z M12 11l.9 2 2 .9-2 .9L12 17l-.9-2-2-.9 2-.9z" },

    { key: "tenue-a-plus", name: "Tenue avancée + protections", price: 44.99, cat: "Cosmétique", kind: "lifetime", badge: "offre",
      desc: "Le pack ultime : avancé + protections.",
      long: "Le pack ultime : tenue avancée + protections (armure, casque, veste, sac) au même niveau de détail premium.",
      features: ["Tenue + protections", "Design avancé sur tout le set", "Armure, casque, veste & sac", "Le set le plus complet"],
      iconPath: "M8 4 4.5 7l1.6 3 1.9-1V19h5.5V9l1.9 1 1.6-3L15.5 4 13.5 6h-3.5z M16.5 11.5l3.5 1.2v3.3c0 2.3-1.7 3.4-3.5 4-1.8-.6-3.5-1.7-3.5-4v-3.3z" },

    { key: "drip", name: "Drip Menu (30 jours)", price: 14.99, cat: "Confort", kind: "days30", badge: "populaire",
      desc: "Menu tenues cosmétiques in-game (30 jours).",
      long: "Accès au menu cosmétique en jeu : change de tenue à chaque respawn et affiche ton style à tout moment.",
      features: ["Accès menu tenues in-game", "Change de fit quand tu veux", "Valable 30 jours", "Style à chaque respawn"],
      iconPath: "M12 4a2 2 0 0 1 1.2 3.6L12 8.5V10 M4 17l8-5 8 5-1 3.5H5z" },

    { key: "gun-b", name: "Retexture d'arme — Basic", price: 19.99, cat: "Armes", kind: "lifetime",
      desc: "Reskin cosmétique de ton arme.",
      long: "Reskin cosmétique de ton arme préférée. Aucune incidence sur les stats — juste du style sur le champ de bataille.",
      features: ["Reskin d'1 arme", "100% cosmétique", "Aucun avantage de jeu", "Validé par l'équipe"],
      iconPath: "M2 10h18 M6 10v2.5h7V10 M7.5 10V8.4 M16.5 10V8.4 M9 12.5l-1.2 4.2h3l.6-4.2 M12.8 12.5l1.4 4.2 M2 10v2.6 M1 10.5h1" },

    { key: "gun-a", name: "Retexture d'arme — Avancé", price: 34.99, cat: "Armes", kind: "lifetime",
      desc: "Reskin d'arme premium détaillé.",
      long: "Reskin d'arme avec un niveau de détail premium : camos, motifs et finitions avancées entièrement personnalisés.",
      features: ["Reskin d'1 arme", "Design avancé", "Camos & motifs détaillés", "Finition premium"],
      iconPath: "M2 11h15 M6 11v2.5h7V11 M7.5 11V9.4 M14.5 11V9.4 M9 13.5l-1.2 4.2h3l.6-4.2 M12.8 13.5l1.4 4.2 M2 11v2.6 M1 11.5h1 M19.5 4l.8 1.8 1.8.8-1.8.8L19.5 10l-.8-1.8-1.8-.8 1.8-.8z" },

    { key: "heli-b", name: "Reskin hélico — Basic", price: 50.0, cat: "Véhicules", kind: "lifetime",
      desc: "Livrée cosmétique pour ton hélico.",
      long: "Donne une livrée unique à ton hélicoptère. Repère-le de loin et impose le style en escadrille.",
      features: ["Reskin d'1 hélicoptère", "Livrée cosmétique", "100% cosmétique", "Visible par tous"],
      iconPath: "M4 14c-.2-4 2.6-6.2 6-6.2 2.6 0 4.4 1.3 5 3.2V14z M13 10.5h7.5 M20.5 8.9v3.2 M19.5 10.5h2.2 M3 6.4h13 M9 6.4v1.6 M6 14v2 M13 14v2 M4.5 16h9" },

    { key: "heli-a", name: "Reskin hélico — Avancé", price: 65.0, cat: "Véhicules", kind: "lifetime",
      desc: "Livrée d'hélico premium sur mesure.",
      long: "Livrée d'hélicoptère premium : design détaillé, logos et motifs sur mesure pour le top du style aérien.",
      features: ["Reskin d'1 hélicoptère", "Design avancé & détaillé", "Logos / motifs sur mesure", "Top du style aérien"],
      iconPath: "M4 14c-.2-4 2.6-6.2 6-6.2 2.6 0 4.4 1.3 5 3.2V14z M13 10.5h6.5 M19.5 9.2v2.8 M18.6 10.6h1.9 M3 6.4h12 M8.5 6.4v1.6 M6 14v2 M12.5 14v2 M4.5 16h8.5 M20.3 3.4l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" },

    { key: "col-kf:30j", name: "Couleur de nom (Killfeed) — 30 jours", price: 9.99, cat: "Couleurs", kind: "days30", badge: "populaire",
      desc: "Ton pseudo coloré dans le killfeed.",
      long: "Ton pseudo s'affiche dans la couleur de ton choix à chaque kill dans le killfeed. Visible par tous les joueurs.",
      features: ["Couleur de pseudo au killfeed", "Couleur au choix", "Visible par tous", "Valable 30 jours"],
      iconPath: "M12 3v3.2 M12 17.8V21 M3 12h3.2 M17.8 12H21 M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6 M12 11.7v.01" },
    { key: "col-kf:life", name: "Couleur de nom (Killfeed) — Lifetime", price: 34.99, cat: "Couleurs", kind: "lifetime", badge: "populaire",
      desc: "Ton pseudo coloré dans le killfeed, à vie.",
      long: "Ton pseudo s'affiche dans la couleur de ton choix à chaque kill dans le killfeed. Visible par tous les joueurs, à vie.",
      features: ["Couleur de pseudo au killfeed", "Couleur au choix", "Visible par tous", "À vie"],
      iconPath: "M12 3v3.2 M12 17.8V21 M3 12h3.2 M17.8 12H21 M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6 M12 11.7v.01" },

    { key: "col-chat:30j", name: "Couleur de chat — 30 jours", price: 9.99, cat: "Couleurs", kind: "days30",
      desc: "Écris en couleur dans le chat.",
      long: "Écris dans le chat du serveur avec une couleur personnalisée et démarque-toi à chaque message.",
      features: ["Couleur de texte au chat", "Couleur au choix", "Visible par tous", "Valable 30 jours"],
      iconPath: "M4 5.5h16v9.5H9.5L5.5 19v-4H4z M8 9.5h8 M8 12.3h5" },
    { key: "col-chat:life", name: "Couleur de chat — Lifetime", price: 34.99, cat: "Couleurs", kind: "lifetime",
      desc: "Écris en couleur dans le chat, à vie.",
      long: "Écris dans le chat du serveur avec une couleur personnalisée et démarque-toi à chaque message, à vie.",
      features: ["Couleur de texte au chat", "Couleur au choix", "Visible par tous", "À vie"],
      iconPath: "M4 5.5h16v9.5H9.5L5.5 19v-4H4z M8 9.5h8 M8 12.3h5" },

    { key: "col-clan:30j", name: "Couleur de clan tag — 30 jours", price: 9.99, cat: "Couleurs", kind: "days30",
      desc: "Le tag de ton clan en couleur.",
      long: "Le tag de ton clan affiché dans une couleur unique et reconnaissable. À acheter par le chef de groupe.",
      features: ["Couleur de clan tag", "À acheter par le chef de groupe", "Unis ton équipe", "Valable 30 jours"],
      iconPath: "M6 3.5v17 M6 4.5h11.5l-2.2 3.4 2.2 3.4H6" },
    { key: "col-clan:life", name: "Couleur de clan tag — Lifetime", price: 34.99, cat: "Couleurs", kind: "lifetime",
      desc: "Le tag de ton clan en couleur, à vie.",
      long: "Le tag de ton clan affiché dans une couleur unique et reconnaissable, à vie. À acheter par le chef de groupe.",
      features: ["Couleur de clan tag", "À acheter par le chef de groupe", "Unis ton équipe", "À vie"],
      iconPath: "M6 3.5v17 M6 4.5h11.5l-2.2 3.4 2.2 3.4H6" },

    { key: "role", name: "Rôle Discord personnalisé", price: 15.0, cat: "Discord", kind: "discord",
      desc: "Un rôle Discord sur-mesure rien qu'à toi.",
      long: "Un rôle Discord personnalisé rien qu'à toi : nom et couleur au choix sur le serveur Discord de L'Exil. Affiche ton soutien.",
      features: ["Rôle Discord sur-mesure", "Nom & couleur au choix", "Visible sur le Discord", "Affiche ton soutien"],
      iconPath: "M12 7.2a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M5 20c.4-4 3.2-5.8 7-5.8s6.6 1.8 7 5.8" },
  ],
};
