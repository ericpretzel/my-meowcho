// Create the cat container
const catContainer = document.createElement('div');
catContainer.id = 'cat-container';

// Add the default cat image
const catImage = document.createElement('img');
catImage.alt = 'Interactive Cat';
catContainer.appendChild(catImage);

// Add a timer widget
const timerWidget = document.createElement('div');
timerWidget.id = 'timer-widget';
timerWidget.style.display = 'none'; // Initially hidden
timerWidget.innerHTML = `
  <h3>Study Timer</h3>
  <p id="study-timer">25:00</p>
  <button id="start-study">Start Study</button>
  <button id="stop-study">Stop</button>
  <h4>Break Timer</h4>
  <p id="break-timer">5:00</p>
  <button id="start-break">Start Break</button>
  <h4>Points: <span id="points">0</span></h4>
  <button id="customize-cat">Customize Cat</button>
  <h4>Pick Your Cat</h4>
  <select id="cat-selector">
    <option value="default">Default Cat</option>
    <option value="black">Black Cat</option>
    <option value="white">White Cat</option>
    <option value="tabby">Tabby Cat</option>
    <option value="calico">Calico Cat</option>
  </select>
`;
catContainer.appendChild(timerWidget);

// Append the cat container to the webpage
document.body.appendChild(catContainer);

// Timer variables
let studyTime = 25 * 60; // 25 minutes in seconds
let breakTime = 5 * 60; // 5 minutes in seconds
let points = 0;
let studyInterval, breakInterval;

// Current selected cat
let currentCat = 'default';

// Sound effects
const meowSound = new Audio(chrome.runtime.getURL('assets/sounds/meow.mp3'));
const purringSound = new Audio(chrome.runtime.getURL('assets/sounds/purring.mp3'));
const toySqueakSound = new Audio(chrome.runtime.getURL('assets/sounds/toy-squeak.mp3'));

// Function to update the cat state dynamically
function updateCatState(state) {
  catImage.src = chrome.runtime.getURL(`assets/cat/${currentCat}/cat-${state}.png`);
}

// Load previously selected cat on initialization
chrome.storage.sync.get(['selectedCat'], (data) => {
  currentCat = data.selectedCat || 'default';
  updateCatState('default'); // Set initial state
  document.getElementById('cat-selector').value = currentCat;
});

// Save the selected cat when the user changes it
document.getElementById('cat-selector').addEventListener('change', (event) => {
  currentCat = event.target.value;
  chrome.storage.sync.set({ selectedCat: currentCat });
  updateCatState('default'); // Update to the default state of the new cat
});

// Show/hide timer widget on cat click
catImage.addEventListener('click', () => {
  timerWidget.style.display = timerWidget.style.display === 'none' ? 'block' : 'none';
  meowSound.play();
});

// Start study timer
document.getElementById('start-study').addEventListener('click', () => {
  clearInterval(breakInterval);
  updateCatState('sleeping'); // Cat sleeps during study
  studyInterval = setInterval(() => {
    if (studyTime > 0) {
      studyTime--;
      updateTimer('study-timer', studyTime);
    } else {
      clearInterval(studyInterval);
      points += 5; // Earn points
      document.getElementById('points').textContent = points;
      alert('Study session complete! Take a break!');
      updateCatState('happy'); // Cat becomes happy after study
      purringSound.play();
    }
  }, 1000);
});

// Stop study timer
document.getElementById('stop-study').addEventListener('click', () => {
  clearInterval(studyInterval);
  updateCatState('default'); // Reset to default state
});

// Start break timer
document.getElementById('start-break').addEventListener('click', () => {
  clearInterval(studyInterval);
  updateCatState('playing'); // Cat plays during break
  breakInterval = setInterval(() => {
    if (breakTime > 0) {
      breakTime--;
      updateTimer('break-timer', breakTime);
    } else {
      clearInterval(breakInterval);
      alert('Break over! Back to study!');
      updateCatState('default'); // Reset to default state
    }
  }, 1000);
});

// Update timer display
function updateTimer(elementId, time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  document.getElementById(elementId).textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Customize cat (add accessories)
document.getElementById('customize-cat').addEventListener('click', () => {
  const hat = document.createElement('img');
  hat.src = chrome.runtime.getURL('assets/accessories/hat.png');
  hat.style.position = 'absolute';
  hat.style.top = '0';
  hat.style.left = '25px';
  hat.style.width = '50px';
  catContainer.appendChild(hat);

  points -= 10; // Deduct points for customization
  document.getElementById('points').textContent = points;
  toySqueakSound.play();
});
