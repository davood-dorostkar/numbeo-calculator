const urlPattern = /^https:\/\/www\.numbeo\.com\/cost-of-living\/in\/.+/;

function storeQuantities() {
    const quantities = {};
    const rows = document.querySelectorAll(".data_wide_table tr");

    rows.forEach((row, index) => {
        if (row.querySelector(".category_title")) return; 

        const quantityInput = row.querySelector("td:last-child input");
        if (quantityInput) {
            quantities[index] = quantityInput.value;
        }
    });

    chrome.storage.sync.set({ "quantities": quantities });
}

function loadQuantities() {
    chrome.storage.sync.get("quantities", function (data) {
        const quantities = data.quantities || {};

        const rows = document.querySelectorAll(".data_wide_table tr");

        rows.forEach((row, index) => {
            if (row.querySelector(".category_title")) return;

            const quantityInput = row.querySelector("td:last-child input");
            if (quantityInput && quantities[index] !== undefined) {
                quantityInput.value = quantities[index]; 
            }
        });
    });
}

function addColumnAndTotal() {
    const table = document.querySelector(".data_wide_table");
    if (!table) return;

    const style = document.createElement('style');
    style.textContent = `.highlight-row {background-color: #ffcc00;}`;

    document.head.appendChild(style);

    if (!table.querySelector('.quantity-header')) {
        const headerRow = table.querySelector("tr");
        const quantityHeader = document.createElement("th");
        quantityHeader.classList.add('quantity-header');
        quantityHeader.textContent = "Quantity";
        headerRow.appendChild(quantityHeader);
        quantityHeader.style.width = "20px";

        const rows = table.querySelectorAll("tr");

        rows.forEach((row, index) => {
            if (shouldSkipRow(row)) return;

            const quantityCell = document.createElement("td");
            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.value = 0;
            quantityInput.min = 0;
            quantityInput.addEventListener("input", function () {
                updateTotal();
                storeQuantities();
            });

            quantityInput.addEventListener("focus", function () {
                row.querySelector("td").classList.add("highlight-row");
            });

            quantityInput.addEventListener("blur", function () {
                row.querySelector("td").classList.remove("highlight-row");
            });

            quantityCell.appendChild(quantityInput);
            row.appendChild(quantityCell);
            quantityCell.style.width = "20px";
        });
        window.ignoreRows = false;

        const totalRow = document.createElement("tr");
        totalRow.innerHTML = `<td colspan="${headerRow.children.length - 1}"></td><td id="total-cell">Total: €0.00</td>`;
        table.appendChild(totalRow);

        window.totalCell = document.getElementById("total-cell");
        totalCell.style.fontSize = "20px"; 
        totalCell.style.fontWeight = "bold"; 
        totalCell.style.width = "20px";
    }

    loadQuantities();
    updateTotal();
}

function shouldSkipRow(row) {
    const categoryTitle = row.querySelector(".category_title");

    if (categoryTitle) {
        const titleText = categoryTitle.textContent.trim();
        if (titleText === "Buy Apartment Price" || titleText === "Salaries And Financing") {
            window.ignoreRows = true;
        }
        else {
            window.ignoreRows = false;
        }
        return true;
    }
    else {
        const iTotal = row.querySelector('td#total-cell');
        const isCar = row.querySelector('td').textContent.includes('New Car');
        if (window.ignoreRows || isCar || iTotal) {
            return true;
        }
    }
    return false;
}

function updateTotal() {
    let total = 0;

    const rows = document.querySelectorAll(".data_wide_table tr");
    const currency = rows[1].querySelector("td:nth-child(2) .first_currency").textContent.match(/([\d.]+)\s*([\p{Sc}]+)/u)[2];
    rows.forEach(row => {
        if (shouldSkipRow(row)) return; 

        const basePriceElement = row.querySelector("td:nth-child(2) .first_currency");

        if (basePriceElement) {
            const basePriceText = basePriceElement.textContent;
            let basePrice;
            try {
                basePrice = parseFloat(basePriceText.replace(/,/g, "").match(/([\d.]+)\s*([\p{Sc}]+)/u)[1].trim());
            } catch (error) {
                return; 
            }

            const quantity = parseFloat(row.querySelector("td:last-child input").value) || 0;
            total += basePrice * quantity;
        }
    });
    window.ignoreRows = false;
    totalCell.textContent = `Total: ${currency} ${total.toFixed(2)}`;
}

function toggleVisibility(isVisible) {
    document.querySelectorAll('.quantity-header, td:last-child, #total-cell').forEach(el => {
        el.style.display = isVisible ? '' : 'none';
    });
}

function resetQuantities() {
    const rows = document.querySelectorAll(".data_wide_table tr");

    rows.forEach(row => {
        if (shouldSkipRow(row)) return;

        const quantityInput = row.querySelector("td:last-child input");
        if (quantityInput) {
            quantityInput.value = 0;
        }
    });
    window.ignoreRows = false;

    chrome.storage.sync.set({ "quantities": {} }, function () {
        updateTotal();
    });
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "toggleVisibility") {
        toggleVisibility(request.sliderOn);
    }
    else if (request.action === "resetQuantities") {
        resetQuantities();
    }
});

if (urlPattern.test(window.location.href)) {
    addColumnAndTotal();
}

chrome.storage.sync.get("sliderOn", function (data) {
    const sliderOn = data.sliderOn !== undefined ? data.sliderOn : false;
    toggleVisibility(sliderOn);  
});

chrome.storage.sync.get("quantities", function (data) {
    const quantities = data.quantities || {};

    const rows = document.querySelectorAll(".data_wide_table tr");

    rows.forEach(row => {
        if (row.querySelector(".category_title")) return;

        const rowIndex = Array.from(rows).indexOf(row);

        const quantityInput = row.querySelector("td:last-child input");
        if (quantityInput) {
            const storedQuantity = quantities[rowIndex] || 0;
            quantityInput.value = storedQuantity;
        }
    });

    updateTotal();
});