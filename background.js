chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveWord",
    title: "Save Word",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveWord") {
    const selectedText = info.selectionText;
    const url = tab.url;
    const date = new Date().toLocaleString();

    chrome.storage.local.get({ savedWords: [] }, (result) => {
      const savedWords = result.savedWords;

      // Check if the selected text already exists
      const exists = savedWords.some(
        (word) => word.text === selectedText && word.url === url
      );

      if (!exists) {
        savedWords.push({ text: selectedText, url, date });
        chrome.storage.local.set({ savedWords }, () => {
          updateBadge();
        });
      }
    });
  }
});

function updateBadge() {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const count = result.savedWords.length;
    chrome.action.setBadgeText({ text: count.toString() });
  });
}
