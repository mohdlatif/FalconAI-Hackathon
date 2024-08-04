chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveWord") {
    const selectedText = info.selectionText;
    const url = tab.url;
    const date = new Date().toLocaleString();

    chrome.storage.local.get({ savedWords: [] }, (result) => {
      const savedWords = result.savedWords || [];

      // Check if the selected text already exists
      const exists = savedWords.some(
        (word) => word.text === selectedText && word.url === url
      );

      if (!exists) {
        savedWords.push({ text: selectedText, url, date });
        chrome.storage.local.set({ savedWords }, () => {
          updateBadge(url);
        });
      }
    });
  }
});

function updateBadge(url) {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const savedWords = result.savedWords || [];
    const count = savedWords.filter((word) => word.url === url).length;
    chrome.action.setBadgeText({ text: count.toString() });
  });
}

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveWord",
    title: "Save Word",
    contexts: ["selection"],
  });
});

// Update badge when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    updateBadge(tab.url);
  }
});

// Update badge when tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      updateBadge(tab.url);
    }
  });
});
