const randomId = () => {
  let id = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 22; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};

// Function to get or create a user ID
const getUserID = function () {
  return new Promise((resolve, reject) => {
    // Check if the user ID already exists in chrome storage
    chrome.storage.local.get(["userId"], (result) => {
      let userId = result.userId;

      if (!userId) {
        // If not, generate a new one and store it
        userId = randomId();
        chrome.storage.local.set({ userId: userId }, () => {
          resolve(userId);
        });
      } else {
        resolve(userId);
      }
    });
  });
};

function updateBadge(url) {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const savedWords = result.savedWords || [];
    const count = savedWords.filter((word) => word.url === url).length;
    chrome.action.setBadgeText({ text: count.toString() });
  });
}

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

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getUserId") {
    // Simulate getting the user ID (replace with your actual logic)
    getUserID().then((userId) => {
      sendResponse({ userId: userId });
    });
  }
  return true; // Keep the message channel open for sendResponse
});
