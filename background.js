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
