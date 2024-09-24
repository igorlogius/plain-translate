/* global browser */

const burl = "https://translate.googleapis.com/translate_a/";
const select = document.getElementById("language");
const translated_text = document.getElementById("text");
const txt2trans = document.getElementById("text2translate");
const doTrans = document.getElementById("doTranslate");

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
  const ret = await browser.tabs.executeScript({
    code: `(() => {
            return getSelection().toString();
    })();`,
  });

  txt2trans.value = ret[0];

  let tmp = await fetch(burl + "l?client=gtx");
  tmp = (await tmp.json()).tl;
  for (const k of Object.keys(tmp).sort((a, b) =>
    tmp[a].localeCompare(tmp[b]),
  )) {
    select.add(new Option(tmp[k], k));
  }
  select.value = await getFromStorage("string", "language", "en");
  select.onchange = () => {
    browser.storage.local.set({ language: select.value });
  };
  doTranslate();
}

async function doTranslate() {
  const text = txt2trans.value.trim();

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
  translated_text.innerText = tmp;
}

document.addEventListener("DOMContentLoaded", onLoad);

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    doTranslate();
  }
});
