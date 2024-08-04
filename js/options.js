document.addEventListener("DOMContentLoaded", () => {
  loadSavedWords();
});

function loadSavedWords() {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const wordsContainer = document.getElementById("wordsContainer");
    wordsContainer.innerHTML = ""; // Clear previous content

    result.savedWords.forEach((word, index) => {
      const wordElement = document.createElement("div");
      wordElement.textContent = `${word.date} - ${word.url} - ${word.text}`;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteWord(index));

      wordElement.appendChild(deleteButton);
      wordsContainer.appendChild(wordElement);
    });
  });
}

function deleteWord(index) {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const savedWords = result.savedWords;
    savedWords.splice(index, 1); // Remove the word at the specified index

    chrome.storage.local.set({ savedWords }, () => {
      loadSavedWords(); // Reload the words to update the UI
      updateBadge(); // Update the badge count
    });
  });
}

function updateBadge() {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const count = result.savedWords.length;
    chrome.action.setBadgeText({ text: count.toString() });
  });
}
