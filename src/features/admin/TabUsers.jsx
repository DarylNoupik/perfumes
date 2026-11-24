import { Layers } from "lucide-react";
import { Badge } from "../../components/ui.jsx";
import { useStore } from "../../store/ShopStore.jsx";

export function TabUsers() {
  const { users, orders, settings } = useStore();
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
        Utilisateurs ({users.length})
      </h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              {[
                "Nom",
                "Email",
                "Téléphone",
                "Rôle",
                "Inscrit le",
                "Commandes (livrées)",
                "Tranches",
              ].map((c) => (
                <th
                  key={c}
                  style={{
                    textAlign: "left",
                    padding: "9px 12px",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const uo = orders.filter((o) => o.clientId === u.id);
              const ud = uo.filter((o) => o.status === "livré").length;
              const el = u.role === "client" && ud >= settings.installMinOrders;
              return (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surf2)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {u.name}
                      {el && <Layers size={11} color="var(--gold)" />}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {u.email}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {u.phone}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>
                    <Badge
                      c={
                        u.role === "admin"
                          ? "gold"
                          : u.role === "vendor"
                            ? "blue"
                            : "green"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 11,
                      color: "var(--muted)",
                    }}
                  >
                    {u.createdAt}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>
                    {uo.length} ({ud} livrée{ud > 1 ? "s" : ""})
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>
                    {el ? (
                      <Badge c="gold">✓ Éligible</Badge>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>
                        {ud}/{settings.installMinOrders}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
