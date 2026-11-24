import { Check, Edit2, Plus, Trash, X } from "lucide-react";
import { useState } from "react";
import { Badge, Btn, Field, Panel } from "../../components/ui.jsx";
import { useIsMobile } from "../../hooks/browser.js";
import { fmt } from "../../lib/currency.js";
import { stockStatus } from "../../store/inventory.js";
import { useStore } from "../../store/ShopStore.jsx";

export function TabProducts({ openInventory }) {
  const {
    products,
    inventory,
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
  const saveEdit = async () => {
    if (await updateProduct(editId, draft)) cancelEdit();
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
        <h2 style={{ fontFamily: "var(--fb)", fontSize: 30, fontWeight: 400 }}>
          Produits
        </h2>
        {openInventory && <Btn v="ghost" sz="sm" onClick={() => openInventory("Stock")}>Voir le suivi du stock</Btn>}
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
              fontFamily: "var(--fb)",
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
              onClick={async () => {
                if (await addProduct(np)) {
                  setNp(blank);
                  setShowAdd(false);
                }
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
                      isE ? <IC f="name" ph="Nom" /> : (
                        <>
                          <strong>{p.name}</strong>
                          {openInventory && inventory.details[p.id]?.code && (
                            <div className="admin-secondary">
                              {inventory.details[p.id].code} · {inventory.details[p.id].audience}
                            </div>
                          )}
                        </>
                      )
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
                            fontFamily: "var(--fb)",
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
                              color: p.stock <= inventory.lowStockThreshold ? "#e65100" : "var(--text)",
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
                      <Badge c={stockStatus(p.stock, inventory.lowStockThreshold).color}>
                        {stockStatus(p.stock, inventory.lowStockThreshold).label}
                      </Badge>
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
