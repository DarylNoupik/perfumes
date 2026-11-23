import { useState } from "react";

export const ProdImg = ({ p, size = "md", zoom = false }) => {
  const [err, setErr] = useState(false);
  const sz = {
    sm: { h: 120, fs: 38 },
    md: { h: 170, fs: 52 },
    lg: { h: 300, fs: 100 },
    card: { ratio: "4 / 5", fs: 52 },
    wide: { ratio: "4 / 3", fs: 52 },
  }[size];
  const box = sz.ratio
    ? { aspectRatio: sz.ratio, width: "100%" }
    : { height: sz.h };
  // Format immersif : la photo floutée remplit le cadre, le flacon reste entier par-dessus
  if (p.imgUrl && !err && sz.ratio)
    return (
      <div
        style={{
          ...box,
          position: "relative",
          overflow: "hidden",
          background: "#F5F0E8",
        }}
      >
        <img
          src={p.imgUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(40px) saturate(1.1) brightness(1.08)",
            transform: "scale(1.4)",
            opacity: 0.35,
          }}
        />
        <img
          src={p.imgUrl}
          alt={p.name}
          loading="lazy"
          onError={() => setErr(true)}
          className="prod-img"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            // Le fond blanc des photos se fond dans le cadre crème
            mixBlendMode: "multiply",
            transform: zoom ? "scale(1.06)" : "scale(1)",
            transition: "transform .5s cubic-bezier(.2,.7,.2,1)",
          }}
        />
      </div>
    );
  if (p.imgUrl && !err)
    return (
      <div
        style={{
          ...box,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#FFFFFF",
        }}
      >
        <img
          src={p.imgUrl}
          alt={p.name}
          loading="lazy"
          onError={() => setErr(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: sz.ratio || size === "lg" ? "contain" : "cover",
            display: "block",
            transition: "transform .4s",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        />
      </div>
    );
  return (
    <div
      style={{
        ...box,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: "linear-gradient(145deg,#F3EEE7,#FDFAF5)",
      }}
    >
      <span style={{ fontSize: sz.fs }}>{p.img}</span>
      <span
        style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.08em" }}
      >
        Aucune image
      </span>
    </div>
  );
};

// Mention affichée sous le prix d'un produit épuisé
export const IndicativePrice = () => (
  <div
    style={{
      fontFamily: "var(--fb)",
      fontSize: 12,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--muted)",
    }}
  >
    Prix indicatif
  </div>
);
