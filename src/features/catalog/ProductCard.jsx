import { MessageCircle, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { a11yClick } from "../../components/accessibility.js";
import { IndicativePrice, ProdImg } from "../../components/ProductVisuals.jsx";
import { Btn } from "../../components/ui.jsx";
import { useIsMobile, useReveal } from "../../hooks/browser.js";
import { fmt } from "../../lib/currency.js";
import { requestLink } from "../../lib/whatsapp.js";
import { useStore } from "../../store/ShopStore.jsx";

export function ProductCard({ p, onView, onAdd }) {
  const { settings } = useStore();
  const isMobile = useIsMobile();
  const [hov, setHov] = useState(false);
  const [revealRef, revealStyle] = useReveal();
  const soldOut = p.stock === 0;
  const stockColor = soldOut ? "var(--muted)" : "#c25400";
  return (
    <div
      ref={revealRef}
      className="pcard"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...revealStyle,
        background: "var(--surf)",
        border: `1px solid ${hov ? "rgba(154,110,46,.3)" : "var(--border)"}`,
        borderRadius: 10,
        overflow: "hidden",
        transition: "transform .25s ease-out, box-shadow .25s ease-out, border-color .25s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "0 14px 32px rgba(42,33,24,.10)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        onClick={onView}
        aria-hidden="true"
        style={{
          position: "relative",
          cursor: "pointer",
          opacity: soldOut ? 0.8 : 1,
        }}
      >
        <ProdImg p={p} size="card" zoom={hov} />
        {!soldOut && p.price > settings.installMinPrice && (
          <div style={{ position: "absolute", bottom: 8, left: 8 }}>
            <span
              style={{
                background: "rgba(21,101,192,.9)",
                color: "#fff",
                padding: "3px 9px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}
            >
              {isMobile ? "En tranches" : "Paiement en tranches"}
            </span>
          </div>
        )}
      </div>
      <div
        style={{
          padding: isMobile ? "12px 12px 14px" : "16px 18px 18px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={`${p.brand} · ${p.size}`}
        >
          {p.brand} · {p.size}
        </div>
        <div
          {...a11yClick(onView, `Voir la fiche de ${p.name}`)}
          style={{
            fontFamily: "var(--fd)",
            fontSize: isMobile ? 17 : 19,
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: isMobile ? 8 : 10,
            cursor: "pointer",
          }}
        >
          {p.name}
        </div>
        {!isMobile && (
          <div
            style={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            {p.notes.map((n) => (
              <span
                key={n}
                style={{
                  fontSize: 12,
                  padding: "2px 9px",
                  background: "var(--surf2)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  color: "var(--muted)",
                }}
              >
                {n}
              </span>
            ))}
          </div>
        )}
        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "stretch" : "center",
              gap: isMobile ? 8 : 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontFamily: "var(--fd)",
                fontSize: isMobile ? 18 : 20,
                color: "var(--gold)",
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmt(p.price)}
              {soldOut && <IndicativePrice />}
            </div>
            {soldOut ? (
              <Btn href={requestLink(settings.whatsapp, p)}
                  ariaLabel={`Demander ${p.name} sur WhatsApp`}
                  v="ghost"
                  full={isMobile}
                  style={{
                    minHeight: 40,
                    fontSize: 12,
                    padding: "8px 14px",
                    color: "#1a7a3a",
                    border: "1px solid rgba(37,211,102,.6)",
                  }}
                >
                  <MessageCircle size={13} />
                  Demander
                </Btn>
            ) : (
              <Btn
                onClick={onAdd}
                ariaLabel={`Ajouter ${p.name} au panier`}
                full={isMobile}
                style={{ minHeight: 40, fontSize: 12, padding: "8px 16px" }}
              >
                <ShoppingBag size={13} />
                Ajouter
              </Btn>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingTop: 9,
              borderTop: "1px solid var(--border)",
              fontSize: 12,
              color: stockColor,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: soldOut ? "var(--muted)" : "#e65100",
                flexShrink: 0,
              }}
            />
            {soldOut
              ? "Sur demande"
              : p.stock <= 3
                ? `Plus que ${p.stock} en stock`
                : `${p.stock} en stock`}
          </div>
        </div>
      </div>
    </div>
  );
}
