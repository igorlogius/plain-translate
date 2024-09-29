/* global browser */

let docEls = {};

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = 25 + element.scrollHeight + "px";
}

let lastText = "";
let lastLang = "";

async function google_translate(text_to_translate, target_language_code) {
  let tmp = "";
  try {
    tmp = await fetch(
      "https://translate.googleapis.com/translate_a/" +
        "single?client=gtx&dt=t&dt=bd&dj=1&sl=auto" +
        "&tl=" +
        target_language_code +
        "&q=" +
        encodeURIComponent(text_to_translate),
    );
    if (!tmp.ok) {
      throw "Error: " + tmp.statusText;
    }
    tmp = await tmp.json();
    tmp = tmp.sentences.map((s) => s.trans).join("\n");
    tmp = tmp.replace(/\n+/g, "\n");
    tmp = tmp.replace(/\s+/g, " ");
    tmp = tmp.trim();
  } catch (e) {
    console.error(e);
    tmp = e.toString();
  }
  return tmp;
}

async function doTranslate() {
  // remove multiple linebreaks
  docEls.txta_in.value = docEls.txta_in.value.replace(/\n+/g, "\n");

  // get reduced input from textarea
  const text = docEls.txta_in.value.replace(/\s+/g, " ").trim();


  // empty input => empty output
  if (text === "") {
    docEls.txta_out.value = "";
    textAreaAdjust(docEls.txta_out);
    textAreaAdjust(docEls.txta_in);
    return;
  }

  // nothing changed, so do nothing
  if (text === lastText && docEls.selected_language.value === lastLang) {
    return;
  }

    // something changed

    // clear ouptut (makes wip indicator visible)
  docEls.txta_out.value = "";

    // clear wip indicator
  docEls.txta_out.setAttribute(
    "placeholder",
    browser.i18n.getMessage("popup_txta_out_placeholder_wip"),
  );

  // cache inputs
  lastText = text;
  lastLang = docEls.selected_language.value;

  // do translate
  const tmp = await google_translate(text, selected_language.value);

  // update output
  docEls.txta_out.value = tmp;
  textAreaAdjust(docEls.txta_out);
  textAreaAdjust(docEls.txta_in);
}

async function onLoad() {
  let tmp;
  let docUtils = await import("./docUtils.js");

  docEls = docUtils.getElsByIds([
    "selected_language",
    "txta_out",
    "txta_in",
    "selected_language_label",
  ]);

  docEls.txta_in.setAttribute(
    "placeholder",
    browser.i18n.getMessage("popup_txta_in_placeholder"),
  );
  docEls.txta_out.setAttribute(
    "placeholder",
    browser.i18n.getMessage("popup_txta_out_placeholder"),
  );
  docEls.selected_language_label.innerText = browser.i18n.getMessage(
    "popup_selected_language_label",
  );

  // try to get text from active tab
  try {
    tmp = await browser.tabs.executeScript({
      code: `(() => {
            try {
                return getSelection().toString().replaceAll(/\s+/g," ").trim();
            }catch(e){
                return "";
            }
    })();`,
    });
    if (Array.isArray(tmp) && tmp.length === 1 && typeof tmp[0] === "string") {
      tmp = tmp[0];
    } else {
      tmp = "";
    }
  } catch (e) {
    console.error(e);
    tmp = "";
  }
  docEls.txta_in.value = tmp;

  textAreaAdjust(docEls.txta_in);
  textAreaAdjust(docEls.txta_out);

  // focus output when input is not empty
  if (docEls.txta_in.value.trim() === "") {
    docEls.txta_in.focus();
  } else {
    docEls.txta_out.focus();
  }

  let storage = await import("./storage.js");
  const languages = await storage.get("object", "languages", new Map());

  for (const [k, v] of languages) {
    docEls.selected_language.add(new Option(k, v));
  }
  docEls.selected_language.value = await storage.get(
    "string",
    "language",
    "en",
  );
  docEls.selected_language.onchange = () => {
    storage.set("language", docEls.selected_language.value);
  };
  setInterval(doTranslate, 750);
}

document.addEventListener("DOMContentLoaded", onLoad);
