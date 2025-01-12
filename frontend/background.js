const INITIAL_HUNGER = 0; // Hunger bar starts full
let hunger = INITIAL_HUNGER;

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
      return true; // Indicates async response
  }
});
