let studyTime = 0; // Study time in seconds
let breakTime = 0; // Break time in seconds
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
const studyHoursInput = document.getElementById("study-hours");
const studyMinutesInput = document.getElementById("study-minutes");
const breakHoursInput = document.getElementById("break-hours");
const breakMinutesInput = document.getElementById("break-minutes");
const startStudyButton = document.getElementById("start-study");
const stopLoopButton = document.getElementById("stop-loop");

// Update timer display
function updateTimerDisplay(element, time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  element.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Sync the current session state with chrome storage
function syncSessionState(state) {
  chrome.storage.sync.set({ currentState: state });
}

// Save selected cat
catSelector.addEventListener("change", (event) => {
  currentCat = event.target.value;
  chrome.storage.sync.set({ selectedCat: currentCat }); // Save the selected cat to storage
  updateCatImage("default");
});

// Update cat image in popup
function updateCatImage(state) {
  catImage.src = `assets/cat/${currentCat}/cat-${state}.png`;
}

// Load previously selected cat
chrome.storage.sync.get(['selectedCat'], (data) => {
  currentCat = data.selectedCat || 'default';
  catSelector.value = currentCat;
  updateCatImage("default");
});

// Start the timer loop
function startTimerLoop() {
  syncSessionState(isStudySession ? "study" : "break");
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
      if (isStudySession) {
        points += 5; // Earn points for completing a study session
        pointsElement.textContent = points;
        alert("Study session complete! Starting break.");
        updateCatImage("happy");
      } else {
        alert("Break is over! Starting study session.");
        updateCatImage("sleeping");
      }
      isStudySession = !isStudySession; // Toggle session
      startTimerLoop(); // Automatically start the next session
    }
  }, 1000);
}

// Stop the timer loop
function stopTimerLoop() {
  clearInterval(timerInterval);
  syncSessionState("idle");
  updateCatImage("default");
}

// Update study time
function updateStudyTime() {
  const hours = parseInt(studyHoursInput.value) || 0;
  const minutes = parseInt(studyMinutesInput.value) || 0;
  studyTime = hours * 3600 + minutes * 60;
  updateTimerDisplay(studyTimerElement, studyTime);
}

// Update break time
function updateBreakTime() {
  const hours = parseInt(breakHoursInput.value) || 0;
  const minutes = parseInt(breakMinutesInput.value) || 0;
  breakTime = hours * 3600 + minutes * 60;
  updateTimerDisplay(breakTimerElement, breakTime);
}

// Event listeners
studyHoursInput.addEventListener("input", updateStudyTime);
studyMinutesInput.addEventListener("input", updateStudyTime);
breakHoursInput.addEventListener("input", updateBreakTime);
breakMinutesInput.addEventListener("input", updateBreakTime);
startStudyButton.addEventListener("click", () => {
  isStudySession = true; // Always start with study
  startTimerLoop();
});
stopLoopButton.addEventListener("click", stopTimerLoop);
