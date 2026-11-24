import { ArrowLeft, Check, Layers, LogIn } from "lucide-react";
import { useRef, useState } from "react";
import { Btn, Field, Panel } from "../../components/ui.jsx";
import { fmt } from "../../lib/currency.js";
import { waLink } from "../../lib/whatsapp.js";
import { useStore } from "../../store/ShopStore.jsx";

// Modes de paiement proposés. Mobile Money est masqué pour le lancement :
// passer enabled à true pour le réafficher.
const PAYMENT_OPTIONS = [
  { k: "momo", label: "Mobile Money (MTN / Orange)", icon: "📱", enabled: false },
  { k: "whatsapp", label: "Finaliser sur WhatsApp", icon: "💬", enabled: true },
].filter((m) => m.enabled);

export function CheckoutPage({ nav }) {
  const { cart, cartTotal, session, settings, placeOrder, canInstall } =
    useStore();
  const [name, setName] = useState(session?.name || "");
  const [phone, setPhone] = useState(session?.phone || "");
  const [address, setAddress] = useState("");
  const [pay, setPay] = useState(PAYMENT_OPTIONS[0].k);
  const [inst, setInst] = useState(false);
  const [saving, setSaving] = useState(false);
  const [missing, setMissing] = useState([]);
  const submitting = useRef(false);
  const canInst = cart.some((i) => canInstall(i));
  const parts = Math.max(2, settings.installMinOrders);
  const part = Math.ceil(cartTotal / parts);
  const confirm = async () => {
    if (submitting.current) return;
    const empty = [
      [name, "ton nom"],
      [phone, "ton téléphone"],
      [address, "ton adresse"],
    ]
      .filter(([v]) => !v.trim())
      .map(([, l]) => l);
    setMissing(empty);
    if (empty.length) return;
    submitting.current = true;
    setSaving(true);
    // Fenêtre ouverte tout de suite pendant le clic, sinon le navigateur
    // bloque l'ouverture qui arrive après l'enregistrement de la commande
    const viaWhatsApp = pay === "whatsapp";
    const waWindow = viaWhatsApp ? window.open("", "_blank") : null;
    const lines = cart.map((i) => `- ${i.name} x${i.qty} : ${fmt(i.price * i.qty)}`);
    const total = cartTotal;
    try {
      const saved = await placeOrder(
        pay === "momo" ? "Mobile Money" : "WhatsApp",
        inst && canInst,
        inst && canInst
          ? {
              total: cartTotal,
              perPart: part,
              parts,
              paidCount: 1,
            }
          : null,
        { name, phone, address },
      );
      if (saved && viaWhatsApp) {
        const ref = typeof saved === "string" ? `Commande n° ${saved}\n` : "";
        const msg = [
          "Bonjour, je viens de passer commande sur le site.",
          ref + lines.join("\n"),
          `Total : ${fmt(total)}`,
          `Nom : ${name.trim()}\nTéléphone : ${phone.trim()}\nAdresse : ${address.trim()}`,
        ].join("\n\n");
        const link = waLink(settings.whatsapp, msg);
        if (waWindow) waWindow.location.href = link;
        else window.location.href = link;
      } else waWindow?.close();
      if (saved) nav("account");
    } catch (failure) {
      waWindow?.close();
      throw failure;
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  return (
    <div style={{ maxWidth: 600, margin: "56px auto", padding: "0 24px" }}>
      <Btn
        v="ghost"
        sz="sm"
        onClick={() => nav("cart")}
        style={{ marginBottom: 22 }}
      >
        <ArrowLeft size={13} />
        Retour
      </Btn>
      <h2 style={{ fontFamily: "var(--fb)", fontSize: 34, marginBottom: 28 }}>
        Finaliser la commande
      </h2>
      <Panel style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 12,
          }}
        >
          Récapitulatif
        </div>
        {cart.map((i) => (
          <div
            key={i.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 0",
              borderBottom: "1px solid var(--border)",
              fontSize: 12,
            }}
          >
            <span>
              {i.name} × {i.qty}
            </span>
            <span style={{ color: "var(--gold)" }}>{fmt(i.price * i.qty)}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 10,
            fontFamily: "var(--fb)",
            fontSize: 19,
          }}
        >
          <span>Total</span>
          <span style={{ color: "var(--gold)" }}>{fmt(cartTotal)}</span>
        </div>
      </Panel>
      <Panel style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 14,
          }}
        >
          Livraison
        </div>
        <Field
          label="Nom complet"
          value={name}
          onChange={setName}
          placeholder="KONGNE Gilbert"
          req
        />
        <Field
          label="Téléphone"
          value={phone}
          onChange={setPhone}
          type="tel"
          placeholder="+237 6XX XXX XXX"
          req
        />
        <Field
          label="Adresse"
          value={address}
          onChange={setAddress}
          placeholder="Quartier, ville"
          req
        />
      </Panel>
      <Panel style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 14,
          }}
        >
          Paiement
        </div>
        {pay === "whatsapp" && (
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
            Après la confirmation, WhatsApp s'ouvre avec le récapitulatif de ta
            commande. Il te suffit d'appuyer sur Envoyer, et on règle le paiement
            et la livraison avec toi dans la conversation.
          </p>
        )}
        {PAYMENT_OPTIONS.map((m) => (
          <div
            key={m.k}
            onClick={() => setPay(m.k)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 14px",
              background: pay === m.k ? "var(--gold-dim)" : "var(--surf2)",
              border: `1px solid ${pay === m.k ? "rgba(154,110,46,.38)" : "var(--border)"}`,
              borderRadius: 5,
              cursor: "pointer",
              marginBottom: 7,
              transition: "all .15s",
            }}
          >
            <span style={{ fontSize: 18 }}>{m.icon}</span>
            <span style={{ fontSize: 12, flex: 1 }}>{m.label}</span>
            {pay === m.k && <Check size={13} color="var(--gold)" />}
          </div>
        ))}
      </Panel>
      {canInst && (
        <Panel
          style={{
            marginBottom: 18,
            background: "rgba(154,110,46,.03)",
            borderColor: "rgba(154,110,46,.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <Layers size={16} color="var(--gold)" />
            <div style={{ flex: 1 }}>
              <div
                style={{ fontSize: 12, fontWeight: 500, color: "var(--gold-text)" }}
              >
                Paiement en {settings.installMinOrders} fois
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Client fidèle
              </div>
            </div>
            <div
              onClick={() => setInst(!inst)}
              style={{
                width: 42,
                height: 22,
                background: inst ? "var(--gold)" : "#ddd",
                borderRadius: 11,
                cursor: "pointer",
                position: "relative",
                transition: "background .2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: inst ? 22 : 3,
                  width: 16,
                  height: 16,
                  background: "white",
                  borderRadius: "50%",
                  transition: "left .2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }}
              />
            </div>
          </div>
          {inst && (
            <div
              style={{
                background: "var(--surf2)",
                borderRadius: 5,
                padding: 12,
              }}
            >
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 0",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "var(--muted)" }}>
                    Tranche {n} {n === 1 ? "(maintenant)" : "(à planifier)"}
                  </span>
                  <span
                    style={{
                      color: n === 1 ? "var(--gold)" : "var(--muted)",
                      fontFamily: "var(--fb)",
                      fontSize: 15,
                    }}
                  >
                    {fmt(part)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
      {!session && (
        <Panel style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
            Connecte-toi ou crée un compte pour valider ta commande. Ton panier
            reste enregistré.
          </p>
          <Btn v="outline" onClick={() => nav("account")}>
            <LogIn size={14} aria-hidden="true" />
            Se connecter
          </Btn>
        </Panel>
      )}
      {missing.length > 0 && (
        <p role="alert" style={{ color: "#c62828", fontSize: 14, marginBottom: 12 }}>
          Il manque {missing.join(", ")}.
        </p>
      )}
      <Btn sz="lg" full onClick={confirm} disabled={saving || !session || !cart.length}>
        <Check size={15} />
        {saving
          ? "Enregistrement…"
          : pay === "whatsapp"
            ? "Confirmer et envoyer sur WhatsApp"
            : "Confirmer la commande"}
      </Btn>
    </div>
  );
}
