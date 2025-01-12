import { getStudyGuide } from "./feature/file-parser/aryn.js";

// Timer variables
let studyTime = 0; // Study time in seconds
let breakTime = 0; // Break time in seconds
let currentTimer = 0; // Current countdown value
let isStudySession = true; // Tracks if it's currently a study session
let timerInterval;

// Elements
const studyTimerElement = document.getElementById("study-timer");
const breakTimerElement = document.getElementById("break-timer");
const studyHoursInput = document.getElementById("study-hours");
const studyMinutesInput = document.getElementById("study-minutes");
const breakHoursInput = document.getElementById("break-hours");
const breakMinutesInput = document.getElementById("break-minutes");
const startStudyButton = document.getElementById("start-study");
const stopLoopButton = document.getElementById("stop-loop");
const catSelector = document.getElementById("cat-selector");

// Sounds
const studySound = new Audio("assets/sounds/start-study.mp3");
const breakSound = new Audio("assets/sounds/start-break.mp3");

// Update timer display
function updateTimerDisplay(element, time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  element.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Sync timer state with storage
function syncSessionState(state) {
  chrome.storage.sync.set({ currentState: state });
}

// Show notifications
function showNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message, icon: "assets/icons/cat-icon.png" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

// Start the timer loop
function startTimerLoop() {
  // Determine initial session
  currentTimer = isStudySession ? studyTime : breakTime;
  syncSessionState(isStudySession ? "study" : "break");

  // Play appropriate sound and notification
  if (isStudySession) {
    studySound.play();
    showNotification("Study Time", "Focus on your work!");
  } else {
    breakSound.play();
    showNotification("Break Time", "Take a well-deserved break!");
  }

  // Start countdown
  timerInterval = setInterval(() => {
    if (currentTimer > 0) {
      currentTimer--;
      if (isStudySession) {
        updateTimerDisplay(studyTimerElement, currentTimer);
      } else {
        updateTimerDisplay(breakTimerElement, currentTimer);
      }
    } else {
      clearInterval(timerInterval); // Stop the current session
      isStudySession = !isStudySession; // Switch session
      startTimerLoop(); // Start the next session
    }
  }, 1000);
}

// Stop the timer loop
function stopTimerLoop() {
  clearInterval(timerInterval);
  syncSessionState("idle");
  currentTimer = 0;
  updateTimerDisplay(studyTimerElement, studyTime);
  updateTimerDisplay(breakTimerElement, breakTime);
}

// Update study time from input
function updateStudyTime() {
  const hours = parseInt(studyHoursInput.value) || 0;
  const minutes = parseInt(studyMinutesInput.value) || 0;
  studyTime = hours * 3600 + minutes * 60;
  updateTimerDisplay(studyTimerElement, studyTime);
}

// Update break time from input
function updateBreakTime() {
  const hours = parseInt(breakHoursInput.value) || 0;
  const minutes = parseInt(breakMinutesInput.value) || 0;
  breakTime = hours * 3600 + minutes * 60;
  updateTimerDisplay(breakTimerElement, breakTime);
}

function generateStudyGuide() {
  console.log("Generate Study Guide Button Clicked");
  getStudyGuide();
}

// Save selected cat
catSelector.addEventListener("change", (event) => {
  const selectedCat = event.target.value;
  chrome.storage.sync.set({ selectedCat });
});

// Event listeners
studyHoursInput.addEventListener("input", updateStudyTime);
studyMinutesInput.addEventListener("input", updateStudyTime);
breakHoursInput.addEventListener("input", updateBreakTime);
breakMinutesInput.addEventListener("input", updateBreakTime);
generateStudyGuideInput.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  console.log(tab.url);
  if (tab.url.includes("https://www.gradescope.com/courses/*")) {
    generateStudyGuide();
  }
});

startStudyButton.addEventListener("click", () => {
  isStudySession = true; // Always start with a study session
  startTimerLoop();
});

stopLoopButton.addEventListener("click", stopTimerLoop);

// Request notification permission on load
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}
