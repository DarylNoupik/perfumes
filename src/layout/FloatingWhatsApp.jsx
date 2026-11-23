import { MessageCircle } from "lucide-react";
import { useIsMobile } from "../hooks/browser.js";
import { waLink } from "../lib/whatsapp.js";
import { useStore } from "../store/ShopStore.jsx";

// ── Bouton WhatsApp flottant ───────────────────────────────────────────────────
export function FloatingWhatsApp() {
  const { settings } = useStore();
  const isMobile = useIsMobile();
  const d = isMobile ? 48 : 56;
  const waHref = waLink(
    settings.whatsapp,
    "Bonjour Madame ! Je souhaite passer une commande de parfums. Pouvez-vous m'aider ?",
  );
  return (
    <a
      href={waHref}
      target="_blank"
      rel="noreferrer"
      title="Commander via WhatsApp"
      aria-label="Commander via WhatsApp"
      style={{
        position: "fixed",
        bottom: isMobile ? "calc(14px + env(safe-area-inset-bottom))" : 24,
        right: isMobile ? 12 : 24,
        zIndex: 998,
        width: d,
        height: d,
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(37,211,102,.5)",
        // 3 pulsations à l'arrivée, puis le bouton reste immobile
        animation: "waPulse 2.2s ease-out 1s 3",
        textDecoration: "none",
        transition: "transform .2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <MessageCircle size={isMobile ? 22 : 26} color="#fff" />
    </a>
  );
}
