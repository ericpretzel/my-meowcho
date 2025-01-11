// Create the interactive cat container
const catContainer = document.createElement("div");
catContainer.id = "interactive-cat";
catContainer.style.position = "fixed";
catContainer.style.bottom = "20px";
catContainer.style.right = "20px";
catContainer.style.width = "80px";
catContainer.style.height = "80px";
catContainer.style.zIndex = "10000";
catContainer.style.cursor = "pointer";

// Create the cat image
const catImage = document.createElement("img");
catImage.alt = "Interactive Cat";
catImage.style.width = "100%";
catImage.style.height = "100%";
catImage.src = chrome.runtime.getURL("assets/cat/default/cat-default.png");
catContainer.appendChild(catImage);
document.body.appendChild(catContainer);

// State for cat behavior
let isWalking = false;

// Function to randomly move the cat
function moveCatRandomly() {
  const viewportWidth = window.innerWidth - 100;
  const viewportHeight = window.innerHeight - 100;

  const randomX = Math.floor(Math.random() * viewportWidth);
  const randomY = Math.floor(Math.random() * viewportHeight);

  catContainer.style.transition = "all 2s ease-in-out";
  catContainer.style.transform = `translate(${randomX}px, ${randomY}px)`;

  if (isWalking) {
    setTimeout(moveCatRandomly, 3000); // Continue moving if walking
  }
}

// Toggle walking animation
catContainer.addEventListener("click", () => {
  isWalking = !isWalking;
  catImage.src = chrome.runtime.getURL(
    `assets/cat/default/cat-${isWalking ? "walking" : "default"}.gif`
  );
  if (isWalking) {
    moveCatRandomly();
  }
});

// Update the cat's behavior based on timer states
chrome.storage.onChanged.addListener((changes) => {
  if (changes.currentState) {
    const state = changes.currentState.newValue;
    if (state === "study") {
      catImage.src = chrome.runtime.getURL("assets/cat/default/cat-sleeping.gif");
      isWalking = false;
    } else if (state === "break") {
      catImage.src = chrome.runtime.getURL("assets/cat/default/cat-playing.gif");
      isWalking = true;
      moveCatRandomly();
    }
  }

  if (changes.selectedCat) {
    const newCat = changes.selectedCat.newValue;
    catImage.src = chrome.runtime.getURL(`assets/cat/${newCat}/cat-default.png`);
  }
});

// Load the initial state and cat selection
chrome.storage.sync.get(["selectedCat", "currentState"], (data) => {
  const currentCat = data.selectedCat || "default";
  const currentState = data.currentState || "default";
  catImage.src = chrome.runtime.getURL(`assets/cat/${currentCat}/cat-${currentState}.png`);
});
