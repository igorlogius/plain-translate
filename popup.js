/* global browser */

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = 25 + element.scrollHeight + "px";
}

const burl = "https://translate.googleapis.com/translate_a/";
const select = document.getElementById("language");
const txta_outputText = document.getElementById("text");
const txta_inputText = document.getElementById("text2translate");

let lastText = "";
let lastLang = "";

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
  // get selected Text from active Tab
  try {
    const ret = await browser.tabs.executeScript({
      code: `(() => {
            return getSelection().toString().replaceAll(/\s+/g," ").trim();
    })();`,
    });
    txta_inputText.value = ret[0];
  } catch (e) {}

  textAreaAdjust(txta_inputText);

  if (txta_inputText.value.trim() === "") {
    txta_inputText.focus();
  } else {
    txta_outputText.focus();
  }
  const languages = await getFromStorage("object", "languages", null);

  for (const [k, v] of languages) {
    select.add(new Option(k, v));
  }
  select.value = await getFromStorage("string", "language", "en");
  select.onchange = () => {
    browser.storage.local.set({ language: select.value });
  };
  doTranslate();
}

async function doTranslate() {
  const text = txta_inputText.value.replace(/\s+/g, " ").trim();

  // get text from textarea
  if (text === lastText && select.value === lastLang) {
    return;
  }

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
        encodeURIComponent(lastText),
    );
    if (!tmp.ok) {
      throw "Error: " + tmp.statusText;
    }
    tmp = await tmp.json();
    tmp = tmp.sentences.map((s) => s.trans).join("");
  } catch (e) {
    tmp = "Error: " + e;
  }
  txta_outputText.value = tmp;
  textAreaAdjust(txta_outputText);
}

document.addEventListener("DOMContentLoaded", onLoad);

setInterval(doTranslate, 500);
