browser.composeScripts.register({
    js: [{
            file: "compose.js"
        }
    ]
});

async function handleQuoteWithoutMessage(sender) {
    const { tab : { id: tabId } } = sender;
    return {
        composeDetails: await messenger.compose.getComposeDetails(tabId),
        imgRemove: await getPrefInStorage("addons.quote.without.images.enable", false),
        imgRemoveAll: await getPrefInStorage("addons.quote.without.images.radio.all", false),
        imgRemoveAttach: await getPrefInStorage("addons.quote.without.images.radio.attach", true),
        oldReplyRemove: await getPrefInStorage("addons.quote.without.old_replies.enable", false),
        oldReplyRemoveLevel: await getPrefInStorage("addons.quote.without.old_replies.level", 0),
        signatureRemove: await getPrefInStorage("addons.quote.without.signature.enable", false)
    };
}

async function quote_without_init_params() {
    await setDefaults("addons.quote.without.images.enable", true);
    await setDefaults("addons.quote.without.images.radio.all", false);
    await setDefaults("addons.quote.without.images.radio.attach", true);
    await setDefaults("addons.quote.without.old_replies.enable", false);
    await setDefaults("addons.quote.without.old_replies.level", 2);
    await setDefaults("addons.quote.without.signature.enable", true);
}

/** Following is just indispensable for the meaningful part **/
browser.runtime.onMessage.addListener((message, sender) => {
    if (message && message.hasOwnProperty("addons_quote_without_get_message"))
        return handleQuoteWithoutMessage(sender);
});

async function getPrefInStorage(prefName, defaultValue) {
    let prefObj = await browser.storage.local.get(prefName);
    if (prefObj && prefObj[prefName] != null)
        return prefObj[prefName];
    return defaultValue;
}

async function setDefaults(prefName, defaultValue) {
    let prefValue = await browser.storage.local.get({ [prefName] : null }).then(rv => rv[prefName]);
    if (prefValue === null)
        await browser.storage.local.set({ [prefName] : defaultValue });
}

quote_without_init_params();
