

// source: https://github.com/cphyc/thunderbird_remove_safelinks/blob/e48b3f3bf547797cfc9db60cbcd43003c8a0f545/src/decoders.js
function unUrlDefense(a) {
  let proofpoint_regex = new RegExp('https://urldefense(?:\.proofpoint)?\.com/(v[0-9])/([.:]?[-+a-zA-Z0-9%&/=;_!?*$]+)+');
  var proofpoint = a.match(proofpoint_regex);
  if (!proofpoint)
    return a;

  var v = proofpoint[1];
  var outurl = a;
  if (v == 'v1') {
    let v1_pattern = new RegExp('https://urldefense(?:\.proofpoint)?\.com/v1/url\\?u=([^&]*)&k=.*');
    outurl = decodeURIComponent(a.match(v1_pattern)[1]);
  } else if (v == 'v2') {
    let v2_pattern = new RegExp('https://urldefense(?:\.proofpoint)?\.com/v2/url\\?u=([^&]*)&[dc]=.*');
    let url = a.match(v2_pattern)[1].replace(/-/g, '%').replace(/_/g, '/');
    outurl = decodeURIComponent(url);
  } else if (v == 'v3') {
    let v3_pattern = new RegExp('https://urldefense(?:\.proofpoint)?\.com/v3/__(.+)__;([^\!]*).*');
    let v3_token_pattern = new RegExp('\\*(\\*.)?', 'g');
    let length_codes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let url = a.match(v3_pattern);
    let encbytes = atob(url[2].replace(/_/g, '/').replace(/-/g, '+'));
    let encbytes_off = 0;

    outurl = url[1].replace(v3_token_pattern, (chunk) => {
      var len = 1;
      if (chunk.length > 1)
        len = length_codes.search(chunk[2]) + 2;
      var out = encbytes.substring(encbytes_off, encbytes_off + len);
      encbytes_off += len;
      return out;
    });
  }

  return outurl;
}

// process all links and remove the urldefense wrapper
function stripURLs() {
  for (const a of document.getElementsByTagName('a')) {
    if (a.hostname === "urldefense.com") {
      const href = new URL(a.href).href;
      a.href = unUrlDefense(href);
      a.dataset.saferedirecturl = unUrlDefense(href);
      a.innerText = unUrlDefense(a.innerText)
    }
  }
}

var observeDOM = (function () {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
    eventListenerSupported = window.addEventListener;

  return function (obj, callback) {
    if (MutationObserver) {
      var obs = new MutationObserver(function (mutations, observer) {
        if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
          callback();
      });
      obs.observe(obj, { childList: true, subtree: true });
    }
    else if (eventListenerSupported) {
      obj.addEventListener('DOMNodeInserted', callback, false);
      obj.addEventListener('DOMNodeRemoved', callback, false);
    }
  }
})();

// use a DOM MutationObserver to monitor changes (like loading an email) and strip the urldefense URLS from all links
// NOTE: monitoring the body element could potentially have performance impacts, need to monitor
observeDOM(document.querySelector('body'), function () {
  stripURLs();
});
