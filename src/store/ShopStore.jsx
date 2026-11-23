import { LocalShopStore } from "./LocalShopStore.jsx";
import { RemoteShopStore } from "./RemoteShopStore.jsx";

export { useStore } from "./ShopContext.js";

const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

export const StoreProvider = hasSupabase ? RemoteShopStore : LocalShopStore;
