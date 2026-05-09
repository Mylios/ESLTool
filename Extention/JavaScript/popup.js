document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("read").addEventListener('click', () => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          window.readLinks();
        }
      });

    });
  });
});