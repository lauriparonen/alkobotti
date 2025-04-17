import xlsx from "xlsx";
import fs from "fs";

const WANTED = {
  gambina: 755027,
  mossu: 932336,
  hehkuviini: 325927,
  valdemar: 395107,
  doris: 386837,
} as const;

const toNumber = (v: unknown) =>
  typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));

// ───────── 1 ─────────  Load workbook
const wb = xlsx.readFile("alko-price-list.xlsx");

// ───────── 2 ─────────  Find the sheet that has "Numero" in column A (A1‑A10 scan)
let sheetName: string | undefined;
let headerRow = 0;

for (const name of wb.SheetNames) {
  const sh = wb.Sheets[name];
  for (let r = 1; r <= 10; r++) {
    const cell = sh[`A${r}`];
    if (cell && String(cell.v).trim().toLowerCase() === "numero") {
      sheetName = name;
      headerRow = r;
      break;
    }
  }
  if (sheetName) break;
}

if (!sheetName)
  throw new Error("❌ Could not find a sheet with a 'Numero' header.");

console.log("Data sheet:", sheetName, "  header @ row", headerRow);

// ───────── 3 ─────────  Parse rows starting from headerRow
const sheet = wb.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, {
  range: headerRow - 1,   // zero‑based offset
  defval: "",
  raw: true,
}).map(o => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(o))
    out[k.trim().toLowerCase()] = v;
  return out;
});

console.log("Rows read:", rows.length);

// ───────── 4 ─────────  Build cache
const cache: Record<
  keyof typeof WANTED,
  { price: number; vol: string }
> = {} as any;

for (const drink of Object.keys(WANTED) as (keyof typeof WANTED)[]) {
  const match = rows.find(r => Number(r["numero"]) === WANTED[drink]);
  if (match) {
    cache[drink] = {
      price: toNumber(match["hinta"]),
      vol: String(match["pullokoko"]).trim(),
    };
  } else {
    console.warn(`⚠️  Did not find ${drink} (${WANTED[drink]})`);
  }
}

// ───────── 5 ─────────  Persist
fs.writeFileSync("drink-cache.json", JSON.stringify(cache, null, 2));
console.log("✅  Cache rebuilt:", cache);
