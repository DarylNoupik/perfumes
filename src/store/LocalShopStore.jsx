import { useCallback, useRef, useState } from "react";
import { SEED_SETTINGS } from "../config/shop.js";
import { SEED_USERS } from "../data/demoAccounts.js";
import { ShopContext } from "./ShopContext.js";
import { applyActualSalePrice, applyMovement, applyOrderStatus, AUDIENCES, loadInventory, mergeHistoricalSales, saveInventory, unitCost } from "./inventory.js";

const genId = () => "CMD-" + (1000 + Math.floor(Math.random() * 8999));
const eligible = (s, delivered, price) =>
  delivered >= s.installMinOrders && price > s.installMinPrice;

export function LocalShopStore({ children }) {
  const [settings, _setSettings] = useState(SEED_SETTINGS);
  const [inventory, setInventory] = useState(loadInventory);
  const currentInventory = useRef(inventory);
  const { products, orders } = inventory;
  const [users, _setUsers] = useState(SEED_USERS);
  const [session, setSession] = useState(null);
  const [cart, setCart] = useState([]);
  const [toast, _setToast] = useState(null);

  const notify = useCallback((msg, type = "ok") => {
    _setToast({ msg, type });
    setTimeout(() => _setToast(null), 3000);
  }, []);

  const commitInventory = (next) => {
    try {
      saveInventory(next);
    } catch {
      notify("Le navigateur n’a pas pu enregistrer les modifications.", "err");
      return false;
    }
    currentInventory.current = next;
    setInventory(next);
    return true;
  };
  const _setProducts = (update) => {
    const current = currentInventory.current;
    return commitInventory({ ...current, products: update(current.products) });
  };
  const recordInventoryMovement = (input) => {
    if (session?.role !== "admin") return false;
    const result = applyMovement(currentInventory.current, { ...input, id: crypto.randomUUID() });
    if (result.error) {
      notify(result.error, "err");
      return false;
    }
    return commitInventory(result.inventory);
  };
  const updateActualSalePrice = (sale, price) => {
    if (session?.role !== "admin") return false;
    const result = applyActualSalePrice(currentInventory.current, sale, price);
    if (result.error) {
      notify(result.error, "err");
      return false;
    }
    return commitInventory(result.inventory);
  };
  const importHistoricalSales = (workbook) => {
    if (session?.role !== "admin") return null;
    const { inventory: next, count, updatedReferences } = mergeHistoricalSales(currentInventory.current, workbook);
    if ((count || updatedReferences) && !commitInventory(next)) return null;
    return { count, updatedReferences };
  };
  const updateInventoryDetails = (productId, details) => {
    if (session?.role !== "admin") return false;
    const current = currentInventory.current;
    const { code, audience, purchasePrice, fees } = details;
    const validAmount = (amount) => Number.isSafeInteger(amount) && amount >= 0;
    if (!AUDIENCES.includes(audience) || !validAmount(fees) ||
        (purchasePrice !== null && (!validAmount(purchasePrice) || !validAmount(purchasePrice + fees)))) {
      notify("Vérifie les coûts saisis.", "err");
      return false;
    }
    if (code && Object.entries(current.details).some(([id, detail]) =>
      id !== String(productId) && detail.code.toLowerCase() === code.toLowerCase())) {
      notify("Ce code est déjà utilisé pour un autre parfum.", "err");
      return false;
    }
    return commitInventory({
      ...current,
      details: { ...current.details, [productId]: { ...current.details[productId], ...details } },
    });
  };
  const updateLowStockThreshold = (lowStockThreshold) =>
    session?.role === "admin" && Number.isSafeInteger(lowStockThreshold) && lowStockThreshold >= 0 &&
    commitInventory({ ...currentInventory.current, lowStockThreshold });

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
  const placeOrder = (payMethod, inst, plan, contact) => {
    if (!session) return false;
    const current = currentInventory.current;
    if (cart.some((item) => (current.products.find(({ id }) => id === item.id)?.stock ?? 0) < item.qty)) {
      notify("Le stock a changé. Vérifie les quantités de ton panier.", "err");
      return false;
    }
    const reference = genId();
    const o = {
      id: current.orders.some(({ id }) => id === reference) ? `${reference}-${crypto.randomUUID()}` : reference,
      clientId: session.id,
      clientName: contact?.name.trim() || session.name,
      clientPhone: contact?.phone.trim() || session.phone || "",
      address: contact?.address.trim() || "",
      items: cart.map((i) => {
        const details = current.details[i.id];
        return {
          productId: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          cost: unitCost(details),
          audience: details?.audience,
          code: details?.code,
        };
      }),
      total: cartTotal,
      status: "en attente",
      tracksStock: true,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: payMethod,
      installment: inst,
      installmentPlan: plan || null,
    };
    const saved = commitInventory({
      ...current,
      orders: [o, ...current.orders],
      products: current.products.map((pr) => {
        const ci = cart.find((i) => i.id === pr.id);
        return ci ? { ...pr, stock: Math.max(0, pr.stock - ci.qty) } : pr;
      }),
    });
    if (!saved) return false;
    clearCart();
    notify("Commande confirmée ! 🎉");
    return true;
  };
  const updateOrderStatus = (id, status) => {
    const result = applyOrderStatus(currentInventory.current, id, status);
    if (result.error) notify(result.error, "err");
    else if (commitInventory(result.inventory)) notify(`Statut → ${status}`);
  };

  // Products
  const addProduct = (data) => {
    const p = {
      ...data,
      id: Date.now(),
      featured: false,
      price: parseInt(data.price) || 0,
      stock: parseInt(data.stock) || 0,
      openingStock: parseInt(data.stock) || 0,
      notes:
        typeof data.notes === "string"
          ? data.notes
              .split(",")
              .map((n) => n.trim())
              .filter(Boolean)
          : data.notes || [],
    };
    const saved = _setProducts((prev) => [p, ...prev]);
    if (saved) notify("Parfum ajouté ✓");
    return saved;
  };
  const updateProduct = (id, data) => {
    const saved = _setProducts((prev) =>
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
    if (saved) notify("Modifications enregistrées ✓");
    return saved;
  };
  const deleteProduct = (id) => {
    if (_setProducts((p) => p.filter((x) => x.id !== id))) notify("Produit supprimé");
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
      const saved = _setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, imgUrl: e.target.result } : p)),
      );
      if (saved) notify("Image mise à jour ✓");
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
    <ShopContext.Provider
      value={{
        settings,
        updateSettings,
        inventory,
        recordInventoryMovement,
        updateActualSalePrice,
        importHistoricalSales,
        updateInventoryDetails,
        updateLowStockThreshold,
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
    </ShopContext.Provider>
  );
}
