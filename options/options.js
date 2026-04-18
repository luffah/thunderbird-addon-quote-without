/***
 *
 * minimalist generic option manager
 *
 * FEATURES
 *
 * - supported input types : checkbox, radio, text, textarea, number
 * - <label> tag content </label>
 *     are translated
 * - <input data-preference="addons.pref.setting"/>
 *     load and save the nammed setting
 * - <input type="checkbox" data-preference="addons.pref.enable"/>
 *     enable or disable all input with preference starting with addons.pref
 *
 * USAGE
 *
 * - just put <script src="options.js" type="module"></script> in options.html header
 * - structure the option page as you want, but it is required to define inputs and labels
 *
 *   EXAMPLE
 *
 * - in options.html
 *
 *    <input type="checkbox" id="prefEnable" data-preference="addons.pref.enable"/>
 *    <label for="prefEnable">Pref enable label</label>
 *    <input type="text" id="prefText" data-preference="addons.pref.text"/>
 *    <input type="number" id="prefNumber" data-preference="addons.pref.number"/>
 *
 * - in _locales/<lang>/messages.json
 *
 *    "Pref enable label": {
 *       "message": "Enable option pref"
 *    },
 *
 ***/

async function getPrefInStorage(prefName) {
    let prefObj = await browser.storage.local.get(prefName);
    return prefObj[prefName];
}

async function setPrefInStorage(prefName, prefValue) {
    let prefObj = {};
    prefObj[prefName] = prefValue;
    await browser.storage.local.set(prefObj);
}

async function loadPref(prefElement) {
    let type = prefElement.dataset.type || prefElement.getAttribute("type") || prefElement.tagName;
    let name = prefElement.dataset.preference;
    let value = await getPrefInStorage(`${name}`);
    switch (type) {
        case "radio":
        case "checkbox":
            prefElement.checked = value;
            prefElement.addEventListener("change", () => savePref(prefElement));
            if (name.endsWith('.enable')) {
                setupRelated(name, prefElement.checked);
            }
            break;
        case "text":
        case "textarea":
        case "number":
            prefElement.value = value;
            prefElement.addEventListener("change", () => savePref(prefElement));
            break;
    }
}

async function savePref(prefElement) {
    let type = prefElement.dataset.type || prefElement.getAttribute("type") || prefElement.tagName;
    let name = prefElement.dataset.preference;
    switch (type) {
        case "radio":
        case "checkbox":
            await setPrefInStorage(`${name}`, !!prefElement.checked);
            if (name.endsWith('.enable')) {
                setupRelated(name, !!prefElement.checked);
            }
            break;
        case "text":
        case "textarea":
        case "number":
            await setPrefInStorage(`${name}`, prefElement.value);
            break;
    }
}

function setupRelated(name, active){
    let query = document.evaluate(
        "//input[contains(@data-preference, '" + name.substring(0,name.length-6) + "')]",
        document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0, length = query.snapshotLength; i < length; ++i) {
        if (query.snapshotItem(i).dataset.preference == name) 
            continue;
        if (active) {
            query.snapshotItem(i).removeAttribute("disabled");
        } else {
            query.snapshotItem(i).setAttribute("disabled", "true");
        }
    }
}

async function loadOptions() {
    let prefElements = document.querySelectorAll("input[data-preference]");
    for (let prefElement of prefElements) {
        await loadPref(prefElement);
    }
}

async function localizeLabels(){
    let elems = document.getElementsByTagName('label');
    for (let i=0; i < elems.length; i++){
        elems[i].innerHTML = messenger.i18n.getMessage(elems[i].innerHTML);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    localizeLabels();
    loadOptions();
}, {
    once: true
});
