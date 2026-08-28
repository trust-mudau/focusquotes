const MAX_QUOTE_LENGTH = 5000;
const MAX_QUOTES = 500;

async function getQuoteStore() {
  const { settings } = await chrome.storage.local.get("settings");
  return settings?.storageMode === "sync" ? chrome.storage.sync : chrome.storage.local;
}

async function saveQuote(text, sourceUrl) {
  const cleanText = String(text || "").trim().slice(0, MAX_QUOTE_LENGTH);
  if (!cleanText) throw new Error("Select some text before saving a quote.");

  const parsedUrl = new URL(sourceUrl);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Quotes can only be saved from web pages.");
  }

  const store = await getQuoteStore();
  const { quotes = [] } = await store.get("quotes");
  const duplicate = quotes.some((quote) => quote.text === cleanText && quote.sourceUrl === parsedUrl.href);
  if (duplicate) return;

  const nextQuotes = [
    {
      id: crypto.randomUUID(),
      text: cleanText,
      sourceUrl: parsedUrl.href,
      savedAt: new Date().toISOString(),
    },
    ...quotes,
  ].slice(0, MAX_QUOTES);

  await store.set({ quotes: nextQuotes });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("settings").then(({ settings }) => {
    if (!settings) {
      chrome.storage.local.set({ settings: { highlightEnabled: true, storageMode: "local" } });
    }
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "SAVE_QUOTE") return false;

  saveQuote(message.text, message.sourceUrl)
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});
