/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;
const sidebarURL = browser.runtime.getURL("/sidebar.html");

async function retrySend(text, rtcount) {
  if (rtcount < 1) {
    console.error("retry count went to zero", text);
    return;
  }
  try {
    await browser.runtime.sendMessage({ text });
  } catch (e) {
    console.error(e);
    setTimeout(() => {
      retrySend(text, rtcount - 1);
    }, 250);
  }
}

browser.menus.create({
  title: extname,
  contexts: ["selection"],
  documentUrlPatterns: ["<all_urls>"],
  onclick: async (info /*,tab*/) => {
    setPanel();
    browser.sidebarAction.open();
    const text = info.selectionText.trim();
    retrySend(text, 20);
  },
});

async function setPanel() {
  const url = await browser.sidebarAction.getPanel({});
  if (url !== sidebarURL) {
    await browser.sidebarAction.setPanel({ panel: sidebarURL });
  }
}

browser.browserAction.onClicked.addListener(async () => {
  await browser.sidebarAction.open();
  setPanel();
});
