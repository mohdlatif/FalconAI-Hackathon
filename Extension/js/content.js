window.onload = function () {
  // Fetch saved words and highlight them
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const savedWords = result.savedWords || [];
    highlightText(savedWords);
  });

  // Listen for updates to saved words
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateHighlights") {
      // console.log("Received updateHighlights message");
      // sendResponse("Done updating highlights");
      highlightText(request.savedWords);
    }
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
