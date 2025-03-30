// In-memory storage fallback for development environment
const memoryStorage = {};

export const saveData = (key, data) => {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ [key]: data });
  } else {
    console.warn("Chrome storage API not available. Using in-memory storage.");
    memoryStorage[key] = data;
  }
};

export const getData = (key, callback) => {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get([key], (result) => {
      callback(result[key] || {});
    });
  } else {
    console.warn("Chrome storage API not available. Using in-memory storage.");
    callback(memoryStorage[key] || {});
  }
};
