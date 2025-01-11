let studyTime = 25 * 60; // Default: 25 minutes in seconds
let breakTime = 5 * 60; // Default: 5 minutes in seconds
let timerInterval;
let isStudySession = true; // Tracks if the current session is study or break
let points = 0;
let currentCat = 'default';

// Elements
const studyTimerElement = document.getElementById("study-timer");
const breakTimerElement = document.getElementById("break-timer");
const pointsElement = document.getElementById("points");
const catImage = document.getElementById("cat-image");
const catSelector = document.getElementById("cat-selector");
const studyTimeInput = document.getElementById("study-time-input");
const breakTimeInput = document.getElementById("break-time-input");

// Update timer display
function updateTimerDisplay(element, time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  element.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Update cat image dynamically
function updateCatImage(state) {
  catImage.src = `assets/cat/${currentCat}/cat-${state}.png`;
}

// Load previously selected cat from storage
chrome.storage.sync.get(['selectedCat'], (data) => {
  currentCat = data.selectedCat || 'default';
  catSelector.value = currentCat;
  updateCatImage('default');
});

// Save selected cat
catSelector.addEventListener("change", (event) => {
  currentCat = event.target.value;
  chrome.storage.sync.set({ selectedCat: currentCat });
  updateCatImage('default');
});

// Start the timer loop (study -> break -> study)
function startTimerLoop() {
  let currentTimer = isStudySession ? studyTime : breakTime;

  timerInterval = setInterval(() => {
    if (currentTimer > 0) {
      currentTimer--;
      if (isStudySession) {
        updateTimerDisplay(studyTimerElement, currentTimer);
      } else {
        updateTimerDisplay(breakTimerElement, currentTimer);
      }
    } else {
      // Timer ends, switch session
      clearInterval(timerInterval);
      if (isStudySession) {
        points += 5; // Earn points for completing a study session
        pointsElement.textContent = points;
        alert("Study session complete! Starting break.");
        updateCatImage("happy");
      } else {
        alert("Break is over! Starting study session.");
        updateCatImage("sleeping");
      }
      // Toggle session
      isStudySession = !isStudySession;
      startTimerLoop(); // Start the next session automatically
    }
  }, 1000);
}

// Stop the timer loop
function stopTimerLoop() {
  clearInterval(timerInterval);
  updateCatImage("default");
}

// Adjust study and break times
studyTimeInput.addEventListener("change", () => {
  studyTime = parseInt(studyTimeInput.value) * 60;
  updateTimerDisplay(studyTimerElement, studyTime);
});

breakTimeInput.addEventListener("change", () => {
  breakTime = parseInt(breakTimeInput.value) * 60;
  updateTimerDisplay(breakTimerElement, breakTime);
});

// Start and stop loop buttons
document.getElementById("start-loop").addEventListener("click", () => {
  isStudySession = true; // Always start with a study session
  updateCatImage("sleeping");
  startTimerLoop();
});

document.getElementById("stop-loop").addEventListener("click", () => {
  stopTimerLoop();
});

// Sync the current session state with chrome storage
function syncSessionState(state) {
  chrome.storage.sync.set({ currentState: state });
}

// Update study and break functions to sync state
document.getElementById("start-loop").addEventListener("click", () => {
  isStudySession = true;
  syncSessionState("study");
  startTimerLoop();
});

function startTimerLoop() {
  let currentTimer = isStudySession ? studyTime : breakTime;

  timerInterval = setInterval(() => {
    if (currentTimer > 0) {
      currentTimer--;
      if (isStudySession) {
        updateTimerDisplay(studyTimerElement, currentTimer);
      } else {
        updateTimerDisplay(breakTimerElement, currentTimer);
      }
    } else {
      clearInterval(timerInterval);
      isStudySession = !isStudySession;
      syncSessionState(isStudySession ? "study" : "break");
      startTimerLoop();
    }
  }, 1000);
}
