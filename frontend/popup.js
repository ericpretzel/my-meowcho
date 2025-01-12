import getStudyGuide from "./feature/file-parser/aryn.js";

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
const catSelector = document.getElementById("cat-selector");
const generateStudyGuideInput = document.getElementById("generate-study-guide");
const dropZone = document.getElementById("drop-zone");
const feedButton = document.getElementById("feed-button");
const unfeedButton = document.getElementById("unfeed-button");
const hungerFill = document.getElementById("hunger-fill");
const hungerReminder = document.getElementsByClassName("hunger-reminder");
const startStudyButton = document.getElementById("start-study");
const stopLoopButton = document.getElementById("stop-loop");

// Update timer display
function updateTimerDisplay(element, time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  element.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Start the timer
function startTimer() {
  // Parse and validate input values
  const studyHours = studyHoursInput.value.trim() === "" ? 0 : parseInt(studyHoursInput.value, 10);
  const studyMinutes = studyMinutesInput.value.trim() === "" ? 0 : parseInt(studyMinutesInput.value, 10);
  const breakHours = breakHoursInput.value.trim() === "" ? 0 : parseInt(breakHoursInput.value, 10);
  const breakMinutes = breakMinutesInput.value.trim() === "" ? 0 : parseInt(breakMinutesInput.value, 10);

  // Calculate total times in seconds
  const studyTime = studyHours * 3600 + studyMinutes * 60;
  const breakTime = breakHours * 3600 + breakMinutes * 60;

  // Validate total times
  if (studyTime <= 0 || breakTime <= 0) {
    alert("Please provide valid durations for both study and break timers!");
    return;
  }

  // Debugging log for validation
  console.log("Study Time:", studyTime, "seconds");
  console.log("Break Time:", breakTime, "seconds");

  // Send message to start the timer
  chrome.runtime.sendMessage(
    { type: "startTimer", studyTime, breakTime },
    (response) => {
      if (response?.success) {
        console.log("Timer started successfully.");
      } else {
        console.error("Failed to start timer.");
      }
    }
  );
}

// Stop the timer
function stopTimer() {
  chrome.runtime.sendMessage({ type: "stopTimer" }, (response) => {
    if (response?.success) {
      console.log("Timer stopped successfully.");
    } else {
      console.error("Failed to stop timer.");
    }
  });
}

// Sync the UI with the timer state
function syncUI() {
  chrome.runtime.sendMessage({ type: "getState" }, (response) => {
    if (response) {
      if (response.isStudySession) {
        updateTimerDisplay(studyTimerElement, response.currentTimer);
      } else {
        updateTimerDisplay(breakTimerElement, response.currentTimer);
      }
    } else {
      console.error("Failed to sync timer state.");
    }
  });
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

// Generate Study Guide
function generateStudyGuide() {
  console.log("Generate Study Guide Button Clicked");
  getStudyGuide().then((response) => {
    console.log(response);
  });
}

// Save selected cat and update preview
catSelector.addEventListener("change", (event) => {
  const selectedCat = event.target.value;
  const allowedCats = ["default", "black", "white"];
  if (!allowedCats.includes(selectedCat)) {
    chrome.storage.local.set({ selectedCat: "default" });
  } else {
    chrome.storage.local.set({ selectedCat });
  }
});

// Drag-and-Drop Functionality
function dropHandler(ev) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    [...ev.dataTransfer.items].forEach((item, i) => {
      if (item.kind === "file") {
        const file = item.getAsFile();
        console.log(`. . . file[${i}].name = ${file.name}`);
        getStudyGuide(file)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
          });
      }
    });
  } else {
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(file);
      getStudyGuide(file).then((response) => {
        console.log(response);
      });
    });
  }
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");
  ev.preventDefault();
}

// Update Hunger Bar
function updateHungerBar(hunger) {
  if (hunger >= 80) {
    hungerFill.style.backgroundColor = "green";
  } else if (hunger >= 40) {
    hungerFill.style.backgroundColor = "orange";
  } else {
    hungerFill.style.backgroundColor = "red";
  }
  hungerFill.style.width = `${hunger}%`;

  if (hunger <= 10) {
    hungerReminder[0].style.display = "block";
  } else {
    hungerReminder[0].style.display = "none";
  }
}

// Event Listeners
feedButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "feed" }, (response) => {
    console.log("Feed button clicked");
  });
});

unfeedButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "unfeed" }, (response) => {
    console.log("Unfeed button clicked");
  });
});

// Sync hunger changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.hunger) {
    updateHungerBar(changes.hunger.newValue);
  }
});

// Start/Stop Timer Button Listeners
startStudyButton.addEventListener("click", startTimer);
stopLoopButton.addEventListener("click", stopTimer);

// Periodic Timer Sync
setInterval(syncUI, 1000);

// Request notification permission
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}
