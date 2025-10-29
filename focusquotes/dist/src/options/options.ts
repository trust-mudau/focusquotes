const highlightToggle = document.getElementById("highlightToggle") as HTMLInputElement;
const storageMode = document.getElementById("storageMode") as HTMLSelectElement;
const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement;
const importBtn = document.getElementById("importBtn") as HTMLButtonElement;
const importFile = document.getElementById("importFile") as HTMLInputElement;
const statusEl = document.getElementById("status") as HTMLElement;

type Settings = {
  highlightEnabled: boolean;
  storageMode: "local" | "sync";
};

chrome.storage.local.get(["settings"], (result) => {
  const settings: Settings = result.settings || {
    highlightEnabled: true,
    storageMode: "local",
  };

  highlightToggle.checked = settings.highlightEnabled;
  storageMode.value = settings.storageMode;
});

highlightToggle.addEventListener("change", saveSettings);
storageMode.addEventListener("change", saveSettings);

function saveSettings() {
  const settings: Settings = {
    highlightEnabled: highlightToggle.checked,
    storageMode: storageMode.value as "local" | "sync",
  };
  chrome.storage.local.set({ settings }, () => showStatus("Settings saved!"));
}

function showStatus(msg: string) {
  statusEl.textContent = msg;
  setTimeout(() => (statusEl.textContent = ""), 2000);
}

exportBtn.addEventListener("click", async () => {
  const { quotes } = await chrome.storage.local.get(["quotes"]);
  const blob = new Blob([JSON.stringify(quotes || [], null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes_backup.json";
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", async () => {
  const file = importFile.files?.[0];
  if (!file) return;

  const text = await file.text();
  const quotes = JSON.parse(text);
  await chrome.storage.local.set({ quotes });
  showStatus("Quotes imported successfully!");
});
