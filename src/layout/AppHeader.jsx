import { LogIn, LogOut, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { a11yClick } from "../components/accessibility.js";
import { Btn } from "../components/ui.jsx";
import { useIsMobile } from "../hooks/browser.js";
import { useStore } from "../store/ShopStore.jsx";

export function AppHeader({ view, nav }) {
  const { logout, session, settings, cartCount } = useStore();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = session?.role === "admin" || session?.role === "vendor";
  const navLinks = [
    { l: "Boutique", v: "shop" },
    { l: "Conseils", v: "conseils" },
    { l: "Mon Compte", v: "account" },
    ...(isAdmin ? [{ l: "Dashboard", v: "admin" }] : []),
  ];
  const handleNav = (v) => {
    nav(v);
    setMenuOpen(false);
  };
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(250,247,242,.93)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 22px rgba(120,90,50,.06)",
      }}
    >
      <div
        style={{
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 16px" : "0 28px",
          gap: 12,
        }}
      >
        {/* Logo */}
        <div
          {...a11yClick(() => handleNav("shop"), `${settings.shopName}, retour à l'accueil`)}
          style={{ cursor: "pointer", lineHeight: 1, flexShrink: 0, borderRadius: 4 }}
        >
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: isMobile ? 18 : 21,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "var(--gold-text)",
            }}
          >
            {settings.shopName}
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: isMobile ? "0.16em" : "0.3em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginTop: 1,
            }}
          >
            {settings.tagline}
          </div>
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {navLinks.map((n) => (
              <button
                key={n.v}
                onClick={() => nav(n.v)}
                aria-current={view === n.v ? "page" : undefined}
                style={{
                  background: "none",
                  border: "none",
                  padding: "12px 2px",
                  fontFamily: "var(--fb)",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: view === n.v ? "var(--gold-text)" : "var(--muted)",
                  cursor: "pointer",
                  transition: "color .15s",
                }}
              >
                {n.l}
              </button>
            ))}
            {session ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {session.name.split(" ")[0]}
                </span>
                <Btn sz="sm" v="ghost" onClick={logout}>
                  <LogOut size={13} />
                  Sortir
                </Btn>
              </div>
            ) : (
              <Btn sz="sm" v="outline" onClick={() => nav("account")}>
                <LogIn size={13} />
                Connexion
              </Btn>
            )}
            <CartButton count={cartCount} onClick={() => nav("cart")} />
          </nav>
        )}

        {/* Mobile : panier + hamburger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CartButton count={cartCount} onClick={() => handleNav("cart")} />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: 6,
                width: 44,
                height: 44,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text)",
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <nav
          id="menu-mobile"
          aria-label="Menu principal"
          style={{
            borderTop: "1px solid var(--border)",
            background: "rgba(250,247,242,.97)",
            padding: "12px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            animation: "fadeSlide .2s ease",
          }}
        >
          {navLinks.map((n) => (
            <button
              key={n.v}
              onClick={() => handleNav(n.v)}
              aria-current={view === n.v ? "page" : undefined}
              style={{
                padding: "13px 14px",
                borderRadius: 5,
                border: "none",
                textAlign: "left",
                width: "100%",
                fontFamily: "var(--fb)",
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: view === n.v ? "var(--gold-dim)" : "transparent",
                color: view === n.v ? "var(--gold-text)" : "var(--text)",
                cursor: "pointer",
                fontWeight: view === n.v ? 500 : 400,
              }}
            >
              {n.l}
            </button>
          ))}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              marginTop: 6,
              paddingTop: 10,
            }}
          >
            {session ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 14px",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {session.name.split(" ")[0]}
                </span>
                <Btn
                  sz="sm"
                  v="ghost"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  <LogOut size={13} />
                  Sortir
                </Btn>
              </div>
            ) : (
              <Btn
                sz="md"
                v="outline"
                full
                onClick={() => handleNav("account")}
              >
                <LogIn size={13} />
                Connexion
              </Btn>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

// Bouton panier : l'icône rebondit et le chiffre s'anime à chaque ajout
function CartButton({ count, onClick }) {
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
      style={{
        cursor: "pointer",
        position: "relative",
        minHeight: 44,
        minWidth: 44,
        padding: "0 13px",
        background: "var(--surf)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        color: "var(--text)",
        fontFamily: "var(--fb)",
      }}
    >
      <span
        key={`i${bump}`}
        style={{
          display: "flex",
          animation: bump ? "cartBump .5s cubic-bezier(.3,1.6,.5,1)" : "none",
        }}
      >
        <ShoppingBag size={16} color="var(--gold)" aria-hidden="true" />
      </span>
      <span
        key={`c${bump}`}
        aria-hidden="true"
        style={{
          fontSize: 13,
          fontVariantNumeric: "tabular-nums",
          display: "inline-block",
          animation: bump ? "countPop .35s ease-out" : "none",
        }}
      >
        {count}
      </span>
      {count > 0 && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 8,
            height: 8,
            background: "var(--gold)",
            borderRadius: "50%",
          }}
        />
      )}
    </button>
  );
}
