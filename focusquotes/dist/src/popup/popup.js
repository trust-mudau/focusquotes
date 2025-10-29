const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const quoteList = document.getElementById("quoteList") as HTMLDivElement;

saveBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return;

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection()?.toString().trim() || "",
  });

  if (!result) {
    alert("Please highlight some text first!");
    return;
  }

  const sourceUrl = tab.url || "unknown";
  await chrome.runtime.sendMessage({ type: "SAVE_QUOTE", text: result, sourceUrl });
  renderQuotes();
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "QUOTE_SAVED") renderQuotes();
});

async function renderQuotes() {
  const { quotes = [] } = await chrome.storage.local.get("quotes");
  quoteList.innerHTML = quotes
    .map(
      (q) => `
      <div class="quote">
        <b>“${q.text.slice(0, 80)}${q.text.length > 80 ? "..." : ""}”</b><br/>
        <small>${new URL(q.sourceUrl).hostname}</small>
      </div>`
    )
    .join("");
}

renderQuotes();
