import { SEED_ORDERS } from "../data/demoAccounts.js";
import { SEED_PRODUCTS } from "../data/products.js";

const STORAGE_KEY = "dihu.inventory.v1";
export const AUDIENCES = ["Femme", "Homme", "Mixte", "Non renseigné"];
const DEMO_ORDER_IDS = new Set(SEED_ORDERS.map(({ id }) => id));
const OPENING_STOCK = new Map(SEED_PRODUCTS.map(({ id, stock }) => [id, stock]));

export function loadInventory() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved?.products) && Array.isArray(saved.orders) &&
        Array.isArray(saved.movements) && saved.details &&
        Number.isSafeInteger(saved.lowStockThreshold)) return saved;
  } catch {
    // The catalogue can still load when browser storage is unavailable.
  }
  return { products: SEED_PRODUCTS, orders: SEED_ORDERS, movements: [], details: {}, lowStockThreshold: 1 };
}

export function saveInventory(inventory) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

export function unitCost(details) {
  return details?.purchasePrice == null ? null : details.purchasePrice + details.fees;
}

export function applyMovement(inventory, input) {
  const { productId, quantity, unitPrice, kind, date } = input;
  const product = inventory.products.find(({ id }) => id === productId);
  if (!product) return { error: "Ce parfum ne figure plus dans le catalogue." };
  if (!["sale", "receipt"].includes(kind) || !Number.isSafeInteger(quantity) || quantity < 1 ||
      !Number.isSafeInteger(unitPrice) || unitPrice < 0 || !Number.isSafeInteger(quantity * unitPrice)) {
    return { error: "Vérifie la quantité et le prix unitaire." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Vérifie la date du mouvement." };
  if (kind === "sale" && quantity > product.stock) return { error: "Stock insuffisant pour cette vente." };
  const details = inventory.details[productId];
  const movement = {
    ...input,
    productName: product.name,
    code: details?.code,
    audience: details?.audience,
    cost: kind === "sale" ? unitCost(details) : null,
    ...(kind === "sale" && { plannedPrice: product.price }),
  };
  const delta = kind === "sale" ? -quantity : quantity;
  return {
    inventory: {
      ...inventory,
      products: inventory.products.map((p) => p.id === productId ? { ...p, stock: p.stock + delta } : p),
      movements: [movement, ...inventory.movements],
    },
  };
}

export function applyOrderStatus(inventory, id, status) {
  const order = inventory.orders.find((entry) => entry.id === id);
  if (!order || order.status === status) return { inventory };

  let products = inventory.products;
  if (order.tracksStock && (order.status === "annulé" || status === "annulé")) {
    const reopening = order.status === "annulé";
    if (reopening && order.items.some((item) =>
      (products.find((p) => p.id === item.productId)?.stock ?? 0) < item.qty)) {
      return { error: "Stock insuffisant pour rouvrir cette commande." };
    }
    products = products.map((product) => {
      const item = order.items.find((line) => line.productId === product.id);
      return item ? { ...product, stock: product.stock + (reopening ? -item.qty : item.qty) } : product;
    });
  }
  return {
    inventory: {
      ...inventory,
      products,
      orders: inventory.orders.map((entry) => entry.id === id ? { ...entry, status } : entry),
    },
  };
}

export function applyActualSalePrice(inventory, sale, actualPrice) {
  const order = inventory.orders.find(({ id }) => id === sale.orderId);
  const item = order?.items[sale.itemIndex];
  const movement = inventory.movements.find(({ id, kind }) => id === sale.id && kind === "sale");
  const quantity = sale.orderId ? item?.qty : movement?.quantity;
  const plannedPrice = sale.orderId ? item?.price : movement?.plannedPrice;
  const effectivePrice = actualPrice ?? plannedPrice;
  if (!quantity || (sale.orderId && (order.status !== "livré" || DEMO_ORDER_IDS.has(order.id)))) {
    return { error: "Cette vente n’est plus disponible." };
  }
  if (!Number.isSafeInteger(effectivePrice) || effectivePrice < 0 ||
      !Number.isSafeInteger(effectivePrice * quantity)) {
    return { error: "Saisis un prix réel valide." };
  }
  if (!sale.orderId) {
    return { inventory: { ...inventory, movements: inventory.movements.map((entry) =>
      entry === movement ? { ...entry, unitPrice: effectivePrice, priceFromPlan: actualPrice == null } : entry) } };
  }
  return { inventory: { ...inventory, orders: inventory.orders.map((entry) => entry === order ? {
    ...entry,
    items: entry.items.map((line, index) => index === sale.itemIndex ? { ...line, actualPrice } : line),
  } : entry) } };
}

export function mergeHistoricalSales(inventory, { sales, details: importedDetails }) {
  const seen = new Set(inventory.movements.map(({ id }) => id));
  const additions = sales.filter(({ id }) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const details = { ...inventory.details };
  let updatedReferences = 0;
  for (const [id, imported] of Object.entries(importedDetails)) {
    const existing = details[id];
    const merged = { ...imported, ...existing };
    if (Object.keys(imported).every((key) => merged[key] === existing?.[key])) continue;
    details[id] = merged;
    updatedReferences++;
  }
  return {
    count: additions.length,
    updatedReferences,
    inventory: { ...inventory, details, movements: [...inventory.movements, ...additions] },
  };
}

export function stockStatus(stock, threshold) {
  if (stock <= 0) return { label: "Épuisé", color: "red" };
  if (stock <= threshold) return { label: "Stock faible", color: "orange" };
  return { label: "En stock", color: "green" };
}

export const orderSalePrice = (item) => item.actualPrice ?? item.price;

function saleTotals(sales) {
  return sales.reduce((totals, { quantity, unitPrice, plannedPrice, cost }) => {
    const amount = quantity * unitPrice;
    totals.sold += quantity;
    totals.revenue += amount;
    if (plannedPrice != null) {
      totals.plannedRevenue += plannedPrice * quantity;
      totals.revenueVariance += (unitPrice - plannedPrice) * quantity;
    } else {
      totals.missingPlanned += quantity;
    }
    if (cost != null) {
      totals.soldCost += cost * quantity;
      totals.profit += amount - cost * quantity;
    } else {
      totals.missingSaleCost += quantity;
    }
    return totals;
  }, { sold: 0, revenue: 0, plannedRevenue: 0, revenueVariance: 0, missingPlanned: 0,
    soldCost: 0, profit: 0, missingSaleCost: 0 });
}

export function inventoryReport({ products, orders, movements, details }) {
  const receipts = movements.filter(({ kind }) => kind === "receipt").sort((a, b) => b.date.localeCompare(a.date));
  const sales = [
    ...movements.filter(({ kind }) => kind === "sale"),
    ...orders.filter(({ id, status }) => status === "livré" && !DEMO_ORDER_IDS.has(id))
      .flatMap((order) => order.items.map((item, index) => ({
        id: `${order.id}-${index}`,
        orderId: order.id,
        itemIndex: index,
        date: order.date,
        productId: item.productId,
        productName: item.name,
        quantity: item.qty,
        unitPrice: orderSalePrice(item),
        plannedPrice: item.price,
        cost: item.cost ?? null,
        code: item.code,
        audience: item.audience,
        note: order.id,
      }))),
  ].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const salesByProduct = new Map();
  for (const sale of sales) {
    if (!salesByProduct.has(sale.productId)) salesByProduct.set(sale.productId, []);
    salesByProduct.get(sale.productId).push(sale);
  }
  const stock = products.map((product) => {
    const info = details[product.id];
    const cost = unitCost(info);
    const productSales = salesByProduct.get(product.id) ?? [];
    return {
      ...product,
      info,
      audience: info?.audience || "Non renseigné",
      cost,
      openingStock: info?.openingStock ?? product.openingStock ?? OPENING_STOCK.get(product.id) ?? product.stock,
      received: receipts.filter((row) => row.productId === product.id).reduce((sum, row) => sum + row.quantity, 0),
      sold: productSales.reduce((sum, row) => sum + row.quantity, 0),
      remainingRevenue: product.stock * product.price,
    };
  });
  const summarize = (stockRows, receiptRows, saleRows, label) => ({
    label,
    references: stockRows.length,
    openingStock: stockRows.reduce((sum, row) => sum + row.openingStock, 0),
    received: receiptRows.reduce((sum, row) => sum + row.quantity, 0),
    ...saleTotals(saleRows),
    stock: stockRows.reduce((sum, row) => sum + row.stock, 0),
    stockValue: stockRows.reduce((sum, row) => sum + (row.cost ?? 0) * row.stock, 0),
    remainingRevenue: stockRows.reduce((sum, row) => sum + row.remainingRevenue, 0),
    potential: stockRows.reduce((sum, row) => sum + (row.cost == null ? 0 : (row.price - row.cost) * row.stock), 0),
    missingStockCost: stockRows.filter((row) => row.cost == null).reduce((sum, row) => sum + row.stock, 0),
  });
  const audienceOf = (row) => row.audience ?? details[row.productId]?.audience ?? "Non renseigné";
  const summary = AUDIENCES.map((audience) => summarize(
    stock.filter((row) => row.audience === audience),
    receipts.filter((row) => audienceOf(row) === audience),
    sales.filter((row) => audienceOf(row) === audience),
    audience,
  ));
  const productsById = new Map(products.map((product) => [product.id, product]));
  const realized = Array.from(salesByProduct, ([id, rows]) => ({
    id,
    name: productsById.get(id)?.name ?? rows[0].productName,
    ...saleTotals(rows),
  }));
  return { stock, receipts, sales, realized, summary, total: summarize(stock, receipts, sales, "Total") };
}
