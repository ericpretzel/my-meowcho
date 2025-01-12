// Timer variables
let studyTime = 0;
let breakTime = 0;
let currentTimer = 0;
let isStudySession = true; // Tracks if it's currently a study session
let timerInterval = null;

// Sync the timer state with storage and notify other scripts
function syncState() {
  chrome.storage.local.set({
    currentTimer,
    isStudySession,
    isStudyMode: currentTimer > 0, // Determine if study mode is active
  });
  chrome.runtime.sendMessage({
    type: "updateTimer",
    currentTimer,
    isStudySession,
  });
}

// Start the timer with study and break durations
function startTimer(studyDuration, breakDuration) {
  clearInterval(timerInterval); // Clear any previous timers

  studyTime = studyDuration;
  breakTime = breakDuration;
  currentTimer = isStudySession ? studyTime : breakTime;
  syncState();

  timerInterval = setInterval(() => {
    if (currentTimer > 0) {
      currentTimer--; // Decrease the timer
    } else {
      // Switch between study and break automatically
      isStudySession = !isStudySession;
      currentTimer = isStudySession ? studyTime : breakTime;
      syncState();

      // Optional: Send notifications for transitions
      const title = isStudySession ? "Study Time" : "Break Time";
      const message = isStudySession
        ? "Focus! A new study session has started."
        : "Relax! It's time for a break.";
      showNotification(title, message);
    }
    syncState();
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  currentTimer = 0;
  isStudySession = true; // Reset to default state
  syncState();
}

// Show notifications (optional)
function showNotification(title, message) {
  chrome.storage.local.get("selectedCat", (data) => {
    const selectedCat = data.selectedCat || "default";
    const iconUrl = `assets/cat/${selectedCat}/cat-default.png`;
    if (Notification.permission === "granted") {
      new Notification(title, { body: message, icon: iconUrl });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  });
}

// Listen for messages from popup.js and content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startTimer") {
    startTimer(message.studyTime, message.breakTime);
  } else if (message.type === "stopTimer") {
    stopTimer();
  } else if (message.type === "getState") {
    sendResponse({
      currentTimer,
      isStudySession,
      isStudyMode: currentTimer > 0,
    });
  }
});

// Initialize: Restore timer state when the extension is loaded
chrome.storage.local.get(["currentTimer", "isStudySession"], (data) => {
  currentTimer = data.currentTimer || 0;
  isStudySession = data.isStudySession !== undefined ? data.isStudySession : true;
  if (currentTimer > 0) {
    startTimer(data.studyTime || 0, data.breakTime || 0); // Restart timer if it was running
  }
});
