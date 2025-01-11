// Create the cat container
const catContainer = document.createElement('div');
catContainer.id = 'cat-container';

// Add the default cat image
const catImage = document.createElement('img');
catImage.src = chrome.runtime.getURL('assets/cat/cat-default.png');
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
    <option value="cat-default.png">Default Cat</option>
    <option value="cat-black.png">Black Cat</option>
    <option value="cat-white.png">White Cat</option>
    <option value="cat-tabby.png">Tabby Cat</option>
    <option value="cat-calico.png">Calico Cat</option>
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

// Sound effects
const meowSound = new Audio(chrome.runtime.getURL('assets/sounds/meow.mp3'));
const purringSound = new Audio(chrome.runtime.getURL('assets/sounds/purring.mp3'));
const toySqueakSound = new Audio(chrome.runtime.getURL('assets/sounds/toy-squeak.mp3'));

// Show/hide timer widget on cat click
catImage.addEventListener('click', () => {
  timerWidget.style.display = timerWidget.style.display === 'none' ? 'block' : 'none';
  meowSound.play();
});

// Start study timer
document.getElementById('start-study').addEventListener('click', () => {
  clearInterval(breakInterval);
  studyInterval = setInterval(() => {
    if (studyTime > 0) {
      studyTime--;
      updateTimer('study-timer', studyTime);
    } else {
      clearInterval(studyInterval);
      points += 5; // Earn points
      document.getElementById('points').textContent = points;
      alert('Study session complete! Take a break!');
      purringSound.play();
    }
  }, 1000);
});

// Stop study timer
document.getElementById('stop-study').addEventListener('click', () => {
  clearInterval(studyInterval);
});

// Start break timer
document.getElementById('start-break').addEventListener('click', () => {
  clearInterval(studyInterval);
  breakInterval = setInterval(() => {
    if (breakTime > 0) {
      breakTime--;
      updateTimer('break-timer', breakTime);
    } else {
      clearInterval(breakInterval);
      alert('Break over! Back to study!');
    }
  }, 1000);
});

// Update timer display
function updateTimer(elementId, time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  document.getElementById(elementId).textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Cat customization logic
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

// Cat selection logic
document.getElementById('cat-selector').addEventListener('change', (event) => {
    const selectedCat = event.target.value;
    catImage.src = chrome.runtime.getURL(`assets/cat/${selectedCat}`);
    chrome.storage.sync.set({ selectedCat }); // Save selected cat
  });
  
  // Load the previously selected cat on initialization
  chrome.storage.sync.get(['selectedCat'], (data) => {
    const savedCat = data.selectedCat || 'cat-default.png';
    catImage.src = chrome.runtime.getURL(`assets/cat/${savedCat}`);
    document.getElementById('cat-selector').value = savedCat;
  });
  