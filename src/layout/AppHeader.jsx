import { LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { a11yClick } from "../components/accessibility.js";
import { useCountdown, useIsMobile } from "../hooks/browser.js";
import { useStore } from "../store/ShopStore.jsx";

// En-tête en trois bandes : bandeau d'annonce, ligne logo / recherche / icônes,
// puis la ligne des catégories (sur mobile, les catégories passent dans le menu).
export function AppHeader({ view, nav, onBrowse }) {
  const { logout, session, settings, cartCount, products } = useStore();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const promoLeft = useCountdown(settings.promoEndDate);
  const isAdmin = session?.role === "admin" || session?.role === "vendor";
  const brands = [...new Set(products.map((p) => p.cat).filter(Boolean))];

  const close = () => setMenuOpen(false);
  const go = (v) => {
    nav(v);
    close();
  };
  const browse = (opts) => {
    onBrowse(opts);
    close();
  };
  const submitSearch = (e) => {
    e.preventDefault();
    browse({ q: query.trim() });
  };

  // Liens de la ligne de catégories (et du menu mobile)
  const links = [
    {
      l: "Tous les parfums",
      on: () => browse({}),
      active: view === "shop",
    },
    ...brands.map((b) => ({ l: b, on: () => browse({ cat: b }) })),
    ...(isAdmin ? [{ l: "Dashboard", on: () => go("admin"), active: view === "admin" }] : []),
  ];
  const highlights = [
    {
      l: "Déjà vendus",
      on: () => browse({ anchor: "anciens-stocks" }),
      bg: "var(--text)",
    },
    {
      l: "Conseils parfums",
      on: () => go("conseils"),
      bg: "var(--gold-text)",
      active: view === "conseils",
    },
  ];

  const announcement = promoLeft
    ? settings.promoLabel
    : `Livraison partout à ${settings.city.split(",")[0]} · Paiement en tranches après ${settings.installMinOrders} commandes livrées`;

  const logo = (
    <div
      {...a11yClick(() => go("shop"), `${settings.shopName}, retour à l'accueil`)}
      style={{
        cursor: "pointer",
        lineHeight: 1,
        flexShrink: 0,
        borderRadius: 4,
        textAlign: isMobile ? "center" : "left",
      }}
    >
      <div
        style={{
          fontFamily: "var(--fd)",
          fontSize: isMobile ? 24 : 32,
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: "var(--gold-text)",
        }}
      >
        {settings.shopName}
      </div>
      <div
        style={{
          fontSize: isMobile ? 10 : 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginTop: 3,
        }}
      >
        {settings.tagline}
      </div>
    </div>
  );

  const searchBar = (
    <form
      role="search"
      onSubmit={submitSearch}
      style={{
        flex: 1,
        maxWidth: isMobile ? "none" : 780,
        display: "flex",
        alignItems: "center",
        background: "var(--surf2)",
        borderRadius: 999,
        paddingLeft: 20,
        height: 46,
      }}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un parfum ou une marque"
        aria-label="Rechercher un parfum ou une marque"
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          border: "none",
          outline: "none",
          background: "none",
          color: "var(--text)",
          fontSize: 16,
        }}
      />
      <button
        type="submit"
        aria-label="Lancer la recherche"
        style={{
          width: 46,
          height: 46,
          border: "none",
          background: "none",
          borderRadius: 999,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text)",
          flexShrink: 0,
        }}
      >
        <Search size={20} aria-hidden="true" />
      </button>
    </form>
  );

  const iconBtn = {
    width: 44,
    height: 44,
    border: "none",
    background: "none",
    borderRadius: 999,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text)",
    flexShrink: 0,
  };
  const icons = (
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 0 : 6 }}>
      <button
        onClick={() => go("account")}
        aria-label={session ? `Mon compte (${session.name.split(" ")[0]})` : "Se connecter"}
        aria-current={view === "account" ? "page" : undefined}
        title={session ? "Mon compte" : "Se connecter"}
        style={iconBtn}
      >
        <User size={24} strokeWidth={1.6} aria-hidden="true" />
      </button>
      {session && !isMobile && (
        <button onClick={logout} aria-label="Se déconnecter" title="Se déconnecter" style={iconBtn}>
          <LogOut size={21} strokeWidth={1.6} aria-hidden="true" />
        </button>
      )}
      <CartButton count={cartCount} onClick={() => go("cart")} style={iconBtn} />
    </div>
  );

  return (
    <>
      {/* Bandeau d'annonce (défile avec la page) */}
      <div
        style={{
          background: "var(--text)",
          color: "#FAF7F2",
          textAlign: "center",
          fontSize: 13,
          lineHeight: 1.4,
          padding: isMobile ? "9px 16px" : "10px 24px",
        }}
      >
        {announcement}
      </div>

      <header
        id="site-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#fff",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {isMobile ? (
          <>
            <div
              style={{
                height: 62,
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                padding: "0 8px",
              }}
            >
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={menuOpen}
                aria-controls="menu-mobile"
                style={iconBtn}
              >
                {menuOpen ? <X size={24} strokeWidth={1.6} /> : <Menu size={24} strokeWidth={1.6} />}
              </button>
              {logo}
              <div style={{ justifySelf: "end" }}>{icons}</div>
            </div>
            <div style={{ padding: "0 16px 12px", display: "flex" }}>{searchBar}</div>
          </>
        ) : (
          <>
            <div
              style={{
                height: 88,
                display: "flex",
                alignItems: "center",
                gap: 40,
                padding: "0 32px",
              }}
            >
              {logo}
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                {searchBar}
              </div>
              {icons}
            </div>
            {/* Ligne des catégories */}
            <nav
              aria-label="Catégories"
              className="header-cats"
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 4,
                padding: "0 20px",
                height: 46,
                overflowX: "auto",
              }}
            >
              {links.map((n) => (
                <button
                  key={n.l}
                  onClick={n.on}
                  aria-current={n.active ? "page" : undefined}
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${n.active ? "var(--gold)" : "transparent"}`,
                    padding: "0 12px",
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: "-0.01em",
                    color: "var(--text)",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "border-color .15s",
                  }}
                  onMouseEnter={(e) => !n.active && (e.currentTarget.style.borderBottomColor = "var(--border)")}
                  onMouseLeave={(e) => !n.active && (e.currentTarget.style.borderBottomColor = "transparent")}
                >
                  {n.l}
                </button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 0 }}>
                {highlights.map((h) => (
                  <button
                    key={h.l}
                    onClick={h.on}
                    aria-current={h.active ? "page" : undefined}
                    style={{
                      background: h.bg,
                      color: "#fff",
                      border: "none",
                      height: 30,
                      padding: "0 16px",
                      fontSize: 14,
                      textTransform: "uppercase",
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      textDecoration: h.active ? "underline" : "none",
                      textUnderlineOffset: 4,
                    }}
                  >
                    {h.l}
                  </button>
                ))}
              </div>
            </nav>
          </>
        )}

        {/* Menu mobile */}
        {isMobile && menuOpen && (
          <nav
            id="menu-mobile"
            aria-label="Menu principal"
            style={{
              borderTop: "1px solid var(--border)",
              background: "#fff",
              padding: "8px 16px 16px",
              display: "flex",
              flexDirection: "column",
              maxHeight: "calc(100dvh - 130px)",
              overflowY: "auto",
              animation: "fadeSlide .2s ease",
            }}
          >
            {[...links, ...highlights].map((n) => (
              <button
                key={n.l}
                onClick={n.on}
                aria-current={n.active ? "page" : undefined}
                style={{
                  padding: "14px 4px",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  background: "none",
                  textAlign: "left",
                  width: "100%",
                  fontSize: 15,
                  textTransform: "uppercase",
                  color: n.bg ? n.bg : "var(--text)",
                  fontWeight: n.active || n.bg ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {n.l}
              </button>
            ))}
            <button
              onClick={() => {
                if (session) logout();
                else go("account");
                close();
              }}
              style={{
                marginTop: 14,
                minHeight: 46,
                border: "1px solid var(--text)",
                background: "none",
                borderRadius: 4,
                fontSize: 14,
                textTransform: "uppercase",
                color: "var(--text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {session ? <LogOut size={16} aria-hidden="true" /> : <User size={16} aria-hidden="true" />}
              {session ? `Se déconnecter (${session.name.split(" ")[0]})` : "Se connecter"}
            </button>
          </nav>
        )}
      </header>
    </>
  );
}

// Bouton panier : sac avec pastille du nombre d'articles, qui rebondit à chaque ajout
function CartButton({ count, onClick, style }) {
  const prev = useRef(count);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (count > prev.current) setBump((b) => b + 1);
    prev.current = count;
  }, [count]);
  return (
    <button
      onClick={onClick}
      aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}
      style={{ ...style, position: "relative" }}
    >
      <span
        key={`i${bump}`}
        style={{
          display: "flex",
          animation: bump ? "cartBump .5s cubic-bezier(.3,1.6,.5,1)" : "none",
        }}
      >
        <ShoppingBag size={24} strokeWidth={1.6} aria-hidden="true" />
      </span>
      {count > 0 && (
        <span
          key={`c${bump}`}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 4,
            right: 2,
            minWidth: 18,
            height: 18,
            padding: "0 5px",
            borderRadius: 999,
            background: "var(--gold-text)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: "18px",
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
            animation: bump ? "countPop .35s ease-out" : "none",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
