import { ArrowLeft, Layers, Maximize2, MessageCircle, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { IndicativePrice, ProdImg } from "../../components/ProductVisuals.jsx";
import { Btn, Panel } from "../../components/ui.jsx";
import { useIsMobile } from "../../hooks/browser.js";
import { fmt } from "../../lib/currency.js";
import { requestLink, waLink } from "../../lib/whatsapp.js";
import { useStore } from "../../store/ShopStore.jsx";

export function ProductPage({ product: p, onBack }) {
  const { settings, addToCart, session, canInstall } = useStore();
  const isMobile = useIsMobile();
  const [qty, setQty] = useState(1);
  const [imgHov, setImgHov] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === "Escape" && setLightbox(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);
  const elig = canInstall(p);
  const soldOut = p.stock === 0;
  const waHref = soldOut
    ? requestLink(settings.whatsapp, p)
    : waLink(
        settings.whatsapp,
        `Bonjour, je souhaite commander : ${p.name} (${fmt(p.price)})`,
      );
  return (
    <div
      style={{
        maxWidth: 880,
        margin: isMobile ? "24px auto" : "56px auto",
        padding: "0 16px",
      }}
    >
      <Btn v="ghost" sz="sm" onClick={onBack} style={{ marginBottom: 22 }}>
        <ArrowLeft size={13} />
        Retour
      </Btn>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 24 : 48,
        }}
      >
        <div
          onClick={() => p.imgUrl && setLightbox(true)}
          onMouseEnter={() => setImgHov(true)}
          onMouseLeave={() => setImgHov(false)}
          style={{
            position: "relative",
            borderRadius: isMobile ? 0 : 14,
            overflow: "hidden",
            border: isMobile ? "none" : "1px solid var(--border)",
            alignSelf: "start",
            // Sur mobile, la photo va d'un bord à l'autre de l'écran
            margin: isMobile ? "0 -16px" : 0,
            cursor: p.imgUrl ? "zoom-in" : "default",
          }}
        >
          <ProdImg p={p} size="card" zoom={imgHov} />
          {p.imgUrl && (
            <span
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 11px",
                borderRadius: 20,
                background: "rgba(255,255,255,.85)",
                backdropFilter: "blur(6px)",
                fontSize: 12,
                color: "var(--text)",
              }}
            >
              <Maximize2 size={12} />
              Agrandir
            </span>
          )}
        </div>
        {lightbox && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Photo de ${p.name}`}
            onClick={() => setLightbox(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(20,16,12,.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              cursor: "zoom-out",
              animation: "lbIn .2s ease-out",
            }}
          >
            <img
              src={p.imgUrl}
              alt={p.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
            <button
              aria-label="Fermer"
              onClick={() => setLightbox(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,.15)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--gold-text)",
              marginBottom: 8,
            }}
          >
            {p.brand}
          </div>
          <h1
            style={{
              fontFamily: "var(--fd)",
              fontSize: 38,
              fontWeight: 400,
              lineHeight: 1.08,
              marginBottom: 14,
            }}
          >
            {p.name}
          </h1>
          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.75,
              marginBottom: 22,
              fontSize: 15,
            }}
          >
            {p.desc}
          </p>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 7,
              }}
            >
              Notes olfactives
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {p.notes.map((n) => (
                <span
                  key={n}
                  style={{
                    padding: "4px 11px",
                    background: "var(--surf2)",
                    border: "1px solid var(--gold)",
                    borderRadius: 20,
                    color: "var(--gold-text)",
                    fontSize: 12,
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
            <div>
              <div
                style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}
              >
                Contenance
              </div>
              <div style={{ fontSize: 13 }}>{p.size}</div>
            </div>
            <div>
              <div
                style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}
              >
                {soldOut ? "Disponibilité" : "En stock"}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: soldOut
                    ? "var(--muted)"
                    : p.stock <= 3
                      ? "#c25400"
                      : "var(--text)",
                }}
              >
                {soldOut
                  ? "Ancien stock · sur demande"
                  : `${p.stock} unité${p.stock !== 1 ? "s" : ""}`}
              </div>
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 34,
              color: "var(--gold)",
              marginBottom: 20,
            }}
          >
            {fmt(p.price)}
            {soldOut && <IndicativePrice />}
          </div>
          {soldOut ? (
            <>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  lineHeight: 1.7,
                  marginBottom: 14,
                }}
              >
                Ce parfum n'est plus en stock. Écrivez-nous sur WhatsApp : nous
                vous dirons s'il peut être recommandé, à quel prix et dans quel
                délai.
              </p>
              <Btn href={waHref} v="wa" sz="lg">
                  <MessageCircle size={15} />
                  Demander ce parfum
                </Btn>
            </>
          ) : (
          <>
          {elig && (
            <Panel
              style={{
                marginBottom: 18,
                background: "rgba(154,110,46,.1)",
                borderColor: "rgba(154,110,46,.45)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <Layers size={15} color="var(--gold)" />
                <span
                  style={{
                    color: "var(--gold-text)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Paiement en {settings.installMinOrders} fois disponible
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                Client fidèle : {settings.installMinOrders} versements de{" "}
                {fmt(Math.ceil(p.price / settings.installMinOrders))}.
              </p>
            </Panel>
          )}
          {!session && p.price > settings.installMinPrice && (
            <Panel
              style={{
                marginBottom: 18,
                background: "rgba(33,150,243,.1)",
                borderColor: "rgba(33,150,243,.45)",
              }}
            >
              <p style={{ fontSize: 12, color: "#1565c0", lineHeight: 1.65 }}>
                💡 Connectez-vous pour vérifier votre éligibilité au paiement en
                tranches.
              </p>
            </Panel>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid var(--border)",
                borderRadius: 3,
              }}
            >
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: 34,
                  height: 38,
                  background: "none",
                  border: "none",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                −
              </button>
              <span style={{ width: 32, textAlign: "center", fontSize: 13 }}>
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
                style={{
                  width: 34,
                  height: 38,
                  background: "none",
                  border: "none",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                +
              </button>
            </div>
            <Btn
              sz="lg"
              onClick={() => addToCart(p, qty)}
              disabled={p.stock === 0}
            >
              <ShoppingBag size={15} />
              Ajouter au panier
            </Btn>
          </div>
          <Btn href={waHref} v="wa" sz="sm">
              <MessageCircle size={13} />
              Commander par WhatsApp
            </Btn>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
