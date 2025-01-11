// Debugging log to confirm script runs
console.log("Interactive cat script loaded");

// Create the interactive cat container
const catContainer = document.createElement("div");
catContainer.id = "interactive-cat";
catContainer.style.position = "fixed"; // Float above the page
catContainer.style.bottom = "20px"; // 20px from the bottom of the screen
catContainer.style.right = "20px"; // 20px from the right of the screen
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
catImage.src = ""; // Default image will be set dynamically
catContainer.appendChild(catImage);

// Append the cat container to the body
document.body.appendChild(catContainer);
console.log("Interactive cat container added to the DOM");

// Function to update the cat image based on the selected state and cat
function updateCatImage(cat, state) {
  const imagePath = chrome.runtime.getURL(`assets/cat/${cat}/cat-${state}.gif`);
  catImage.src = imagePath;
  console.log(`Updated cat image to: ${imagePath}`);
}

// Function to make the cat move randomly during breaks
function moveCatRandomly() {
  const viewportWidth = window.innerWidth - 100; // Account for cat size
  const viewportHeight = window.innerHeight - 100;

  const randomX = Math.floor(Math.random() * viewportWidth);
  const randomY = Math.floor(Math.random() * viewportHeight);

  catContainer.style.transition = "transform 2s ease-in-out"; // Smooth movement
  catContainer.style.transform = `translate(${randomX}px, ${randomY}px)`; // Random position
}

// Add hover and click interactions
catContainer.addEventListener("mouseover", () => {
  chrome.storage.sync.get("selectedCat", (data) => {
    const cat = data.selectedCat || "default";
    updateCatImage(cat, "playing"); // Switch to playing animation
  });
});

catContainer.addEventListener("mouseout", () => {
  chrome.storage.sync.get(["selectedCat", "currentState"], (data) => {
    const cat = data.selectedCat || "default";
    const state = data.currentState || "idle";
    updateCatImage(cat, state); // Revert to the current state animation
  });
});

catContainer.addEventListener("click", () => {
  alert("Meow! You clicked the cat!");
});

// Sync state and selected cat from storage
chrome.storage.onChanged.addListener((changes) => {
  if (changes.currentState) {
    chrome.storage.sync.get(["currentState", "selectedCat"], (data) => {
      const cat = data.selectedCat || "default";
      const state = data.currentState || "idle";
      updateCatImage(cat, state);

      if (state === "break") {
        moveCatRandomly();
      }
    });
  }

  if (changes.selectedCat) {
    const selectedCat = changes.selectedCat.newValue;
    chrome.storage.sync.get("currentState", (data) => {
      const state = data.currentState || "idle";
      updateCatImage(selectedCat, state);
    });
  }
});

// Initialize the cat on page load
chrome.storage.sync.get(["currentState", "selectedCat"], (data) => {
  const state = data.currentState || "idle";
  const cat = data.selectedCat || "default";
  console.log(`Initializing cat: State = ${state}, Cat = ${cat}`);
  updateCatImage(cat, state);
});
