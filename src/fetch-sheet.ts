import axios from "axios";
import * as fs from "fs";

const SHEET_URL =
  "https://www.alko.fi/INTERSHOP/static/WFS/Alko-OnlineShop-Site/-/Alko-OnlineShop/fi_FI/Alkon%20Hinnasto%20Tekstitiedostona/alkon-hinnasto-tekstitiedostona.xlsx";
const DEST = "alko-price-list.xlsx";

(async () => {
    const res = await axios.get(SHEET_URL, {
      responseType: "arraybuffer",
      headers: {
        // anything that looks like a real browser will do
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*;q=0.9",
      },
      // don’t silently accept 4xx/5xx
      validateStatus: (code) => code < 400,
      maxRedirects: 5,
    });
  
    const type = res.headers["content-type"] || "";
    if (!type.includes("officedocument.spreadsheetml.sheet")) {
      throw new Error(
        `Still not a spreadsheet – got ${type}. Maybe the URL is wrong?`
      );
    }
  
    fs.writeFileSync(DEST, res.data);
    console.log("Saved", DEST, "-", res.data.byteLength, "bytes");
  })();