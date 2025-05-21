chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed or updated.');
    
    chrome.alarms.create('myAlarm', { periodInMinutes: 1 });
  });

chrome.runtime.onInstalled.addListener(function() {
    console.log("Service worker is active");
  });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.test) {
        console.log("Received from content script:", message.test);
        sendResponse({ response: "Message received in background" });
    }
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "myAlarm") {
        console.log("Alarm triggered!");
    }
});