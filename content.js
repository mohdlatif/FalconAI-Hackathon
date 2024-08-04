document.addEventListener("mouseup", () => {
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

// Call the function when needed
getUserId();

// Add CSS for highlighting
const style = document.createElement("style");
style.innerHTML = `
  .highlight {
    text-decoration: green wavy underline;
    text-decoration-skip-ink: none;
    height: 1.5em;
  }
`;
document.head.appendChild(style);

// Function to highlight words
function highlightWords(words) {
  const bodyText = document.body.innerHTML;
  words.forEach((word) => {
    const regex = new RegExp(`(${word.text})`, "gi");
    document.body.innerHTML = bodyText.replace(
      regex,
      '<span class="highlight">$1</span>'
    );
  });
}

// Fetch saved words and highlight them
chrome.storage.local.get({ savedWords: [] }, (result) => {
  const savedWords = result.savedWords || [];
  highlightWords(savedWords);
});
