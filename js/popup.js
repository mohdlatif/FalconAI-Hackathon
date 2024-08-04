document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    chrome.storage.local.get({ savedWords: [] }, (result) => {
      const wordList = document.getElementById("wordList");
      result.savedWords.forEach((word) => {
        if (word.url === url) {
          const li = document.createElement("li");
          li.textContent = `${word.text}`;
          wordList.appendChild(li);
        }
      });
    });
  });
});
