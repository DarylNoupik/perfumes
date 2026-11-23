import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;

export async function dataOf(request) {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

async function readAll(table, columns, order) {
  const size = 500;
  const rows = [];
  for (let offset = 0; ; offset += size) {
    const page = await dataOf(supabase.from(table).select(columns).order(order).range(offset, offset + size - 1));
    rows.push(...page);
    if (page.length < size) return rows;
  }
}

export function profileOf(user) {
  if (!user) return null;
  const { email, id, created_at, user_metadata, app_metadata } = user;
  return {
    id, email,
    name: user_metadata?.name || email,
    phone: user_metadata?.phone || user.phone || "",
    role: app_metadata?.role || "client",
    createdAt: created_at?.slice(0, 10),
  };
}

const productFromRow = ({ category, description, icon, image_url, ...row }) => ({
  ...row, cat: category, desc: description, img: icon, imgUrl: image_url,
});

export function productToRow(product) {
  return {
    name: product.name,
    brand: product.brand,
    category: product.cat || "",
    description: product.desc || "",
    size: product.size || "",
    icon: product.img || "",
    image_url: product.imgUrl || null,
    featured: Boolean(product.featured),
    price: Number(product.price),
    stock: Number(product.stock),
    notes: typeof product.notes === "string"
      ? product.notes.split(",").map((note) => note.trim()).filter(Boolean)
      : product.notes ?? [],
  };
}

const detailsFromRow = (row) => ({
  code: row.code ?? "",
  audience: row.audience,
  purchasePrice: row.purchase_price,
  fees: row.fees,
  openingStock: row.opening_stock,
});

export const detailsToRow = (productId, details) => ({
  product_id: productId,
  code: details.code || null,
  audience: details.audience,
  purchase_price: details.purchasePrice,
  fees: details.fees,
  ...(details.openingStock != null && { opening_stock: details.openingStock }),
});

export const movementToRow = (row) => ({
  source_key: row.id,
  product_id: typeof row.productId === "number" ? row.productId : null,
  product_name: row.productName,
  product_code: row.code,
  audience: row.audience,
  occurred_on: row.date,
  quantity: row.quantity,
  planned_price: row.plannedPrice,
  unit_price: row.unitPrice,
  unit_cost: row.cost,
  price_from_plan: Boolean(row.priceFromPlan),
});

const movementFromRow = (row) => ({
  id: row.id,
  kind: row.kind,
  productId: row.product_id ?? row.product_code ?? row.product_name,
  productName: row.product_name,
  code: row.product_code,
  audience: row.audience,
  date: row.occurred_on,
  quantity: row.quantity,
  plannedPrice: row.planned_price,
  unitPrice: row.unit_price,
  cost: row.unit_cost,
  priceFromPlan: row.price_from_plan,
  note: row.note,
});

export async function readShop(profile) {
  const admin = profile?.role === "admin";
  const [products, settings, orders, details, movements, tracking, users] = await Promise.all([
    readAll("products", "*", "id"),
    dataOf(supabase.from("shop_settings").select("storefront, low_stock_threshold").eq("id", 1).single()),
    profile ? readAll("orders", "*, order_items(*)", "id") : [],
    admin ? readAll("product_tracking", "*", "product_id") : [],
    admin ? readAll("stock_movements", "*", "id") : [],
    admin ? readAll("order_item_tracking", "*", "order_id") : [],
    admin ? dataOf(supabase.rpc("shop_users")) : [],
  ]);
  const productDetails = Object.fromEntries(details.map((row) => [row.product_id, detailsFromRow(row)]));
  const saleDetails = new Map(tracking.map((row) => [`${row.order_id}:${row.product_id}`, row]));
  return {
    settings: settings.storefront,
    users: users.map(({ created_at, ...user }) => ({ ...user, createdAt: created_at?.slice(0, 10) })),
    inventory: {
      products: products.map(productFromRow),
      orders: orders.sort((a, b) => b.placed_at.localeCompare(a.placed_at)).map((order) => {
        const items = order.order_items.sort((a, b) => a.product_id - b.product_id).map((line) => {
          const sale = saleDetails.get(`${order.id}:${line.product_id}`);
          const details = productDetails[line.product_id];
          return {
            productId: line.product_id, name: line.product_name, qty: line.quantity,
            price: line.planned_price, actualPrice: sale?.actual_price, cost: sale?.unit_cost,
            code: details?.code, audience: details?.audience,
          };
        });
        return {
          id: order.id, clientId: order.customer_id, clientName: order.customer_name,
          clientPhone: order.customer_phone, date: order.placed_at.slice(0, 10),
          status: order.status, paymentMethod: order.payment_method,
          installment: Boolean(order.installment_plan), installmentPlan: order.installment_plan,
          total: items.reduce((sum, line) => sum + line.price * line.qty, 0),
          items,
        };
      }),
      details: productDetails,
      movements: movements.map(movementFromRow),
      lowStockThreshold: settings.low_stock_threshold,
    },
  };
}
