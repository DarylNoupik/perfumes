import { useEffect, useState } from "react";
import { AccountPage } from "./features/account/AccountPage.jsx";
import { AdminPage } from "./features/admin/AdminPage.jsx";
import { ConseilsPage } from "./features/advice/ConseilsPage.jsx";
import { CartPage } from "./features/cart/CartPage.jsx";
import { CheckoutPage } from "./features/cart/CheckoutPage.jsx";
import { ProductPage } from "./features/catalog/ProductPage.jsx";
import { ShopPage } from "./features/catalog/ShopPage.jsx";
import { useIsMobile } from "./hooks/browser.js";
import { AppHeader } from "./layout/AppHeader.jsx";
import { FloatingWhatsApp } from "./layout/FloatingWhatsApp.jsx";
import { StoreProvider, useStore } from "./store/ShopStore.jsx";

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { toast, session, settings, cartCount } = useStore();
  const isMobile = useIsMobile();
  const [view, setView] = useState("shop");
  const [selProduct, setSelProduct] = useState(null);
  // Recherche / marque / section demandée depuis l'en-tête, appliquée par la boutique
  const [shopFocus, setShopFocus] = useState(null);
  const nav = (v, focus = null) => {
    setShopFocus(focus);
    setView(v);
    if (v !== "product") setSelProduct(null);
  };
  const browse = ({ q = "", cat = "Tous", anchor = "catalogue" } = {}) =>
    nav("shop", { q, cat, anchor, key: Date.now() });
  const openProduct = (p) => {
    setSelProduct(p);
    setView("product");
  };
  // Chaque changement de page repart du haut
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selProduct]);
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: isMobile ? "auto" : 18,
            bottom: isMobile ? 18 : "auto",
            right: isMobile ? 12 : 18,
            left: isMobile ? 12 : "auto",
            zIndex: 9999,
            background: toast.type === "err" ? "#fff0ee" : "#fffdf7",
            border: `1px solid ${toast.type === "err" ? "rgba(229,57,53,.35)" : "rgba(154,110,46,.35)"}`,
            color: toast.type === "err" ? "#c62828" : "var(--text)",
            padding: "11px 18px",
            borderRadius: 6,
            fontSize: 13,
            boxShadow: "0 8px 32px rgba(42,33,24,.12)",
            animation: "fadeSlide .25s ease",
            maxWidth: isMobile ? "100%" : 290,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {toast.msg}
        </div>
      )}
      <AppHeader view={view} nav={nav} onBrowse={browse} />
      <main
        key={`${view}-${selProduct?.id ?? ""}`}
        style={{ animation: "pageIn .2s ease-out" }}
      >
        {view === "shop" && (
          <ShopPage
            onView={openProduct}
            onConseils={() => nav("conseils")}
            focus={shopFocus}
          />
        )}
        {view === "conseils" && <ConseilsPage onView={openProduct} />}
        {view === "product" && selProduct && (
          <ProductPage product={selProduct} onBack={() => nav("shop")} />
        )}
        {view === "cart" && <CartPage nav={nav} />}
        {view === "checkout" && <CheckoutPage nav={nav} />}
        {view === "account" && <AccountPage nav={nav} />}
        {view === "admin" &&
          (session?.role === "admin" || session?.role === "vendor") && (
            <AdminPage />
          )}
      </main>
      <FloatingWhatsApp />
    </div>
  );
}
