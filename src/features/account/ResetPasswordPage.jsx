import { useState } from "react";
import { Btn, Field, Panel } from "../../components/ui.jsx";
import { useStore } from "../../store/ShopStore.jsx";

// Affichée quand on arrive depuis le lien « mot de passe oublié » reçu par e-mail
export function ResetPasswordPage() {
  const { updatePassword, cancelRecovery } = useStore();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (pass.length < 8) return setError("Le mot de passe doit faire au moins 8 caractères.");
    if (pass !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setError("");
    setSaving(true);
    await updatePassword(pass);
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "76px auto", padding: "0 24px" }}>
      <h2
        style={{
          fontFamily: "var(--fb)",
          fontSize: 30,
          fontWeight: 400,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        Nouveau mot de passe
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--muted)",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: 28,
        }}
      >
        Choisis un nouveau mot de passe pour ton compte.
      </p>
      <Panel>
        <Field
          label="Nouveau mot de passe"
          value={pass}
          onChange={setPass}
          type="password"
          placeholder="8 caractères minimum"
          req
        />
        <Field
          label="Confirme le mot de passe"
          value={confirm}
          onChange={setConfirm}
          type="password"
          req
        />
        {error && (
          <p role="alert" style={{ color: "#c62828", fontSize: 14, marginBottom: 12 }}>
            {error}
          </p>
        )}
        <Btn sz="lg" full onClick={submit} disabled={saving} style={{ marginTop: 8 }}>
          {saving ? "Enregistrement…" : "Enregistrer le mot de passe"}
        </Btn>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button
            type="button"
            onClick={cancelRecovery}
            style={{
              background: "none",
              border: "none",
              color: "var(--gold-text)",
              fontSize: 13,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Plus tard
          </button>
        </div>
      </Panel>
    </div>
  );
}
