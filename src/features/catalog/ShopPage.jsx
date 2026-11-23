import { ChevronRight, MessageCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { a11yClick } from "../../components/accessibility.js";
import { Btn } from "../../components/ui.jsx";
import { CONSEILS_DATA } from "../advice/adviceData.js";
import { Carousel, PAGE_SIZE, Pagination } from "./CatalogNavigation.jsx";
import { CountdownBanner } from "./CountdownBanner.jsx";
import { ProductCard } from "./ProductCard.jsx";
import { useIsMobile } from "../../hooks/browser.js";
import { waLink } from "../../lib/whatsapp.js";
import { useStore } from "../../store/ShopStore.jsx";

export function ShopPage({ onView, onConseils }) {
  const { settings, products, addToCart } = useStore();
  const isMobile = useIsMobile();
  // Nombre de parfums en stock qui ont une fiche conseil
  const guideCount = CONSEILS_DATA.filter(
    (c) => (products.find((p) => p.id === c.productId)?.stock || 0) > 0,
  ).length;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tous");
  const cats = ["Tous", ...new Set(products.map((p) => p.cat).filter(Boolean))];
  const matches = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.brand.toLowerCase().includes(q.toLowerCase())) &&
      (cat === "Tous" || p.cat === cat),
  );
  // Produits disponibles en haut, anciens stocks (épuisés) dans une section dédiée
  const visible = matches.filter((p) => p.stock > 0);
  const pastStock = matches.filter((p) => p.stock === 0);
  // Pagination des produits disponibles, remise à 1 quand le filtre change
  // (les anciens stocks sont présentés dans un carrousel)
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [q, cat]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const curPage = Math.min(page, pageCount);
  const visiblePage = visible.slice(
    (curPage - 1) * PAGE_SIZE,
    curPage * PAGE_SIZE,
  );
  const goTo = (setter, anchor) => (n) => {
    setter(n);
    const el = document.getElementById(anchor);
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: "smooth",
      });
  };
  const waHref = waLink(
    settings.whatsapp,
    `Bonjour, je souhaite des informations sur vos parfums.`,
  );
  return (
    <div>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(154,110,46,.06) 0%, transparent 70%), linear-gradient(160deg,#FAF7F2 0%,#F5EDD9 50%,#FAF7F2 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle,rgba(154,110,46,.06) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "8%",
            width: 1,
            height: 100,
            background:
              "linear-gradient(to bottom,transparent,rgba(154,110,46,.2),transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "22%",
            right: "10%",
            width: 1,
            height: 70,
            background:
              "linear-gradient(to bottom,transparent,rgba(154,110,46,.14),transparent)",
          }}
        />
        <div
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            padding: "72px 24px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "var(--gold-text)",
              marginBottom: 22,
              animation: "heroIn .6s ease-out .05s backwards",
            }}
          >
            {settings.heroLabel}
          </div>
          <h1
            style={{
              fontFamily: "var(--fd)",
              fontSize: "clamp(46px,7.5vw,84px)",
              fontWeight: 300,
              lineHeight: 1.06,
              marginBottom: 22,
              animation: "heroIn .7s ease-out .15s backwards",
            }}
          >
            {settings.heroTitle.split(" ").slice(0, -2).join(" ")}
            <br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
              {settings.heroTitle.split(" ").slice(-2).join(" ")}
            </em>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--muted)",
              maxWidth: 420,
              margin: "0 auto 36px",
              lineHeight: 1.8,
              animation: "heroIn .7s ease-out .3s backwards",
            }}
          >
            {settings.heroSubtitle}
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              animation: "heroIn .7s ease-out .45s backwards",
              flexWrap: "wrap",
            }}
          >
            <Btn
              sz="lg"
              onClick={() =>
                document
                  .getElementById("catalogue")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Découvrir les parfums
            </Btn>
            <Btn href={waHref} sz="lg" v="wa">
                <MessageCircle size={15} />
                Contactez-nous
              </Btn>
          </div>
        </div>
      </div>

      {/* Compte à rebours */}
      <CountdownBanner />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(to right,transparent,var(--border),transparent)",
          }}
        />
      </div>

      {/* ── Teaser Conseils ── */}
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: isMobile ? "32px 16px" : "48px 24px",
        }}
      >
        <div
          {...a11yClick(onConseils, "Voir le guide des conseils parfums")}
          style={{
            cursor: "pointer",
            background:
              "linear-gradient(135deg,#2A2118 0%,#3D2B1A 60%,#2A2118 100%)",
            borderRadius: 12,
            padding: isMobile ? "28px 22px" : "40px 52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            position: "relative",
            overflow: "hidden",
            transition: "transform .25s, box-shadow .25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 20px 52px rgba(42,33,24,.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          {/* Motif décoratif */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle,rgba(201,168,76,.07) 1px,transparent 1px)",
              backgroundSize: "28px 28px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: isMobile ? -30 : 40,
              top: "50%",
              transform: "translateY(-50%)",
              fontFamily: "var(--fd)",
              fontSize: isMobile ? 90 : 140,
              color: "rgba(201,168,76,.06)",
              fontStyle: "italic",
              pointerEvents: "none",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            DIHU
          </div>

          {/* Texte */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "var(--gold-l)",
                marginBottom: 10,
              }}
            >
              Conseils parfums
            </div>
            <h2
              style={{
                fontFamily: "var(--fd)",
                fontSize: isMobile ? 24 : 34,
                fontWeight: 300,
                color: "#FAF7F2",
                lineHeight: 1.15,
                marginBottom: 12,
              }}
            >
              Vous ne savez pas quel parfum{" "}
              <em style={{ color: "var(--gold-l)", fontStyle: "italic" }}>
                vous correspond ?
              </em>
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(250,247,242,.5)",
                lineHeight: 1.8,
                maxWidth: 460,
                marginBottom: isMobile ? 18 : 0,
              }}
            >
              Pour chaque parfum en stock : à qui il va, à quel moment le
              porter et comment l'appliquer. De quoi trouver{" "}
              <strong style={{ color: "rgba(250,247,242,.8)" }}>
                celui qui vous correspond
              </strong>
              .
            </p>
          </div>

          {/* CTA */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "flex-start" : "center",
              gap: 8,
            }}
          >
            <div
              style={{
                background: "var(--gold)",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              Voir les conseils
              <ChevronRight size={14} />
            </div>
            <span
              style={{
                fontSize: 12,
                color: "rgba(250,247,242,.72)",
                letterSpacing: "0.06em",
              }}
            >
              {guideCount} parfums en stock passés en revue
            </span>
          </div>
        </div>
      </div>

      {/* Catalogue */}
      <div
        id="catalogue"
        style={{ maxWidth: 1160, margin: "0 auto", padding: "60px 24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <h2
            style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 400 }}
          >
            Catalogue complet
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surf)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "0 14px",
              minHeight: 44,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Search size={15} color="var(--muted)" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un parfum..."
              aria-label="Rechercher un parfum par nom ou par marque"
              style={{
                background: "none",
                border: "none",
                color: "var(--text)",
                fontFamily: "var(--fb)",
                // 16 px minimum : évite le zoom automatique d'iOS
                fontSize: 16,
                outline: "none",
                width: isMobile ? "100%" : 220,
                minHeight: 40,
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              style={{
                padding: "0 16px",
                minHeight: 40,
                borderRadius: 20,
                fontFamily: "var(--fb)",
                fontSize: 13,
                cursor: "pointer",
                border: `1px solid ${cat === c ? "var(--gold)" : "var(--border)"}`,
                background: cat === c ? "var(--gold-dim)" : "transparent",
                color: cat === c ? "var(--gold-text)" : "var(--muted)",
                transition: "background .15s, border-color .15s, color .15s",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2,minmax(0,1fr))"
              : "repeat(auto-fill,minmax(240px,1fr))",
            gap: isMobile ? 10 : 16,
          }}
        >
          {visiblePage.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              onView={() => onView(p)}
              onAdd={() => addToCart(p)}
            />
          ))}
        </div>
        <Pagination
          page={curPage}
          count={pageCount}
          total={visible.length}
          onChange={goTo(setPage, "catalogue")}
        />
        {visible.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: pastStock.length ? 32 : 64,
              color: "var(--muted)",
              fontFamily: "var(--fd)",
              fontSize: 22,
            }}
          >
            {pastStock.length
              ? "Aucun parfum disponible actuellement pour cette recherche"
              : "Aucun parfum trouvé"}
          </div>
        )}
        {pastStock.length > 0 && (
          <div id="anciens-stocks" style={{ marginTop: 56 }}>
            <h2
              style={{
                fontFamily: "var(--fd)",
                fontSize: isMobile ? 24 : 30,
                fontWeight: 400,
                marginBottom: 6,
              }}
            >
              Déjà vendus · Disponibles sur demande
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--muted)",
                lineHeight: 1.7,
                marginBottom: 22,
                maxWidth: 620,
              }}
            >
              Ces parfums faisaient partie de nos stocks précédents. Si l'un
              d'eux vous intéresse, demandez-le sur WhatsApp et nous vous dirons
              s'il peut être recommandé. Les prix sont indicatifs.
            </p>
            <Carousel
              items={pastStock}
              perView={isMobile ? 2 : 4}
              gap={isMobile ? 10 : 16}
              resetKey={`${q}|${cat}`}
              label="Parfums déjà vendus"
              renderItem={(p) => <ProductCard p={p} onView={() => onView(p)} />}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          background: "#F3EEE7",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--fd)",
            fontSize: 22,
            color: "var(--gold-text)",
            letterSpacing: "0.18em",
            marginBottom: 10,
          }}
        >
          {settings.shopName}
        </div>
        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            letterSpacing: "0.06em",
          }}
        >
          {settings.tagline} · {settings.city}
        </p>
        <a
          href={waLink(settings.whatsapp)}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            color: "#1a7a3a",
            fontSize: 13,
            textDecoration: "none",
            margin: "4px 0 0",
            padding: "12px 8px",
            minHeight: 44,
            fontWeight: 500,
          }}
        >
          <MessageCircle size={13} />+{settings.whatsapp}
        </a>
        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 10,
            opacity: 0.5,
          }}
        >
          {settings.copyright}
        </p>
      </footer>
    </div>
  );
}
