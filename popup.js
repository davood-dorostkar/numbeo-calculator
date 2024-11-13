document.getElementById("slider").addEventListener("change", function(event) {
    const sliderOn = event.target.checked;  // true means ON, false means OFF

    // Save the slider state to chrome storage
    chrome.storage.sync.set({ "sliderOn": sliderOn }, function() {
        // Send message to content script to update visibility
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggleVisibility", sliderOn: sliderOn });
        });
    });
});

// Set the slider state based on stored value when popup is opened
chrome.storage.sync.get("sliderOn", function(data) {
    const sliderOn = data.sliderOn !== undefined ? data.sliderOn : false; // Default to off
    const slider = document.getElementById("slider");
    slider.checked = sliderOn;  // Set the slider position (checked is on, unchecked is off)
});
