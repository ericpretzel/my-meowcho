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
const startStudyButton = document.getElementById("start-study");
const stopLoopButton = document.getElementById("stop-loop");
const catSelector = document.getElementById("cat-selector");
const generateStudyGuideInput = document.getElementById("generate-study-guide");
const dropZone = document.getElementById("drop-zone");

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
  chrome.storage.sync.get("selectedCat", (data) => {
    const selectedCat = data.selectedCat || "default";
    const iconUrl = `assets/cat/${selectedCat}/cat-default.png`;
    if (Notification.permission === "granted") {
      new Notification(title, { body: message, icon: iconUrl });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  });
}

// Start the timer loop
function startTimerLoop() {
  currentTimer = isStudySession ? studyTime : breakTime;
  syncSessionState(isStudySession ? "study" : "break");

  if (isStudySession) {
    studySound.play();
    showNotification("Study Time", "Focus on your work!");
  } else {
    breakSound.play();
    showNotification("Break Time", "Take a well-deserved break!");
  }

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
      startTimerLoop();
    }
  }, 1000);
}

// Stop the timer loop
function stopTimerLoop() {
  clearInterval(timerInterval); // Ensure the interval is cleared
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
  getStudyGuide().then(response => {
    console.log(response);
  });
}

// Save selected cat and update preview
catSelector.addEventListener("change", (event) => {
  const selectedCat = event.target.value;
  chrome.storage.sync.set({ selectedCat });
  const previewImage = document.getElementById("cat-image");
  previewImage.src = `assets/cat/${selectedCat}/cat-default.png`; // Update preview to use cat-default.png
});


// Event listeners
studyHoursInput.addEventListener("input", updateStudyTime);
studyMinutesInput.addEventListener("input", updateStudyTime);
breakHoursInput.addEventListener("input", updateBreakTime);
breakMinutesInput.addEventListener("input", updateBreakTime);
generateStudyGuideInput.addEventListener("click", generateStudyGuide);
dropZone.addEventListener("drop", dropHandler);
dropZone.addEventListener("dragover", dragOverHandler);

startStudyButton.addEventListener("click", () => {
  isStudySession = true; // Always start with a study session
  startTimerLoop();
});

stopLoopButton.addEventListener("click", stopTimerLoop);

// Request notification permission on load
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

function dropHandler(ev) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === "file") {
        const file = item.getAsFile();
        console.log(`. . . file[${i}].name = ${file.name}`);
        console.log(file);
        getStudyGuide(file).then(response => {
          console.log(response);
        });
      }
    });
  } else {
    // Use DataTransfer interface to access the file(s)
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(file);
      console.log(`… file[${i}].name = ${file.name}`);
      getStudyGuide(file).then(response => {
        console.log(response);
      });
    });
  }
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

