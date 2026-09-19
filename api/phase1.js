import { loadCorpus, formatCorpus } from "./lib/corpus.js";
import { agent1SystemPrompt, agent2SystemPrompt } from "./lib/prompts.js";
import { callGemini } from "./lib/gemini.js";
import { phase1Schema } from "./lib/schemas.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { documentText } = req.body || {};
  if (!documentText || typeof documentText !== "string") {
    res.status(400).json({ error: "documentText talab qilinadi" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY sozlanmagan" });
    return;
  }

  const corpusText = formatCorpus(await loadCorpus());
  const userPrompt = `Quyidagi ko'chmas mulk oldi-sotdi shartnomasini tahlil qiling:\n\n${documentText}`;

  try {
    const [agent1, agent2] = await Promise.all([
      callGemini({
        apiKey,
        model,
        systemInstruction: agent1SystemPrompt(corpusText),
        userPrompt,
        responseSchema: phase1Schema,
      }),
      callGemini({
        apiKey,
        model,
        systemInstruction: agent2SystemPrompt(corpusText),
        userPrompt,
        responseSchema: phase1Schema,
      }),
    ]);
    res.status(200).json({ agent1, agent2 });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
