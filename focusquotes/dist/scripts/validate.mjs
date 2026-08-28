import { access, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
const required = [
  manifest.background.service_worker,
  manifest.action.default_popup,
  manifest.options_page,
  ...manifest.content_scripts.flatMap((entry) => entry.js),
  ...Object.values(manifest.icons),
];

for (const path of required) await access(new URL(`../${path}`, import.meta.url));

for (const file of [
  "src/background/background.js",
  "src/content/contentScript.js",
  "src/options/options.js",
  "src/popup/popup.js",
]) {
  execFileSync(process.execPath, ["--check", fileURLToPath(new URL(`../${file}`, import.meta.url))], {
    stdio: "inherit",
  });
}

console.log(`Validated FocusQuotes ${manifest.version}: ${required.length} manifest assets found.`);
