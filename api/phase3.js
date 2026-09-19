import { loadCorpus, formatCorpus, buildIndex, lookupArticle } from "./lib/corpus.js";
import { agent3SystemPrompt } from "./lib/prompts.js";
import { callGemini } from "./lib/gemini.js";
import { phase3Schema } from "./lib/schemas.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { documentText, agent1, agent2 } = req.body || {};
  if (!documentText || !agent1 || !agent2) {
    res.status(400).json({ error: "documentText, agent1, agent2 talab qilinadi" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY sozlanmagan" });
    return;
  }

  const corpus = await loadCorpus();
  const corpusText = formatCorpus(corpus);
  const index = buildIndex(corpus);

  const userPrompt = `SHARTNOMA MATNI:
${documentText}

XARIDOR HIMOYACHISI (agent1) TOPILMALARI:
${JSON.stringify(agent1, null, 2)}

SOTUVCHI VAKILI (agent2) TOPILMALARI:
${JSON.stringify(agent2, null, 2)}

Yuqoridagi ikkala agent topilmalarini tekshiring, birlashtiring va yakuniy tahlilni tuzing.`;

  try {
    const phase3 = await callGemini({
      apiKey,
      model,
      systemInstruction: agent3SystemPrompt(corpusText),
      userPrompt,
      responseSchema: phase3Schema,
      temperature: 0.1,
    });

    const findings = (phase3.findings || []).map((f) => {
      const lookup = lookupArticle(f.cited_article_number, index);
      return {
        original_text: f.original_text,
        topic_badge: f.topic_badge,
        section_reference: f.section_reference,
        category: f.category,
        reasoning: f.reasoning,
        cited_article_number: lookup ? lookup.number : null,
        cited_article_text: lookup ? lookup.text : null,
        soraladigan_savol: f.soraladigan_savol ?? null,
        taklif_qilingan_matn: f.taklif_qilingan_matn ?? null,
        tushuntirish: f.tushuntirish ?? null,
        detected_by: f.detected_by,
        verified_by_agent3: true,
      };
    });

    res.status(200).json({
      overall_verdict: phase3.overall_verdict,
      overall_summary: phase3.overall_summary,
      findings,
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
