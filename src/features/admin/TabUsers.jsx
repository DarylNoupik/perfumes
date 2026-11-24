import { Check, Layers, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Badge, Btn } from "../../components/ui.jsx";
import { useStore } from "../../store/ShopStore.jsx";

const ROLES = [
  { k: "client", l: "Client", c: "green" },
  { k: "vendor", l: "Vendeur", c: "blue" },
  { k: "admin", l: "Admin", c: "gold" },
];
const roleOf = (k) => ROLES.find((r) => r.k === k) ?? { k, l: k, c: "green" };

const cell = { padding: "10px 12px", fontSize: 12 };
const input = {
  width: "100%",
  minWidth: 120,
  height: 36,
  padding: "0 10px",
  border: "1px solid var(--border)",
  borderRadius: 4,
  background: "#fff",
  color: "var(--text)",
  fontSize: 14,
};

export function TabUsers() {
  const { users, orders, settings, session, updateUser } = useStore();
  const [editing, setEditing] = useState(null); // { id, name, phone, role }
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const ok = await updateUser(editing.id, editing);
    setSaving(false);
    if (ok) setEditing(null);
  };
  const set = (k) => (e) => setEditing((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--fb)",
          fontSize: 30,
          marginBottom: 8,
          fontWeight: 400,
        }}
      >
        Utilisateurs ({users.length})
      </h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
        Un changement de rôle s'applique quand la personne se reconnecte (ou au
        plus tard dans l'heure).
      </p>
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
                "",
              ].map((c, i) => (
                <th
                  key={i}
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
              const edit = editing?.id === u.id ? editing : null;
              const isMe = u.id === session?.id;
              const role = roleOf(u.role);
              return (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: edit ? "var(--surf2)" : undefined,
                  }}
                >
                  <td style={cell}>
                    {edit ? (
                      <input
                        value={edit.name}
                        onChange={set("name")}
                        aria-label={`Nom de ${u.email}`}
                        style={input}
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {u.name}
                        {isMe && <span style={{ color: "var(--muted)" }}>(toi)</span>}
                        {el && <Layers size={11} color="var(--gold)" aria-label="Éligible aux tranches" />}
                      </div>
                    )}
                  </td>
                  <td style={{ ...cell, color: "var(--muted)" }}>{u.email}</td>
                  <td style={{ ...cell, color: "var(--muted)" }}>
                    {edit ? (
                      <input
                        type="tel"
                        value={edit.phone}
                        onChange={set("phone")}
                        aria-label={`Téléphone de ${u.email}`}
                        style={input}
                      />
                    ) : (
                      u.phone
                    )}
                  </td>
                  <td style={cell}>
                    {edit ? (
                      <select
                        value={edit.role}
                        onChange={set("role")}
                        aria-label={`Rôle de ${u.email}`}
                        style={{ ...input, minWidth: 110 }}
                      >
                        {ROLES.map((r) => (
                          <option key={r.k} value={r.k} disabled={isMe && r.k !== "admin"}>
                            {r.l}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge c={role.c}>{role.l}</Badge>
                    )}
                  </td>
                  <td style={{ ...cell, fontSize: 11, color: "var(--muted)" }}>{u.createdAt}</td>
                  <td style={cell}>
                    {uo.length} ({ud} livrée{ud > 1 ? "s" : ""})
                  </td>
                  <td style={cell}>
                    {el ? (
                      <Badge c="gold">✓ Éligible</Badge>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>
                        {ud}/{settings.installMinOrders}
                      </span>
                    )}
                  </td>
                  <td style={{ ...cell, whiteSpace: "nowrap" }}>
                    {edit ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn
                          sz="sm"
                          onClick={save}
                          disabled={saving}
                          ariaLabel={`Enregistrer ${u.email}`}
                          style={{ minHeight: 36 }}
                        >
                          <Check size={13} aria-hidden="true" />
                          {saving ? "…" : "Enregistrer"}
                        </Btn>
                        <Btn
                          v="ghost"
                          sz="sm"
                          onClick={() => setEditing(null)}
                          disabled={saving}
                          ariaLabel="Annuler la modification"
                          style={{ minHeight: 36 }}
                        >
                          <X size={13} aria-hidden="true" />
                        </Btn>
                      </div>
                    ) : (
                      <Btn
                        v="ghost"
                        sz="sm"
                        onClick={() =>
                          setEditing({ id: u.id, name: u.name ?? "", phone: u.phone ?? "", role: u.role })
                        }
                        disabled={saving}
                        ariaLabel={`Modifier ${u.name}`}
                        style={{ minHeight: 36 }}
                      >
                        <Pencil size={13} aria-hidden="true" />
                        Modifier
                      </Btn>
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
