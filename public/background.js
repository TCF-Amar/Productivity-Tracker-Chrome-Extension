// Store timing data
let siteTime = {};
let activeTabId = null;
let activeUrl = null;
let startTime = null;

// Load existing data
chrome.storage.local.get("siteTime", (data) => {
  if (data.siteTime) {
    siteTime = data.siteTime;
  }
});

// Helper function to update site time
function updateSiteTime() {
  if (activeUrl && startTime) {
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - startTime) / 1000;

    if (!siteTime[activeUrl]) {
      siteTime[activeUrl] = 0;
    }

    siteTime[activeUrl] += elapsedSeconds;
    chrome.storage.local.set({ siteTime });

    // Reset timer
    startTime = currentTime;
  }
}

// Track active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Update time for previous site before switching
  updateSiteTime();

  activeTabId = activeInfo.tabId;
  chrome.tabs.get(activeTabId, (tab) => {
    if (tab && tab.url && tab.url.startsWith("http")) {
      activeUrl = new URL(tab.url).hostname;
      startTime = Date.now();
    } else {
      activeUrl = null;
    }
  });
});

// Track URL changes in the same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    // Update time for previous site before URL change
    updateSiteTime();

    if (tab.url && tab.url.startsWith("http")) {
      activeUrl = new URL(tab.url).hostname;
      startTime = Date.now();
    } else {
      activeUrl = null;
    }
  }
});

// Handle browser closing or tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    updateSiteTime();
    activeTabId = null;
    activeUrl = null;
  }
});

// Record data periodically (every 5 seconds)
setInterval(updateSiteTime, 5000);

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSiteTime") {
    // Update one last time before sending data
    updateSiteTime();
    sendResponse(siteTime);
    return true;
  } else if (request.action === "resetStats") {
    siteTime = {};
    chrome.storage.local.set({ siteTime });
    sendResponse({ success: true });
    return true;
  }
});
