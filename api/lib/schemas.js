const findingProperties = {
  original_text: { type: "string" },
  topic_badge: { type: "string" },
  section_reference: { type: "string" },
  category: { type: "string", enum: ["firibgarlik_tuzog'i", "xavfli", "noaniq_tasdiqlash_kerak", "eslatma"] },
  reasoning: { type: "string" },
  cited_article_number: { type: "string", nullable: true },
  soraladigan_savol: { type: "string", nullable: true },
  taklif_qilingan_matn: { type: "string", nullable: true },
  tushuntirish: { type: "string", nullable: true },
};

export const phase1Schema = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: findingProperties,
        required: ["original_text", "topic_badge", "section_reference", "category", "reasoning"],
      },
    },
  },
  required: ["findings"],
};

export const phase3Schema = {
  type: "object",
  properties: {
    overall_verdict: { type: "string", enum: ["past_xavfli", "orta_xavfli", "yuqori_xavfli"] },
    overall_summary: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ...findingProperties,
          detected_by: { type: "string", enum: ["agent1", "agent2", "agent1_va_agent2"] },
        },
        required: ["original_text", "topic_badge", "section_reference", "category", "reasoning", "detected_by"],
      },
    },
  },
  required: ["overall_verdict", "overall_summary", "findings"],
};
