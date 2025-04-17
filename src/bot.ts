import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import path from "path";
import cache from "../drink-cache.json";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

type DrinkCache = typeof cache;
type DrinkKey = keyof DrinkCache;

const BOT_USERNAME = process.env.BOT_USERNAME ?? "GambinaIndexBot";
const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: true });

/* ────────────────────────────────────────────────────
   1.  Build the drink‑command regex
   ──────────────────────────────────────────────────── */
const drinkNames = Object.keys(cache).join("|");   // "gambina|mossu|…"
const drinkRe = new RegExp(
  String.raw`^\/(${drinkNames})(?:@${BOT_USERNAME})?$`,
  "i"
);

/* ────────────────────────────────────────────────────
   2.  Respond to /<drink>
   ──────────────────────────────────────────────────── */
bot.onText(drinkRe, (msg, match) => {
  const chatId = msg.chat.id;
  const key = (match?.[1] || "").toLowerCase() as DrinkKey;
  const { price, vol } = cache[key];

  bot.sendMessage(
    chatId,
    `💶 ${key.toUpperCase()}‑INDEKSI (${vol}): ${price.toFixed(2)} €`,
    { reply_to_message_id: msg.message_id }
  );
});

/* ────────────────────────────────────────────────────
   3.  Intro / help
   ──────────────────────────────────────────────────── */
bot.onText(/\/(?:start|info)(?:@.+)?/i, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Hei! Olen Alkobotti. Kerron valikoitujen herkkujuomien tämänhetkisen hinnan.\n\n` +
      `Komennot: \n /${drinkNames.split("|").join(`\n /`)} \n\n` +
      `Mukavia kokouksia!`,
    { reply_to_message_id: msg.message_id }
  );
});

console.log("🤖 Bot is up. Commands:", drinkNames.split("|").map(d => `/${d}`).join(" "));
