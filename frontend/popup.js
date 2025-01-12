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

// Event listeners
startStudyButton.addEventListener("click", startTimer);
stopLoopButton.addEventListener("click", stopTimer);

// Poll for updates to keep the UI synced
setInterval(syncUI, 1000);
