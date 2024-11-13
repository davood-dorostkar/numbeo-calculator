const urlPattern = /^https:\/\/www\.numbeo\.com\/cost-of-living\/in\/.+/;

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

        // Select all rows except the header
        const rows = table.querySelectorAll("tr:not(:first-child)");

        // Add input fields to each row, skipping rows with 'category_title'
        rows.forEach(row => {
            if (row.querySelector(".category_title")) return; // Skip rows with 'category_title'

            const quantityCell = document.createElement("td");
            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.value = 0;
            quantityInput.min = 0;
            quantityInput.addEventListener("input", updateTotal);
            quantityCell.appendChild(quantityInput);
            row.appendChild(quantityCell);
        });

        // Add the total row
        const totalRow = document.createElement("tr");
        totalRow.innerHTML = `<td colspan="${headerRow.children.length - 1}"></td><td id="total-cell">Total: €0.00</td>`;
        table.appendChild(totalRow);

        window.totalCell = document.getElementById("total-cell");
    }
}

function updateTotal() {
    let total = 0;

    // Get all rows again for recalculating the total
    const rows = document.querySelectorAll(".data_wide_table tr:not(:first-child)");

    rows.forEach(row => {
        if (row.querySelector(".category_title")) return; // Skip rows with 'category_title'

        const basePriceElement = row.querySelector("td:nth-child(2) .first_currency");
        
        if (basePriceElement) {
            const basePriceText = basePriceElement.textContent;
            // Remove commas and parse the price
            const basePrice = parseFloat(basePriceText.replace("€", "").replace(/,/g, "").trim());

            const quantity = parseFloat(row.querySelector("td:last-child input").value) || 0;
            total += basePrice * quantity;
        }
    });

    totalCell.textContent = `Total: €${total.toFixed(2)}`;
}

// Function to toggle visibility of the added elements
function toggleVisibility(isVisible) {
    document.querySelectorAll('.quantity-header, td:last-child, #total-cell').forEach(el => {
        el.style.display = isVisible ? '' : 'none';
    });
}

// Listen for messages from the popup for visibility changes
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "toggleVisibility") {
        toggleVisibility(request.sliderOn);
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
