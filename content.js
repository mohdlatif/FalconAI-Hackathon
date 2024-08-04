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
