// popup.js
document.getElementById('myButton').addEventListener('click', function() {
    // Query the current active tab in the window
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url;
        
        // Define the base URL pattern
        const urlPattern = /^https:\/\/www\.numbeo\.com\/cost-of-living\/in\/.+/;
        
        if (!urlPattern.test(currentUrl)) {
            alert('You are not on the correct URL. Please visit a page like: https://www.numbeo.com/cost-of-living/in/Amsterdam');
            return;
        }

        // If URL is correct, send a message to the content script
        chrome.tabs.sendMessage(tabs[0].id, { action: "addQuantityColumn" }, function(response) {
            if (chrome.runtime.lastError) {
                // Handle case when the content script is not found
                console.error("Error sending message:", chrome.runtime.lastError.message);
                alert("Failed to communicate with content script. Make sure the URL is correct.");
                return;
            }

            // Check response from content.js
            if (response && response.status === "success") {
                console.log("Quantity column added successfully.");
            } else {
                console.error("Failed to add quantity column:", response ? response.message : "No response");
            }
        });
    });
});
