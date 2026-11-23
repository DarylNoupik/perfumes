const MAX_FILE_BYTES = 10 * 1024 * 1024;
const decoder = new TextDecoder();

function workbookParts(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let end = bytes.length - 22;
  const minimum = Math.max(0, end - 65535);
  while (end >= minimum && (view.getUint32(end, true) !== 0x06054b50 ||
    end + 22 + view.getUint16(end + 20, true) !== bytes.length)) end--;
  if (end < minimum) throw new Error("Ce fichier n’est pas un classeur Excel .xlsx valide.");

  const entries = new Map();
  const count = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  for (let index = 0; index < count; index++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error("Le contenu du classeur Excel est illisible.");
    }
    const nameLength = view.getUint16(offset + 28, true);
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    entries.set(name, {
      method: view.getUint16(offset + 10, true),
      compressedSize: view.getUint32(offset + 20, true),
      size: view.getUint32(offset + 24, true),
      start: view.getUint32(offset + 42, true),
    });
    offset += 46 + nameLength + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true);
  }

  return async (name) => {
    const entry = entries.get(name);
    if (!entry || entry.size > MAX_FILE_BYTES || entry.start + 30 > end ||
      view.getUint32(entry.start, true) !== 0x04034b50 || ![0, 8].includes(entry.method)) {
      throw new Error("Une feuille ou une partie du classeur est illisible.");
    }
    const start = entry.start + 30 + view.getUint16(entry.start + 26, true) + view.getUint16(entry.start + 28, true);
    if (start + entry.compressedSize > end) throw new Error("Le classeur Excel est incomplet.");
    const compressed = bytes.subarray(start, start + entry.compressedSize);
    let stream = new Blob([compressed]).stream();
    if (entry.method === 8) stream = stream.pipeThrough(new DecompressionStream("deflate-raw"));
    const reader = stream.getReader();
    const content = new Uint8Array(entry.size);
    let written = 0;
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      if (written + chunk.value.length > content.length) {
        await reader.cancel();
        throw new Error("La taille d’une feuille Excel est invalide.");
      }
      content.set(chunk.value, written);
      written += chunk.value.length;
    }
    if (written !== content.length) throw new Error("Une feuille Excel est incomplète.");
    const xml = new DOMParser().parseFromString(decoder.decode(content), "application/xml");
    if (xml.querySelector("parsererror")) throw new Error("Une feuille Excel est illisible.");
    return xml;
  };
}

const tags = (xml, name) => Array.from(xml.getElementsByTagNameNS("*", name));
const stringsIn = (xml) => tags(xml, "t").map((node) => node.textContent).join("");

function sheetRows(xml, strings) {
  return tags(xml, "row").map((row) => {
    const cells = Object.fromEntries(tags(row, "c").map((cell) => {
      const column = cell.getAttribute("r").match(/^[A-Z]+/)?.[0];
      const value = tags(cell, "v")[0]?.textContent;
      const type = cell.getAttribute("t");
      return [column, type === "s" ? strings[Number(value)] : type === "inlineStr" ? stringsIn(cell) : value];
    }));
    return { number: Number(row.getAttribute("r")), cells };
  });
}

const aliases = {
  "red zara temptation": "red temptation",
  "zera a taormina": "sera a taormina mangue & oud",
  "dolce nostalgia vanilla & intense": "dolce nostalgia vanilla & incense",
};
const normalize = (name) => name.trim().toLowerCase().replace(/\s+/g, " ");

function amount(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function saleDate(value, uses1904Dates) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const serial = Number(value);
  if (!Number.isFinite(serial) || serial <= 0 || serial > 2957000) return null;
  const epoch = uses1904Dates ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, serial < 60 ? 31 : 30);
  return new Date(epoch + Math.floor(serial) * 86400000).toISOString().slice(0, 10);
}

export async function readSalesWorkbook(file, products) {
  if (file.size < 22 || file.size > MAX_FILE_BYTES) throw new Error("Choisis un fichier .xlsx de moins de 10 Mo.");
  const read = workbookParts(await file.arrayBuffer());
  const [workbook, relationships] = await Promise.all([read("xl/workbook.xml"), read("xl/_rels/workbook.xml.rels")]);
  const parts = tags(relationships, "Relationship");
  const partPath = (part) => {
    const target = part.getAttribute("Target");
    return target.startsWith("/") ? target.slice(1) : `xl/${target}`;
  };
  const stringPart = parts.find((part) => part.getAttribute("Type").endsWith("/sharedStrings"));
  const strings = stringPart ? tags(await read(partPath(stringPart)), "si").map(stringsIn) : [];
  const readSheet = async (name) => {
    const sheet = tags(workbook, "sheet").find((item) => item.getAttribute("name") === name);
    const link = parts.find((part) => part.getAttribute("Id") === sheet?.getAttribute("r:id"));
    if (!link) throw new Error(`L’onglet « ${name} » est introuvable.`);
    return sheetRows(await read(partPath(link)), strings);
  };
  const [sales, stock, roi] = await Promise.all(["Ventes", "Stock", "Stock ROI"].map(readSheet));
  const references = new Map(stock.filter(({ number, cells }) => number >= 5 && cells.A && cells.B)
    .map(({ cells }) => [cells.A, cells]));
  const costs = new Map(roi.filter(({ number, cells }) => number >= 5 && cells.A)
    .map(({ cells }) => [cells.A, cells]));
  const productByCode = new Map();
  const details = {};
  for (const [code, reference] of references) {
    const name = normalize(reference.B);
    const matches = products.filter((product) => normalize(product.name) === (aliases[name] ?? name));
    if (matches.length !== 1) continue;
    const [{ id }] = matches;
    productByCode.set(code, id);
    const cost = costs.get(code);
    details[id] = {
      code,
      audience: reference.D,
      purchasePrice: amount(cost?.D) ?? amount(reference.I),
      fees: amount(cost?.E) ?? 0,
      ...(amount(reference.K) != null && { openingStock: amount(reference.K) }),
    };
  }
  const uses1904Dates = ["1", "true"].includes(tags(workbook, "workbookPr")[0]?.getAttribute("date1904"));
  const rows = sales.filter(({ number, cells }) => number >= 5 && cells.B && cells.E);
  if (!rows.length) throw new Error("Aucune vente renseignée dans le classeur.");
  const historicalSales = rows.map(({ number, cells }) => {
    const reference = references.get(cells.B);
    const quantity = amount(cells.E);
    const plannedPrice = amount(cells.F) ?? amount(reference?.J) ?? amount(reference?.I);
    const actualPrice = amount(cells.G);
    const unitPrice = actualPrice ?? plannedPrice;
    if (!reference || !quantity || unitPrice == null || !Number.isSafeInteger(unitPrice * quantity)) {
      throw new Error(`Vérifie le parfum, la quantité et le prix dans Ventes, ligne ${number}.`);
    }
    return {
      id: `excel-sales-${cells.B}-${number}`,
      kind: "sale",
      productId: productByCode.get(cells.B) ?? `excel-${cells.B}`,
      productName: reference.B.trim(),
      code: cells.B,
      audience: reference.D,
      date: saleDate(cells.A, uses1904Dates),
      quantity,
      plannedPrice,
      unitPrice,
      cost: amount(costs.get(cells.B)?.F),
      priceFromPlan: actualPrice == null,
      note: "Historique Excel",
    };
  });
  return { sales: historicalSales, details };
}
