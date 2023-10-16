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

// strippers - America's favorite past-time...
// Though in this context it's just a callback function which will strip
// all URLDefense wrappers/handlers from any email as it is being opened.
const strippers = (mutationsList) => {
  for (const mutation of mutationsList) {
    for (const _addedNode of mutation.addedNodes) {
      // special handling required if it's a text email in outlook
      const txtEmail = document.querySelector(".PlainText");
      if (txtEmail) {
        plainJaneStripper(txtEmail);
        continue;
      }

      htmlStripper();
    }
  }
};

// plainJane strips links from "text/plain" emails (outlook specific)
const plainJaneStripper = (txtEmail) => {
  if (!txtEmail.hasAttribute("data-has-been-mutated")) {
    txtEmail.innerHTML = txtEmail.innerHTML.replaceAll(
      /https:\/\/urldefense[^$]+\$/gm,
      (...match) => unUrlDefense(match[0])
    );
  }
  txtEmail.setAttribute("data-has-been-mutated", "true");
};

// htmlstripper is anchors away stripping links from <a>.. tags
const htmlStripper = () => {
  for (const anchor of document.getElementsByTagName("a")) {
    if (anchor.hostname === "urldefense.com") {
      const barebackLink = unUrlDefense(anchor.href);
      anchor.href = barebackLink;
      anchor.dataset.saferedirecturl = barebackLink;

      // if the displayed text was the og urldefense wrapped
      // link then we'll replace it. Otherwise, let it be.
      if (anchor.innerText.includes("urldefense")) {
        anchor.innerText = barebackLink;
      }

      // clone-boning, effectively thwarts MS by removing the onclick
      // handler added by safelinks. This is useful for weirdo's
      // who left-click links in emails from time-to-time, like me.
      const boned = anchor.cloneNode(true);
      anchor.replaceWith(boned);
    }
  }
};

(() => {
  // outlook is always a ReadingPain, so lets focus on that
  let target = document.querySelector(
    "#ReadingPaneContainerId > div > div > div"
  );

  // gmail changes classes like they are dirty diapers.
  // so observe all of their everything all at once, i suppose.
  if (!target) {
    target = document.querySelector("body");
  }

  // moe fucks!
  const moe = new MutationObserver(strippers);

  // just watch. you'll see...
  moe.observe(target, { childList: true, subtree: true });
})();
