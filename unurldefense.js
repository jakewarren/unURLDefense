const urldefenseRegex = /https:\/\/urldefense.com\/.*?\/__(.*?)__;.*?\$/;

function unUrlDefense(url) {
  return url.replace(urldefenseRegex, "$1").replace("*","#");
}

// process all links and remove the urldefense wrapper
function stripURLs() {
  for (const a of document.getElementsByTagName('a')) {
    if (a.hostname === "urldefense.com" && a.dataset.saferedirecturl) {
      const href = new URL(a.href).href;
      a.href = unUrlDefense(href);
      a.dataset.saferedirecturl = unUrlDefense(href);
      a.innerText = unUrlDefense(a.innerText)
    }
  } 
}

var observeDOM = (function(){
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
      eventListenerSupported = window.addEventListener;

  return function(obj, callback){
      if( MutationObserver ){
          var obs = new MutationObserver(function(mutations, observer){
              if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                  callback();
          });
          obs.observe( obj, { childList:true, subtree:true });
      }
      else if( eventListenerSupported ){
          obj.addEventListener('DOMNodeInserted', callback, false);
          obj.addEventListener('DOMNodeRemoved', callback, false);
      }
  }
})();

// use a DOM MutationObserver to monitor for changes (like loading an email) and strip the urldefense URLS from all links
// NOTE: monitoring the body element could potentially have performance impacts, need to monitor
observeDOM( document.querySelector('body') ,function(){ 
  stripURLs();
});
