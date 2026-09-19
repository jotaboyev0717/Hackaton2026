import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_CORPUS_PATH = path.join(__dirname, "../../data/legal_corpus.json");
const NUM_RE = /\d+/;

let cachedCorpus = null;

function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/(Hujjatga taklif yuborish|Audioni tinglash|Hujjat elementidan havola olish|LexUZ sharhi|Oldingi\s+tahrirga\s+qarang\.|SPiT:|OKOZ:[\s\S]*?(?=\n\n|\n[A-Z]|$))/gi, "")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function cleanTitle(title, articleNumber) {
  if (!title) return articleNumber;
  let t = String(title).trim();
  if (t.length <= 2 || t.startsWith("ning nomi") || t.startsWith("sining") || t.startsWith("siga") || t === ")") {
    return articleNumber;
  }
  return t;
}

export async function loadCorpus() {
  if (cachedCorpus) return cachedCorpus;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/legal_articles?select=*`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cachedCorpus = data.map((item) => {
            const meta = item.metadata || {};
            let lawPrefix = "O'zR FK";
            if (item.law_short_name === "Uy-joy kodeksi" || (meta.law_name && meta.law_name.toLowerCase().includes("uy-joy"))) {
              lawPrefix = "Uy-joy kodeksi";
            }
            const artNum = item.article_number || meta.article_number || "";
            const canonicalNumber = artNum.startsWith("O'zR") || artNum.startsWith("Uy-joy") ? artNum : `${lawPrefix} ${artNum}`;
            const rawTitle = meta.article_title || item.title || canonicalNumber;
            const rawText = meta.article_text || item.content || item.article_text || "";
            return {
              article_number: canonicalNumber,
              title: cleanTitle(rawTitle, canonicalNumber),
              text: cleanText(rawText),
            };
          });
          return cachedCorpus;
        }
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local corpus:", err.message);
    }
  }

  try {
    cachedCorpus = JSON.parse(readFileSync(LOCAL_CORPUS_PATH, "utf-8"));
  } catch {
    cachedCorpus = [];
  }
  return cachedCorpus;
}

export function formatCorpus(corpus) {
  return corpus.map((item) => `- ${item.article_number} (${item.title}): ${item.text}`).join("\n");
}

export function buildIndex(corpus) {
  const index = new Map();
  for (const item of corpus) index.set(item.article_number, item);
  return index;
}

// Returns { number, text } using the corpus's canonical article_number, or null
// if the LLM's citation doesn't match anything real (anti-hallucination safety net).
export function lookupArticle(number, index) {
  if (!number) return null;
  if (index.has(number)) {
    return { number, text: index.get(number).text };
  }
  const match = number.match(NUM_RE);
  if (!match) return null;
  const digits = match[0];
  for (const [key, item] of index.entries()) {
    const keyMatch = key.match(NUM_RE);
    if (keyMatch && keyMatch[0] === digits) {
      return { number: key, text: item.text };
    }
  }
  return null;
}
