import path from "node:path";
import { fileURLToPath } from "node:url";
import loadEnv from "./dotenv-lite.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(__dirname, "..", ".env.local"));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY topilmadi (.env.local)");
  process.exit(1);
}

// A small, curated set — not the full corpus. Verbatim text is only included
// where it was confirmed against the official source (lex.uz); the rest are
// paraphrased summaries and marked is_verbatim=false to avoid presenting them
// as authoritative quoted law text.
const rows = [
  {
    article_number: "O'zR FK 480-modda",
    source: "fuqarolik_kodeksi",
    title: "Ko'chmas mulkni sotish shartnomasining shakli",
    article_text:
      "Ko'chmas mulk oldi-sotdi shartnomalari majburiy tartibda notarial tasdiqlanishi va davlat ro'yxatidan " +
      "o'tkazilishi shart. Ushbu talabga rioya qilinmasligi shartnomaning haqiqiy emas deb topilishiga olib keladi.",
    is_verbatim: false,
  },
  {
    article_number: "O'zR FK 484-modda",
    source: "fuqarolik_kodeksi",
    title: "Ko'chmas mulkni sotish shartnomasida shartnoma narsasini belgilash",
    article_text:
      "Shartnomada ko'chmas mulkni aniq belgilash imkonini beruvchi ma'lumotlar, jumladan kadastr raqami, " +
      "ko'rsatilishi shart. Aks holda predmet bo'yicha kelishuvga erishilmagan va shartnoma tuzilmagan hisoblanadi.",
    is_verbatim: false,
  },
  {
    article_number: "O'zR FK 488-modda",
    source: "fuqarolik_kodeksi",
    title: "Uy-joy binolarini sotishning xususiyatlari",
    article_text:
      "Turar-joy (uy-joy) obyektlarini sotish shartnomalariga nisbatan qo'shimcha talablarni, jumladan Uy-joy " +
      "kodeksida nazarda tutilgan notarial tasdiqlash va davlat ro'yxatidan o'tkazish tartibini belgilaydi.",
    is_verbatim: false,
  },
  {
    article_number: "Uy-joy kodeksi 14-modda",
    source: "uy_joy_kodeksi",
    title: "Turar joyga bo'lgan mulk huquqi vujudga kelishi, boshqaga o'tishining xususiyatlari",
    article_text:
      "Uyning, kvartiraning oldi-sotdi va ayirboshlash shartnomasi yozma shaklda, taraflar imzolaydigan bitta " +
      "hujjatni tayyorlash yo'li bilan tuziladi hamda u notarial tasdiqlanishi va davlat ro'yxatidan o'tkazilishi " +
      "shart. Uyning, kvartiraning oldi-sotdi shartnomasi shakliga rioya etmaslik uning haqiqiy emasligiga olib " +
      "keladi. Sotib oluvchi sotib olganidan keyin qonunga muvofiq turar joydan foydalanish huquqini o'zida " +
      "saqlab qoladigan shaxslar yashab turgan shu uy, kvartirani oldi-sotdi shartnomasining muhim sharti — bu " +
      "shaxslarning ro'yxatini sotilayotgan turar joydan foydalanish huquqlari ko'rsatilgan holda tuzishdan iboratdir.",
    is_verbatim: true,
  },
];

const res = await fetch(`${SUPABASE_URL}/rest/v1/legal_articles`, {
  method: "POST",
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(rows),
});

const text = await res.text();
if (!res.ok) {
  console.error(`Xatolik (${res.status}):`, text);
  process.exit(1);
}
console.log(`OK — ${JSON.parse(text).length} qator qo'shildi.`);
