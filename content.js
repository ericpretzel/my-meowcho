const catContainer = document.createElement("div");
catContainer.id = "interactive-cat";
catContainer.style.position = "fixed";
catContainer.style.bottom = "10px";
catContainer.style.right = "10px";
catContainer.style.width = "100px";
catContainer.style.height = "100px";
catContainer.style.zIndex = "10000";
catContainer.style.cursor = "pointer";

const catImage = document.createElement("img");
catImage.alt = "Interactive Cat";
catImage.style.width = "100%";
catImage.style.height = "100%";
catContainer.appendChild(catImage);

document.body.appendChild(catContainer);

// Load the selected cat on page load
chrome.storage.sync.get(['selectedCat'], (data) => {
  const currentCat = data.selectedCat || 'default';
  updateInteractiveCat(currentCat, "default");
});

// React to dropdown changes in the popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedCat?.newValue) {
    const newCat = changes.selectedCat.newValue;
    updateInteractiveCat(newCat, "default");
  }
  if (changes.currentState?.newValue) {
    const state = changes.currentState.newValue;
    updateInteractiveCat(currentCat, state);
  }
});

function updateInteractiveCat(cat, state) {
    catImage.src = chrome.runtime.getURL(`assets/cat/${currentCat}/cat-${state}.png`);
}
