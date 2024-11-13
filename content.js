const urlPattern = /^https:\/\/www\.numbeo\.com\/cost-of-living\/in\/.+/;

// Function to store the quantities in Chrome storage
function storeQuantities() {
    const quantities = {};
    const rows = document.querySelectorAll(".data_wide_table tr:not(:first-child)");

    rows.forEach((row, index) => {
        if (row.querySelector(".category_title")) return; // Skip rows with 'category_title'

        const quantityInput = row.querySelector("td:last-child input");
        if (quantityInput) {
            quantities[index] = quantityInput.value;
        }
    });

    // Save quantities to chrome storage
    chrome.storage.sync.set({ "quantities": quantities });
}

// Function to retrieve quantities from chrome storage
function loadQuantities() {
    chrome.storage.sync.get("quantities", function(data) {
        const quantities = data.quantities || {};

        const rows = document.querySelectorAll(".data_wide_table tr:not(:first-child)");

        rows.forEach((row, index) => {
            if (row.querySelector(".category_title")) return; // Skip rows with 'category_title'

            const quantityInput = row.querySelector("td:last-child input");
            if (quantityInput && quantities[index] !== undefined) {
                quantityInput.value = quantities[index]; // Set the stored quantity
            }
        });
    });
}

function addColumnAndTotal() {
    const table = document.querySelector(".data_wide_table");
    if (!table) return;

    // Check if columns already exist
    if (!table.querySelector('.quantity-header')) {
        // Add quantity header to the table
        const headerRow = table.querySelector("tr");
        const quantityHeader = document.createElement("th");
        quantityHeader.classList.add('quantity-header');
        quantityHeader.textContent = "Quantity";
        headerRow.appendChild(quantityHeader);
        quantityHeader.style.width= "20px";
        
        // Select all rows except the header
        const rows = table.querySelectorAll("tr:not(:first-child)");

        // Add input fields to each row, skipping rows with 'category_title'
        rows.forEach((row, index) => {
            if (shouldSkipRow(row)) return; // Skip rows with 'category_title'

            const quantityCell = document.createElement("td");
            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.value = 0;
            quantityInput.min = 0;
            quantityInput.addEventListener("input", function() {
                updateTotal();
                storeQuantities(); // Update quantities in storage whenever the input changes
            });
            quantityCell.appendChild(quantityInput);
            row.appendChild(quantityCell);
            quantityCell.style.width= "20px";
        });
        window.ignoreRows = false;

        // Add the total row
        const totalRow = document.createElement("tr");
        totalRow.innerHTML = `<td colspan="${headerRow.children.length - 1}"></td><td id="total-cell">Total: €0.00</td>`;
        table.appendChild(totalRow);

        window.totalCell = document.getElementById("total-cell");
        totalCell.style.fontSize = "20px";  // Make the font bigger
        totalCell.style.fontWeight = "bold";  // Make the font bold
        totalCell.style.width= "20px";
    }

    // Load stored quantities when the page is loaded
    loadQuantities();
    updateTotal();
}

function shouldSkipRow(row) {
    const categoryTitle = row.querySelector(".category_title");

    // If the title matches one of the conditions, ignore subsequent rows until the next category title
    if (categoryTitle) {
        const titleText = categoryTitle.textContent.trim();
        if (titleText === "Buy Apartment Price" || titleText === "Salaries And Financing") {
            window.ignoreRows = true;
        }
        else{
            window.ignoreRows = false;
        }
        return true;
    }
    else{
        const isCar = row.querySelector('td').textContent.includes('New Car');
        if (window.ignoreRows || isCar) {
            return true;
        }
    }
    return false;
}

function updateTotal() {
    let total = 0;

    // Get all rows again for recalculating the total
    const rows = document.querySelectorAll(".data_wide_table tr:not(:first-child)");
    const currency = rows[0].querySelector("td:nth-child(2) .first_currency").textContent.match(/([\d.]+)\s*([\p{Sc}]+)/u)[2];
    rows.forEach(row => {
        if (shouldSkipRow(row)) return; // Skip rows with 'category_title'

        const basePriceElement = row.querySelector("td:nth-child(2) .first_currency");
        
        if (basePriceElement) {
            const basePriceText = basePriceElement.textContent;
            // Remove commas and parse the price
            const basePrice = parseFloat(basePriceText.replace(/,/g, "").match(/([\d.]+)\s*([\p{Sc}]+)/u)[1].trim());
            // const basePrice = parseFloat(basePriceText.replace("€", "").replace(/,/g, "").trim());

            const quantity = parseFloat(row.querySelector("td:last-child input").value) || 0;
            total += basePrice * quantity;
        }
    });
    window.ignoreRows = false;
    totalCell.textContent = `Total: ${currency} ${total.toFixed(2)}`;
}

// Function to toggle visibility of the added elements
function toggleVisibility(isVisible) {
    document.querySelectorAll('.quantity-header, td:last-child, #total-cell').forEach(el => {
        el.style.display = isVisible ? '' : 'none';
    });
}

function resetQuantities() {
    // Select all rows except the header
    const rows = document.querySelectorAll(".data_wide_table tr:not(:first-child)");

    rows.forEach(row => {
        if (shouldSkipRow(row)) return; // Skip row if it matches the conditions

        const quantityInput = row.querySelector("td:last-child input");
        if (quantityInput) {
            quantityInput.value = 0; // Reset quantity to 0
        }
    });
    window.ignoreRows = false;

    // Clear the quantities in chrome storage as well
    chrome.storage.sync.set({ "quantities": {} }, function() {
        // Optionally update the total if needed
        updateTotal();
    });
}

// Listen for messages from the popup for visibility changes
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "toggleVisibility") {
        toggleVisibility(request.sliderOn);
    }
    else if (request.action === "resetQuantities") {
        resetQuantities();
    }
});

// Automatically add the column and total if on the correct URL pattern
if (urlPattern.test(window.location.href)) {
    addColumnAndTotal();
}

// Get the initial visibility state from chrome storage and apply it
chrome.storage.sync.get("sliderOn", function(data) {
    const sliderOn = data.sliderOn !== undefined ? data.sliderOn : false;
    toggleVisibility(sliderOn);  // Apply visibility based on stored value
});

// Load the quantity values from storage and update the inputs, then recalculate the total
chrome.storage.sync.get("quantities", function(data) {
    const quantities = data.quantities || {};
    
    // Select all rows except the header
    const rows = document.querySelectorAll(".data_wide_table tr:not(:first-child)");

    rows.forEach(row => {
        if (row.querySelector(".category_title")) return; // Skip rows with 'category_title'

        const rowIndex = Array.from(rows).indexOf(row); // Get the row index
        
        // If there's a stored quantity for this row, update the input value
        const quantityInput = row.querySelector("td:last-child input");
        if (quantityInput) {
            const storedQuantity = quantities[rowIndex] || 0;
            quantityInput.value = storedQuantity;
        }
    });

    // Recalculate the total after updating quantities
    updateTotal();
});