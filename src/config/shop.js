export const CONTACT_WHATSAPP_NUMBER =
  import.meta.env.VITE_CONTACT_WHATSAPP_NUMBER?.replace(/[\s+]/g, "") ||
  "237692370058";

export const SEED_SETTINGS = {
  shopName: "DIHU",
  tagline: "Maison de Parfums",
  heroTitle: "L'Art du Parfum Rare",
  heroSubtitle:
    "Une petite sélection de parfums, livrés partout à Douala.",
  heroLabel: "Collection Exclusive ·",
  city: "Douala, Cameroun",
  whatsapp: CONTACT_WHATSAPP_NUMBER,
  copyright: "© 2026 DIHU · Tous droits réservés",
  installMinOrders: 3,
  installMinPrice: 50000,
  promoEndDate: "2026-04-05T23:59:59",
  promoLabel: "Offre de lancement : livraison offerte sur votre première commande",
};
