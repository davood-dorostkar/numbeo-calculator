document.getElementById('visibilityToggle').addEventListener('change', function() {
    const isVisible = this.checked;

    // Query the current active tab in the window
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        // Send the toggle state to the content script
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleVisibility", isVisible });
    });
});
