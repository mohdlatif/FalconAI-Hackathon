const randomId = async () => {
  const response = await fetch(
    "https://backend.theassignit.workers.dev/generate"
  );
  const data = await response.json();
  return data[0].id;
};

async function storeWordsInSupabase(savedWords) {
  const userId = await getUserID();
  const response = await fetch(
    `https://backend.theassignit.workers.dev/store`,
    {
      method: "POST",
      body: JSON.stringify({
        userId: userId,
        savedWords: savedWords,
      }),
    }
  );

  if (!response.ok) {
    console.error("Error storing words in Supabase:", response.statusText);
  }
}

// Function to get or create a user ID
const getUserID = async function () {
  return new Promise((resolve, reject) => {
    // Check if the user ID already exists in chrome storage
    chrome.storage.local.get(["userId"], async (result) => {
      let userId = result.userId;

      if (!userId) {
        // If not, generate a new one and store it
        userId = await randomId();
        chrome.storage.local.set({ userId: userId }, () => {
          resolve(userId);
        });
      } else {
        resolve(userId);
      }
    });
  });
};

function preProcessText(text) {
  // Preprocess the text by removing special characters, numbers, and converting to lowercase
  capitalizeText = (text) =>
    (text = text.trim().replace(/^[^\w]+|[^\w]+$/g, ""));
  text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  return text;
}

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveWord",
    title: "Save Word",
    contexts: ["selection"],
  });

  // chrome.contextMenus.create({
  //   id: "summarizeText",
  //   title: "Summarize Text",
  //   contexts: ["selection"],
  // });

  // chrome.contextMenus.create({
  //   id: "summarizePage",
  //   title: "Summarize Page",
  //   contexts: ["page"],
  // });
});

function getWordDefination(defineWord, sendResponse) {
  fetch("https://backend.theassignit.workers.dev/ai", {
    method: "POST",
    body: JSON.stringify({
      user: "user",
      text: preProcessText(defineWord),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const aiResponse = data.choices[0].message.content;
      sendResponse({ data: aiResponse });
      // Store the AI response in the local storage
      chrome.storage.local.get({ savedWords: [] }, (result) => {
        const savedWords = result.savedWords;

        // Find the word in the savedWords array
        const wordIndex = savedWords.findIndex(
          (word) => preProcessText(word.text) === preProcessText(defineWord)
        );

        if (wordIndex !== -1) {
          // Update the existing word with the AI response
          savedWords[wordIndex].aiResponse = aiResponse;
          storeWordsInSupabase(savedWords);
        } else {
          // Add a new entry if the word does not exist
          savedWords.push({
            text: preProcessText(defineWord),
            url: sender.tab.url,
            date: new Date().toLocaleString(),
            aiResponse: aiResponse,
          });
          storeWordsInSupabase(savedWords);
        }

        // Save the updated savedWords array back to local storage
        chrome.storage.local.set({ savedWords });
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function updateBadge(url) {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const savedWords = result.savedWords;
    const count = savedWords.filter((word) => word.url === url).length;
    chrome.action.setBadgeText({ text: count.toString() });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveWord") {
    const selectedText = preProcessText(info.selectionText);
    const url = tab.url;
    const date = new Date().toLocaleString();

    chrome.storage.local.get({ savedWords: [] }, (result) => {
      const savedWords = result.savedWords;

      // Check if the selected text already exists
      const exists = savedWords.some(
        (word) => preProcessText(word.text) === selectedText
      );

      if (!exists) {
        savedWords.push({ text: selectedText, url, date });
        chrome.storage.local.set({ savedWords }, () => {
          updateBadge(url);
          updateHighlights(tab);

          //todo: apply selection highlight on the word
        });
      }
    });
  } else if (info.menuItemId === "summarizeText") {
    const selectedText = info.selectionText;
    summarizeText(selectedText, tab.url);
  } else if (info.menuItemId === "summarizePage") {
    chrome.tabs.sendMessage(tab.id, { action: "summarizePage" });
  }
});

// Function to summarize text
function summarizeText(text, url) {
  fetch("https://backend.theassignit.workers.dev/ai", {
    method: "POST",
    body: JSON.stringify({
      user: "user",
      text: text,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const aiResponse = data.choices[0].message.content;
      // Store the AI response in the local storage
      chrome.storage.local.get({ savedWords: [] }, (result) => {
        const savedWords = result.savedWords;

        // Find the word in the savedWords array
        const wordIndex = savedWords.findIndex(
          (word) => word.text === text && word.url === url
        );

        if (wordIndex !== -1) {
          // Update the existing word with the AI response
          savedWords[wordIndex].aiResponse = aiResponse;
        } else {
          // Add a new entry if the word does not exist
          savedWords.push({
            text: text,
            url: url,
            date: new Date().toLocaleString(),
            aiResponse: aiResponse,
          });
        }

        // Save the updated savedWords array back to local storage
        chrome.storage.local.set({ savedWords });
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Update badge when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    updateBadge(tab.url);
    updateHighlights();
  }
});

// Update badge when tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      updateBadge(tab.url);
      updateHighlights();
    }
  });
});

function updateHighlights(tab) {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const savedWords = result.savedWords || [];
    // chrome.tabs.sendMessage(tab.id, {
    //   action: "updateHighlights",
    //   savedWords: savedWords,
    // });

    // Update highlights on all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        try {
          chrome.tabs.sendMessage(
            tab.id,
            {
              action: "updateHighlights",
              savedWords,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                // console.error(
                //   `Error sending message to tab ${tab.id}: ${chrome.runtime.lastError.message}`
                // );
              }
            }
          );
        } catch (error) {
          // console.error(
          //   `Error sending message to tab ${tab.id}: ${error.message}`
          // );
        }
      });
    });
  });
}

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "defineWord") {
    getWordDefination(request.word, sendResponse);
  } else if (request.action === "getUserId") {
    getUserID().then((userId) => sendResponse({ userId }));
  }
  return true; // Keep the message channel open for sendResponse
});
