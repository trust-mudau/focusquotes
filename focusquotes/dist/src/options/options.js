const highlightToggle = document.getElementById("highlightToggle");
const storageMode = document.getElementById("storageMode");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const statusEl = document.getElementById("status");
let savedStorageMode = "local";

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.dataset.kind = isError ? "error" : "success";
}

function quoteStore(mode = storageMode.value) {
  return mode === "sync" ? chrome.storage.sync : chrome.storage.local;
}

chrome.storage.local.get("settings").then(({ settings }) => {
  const current = settings || { highlightEnabled: true, storageMode: "local" };
  highlightToggle.checked = current.highlightEnabled;
  storageMode.value = current.storageMode;
  savedStorageMode = current.storageMode;
});

async function saveSettings() {
  try {
    const nextMode = storageMode.value;
    if (nextMode !== savedStorageMode) {
      const oldStore = quoteStore(savedStorageMode);
      const { quotes = [] } = await oldStore.get("quotes");
      await quoteStore(nextMode).set({ quotes });
    }

    await chrome.storage.local.set({
      settings: { highlightEnabled: highlightToggle.checked, storageMode: nextMode },
    });
    savedStorageMode = nextMode;
    showStatus("Settings saved.");
  } catch (error) {
    showStatus(error.message, true);
  }
}

highlightToggle.addEventListener("change", saveSettings);
storageMode.addEventListener("change", saveSettings);

exportBtn.addEventListener("click", async () => {
  try {
    const { quotes = [] } = await quoteStore().get("quotes");
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "focusquotes-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showStatus("Backup exported.");
  } catch (error) {
    showStatus(error.message, true);
  }
});

importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", async () => {
  try {
    const file = importFile.files?.[0];
    if (!file) return;

    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed) || parsed.length > 1000) throw new Error("Choose a valid FocusQuotes backup.");
    const quotes = parsed
      .filter((quote) => typeof quote?.text === "string" && typeof quote?.sourceUrl === "string")
      .map((quote) => ({
        id: quote.id || crypto.randomUUID(),
        text: quote.text.trim().slice(0, 5000),
        sourceUrl: quote.sourceUrl,
        savedAt: quote.savedAt || new Date().toISOString(),
      }))
      .filter((quote) => quote.text);
    await quoteStore().set({ quotes });
    showStatus(`${quotes.length} quotes imported.`);
  } catch (error) {
    showStatus(error.message, true);
  } finally {
    importFile.value = "";
  }
});
