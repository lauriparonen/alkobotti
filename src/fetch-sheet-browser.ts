import fs from "fs";
import puppeteer from "puppeteer";

const SHEET_URL =
  "https://www.alko.fi/INTERSHOP/static/WFS/Alko-OnlineShop-Site/-/Alko-OnlineShop/fi_FI/Alkon%20Hinnasto%20Tekstitiedostona/alkon-hinnasto-tekstitiedostona.xlsx";
const DEST = "alko-price-list.xlsx";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,                        // Enable headless mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  /* 1 ─ Hit any page on alko.fi to let Incapsula set its cookies */
  await page.goto("https://www.alko.fi/valikoimat-ja-hinnasto", {
    waitUntil: "networkidle2",
  });

  /* 2 ─ Now fetch the XLSX *inside* the page; return Uint8Array */
  const bytes: number[] = await page.evaluate(async (url) => {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error(`Download failed: ${r.status}`);
    const buf = await r.arrayBuffer();
    return Array.from(new Uint8Array(buf)); // serialisable
  }, SHEET_URL);

  await browser.close(); // done with Chromium ─ free the RAM

  const buffer = Buffer.from(bytes);
  fs.writeFileSync(DEST, buffer);
  console.log("📥  Saved", DEST, "-", buffer.length.toLocaleString(), "bytes");
})();
