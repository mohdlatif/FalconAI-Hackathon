// Send a message to the background script
function getUserId() {
  chrome.runtime.sendMessage({ action: "getUserId" }, function (response) {
    console.log("User ID:", response.userId);
  });
}

// getUserId();

window.onload = function () {
  // Fetch saved words and highlight them
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const savedWords = result.savedWords || [];
    highlightText(savedWords);
  });

  // Function to highlight the text
  function highlightText(words) {
    var instance = new Mark(document.querySelector("body"));
    words.forEach((word) => {
      var regExp = new RegExp(
        `\\b(${word.text.toLocaleLowerCase()})\\.\?\\b`,
        "gmi"
      );
      instance.markRegExp(regExp, {
        element: "span",
        className: "falcon-highlight",
        acrossElements: false,
        separateWordSearch: false,
        each: (element) => {
          if (word.aiResponse) {
            // Check if AI response exists
            element.setAttribute("data-falcon-ai-definition", word.aiResponse);
          }
        },
      });
    });
    //wordlearn.js
    injectHTML();
  }
};
