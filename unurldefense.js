function stripURLs() {
  for (const a of document.getElementsByTagName('a')) {
    if (a.hostname === "urldefense.com" && a.dataset.saferedirecturl) {
      const href = new URL(a.dataset.saferedirecturl).href;
      a.href = href;
      a.innerText = href;
      a.dataset.saferedirecturl = href;
    }
  } 
}

// Strip URLs on document end.
// TODO: do it again when new <a>'s are added
stripURLs();
