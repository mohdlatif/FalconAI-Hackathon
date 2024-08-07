document.addEventListener("DOMContentLoaded", () => {
  loadSavedWords();
});

function loadSavedWords() {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const wordsContainer = document.getElementById("wordsContainer");
    wordsContainer.innerHTML = ""; // Clear previous content

    const table = document.createElement("table");
    const headerRow = document.createElement("tr");

    const headers = ["Word", "Date", "Definition"];
    headers.forEach((headerText) => {
      const header = document.createElement("th");
      header.textContent = headerText;
      headerRow.appendChild(header);
    });

    table.appendChild(headerRow);

    result.savedWords.forEach((word, index) => {
      const row = document.createElement("tr");

      const wordCell = document.createElement("td");
      const wordLink = document.createElement("a");
      wordLink.href = word.url;
      wordLink.textContent = word.text;
      wordLink.target = "_blank";
      wordCell.appendChild(wordLink);
      row.appendChild(wordCell);

      const dateCell = document.createElement("td");
      dateCell.textContent = word.date;
      row.appendChild(dateCell);

      const definitionCell = document.createElement("td");
      definitionCell.textContent = word.aiResponse;
      row.appendChild(definitionCell);

      const deleteCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteWord(index));
      deleteCell.appendChild(deleteButton);
      row.appendChild(deleteCell);

      table.appendChild(row);
    });
    wordsContainer.appendChild(table);
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
