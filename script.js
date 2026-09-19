const fileInput = document.getElementById("file-input");
const analyzeBtn = document.getElementById("analyze-btn");
const sampleBtn = document.getElementById("sample-btn");
const errorBox = document.getElementById("error-box");
const statusCard = document.getElementById("status-card");
const verdictContainer = document.getElementById("verdict-container");
const findingsContainer = document.getElementById("findings-container");

const dropzone = document.getElementById("dropzone");
const dropzoneDefault = document.getElementById("dropzone-default");
const filePreview = document.getElementById("file-preview");
const fileNameEl = document.getElementById("file-name");
const fileSizeEl = document.getElementById("file-size");
const removeFileBtn = document.getElementById("remove-file-btn");

const AGENT_NAMES = {
  agent1: "Xaridor Himoyachisi",
  agent2: "Sotuvchi Vakili",
  agent3: "Mustaqil Hakam",
};

const SVG_ICONS = {
  alertTriangle: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  alertCircle: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  infoCircle: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  fileText: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  circleHelp: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  checkCircle: `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  chevronDown: `<svg class="svg-icon chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
};

const VERDICT_META = {
  past_xavfli: { label: "Past xavfli", css: "verdict-past" },
  orta_xavfli: { label: "O'rtacha xavfli", css: "verdict-orta" },
  yuqori_xavfli: { label: "Yuqori xavfli", css: "verdict-yuqori" },
};

const CATEGORY_META = {
  "firibgarlik_tuzog'i": { title: "FIRIBGARLIK TUZOG'I O'XSHASHLIGI (JIDDIY OGOHLANTIRISH)", css: "card-scam" },
  xavfli: { title: "Xavfli bandlar", css: "card-xavfli" },
  noaniq_tasdiqlash_kerak: { title: "Aniqlik talab qiluvchi bandlar", css: "card-noaniq" },
  eslatma: { title: "Eslatmalar", css: "card-eslatma" },
};

let selectedText = null;

function esc(str) {
  if (str == null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function handleFile(file) {
  clearError();
  if (!file) return;
  if (!file.name.endsWith(".txt")) {
    showError("Faqat .txt formatdagi matnli shartnomalarni yuklashingiz mumkin.");
    return;
  }
  file.text().then((text) => {
    selectedText = text;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatBytes(file.size);
    dropzoneDefault.hidden = true;
    filePreview.hidden = false;
    analyzeBtn.disabled = false;
  }).catch((err) => {
    showError("Faylni o'qishda xatolik yuz berdi: " + err.message);
  });
}

// Click dropzone to open hidden file input
if (dropzone) {
  dropzone.addEventListener("click", (e) => {
    if (e.target.closest("#remove-file-btn")) return;
    if (filePreview && filePreview.hidden) {
      fileInput.click();
    }
  });
}

if (fileInput) {
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) handleFile(file);
  });
}

// Drag & Drop event handlers
if (dropzone) {
  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (files && files.length > 0) {
      fileInput.files = files;
      handleFile(files[0]);
    }
  });
}

if (removeFileBtn) {
  removeFileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedText = null;
    fileInput.value = "";
    filePreview.hidden = true;
    dropzoneDefault.hidden = false;
    analyzeBtn.disabled = true;
  });
}

if (analyzeBtn) {
  analyzeBtn.addEventListener("click", () => {
    if (selectedText) runAnalysis(selectedText);
  });
}

if (sampleBtn) {
  sampleBtn.addEventListener("click", async () => {
    clearError();
    try {
      const res = await fetch("sample-contract.txt");
      const text = await res.text();
      selectedText = text;
      fileNameEl.textContent = "sample-contract.txt (Namuna)";
      fileSizeEl.textContent = formatBytes(text.length);
      dropzoneDefault.hidden = true;
      filePreview.hidden = false;
      analyzeBtn.disabled = false;
      runAnalysis(text);
    } catch (err) {
      showError("Namuna shartnomani yuklab bo'lmadi: " + err.message);
    }
  });
}

function setStatus(agent, state) {
  const el = document.getElementById(`status-${agent}`);
  if (!el) return;
  el.classList.remove("running", "done");
  const name = AGENT_NAMES[agent];
  if (state === "running") {
    el.classList.add("running");
    el.textContent = `${name} — ishlamoqda...`;
  } else if (state === "done") {
    el.classList.add("done");
    el.textContent = `${name} — tugadi`;
  } else {
    el.textContent = agent === "agent3"
      ? `${name} — navbatda (1 va 2 tugagach)`
      : `${name} — navbatda`;
  }
}

function resetStatus() {
  setStatus("agent1", "waiting");
  setStatus("agent2", "waiting");
  setStatus("agent3", "waiting");
}

async function runAnalysis(documentText) {
  clearError();
  verdictContainer.innerHTML = "";
  findingsContainer.innerHTML = "";
  statusCard.hidden = false;
  resetStatus();
  analyzeBtn.disabled = true;
  sampleBtn.disabled = true;

  try {
    setStatus("agent1", "running");
    setStatus("agent2", "running");

    const phase1Res = await fetch("/api/phase1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentText }),
    });
    const phase1Data = await phase1Res.json();
    if (!phase1Res.ok) throw new Error(phase1Data.error || "Phase 1 xatosi");

    setStatus("agent1", "done");
    setStatus("agent2", "done");
    setStatus("agent3", "running");

    const phase3Res = await fetch("/api/phase3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentText, agent1: phase1Data.agent1, agent2: phase1Data.agent2 }),
    });
    const analysis = await phase3Res.json();
    if (!phase3Res.ok) throw new Error(analysis.error || "Phase 3 xatosi");

    setStatus("agent3", "done");
    renderVerdict(analysis);
    renderFindings(analysis.findings);
  } catch (err) {
    showError(err.message);
  } finally {
    analyzeBtn.disabled = !selectedText;
    sampleBtn.disabled = false;
  }
}

function renderVerdict(analysis) {
  const meta = VERDICT_META[analysis.overall_verdict] || {
    label: analysis.overall_verdict || "Tahlil yakunlandi",
    css: "verdict-orta",
  };
  const counts = { "firibgarlik_tuzog'i": 0, xavfli: 0, noaniq_tasdiqlash_kerak: 0, eslatma: 0 };
  for (const f of analysis.findings || []) {
    if (counts[f.category] !== undefined) counts[f.category]++;
  }

  const scamCount = counts["firibgarlik_tuzog'i"] || 0;
  let verdictIcon = SVG_ICONS.alertCircle;
  if (analysis.overall_verdict === "yuqori_xavfli" || scamCount > 0) verdictIcon = SVG_ICONS.alertTriangle;
  else if (analysis.overall_verdict === "past_xavfli") verdictIcon = SVG_ICONS.checkCircle;

  verdictContainer.innerHTML = `
    <div class="glass-card verdict-card ${meta.css}">
      <div class="verdict-icon-wrapper">${verdictIcon}</div>
      <div class="verdict-label">${meta.label}</div>
      <div class="verdict-summary">${esc(analysis.overall_summary)}</div>
      <div class="stats-row">
        ${scamCount > 0 ? `<div class="stat-item stat-scam"><div class="stat-num">${scamCount}</div><div class="stat-label">Firibgarlik tuzog'i</div></div>` : ""}
        <div class="stat-item stat-high"><div class="stat-num">${counts.xavfli}</div><div class="stat-label">Xavfli</div></div>
        <div class="stat-item stat-medium"><div class="stat-num">${counts.noaniq_tasdiqlash_kerak}</div><div class="stat-label">Noaniq</div></div>
        <div class="stat-item stat-info"><div class="stat-num">${counts.eslatma}</div><div class="stat-label">Eslatma</div></div>
      </div>
    </div>
  `;
}

function renderFindingCard(finding, cssClass) {
  const hasLegalBasis = finding.cited_article_number && finding.cited_article_text;
  const hasQuestion = (finding.category === "noaniq_tasdiqlash_kerak" || finding.category === "xavfli" || finding.category === "firibgarlik_tuzog'i") && finding.soraladigan_savol;
  const hasSuggestion = !!finding.taklif_qilingan_matn;
  const isScam = finding.category === "firibgarlik_tuzog'i";
  const isHighRisk = finding.category === "xavfli" || isScam;

  return `
    <div class="glass-card finding-card ${cssClass}">
      ${isScam ? `
        <div class="scam-caution-banner">
          ${SVG_ICONS.alertTriangle}
          <span>FIRIBGARLIK SXEMASI XAVFI: Ushbu band O'zbekiston sud va jinoyat amaliyotida uchraydigan ma'lum firibgarlik tuzog'iga o'xshaydi!</span>
        </div>
      ` : ""}
      <div class="card-header">
        <span class="topic-badge">${esc(finding.topic_badge)}</span>
        ${finding.section_reference ? `<span class="section-ref">${esc(finding.section_reference)}</span>` : ""}
      </div>
      <div class="original-quote">
        <div class="quote-label">SHARTNOMA MATNI:</div>
        <div class="quote-text">"${esc(finding.original_text)}"</div>
      </div>
      <div class="reasoning">${esc(finding.reasoning)}</div>
      ${hasLegalBasis ? `
        <details class="legal-basis-details">
          <summary>
            <span class="details-summary-title">${SVG_ICONS.fileText} Qonuniy asosni ko'rish</span>
            ${SVG_ICONS.chevronDown}
          </summary>
          <div class="legal-basis">
            <div class="article-num">${esc(finding.cited_article_number)}</div>
            <div class="article-text">${esc(finding.cited_article_text)}</div>
          </div>
        </details>
      ` : ""}
      ${hasQuestion ? `
        <div class="question-block ${isHighRisk ? 'question-high-risk' : 'question-medium-risk'}">
          <div class="label">${SVG_ICONS.circleHelp} SO'RALADIGAN SAVOL</div>
          <div class="question-text">${esc(finding.soraladigan_savol)}</div>
        </div>
      ` : ""}
      ${hasSuggestion ? `
        <div class="suggestion-block">
          <div class="label">${SVG_ICONS.checkCircle} TAKLIF QILINGAN MATN</div>
          <div class="suggestion-text">${esc(finding.taklif_qilingan_matn)}</div>
          ${finding.tushuntirish ? `<div class="suggestion-explain">${esc(finding.tushuntirish)}</div>` : ""}
        </div>
      ` : ""}
    </div>
  `;
}

function renderFindings(findings) {
  let html = "";
  for (const [category, meta] of Object.entries(CATEGORY_META)) {
    const items = findings.filter((f) => f.category === category);
    if (items.length === 0) continue;

    let iconSvg = SVG_ICONS.alertCircle;
    let groupClass = "group-medium-risk";

    if (category === "firibgarlik_tuzog'i") {
      iconSvg = SVG_ICONS.alertTriangle;
      groupClass = "group-scam-risk";
    } else if (category === "xavfli") {
      iconSvg = SVG_ICONS.alertTriangle;
      groupClass = "group-high-risk";
    } else if (category === "eslatma") {
      iconSvg = SVG_ICONS.infoCircle;
      groupClass = "group-info-risk";
    }

    html += `
      <div class="findings-group ${groupClass}">
        <div class="section-title">
          <span class="section-icon">${iconSvg}</span>
          <span class="section-heading">${esc(meta.title)}</span>
          <span class="section-count">${items.length}</span>
        </div>
        <div class="findings-list">
          ${items.map((f) => renderFindingCard(f, meta.css)).join("")}
        </div>
      </div>
    `;
  }
  findingsContainer.innerHTML = html;
}

// AI Chatbot Logic
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const chatSendBtn = document.getElementById("chat-send-btn");
const promptChips = document.getElementById("prompt-chips");

let chatHistory = [];

function appendMessage(role, text) {
  const isUser = role === "user";
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;
  
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "msg-avatar";
  avatarDiv.textContent = isUser ? "👤" : "🤖";
  
  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "msg-bubble";

  let formattedText = esc(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  bubbleDiv.innerHTML = formattedText;

  msgDiv.appendChild(avatarDiv);
  msgDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  chatHistory.push({ role: isUser ? "user" : "model", text });
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.id = "typing-indicator";
  typingDiv.className = "message ai-message";
  typingDiv.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble typing-dots">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.remove();
}

async function sendChatMessage(message) {
  if (!message || !message.trim()) return;
  const userText = message.trim();
  chatInput.value = "";
  appendMessage("user", userText);

  showTypingIndicator();
  chatInput.disabled = true;
  chatSendBtn.disabled = true;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        history: chatHistory.slice(-6),
        documentText: selectedText || "",
      }),
    });
    const data = await res.json();
    removeTypingIndicator();

    if (!res.ok) throw new Error(data.error || "Chatbot xatosi");
    appendMessage("model", data.reply);
  } catch (err) {
    removeTypingIndicator();
    appendMessage("model", "⚠️ Xatolik yuz berdi: " + err.message);
  } finally {
    chatInput.disabled = false;
    chatSendBtn.disabled = false;
    chatInput.focus();
  }
}

if (chatForm) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendChatMessage(chatInput.value);
  });
}

if (promptChips) {
  promptChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip && chip.dataset.prompt) {
      sendChatMessage(chip.dataset.prompt);
    }
  });
}
