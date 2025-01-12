import getStudyGuide from "./feature/file-parser/aryn.js";

// Elements
const studyTimerElement = document.getElementById("study-timer");
const breakTimerElement = document.getElementById("break-timer");
const studyHoursInput = document.getElementById("study-hours");
const studyMinutesInput = document.getElementById("study-minutes");
const breakHoursInput = document.getElementById("break-hours");
const breakMinutesInput = document.getElementById("break-minutes");
const catSelector = document.getElementById("cat-selector");
const feedButton = document.getElementById("feed-button");
const unfeedButton = document.getElementById("unfeed-button");
const hungerFill = document.getElementById("hunger-fill");
const hungerReminder = document.getElementsByClassName("hunger-reminder");

// Update timer display
function updateTimerDisplay(element, time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  element.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Start the timer
function startTimer() {
  const studyHours = parseInt(studyHoursInput.value) || 0;
  const studyMinutes = parseInt(studyMinutesInput.value) || 0;
  const breakHours = parseInt(breakHoursInput.value) || 0;
  const breakMinutes = parseInt(breakMinutesInput.value) || 0;

  const studyTime = studyHours * 3600 + studyMinutes * 60;
  const breakTime = breakHours * 3600 + breakMinutes * 60;

  chrome.runtime.sendMessage({
    type: "startTimer",
    studyTime,
    breakTime,
  });
}

// Stop the timer
function stopTimer() {
  chrome.runtime.sendMessage({ type: "stopTimer" });
}

// Sync the UI with the timer state
function syncUI() {
  chrome.runtime.sendMessage({ type: "getState" }, (response) => {
    if (response.isStudySession) {
      updateTimerDisplay(studyTimerElement, response.currentTimer);
    } else {
      updateTimerDisplay(breakTimerElement, response.currentTimer);
    }
  });
}

// Save selected cat and update preview
catSelector.addEventListener("change", (event) => {
  const selectedCat = event.target.value;
  chrome.storage.local.set({ selectedCat });
  const previewImage = document.getElementById("cat-image");
  previewImage.src = `assets/cat/${selectedCat}/cat-default.png`;
});

function updateHungerBar(hunger) {
  if(hunger >= 80){
    hungerFill.style.backgroundColor = "green";
  } else if(hunger >= 40){
    hungerFill.style.backgroundColor = "orange";
  } else {
    hungerFill.style.backgroundColor = "red";
  }
  if(hunger <= 10){
    hungerReminder[0].style.display = "block";
  } else {
    hungerReminder[0].style.display = "none";
  }
  hungerFill.style.width = `${hunger}%`;
}

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

chrome.storage.onChanged.addListener((changes) => {
  if(changes.hunger) {
    console.log("Hunger level changed:", changes.hunger.newValue);
    updateHungerBar(changes.hunger.newValue);
    chrome.storage.sync.get(["hunger"], (data) => {
      if (data.hunger <= 0) {
        console.log("Your cat is hungry, consider feeding the cat!");
      }
    });
  }
});

// Poll for updates to keep the UI synced
setInterval(syncUI, 1000);
