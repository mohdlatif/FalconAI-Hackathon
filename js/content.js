document.addEventListener("mouseover", () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText) {
    chrome.runtime.sendMessage({ action: "textSelected", text: selectedText });
  }
});

// Function to send a message to the background script
function getUserId() {
  chrome.runtime.sendMessage({ action: "getUserId" }, function (response) {
    console.log("User ID:", response.userId);
  });
}

// getUserId();

// Add CSS for highlighting
const AppendStyle = document.createElement("style");
AppendStyle.innerHTML = `
  .falcon-highlight {
    text-decoration: wavy underline;
    text-decoration-skip-ink: none;
    text-decoration-color: #ff5e0e;
    height: 1.5em;
  }
`;
document.head.appendChild(AppendStyle);

// Fetch saved words and highlight them
chrome.storage.local.get({ savedWords: [] }, (result) => {
  const savedWords = result.savedWords || [];
  // console.log(savedWords);
  highlightText(savedWords);
});

// Function to highlight the text
function highlightText(words) {
  var instance = new Mark(document.querySelector("body"));
  const wordArray = words.map((word) => word.text.toLocaleLowerCase());
  // console.log(wordArray);
  instance.mark(wordArray, {
    wildcards: "withSpaces",
    element: "bv",
    accuracy: "exactly",
    separateWordSearch: false,
    className: "falcon-highlight",
  });
}
