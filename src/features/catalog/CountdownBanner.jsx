import { useCountdown, useIsMobile } from "../../hooks/browser.js";
import { useStore } from "../../store/ShopStore.jsx";

// ── Bannière compte à rebours ──────────────────────────────────────────────────
export function CountdownBanner() {
  const { settings } = useStore();
  const isMobile = useIsMobile();
  const t = useCountdown(settings.promoEndDate);
  if (!t) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div
      style={{
        background: "var(--text)",
        padding: isMobile ? "16px 16px" : "18px 24px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "rgba(255,255,255,.75)",
          fontSize: isMobile ? 12 : 12,
          letterSpacing: "0.08em",
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        {settings.promoLabel}
      </p>
      <div
        style={{
          display: "flex",
          gap: isMobile ? 10 : 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {[
          { v: t.days, l: "Jours" },
          { v: t.hours, l: "Heures" },
          { v: t.minutes, l: "Min" },
          { v: t.seconds, l: "Sec" },
        ].map(({ v, l }, i) => (
          <div
            key={l}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 10 : 20,
            }}
          >
            {i > 0 && (
              <span
                style={{
                  color: "var(--gold-l)",
                  fontSize: isMobile ? 20 : 26,
                  fontFamily: "var(--fb)",
                  lineHeight: 1,
                  marginRight: isMobile ? -6 : -12,
                }}
              >
                :
              </span>
            )}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--fb)",
                  fontSize: isMobile ? 28 : 38,
                  color: "var(--gold-l)",
                  fontWeight: 600,
                  lineHeight: 1,
                  minWidth: isMobile ? 38 : 52,
                }}
              >
                {pad(v)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.4)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                {l}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
