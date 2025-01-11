// Create the cat container
const catContainer = document.createElement("div");
catContainer.id = "interactive-cat";
catContainer.style.position = "fixed";
catContainer.style.bottom = "10px";
catContainer.style.right = "10px";
catContainer.style.width = "100px";
catContainer.style.height = "100px";
catContainer.style.zIndex = "10000";
catContainer.style.cursor = "pointer";

// Create the cat image
const catImage = document.createElement("img");
catImage.src = chrome.runtime.getURL("assets/cat/default/cat-default.png");
catImage.alt = "Interactive Cat";
catImage.style.width = "100%";
catImage.style.height = "100%";
catContainer.appendChild(catImage);

// Append the cat container to the page
document.body.appendChild(catContainer);

// Add cat interaction
let isWalking = false;

// Toggle walking animation
catContainer.addEventListener("click", () => {
  if (isWalking) {
    isWalking = false;
    catImage.src = chrome.runtime.getURL("assets/cat/default/cat-default.png");
  } else {
    isWalking = true;
    catImage.src = chrome.runtime.getURL("assets/cat/default/cat-walking.gif");
    moveCatRandomly();
  }
});

// Function to move the cat randomly
function moveCatRandomly() {
  if (!isWalking) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const randomX = Math.floor(Math.random() * (viewportWidth - 100)); // Leave room for cat size
  const randomY = Math.floor(Math.random() * (viewportHeight - 100)); // Leave room for cat size

  catContainer.style.transition = "all 1s ease";
  catContainer.style.transform = `translate(${randomX}px, ${randomY}px)`;

  // Continue moving the cat
  setTimeout(() => {
    if (isWalking) moveCatRandomly();
  }, 2000);
}

// React to study and break timers (optional)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.currentState?.newValue === "study") {
    catImage.src = chrome.runtime.getURL("assets/cat/default/cat-sleeping.png");
  } else if (changes.currentState?.newValue === "break") {
    catImage.src = chrome.runtime.getURL("assets/cat/default/cat-playing.png");
  }
});
