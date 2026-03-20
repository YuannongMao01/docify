// DocConverter — Background Service Worker (Manifest V3)
// Handles extension lifecycle events

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('DocConverter installed successfully.');
  }
});

// Keep service worker alive during long conversions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ping') {
    sendResponse({ type: 'pong' });
  }
  return true;
});
