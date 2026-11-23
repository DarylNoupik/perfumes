import { ChevronRight, ShoppingBag, X } from "lucide-react";
import { Btn, Panel } from "../../components/ui.jsx";
import { useIsMobile } from "../../hooks/browser.js";
import { fmt } from "../../lib/currency.js";
import { useStore } from "../../store/ShopStore.jsx";

export function CartPage({ nav }) {
  const { cart, removeFromCart, cartTotal } = useStore();
  const isMobile = useIsMobile();
  if (!cart.length)
    return (
      <div style={{ textAlign: "center", padding: "110px 24px" }}>
        <ShoppingBag
          size={46}
          color="var(--muted)"
          style={{ margin: "0 auto 22px", display: "block" }}
        />
        <h2
          style={{
            fontFamily: "var(--fd)",
            fontSize: 28,
            color: "var(--muted)",
            marginBottom: 6,
          }}
        >
          Votre panier est vide
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22 }}>
          Explorez notre collection.
        </p>
        <Btn onClick={() => nav("shop")}>Retour à la boutique</Btn>
      </div>
    );
  return (
    <div
      style={{
        maxWidth: 740,
        margin: isMobile ? "24px auto" : "56px auto",
        padding: "0 16px",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--fd)",
          fontSize: isMobile ? 26 : 34,
          marginBottom: 22,
        }}
      >
        Votre Panier
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {cart.map((i) => (
          <div
            key={i.id}
            style={{
              background: "var(--surf)",
              border: "1px solid var(--border)",
              borderRadius: 7,
              padding: isMobile ? "12px 14px" : "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 10 : 18,
            }}
          >
            <div style={{ fontSize: 32, flexShrink: 0 }}>
              {i.imgUrl ? (
                <img
                  src={i.imgUrl}
                  style={{ width: 40, height: 40, objectFit: "contain" }}
                  alt=""
                />
              ) : (
                i.img
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--fd)",
                  fontSize: isMobile ? 15 : 17,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {i.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {i.brand} · {i.size} · Qté : {i.qty}
              </div>
              {isMobile && (
                <div
                  style={{
                    fontFamily: "var(--fd)",
                    fontSize: 15,
                    color: "var(--gold-text)",
                    marginTop: 3,
                  }}
                >
                  {fmt(i.price * i.qty)}
                </div>
              )}
            </div>
            {!isMobile && (
              <div
                style={{
                  fontFamily: "var(--fd)",
                  fontSize: 18,
                  color: "var(--gold)",
                  marginRight: 14,
                  flexShrink: 0,
                }}
              >
                {fmt(i.price * i.qty)}
              </div>
            )}
            <button
              onClick={() => removeFromCart(i.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: 4,
                flexShrink: 0,
              }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <Panel>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{ fontSize: 12, color: "var(--muted)", marginBottom: 3 }}
            >
              Total
            </div>
            <div
              style={{
                fontFamily: "var(--fd)",
                fontSize: 30,
                color: "var(--gold)",
              }}
            >
              {fmt(cartTotal)}
            </div>
          </div>
          <Btn sz="lg" onClick={() => nav("checkout")}>
            Commander <ChevronRight size={15} />
          </Btn>
        </div>
      </Panel>
    </div>
  );
}
