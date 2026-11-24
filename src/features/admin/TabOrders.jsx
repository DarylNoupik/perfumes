import { MessageCircle } from "lucide-react";
import { Badge, Btn, Panel, sbadge } from "../../components/ui.jsx";
import { fmt } from "../../lib/currency.js";
import { waLink } from "../../lib/whatsapp.js";
import { orderSalePrice } from "../../store/inventory.js";
import { useStore } from "../../store/ShopStore.jsx";

export function TabOrders({ openInventory }) {
  const { orders, updateOrderStatus, settings } = useStore();
  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--fb)",
          fontSize: 30,
          marginBottom: 20,
          fontWeight: 400,
        }}
      >
        Commandes ({orders.length})
      </h2>
      {openInventory && (
        <div className="admin-shortcuts">
          <Btn v="ghost" sz="sm" onClick={() => openInventory("Ventes")}>Ouvrir le journal des ventes</Btn>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {orders.map((o) => (
          <Panel key={o.id} style={{ padding: "14px 18px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontFamily: "var(--fb)", fontSize: 15 }}>
                    {o.id}
                  </span>
                  {sbadge(o.status)}
                  {o.installment && <Badge c="gold">Tranches</Badge>}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 3,
                  }}
                >
                  {o.clientName} · {o.clientPhone} · {o.date}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 4,
                  }}
                >
                  {o.paymentMethod}
                </div>
                <div style={{ fontSize: 11 }}>
                  {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--fb)",
                    fontSize: 20,
                    color: "var(--gold)",
                  }}
                >
                  {fmt(o.total)}
                </div>
                {openInventory && o.status === "livré" && o.items.some((item) => item.actualPrice != null) && (
                  <div className="admin-secondary">
                    Réalisé dans le suivi : {fmt(o.items.reduce((sum, item) => sum + orderSalePrice(item) * item.qty, 0))}
                  </div>
                )}
                {o.installment && o.installmentPlan && (
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    {fmt(o.installmentPlan.perPart)} × {o.installmentPlan.parts}{" "}
                    tranches
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  {["en attente", "en cours", "livré", "annulé"]
                    .filter((s) => s !== o.status)
                    .map((s) => (
                      <Btn
                        key={s}
                        sz="sm"
                        v="ghost"
                        onClick={() => updateOrderStatus(o.id, s)}
                        style={{ fontSize: 10, padding: "4px 9px" }}
                      >
                        → {s}
                      </Btn>
                    ))}
                  <a
                    href={waLink(
                      o.clientPhone,
                      `Bonjour ${o.clientName}, votre commande ${o.id} est en cours de traitement.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "rgba(37,211,102,.1)",
                      border: "1px solid rgba(37,211,102,.3)",
                      color: "#1a7a3a",
                      padding: "4px 9px",
                      borderRadius: 3,
                      fontSize: 10,
                      textDecoration: "none",
                    }}
                  >
                    <MessageCircle size={10} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </Panel>
        ))}
        {orders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 64,
              color: "var(--muted)",
              fontFamily: "var(--fb)",
              fontSize: 20,
            }}
          >
            Aucune commande
          </div>
        )}
      </div>
    </div>
  );
}
