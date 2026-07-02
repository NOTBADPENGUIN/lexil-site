// ──────────────────────────────────────────────────────────────
//  Config du site — connectée au vrai backend (lexil-auth + bot-exil sur Railway).
//  Le catalogue et les rangs sont copiés du backend (account.js / bot-exil) :
//  toute modification de prix doit être faite aux DEUX endroits (site + backend).
//  ⚠️ Les valeurs "TODO_..." sont à remplacer par tes vraies infos.
// ──────────────────────────────────────────────────────────────

window.CONFIG = {
  authUrl: "https://lexil-auth-production.up.railway.app",
  discordUrl: "https://discord.gg/t46RE8hYs7",

  serveur: {
    ip: "", // ex: "51.83.XX.XX:2402" — laisse vide pour afficher "à configurer"
    info: [
      { label: "Carte", value: "Chernarus" },
      { label: "Joueurs max", value: "60" },
      { label: "Localisation", value: "France" },
    ],
  },

  connexionSteps: [
    { title: "Copie l'IP", text: "Clique sur le bouton copier ci-dessus." },
    { title: "Ouvre DayZ", text: "Lance le jeu puis va dans « Serveurs »." },
    { title: "Coller l'IP", text: "Onglet « Favoris/Direct » → colle l'adresse." },
    { title: "Rejoindre", text: "Connecte-toi et amuse-toi bien !" },
  ],

  // Rangs donateur — cumulatif, calculé par le backend (account.js) sur le total dépensé.
  ranks: [
    { glyph: "🥉", name: "Bronze", min: 5 },
    { glyph: "🥈", name: "Silver", min: 15 },
    { glyph: "🥇", name: "Gold", min: 30 },
    { glyph: "💠", name: "Platinum", min: 50 },
    { glyph: "💎", name: "Diamond", min: 100 },
    { glyph: "🔥", name: "Master", min: 150 },
    { glyph: "👑", name: "Elite", min: 200 },
    { glyph: "⭐", name: "Legendary", min: 250 },
    { glyph: "🌟", name: "Ultimate", min: 300 },
  ],

  features: [
    {
      title: "100% cosmétique",
      text: "Aucun avantage de jeu à l'achat : que du style, jamais de pay-to-win.",
      iconPath: "M12 2 4 5v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V5l-8-3Z M9 12l2 2 4-4",
    },
    {
      title: "Livraison automatique",
      text: "Ton cosmétique est livré dès ta prochaine connexion, sans attendre un admin.",
      iconPath: "M12 5v14M5 12h14",
    },
    {
      title: "Paiement sécurisé",
      text: "Transactions traitées par Stripe, aucune donnée bancaire ne transite par nos serveurs.",
      iconPath: "M3 4h2l2.4 12.5a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.2L21 8H6",
    },
    {
      title: "Communauté active",
      text: "Une communauté FR/EU présente et un staff réactif sur Discord.",
      iconPath: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    },
  ],

  // Catalogue — copié de bot-exil/src/index.js (CATALOG) + account.js (cat/kind).
  // kind: 'lifetime' (à vie) | 'days30' (30 jours) | 'priority' (file prio 30j) | 'discord'
  catalog: [
    { key: "prio", name: "File prioritaire (30 jours)", price: 15.0, cat: "Confort", kind: "priority", desc: "Rejoins le serveur en priorité, même quand il est plein." },
    { key: "item", name: "Item cosmétique", price: 11.99, cat: "Cosmétique", kind: "lifetime", desc: "Une pièce cosmétique au choix." },
    { key: "item-adv", name: "Item — Retexture avancé", price: 19.99, cat: "Cosmétique", kind: "lifetime", desc: "Une pièce d'équipement avec retexture avancé." },
    { key: "tenue-s", name: "Tenue complète — Simple", price: 19.99, cat: "Cosmétique", kind: "lifetime", desc: "Tenue complète avec retexture simple." },
    { key: "tenue-s-plus", name: "Tenue simple + protections", price: 29.99, cat: "Cosmétique", kind: "lifetime", desc: "Tenue simple livrée avec armure, casque, veste et sac." },
    { key: "tenue-a", name: "Tenue complète — Avancé", price: 34.99, cat: "Cosmétique", kind: "lifetime", desc: "Tenue complète avec retexture haut de gamme aux couleurs L'EXIL." },
    { key: "tenue-a-plus", name: "Tenue avancée + protections", price: 44.99, cat: "Cosmétique", kind: "lifetime", desc: "Tenue avancée livrée avec armure, casque, veste et sac." },
    { key: "drip", name: "Drip Menu (30 jours)", price: 14.99, cat: "Confort", kind: "days30", desc: "Accès au menu Drip pendant 30 jours." },
    { key: "gun-b", name: "Retexture d'arme — Basic", price: 19.99, cat: "Armes", kind: "lifetime", desc: "Retexture de base d'arme." },
    { key: "gun-a", name: "Retexture d'arme — Avancé", price: 34.99, cat: "Armes", kind: "lifetime", desc: "Retexture avancé d'arme." },
    { key: "heli-b", name: "Reskin hélico — Basic", price: 50.0, cat: "Véhicules", kind: "lifetime", desc: "Reskin de base pour hélicoptère." },
    { key: "heli-a", name: "Reskin hélico — Avancé", price: 65.0, cat: "Véhicules", kind: "lifetime", desc: "Reskin avancé pour hélicoptère." },
    { key: "col-kf:30j", name: "Couleur de nom (Killfeed) — 30 jours", price: 9.99, cat: "Couleurs", kind: "days30", desc: "Personnalise la couleur de ton nom dans le killfeed pendant 30 jours." },
    { key: "col-kf:life", name: "Couleur de nom (Killfeed) — Lifetime", price: 34.99, cat: "Couleurs", kind: "lifetime", desc: "Personnalise la couleur de ton nom dans le killfeed à vie." },
    { key: "col-chat:30j", name: "Couleur de chat — 30 jours", price: 9.99, cat: "Couleurs", kind: "days30", desc: "Personnalise la couleur de ton chat pendant 30 jours." },
    { key: "col-chat:life", name: "Couleur de chat — Lifetime", price: 34.99, cat: "Couleurs", kind: "lifetime", desc: "Personnalise la couleur de ton chat à vie." },
    { key: "col-clan:30j", name: "Couleur de clan tag — 30 jours", price: 9.99, cat: "Couleurs", kind: "days30", desc: "Personnalise la couleur de ton clan tag pendant 30 jours." },
    { key: "col-clan:life", name: "Couleur de clan tag — Lifetime", price: 34.99, cat: "Couleurs", kind: "lifetime", desc: "Personnalise la couleur de ton clan tag à vie." },
    { key: "role", name: "Rôle Discord personnalisé", price: 15.0, cat: "Discord", kind: "discord", desc: "Un rôle Discord à ton nom et à ta couleur." },
  ],
};
