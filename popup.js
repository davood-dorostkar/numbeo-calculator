document.getElementById("slider").addEventListener("change", function(event) {
    const sliderOn = event.target.checked;  

    chrome.storage.sync.set({ "sliderOn": sliderOn }, function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggleVisibility", sliderOn: sliderOn });
        });
    });
});
document.getElementById('resetBtn').addEventListener('click', function() {
    chrome.storage.sync.set({ "quantities": {} }, function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "resetQuantities" });
        });
    });
});

chrome.storage.sync.get("sliderOn", function(data) {
    const sliderOn = data.sliderOn !== undefined ? data.sliderOn : false; 
    const slider = document.getElementById("slider");
    slider.checked = sliderOn;  
});
