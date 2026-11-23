import { Save } from "lucide-react";
import { useState } from "react";
import { Btn, Field, Panel } from "../../components/ui.jsx";
import { CONTACT_WHATSAPP_NUMBER } from "../../config/shop.js";
import { useIsMobile } from "../../hooks/browser.js";
import { fmt } from "../../lib/currency.js";
import { waLink } from "../../lib/whatsapp.js";
import { useStore } from "../../store/ShopStore.jsx";

export function TabSettings({ openInventory }) {
  const { settings, updateSettings } = useStore();
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState({ ...settings });
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2 style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 400 }}>
          Paramètres de la boutique
        </h2>
        <Btn onClick={() => updateSettings(draft)}>
          <Save size={13} />
          Enregistrer tout
        </Btn>
        {openInventory && <Btn v="ghost" sz="sm" onClick={() => openInventory("Paramètres")}>Paramètres du suivi</Btn>}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
        }}
      >
        <Panel>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 17,
              marginBottom: 18,
              color: "var(--gold)",
            }}
          >
            Identité
          </div>
          <Field
            label="Nom de la boutique"
            value={draft.shopName}
            onChange={(v) => set("shopName", v)}
            placeholder="DIHU"
          />
          <Field
            label="Sous-titre"
            value={draft.tagline}
            onChange={(v) => set("tagline", v)}
            placeholder="Maison de Parfums"
          />
          <Field
            label="Ville"
            value={draft.city}
            onChange={(v) => set("city", v)}
            placeholder="Douala, Cameroun"
          />
          <Field
            label="Copyright"
            value={draft.copyright}
            onChange={(v) => set("copyright", v)}
            placeholder="© 2026 ..."
          />
        </Panel>
        <Panel>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 17,
              marginBottom: 18,
              color: "var(--gold)",
            }}
          >
            WhatsApp & Contact
          </div>
          <Field
            label="Numéro WhatsApp (sans + ni espaces)"
            value={draft.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            placeholder={CONTACT_WHATSAPP_NUMBER}
          />
          <div
            style={{
              marginTop: 4,
              padding: "10px 13px",
              background: "var(--surf2)",
              borderRadius: 5,
            }}
          >
            <div
              style={{ fontSize: 10, color: "var(--muted)", marginBottom: 5 }}
            >
              Aperçu lien
            </div>
            <a
              href={waLink(draft.whatsapp)}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: "#1a7a3a", wordBreak: "break-all" }}
            >
              {waLink(draft.whatsapp)}
            </a>
          </div>
        </Panel>
        <Panel style={{ gridColumn: "1/-1" }}>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 17,
              marginBottom: 18,
              color: "var(--gold)",
            }}
          >
            Page d'accueil (Hero)
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "0 20px",
            }}
          >
            <div>
              <Field
                label="Label au-dessus du titre"
                value={draft.heroLabel}
                onChange={(v) => set("heroLabel", v)}
                placeholder="Collection Exclusive · Cameroun"
              />
              <Field
                label="Titre principal"
                value={draft.heroTitle}
                onChange={(v) => set("heroTitle", v)}
                placeholder="L'Art du Parfum Rare"
              />
            </div>
            <Field
              label="Sous-titre / description"
              value={draft.heroSubtitle}
              onChange={(v) => set("heroSubtitle", v)}
              placeholder="Description..."
              multiline
            />
          </div>
        </Panel>
        <Panel>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 17,
              marginBottom: 18,
              color: "var(--gold)",
            }}
          >
            Règles — Paiement en tranches
          </div>
          <Field
            label={`Commandes minimum requises (actuellement : ${draft.installMinOrders})`}
            value={String(draft.installMinOrders)}
            onChange={(v) => set("installMinOrders", parseInt(v) || 0)}
            type="number"
          />
          <Field
            label={`Prix minimum produit XAF (actuellement : ${fmt(draft.installMinPrice)})`}
            value={String(draft.installMinPrice)}
            onChange={(v) => set("installMinPrice", parseInt(v) || 0)}
            type="number"
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              lineHeight: 1.75,
              padding: "10px 13px",
              background: "var(--surf2)",
              borderRadius: 5,
              marginTop: 4,
            }}
          >
            Paiement en tranches proposé après{" "}
            <strong>{draft.installMinOrders}</strong> commandes livrées, sur
            produits dépassant <strong>{fmt(draft.installMinPrice)}</strong>.
          </div>
        </Panel>
      </div>
    </div>
  );
}
