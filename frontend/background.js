// Timer variables
let studyTime = 1800; // Default study time: 30 minutes
let breakTime = 300; // Default break time: 5 minutes
let currentTimer = 0;
let timerInterval = null;
let isStudySession = true;

// Start the timer
function startTimer(studyDuration, breakDuration) {
  if (timerInterval) clearInterval(timerInterval);

  studyTime = studyDuration;
  breakTime = breakDuration;
  currentTimer = isStudySession ? studyTime : breakTime;
  syncState(isStudySession ? "study" : "break");

  timerInterval = setInterval(() => {
    if (currentTimer > 0) {
      currentTimer--;
    } else {
      isStudySession = !isStudySession;
      currentTimer = isStudySession ? studyTime : breakTime;
      syncState(isStudySession ? "study" : "break");
    }

    // Broadcast timer state to all scripts
    chrome.runtime.sendMessage({ type: "updateTimer", currentTimer, isStudySession });
    chrome.storage.local.set({ currentTimer, isStudySession });
  }, 1000);
}

// Stop the timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  syncState("idle");
  chrome.storage.local.set({ currentTimer: 0, isStudySession: true });
}

// Sync the state with the cat and popup
function syncState(state) {
  chrome.storage.local.set({ currentState: state });
}

// Listen for messages from popup.js or content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startTimer") startTimer(message.studyTime, message.breakTime);
  else if (message.type === "stopTimer") stopTimer();
  else if (message.type === "getState") sendResponse({ currentTimer, isStudySession });
});
