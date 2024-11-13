// This is a simple background script for your Chrome extension.

// Listen for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed or updated.');
    // You can perform actions like setting default values or creating context menus here
});

// Listen for messages from the popup or content scripts
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "getData") {
//         // Example: Respond with some data
//         sendResponse({ data: "Hello from background!" });
//     }
// });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.test) {
        console.log("Received from content script:", message.test);
        sendResponse({ response: "Message received in background" });
    }
});

// You can also set up alarms, listeners for tabs, etc.
// Example: Set up a periodic alarm
chrome.alarms.create("myAlarm", { periodInMinutes: 1 });

// Listen for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "myAlarm") {
        console.log("Alarm triggered!");
        // Perform actions when the alarm triggers
    }
});