async function quoteWithoutUpdateMessage(param){
    /*
     * dump("<param :\n");
     * dump(JSON.stringify(param));
     * dump("/>\n");
     */
    if (param.composeDetails.type == "reply" || param.composeDetails.type == "forward") {

        if (param.imgRemove) {
            if (param.imgRemoveAll) {
                xpathRemoval("//img");
            } else {
                xpathRemoval("//img", e => (e.getAttribute('src') || '').match('https?://') === null);
            }
        }

        if (param.oldReplyRemove) {
            xpathRemoval("//blockquote".repeat(param.oldReplyRemoveLevel));
        }

        if (param.signatureRemove) {
            xpathRemoval("//span[contains(@id, 'signature')]");
            xpathRemoval("//span[contains(@class, 'signature')]");
            xpathRemoval("//div[contains(@id, 'signature')]");
            xpathRemoval("//div[contains(@class, 'signature')]");
            xpathRemoval("//div[contains(@id, 'rc_sig')]");
        }
    }
}

/** Following is just indispensable for the meaningful part **/
function getElementsByXPath(xpath, root)
{
    let results = [];
    let query = document.evaluate(xpath, root, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0, length = query.snapshotLength; i < length; ++i) {
        results.push(query.snapshotItem(i));
    }
    return results;
}

function xpathRemoval(expr, cond=null, root=null) {
    let elems = getElementsByXPath(expr, root === null ? document.body: root);
    for (let i = elems.length-1 ; i >= 0; i--) 
        if (cond === null || cond(elems[i]))
            elems[i].remove();
}

async function main() {

    let param = await browser.runtime.sendMessage({addons_quote_without_get_message: true});

    try {
        quoteWithoutUpdateMessage(param);
    } catch (e) {
        console.error(e);
    }
}

main();
