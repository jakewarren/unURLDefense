for (const a of document.getElementsByTagName('a')) {
  if (a.hostname === "urldefense.com" && a.dataset.saferedirecturl) {
    const original_src = a.dataset.saferedirecturl;
    const href = original_src.replace(/.*urldefense.com\/v3\/__(.*)__;!!.*/,'$1');
    a.href = href;
    a.innerText = href;
  }
} 
