/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

browser.menus.create({
  title: extname,
  contexts: ["selection"],
  documentUrlPatterns: ["<all_urls>"],
  onclick: async (info) => {
    browser.browserAction.openPopup({});
  },
});

async function refreshLanguages() {
  let languages = new Map();
  let tmp = await fetch(
    "https://translate.googleapis.com/translate_a/l?client=gtx",
  );
  tmp = (await tmp.json()).tl;
  for (const k of Object.keys(tmp).sort((a, b) =>
    tmp[a].localeCompare(tmp[b]),
  )) {
    languages.set(tmp[k], k);
  }
  let storage = await import("./storage.js");
  storage.set("languages", languages);
}

browser.runtime.onStartup.addListener(refreshLanguages);
browser.runtime.onInstalled.addListener(refreshLanguages);
