// Debugging log to confirm script runs
console.log("Interactive cat-in-tab script loaded");

let isMoving = false; // Tracks if the cat is currently moving
let previousX = 0; // Tracks the previous X position for determining direction
let idleTimeout; // Tracks timeout for idle drifting
let isStudyMode = false; // Tracks if the study timer is active
const IDLE_TIME_LIMIT = 5 * 60 * 1000; // 5 minutes in milliseconds

// Create the interactive cat container
const catContainer = document.createElement("div");
catContainer.id = "interactive-cat";
catContainer.style.position = "fixed"; // Float above the page
catContainer.style.left = "20px"; // Initial left position
catContainer.style.bottom = "20px"; // Start at the bottom
catContainer.style.width = "80px"; // Set the size of the cat
catContainer.style.height = "80px";
catContainer.style.zIndex = "10000"; // Float above everything
catContainer.style.cursor = "pointer"; // Pointer cursor for interactivity
catContainer.style.pointerEvents = "auto"; // Allow interactions

// Create the cat image element
const catImage = document.createElement("img");
catImage.alt = "Interactive Cat";
catImage.style.width = "100%";
catImage.style.height = "100%";
catImage.src = chrome.runtime.getURL("assets/cat/default/cat-default.png");
catContainer.appendChild(catImage);

// Append the cat container to the body
document.body.appendChild(catContainer);
console.log("Interactive cat container added to the DOM");

// Function to update the cat image based on the selected state and direction
function updateCatImage(selectedCat, state, direction = "") {
  const imagePath = direction
    ? chrome.runtime.getURL(`assets/cat/${selectedCat}/cat-${state}-${direction}.gif`)
    : chrome.runtime.getURL(`assets/cat/${selectedCat}/cat-${state}.gif`);
  catImage.src = imagePath;
  console.log(`Updated cat image to: ${imagePath}`);
}

// Function to ensure the cat stays within the viewport bounds
function clampPosition(x) {
  const viewportWidth = window.innerWidth - 80; // Account for cat size
  return Math.min(Math.max(x, 0), viewportWidth);
}

// Function to make the cat hover at the bottom during study mode
function enforceBottomHover(selectedCat) {
  if (!isStudyMode) return; // Only enforce bottom hover during study mode

  const viewportWidth = window.innerWidth - 80; // Account for cat size
  let randomX = Math.floor(Math.random() * viewportWidth);
  randomX = clampPosition(randomX); // Clamp X position

  const direction = randomX < previousX ? "left" : "right"; // Determine movement direction
  previousX = randomX; // Update previous X position

  isMoving = true; // Mark the cat as moving
  catContainer.style.transition = "left 2s ease-in-out"; // Smooth horizontal movement
  catContainer.style.left = `${randomX}px`;
  catContainer.style.bottom = "20px"; // Lock to the bottom

  // Update the cat's walking GIF during movement
  updateCatImage(selectedCat, "walking", direction);

  // After the movement is complete, show idle animation
  setTimeout(() => {
    isMoving = false;
    const randomState = Math.random() < 0.5 ? "idle" : "sleeping"; // Randomly pick idle or sleeping
    updateCatImage(selectedCat, randomState);
    console.log(`Cat hovered at the bottom and is now ${randomState}.`);
  }, 2000); // Match the transition duration
}

// Function to make the cat drift randomly within the tab
function driftCatRandomly(selectedCat) {
  if (isStudyMode) return; // Prevent drifting during study mode

  const viewportWidth = window.innerWidth - 80; // Account for cat size
  const viewportHeight = window.innerHeight - 80;

  let randomX = Math.floor(Math.random() * viewportWidth);
  let randomY = Math.floor(Math.random() * viewportHeight);

  // Clamp the position to ensure the cat stays on the screen
  randomX = clampPosition(randomX);
  randomY = Math.min(Math.max(randomY, 0), viewportHeight);

  const direction = randomX < previousX ? "left" : "right"; // Determine movement direction
  previousX = randomX; // Update previous X position

  isMoving = true; // Mark the cat as moving
  catContainer.style.transition = "left 2s ease-in-out, top 2s ease-in-out"; // Smooth, slow movement
  catContainer.style.left = `${randomX}px`;
  catContainer.style.top = `${randomY}px`;

  // Update the cat's walking GIF during movement
  updateCatImage(selectedCat, "walking", direction);

  // After the movement is complete, randomly show idle or sleeping animation
  setTimeout(() => {
    isMoving = false;
    const randomState = Math.random() < 0.5 ? "idle" : "sleeping"; // Randomly pick idle or sleeping
    updateCatImage(selectedCat, randomState);
    console.log(`Cat drifted and is now ${randomState}.`);
    resetIdleTimer(selectedCat); // Restart the idle timer
  }, 2000); // Match the transition duration
}

// Function to reset the idle timer
function resetIdleTimer(selectedCat) {
  clearTimeout(idleTimeout); // Clear the existing timeout
  idleTimeout = setTimeout(() => {
    driftCatRandomly(selectedCat); // Trigger a random drift after timeout
  }, IDLE_TIME_LIMIT);
  console.log("Idle timer reset.");
}

// Add hover and click interactions
catContainer.addEventListener("mouseover", () => {
  chrome.storage.local.get("selectedCat", (data) => {
    const selectedCat = data.selectedCat || "default";
    if (isStudyMode) {
      enforceBottomHover(selectedCat); // Hover at the bottom during study mode
    } else {
      driftCatRandomly(selectedCat); // Roam freely when not in study mode
    }
  });
});

catContainer.addEventListener("mouseout", () => {
  chrome.storage.local.get(["selectedCat", "currentState"], (data) => {
    const selectedCat = data.selectedCat || "default";
    const state = data.currentState || "idle";
    if (!isMoving) {
      const randomState = Math.random() < 0.5 ? "idle" : "sleeping"; // Randomly pick idle or sleeping
      updateCatImage(selectedCat, randomState);
      console.log(`Cat is now ${randomState}.`);
      resetIdleTimer(selectedCat); // Restart the idle timer
    }
  });
});

catContainer.addEventListener("click", () => {
  chrome.storage.local.get("selectedCat", (data) => {
    const selectedCat = data.selectedCat || "default";
    alert("Meow! You clicked the cat!");
    resetIdleTimer(selectedCat); // Restart the idle timer on click
  });
});

// Sync state and selected cat from storage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateTimer") {
    isStudyMode = message.currentTimer > 0; // Update study mode status based on the timer
    console.log(`Study mode updated: ${isStudyMode}`);

    // Start or stop hover behavior based on study mode
    const selectedCat = message.selectedCat || "default";
    if (isStudyMode) enforceBottomHover(selectedCat);
    else resetIdleTimer(selectedCat);
  }
});

// Immediately request state from background.js on page load
chrome.runtime.sendMessage({ type: "getState" }, (response) => {
  isStudyMode = response.isStudyMode;
  const selectedCat = response.selectedCat || "default";

  console.log(`Initializing cat: Study mode = ${isStudyMode}`);
  if (isStudyMode) enforceBottomHover(selectedCat); // Immediately enforce bottom hover on load
  else resetIdleTimer(selectedCat);
});

