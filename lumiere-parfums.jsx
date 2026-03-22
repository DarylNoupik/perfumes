// ═══════════════════════════════════════════════════════════════════════════
//  LUMIÈRE — Plateforme Parfums
//  Architecture : Backend (store + logique) / Frontend (UI pure)
// ═══════════════════════════════════════════════════════════════════════════

import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import {
  ShoppingBag,
  Package,
  Users,
  BarChart2,
  X,
  ChevronRight,
  LogIn,
  LogOut,
  ArrowLeft,
  Check,
  Truck,
  Search,
  Trash,
  Plus,
  MessageCircle,
  Layers,
  Settings,
  Edit2,
  Save,
  Menu,
} from "lucide-react";

// ── Fonts & Global CSS ───────────────────────────────────────────────────────
const _fl = document.createElement("link");
_fl.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap";
_fl.rel = "stylesheet";
document.head.appendChild(_fl);

const _gs = document.createElement("style");
_gs.textContent = `
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --gold:#9A6E2E;--gold-l:#C9A84C;--gold-dim:rgba(154,110,46,.08);
    --bg:#FAF7F2;--surf:#FFFFFF;--surf2:#F3EEE7;--border:rgba(120,90,50,.12);
    --text:#2A2118;--muted:rgba(42,33,24,.45);
    --fd:'Cormorant Garamond',serif;--fb:'DM Sans',sans-serif;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--fb)}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:var(--gold-l);border-radius:2px}
  input,select,textarea{font-family:var(--fb)}
  @keyframes fadeSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
  @keyframes waPulse{0%{box-shadow:0 0 0 0 rgba(37,211,102,.55)}70%{box-shadow:0 0 0 16px rgba(37,211,102,0)}100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}}
  @keyframes cardReveal{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
  .admin-tabs-scroll::-webkit-scrollbar{display:none}
  @media(max-width:768px){
    .admin-tabs-scroll{scrollbar-width:none}
    table{font-size:11px}
  }
`;
document.head.appendChild(_gs);

// ═══════════════════════════════════════════════════════════════════════════
//  BACKEND — Données, logique métier, store global
// ═══════════════════════════════════════════════════════════════════════════

const SEED_SETTINGS = {
  shopName: "DIHU",
  tagline: "Maison de Parfums",
  heroTitle: "L'Art du Parfum Rare",
  heroSubtitle:
    "Des fragrances d'exception, sélectionnées pour les connaisseurs. Livraison partout à Douala.",
  heroLabel: "Collection Exclusive ·",
  city: "Douala, Cameroun",
  whatsapp: "237656493976",
  copyright: "© 2026 DIHU · Tous droits réservés",
  installMinOrders: 3,
  installMinPrice: 50000,
  promoEndDate: "2026-04-05T23:59:59",
  promoLabel: "Offre de lancement — Livraison offerte sur votre 1ère commande",
};

const SEED_PRODUCTS = [
  {
    id: 1,
    name: "Violet Blossom",
    brand: "Zara",
    price: 25000,
    stock: 2,
    cat: "Zara",
    desc: "Un bouquet floral violet délicat aux notes de violette, musc blanc et bois doux. Fraîcheur féminine et accessible.",
    notes: ["Violette", "Musc blanc", "Bois"],
    size: "180 ml",
    img: "🌸",
    imgUrl:
      "https://res.cloudinary.com/dhb3ceyqg/image/upload/v1774129442/violet_blossom_fluewi.jpg",
    featured: true,
  },
  {
    id: 2,
    name: "Hypnotic Vanilla EDP",
    brand: "Zara",
    price: 30000,
    stock: 2,
    cat: "Zara",
    desc: "Vanille hypnotique et enveloppante, rehaussée de notes boisées et musquées. Douceur addictive signature Zara.",
    notes: ["Vanille", "Musc", "Bois"],
    size: "80 ml",
    img: "🍬",
    imgUrl:
      "https://res.cloudinary.com/dhb3ceyqg/image/upload/v1774129441/Hypnotic_vanilla_EDP_ZARA_kzdmwf.jpg",
    featured: true,
  },
  {
    id: 3,
    name: "Scandal",
    brand: "Jean Paul Gaultier",
    price: 60000,
    stock: 2,
    cat: "JPG",
    desc: "Provocation assumée — miel doré, gardénia blanc et vétiver fumé. Le parfum du scandale chic et élégant.",
    notes: ["Miel", "Gardénia", "Vétiver"],
    size: "50 ml",
    img: "🍯",
    imgUrl:
      "https://res.cloudinary.com/dhb3ceyqg/image/upload/v1774129441/scandal_jean_paul_gautier_dyp4x6.avif",
    featured: true,
  },
  {
    id: 4,
    name: "Legend Mont Blanc",
    brand: "Mont Blanc",
    price: 35490,
    stock: 2,
    cat: "Mont Blanc",
    desc: "La légende en flacon — bergamote lumineuse, lavande aromatique et bois de cèdre. L'élégance masculine à son plus haut.",
    notes: ["Bergamote", "Lavande", "Cèdre"],
    size: "100 ml",
    img: "⚫",
    imgUrl:
      "https://res.cloudinary.com/dhb3ceyqg/image/upload/v1774129115/63817540_S1_qmxrpb.jpg",
    featured: true,
  },
  {
    id: 5,
    name: "Le Male Le Parfum",
    brand: "Jean Paul Gaultier",
    price: 35700,
    stock: 2,
    cat: "JPG",
    desc: "La version la plus intense du classique Le Mâle. Cardamome épicée, lavande profonde et vanille enveloppante.",
    notes: ["Cardamome", "Lavande", "Vanille"],
    size: "40 ml",
    img: "🫙",
    imgUrl:
      "https://res.cloudinary.com/dhb3ceyqg/image/upload/v1774129115/0046732_jean-paul-gaultier-le-male-le-parfum-125ml_550_x1ps0e.webp",
    featured: false,
  },
  {
    id: 6,
    name: "Zara Leather",
    brand: "Zara",
    price: 34000,
    stock: 2,
    cat: "Zara",
    desc: "Cuir sophistiqué et contemporain. Un sillage puissant, boisé et légèrement fumé pour une allure moderne et affirmée.",
    notes: ["Cuir", "Bois fumé", "Ambre"],
    size: "100 ml",
    img: "🟤",
    imgUrl:
      "https://res.cloudinary.com/dhb3ceyqg/image/upload/v1774129115/Zara_leather_jqj3ed.webp",
    featured: false,
  },
  {
    id: 7,
    name: "Invictus Victory Elixir",
    brand: "Paco Rabanne",
    price: 60000,
    stock: 2,
    cat: "Paco Rabanne",
    desc: "La version la plus puissante d'Invictus. Ambre chaud, épices intenses et sillage inégalé pour les hommes de caractère.",
    notes: ["Ambre", "Épices", "Musc"],
    size: "50 ml",
    img: "🏆",
    imgUrl:
      "https://res.cloudinary.com/dhb3ceyqg/image/upload/v1774129114/Invictus-Victory-Elixir-100ml-Nueva-Presentacion_pig1d2.webp",
    featured: true,
  },
  {
    id: 8,
    name: "Only The Brave",
    brand: "Diesel",
    price: 35000,
    stock: 2,
    cat: "Diesel",
    desc: "Un poing levé, une fragrance audacieuse. Cèdre bleu, vétiver et musc pour l'homme libre qui ose tout.",
    notes: ["Cèdre", "Vétiver", "Musc"],
    size: "50 ml",
    img: "✊",
    imgUrl:
      "https://res.cloudinary.com/dhb3ceyqg/image/upload/v1774129114/diesel_only_brave_xli91v.avif",
    featured: false,
  },
];

const SEED_USERS = [
  {
    id: 1,
    name: "Admin Lumière",
    email: "admin@lumiere.cm",
    password: "admin123",
    role: "admin",
    phone: "+237 699 000 001",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    name: "Sophie Mbarga",
    email: "vendeur@lumiere.cm",
    password: "vendeur123",
    role: "vendor",
    phone: "+237 699 000 002",
    createdAt: "2024-02-01",
  },
  {
    id: 3,
    name: "Marie Dupont",
    email: "client@lumiere.cm",
    password: "client123",
    role: "client",
    phone: "+237 699 123 456",
    createdAt: "2024-03-01",
  },
  {
    id: 4,
    name: "Jean Kamga",
    email: "jean@test.cm",
    password: "jean123",
    role: "client",
    phone: "+237 677 234 567",
    createdAt: "2024-04-01",
  },
];

const SEED_ORDERS = [
  {
    id: "CMD-001",
    clientId: 3,
    clientName: "Marie Dupont",
    clientPhone: "+237699123456",
    items: [{ productId: 1, name: "Black Opium", price: 85000, qty: 1 }],
    total: 85000,
    status: "livré",
    date: "2024-11-10",
    paymentMethod: "Mobile Money",
    installment: false,
  },
  {
    id: "CMD-002",
    clientId: 3,
    clientName: "Marie Dupont",
    clientPhone: "+237699123456",
    items: [{ productId: 7, name: "Classique", price: 58000, qty: 1 }],
    total: 58000,
    status: "livré",
    date: "2024-12-05",
    paymentMethod: "Mobile Money",
    installment: false,
  },
  {
    id: "CMD-003",
    clientId: 3,
    clientName: "Marie Dupont",
    clientPhone: "+237699123456",
    items: [{ productId: 2, name: "Libre", price: 82000, qty: 1 }],
    total: 82000,
    status: "livré",
    date: "2025-01-20",
    paymentMethod: "WhatsApp",
    installment: false,
  },
  {
    id: "CMD-004",
    clientId: 4,
    clientName: "Jean Kamga",
    clientPhone: "+237677234567",
    items: [{ productId: 13, name: "Red Temptation", price: 18000, qty: 2 }],
    total: 36000,
    status: "en cours",
    date: "2025-03-15",
    paymentMethod: "Mobile Money",
    installment: false,
  },
];

// ── Utilitaires métier ────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " XAF";
const genId = () => "CMD-" + (1000 + Math.floor(Math.random() * 8999));
const waLink = (phone, msg = "") =>
  `https://wa.me/${phone.replace(/[\s+]/g, "")}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;
const eligible = (s, delivered, price) =>
  delivered >= s.installMinOrders && price > s.installMinPrice;

// ── Store ─────────────────────────────────────────────────────────────────────
const Ctx = createContext(null);

function StoreProvider({ children }) {
  const [settings, _setSettings] = useState(SEED_SETTINGS);
  const [products, _setProducts] = useState(SEED_PRODUCTS);
  const [orders, _setOrders] = useState(SEED_ORDERS);
  const [users, _setUsers] = useState(SEED_USERS);
  const [session, setSession] = useState(null);
  const [cart, setCart] = useState([]);
  const [toast, _setToast] = useState(null);

  const notify = useCallback((msg, type = "ok") => {
    _setToast({ msg, type });
    setTimeout(() => _setToast(null), 3000);
  }, []);

  // Auth
  const login = (email, pass) => {
    const u = users.find((x) => x.email === email && x.password === pass);
    if (u) {
      setSession(u);
      notify(`Bienvenue, ${u.name.split(" ")[0]} !`);
      return true;
    }
    notify("Email ou mot de passe incorrect", "err");
    return false;
  };
  const logout = () => {
    setSession(null);
    notify("Déconnecté");
  };
  const register = (data) => {
    if (users.find((u) => u.email === data.email)) {
      notify("Email déjà utilisé", "err");
      return false;
    }
    const u = {
      id: Date.now(),
      ...data,
      role: "client",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    _setUsers((p) => [...p, u]);
    setSession(u);
    notify(`Bienvenue, ${data.name.split(" ")[0]} ! 🎉`);
    return true;
  };

  // Cart
  const addToCart = useCallback(
    (p, qty = 1) => {
      setCart((prev) => {
        const e = prev.find((i) => i.id === p.id);
        return e
          ? prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i))
          : [...prev, { ...p, qty }];
      });
      notify(`${p.name} ajouté au panier ✓`);
    },
    [notify],
  );
  const removeFromCart = (id) => setCart((p) => p.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Orders
  const placeOrder = (payMethod, inst, plan) => {
    if (!session) return;
    const o = {
      id: genId(),
      clientId: session.id,
      clientName: session.name,
      clientPhone: session.phone || "",
      items: cart.map((i) => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      total: cartTotal,
      status: "en attente",
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: payMethod,
      installment: inst,
      installmentPlan: plan || null,
    };
    _setOrders((p) => [o, ...p]);
    _setProducts((p) =>
      p.map((pr) => {
        const ci = cart.find((i) => i.id === pr.id);
        return ci ? { ...pr, stock: Math.max(0, pr.stock - ci.qty) } : pr;
      }),
    );
    clearCart();
    notify("Commande confirmée ! 🎉");
  };
  const updateOrderStatus = (id, status) => {
    _setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
    notify(`Statut → ${status}`);
  };

  // Products
  const addProduct = (data) => {
    const p = {
      ...data,
      id: Date.now(),
      featured: false,
      price: parseInt(data.price) || 0,
      stock: parseInt(data.stock) || 0,
      notes:
        typeof data.notes === "string"
          ? data.notes
              .split(",")
              .map((n) => n.trim())
              .filter(Boolean)
          : data.notes || [],
    };
    _setProducts((prev) => [p, ...prev]);
    notify("Parfum ajouté ✓");
  };
  const updateProduct = (id, data) => {
    _setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...data,
              price: parseInt(data.price) || 0,
              stock: parseInt(data.stock) || 0,
              notes:
                typeof data.notes === "string"
                  ? data.notes
                      .split(",")
                      .map((n) => n.trim())
                      .filter(Boolean)
                  : data.notes || [],
            }
          : p,
      ),
    );
    notify("Modifications enregistrées ✓");
  };
  const deleteProduct = (id) => {
    _setProducts((p) => p.filter((x) => x.id !== id));
    notify("Produit supprimé");
  };
  const adjustStock = (id, delta) =>
    _setProducts((p) =>
      p.map((x) =>
        x.id === id ? { ...x, stock: Math.max(0, x.stock + delta) } : x,
      ),
    );
  const uploadProductImg = (id, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => {
      _setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, imgUrl: e.target.result } : p)),
      );
      notify("Image mise à jour ✓");
    };
    r.readAsDataURL(file);
  };

  // Settings
  const updateSettings = (patch) => {
    _setSettings((s) => ({ ...s, ...patch }));
    notify("Paramètres sauvegardés ✓");
  };

  // Derived
  const myOrders = session
    ? orders.filter((o) => o.clientId === session.id)
    : [];
  const deliveredCount = myOrders.filter((o) => o.status === "livré").length;
  const canInstall = (p) =>
    session?.role === "client" && eligible(settings, deliveredCount, p.price);

  return (
    <Ctx.Provider
      value={{
        settings,
        updateSettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        uploadProductImg,
        orders,
        placeOrder,
        updateOrderStatus,
        users,
        register,
        session,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        myOrders,
        deliveredCount,
        canInstall,
        notify,
        toast,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
const useStore = () => useContext(Ctx);

// ── Responsive helper ─────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < bp : false,
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [bp]);
  return isMobile;
}

function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

// ═══════════════════════════════════════════════════════════════════════════
//  FRONTEND — Composants UI purs
// ═══════════════════════════════════════════════════════════════════════════

const Badge = ({ children, c = "gold" }) => {
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
      bg: "rgba(33,150,243,.1)",
      color: "#1565c0",
      b: "rgba(33,150,243,.3)",
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
        fontSize: 10,
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
const sbadge = (s) => {
  const m = {
    livré: "green",
    "en cours": "blue",
    "en attente": "orange",
    annulé: "red",
  };
  return <Badge c={m[s] || "gold"}>{s}</Badge>;
};

const Btn = ({
  children,
  onClick,
  v = "primary",
  sz = "md",
  disabled,
  full,
  style: ex = {},
}) => {
  const S = {
    sm: { padding: "5px 14px", fontSize: 11 },
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
    wa: { background: "#25D366", color: "#fff", border: "none" },
  }[v || "primary"];
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        ...S,
        ...V,
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
    </button>
  );
};

const Field = ({
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
          fontSize: 10,
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
          fontSize: 13,
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
          fontSize: 13,
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(154,110,46,.4)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    )}
  </div>
);

const Panel = ({ children, style: s = {} }) => (
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

const ProdImg = ({ p, size = "md" }) => {
  const [err, setErr] = useState(false);
  const sz = {
    sm: { h: 120, fs: 38 },
    md: { h: 170, fs: 52 },
    lg: { h: 300, fs: 100 },
  }[size];
  if (p.imgUrl && !err)
    return (
      <div
        style={{
          height: sz.h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#F8F4EE",
        }}
      >
        <img
          src={p.imgUrl}
          alt={p.name}
          onError={() => setErr(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
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
        height: sz.h,
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
        style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em" }}
      >
        Aucune image
      </span>
    </div>
  );
};

// ── Bouton WhatsApp flottant ───────────────────────────────────────────────────
function FloatingWhatsApp() {
  const { settings } = useStore();
  const waHref = waLink(
    settings.whatsapp,
    "Bonjour M. Ulrich ! Je souhaite passer une commande de parfums. Pouvez-vous m'aider ?",
  );
  return (
    <a
      href={waHref}
      target="_blank"
      rel="noreferrer"
      title="Commander via WhatsApp"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 998,
        width: 58,
        height: 58,
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(37,211,102,.5)",
        animation: "waPulse 2.2s infinite",
        textDecoration: "none",
        transition: "transform .2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <MessageCircle size={26} color="#fff" />
    </a>
  );
}

// ── Bannière compte à rebours ──────────────────────────────────────────────────
function CountdownBanner() {
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
          fontSize: isMobile ? 11 : 12,
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
                  fontFamily: "var(--fd)",
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
                  fontFamily: "var(--fd)",
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
                  fontSize: 8,
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

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { toast, session, settings, cartCount } = useStore();
  const isMobile = useIsMobile();
  const [view, setView] = useState("shop");
  const [selProduct, setSelProduct] = useState(null);
  const nav = (v) => {
    setView(v);
    if (v !== "product") setSelProduct(null);
  };
  const openProduct = (p) => {
    setSelProduct(p);
    setView("product");
  };
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: isMobile ? "auto" : 18,
            bottom: isMobile ? 18 : "auto",
            right: isMobile ? 12 : 18,
            left: isMobile ? 12 : "auto",
            zIndex: 9999,
            background: toast.type === "err" ? "#fff0ee" : "#fffdf7",
            border: `1px solid ${toast.type === "err" ? "rgba(229,57,53,.35)" : "rgba(154,110,46,.35)"}`,
            color: toast.type === "err" ? "#c62828" : "var(--text)",
            padding: "11px 18px",
            borderRadius: 6,
            fontSize: 13,
            boxShadow: "0 8px 32px rgba(42,33,24,.12)",
            animation: "fadeSlide .25s ease",
            maxWidth: isMobile ? "100%" : 290,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {toast.msg}
        </div>
      )}
      <AppHeader view={view} nav={nav} />
      {view === "shop" && (
        <ShopPage onView={openProduct} onConseils={() => nav("conseils")} />
      )}
      {view === "conseils" && <ConseilsPage onView={openProduct} />}
      {view === "product" && selProduct && (
        <ProductPage product={selProduct} onBack={() => nav("shop")} />
      )}
      {view === "cart" && <CartPage nav={nav} />}
      {view === "checkout" && <CheckoutPage nav={nav} />}
      {view === "account" && <AccountPage nav={nav} />}
      {view === "admin" &&
        (session?.role === "admin" || session?.role === "vendor") && (
          <AdminPage />
        )}
      <FloatingWhatsApp />
    </div>
  );
}

function AppHeader({ view, nav }) {
  const { logout, session, settings, cartCount } = useStore();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = session?.role === "admin" || session?.role === "vendor";
  const navLinks = [
    { l: "Boutique", v: "shop" },
    { l: "Conseils", v: "conseils" },
    { l: "Mon Compte", v: "account" },
    ...(isAdmin ? [{ l: "Dashboard", v: "admin" }] : []),
  ];
  const handleNav = (v) => {
    nav(v);
    setMenuOpen(false);
  };
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(250,247,242,.93)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 22px rgba(120,90,50,.06)",
      }}
    >
      <div
        style={{
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 16px" : "0 28px",
          gap: 12,
        }}
      >
        {/* Logo */}
        <div
          onClick={() => handleNav("shop")}
          style={{ cursor: "pointer", lineHeight: 1, flexShrink: 0 }}
        >
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: isMobile ? 18 : 21,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "var(--gold)",
            }}
          >
            {settings.shopName}
          </div>
          <div
            style={{
              fontSize: 8,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginTop: 1,
            }}
          >
            {settings.tagline}
          </div>
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {navLinks.map((n) => (
              <span
                key={n.v}
                onClick={() => nav(n.v)}
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: view === n.v ? "var(--gold)" : "var(--muted)",
                  cursor: "pointer",
                  transition: "color .15s",
                }}
              >
                {n.l}
              </span>
            ))}
            {session ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {session.name.split(" ")[0]}
                </span>
                <Btn sz="sm" v="ghost" onClick={logout}>
                  <LogOut size={13} />
                  Sortir
                </Btn>
              </div>
            ) : (
              <Btn sz="sm" v="outline" onClick={() => nav("account")}>
                <LogIn size={13} />
                Connexion
              </Btn>
            )}
            <div
              onClick={() => nav("cart")}
              style={{
                cursor: "pointer",
                position: "relative",
                padding: "7px 13px",
                background: "var(--surf)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <ShoppingBag size={15} color="var(--gold)" />
              <span style={{ fontSize: 12 }}>{cartCount}</span>
              {cartCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    width: 7,
                    height: 7,
                    background: "var(--gold)",
                    borderRadius: "50%",
                  }}
                />
              )}
            </div>
          </nav>
        )}

        {/* Mobile : panier + hamburger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              onClick={() => handleNav("cart")}
              style={{
                cursor: "pointer",
                position: "relative",
                padding: "6px 11px",
                background: "var(--surf)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ShoppingBag size={15} color="var(--gold)" />
              <span style={{ fontSize: 12 }}>{cartCount}</span>
              {cartCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    width: 7,
                    height: 7,
                    background: "var(--gold)",
                    borderRadius: "50%",
                  }}
                />
              )}
            </div>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "6px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "var(--text)",
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            background: "rgba(250,247,242,.97)",
            padding: "12px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            animation: "fadeSlide .2s ease",
          }}
        >
          {navLinks.map((n) => (
            <div
              key={n.v}
              onClick={() => handleNav(n.v)}
              style={{
                padding: "11px 14px",
                borderRadius: 5,
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: view === n.v ? "var(--gold-dim)" : "transparent",
                color: view === n.v ? "var(--gold)" : "var(--text)",
                cursor: "pointer",
                fontWeight: view === n.v ? 500 : 400,
              }}
            >
              {n.l}
            </div>
          ))}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              marginTop: 6,
              paddingTop: 10,
            }}
          >
            {session ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 14px",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {session.name.split(" ")[0]}
                </span>
                <Btn
                  sz="sm"
                  v="ghost"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  <LogOut size={13} />
                  Sortir
                </Btn>
              </div>
            ) : (
              <Btn
                sz="md"
                v="outline"
                full
                onClick={() => handleNav("account")}
              >
                <LogIn size={13} />
                Connexion
              </Btn>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ── Boutique ──────────────────────────────────────────────────────────────────
function ShopPage({ onView, onConseils }) {
  const { settings, products, addToCart } = useStore();
  const isMobile = useIsMobile();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tous");
  const cats = ["Tous", ...new Set(products.map((p) => p.cat).filter(Boolean))];
  const featured = products.filter((p) => p.featured);
  const visible = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.brand.toLowerCase().includes(q.toLowerCase())) &&
      (cat === "Tous" || p.cat === cat),
  );
  const waHref = waLink(
    settings.whatsapp,
    `Bonjour, je souhaite des informations sur vos parfums.`,
  );
  return (
    <div>
      {/* ── Bannière "Site en construction" ── */}
      <div
        style={{
          background: "linear-gradient(90deg,#9A6E2E,#C9A84C,#9A6E2E)",
          padding: "0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "11px 24px",
            flexWrap: "wrap",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 14 }}>🚧</span>
          <p
            style={{
              fontSize: 12,
              color: "#FFF",
              letterSpacing: "0.04em",
              lineHeight: 1.6,
            }}
          >
            <strong>Notre boutique est en cours de construction</strong> — mais
            vous pouvez déjà commander dès maintenant !
          </p>
          <a
            href={waLink(
              settings.whatsapp,
              "Bonjour M. Ulrich ! Je souhaite passer une commande de parfums. Pouvez-vous m'aider ?",
            )}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#25D366",
              color: "#FFF",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <MessageCircle size={13} />
            Commander via WhatsApp
          </a>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          position: "relative",
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(154,110,46,.06) 0%, transparent 70%), linear-gradient(160deg,#FAF7F2 0%,#F5EDD9 50%,#FAF7F2 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle,rgba(154,110,46,.06) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "8%",
            width: 1,
            height: 100,
            background:
              "linear-gradient(to bottom,transparent,rgba(154,110,46,.2),transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "22%",
            right: "10%",
            width: 1,
            height: 70,
            background:
              "linear-gradient(to bottom,transparent,rgba(154,110,46,.14),transparent)",
          }}
        />
        <div
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            padding: "72px 24px",
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 22,
            }}
          >
            {settings.heroLabel}
          </div>
          <h1
            style={{
              fontFamily: "var(--fd)",
              fontSize: "clamp(46px,7.5vw,84px)",
              fontWeight: 300,
              lineHeight: 1.06,
              marginBottom: 22,
            }}
          >
            {settings.heroTitle.split(" ").slice(0, -2).join(" ")}
            <br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
              {settings.heroTitle.split(" ").slice(-2).join(" ")}
            </em>
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted)",
              maxWidth: 420,
              margin: "0 auto 36px",
              lineHeight: 1.8,
            }}
          >
            {settings.heroSubtitle}
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Btn
              sz="lg"
              onClick={() =>
                document
                  .getElementById("catalogue")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explorer la Collection
            </Btn>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Btn sz="lg" v="wa">
                <MessageCircle size={15} />
                Contactez-nous
              </Btn>
            </a>
          </div>
        </div>
      </div>

      {/* Compte à rebours */}
      <CountdownBanner />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(to right,transparent,var(--border),transparent)",
          }}
        />
      </div>

      {/* ── Teaser Conseils ── */}
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: isMobile ? "32px 16px" : "48px 24px",
        }}
      >
        <div
          onClick={onConseils}
          style={{
            cursor: "pointer",
            background:
              "linear-gradient(135deg,#2A2118 0%,#3D2B1A 60%,#2A2118 100%)",
            borderRadius: 12,
            padding: isMobile ? "28px 22px" : "40px 52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            position: "relative",
            overflow: "hidden",
            transition: "transform .25s, box-shadow .25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 20px 52px rgba(42,33,24,.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          {/* Motif décoratif */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle,rgba(201,168,76,.07) 1px,transparent 1px)",
              backgroundSize: "28px 28px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: isMobile ? -30 : 40,
              top: "50%",
              transform: "translateY(-50%)",
              fontFamily: "var(--fd)",
              fontSize: isMobile ? 90 : 140,
              color: "rgba(201,168,76,.06)",
              fontStyle: "italic",
              pointerEvents: "none",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            DIHU
          </div>

          {/* Texte */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "var(--gold-l)",
                marginBottom: 10,
              }}
            >
              Nouveau · Guide exclusif
            </div>
            <h2
              style={{
                fontFamily: "var(--fd)",
                fontSize: isMobile ? 24 : 34,
                fontWeight: 300,
                color: "#FAF7F2",
                lineHeight: 1.15,
                marginBottom: 12,
              }}
            >
              Vous ne savez pas quel parfum{" "}
              <em style={{ color: "var(--gold-l)", fontStyle: "italic" }}>
                vous correspond ?
              </em>
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(250,247,242,.5)",
                lineHeight: 1.8,
                maxWidth: 460,
                marginBottom: isMobile ? 18 : 0,
              }}
            >
              Tendances marché, conseils de port, profils olfactifs — notre
              guide vous aide à trouver{" "}
              <strong style={{ color: "rgba(250,247,242,.8)" }}>
                le parfum fait pour vous
              </strong>{" "}
              en moins de 2 minutes.
            </p>
          </div>

          {/* CTA */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "flex-start" : "center",
              gap: 8,
            }}
          >
            <div
              style={{
                background: "var(--gold)",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              Voir les conseils
              <ChevronRight size={14} />
            </div>
            <span
              style={{
                fontSize: 10,
                color: "rgba(250,247,242,.35)",
                letterSpacing: "0.06em",
              }}
            >
              Gratuit · 8 parfums analysés
            </span>
          </div>
        </div>
      </div>

      {/* Catalogue */}
      <div
        id="catalogue"
        style={{ maxWidth: 1160, margin: "0 auto", padding: "60px 24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <h2
            style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 400 }}
          >
            Catalogue Complet
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surf)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "7px 13px",
            }}
          >
            <Search size={13} color="var(--muted)" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un parfum..."
              style={{
                background: "none",
                border: "none",
                color: "var(--text)",
                fontFamily: "var(--fb)",
                fontSize: 12,
                outline: "none",
                width: 180,
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          {cats.map((c) => (
            <span
              key={c}
              onClick={() => setCat(c)}
              style={{
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 11,
                cursor: "pointer",
                border: `1px solid ${cat === c ? "var(--gold)" : "var(--border)"}`,
                background: cat === c ? "var(--gold-dim)" : "transparent",
                color: cat === c ? "var(--gold)" : "var(--muted)",
                transition: "all .15s",
              }}
            >
              {c}
            </span>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
            gap: 14,
          }}
        >
          {visible.map((p) => (
            <PCard
              key={p.id}
              p={p}
              onView={() => onView(p)}
              onAdd={() => addToCart(p)}
            />
          ))}
        </div>
        {visible.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 64,
              color: "var(--muted)",
              fontFamily: "var(--fd)",
              fontSize: 22,
            }}
          >
            Aucun parfum trouvé
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          background: "#F3EEE7",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--fd)",
            fontSize: 22,
            color: "var(--gold)",
            letterSpacing: "0.18em",
            marginBottom: 10,
          }}
        >
          {settings.shopName}
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.06em",
          }}
        >
          {settings.tagline} · {settings.city}
        </p>
        <a
          href={waLink(settings.whatsapp)}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            color: "#1a7a3a",
            fontSize: 12,
            textDecoration: "none",
            margin: "12px 0 0",
            fontWeight: 500,
          }}
        >
          <MessageCircle size={13} />+{settings.whatsapp}
        </a>
        <p
          style={{
            fontSize: 10,
            color: "var(--muted)",
            marginTop: 10,
            opacity: 0.5,
          }}
        >
          {settings.copyright}
        </p>
      </footer>
    </div>
  );
}

function PCard({ p, onView, onAdd, featured }) {
  const { settings } = useStore();
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--surf)",
        border: `1px solid ${hov ? "rgba(154,110,46,.3)" : "var(--border)"}`,
        borderRadius: 8,
        overflow: "hidden",
        transition: "all .25s",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov ? "0 16px 38px rgba(42,33,24,.12)" : "none",
        cursor: "pointer",
      }}
    >
      <div
        onClick={onView}
        style={{
          padding: featured ? "20px 20px 0" : "12px 12px 0",
          textAlign: "center",
          background: "linear-gradient(145deg,#F3EEE7,#FDFAF5)",
          position: "relative",
        }}
      >
        <ProdImg p={p} size={featured ? "md" : "sm"} />
        {featured && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <Badge c="gold">Coup de cœur</Badge>
          </div>
        )}
        {p.stock <= 3 && p.stock > 0 && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <Badge c="orange">Stock limité</Badge>
          </div>
        )}
        {p.price > settings.installMinPrice && (
          <div style={{ position: "absolute", bottom: 8, right: 8 }}>
            <Badge c="blue">Paiement en tranches</Badge>
          </div>
        )}
      </div>
      <div style={{ padding: "14px 18px 18px" }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 3,
          }}
        >
          {p.cat} · {p.size}
        </div>
        <div
          onClick={onView}
          style={{
            fontFamily: "var(--fd)",
            fontSize: 17,
            fontWeight: 500,
            marginBottom: 3,
            lineHeight: 1.2,
          }}
        >
          {p.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
          {p.brand}
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            marginBottom: 13,
          }}
        >
          {p.notes.map((n) => (
            <span
              key={n}
              style={{
                fontSize: 9,
                padding: "2px 7px",
                background: "var(--surf2)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                color: "var(--muted)",
              }}
            >
              {n}
            </span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 18,
              color: "var(--gold)",
              fontWeight: 500,
            }}
          >
            {fmt(p.price)}
          </div>
          <Btn sz="sm" onClick={onAdd} disabled={p.stock === 0}>
            {p.stock === 0 ? "Épuisé" : "+ Panier"}
          </Btn>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingTop: 8,
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background:
                p.stock === 0
                  ? "#c62828"
                  : p.stock <= 3
                    ? "#e65100"
                    : "#3d8c40",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 10,
              color:
                p.stock === 0
                  ? "#c62828"
                  : p.stock <= 3
                    ? "#e65100"
                    : "var(--muted)",
            }}
          >
            {p.stock === 0
              ? "Rupture de stock"
              : p.stock <= 3
                ? `Plus que ${p.stock} en stock`
                : `${p.stock} unités disponibles`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Fiche produit ─────────────────────────────────────────────────────────────
function ProductPage({ product: p, onBack }) {
  const { settings, addToCart, session, canInstall } = useStore();
  const isMobile = useIsMobile();
  const [qty, setQty] = useState(1);
  const elig = canInstall(p);
  const waHref = waLink(
    settings.whatsapp,
    `Bonjour, je souhaite commander : ${p.name} (${fmt(p.price)})`,
  );
  return (
    <div
      style={{
        maxWidth: 880,
        margin: isMobile ? "24px auto" : "56px auto",
        padding: "0 16px",
      }}
    >
      <Btn v="ghost" sz="sm" onClick={onBack} style={{ marginBottom: 22 }}>
        <ArrowLeft size={13} />
        Retour
      </Btn>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 24 : 48,
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg,#F3EEE7,#FDFAF5)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            border: "1px solid var(--border)",
            minHeight: 320,
          }}
        >
          <ProdImg p={p} size="lg" />
        </div>
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 8,
            }}
          >
            {p.brand} · {p.cat}
          </div>
          <h1
            style={{
              fontFamily: "var(--fd)",
              fontSize: 38,
              fontWeight: 400,
              lineHeight: 1.08,
              marginBottom: 14,
            }}
          >
            {p.name}
          </h1>
          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.85,
              marginBottom: 22,
              fontSize: 13,
            }}
          >
            {p.desc}
          </p>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 7,
              }}
            >
              Notes olfactives
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {p.notes.map((n) => (
                <span
                  key={n}
                  style={{
                    padding: "4px 11px",
                    background: "var(--surf2)",
                    border: "1px solid var(--gold)",
                    borderRadius: 20,
                    color: "var(--gold)",
                    fontSize: 11,
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
            <div>
              <div
                style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}
              >
                Contenance
              </div>
              <div style={{ fontSize: 13 }}>{p.size}</div>
            </div>
            <div>
              <div
                style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}
              >
                En stock
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: p.stock <= 3 ? "#e65100" : "var(--text)",
                }}
              >
                {p.stock} unité{p.stock !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 34,
              color: "var(--gold)",
              marginBottom: 20,
            }}
          >
            {fmt(p.price)}
          </div>
          {elig && (
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
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <Layers size={15} color="var(--gold)" />
                <span
                  style={{
                    color: "var(--gold)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Paiement en {settings.installMinOrders} fois disponible
                </span>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                Client fidèle — {settings.installMinOrders} versements de{" "}
                {fmt(Math.ceil(p.price / settings.installMinOrders))}.
              </p>
            </Panel>
          )}
          {!session && p.price > settings.installMinPrice && (
            <Panel
              style={{
                marginBottom: 18,
                background: "rgba(33,150,243,.03)",
                borderColor: "rgba(33,150,243,.2)",
              }}
            >
              <p style={{ fontSize: 11, color: "#1565c0", lineHeight: 1.65 }}>
                💡 Connectez-vous pour vérifier votre éligibilité au paiement en
                tranches.
              </p>
            </Panel>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid var(--border)",
                borderRadius: 3,
              }}
            >
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: 34,
                  height: 38,
                  background: "none",
                  border: "none",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                −
              </button>
              <span style={{ width: 32, textAlign: "center", fontSize: 13 }}>
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
                style={{
                  width: 34,
                  height: 38,
                  background: "none",
                  border: "none",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                +
              </button>
            </div>
            <Btn
              sz="lg"
              onClick={() => addToCart(p, qty)}
              disabled={p.stock === 0}
            >
              <ShoppingBag size={15} />
              Ajouter au panier
            </Btn>
          </div>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Btn v="wa" sz="sm">
              <MessageCircle size={13} />
              Commander par WhatsApp
            </Btn>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Conseils & Tendances ──────────────────────────────────────────────────────
const CONSEILS_DATA = [
  {
    productId: 1,
    famille: "Floral Violet",
    tendance: "Tendance 2026",
    trendBg: "rgba(155,89,182,.12)",
    trendColor: "#7d3c98",
    genre: "Féminin",
    occasions: ["Bureau", "Brunch", "Week-end"],
    accroche: "La douceur qui reste gravée",
    description:
      "En 2026, les floraux violets s'imposent comme la signature olfactive des femmes modernes. Frais le matin, légèrement chauds en soirée, ils traversent les humeurs et les saisons.",
    envie:
      "Pour la femme qui veut être remarquée sans en avoir l'air. Violet Blossom crée une présence douce et inoubliable — le genre de parfum dont on vous demandera le nom à voix basse.",
    conseil:
      "Vaporisez sur le poignet et la nuque après la douche. La chaleur de la peau révèle toute sa profondeur.",
  },
  {
    productId: 2,
    famille: "Oriental Vanillé",
    tendance: "N°1 en Afrique",
    trendBg: "rgba(230,126,34,.12)",
    trendColor: "#a04000",
    genre: "Mixte",
    occasions: ["Soirée", "Rendez-vous", "Intime"],
    accroche: "Le parfum qui ne laisse pas indifférent",
    description:
      "La vanille est la senteur la plus plébiscitée en Afrique subsaharienne. Hypnotic Vanilla joue sur cette préférence culturelle profonde avec une sophistication rare à son prix.",
    envie:
      "Enveloppant, chaud, addictif. Ce parfum crée une aura sensuelle discrète qui donne envie de s'approcher. Parfait pour les moments que vous voulez rendre mémorables.",
    conseil:
      "Portez-le le soir — la chaleur corporelle amplifie les notes vanillées et prolonge le sillage jusqu'au lendemain.",
  },
  {
    productId: 3,
    famille: "Floral Oriental",
    tendance: "Signature femme forte",
    trendBg: "rgba(192,57,43,.1)",
    trendColor: "#922b21",
    genre: "Féminin",
    occasions: ["Soirée", "Dîner chic", "Sortie"],
    accroche: "Porter Scandal, c'est une déclaration",
    description:
      "Jean Paul Gaultier a créé un chef-d'œuvre de la provocation chic. Scandal domine les classements des parfums féminins les plus désirés depuis 2017 — il ne se démode pas, il s'intensifie.",
    envie:
      "Pour la femme qui entre dans une pièce et ne passe pas inaperçue. Le miel doré et le gardénia blanc composent un sillage opulent, sensuel, qui reste en mémoire bien après votre départ.",
    conseil:
      "Un seul vaporisateur suffit — Scandal est très concentré. Poignets et décolleté pour un effet maximal.",
  },
  {
    productId: 4,
    famille: "Aromatique Boisé",
    tendance: "Classique intemporel",
    trendBg: "rgba(44,62,80,.1)",
    trendColor: "#1a252f",
    genre: "Masculin",
    occasions: ["Bureau", "Mariage", "Formel"],
    accroche: "L'élégance qui n'a pas besoin de crier",
    description:
      "Legend de Mont Blanc est l'un des masculins les plus vendus dans sa catégorie depuis plus de 10 ans. Une valeur sûre qui transcende les tendances parce qu'elle incarne quelque chose de plus profond : le raffinement discret.",
    envie:
      "Pour l'homme accompli qui n'a pas besoin d'en faire trop. La bergamote lumineuse et le cèdre racé composent la signature olfactive de quelqu'un à qui on fait confiance instinctivement.",
    conseil:
      "Idéal pour le bureau et les cérémonies. Appliquez le matin — il tiendra toute la journée avec classe.",
  },
  {
    productId: 7,
    famille: "Ambre Épicé",
    tendance: "N°1 des jeunes hommes",
    trendBg: "rgba(243,156,18,.12)",
    trendColor: "#9a7d0a",
    genre: "Masculin",
    occasions: ["Soirée", "Sport", "Séduction"],
    accroche: "La victoire a une odeur",
    description:
      "Invictus Victory Elixir est le parfum masculin le plus porté par les hommes de 20-35 ans. Son ambre chaud et ses épices intenses en font une référence incontournable dans les tendances mondiales de 2025-2026.",
    envie:
      "Charismatique, puissant, magnétique. Ce parfum ne se porte pas — il se vit. Pour les hommes qui ont des objectifs et les atteignent, qui savent que chaque détail compte.",
    conseil:
      "Son sillage intense est fait pour les occasions qui comptent. Une application sur le torse suffit — il fera le reste.",
  },
  {
    productId: 5,
    famille: "Oriental Épicé",
    tendance: "Masculin séduction",
    trendBg: "rgba(142,68,173,.1)",
    trendColor: "#6c3483",
    genre: "Masculin",
    occasions: ["Soirée", "Rendez-vous", "Week-end"],
    accroche: "Intense. Magnétique. Inoubliable.",
    description:
      "La version la plus puissante du mythique Le Mâle. En 2026, les masculins orientaux épicés connaissent une renaissance portée par une génération d'hommes qui assument pleinement leur sensualité.",
    envie:
      "Il laisse une trace longtemps après votre départ. La cardamome épicée et la lavande profonde créent un contraste saisissant — viril et raffiné à la fois. Un paradoxe élégant.",
    conseil:
      "La cardamome se réveille à la chaleur du corps — portez-le proche de la peau, sur le torse et les poignets.",
  },
  {
    productId: 8,
    famille: "Boisé Fougère",
    tendance: "Authenticité & liberté",
    trendBg: "rgba(39,174,96,.1)",
    trendColor: "#1e8449",
    genre: "Masculin",
    occasions: ["Quotidien", "Casual", "Plein air"],
    accroche: "Pas pour tout le monde",
    description:
      "Only The Brave de Diesel incarne l'esprit de liberté qui séduit les 25-35 ans en quête d'authenticité. Les boisés fougères sont en forte progression sur le marché africain et mondial.",
    envie:
      "Pour l'homme qui fait ses propres règles. Cèdre bleu et vétiver composent un parfum qui respire l'espace et la liberté — sans chichis, sans compromis, sans chercher à plaire à tout le monde.",
    conseil:
      "Très polyvalent pour le quotidien. Son caractère boisé frais le rend adapté autant au travail qu'aux sorties décontractées.",
  },
  {
    productId: 6,
    famille: "Cuir Boisé",
    tendance: "Tendance urbaine 2026",
    trendBg: "rgba(127,85,57,.12)",
    trendColor: "#6e2c00",
    genre: "Mixte",
    occasions: ["Soirée", "Urban", "Statement"],
    accroche: "Le courage d'être différent",
    description:
      "Le cuir fait un retour remarqué dans les tendances mondiales. En 2025-2026, les parfums cuirés séduisent une clientèle urbaine et affirmée qui refuse les fragrances trop communes.",
    envie:
      "Pour ceux qui veulent une présence olfactive forte et distincte. Zara Leather est audacieux — ni timide ni agressif, juste singulier. Le parfum de ceux qui n'ont pas besoin d'être comme les autres.",
    conseil:
      "Laissez-le se développer sur la peau 15 minutes avant de sortir. Le cuir évolue magnifiquement à la chaleur corporelle.",
  },
];

function ConseilsPage({ onView }) {
  const { products, addToCart, settings } = useStore();
  const isMobile = useIsMobile();
  const [filtre, setFiltre] = useState("Tous");
  const filtres = ["Tous", "Féminin", "Masculin", "Mixte"];

  const visible = CONSEILS_DATA.filter(
    (c) => filtre === "Tous" || c.genre === filtre,
  );

  const waHref = waLink(
    settings.whatsapp,
    "Bonjour M. Ulrich ! J'ai vu vos conseils parfums et je voudrais commander.",
  );

  return (
    <div>
      {/* Hero conseils */}
      <div
        style={{
          background:
            "linear-gradient(160deg,#2A2118 0%,#3D2B1A 50%,#2A2118 100%)",
          padding: isMobile ? "48px 20px" : "72px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "var(--gold-l)",
            marginBottom: 18,
          }}
        >
          Maison DIHU · Expertise Parfums
        </div>
        <h1
          style={{
            fontFamily: "var(--fd)",
            fontSize: isMobile
              ? "clamp(32px,8vw,52px)"
              : "clamp(42px,5vw,66px)",
            fontWeight: 300,
            color: "#FAF7F2",
            lineHeight: 1.1,
            marginBottom: 18,
          }}
        >
          Conseils &{" "}
          <em style={{ color: "var(--gold-l)", fontStyle: "italic" }}>
            Tendances
          </em>
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(250,247,242,.55)",
            maxWidth: 520,
            margin: "0 auto 32px",
            lineHeight: 1.85,
          }}
        >
          Chaque parfum raconte une histoire. Découvrez lequel est fait pour
          vous, selon votre personnalité, vos occasions et les tendances du
          marché en 2026.
        </p>
        <div
          style={{
            display: "flex",
            gap: isMobile ? 24 : 48,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { v: "8", l: "Fragrances" },
            { v: "5", l: "Familles olfactives" },
            { v: "2026", l: "Sélection" },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--fd)",
                  fontSize: isMobile ? 28 : 36,
                  color: "var(--gold-l)",
                  fontWeight: 500,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(250,247,242,.4)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres genre */}
      <div
        style={{
          background: "var(--surf)",
          borderBottom: "1px solid var(--border)",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {filtres.map((f) => (
          <span
            key={f}
            onClick={() => setFiltre(f)}
            style={{
              padding: "6px 18px",
              borderRadius: 20,
              fontSize: 11,
              cursor: "pointer",
              letterSpacing: "0.08em",
              border: `1px solid ${filtre === f ? "var(--gold)" : "var(--border)"}`,
              background: filtre === f ? "var(--gold-dim)" : "transparent",
              color: filtre === f ? "var(--gold)" : "var(--muted)",
              transition: "all .15s",
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Grille de conseils */}
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: isMobile ? "32px 16px 60px" : "52px 24px 80px",
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fill,minmax(340px,1fr))",
          gap: isMobile ? 20 : 28,
        }}
      >
        {visible.map((c, idx) => {
          const product = products.find((p) => p.id === c.productId);
          if (!product) return null;
          return (
            <ConseilCard
              key={c.productId}
              c={c}
              product={product}
              onView={onView}
              onAdd={() => addToCart(product)}
              idx={idx}
            />
          );
        })}
      </div>

      {/* CTA bas de page */}
      <div
        style={{
          background:
            "linear-gradient(135deg,rgba(154,110,46,.08) 0%,rgba(201,168,76,.04) 100%)",
          borderTop: "1px solid var(--border)",
          padding: isMobile ? "40px 20px" : "60px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--fd)",
            fontSize: isMobile ? 24 : 32,
            marginBottom: 12,
          }}
        >
          Vous ne savez toujours pas lequel choisir ?
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            marginBottom: 24,
            lineHeight: 1.75,
          }}
        >
          Décrivez votre personnalité, votre occasion ou votre budget — nous
          vous guidons vers le parfum idéal.
        </p>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Btn sz="lg" v="wa">
            <MessageCircle size={15} />
            Demandez conseil sur WhatsApp
          </Btn>
        </a>
      </div>
    </div>
  );
}

function ConseilCard({ c, product, onView, onAdd, idx }) {
  const { settings } = useStore();
  const isMobile = useIsMobile();
  const [hov, setHov] = useState(false);
  const waHref = waLink(
    settings.whatsapp,
    `Bonjour M. Ulrich ! Je suis intéressé(e) par le parfum ${product.name} (${fmt(product.price)}). Pouvez-vous m'aider ?`,
  );
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--surf)",
        border: `1px solid ${hov ? "rgba(154,110,46,.3)" : "var(--border)"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "all .3s",
        transform: hov ? "translateY(-6px)" : "none",
        boxShadow: hov ? "0 20px 48px rgba(42,33,24,.13)" : "none",
        animation: `cardReveal .4s ease ${idx * 0.06}s both`,
      }}
    >
      {/* Image */}
      <div
        onClick={() => onView(product)}
        style={{
          cursor: "pointer",
          position: "relative",
          background: "linear-gradient(145deg,#F3EEE7,#FDFAF5)",
        }}
      >
        <ProdImg p={product} size="md" />
        {/* Badge tendance */}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span
            style={{
              background: c.trendBg,
              color: c.trendColor,
              border: `1px solid ${c.trendColor}33`,
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            {c.tendance}
          </span>
        </div>
        {/* Badge genre */}
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <span
            style={{
              background: "rgba(42,33,24,.6)",
              color: "#FAF7F2",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 9,
              letterSpacing: "0.08em",
            }}
          >
            {c.genre}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: isMobile ? "18px 16px 20px" : "20px 22px 24px" }}>
        {/* Famille + nom */}
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 4,
          }}
        >
          {c.famille} · {product.brand}
        </div>
        <h3
          onClick={() => onView(product)}
          style={{
            fontFamily: "var(--fd)",
            fontSize: 22,
            fontWeight: 400,
            marginBottom: 6,
            cursor: "pointer",
            lineHeight: 1.1,
          }}
        >
          {product.name}
        </h3>

        {/* Accroche */}
        <p
          style={{
            fontFamily: "var(--fd)",
            fontSize: 14,
            fontStyle: "italic",
            color: "var(--gold)",
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          "{c.accroche}"
        </p>

        {/* Occasions */}
        <div
          style={{
            display: "flex",
            gap: 5,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          {c.occasions.map((o) => (
            <span
              key={o}
              style={{
                fontSize: 9,
                padding: "3px 9px",
                background: "var(--surf2)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                color: "var(--muted)",
                letterSpacing: "0.06em",
              }}
            >
              {o}
            </span>
          ))}
        </div>

        {/* Séparateur */}
        <div
          style={{
            height: 1,
            background: "linear-gradient(to right,var(--border),transparent)",
            marginBottom: 14,
          }}
        />

        {/* Tendance marché */}
        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            lineHeight: 1.75,
            marginBottom: 12,
          }}
        >
          {c.description}
        </p>

        {/* L'envie */}
        <div
          style={{
            background: "rgba(154,110,46,.04)",
            border: "1px solid rgba(154,110,46,.18)",
            borderRadius: 7,
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 5,
            }}
          >
            L'envie
          </div>
          <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.75 }}>
            {c.envie}
          </p>
        </div>

        {/* Conseil pratique */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
          <p
            style={{
              fontSize: 11,
              color: "var(--muted)",
              lineHeight: 1.65,
              fontStyle: "italic",
            }}
          >
            {c.conseil}
          </p>
        </div>

        {/* Prix + CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 14,
            borderTop: "1px solid var(--border)",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 22,
              color: "var(--gold)",
              fontWeight: 500,
            }}
          >
            {fmt(product.price)}
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <Btn sz="sm" onClick={() => onView(product)}>
              Voir le parfum
            </Btn>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Btn sz="sm" v="wa">
                <MessageCircle size={12} />
                Commander
              </Btn>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Panier ────────────────────────────────────────────────────────────────────
function CartPage({ nav }) {
  const { cart, removeFromCart, cartTotal } = useStore();
  const isMobile = useIsMobile();
  if (!cart.length)
    return (
      <div style={{ textAlign: "center", padding: "110px 24px" }}>
        <ShoppingBag
          size={46}
          color="var(--muted)"
          style={{ margin: "0 auto 22px", display: "block" }}
        />
        <h2
          style={{
            fontFamily: "var(--fd)",
            fontSize: 28,
            color: "var(--muted)",
            marginBottom: 6,
          }}
        >
          Votre panier est vide
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22 }}>
          Explorez notre collection.
        </p>
        <Btn onClick={() => nav("shop")}>Retour à la boutique</Btn>
      </div>
    );
  return (
    <div
      style={{
        maxWidth: 740,
        margin: isMobile ? "24px auto" : "56px auto",
        padding: "0 16px",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--fd)",
          fontSize: isMobile ? 26 : 34,
          marginBottom: 22,
        }}
      >
        Votre Panier
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {cart.map((i) => (
          <div
            key={i.id}
            style={{
              background: "var(--surf)",
              border: "1px solid var(--border)",
              borderRadius: 7,
              padding: isMobile ? "12px 14px" : "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 10 : 18,
            }}
          >
            <div style={{ fontSize: 32, flexShrink: 0 }}>
              {i.imgUrl ? (
                <img
                  src={i.imgUrl}
                  style={{ width: 40, height: 40, objectFit: "contain" }}
                  alt=""
                />
              ) : (
                i.img
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--fd)",
                  fontSize: isMobile ? 15 : 17,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {i.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {i.brand} · {i.size} · Qté : {i.qty}
              </div>
              {isMobile && (
                <div
                  style={{
                    fontFamily: "var(--fd)",
                    fontSize: 15,
                    color: "var(--gold)",
                    marginTop: 3,
                  }}
                >
                  {fmt(i.price * i.qty)}
                </div>
              )}
            </div>
            {!isMobile && (
              <div
                style={{
                  fontFamily: "var(--fd)",
                  fontSize: 18,
                  color: "var(--gold)",
                  marginRight: 14,
                  flexShrink: 0,
                }}
              >
                {fmt(i.price * i.qty)}
              </div>
            )}
            <button
              onClick={() => removeFromCart(i.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: 4,
                flexShrink: 0,
              }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <Panel>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}
            >
              Total
            </div>
            <div
              style={{
                fontFamily: "var(--fd)",
                fontSize: 30,
                color: "var(--gold)",
              }}
            >
              {fmt(cartTotal)}
            </div>
          </div>
          <Btn sz="lg" onClick={() => nav("checkout")}>
            Commander <ChevronRight size={15} />
          </Btn>
        </div>
      </Panel>
    </div>
  );
}

// ── Checkout ──────────────────────────────────────────────────────────────────
function CheckoutPage({ nav }) {
  const { cart, cartTotal, session, settings, placeOrder, canInstall } =
    useStore();
  const [name, setName] = useState(session?.name || "");
  const [phone, setPhone] = useState(session?.phone || "");
  const [address, setAddress] = useState("");
  const [pay, setPay] = useState("momo");
  const [inst, setInst] = useState(false);
  const canInst = cart.some((i) => canInstall(i));
  const part = Math.ceil(cartTotal / settings.installMinOrders);
  const confirm = () => {
    if (!name || !phone) return;
    placeOrder(
      pay === "momo" ? "Mobile Money" : "WhatsApp",
      inst && canInst,
      inst && canInst
        ? {
            total: cartTotal,
            perPart: part,
            parts: settings.installMinOrders,
            paidCount: 1,
          }
        : null,
    );
    nav("account");
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
      <h2 style={{ fontFamily: "var(--fd)", fontSize: 34, marginBottom: 28 }}>
        Finaliser la Commande
      </h2>
      <Panel style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 10,
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
            fontFamily: "var(--fd)",
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
            fontSize: 10,
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
        />
      </Panel>
      <Panel style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 14,
          }}
        >
          Paiement
        </div>
        {[
          { k: "momo", label: "Mobile Money (MTN / Orange)", icon: "📱" },
          { k: "whatsapp", label: "WhatsApp / Appel téléphonique", icon: "💬" },
        ].map((m) => (
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
                style={{ fontSize: 12, fontWeight: 500, color: "var(--gold)" }}
              >
                Paiement en {settings.installMinOrders} fois
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>
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
                      fontFamily: "var(--fd)",
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
      <Btn sz="lg" full onClick={confirm} disabled={!name || !phone}>
        <Check size={15} />
        Confirmer la commande
      </Btn>
    </div>
  );
}

// ── Espace client ─────────────────────────────────────────────────────────────
function AccountPage({ nav }) {
  const { session, login, register, myOrders, deliveredCount, settings } =
    useStore();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
            style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 400 }}
          >
            {mode === "login" ? "Bienvenue" : "Créer un compte"}
          </h2>
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
          <Field
            label="Mot de passe"
            value={pass}
            onChange={setPass}
            type="password"
            placeholder="••••••••"
            req
          />
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
            onClick={() =>
              mode === "login"
                ? login(email, pass)
                : register({ name, email, password: pass, phone })
            }
            style={{ marginTop: 8 }}
          >
            {mode === "login" ? "Se connecter" : "Créer mon compte"}
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
            <span
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{ color: "var(--gold)", cursor: "pointer" }}
            >
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </span>
          </div>
          <div
            style={{
              marginTop: 18,
              padding: "11px 13px",
              background: "var(--surf2)",
              borderRadius: 5,
              fontSize: 10,
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
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 5,
            }}
          >
            Mon Espace
          </div>
          <h2
            style={{ fontFamily: "var(--fd)", fontSize: 34, fontWeight: 400 }}
          >
            Bonjour, {session.name.split(" ")[0]}
          </h2>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
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
              style={{ fontSize: 11, color: "var(--gold)", fontWeight: 500 }}
            >
              Paiement en tranches
            </div>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>
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
                  fontFamily: "var(--fd)",
                  fontSize: 22,
                  marginBottom: 2,
                }}
              >
                {s.v}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.l}</div>
            </Panel>
          ))}
        </div>
      )}
      <h3 style={{ fontFamily: "var(--fd)", fontSize: 22, marginBottom: 16 }}>
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
                      fontFamily: "var(--fd)",
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {o.id}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
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
                        fontSize: 11,
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
                      fontFamily: "var(--fd)",
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
              style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.75 }}
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

// ═══════════════════════════════════════════════════════════════════════════
//  DASHBOARD ADMIN
// ═══════════════════════════════════════════════════════════════════════════
function AdminPage() {
  const { session } = useStore();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("dashboard");
  const tabs = [
    { k: "dashboard", l: "Vue d'ensemble", icon: <BarChart2 size={14} /> },
    { k: "products", l: "Produits", icon: <Package size={14} /> },
    { k: "orders", l: "Commandes", icon: <Truck size={14} /> },
    ...(session.role === "admin"
      ? [
          { k: "users", l: "Utilisateurs", icon: <Users size={14} /> },
          { k: "settings", l: "Paramètres", icon: <Settings size={14} /> },
        ]
      : []),
  ];

  if (isMobile) {
    return (
      <div style={{ minHeight: "calc(100vh - 62px)" }}>
        {/* Mobile : barre d'onglets horizontale scrollable */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            borderBottom: "1px solid var(--border)",
            background: "#fff",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {tabs.map((t) => (
            <div
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "10px 14px",
                cursor: "pointer",
                borderBottom:
                  tab === t.k
                    ? "2px solid var(--gold)"
                    : "2px solid transparent",
                color: tab === t.k ? "var(--gold)" : "var(--muted)",
                fontSize: 10,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all .15s",
              }}
            >
              {t.icon}
              {t.l}
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 14px", overflowX: "hidden" }}>
          {tab === "dashboard" && <TabDashboard />}
          {tab === "products" && <TabProducts />}
          {tab === "orders" && <TabOrders />}
          {tab === "users" && session.role === "admin" && <TabUsers />}
          {tab === "settings" && session.role === "admin" && <TabSettings />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 62px)" }}>
      <div
        style={{
          width: 210,
          background: "#fff",
          borderRight: "1px solid var(--border)",
          boxShadow: "2px 0 12px rgba(120,90,50,.05)",
          padding: "28px 0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "0 18px 22px",
            borderBottom: "1px solid var(--border)",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 4,
            }}
          >
            Dashboard
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            {session.name}
          </div>
          <Badge c={session.role === "admin" ? "gold" : "blue"}>
            {session.role === "admin" ? "Administrateur" : "Vendeur"}
          </Badge>
        </div>
        {tabs.map((t) => (
          <div
            key={t.k}
            onClick={() => setTab(t.k)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 18px",
              cursor: "pointer",
              background: tab === t.k ? "var(--gold-dim)" : "transparent",
              borderLeft:
                tab === t.k ? "2px solid var(--gold)" : "2px solid transparent",
              color: tab === t.k ? "var(--gold)" : "var(--muted)",
              fontSize: 12,
              transition: "all .15s",
            }}
          >
            {t.icon}
            {t.l}
          </div>
        ))}
      </div>
      <div
        style={{
          flex: 1,
          padding: "28px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {tab === "dashboard" && <TabDashboard />}
        {tab === "products" && <TabProducts />}
        {tab === "orders" && <TabOrders />}
        {tab === "users" && session.role === "admin" && <TabUsers />}
        {tab === "settings" && session.role === "admin" && <TabSettings />}
      </div>
    </div>
  );
}

function TabDashboard() {
  const { products, orders } = useStore();
  const stats = {
    ca: orders
      .filter((o) => o.status === "livré")
      .reduce((s, o) => s + o.total, 0),
    total: orders.length,
    pend: orders.filter((o) => ["en attente", "en cours"].includes(o.status))
      .length,
    low: products.filter((p) => p.stock <= 3).length,
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
            l: "Chiffre d'affaires",
            v: fmt(stats.ca),
            c: "var(--gold)",
            d: "Commandes livrées",
          },
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
            d: "Produits ≤ 3",
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
                {fmt(o.total)}
              </span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function TabProducts() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    uploadProductImg,
  } = useStore();
  const isMobile = useIsMobile();
  const blank = {
    name: "",
    brand: "",
    price: "",
    stock: "",
    cat: "",
    size: "100 ml",
    desc: "",
    notes: "",
    img: "🧴",
    imgUrl: null,
  };
  const [showAdd, setShowAdd] = useState(false);
  const [np, setNp] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({});
  const startEdit = (p) => {
    setEditId(p.id);
    setDraft({
      ...p,
      notes: Array.isArray(p.notes) ? p.notes.join(", ") : p.notes,
    });
  };
  const cancelEdit = () => {
    setEditId(null);
    setDraft({});
  };
  const saveEdit = () => {
    updateProduct(editId, draft);
    cancelEdit();
  };
  const TH = ({ c }) => (
    <th
      style={{
        textAlign: "left",
        padding: "9px 12px",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--muted)",
        whiteSpace: "nowrap",
      }}
    >
      {c}
    </th>
  );
  const TD = ({ c, s = {} }) => (
    <td
      style={{
        padding: "8px 10px",
        fontSize: 12,
        verticalAlign: "middle",
        ...s,
      }}
    >
      {c}
    </td>
  );
  const IC = ({ f, type = "text", ph = "" }) => (
    <input
      type={type}
      value={draft[f] ?? ""}
      onChange={(e) => setDraft((d) => ({ ...d, [f]: e.target.value }))}
      placeholder={ph}
      style={{
        width: "100%",
        minWidth: 75,
        background: "#fff",
        border: "1px solid rgba(154,110,46,.35)",
        borderRadius: 3,
        padding: "5px 8px",
        fontSize: 12,
        color: "var(--text)",
        fontFamily: "var(--fb)",
        outline: "none",
      }}
    />
  );
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2 style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 400 }}>
          Produits
        </h2>
        <Btn onClick={() => setShowAdd(!showAdd)}>
          <Plus size={13} />
          Ajouter un parfum
        </Btn>
      </div>
      {showAdd && (
        <Panel
          style={{
            marginBottom: 20,
            background: "rgba(154,110,46,.02)",
            borderColor: "rgba(154,110,46,.25)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--fd)",
              fontSize: 20,
              marginBottom: 18,
              fontWeight: 400,
            }}
          >
            Nouveau parfum
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "0 20px",
            }}
          >
            <div>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 5,
                  }}
                >
                  URL image (CDN)
                </label>
                <div
                  style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                >
                  <div style={{ flex: 1 }}>
                    <input
                      value={np.imgUrl || ""}
                      onChange={(e) =>
                        setNp((p) => ({ ...p, imgUrl: e.target.value }))
                      }
                      placeholder="https://images.unsplash.com/..."
                      style={{
                        width: "100%",
                        background: "var(--surf2)",
                        border: "1px solid var(--border)",
                        borderRadius: 3,
                        padding: "9px 13px",
                        color: "var(--text)",
                        fontSize: 12,
                        outline: "none",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(154,110,46,.4)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--border)")
                      }
                    />
                    <div
                      style={{
                        fontSize: 9,
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      Coller l'URL Unsplash, Cloudinary, ou tout CDN public
                    </div>
                  </div>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 6,
                      overflow: "hidden",
                      background: "#F3EEE7",
                      border: "1px solid var(--border)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {np.imgUrl ? (
                      <img
                        src={np.imgUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <span style={{ fontSize: 24 }}>{np.img}</span>
                    )}
                  </div>
                </div>
              </div>
              <Field
                label="Nom *"
                value={np.name}
                onChange={(v) => setNp((p) => ({ ...p, name: v }))}
                placeholder="Ex : Black Opium"
                req
              />
              <Field
                label="Marque *"
                value={np.brand}
                onChange={(v) => setNp((p) => ({ ...p, brand: v }))}
                placeholder="Ex : YSL"
                req
              />
              <Field
                label="Catégorie"
                value={np.cat}
                onChange={(v) => setNp((p) => ({ ...p, cat: v }))}
                placeholder="Ex : Floral"
              />
              <Field
                label="Emoji (fallback si pas d'image)"
                value={np.img}
                onChange={(v) => setNp((p) => ({ ...p, img: v }))}
                placeholder="🌸"
              />
            </div>
            <div>
              <Field
                label="Prix XAF *"
                value={np.price}
                onChange={(v) => setNp((p) => ({ ...p, price: v }))}
                type="number"
                placeholder="75000"
                req
              />
              <Field
                label="Stock *"
                value={np.stock}
                onChange={(v) => setNp((p) => ({ ...p, stock: v }))}
                type="number"
                placeholder="10"
                req
              />
              <Field
                label="Contenance"
                value={np.size}
                onChange={(v) => setNp((p) => ({ ...p, size: v }))}
                placeholder="100 ml"
              />
              <Field
                label="Notes olfactives (virgule)"
                value={np.notes}
                onChange={(v) => setNp((p) => ({ ...p, notes: v }))}
                placeholder="Rose, Oud, Musc"
              />
              <Field
                label="Description"
                value={np.desc}
                onChange={(v) => setNp((p) => ({ ...p, desc: v }))}
                placeholder="Description courte..."
                multiline
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Btn
              onClick={() => {
                addProduct(np);
                setNp(blank);
                setShowAdd(false);
              }}
            >
              <Check size={13} />
              Enregistrer
            </Btn>
            <Btn v="ghost" onClick={() => setShowAdd(false)}>
              Annuler
            </Btn>
          </div>
        </Panel>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              {[
                "Photo",
                "Nom",
                "Marque",
                "Catégorie",
                "Prix (XAF)",
                "Contenance",
                "Stock",
                "Notes olfactives",
                "Statut",
                "Actions",
              ].map((c) => (
                <TH key={c} c={c} />
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isE = editId === p.id;
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: isE ? "rgba(154,110,46,.04)" : "",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isE) e.currentTarget.style.background = "var(--surf2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isE) e.currentTarget.style.background = "";
                  }}
                >
                  <TD
                    c={
                      isE ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            minWidth: 160,
                          }}
                        >
                          <input
                            value={draft.imgUrl || ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                imgUrl: e.target.value,
                              }))
                            }
                            placeholder="https://..."
                            style={{
                              width: "100%",
                              background: "#fff",
                              border: "1px solid rgba(154,110,46,.35)",
                              borderRadius: 3,
                              padding: "4px 7px",
                              fontSize: 10,
                              color: "var(--text)",
                              fontFamily: "var(--fb)",
                              outline: "none",
                            }}
                          />
                          <div
                            style={{
                              width: "100%",
                              height: 44,
                              borderRadius: 4,
                              overflow: "hidden",
                              background: "#F3EEE7",
                              border: "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {draft.imgUrl ? (
                              <img
                                src={draft.imgUrl}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => (e.target.style.opacity = ".3")}
                              />
                            ) : (
                              <span style={{ fontSize: 18 }}>{p.img}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 6,
                            overflow: "hidden",
                            background: "#F3EEE7",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {p.imgUrl ? (
                            <img
                              src={p.imgUrl}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: 20 }}>{p.img}</span>
                          )}
                        </div>
                      )
                    }
                  />
                  <TD
                    s={{ minWidth: 120 }}
                    c={
                      isE ? <IC f="name" ph="Nom" /> : <strong>{p.name}</strong>
                    }
                  />
                  <TD
                    s={{ minWidth: 110 }}
                    c={
                      isE ? (
                        <IC f="brand" ph="Marque" />
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: 11 }}>
                          {p.brand}
                        </span>
                      )
                    }
                  />
                  <TD
                    s={{ minWidth: 90 }}
                    c={
                      isE ? (
                        <IC f="cat" ph="Catégorie" />
                      ) : (
                        <span style={{ fontSize: 11 }}>{p.cat || "—"}</span>
                      )
                    }
                  />
                  <TD
                    s={{ minWidth: 100 }}
                    c={
                      isE ? (
                        <IC f="price" type="number" />
                      ) : (
                        <span
                          style={{
                            fontFamily: "var(--fd)",
                            color: "var(--gold)",
                            fontSize: 14,
                          }}
                        >
                          {fmt(p.price)}
                        </span>
                      )
                    }
                  />
                  <TD
                    s={{ minWidth: 80 }}
                    c={
                      isE ? (
                        <IC f="size" ph="100 ml" />
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          {p.size}
                        </span>
                      )
                    }
                  />
                  <TD
                    s={{ minWidth: 110 }}
                    c={
                      isE ? (
                        <IC f="stock" type="number" />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <button
                            onClick={() => adjustStock(p.id, -1)}
                            style={{
                              width: 22,
                              height: 22,
                              background: "var(--surf2)",
                              border: "1px solid var(--border)",
                              borderRadius: 3,
                              color: "var(--text)",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            −
                          </button>
                          <span
                            style={{
                              minWidth: 20,
                              textAlign: "center",
                              color: p.stock <= 3 ? "#e65100" : "var(--text)",
                              fontWeight: 500,
                            }}
                          >
                            {p.stock}
                          </span>
                          <button
                            onClick={() => adjustStock(p.id, 1)}
                            style={{
                              width: 22,
                              height: 22,
                              background: "var(--surf2)",
                              border: "1px solid var(--border)",
                              borderRadius: 3,
                              color: "var(--text)",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            +
                          </button>
                        </div>
                      )
                    }
                  />
                  <TD
                    s={{ minWidth: 150 }}
                    c={
                      isE ? (
                        <IC f="notes" ph="Rose, Oud, Musc" />
                      ) : (
                        <div
                          style={{ display: "flex", gap: 3, flexWrap: "wrap" }}
                        >
                          {(Array.isArray(p.notes) ? p.notes : []).map((n) => (
                            <span
                              key={n}
                              style={{
                                fontSize: 9,
                                padding: "2px 6px",
                                background: "var(--surf2)",
                                border: "1px solid var(--border)",
                                borderRadius: 20,
                                color: "var(--muted)",
                              }}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      )
                    }
                  />
                  <TD
                    c={
                      p.stock === 0 ? (
                        <Badge c="red">Épuisé</Badge>
                      ) : p.stock <= 3 ? (
                        <Badge c="orange">Stock faible</Badge>
                      ) : (
                        <Badge c="green">Disponible</Badge>
                      )
                    }
                  />
                  <TD
                    c={
                      isE ? (
                        <div style={{ display: "flex", gap: 5 }}>
                          <Btn sz="sm" onClick={saveEdit}>
                            <Check size={11} />
                            Sauver
                          </Btn>
                          <Btn sz="sm" v="ghost" onClick={cancelEdit}>
                            <X size={11} />
                          </Btn>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 5 }}>
                          <Btn
                            sz="sm"
                            v="outline"
                            onClick={() => startEdit(p)}
                            style={{ padding: "4px 10px" }}
                          >
                            <Edit2 size={11} />
                            Éditer
                          </Btn>
                          <Btn
                            sz="sm"
                            v="danger"
                            onClick={() => deleteProduct(p.id)}
                          >
                            <Trash size={11} />
                          </Btn>
                        </div>
                      )
                    }
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabOrders() {
  const { orders, updateOrderStatus, settings } = useStore();
  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--fd)",
          fontSize: 30,
          marginBottom: 20,
          fontWeight: 400,
        }}
      >
        Commandes ({orders.length})
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {orders.map((o) => (
          <Panel key={o.id} style={{ padding: "14px 18px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontFamily: "var(--fd)", fontSize: 15 }}>
                    {o.id}
                  </span>
                  {sbadge(o.status)}
                  {o.installment && <Badge c="gold">Tranches</Badge>}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 3,
                  }}
                >
                  {o.clientName} · {o.clientPhone} · {o.date}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 4,
                  }}
                >
                  {o.paymentMethod}
                </div>
                <div style={{ fontSize: 11 }}>
                  {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--fd)",
                    fontSize: 20,
                    color: "var(--gold)",
                  }}
                >
                  {fmt(o.total)}
                </div>
                {o.installment && o.installmentPlan && (
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    {fmt(o.installmentPlan.perPart)} × {o.installmentPlan.parts}{" "}
                    tranches
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  {["en attente", "en cours", "livré", "annulé"]
                    .filter((s) => s !== o.status)
                    .map((s) => (
                      <Btn
                        key={s}
                        sz="sm"
                        v="ghost"
                        onClick={() => updateOrderStatus(o.id, s)}
                        style={{ fontSize: 10, padding: "4px 9px" }}
                      >
                        → {s}
                      </Btn>
                    ))}
                  <a
                    href={waLink(
                      o.clientPhone,
                      `Bonjour ${o.clientName}, votre commande ${o.id} est en cours de traitement.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "rgba(37,211,102,.1)",
                      border: "1px solid rgba(37,211,102,.3)",
                      color: "#1a7a3a",
                      padding: "4px 9px",
                      borderRadius: 3,
                      fontSize: 10,
                      textDecoration: "none",
                    }}
                  >
                    <MessageCircle size={10} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </Panel>
        ))}
        {orders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 64,
              color: "var(--muted)",
              fontFamily: "var(--fd)",
              fontSize: 20,
            }}
          >
            Aucune commande
          </div>
        )}
      </div>
    </div>
  );
}

function TabUsers() {
  const { users, orders, settings } = useStore();
  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--fd)",
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

function TabSettings() {
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
            placeholder="237656493976"
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
