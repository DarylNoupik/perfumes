import { useState } from "react";
import { Panel } from "../../../components/ui.jsx";
import { fmt } from "../../../lib/currency.js";
import { AUDIENCES, inventoryReport, stockStatus } from "../../../store/inventory.js";
import { useStore } from "../../../store/ShopStore.jsx";
import { readSalesWorkbook } from "./salesWorkbook.js";
import "./inventory.css";

const money = (amount) => amount == null ? "—" : fmt(amount);
const percent = (value, base) =>
  base > 0 && value != null ? new Intl.NumberFormat("fr-FR", {
    style: "percent", maximumFractionDigits: 1,
  }).format(value / base) : "—";

function Table({ caption, columns, rows }) {
  return (
    <div className="inventory-table" tabIndex={0} role="region" aria-label={caption}>
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>{columns.map((label) => <th key={label} scope="col">{label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length}>Aucune donnée.</td></tr>}
          {rows.map(({ id, cells }) => (
            <tr key={id}>
              {cells.map((cell, index) => <td key={columns[index]}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Summary({ report }) {
  const { summary, total } = report;
  return (
    <>
      <div className="inventory-metrics">
        {[
          ["Flacons en stock", total.stock],
          ["Valeur du stock au coût connu", money(total.stockValue)],
          ["Chiffre d’affaires", money(total.revenue)],
          ["Bénéfice sur ventes à coût connu", money(total.profit)],
        ].map(([label, value]) => (
          <Panel key={label}>
            <div>{label}</div>
            <strong>{value}</strong>
          </Panel>
        ))}
      </div>
      {(total.missingStockCost > 0 || total.missingSaleCost > 0) && (
        <p>Coût indisponible pour {total.missingStockCost} flacon(s) en stock et {total.missingSaleCost} flacon(s) vendu(s).</p>
      )}
      <Table
        caption="Synthèse par sexe"
        columns={["Sexe", "Références", "Initial", "Entrées", "Vendus", "Restant", "Valeur au coût connu", "Part du stock valorisé", "CA", "Bénéfice connu", "Potentiel connu"]}
        rows={[...summary, total].map((r) => ({
          id: r.label,
          cells: [r.label, r.references, r.openingStock, r.received, r.sold, r.stock, money(r.stockValue),
            percent(r.stockValue, total.stockValue), money(r.revenue), money(r.profit), money(r.potential)],
        }))}
      />
    </>
  );
}

function Stock({ report, threshold }) {
  return (
    <Table
      caption="Stock par parfum"
      columns={["Code", "Parfum", "Sexe", "Contenance", "Prix de vente", "Initial", "Entrées", "Vendus", "Disponible", "Valeur au coût", "Statut"]}
      rows={report.stock.map((p) => ({
        id: p.id,
        cells: [p.info?.code || "—", p.name, p.audience, p.size, money(p.price), p.openingStock, p.received,
          p.sold, p.stock, p.stock === 0 ? money(0) : money(p.cost == null ? null : p.stock * p.cost),
          stockStatus(p.stock, threshold).label],
      }))}
    />
  );
}

function Profitability({ report }) {
  const { stock, realized, total } = report;
  return (
    <>
      <div className="inventory-metrics">
        {[
          ["CA des ventes réalisées", money(total.revenue)],
          ["CA prévisionnel du stock restant", money(total.remainingRevenue)],
          ["CA total si tout le stock restant est vendu", money(total.revenue + total.remainingRevenue)],
          ["ROI réalisé", total.missingSaleCost ? "—" : percent(total.profit, total.soldCost)],
          ["Bénéfice potentiel du stock restant", money(total.missingStockCost ? null : total.potential)],
        ].map(([label, value]) => (
          <Panel key={label}><div>{label}</div><strong>{value}</strong></Panel>
        ))}
      </div>
      <Table
        caption="Ventes réalisées par parfum"
        columns={["Parfum", "Flacons vendus", "CA prévu", "CA réalisé", "Écart", "Coût des flacons vendus", "Bénéfice obtenu", "ROI réalisé"]}
        rows={[...realized, { ...total, id: "total", name: "Total" }].map((p) => ({
          id: p.id,
          cells: [
            p.name, p.sold, money(p.missingPlanned ? null : p.plannedRevenue), money(p.revenue),
            money(p.missingPlanned ? null : p.revenueVariance), money(p.missingSaleCost ? null : p.soldCost),
            money(p.missingSaleCost ? null : p.profit), percent(p.missingSaleCost ? null : p.profit, p.soldCost),
          ],
        }))}
      />
      <Table
        caption="Projection sur le stock restant"
        columns={["Parfum", "Prix d’achat", "Frais par flacon", "Coût de revient", "Prix de vente prévu",
          "Bénéfice unitaire", "Marge", "ROI prévisionnel", "Flacons restants", "CA prévisionnel", "Bénéfice potentiel"]}
        rows={stock.map((p) => {
          const profit = p.cost == null ? null : p.price - p.cost;
          return {
            id: p.id,
            cells: [p.name, money(p.info?.purchasePrice), money(p.info?.fees), money(p.cost), money(p.price),
              money(profit), percent(profit, p.price), percent(profit, p.cost ?? 0), p.stock, money(p.remainingRevenue),
              money(profit == null && p.stock > 0 ? null : profit * p.stock)],
          };
        })}
      />
      {(total.missingPlanned > 0 || total.missingSaleCost > 0) && (
        <p>Les écarts et le ROI réalisé s’affichent lorsque les prix prévus et les coûts correspondants sont disponibles.</p>
      )}
      <p>La projection applique le prix de vente actuel au stock disponible. Le ROI rapporte le bénéfice au coût de revient.</p>
    </>
  );
}

function ProductSelect({ products, value, onChange }) {
  return (
    <label>Parfum
      <select name="product" value={value} onChange={onChange} required>
        <option value="">Sélectionner</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.size}</option>)}
      </select>
    </label>
  );
}

function WorkbookImport({ products, importSales }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <Panel>
      <form className="inventory-form" onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        const form = event.currentTarget;
        const file = new FormData(form).get("workbook");
        setBusy(true);
        setMessage("");
        try {
          const result = await importSales(await readSalesWorkbook(file, products));
          setMessage(result === null ? "Le classeur n’a pas pu être enregistré." :
            result.count === 0 && result.updatedReferences === 0 ? "Le classeur est déjà intégré au suivi." :
              `${result.count} vente(s) importée(s), ${result.updatedReferences} fiche(s) de suivi complétée(s).`);
          if (result !== null) form.reset();
        } catch (error) {
          setMessage(error.message || "Le classeur n’a pas pu être lu.");
        } finally {
          setBusy(false);
        }
      }}>
        <label>Classeur de suivi (.xlsx)
          <input name="workbook" type="file" accept=".xlsx" required disabled={busy} />
        </label>
        <button type="submit" disabled={busy}>{busy ? "Import en cours…" : "Importer les ventes Excel"}</button>
      </form>
      {message && <p role="status">{message}</p>}
    </Panel>
  );
}

function Journal({ kind, products, rows, record, updateActualPrice }) {
  const [selected, setSelected] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const sale = kind === "sale";
  const product = products.find((p) => String(p.id) === selected);
  const submit = async (event) => {
    event.preventDefault();
    if (!product || saving) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const price = data.get("price");
    setSaving(true);
    try {
      const success = await record({
        kind,
        productId: product.id,
        date: data.get("date"),
        quantity: Number(data.get("quantity")),
        unitPrice: price === "" ? product.price : Number(price),
        note: data.get("note").trim(),
      });
      setSaved(success);
      if (success) {
        form.reset();
        setSelected("");
      }
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <Panel>
        <form className="inventory-form" onSubmit={submit} onChange={() => setSaved(false)}>
          <ProductSelect products={products} value={selected} onChange={(e) => setSelected(e.target.value)} />
          <label>Date<input name="date" type="date" required /></label>
          <label>Quantité<input name="quantity" type="number" min="1" step="1" required /></label>
          <label>{sale ? "Prix de vente réel unitaire (FCFA)" : "Prix d’achat unitaire (FCFA)"}
            <input name="price" type="number" min="0" step="1" placeholder={sale ? product?.price : undefined} required={!sale} />
          </label>
          <label>Remarque<input name="note" /></label>
          <button type="submit" disabled={!product || saving}>{sale ? "Enregistrer la vente" : "Enregistrer l’entrée"}</button>
        </form>
        {sale && product && <p>Stock disponible : {product.stock}. Prix de vente prévu : {money(product.price)}.</p>}
        {saved && <p role="status">{sale ? "Vente enregistrée." : "Entrée enregistrée."}</p>}
      </Panel>
      <Table
        caption={sale ? "Journal des ventes" : "Journal des entrées"}
        columns={["Date", "Code", "Parfum", "Quantité",
          ...(sale ? ["Prix unitaire prévu", "Prix unitaire réel", "Écart total"] : ["Prix d’achat unitaire"]),
          "Montant", ...(sale ? ["Bénéfice"] : []), "Remarque", ...(sale ? ["Action"] : [])]}
        rows={rows.map((row) => ({
          id: row.id,
          cells: [row.date || "—", row.code || "—", row.productName, row.quantity,
            ...(sale ? [money(row.plannedPrice), row.priceFromPlan ? "— (prix prévu appliqué)" : money(row.unitPrice),
              money(row.plannedPrice == null ? null : (row.unitPrice - row.plannedPrice) * row.quantity)] : [money(row.unitPrice)]),
            money(row.unitPrice * row.quantity),
            ...(sale ? [money(row.cost == null ? null : (row.unitPrice - row.cost) * row.quantity)] : []),
            row.note || "—",
            ...(sale ? [editingPrice === row.id ? (
              <form className="inventory-form" onSubmit={async (event) => {
                event.preventDefault();
                const price = new FormData(event.currentTarget).get("actualPrice");
                if (await updateActualPrice(row, price === "" ? null : Number(price))) setEditingPrice(null);
              }}>
                <label>Prix réel (FCFA)
                  <input name="actualPrice" type="number" min="0" step="1"
                    defaultValue={row.unitPrice === row.plannedPrice ? "" : row.unitPrice}
                    placeholder={row.plannedPrice ?? undefined} required={row.plannedPrice == null} />
                </label>
                <button type="submit">Enregistrer</button>
                <button type="button" onClick={() => setEditingPrice(null)}>Annuler</button>
              </form>
            ) : <button type="button" onClick={() => setEditingPrice(row.id)}>Modifier le prix réel</button>] : [])],
        }))}
      />
    </>
  );
}

function Settings({ inventory, updateDetails, updateThreshold }) {
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const details = inventory.details[selected];
  return (
    <>
      <Panel>
        <form className="inventory-form" onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const price = data.get("purchasePrice");
          if (await updateDetails(Number(selected), {
            code: data.get("code").trim(),
            audience: data.get("audience"),
            purchasePrice: price === "" ? null : Number(price),
            fees: Number(data.get("fees")),
          })) setFeedback("Fiche de suivi enregistrée.");
        }}>
          <ProductSelect products={inventory.products} value={selected} onChange={(e) => {
            setSelected(e.target.value);
            setFeedback("");
          }} />
          {selected && (
            <div className="inventory-fields" key={selected}>
              <label>Code<input name="code" defaultValue={details?.code} /></label>
              <label>Sexe<select name="audience" defaultValue={details?.audience ?? "Non renseigné"}>
                {AUDIENCES.map((audience) => <option key={audience}>{audience}</option>)}
              </select></label>
              <label>Prix d’achat (FCFA)<input name="purchasePrice" type="number" min="0" step="1" defaultValue={details?.purchasePrice} /></label>
              <label>Frais par flacon (FCFA)<input name="fees" type="number" min="0" step="1" defaultValue={details?.fees ?? 0} /></label>
              <button type="submit">Enregistrer la fiche</button>
            </div>
          )}
        </form>
        {feedback && <p role="status">{feedback}</p>}
        <p>Le coût de revient est utilisé à la saisie d’une vente ou à la commande. Les prix d’arrivage restent dans leur journal.</p>
      </Panel>
      <Panel>
        <form className="inventory-form" onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          if (await updateThreshold(Number(data.get("threshold")))) setFeedback("Seuil de stock enregistré.");
        }}>
          <label>Seuil de stock faible<input name="threshold" type="number" min="0" step="1" defaultValue={inventory.lowStockThreshold} required /></label>
          <button type="submit">Enregistrer le seuil</button>
        </form>
        <p>Seuil actuel : {inventory.lowStockThreshold} flacon(s).</p>
      </Panel>
    </>
  );
}

export function InventoryPage({ initialView = "Synthèse" }) {
  const { inventory, remote, recordInventoryMovement, updateActualSalePrice, importHistoricalSales, updateInventoryDetails, updateLowStockThreshold } = useStore();
  const [view, setView] = useState(initialView);
  const report = inventoryReport(inventory);

  return (
    <section className="inventory-page">
      <h2>Suivi des parfums</h2>
      <p>{remote ? "Les saisies sont enregistrées dans Supabase." : "Les saisies sont enregistrées dans ce navigateur."}</p>
      <nav className="inventory-nav" aria-label="Vues du suivi des parfums">
        {["Synthèse", "Stock", "Rentabilité", "Ventes", "Entrées", "Paramètres"].map((item) => (
          <button key={item} type="button" aria-pressed={item === view} onClick={() => setView(item)}>{item}</button>
        ))}
      </nav>
      {view === "Synthèse" && <Summary report={report} />}
      {view === "Stock" && <Stock report={report} threshold={inventory.lowStockThreshold} />}
      {view === "Rentabilité" && <Profitability report={report} />}
      {view === "Ventes" && (
        <>
          <WorkbookImport products={inventory.products} importSales={importHistoricalSales} />
          <Journal key="sale" kind="sale" products={inventory.products} rows={report.sales}
            record={recordInventoryMovement} updateActualPrice={updateActualSalePrice} />
        </>
      )}
      {view === "Entrées" && <Journal key="receipt" kind="receipt" products={inventory.products} rows={report.receipts} record={recordInventoryMovement} />}
      {view === "Paramètres" && <Settings inventory={inventory} updateDetails={updateInventoryDetails} updateThreshold={updateLowStockThreshold} />}
    </section>
  );
}
