// Debugging log to confirm script runs
console.log("Interactive cat script loaded");

let idleWalkTimer = null; // Timer for idle walking
let previousXPosition = 20; // Track the last X position of the cat (default to initial position)

// Create the interactive cat container
const catContainer = document.createElement("div");
catContainer.id = "interactive-cat";
catContainer.style.position = "fixed"; // Float above the page
catContainer.style.bottom = "20px"; // Fixed bottom position
catContainer.style.left = "20px"; // Initial position
catContainer.style.width = "50px"; // Default small size
catContainer.style.height = "50px";
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

// Function to update the cat image based on the action
function updateCatImage(cat, state, direction = "") {
  // Construct the image path based on state and direction
  const imagePath = direction
    ? chrome.runtime.getURL(`assets/cat/${cat}/cat-${state}-${direction}.gif`)
    : chrome.runtime.getURL(`assets/cat/${cat}/cat-${state}.gif`);
  catImage.src = imagePath;
  console.log(`Updated cat image to: ${imagePath}`);
}

// Function to randomly move the cat along the bottom of the screen
function moveCatHorizontally() {
  const catWidth = 50; // Small default size
  const viewportWidth = window.innerWidth - catWidth; // Maximum X position

  // Generate random positions along the horizontal axis
  const randomX = Math.max(0, Math.floor(Math.random() * viewportWidth));
  const direction = randomX < previousXPosition ? "left" : "right"; // Determine movement direction

  // Adjust movement speed to look like the cat is walking
  const transitionSpeed = "4s"; // Slow enough to match walking animation
  catContainer.style.transition = `left ${transitionSpeed} linear`;

  // Move the cat horizontally to the new position
  catContainer.style.left = `${randomX}px`; // Set X position

  chrome.storage.sync.get("selectedCat", (data) => {
    const cat = data.selectedCat || "default";
    updateCatImage(cat, "walking", direction); // Show walking gif based on direction
  });

  // Update the previous X position
  previousXPosition = randomX;

  // After moving, make the cat idle again
  setTimeout(() => {
    makeCatIdle(); // Change to idle (sleeping) after the move
  }, parseFloat(transitionSpeed) * 1000); // Delay matches the transition time
}

// Function to make the cat idle
function makeCatIdle() {
  chrome.storage.sync.get("selectedCat", (data) => {
    const cat = data.selectedCat || "default";
    updateCatImage(cat, "sleeping"); // Use sleeping gif when idle
  });
}

// Function to handle state transitions
function handleStateTransition(state) {
  // Clear any existing idle walk timer
  if (idleWalkTimer) {
    clearInterval(idleWalkTimer);
    idleWalkTimer = null;
  }

  if (state === "break") {
    console.log("Switching to break mode");
    catContainer.style.display = "none"; // Hide the cat during break
    breakContainer.style.display = "block"; // Show break message
  } else if (state === "study") {
    console.log("Switching to study mode");
    catContainer.style.display = "block"; // Show the cat
    moveCatHorizontally(); // Start horizontal movement during study
    setInterval(() => moveCatHorizontally(), 8000); // Repeat slower movements every 8 seconds
  } else if (state === "idle") {
    console.log("Switching to idle mode");
    breakContainer.style.display = "none"; // Hide break message
    catContainer.style.display = "block"; // Always show the cat

    // Set an interval to make the cat walk along the bottom every 5 minutes
    idleWalkTimer = setInterval(() => {
      console.log("Idle walk triggered");
      moveCatHorizontally();
    }, 300000); // 300,000ms = 5 minutes
  }
}

// Function to handle random idle and movement behavior
function handleRandomBehavior() {
  const shouldMove = Math.random() > 0.5; // 50% chance to move or be idle
  if (shouldMove) {
    moveCatHorizontally();
  } else {
    makeCatIdle();
  }
}

// Function to move the cat when the cursor touches it
catContainer.addEventListener("mouseover", () => {
  moveCatHorizontally(); // Glide to a new location along the bottom when the cursor touches it
});

// Add click interaction to change to happy gif
catContainer.addEventListener("click", () => {
  chrome.storage.sync.get("selectedCat", (data) => {
    const cat = data.selectedCat || "default";
    updateCatImage(cat, "happy"); // Change to happy gif when clicked
    setTimeout(() => {
      handleRandomBehavior(); // Revert to random behavior after being happy
    }, 1000);
  });
  alert("Meow! You clicked the cat!");
});

// Sync state and selected cat from storage
chrome.storage.onChanged.addListener((changes) => {
  if (changes.currentState) {
    chrome.storage.sync.get(["currentState", "selectedCat"], (data) => {
      const cat = data.selectedCat || "default";
      const state = data.currentState || "idle";
      updateCatImage(cat, state, ""); // Use state to update image
      handleStateTransition(state);
    });
  }

  if (changes.selectedCat) {
    const selectedCat = changes.selectedCat.newValue;
    chrome.storage.sync.get("currentState", (data) => {
      const state = data.currentState || "idle";
      updateCatImage(selectedCat, state, ""); // Use state to update image
    });
  }
});

// Respond to messages from background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "updateTimer") {
    if (message.isStudySession) {
      console.log("Timer Update: Study Mode");
      handleStateTransition("study");
    } else if (message.isStudySession === false) {
      console.log("Timer Update: Break Mode");
      handleStateTransition("break");
    } else {
      console.log("Timer Update: Idle Mode");
      handleStateTransition("idle");
    }
  }
});

// Initialize the cat on page load
chrome.storage.sync.get(["currentState", "selectedCat"], (data) => {
  const state = data.currentState || "idle";
  const cat = data.selectedCat || "default";
  console.log(`Initializing cat: State = ${state}, Cat = ${cat}`);
  updateCatImage(cat, "sleeping"); // Default to sleeping
  handleStateTransition(state);
});

