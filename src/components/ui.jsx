export const Badge = ({ children, c = "gold" }) => {
  const m = {
    gold: {
      bg: "rgba(154,110,46,.1)",
      color: "#9A6E2E",
      b: "rgba(154,110,46,.3)",
    },
    green: {
      bg: "rgba(76,175,80,.1)",
      color: "#3d8b40",
      b: "rgba(76,175,80,.3)",
    },
    red: {
      bg: "rgba(229,57,53,.1)",
      color: "#c62828",
      b: "rgba(229,57,53,.3)",
    },
    orange: {
      bg: "rgba(255,152,0,.1)",
      color: "#e65100",
      b: "rgba(255,152,0,.3)",
    },
    blue: {
      bg: "rgba(21,101,192,.18)",
      color: "#1565c0",
      b: "rgba(21,101,192,.5)",
    },
  };
  const s = m[c] || m.gold;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.b}`,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.06em",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};
export const sbadge = (s) => {
  const m = {
    livré: "green",
    "en cours": "blue",
    "en attente": "orange",
    annulé: "red",
  };
  return <Badge c={m[s] || "gold"}>{s}</Badge>;
};

export const Btn = ({
  children,
  onClick,
  v = "primary",
  sz = "md",
  disabled,
  full,
  href,
  ariaLabel,
  style: ex = {},
}) => {
  // Avec href, le bouton est rendu comme un vrai lien (pas de <button> dans un <a>)
  const Tag = href ? "a" : "button";
  const linkProps = href
    ? { href, target: "_blank", rel: "noreferrer" }
    : { disabled: disabled || undefined, type: "button" };
  const S = {
    sm: { padding: "5px 14px", fontSize: 12 },
    md: { padding: "9px 20px", fontSize: 12 },
    lg: { padding: "13px 30px", fontSize: 13 },
  }[sz];
  const V = {
    primary: { background: "var(--gold)", color: "#fff", border: "none" },
    ghost: {
      background: "transparent",
      color: "var(--text)",
      border: "1px solid var(--border)",
    },
    outline: {
      background: "transparent",
      color: "var(--gold)",
      border: "1px solid var(--gold)",
    },
    danger: {
      background: "rgba(229,57,53,.08)",
      color: "#c62828",
      border: "1px solid rgba(229,57,53,.28)",
    },
    // Vert foncé : texte blanc lisible (contraste ~5:1)
    wa: { background: "#1A7F45", color: "#fff", border: "none" },
  }[v || "primary"];
  return (
    <Tag
      {...linkProps}
      aria-label={ariaLabel}
      onClick={disabled ? undefined : onClick}
      style={{
        ...S,
        ...V,
        textDecoration: "none",
        justifyContent: "center",
        borderRadius: 3,
        fontFamily: "var(--fb)",
        fontWeight: 500,
        letterSpacing: "0.06em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "opacity .15s,transform .1s",
        ...(full ? { width: "100%", justifyContent: "center" } : {}),
        ...ex,
      }}
      onMouseDown={(e) =>
        !disabled && (e.currentTarget.style.transform = "scale(.97)")
      }
      onMouseUp={(e) => (e.currentTarget.style.transform = "")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
    >
      {children}
    </Tag>
  );
};

export const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  req,
  multiline,
}) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label
        style={{
          display: "block",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 5,
        }}
      >
        {label}
        {req ? " *" : ""}
      </label>
    )}
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: "100%",
          background: "var(--surf2)",
          border: "1px solid var(--border)",
          borderRadius: 3,
          padding: "9px 13px",
          color: "var(--text)",
          fontSize: 16, // 16 px : pas de zoom auto sur iOS
          outline: "none",
          resize: "vertical",
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(154,110,46,.4)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "var(--surf2)",
          border: "1px solid var(--border)",
          borderRadius: 3,
          padding: "9px 13px",
          color: "var(--text)",
          fontSize: 16, // 16 px : pas de zoom auto sur iOS
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(154,110,46,.4)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    )}
  </div>
);

export const Panel = ({ children, style: s = {} }) => (
  <div
    style={{
      background: "var(--surf)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: 24,
      ...s,
    }}
  >
    {children}
  </div>
);
