/* global browser */

// todo: add timestamp, language, url of open/selected page
// todo: add a clear history button
// todo: add button to clear individual history entries
// todo: search for the history ?

const burl = "https://translate.googleapis.com/translate_a/";
const select = document.getElementById("language");
const container = document.getElementById("text");
const notice = document.getElementById("notice");
const txt2trans = document.getElementById("text2translate");
const doTrans = document.getElementById("doTranslate");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

let lastText = "";
let lastLang = "";
let history = [];

async function getFromStorage(type, id, fallback) {
  const tmp = await browser.storage.local.get(id);
  return typeof tmp[id] === type ? tmp[id] : fallback;
}

async function setToStorage(id, value) {
  let obj = {};
  obj[id] = value;
  return browser.storage.local.set(obj);
}

async function onLoad() {
  let tmp = await fetch(burl + "l?client=gtx");
  tmp = (await tmp.json()).tl;
  for (const k of Object.keys(tmp).sort((a, b) =>
    tmp[a].localeCompare(tmp[b])
  )) {
    select.add(new Option(tmp[k], k));
  }
  select.value = await getFromStorage("string", "language", "en");
  select.onchange = () => {
    browser.storage.local.set({ language: select.value });
  };
  doTrans.addEventListener("click", doTranslate);

  history = await getFromStorage("object", "history", []);

  for (const h of history) {
    const div = document.createElement("div");
    div.innerText = h;
    div.style.border = "1px solid black";
    div.style.padding = "3px";
    div.style["margin-top"] = "5px";
    container.insertBefore(div, container.firstChild);
  }
}

async function onMessage(m) {
  txt2trans.value = m.text;
  doTranslate();
}

async function doTranslate() {
  const text = txt2trans.value.trim();

  // get text from textarea
  if (text === lastText && select.value === lastLang) {
    notice.innerText = " No Change. Ready.";
    return;
  }
  notice.innerText = " Work in Progress ";

  const div = document.createElement("div");
  div.innerText = " ... ";
  div.style.border = "1px solid black";
  div.style.padding = "3px";
  div.style["margin-top"] = "5px";
  container.insertBefore(div, container.firstChild);

  lastText = text;
  lastLang = select.value;

  let tmp = "";
  try {
    tmp = await fetch(
      burl +
        "single?client=gtx&dt=t&dt=bd&dj=1&sl=auto" +
        "&tl=" +
        lastLang +
        "&q=" +
        encodeURIComponent(lastText)
    );
    if (!tmp.ok) {
      throw "Error: " + tmp.statusText;
    }
    tmp = await tmp.json();
    tmp = tmp.sentences.map((s) => s.trans).join("");
  } catch (e) {
    tmp = "Error: " + e;
  }
  div.innerText = tmp;
  notice.innerText = "Done. Ready.";
  history.push(tmp);
  setToStorage("history", history);
}

function clearHistory() {
  setToStorage("history", []);
  window.location.reload();
}

browser.runtime.onMessage.addListener(onMessage);
document.addEventListener("DOMContentLoaded", onLoad);
clearHistoryBtn.addEventListener("click", clearHistory);
