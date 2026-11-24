import { Check, Layers, Package } from "lucide-react";
import { useState } from "react";
import { Badge, Btn, Field, Panel, sbadge } from "../../components/ui.jsx";
import { useIsMobile } from "../../hooks/browser.js";
import { fmt } from "../../lib/currency.js";
import { useStore } from "../../store/ShopStore.jsx";

export function AccountPage({ nav }) {
  const {
    session,
    login,
    register,
    requestPasswordReset,
    myOrders,
    deliveredCount,
    settings,
  } = useStore();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const linkBtn = {
    background: "none",
    border: "none",
    padding: "4px 2px",
    color: "var(--gold-text)",
    fontSize: 13,
    cursor: "pointer",
  };
  const submit = async () => {
    if (mode === "login") return login(email, pass);
    if (mode === "register") return register({ name, email, password: pass, phone });
    if (!email.trim()) return;
    if (await requestPasswordReset(email)) setResetSent(true);
  };
  const switchMode = (m) => {
    setMode(m);
    setResetSent(false);
  };
  if (!session)
    return (
      <div style={{ maxWidth: 420, margin: "76px auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 17,
              color: "var(--gold)",
              letterSpacing: "0.22em",
              marginBottom: 7,
            }}
          >
            {settings.shopName}
          </div>
          <h2
            style={{ fontFamily: "var(--fb)", fontSize: 30, fontWeight: 400 }}
          >
            {mode === "login"
              ? "Bienvenue"
              : mode === "register"
                ? "Créer un compte"
                : "Mot de passe oublié"}
          </h2>
          {mode === "forgot" && (
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.6,
                marginTop: 10,
              }}
            >
              Indique l'e-mail de ton compte : on t'envoie un lien pour choisir
              un nouveau mot de passe.
            </p>
          )}
        </div>
        <Panel>
          {mode === "register" && (
            <Field
              label="Nom complet"
              value={name}
              onChange={setName}
              placeholder="KONGNE Gilbert"
              req
            />
          )}
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="vous@exemple.cm"
            req
          />
          {mode !== "forgot" && (
            <Field
              label="Mot de passe"
              value={pass}
              onChange={setPass}
              type="password"
              placeholder="••••••••"
              req
            />
          )}
          {mode === "login" && (
            <div style={{ textAlign: "right", marginTop: -8, marginBottom: 6 }}>
              <button type="button" onClick={() => switchMode("forgot")} style={linkBtn}>
                Mot de passe oublié ?
              </button>
            </div>
          )}
          {mode === "forgot" && resetSent && (
            <p role="status" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
              C'est envoyé. Ouvre l'e-mail et clique sur le lien (pense à
              regarder dans les spams).
            </p>
          )}
          {mode === "register" && (
            <Field
              label="Téléphone"
              value={phone}
              onChange={setPhone}
              placeholder="+237 6XX XXX XXX"
              req
            />
          )}
          <Btn
            sz="lg"
            full
            onClick={submit}
            style={{ marginTop: 8 }}
          >
            {mode === "login"
              ? "Se connecter"
              : mode === "register"
                ? "Créer mon compte"
                : resetSent
                  ? "Renvoyer le lien"
                  : "Envoyer le lien"}
          </Btn>
          <div
            style={{
              textAlign: "center",
              marginTop: 14,
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            {mode === "login" ? "Pas encore de compte ? " : "Déjà client ? "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              style={linkBtn}
            >
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </div>
          <div
            style={{
              marginTop: 18,
              padding: "11px 13px",
              background: "var(--surf2)",
              borderRadius: 5,
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.9,
            }}
          >
            <div
              style={{ color: "var(--gold)", fontWeight: 500, marginBottom: 3 }}
            ></div>
          </div>
        </Panel>
      </div>
    );
  const elig =
    session.role === "client" && deliveredCount >= settings.installMinOrders;
  return (
    <div
      style={{
        maxWidth: 780,
        margin: isMobile ? "24px auto" : "56px auto",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: isMobile ? 20 : 36,
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold-text)",
              marginBottom: 5,
            }}
          >
            Mon Espace
          </div>
          <h2
            style={{ fontFamily: "var(--fb)", fontSize: 34, fontWeight: 400 }}
          >
            Bonjour, {session.name.split(" ")[0]}
          </h2>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
            {session.role === "client"
              ? "Client"
              : session.role === "vendor"
                ? "Vendeur"
                : "Administrateur"}{" "}
            · {session.email}
          </div>
        </div>
        {elig && (
          <Panel
            style={{
              background: "rgba(154,110,46,.05)",
              borderColor: "rgba(154,110,46,.25)",
              padding: "12px 18px",
              textAlign: "center",
            }}
          >
            <Layers
              size={18}
              color="var(--gold)"
              style={{ margin: "0 auto 5px", display: "block" }}
            />
            <div
              style={{ fontSize: 12, color: "var(--gold-text)", fontWeight: 500 }}
            >
              Paiement en tranches
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Client fidèle
            </div>
          </Panel>
        )}
      </div>
      {session.role === "client" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            {
              l: "Commandes",
              v: myOrders.length,
              icon: <Package size={17} color="var(--gold)" />,
            },
            {
              l: "Livrées",
              v: deliveredCount,
              icon: <Check size={17} color="#3d8b40" />,
            },
            {
              l: "Tranches",
              v: elig
                ? "✓ Éligible"
                : `${deliveredCount}/${settings.installMinOrders}`,
              icon: (
                <Layers
                  size={17}
                  color={elig ? "var(--gold)" : "var(--muted)"}
                />
              ),
            },
          ].map((s) => (
            <Panel key={s.l} style={{ textAlign: "center", padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 7,
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--fb)",
                  fontSize: 22,
                  marginBottom: 2,
                }}
              >
                {s.v}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.l}</div>
            </Panel>
          ))}
        </div>
      )}
      <h3 style={{ fontFamily: "var(--fb)", fontSize: 22, marginBottom: 16 }}>
        Mes Commandes
      </h3>
      {myOrders.length === 0 ? (
        <Panel
          style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}
        >
          <Package
            size={34}
            style={{ margin: "0 auto 12px", display: "block", opacity: 0.28 }}
          />
          Aucune commande.
          <div style={{ marginTop: 16 }}>
            <Btn onClick={() => nav("shop")}>Découvrir la boutique</Btn>
          </div>
        </Panel>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myOrders.map((o) => (
            <Panel key={o.id} style={{ padding: "14px 18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--fb)",
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {o.id}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginBottom: 5,
                    }}
                  >
                    {new Date(o.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {o.paymentMethod}
                  </div>
                  {o.items.map((i) => (
                    <span
                      key={i.productId}
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginRight: 10,
                      }}
                    >
                      {i.name} ×{i.qty}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 5,
                  }}
                >
                  {sbadge(o.status)}
                  <div
                    style={{
                      fontFamily: "var(--fb)",
                      fontSize: 17,
                      color: "var(--gold)",
                    }}
                  >
                    {fmt(o.total)}
                  </div>
                  {o.installment && <Badge c="gold">Tranches</Badge>}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
      {!elig &&
        session.role === "client" &&
        deliveredCount < settings.installMinOrders && (
          <Panel
            style={{
              marginTop: 16,
              background: "rgba(154,110,46,.03)",
              borderColor: "rgba(154,110,46,.18)",
              padding: "13px 18px",
            }}
          >
            <div
              style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.75 }}
            >
              💡{" "}
              <strong style={{ color: "var(--gold)" }}>
                Paiement en tranches :
              </strong>{" "}
              Disponible après {settings.installMinOrders} commandes livrées sur
              les produits au-dessus de {fmt(settings.installMinPrice)}. Il vous
              reste{" "}
              <strong>{settings.installMinOrders - deliveredCount}</strong>{" "}
              commande
              {settings.installMinOrders - deliveredCount > 1 ? "s" : ""}.
            </div>
          </Panel>
        )}
    </div>
  );
}
