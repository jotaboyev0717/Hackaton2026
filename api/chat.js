import { loadCorpus, formatCorpus } from "./lib/corpus.js";
import { callGeminiText } from "./lib/gemini.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history = [], documentText = "" } = req.body || {};
  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message talab qilinadi" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY sozlanmagan" });
    return;
  }

  try {
    const corpusText = formatCorpus(await loadCorpus());

    let systemInstruction = `Siz "Hujjat Tahlili AI Yuristi" — ko'chmas mulk va fuqarolik huquqi bo'yicha yuqori malakali AI yordamchisiz.
Vazifangiz foydalanuvchilarning shartnomaga oid, notarial tasdiqlash, garov, mulk huquqi va shartnoma shartlariga taalluqli savollariga aniq, tushunarli va yuridik asoslangan javob berishdir.

Javob berish qoidalari:
1. Har doim o'zbek tilida, do'stona va professional muloqot qiling.
2. Muhim qoidalar yoki xavflarni tushuntirganda O'zbekiston Respublikasi Fuqarolik Kodeksi va Uy-joy Kodeksining tegishli moddalariga asoslaning.
3. Agar foydalanuvchi joriy shartnoma bo'yicha savol bersa va shartnoma matni taqdim etilgan bo'lsa, javobni shartnomaning tegishli bandlariga bog'lab tushuntiring.
4. Javobni chiroyli va tartibli formatlang (muhim joylarni **qalin** qiling, ro'yxatlardan foydalaning).

QONUNIY KORPUS:
${corpusText}`;

    if (documentText) {
      systemInstruction += `\n\nJORIY TAHLIL QILINAYOTGAN SHARTNOMA MATNI:\n${documentText}`;
    }

    const contents = [];
    
    // Add past conversation history (up to last 10 messages for context)
    if (Array.isArray(history)) {
      for (const item of history.slice(-10)) {
        if (item.role && item.text) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Append current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const reply = await callGeminiText({
      apiKey,
      model,
      systemInstruction,
      contents,
      temperature: 0.4,
    });

    res.status(200).json({ reply });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
