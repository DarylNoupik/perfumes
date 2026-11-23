import { BarChart2, ClipboardList, Package, Settings, Truck, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui.jsx";
import { useStore } from "../../store/ShopStore.jsx";
import { InventoryPage } from "./inventory/InventoryPage.jsx";
import { TabDashboard } from "./TabDashboard.jsx";
import { TabOrders } from "./TabOrders.jsx";
import { TabProducts } from "./TabProducts.jsx";
import { TabSettings } from "./TabSettings.jsx";
import { TabUsers } from "./TabUsers.jsx";
import "./admin.css";

export function AdminPage() {
  const { session } = useStore();
  const isAdmin = session?.role === "admin";
  const [tab, setTab] = useState("dashboard");
  const [inventoryView, setInventoryView] = useState("Synthèse");
  const openInventory = isAdmin ? (view) => {
    setInventoryView(view);
    setTab("inventory");
  } : undefined;
  const tabs = [
    { id: "dashboard", label: "Vue d’ensemble", Icon: BarChart2, Page: TabDashboard },
    { id: "inventory", label: "Suivi des parfums", Icon: ClipboardList, Page: InventoryPage, adminOnly: true },
    { id: "products", label: "Produits", Icon: Package, Page: TabProducts },
    { id: "orders", label: "Commandes", Icon: Truck, Page: TabOrders },
    { id: "users", label: "Utilisateurs", Icon: Users, Page: TabUsers, adminOnly: true },
    { id: "settings", label: "Paramètres", Icon: Settings, Page: TabSettings, adminOnly: true },
  ].filter(({ adminOnly }) => isAdmin || !adminOnly);
  const { Page, id } = tabs.find((entry) => entry.id === tab) ?? tabs[0];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-profile">
          <strong>{session?.name}</strong>
          <Badge c={isAdmin ? "gold" : "blue"}>{isAdmin ? "Administrateur" : "Vendeur"}</Badge>
        </div>
        <nav className="admin-nav" aria-label="Administration">
          {tabs.map(({ id: section, label, Icon }) => (
            <button key={section} type="button" aria-current={id === section ? "page" : undefined} onClick={() => {
              if (section === "inventory" && id !== section) setInventoryView("Synthèse");
              setTab(section);
            }}>
              <Icon aria-hidden="true" size={16} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="admin-content">
        <Page key={id} openInventory={openInventory} initialView={inventoryView} />
      </div>
    </div>
  );
}
