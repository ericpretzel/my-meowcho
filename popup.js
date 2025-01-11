let studyTime = 25 * 60; // 25 minutes in seconds
let breakTime = 5 * 60; // 5 minutes in seconds
let studyInterval, breakInterval;
let points = 0;
let currentCat = 'default';

// Elements
const studyTimerElement = document.getElementById("study-timer");
const breakTimerElement = document.getElementById("break-timer");
const pointsElement = document.getElementById("points");
const catImage = document.getElementById("cat-image");
const catSelector = document.getElementById("cat-selector");

// Update timer display
function updateTimer(element, time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  element.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Update cat image dynamically based on state and current selection
function updateCatImage(state) {
  catImage.src = `assets/cat/${currentCat}/cat-${state}.png`;
}

// Load previously selected cat from storage
chrome.storage.sync.get(['selectedCat'], (data) => {
  currentCat = data.selectedCat || 'default';
  catSelector.value = currentCat;
  updateCatImage('default');
});

// Save selected cat when user changes it
catSelector.addEventListener("change", (event) => {
  currentCat = event.target.value;
  chrome.storage.sync.set({ selectedCat: currentCat });
  updateCatImage('default');
});

// Start study timer
document.getElementById("start-study").addEventListener("click", () => {
  clearInterval(breakInterval);
  updateCatImage('sleeping');
  studyInterval = setInterval(() => {
    if (studyTime > 0) {
      studyTime--;
      updateTimer(studyTimerElement, studyTime);
    } else {
      clearInterval(studyInterval);
      points += 5;
      pointsElement.textContent = points;
      alert("Study session complete! Take a break.");
      updateCatImage('happy');
    }
  }, 1000);
});

// Stop study timer
document.getElementById("stop-study").addEventListener("click", () => {
  clearInterval(studyInterval);
  updateCatImage('default');
});

// Start break timer
document.getElementById("start-break").addEventListener("click", () => {
  clearInterval(studyInterval);
  updateCatImage('playing');
  breakInterval = setInterval(() => {
    if (breakTime > 0) {
      breakTime--;
      updateTimer(breakTimerElement, breakTime);
    } else {
      clearInterval(breakInterval);
      alert("Break is over! Time to study.");
      updateCatImage('default');
    }
  }, 1000);
});
