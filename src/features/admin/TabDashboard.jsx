import { Btn, Panel, sbadge } from "../../components/ui.jsx";
import { fmt } from "../../lib/currency.js";
import { inventoryReport, orderSalePrice, stockStatus } from "../../store/inventory.js";
import { useStore } from "../../store/ShopStore.jsx";

export function TabDashboard({ openInventory }) {
  const { inventory, products, orders } = useStore();
  const report = openInventory ? inventoryReport(inventory).total : null;
  const stats = {
    ca: orders
      .filter((o) => o.status === "livré")
      .reduce((s, o) => s + o.total, 0),
    total: orders.length,
    pend: orders.filter((o) => ["en attente", "en cours"].includes(o.status))
      .length,
    low: products.filter((p) => stockStatus(p.stock, inventory.lowStockThreshold).color === "orange").length,
    out: products.filter((p) => stockStatus(p.stock, inventory.lowStockThreshold).color === "red").length,
  };
  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--fd)",
          fontSize: 30,
          marginBottom: 28,
          fontWeight: 400,
        }}
      >
        Vue d'ensemble
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 14,
          marginBottom: 36,
        }}
      >
        {[
          {
            l: "Chiffre d’affaires réalisé",
            v: fmt(report?.revenue ?? stats.ca),
            c: "var(--gold)",
            d: report ? `${report.sold} flacon(s) vendus · Journal des ventes` : "Commandes livrées",
          },
          ...(report ? [
            { l: "Bénéfice sur ventes à coût connu", v: fmt(report.profit), c: "var(--gold)", d: report.missingSaleCost ? "Calcul partiel" : "Prix réels − coût des ventes" },
            { l: "CA prévisionnel du stock", v: fmt(report.remainingRevenue), c: "var(--text)", d: `${report.stock} flacon(s) disponibles` },
          ] : []),
          {
            l: "Total commandes",
            v: stats.total,
            c: "var(--text)",
            d: "Toutes périodes",
          },
          { l: "En attente", v: stats.pend, c: "#e65100", d: "À traiter" },
          {
            l: "Stock faible",
            v: stats.low,
            c: stats.low > 0 ? "#c62828" : "#3d8b40",
            d: `Seuil : ${inventory.lowStockThreshold} · ${stats.out} référence(s) épuisée(s)`,
          },
        ].map((s) => (
          <Panel key={s.l} style={{ padding: 18 }}>
            <div
              style={{ fontSize: 10, color: "var(--muted)", marginBottom: 7 }}
            >
              {s.l}
            </div>
            <div
              style={{
                fontFamily: "var(--fd)",
                fontSize: 26,
                color: s.c,
                marginBottom: 3,
              }}
            >
              {s.v}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.d}</div>
          </Panel>
        ))}
      </div>
      {openInventory && (
        <div className="admin-shortcuts">
          <Btn sz="sm" onClick={() => openInventory("Ventes")}>Journal des ventes</Btn>
          <Btn sz="sm" v="ghost" onClick={() => openInventory("Rentabilité")}>Rentabilité</Btn>
          <Btn sz="sm" v="ghost" onClick={() => openInventory("Stock")}>Stock disponible</Btn>
        </div>
      )}
      <h3
        style={{
          fontFamily: "var(--fd)",
          fontSize: 20,
          marginBottom: 14,
          fontWeight: 400,
        }}
      >
        Dernières commandes
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {orders.slice(0, 5).map((o) => (
          <Panel
            key={o.id}
            style={{
              padding: "11px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13 }}>
              <strong>{o.id}</strong> · {o.clientName}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {sbadge(o.status)}
              <span
                style={{
                  fontFamily: "var(--fd)",
                  color: "var(--gold)",
                  fontSize: 16,
                }}
              >
                {fmt(openInventory && o.status === "livré" && o.items.some((item) => item.actualPrice != null)
                  ? o.items.reduce((sum, item) => sum + orderSalePrice(item) * item.qty, 0)
                  : o.total)}
              </span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
