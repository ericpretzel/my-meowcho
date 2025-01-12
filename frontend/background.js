// Timer variables
let studyTime = 0;
let breakTime = 0;
let currentTimer = 0;
let isStudySession = true; // Tracks if it's currently a study session
let timerInterval = null;

const INITIAL_HUNGER = 100; // Hunger bar starts full
let hunger = INITIAL_HUNGER;

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



chrome.runtime.onInstalled.addListener(() => {
  // Initialize hunger in storage
  chrome.storage.sync.set({ hunger: INITIAL_HUNGER });
  console.log('Pet initialized with full hunger bar.');

  // Set up an alarm to decrease hunger every minute
  chrome.alarms.create('decreaseHunger', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'decreaseHunger') {
      chrome.storage.sync.get(['hunger'], (data) => {
          let newHunger = Math.max(0, (data.hunger || 0) - 10); // Decrease hunger, but not below 0 (jank ass JS stuff)
          chrome.storage.sync.set({ hunger: newHunger });
          console.log(`Hunger decreased to ${newHunger}`);
      });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'feed') {
    chrome.storage.sync.get(['hunger'], (data) => {
        let newHunger = Math.min(100, (data.hunger || 0) + 10); // Increase hunger, but not above max
        chrome.storage.sync.set({ hunger: newHunger });
        sendResponse({ hunger: newHunger });
        console.log(`Hunger increased to ${newHunger}`);
    });
  }
  if(message.type === 'unfeed'){
      chrome.storage.sync.get(['hunger'], (data) => {
      let newHunger = Math.max(0, (data.hunger || 0) - 10); // Increase hunger, but not above max
      chrome.storage.sync.set({ hunger: newHunger });
      sendResponse({ hunger: newHunger });
      console.log(`Hunger decreased to ${newHunger}`);
    });
  }
  return true; // Indicates async response
});
