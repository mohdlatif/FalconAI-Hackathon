document.onmousemove = onMove;
const modalWidth = 400;
let modal = undefined;
let modalDescription = undefined;
let mHeight = undefined;
let mWidth = undefined;
let isHovering = false;
let isLocked = false;

const modalHtml = `<div id="modal-window">
        <div id="modal-container">
            <p id="modal-description"></p>
            <button id="modal-close-button">X</button>
        </div>
    </div>`;

function injectHTML() {
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  modal = document.getElementById("modal-container");
  modalDescription = document.getElementById("modal-description");
  let items = document.getElementsByClassName("falcon-highlight");
  // console.log(items);

  [...items].forEach((element) => {
    element.onmouseover = mouseOver;
    element.onmouseout = mouseOut;
  });
  modal.addEventListener("animationend", onAnimationEnd);
  modal.addEventListener("webkitAnimationEnd", onAnimationEnd);

  modal.style.maxWidth = `${modalWidth}px`;

  const modalCloseButton = document.getElementById("modal-close-button");
  modalCloseButton.addEventListener("click", () => {
    modal.style.height = `${mHeight}px`;
    modal.classList.add("modal-animation");
    modal.style.pointerEvents = "none";
    isLocked = false;
  });
}

function onAnimationEnd(event) {
  isHovering = false;
}

function mouseOver(event) {
  const waitingMessage = "Please wait while we fetch the definition...";
  let definition = event.target.getAttribute("data-falcon-ai-definition");
  let define;
  if (definition == null || definition === waitingMessage) {
    modalDescription.innerHTML = waitingMessage;
    if (definition !== waitingMessage) {
      event.target.setAttribute("data-falcon-ai-definition", waitingMessage);
      define = defineWord(event.target.textContent, event);
    }
  } else {
    modalDescription.innerHTML = definition;
  }

  modal.style.height = "auto";
  isHovering = true;
  modal.classList.remove("modal-animation");
  mHeight = parseFloat(getComputedStyle(modal).height);
  mWidth = parseFloat(getComputedStyle(modal).width);
}

function mouseOut(event) {
  const w = modal.style.width;
  modal.style.width = `${w}px`;
  modal.style.height = `${mHeight}px`;

  setTimeout(() => {
    if (!isLocked) modal.classList.add("modal-animation");
  }, 300);
}

function onMove(event) {
  if (!isHovering || isLocked) return;
  let x = event.clientX;
  let y = event.clientY;
  modal.style.transform = `translate(${
    x + mWidth < document.documentElement.clientWidth ? x : x - mWidth
  }px, ${
    y + mHeight < document.documentElement.clientHeight ? y : y - mHeight
  }px)`;

  modal.style.visibility = "visible";
}

document.onmousedown = function (event) {
  if (
    event.button === 0 &&
    event.target.hasAttribute("data-falcon-ai-definition")
  ) {
    isLocked = !isLocked;
    if (isLocked) {
      modal.style.pointerEvents = "auto";
    } else {
      modal.style.pointerEvents = "none";
    }
  }
};
/* Big thanks to the author of hover-popup, the script was tweaked a bit to serve my code */
// https://github.com/FireBanana/hover-popup/

async function defineWord(word, event) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "defineWord", word: word },
      console.log("starting to fetch definition for" + word),
      (response) => {
        if (response) {
          resolve(response);
          // console.log(response);
          // console.log(event);
          event.target.setAttribute("data-falcon-ai-definition", response.data);
        } else {
          reject("Definition not found");
          console.log("error fetching definition");
        }
      }
    );
  });
}
