import { useCallback, useEffect, useRef, useState } from "react";
import { SEED_SETTINGS, SITE_URL } from "../config/shop.js";
import { ShopContext } from "./ShopContext.js";
import { dataOf, detailsToRow, movementToRow, productToRow, profileOf, readShop, supabase } from "./supabaseShop.js";

const emptyInventory = { products: [], orders: [], movements: [], details: {}, lowStockThreshold: 1 };

export function RemoteShopStore({ children }) {
  const [session, setSession] = useState(undefined);
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [cart, setCart] = useState([]);
  // Arrivé depuis le lien « mot de passe oublié » : on demande le nouveau mot de passe
  const [recovering, setRecovering] = useState(false);
  const checkoutKey = useRef(null);
  const noticeTimer = useRef(null);
  const fetchVersion = useRef(0);
  const activeSession = useRef(undefined);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (event === "SIGNED_OUT") setRecovering(false);
      const next = profileOf(authSession?.user);
      if (next?.id !== activeSession.current?.id || next?.role !== activeSession.current?.role) {
        fetchVersion.current++;
        setShop(null);
      }
      activeSession.current = next;
      setSession(next);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(noticeTimer.current);
    };
  }, []);

  const refresh = useCallback(async (profile) => {
    const version = ++fetchVersion.current;
    setError(null);
    try {
      const next = await readShop(profile);
      if (version === fetchVersion.current) setShop(next);
    } catch {
      if (version === fetchVersion.current) setError("Impossible de charger les données de la boutique.");
    }
  }, []);

  const sessionId = session?.id;
  const sessionRole = session?.role;
  const authReady = session !== undefined;
  useEffect(() => {
    if (!authReady) return;
    const profile = sessionId ? { id: sessionId, role: sessionRole } : null;
    const reload = () => void refresh(profile);
    reload();
    window.addEventListener("focus", reload);
    return () => {
      fetchVersion.current++;
      window.removeEventListener("focus", reload);
    };
  }, [authReady, sessionId, sessionRole, refresh]);

  const notify = useCallback((msg, type = "ok") => {
    clearTimeout(noticeTimer.current);
    setToast({ msg, type });
    noticeTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const perform = async (request, message) => {
    try {
      const data = await dataOf(request);
      await refresh(activeSession.current);
      if (message) notify(message);
      return { data };
    } catch (failure) {
      notify(failure.message || "Impossible d’enregistrer la modification.", "err");
      return null;
    }
  };
  const run = async (request, message) => Boolean(await perform(request, message));
  const rpc = (name, args) => supabase.rpc(name, args);

  const inventory = shop?.inventory ?? emptyInventory;
  const { products, orders } = inventory;
  const currentCart = cart.map((item) => ({ ...item, price: products.find(({ id }) => id === item.id)?.price ?? item.price }));
  const settings = { ...SEED_SETTINGS, ...shop?.settings };
  const myOrders = orders.filter((order) => order.clientId === session?.id);
  const deliveredCount = myOrders.filter(({ status }) => status === "livré").length;
  const canInstall = (product) => session?.role === "client" &&
    deliveredCount >= Math.max(2, settings.installMinOrders) && product.price > settings.installMinPrice;

  const login = async (email, password) => {
    const { error: failure } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (failure) notify(failure.message, "err");
    else notify("Bienvenue !");
    return !failure;
  };
  const register = async ({ name, phone, email, password }) => {
    const { data, error: failure } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { emailRedirectTo: SITE_URL, data: { name: name.trim(), phone: phone.trim() } },
    });
    if (failure) notify(failure.message, "err");
    else notify(data.session ? "Bienvenue !" : "Vérifie ton e-mail pour confirmer ton compte.");
    return !failure;
  };
  const requestPasswordReset = async (email) => {
    const { error: failure } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: SITE_URL });
    if (failure) notify(failure.message, "err");
    // Même message que le compte existe ou non, pour ne pas révéler les adresses inscrites
    else notify("Si un compte existe pour cette adresse, un e-mail vient d'être envoyé.");
    return !failure;
  };
  const updatePassword = async (password) => {
    const { error: failure } = await supabase.auth.updateUser({ password });
    if (failure) notify(failure.message, "err");
    else {
      setRecovering(false);
      notify("Mot de passe modifié.");
    }
    return !failure;
  };
  const logout = async () => {
    const { error: failure } = await supabase.auth.signOut();
    if (failure) notify(failure.message, "err");
    else notify("Déconnecté");
  };

  const clearCart = () => {
    checkoutKey.current = null;
    setCart([]);
  };
  const addToCart = (product, qty = 1) => {
    checkoutKey.current = null;
    setCart((current) => current.some(({ id }) => id === product.id)
      ? current.map((item) => item.id === product.id ? { ...item, qty: item.qty + qty } : item)
      : [...current, { ...product, qty }]);
    notify(`${product.name} ajouté au panier`);
  };
  const removeFromCart = (id) => {
    checkoutKey.current = null;
    setCart((current) => current.filter((item) => item.id !== id));
  };
  const placeOrder = async (payment, installments, _plan, contact) => {
    if (!cart.length) return false;
    if (!session) {
      notify("Connecte-toi pour passer commande.", "err");
      return false;
    }
    checkoutKey.current ??= crypto.randomUUID();
    const result = await perform(rpc("checkout_shop", {
      customer_name: contact.name, customer_phone: contact.phone, delivery_address: contact.address,
      payment_method: payment, request_id: checkoutKey.current, installments,
      items: cart.map(({ id, qty }) => ({ product_id: id, quantity: qty })),
    }), "Commande confirmée !");
    if (!result) return false;
    clearCart();
    // Renvoie la référence de la commande (uuid) pour le message WhatsApp
    return result.data || true;
  };

  const updateActualSalePrice = (sale, price) => {
    if (sale.orderId) return run(supabase.from("order_item_tracking").upsert({
      order_id: sale.orderId, product_id: sale.productId, actual_price: price,
    }, { onConflict: "order_id,product_id", defaultToNull: false }), "Prix réel enregistré.");
    const effective = price ?? sale.plannedPrice;
    if (effective == null) return false;
    return run(supabase.from("stock_movements").update({
      unit_price: effective, price_from_plan: price == null,
    }).eq("id", sale.id).eq("kind", "sale"), "Prix réel enregistré.");
  };
  const importHistoricalSales = async ({ sales, details }) => {
    const result = await perform(rpc("import_shop_history", {
      sales_data: sales.map(movementToRow),
      references_data: Object.entries(details).map(([id, row]) => detailsToRow(Number(id), row)),
    }));
    return result?.data ?? null;
  };
  const uploadProductImg = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => void run(supabase.from("products").update({ image_url: reader.result }).eq("id", id), "Image mise à jour.");
    reader.onerror = () => notify("Impossible de lire cette image.", "err");
    reader.readAsDataURL(file);
  };

  const value = {
    settings, inventory, products, orders, session: session ?? null, remote: true,
    users: shop?.users ?? [], cart: currentCart, myOrders, deliveredCount, canInstall, toast, notify,
    login, register, logout, requestPasswordReset, updatePassword, recovering,
    cancelRecovery: () => setRecovering(false), addToCart, removeFromCart, clearCart, placeOrder,
    cartTotal: currentCart.reduce((sum, item) => sum + item.qty * item.price, 0),
    cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
    updateSettings: (patch) => run(supabase.from("shop_settings").update({ storefront: patch }).eq("id", 1).select("id").single(), "Paramètres enregistrés."),
    updateLowStockThreshold: (threshold) => run(supabase.from("shop_settings").update({ low_stock_threshold: threshold }).eq("id", 1)),
    updateInventoryDetails: (id, details) => run(supabase.from("product_tracking").upsert(detailsToRow(id, details), { defaultToNull: false })),
    addProduct: (product) => run(supabase.from("products").insert(productToRow(product)), "Parfum ajouté."),
    updateProduct: (id, product) => run(supabase.from("products").update(productToRow(product)).eq("id", id).select("id").single(), "Parfum mis à jour."),
    deleteProduct: (id) => run(supabase.from("products").delete().eq("id", id).select("id").single(), "Parfum supprimé."),
    adjustStock: (id, delta) => run(rpc("adjust_shop_stock", { product_ref: id, delta })),
    updateOrderStatus: (id, status) => run(rpc("set_shop_order_status", { order_ref: id, next_status: status }), "Statut mis à jour."),
    recordInventoryMovement: (movement) => run(rpc("record_shop_movement", {
      product_ref: movement.productId, movement_kind: movement.kind, movement_date: movement.date,
      units: movement.quantity, amount: movement.unitPrice, remark: movement.note,
    })),
    updateUser: (id, { name, phone, role }) => run(rpc("update_shop_user", {
      user_ref: id, new_name: name, new_phone: phone, new_role: role,
    }), "Utilisateur mis à jour."),
    updateActualSalePrice, importHistoricalSales, uploadProductImg,
  };

  if (!shop) return (
    <main style={{ padding: 24 }}>
      <p role="status">{error || "Chargement de la boutique…"}</p>
      {error && <button type="button" onClick={() => void refresh(activeSession.current)}>Réessayer</button>}
    </main>
  );
  return (
    <ShopContext.Provider value={value}>
      {error && <p role="status" style={{ padding: 12 }}>{error}</p>}
      {children}
    </ShopContext.Provider>
  );
}
