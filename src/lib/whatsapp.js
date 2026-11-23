export const waLink = (phone, msg = "") =>
  `https://wa.me/${phone.replace(/[\s+]/g, "")}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;

// Lien WhatsApp pour demander un parfum épuisé (ancien stock)
export const requestLink = (phone, p) =>
  waLink(
    phone,
    `Bonjour, je souhaite savoir si le parfum ${p.name} (${p.brand}, ${p.size}) peut être recommandé.`,
  );
