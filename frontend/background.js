let studyTime = 0;
let breakTime = 0;
let currentTimer = 0;
let isStudySession = true;
let timerInterval = null;

const INITIAL_HUNGER = 100;
let hunger = INITIAL_HUNGER;

// Sync the timer state with storage and notify other scripts
function syncState() {
  chrome.storage.local.set({
    currentTimer,
    isStudySession,
    isStudyMode: currentTimer > 0,
  });

  chrome.runtime.sendMessage({
    type: "updateTimer",
    currentTimer,
    isStudySession,
  });
}

// Start the timer with study and break durations
function startTimer(studyDuration, breakDuration) {
  if (studyDuration <= 0 || breakDuration <= 0) {
    console.error("Invalid study or break duration. Timer not started.");
    return;
  }

  clearInterval(timerInterval); // Clear any previous timers

  studyTime = studyDuration;
  breakTime = breakDuration;
  currentTimer = isStudySession ? studyTime : breakTime;
  syncState();

  timerInterval = setInterval(() => {
    if (currentTimer > 0) {
      currentTimer--;
    } else {
      // Switch between study and break automatically
      isStudySession = !isStudySession;
      currentTimer = isStudySession ? studyTime : breakTime;
      syncState();

      // Show notifications for transitions
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
  isStudySession = true;
  syncState();
}

// Show notifications
function showNotification(title, message) {
  chrome.storage.local.get("selectedCat", (data) => {
    const selectedCat = data.selectedCat || "default";
    const iconUrl = `assets/cat/${selectedCat}/cat-default.png`;
    if (Notification.permission === "granted") {
      new Notification(title, { body: message, icon: iconUrl });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showNotification(title, message); // Retry notification
        }
      });
    }
  });
}

// Consolidated message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startTimer") {
    startTimer(message.studyTime, message.breakTime);
    sendResponse({ success: true });
  } else if (message.type === "stopTimer") {
    stopTimer();
    sendResponse({ success: true });
  } else if (message.type === "getState") {
    sendResponse({
      currentTimer,
      isStudySession,
      isStudyMode: currentTimer > 0,
    });
  } else if (message.type === "feed") {
    chrome.storage.sync.get(["hunger"], (data) => {
      let newHunger = Math.min(100, (data.hunger || 0) + 10); // Increase hunger, max 100
      chrome.storage.sync.set({ hunger: newHunger });
      sendResponse({ hunger: newHunger });
      console.log(`Hunger increased to ${newHunger}`);
    });
  } else if (message.type === "unfeed") {
    chrome.storage.sync.get(["hunger"], (data) => {
      let newHunger = Math.max(0, (data.hunger || 0) - 10); // Decrease hunger, min 0
      chrome.storage.sync.set({ hunger: newHunger });
      sendResponse({ hunger: newHunger });
      console.log(`Hunger decreased to ${newHunger}`);
    });
  }
  return true;
});
