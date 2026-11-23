import { Clock, Lightbulb, MessageCircle, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { IndicativePrice, ProdImg } from "../../components/ProductVisuals.jsx";
import { Btn } from "../../components/ui.jsx";
import { CONSEILS_DATA } from "./adviceData.js";
import { useIsMobile, useReveal } from "../../hooks/browser.js";
import { fmt } from "../../lib/currency.js";
import { requestLink, waLink } from "../../lib/whatsapp.js";
import { useStore } from "../../store/ShopStore.jsx";

export function ConseilsPage({ onView }) {
  const { products, addToCart, settings } = useStore();
  const isMobile = useIsMobile();
  const [filtre, setFiltre] = useState("Tous");
  const filtres = ["Tous", "Féminin", "Masculin", "Mixte"];

  // Les parfums en stock passent devant ; les compteurs suivent le stock réel
  const stockOf = (c) => products.find((p) => p.id === c.productId)?.stock || 0;
  const enStock = CONSEILS_DATA.filter((c) => stockOf(c) > 0);
  const parGenre = (g) => enStock.filter((c) => c.genre === g).length;
  const visible = CONSEILS_DATA.filter(
    (c) => filtre === "Tous" || c.genre === filtre,
  ).sort((a, b) => (stockOf(b) > 0) - (stockOf(a) > 0));

  const waHref = waLink(
    settings.whatsapp,
    "Bonjour Madame ! J'ai vu vos conseils parfums et je voudrais commander.",
  );

  return (
    <div>
      {/* Hero conseils */}
      <div
        style={{
          background:
            "linear-gradient(160deg,#2A2118 0%,#3D2B1A 50%,#2A2118 100%)",
          padding: isMobile ? "48px 20px" : "72px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "var(--gold-l)",
            marginBottom: 18,
          }}
        >
          DIHU · Conseils parfums
        </div>
        <h1
          style={{
            fontFamily: "var(--fd)",
            fontSize: isMobile
              ? "clamp(32px,8vw,52px)"
              : "clamp(42px,5vw,66px)",
            fontWeight: 300,
            color: "#FAF7F2",
            lineHeight: 1.1,
            marginBottom: 18,
          }}
        >
          Conseils &{" "}
          <em style={{ color: "var(--gold-l)", fontStyle: "italic" }}>
            Tendances
          </em>
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "rgba(250,247,242,.78)",
            maxWidth: 520,
            margin: "0 auto 32px",
            lineHeight: 1.85,
          }}
        >
          Pour chaque parfum en stock, on vous dit à qui il va, à quel moment
          le porter et comment l'appliquer.
        </p>
        <div
          style={{
            display: "flex",
            gap: isMobile ? 24 : 48,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { v: String(parGenre("Féminin")), l: "Pour elle" },
            { v: String(parGenre("Masculin")), l: "Pour lui" },
            { v: String(parGenre("Mixte")), l: "Mixtes" },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--fd)",
                  fontSize: isMobile ? 28 : 36,
                  color: "var(--gold-l)",
                  fontWeight: 500,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(250,247,242,.7)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres genre */}
      <div
        style={{
          background: "var(--surf)",
          borderBottom: "1px solid var(--border)",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {filtres.map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            aria-pressed={filtre === f}
            style={{
              fontFamily: "var(--fb)",
              minHeight: 40,
              padding: "0 18px",
              borderRadius: 20,
              fontSize: 12,
              cursor: "pointer",
              letterSpacing: "0.08em",
              border: `1px solid ${filtre === f ? "var(--gold)" : "var(--border)"}`,
              background: filtre === f ? "var(--gold-dim)" : "transparent",
              color: filtre === f ? "var(--gold-text)" : "var(--muted)",
              transition: "all .15s",
            }}
          >
            {f}
            <span style={{ opacity: 0.7, marginLeft: 6 }}>
              {f === "Tous" ? enStock.length : parGenre(f)}
            </span>
          </button>
        ))}
      </div>

      {/* Grille de conseils */}
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: isMobile ? "32px 16px 60px" : "52px 24px 80px",
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fill,minmax(340px,1fr))",
          gap: isMobile ? 20 : 28,
        }}
      >
        {visible.map((c) => {
          const product = products.find((p) => p.id === c.productId);
          if (!product) return null;
          return (
            <ConseilCard
              key={c.productId}
              c={c}
              product={product}
              onView={onView}
              onAdd={() => addToCart(product)}
            />
          );
        })}
      </div>

      {/* CTA bas de page */}
      <div
        style={{
          background:
            "linear-gradient(135deg,rgba(154,110,46,.08) 0%,rgba(201,168,76,.04) 100%)",
          borderTop: "1px solid var(--border)",
          padding: isMobile ? "40px 20px" : "60px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--fd)",
            fontSize: isMobile ? 24 : 32,
            fontWeight: 400,
            marginBottom: 12,
          }}
        >
          Vous ne savez toujours pas lequel choisir ?
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--muted)",
            maxWidth: 460,
            margin: "0 auto 24px",
            lineHeight: 1.75,
          }}
        >
          Dites-nous pour quelle occasion vous cherchez et quel est votre
          budget, et on vous oriente vers le bon parfum.
        </p>
        <Btn href={waHref} sz="lg" v="wa">
            <MessageCircle size={15} />
            Demandez conseil sur WhatsApp
          </Btn>
      </div>
    </div>
  );
}

function ConseilCard({ c, product, onView, onAdd }) {
  const { settings } = useStore();
  const isMobile = useIsMobile();
  const [hov, setHov] = useState(false);
  const [revealRef, revealStyle] = useReveal();
  const soldOut = product.stock === 0;
  const open = () => onView(product);
  return (
    <article
      ref={revealRef}
      className="pcard"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...revealStyle,
        background: "var(--surf)",
        border: `1px solid ${hov ? "rgba(154,110,46,.3)" : "var(--border)"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "transform .25s ease-out, box-shadow .25s ease-out, border-color .25s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "0 14px 32px rgba(42,33,24,.10)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Photo entière (format paysage) + badges lisibles sur n'importe quel fond */}
      <div
        onClick={open}
        aria-hidden="true"
        style={{ cursor: "pointer", position: "relative", opacity: soldOut ? 0.8 : 1 }}
      >
        <ProdImg p={product} size="wide" zoom={hov} />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,.94)",
              color: c.trendColor,
              boxShadow: "0 1px 4px rgba(42,33,24,.12)",
              padding: "4px 11px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {c.tendance}
          </span>
          <span
            style={{
              background: "rgba(42,33,24,.78)",
              color: "#FAF7F2",
              padding: "4px 11px",
              borderRadius: 20,
              fontSize: 12,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {c.genre}
          </span>
        </div>
      </div>

      <div
        style={{
          padding: isMobile ? "18px 16px 20px" : "20px 22px 22px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 4,
          }}
        >
          {c.famille} · {product.brand} · {product.size}
        </div>
        {/* Clic souris sur le nom ; au clavier, le bouton « Voir la fiche » suffit */}
        <h2
          onClick={open}
          style={{
            fontFamily: "var(--fd)",
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1.15,
            marginBottom: 4,
            cursor: "pointer",
          }}
        >
          {product.name}
        </h2>
        <p
          style={{
            fontFamily: "var(--fd)",
            fontSize: 16,
            fontStyle: "italic",
            color: "var(--gold-text)",
            marginBottom: 14,
            lineHeight: 1.4,
          }}
        >
          {c.accroche}
        </p>

        <p
          style={{
            fontSize: 14,
            color: "var(--text)",
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          {c.description}
        </p>

        {/* Repères : pour qui, quand, comment */}
        <dl
          style={{
            display: "grid",
            gap: 12,
            padding: "14px 0 0",
            borderTop: "1px solid var(--border)",
            marginBottom: 18,
          }}
        >
          {[
            { Icon: User, t: "Pour qui", body: c.envie },
            {
              Icon: Clock,
              t: "Quand",
              body: (
                <span style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                  {c.occasions.map((o) => (
                    <span
                      key={o}
                      style={{
                        fontSize: 12,
                        padding: "3px 10px",
                        background: "var(--surf2)",
                        border: "1px solid var(--border)",
                        borderRadius: 20,
                        color: "var(--muted)",
                      }}
                    >
                      {o}
                    </span>
                  ))}
                </span>
              ),
            },
            { Icon: Lightbulb, t: "Comment le porter", body: c.conseil },
          ].map(({ Icon, t, body }) => (
            <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Icon
                size={16}
                color="var(--gold)"
                aria-hidden="true"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <div style={{ minWidth: 0 }}>
                <dt
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--gold-text)",
                    marginBottom: 2,
                  }}
                >
                  {t}
                </dt>
                <dd style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>
                  {body}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        {/* Prix + actions, toujours en bas de la carte */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--fd)",
                fontSize: 24,
                color: "var(--gold-text)",
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {fmt(product.price)}
            </div>
            {soldOut ? (
              <IndicativePrice />
            ) : (
              <div style={{ fontSize: 12, color: "#c25400", marginTop: 4 }}>
                Plus que {product.stock} en stock
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn
              v="ghost"
              onClick={open}
              ariaLabel={`Voir la fiche de ${product.name}`}
              style={{ minHeight: 44 }}
            >
              Voir la fiche
            </Btn>
            {soldOut ? (
              <Btn
                href={requestLink(settings.whatsapp, product)}
                v="wa"
                ariaLabel={`Demander ${product.name} sur WhatsApp`}
                style={{ minHeight: 44 }}
              >
                <MessageCircle size={14} aria-hidden="true" />
                Demander
              </Btn>
            ) : (
              <Btn
                onClick={onAdd}
                ariaLabel={`Ajouter ${product.name} au panier`}
                style={{ minHeight: 44 }}
              >
                <ShoppingBag size={14} aria-hidden="true" />
                Ajouter
              </Btn>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
