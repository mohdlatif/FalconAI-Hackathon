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

$(document).ready(function () {
  console.log($.fn.jquery);
});

// Fetch saved words and highlight them
chrome.storage.local.get({ savedWords: [] }, (result) => {
  const savedWords = result.savedWords || [];
  // console.log(savedWords);
  highlightText(savedWords);
});

// Function to highlight the text
function highlightText(words) {
  words.forEach((word) => {
    word = word.text.toLocaleLowerCase();
    const regex = new RegExp(`(${word})`, "gi");
    $("body").each(function () {
      $(this)
        .find("*")
        .contents()
        .filter(function () {
          return this.nodeType === Node.TEXT_NODE && regex.test(this.nodeValue);
        })
        .each(function () {
          console.log($(this));
          const newHTML = this.nodeValue.replace(
            regex,
            '<span class="falcon-highlight">$1</span>'
          );
          $(this).replaceWith(newHTML);
        });
    });
  });
}
