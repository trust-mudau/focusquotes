chrome.runtime.onInstalled.addListener(() => {
  console.log("FocusQuotes installed.");
});

export async function saveQuote(text: string, sourceUrl: string) {
  const { settings } = await chrome.storage.local.get("settings");
  const mode = settings?.storageMode || "local";
  const store = chrome.storage[mode];

  const { quotes = [] } = await store.get("quotes");
  quotes.push({ text, sourceUrl, date: new Date().toISOString() });

  try {
    await store.set({ quotes });
  } catch (err) {
    if (mode === "sync") {
      console.warn("Sync storage full. Falling back to local.");
      await chrome.storage.local.set({ quotes });
    }
  }
}
