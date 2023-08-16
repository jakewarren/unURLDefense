// ==UserScript==
// @name        unURLDefense
// @description remove urlDefense link wrappers in all (outlook|gmail) emails
// @version     1.3.0
// @match       https://outlook.office365.com/mail/*
// @match       https://outlook.office.com/mail/*
// @match       https://mail.google.com/*
// @grant       none
// ==/UserScript==

(() => {
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

  // mcCreepy just watches mutants and their children waiting to see if any of them
  // start wrapping so that he can call the strippers on them.
  // Which is to say, remove all urlDefense link wrappers in any and all emails.
  const mcCreepy = new MutationObserver((mutationsList, mcCreepy) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        callStripper();
      }
    }
  });

  // callStripper is a hollaback fn to call the most desirable stripper for the occasion.
  // Outlook checks if Jane is avail but will settle for HTML. Gmail always goes with HTML.
  const callStripper = () => {
    const txtEmail = document.querySelector(".PlainText");
    if (txtEmail) {
      plainJaneStripper(txtEmail);
    } else {
      htmlStripper();
    }
  };

  // plainJane strips links from "text/plain" emails (outlook specific)
  const plainJaneStripper = (txtEmail) => {
    if (
      txtEmail.innerHTML.length > 0 &&
      !txtEmail.hasAttribute("data-has-been-mutated")
    ) {
      txtEmail.innerHTML = txtEmail.innerHTML.replaceAll(
        /https:\/\/urldefense[^$]+\$/gm,
        (...match) => unUrlDefense(match[0])
      );
    }
    txtEmail.setAttribute("data-has-been-mutated", "true");
  };

  // HTML strips links out the <a>.. tags
  const htmlStripper = () => {
    for (const link of document.getElementsByTagName("a")) {
      if (link.hostname === "urldefense.com") {
        const href = new URL(link.href).href;
        link.href = unUrlDefense(href);
        link.dataset.saferedirecturl = unUrlDefense(href);
        link.innerText = unUrlDefense(link.innerText);
      }
    }
  };

  // Outlook is always a ReadingPain, so we can just watch that section.
  // Gmail changes their classes like they're dirty diapers, so just watch their whole body and stuff or w/e...
  const target = document.querySelector(
    "#ReadingPaneContainerId > div > div > div"
  );

  // mutants and their lil mutant children to creep on
  const mutants = { childList: true, subtree: true };

  // let the games begin...
  if (target) {
    mcCreepy.observe(target, mutants);
  } else {
    mcCreepy.observe(document.querySelector("body"), mutants);
  }
})();
