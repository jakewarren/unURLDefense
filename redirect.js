// ref: https://github.com/cphyc/thunderbird_remove_safelinks/blob/e48b3f3bf547797cfc9db60cbcd43003c8a0f545/src/decoders.js
function unUrlDefense(link) {
    const proofpoint_regex = new RegExp(
        "https://urldefense(?:.proofpoint)?.com/(v[0-9])/([.:]?[-+a-zA-Z0-9%&/=;_!?*$]+)+"
    );
    const proofpoint = link.match(proofpoint_regex);
    if (!proofpoint) {
        return link;
    }

    switch (proofpoint[1]) {
        case "v1": {
            const v1_pattern = new RegExp(
                "https://urldefense(?:.proofpoint)?.com/v1/url\\?u=([^&]*)&k=.*"
            );
            return decodeURIComponent(link.match(v1_pattern)[1]);
        }

        case "v2": {
            const v2_pattern = new RegExp(
                "https://urldefense(?:.proofpoint)?.com/v2/url\\?u=([^&]*)&[dc]=.*"
            );
            const url = link
                .match(v2_pattern)[1]
                .replace(/-/g, "%")
                .replace(/_/g, "/");
            return decodeURIComponent(url);
        }

        case "v3": {
            const v3_pattern = new RegExp(
                "https://urldefense(?:.proofpoint)?.com/v3/__(.+)__;([^!]*).*"
            );
            const v3_token_pattern = new RegExp("\\*(\\*.)?", "g");
            const length_codes =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
            const url = link.match(v3_pattern);
            const encbytes = atob(url[2].replace(/_/g, "/").replace(/-/g, "+"));

            let encbytes_off = 0;
            return url[1].replace(v3_token_pattern, (chunk) => {
                const len = chunk.length > 1 ? length_codes.search(chunk[2]) + 2 : 1;
                const out = encbytes.substring(encbytes_off, encbytes_off + len);
                encbytes_off += len;
                return out;
            });
        }
    }

    return link;
}

function rewriteUrl(requestDetails) {
    let url = new URL(requestDetails.url);

    cleanURL = unUrlDefense(url.toString())
    console.log(`Redirecting: ${requestDetails.url} to ${cleanURL}`);

    return { redirectUrl: cleanURL };
}

browser.webRequest.onBeforeRequest.addListener(
    rewriteUrl,
    { urls: ["https://urldefense.com/*"] },
    ["blocking"]
);