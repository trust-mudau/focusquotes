const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "MARK"]);

function highlightText(textNode, quoteText) {
  const value = textNode.nodeValue || "";
  const index = value.toLocaleLowerCase().indexOf(quoteText.toLocaleLowerCase());
  if (index === -1) return false;

  const fragment = document.createDocumentFragment();
  fragment.append(document.createTextNode(value.slice(0, index)));
  const mark = document.createElement("mark");
  mark.dataset.focusquotes = "true";
  mark.textContent = value.slice(index, index + quoteText.length);
  fragment.append(mark, document.createTextNode(value.slice(index + quoteText.length)));
  textNode.replaceWith(fragment);
  return true;
}

async function highlightSavedQuotes() {
  const { settings = { highlightEnabled: true, storageMode: "local" } } = await chrome.storage.local.get("settings");
  if (!settings.highlightEnabled) return;

  const store = settings.storageMode === "sync" ? chrome.storage.sync : chrome.storage.local;
  const { quotes = [] } = await store.get("quotes");
  const pageQuotes = quotes.filter((quote) => quote.sourceUrl === window.location.href && quote.text?.trim());

  for (const quote of pageQuotes) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue?.trim() || SKIPPED_TAGS.has(node.parentElement?.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) highlightText(node, quote.text);
  }
}

highlightSavedQuotes().catch((error) => console.warn("FocusQuotes highlighting failed:", error));
