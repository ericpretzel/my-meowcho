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

// Save selected cat and update preview
catSelector.addEventListener("change", (event) => {
  const selectedCat = event.target.value;
  chrome.storage.local.set({ selectedCat });
  const previewImage = document.getElementById("cat-image");
  previewImage.src = `assets/cat/${selectedCat}/cat-idle.gif`; // Update preview to use cat-default.png
});


// Event listeners
studyHoursInput.addEventListener("input", updateStudyTime);
studyMinutesInput.addEventListener("input", updateStudyTime);
breakHoursInput.addEventListener("input", updateBreakTime);
breakMinutesInput.addEventListener("input", updateBreakTime);
dropZone.addEventListener("drop", dropHandler);
dropZone.addEventListener("dragover", dragOverHandler);

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
        generateStudyGuideInput.textContent = "Generating Study Guide...";
        getStudyGuide(file).then(response => {
          return response.json();
        })
        .then(data => {
          console.log(data.body);
          generateStudyGuideInput.textContent = "Save Study Guide as txt";
          generateStudyGuideInput.removeAttribute("disabled");
          generateStudyGuideInput.onclick = (e) => {
            console.log('saving study guide');
            var blob = new Blob([data.body], {type: "text/plain"});
            var url = URL.createObjectURL(blob);
            chrome.downloads.download({
              url: url,
              filename: "study-guide.txt"
            });
          }
        });
      }
    });
  } else {
    // Use DataTransfer interface to access the file(s)
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(file);
      console.log(`… file[${i}].name = ${file.name}`);
      getStudyGuide(file).then(response => {
        return response.json();
      })
      .then(data => {
        console.log(data.body);
        generateStudyGuideInput.textContent = "Save Study Guide as txt";
        generateStudyGuideInput.removeAttribute("disabled");
        generateStudyGuideInput.onclick = (e) => {
          console.log('saving study guide');
          var blob = new Blob([data.body], {type: "text/plain"});
          var url = URL.createObjectURL(blob);
          chrome.downloads.download({
            url: url,
            filename: "study-guide.txt"
          });
        }
      });
    });
  }
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

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

startStudyButton.addEventListener("click", startTimer);
stopLoopButton.addEventListener("click", stopTimer);

// Poll for updates to keep the UI synced
setInterval(syncUI, 1000);

// Load saved study and break durations into the input fields
chrome.storage.local.get(["studyTime", "breakTime"], (data) => {
  const studySeconds = data.studyTime || 1500; // Default to 25 minutes
  const breakSeconds = data.breakTime || 300; // Default to 5 minutes

  // Populate the input fields
  studyHoursInput.value = Math.floor(studySeconds / 3600);
  studyMinutesInput.value = Math.floor((studySeconds % 3600) / 60);
  breakHoursInput.value = Math.floor(breakSeconds / 3600);
  breakMinutesInput.value = Math.floor((breakSeconds % 3600) / 60);

  // Update the timer display
  updateStudyTime();
  updateBreakTime();
});
