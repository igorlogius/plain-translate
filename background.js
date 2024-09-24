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

async function setToStorage(id, value) {
  let obj = {};
  obj[id] = value;
  return browser.storage.local.set(obj);
}

async function refreshLanguages() {
  const burl = "https://translate.googleapis.com/translate_a/";
  let tmp = await fetch(burl + "l?client=gtx");
  tmp = (await tmp.json()).tl;

  let languages = new Map();

  for (const k of Object.keys(tmp).sort((a, b) =>
    tmp[a].localeCompare(tmp[b]),
  )) {
    languages.set(tmp[k], k);
  }

  setToStorage("languages", languages);
}

browser.runtime.onStartup.addListener(refreshLanguages);
browser.runtime.onInstalled.addListener(refreshLanguages);
