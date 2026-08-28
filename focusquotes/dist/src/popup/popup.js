const saveBtn = document.getElementById("saveBtn");
const quoteList = document.getElementById("quoteList");
const statusEl = document.getElementById("status");

async function getQuoteStore() {
  const { settings } = await chrome.storage.local.get("settings");
  return settings?.storageMode === "sync" ? chrome.storage.sync : chrome.storage.local;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.dataset.kind = isError ? "error" : "success";
}

saveBtn.addEventListener("click", async () => {
  try {
    saveBtn.disabled = true;
    setStatus("");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) throw new Error("Open a regular web page first.");

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString().trim() || "",
    });

    if (!result) throw new Error("Highlight some text on the page first.");

    const response = await chrome.runtime.sendMessage({ type: "SAVE_QUOTE", text: result, sourceUrl: tab.url });
    if (!response?.ok) throw new Error(response?.error || "The quote could not be saved.");
    setStatus("Quote saved.");
    await renderQuotes();
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    saveBtn.disabled = false;
  }
});

async function renderQuotes() {
  const store = await getQuoteStore();
  const { quotes = [] } = await store.get("quotes");
  quoteList.replaceChildren();

  if (!quotes.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No saved quotes yet.";
    quoteList.appendChild(empty);
    return;
  }

  for (const quote of quotes) {
    const card = document.createElement("article");
    const text = document.createElement("strong");
    const source = document.createElement("small");
    const excerpt = quote.text.length > 100 ? `${quote.text.slice(0, 100)}…` : quote.text;

    text.textContent = `“${excerpt}”`;
    try {
      source.textContent = new URL(quote.sourceUrl).hostname;
    } catch {
      source.textContent = "Unknown source";
    }
    card.className = "quote";
    card.append(text, source);
    quoteList.appendChild(card);
  }
}

renderQuotes().catch((error) => setStatus(error.message, true));
