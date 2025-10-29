chrome.storage.local.get(["quotes", "settings"], (data) => {
  const quotes = data.quotes || [];
  const settings = data.settings || { highlightEnabled: true };

  if (!settings.highlightEnabled) return;

  quotes.forEach((quote: any) => {
    if (!quote.text) return;

    const regex = new RegExp(quote.text.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    document.body.innerHTML = document.body.innerHTML.replace(
      regex,
      (match) => `<mark style="background:yellow;">${match}</mark>`
    );
  });
});
