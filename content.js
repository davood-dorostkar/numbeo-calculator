// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "addQuantityColumn") {
        // Select the target table
        const table = document.querySelector(".data_wide_table.new_bar_table");

        if (!table) {
            sendResponse({ status: "failure", message: "Table not found on the page." });
            return;
        }

        // Add a new column header for Quantity
        const headerRow = table.querySelector("tr");
        const newHeader = document.createElement("th");
        newHeader.textContent = "Quantity";
        headerRow.appendChild(newHeader);

        // Add a new cell with a text box in each row and calculate the total
        const rows = table.querySelectorAll("tr:not(:first-child)");
        rows.forEach((row) => {
            // Create the quantity input field
            const newCell = document.createElement("td");
            const inputBox = document.createElement("input");
            inputBox.type = "number";
            inputBox.value = "0";
            inputBox.style.width = "50px";
            inputBox.style.textAlign = "center";
            
            // Append the input box to the cell
            newCell.appendChild(inputBox);
            row.appendChild(newCell);

            // Add an event listener to recalculate the total when quantity changes
            inputBox.addEventListener("input", updateTotal);
        });

        // Add a row below the table for displaying the total
        const totalRow = document.createElement("tr");
        const totalCell = document.createElement("td");
        totalCell.colSpan = headerRow.children.length; // Span the total cell across the entire table
        totalCell.style.textAlign = "right";
        totalCell.style.fontWeight = "bold";
        totalCell.textContent = "Total: €0.00";
        totalRow.appendChild(totalCell);
        table.appendChild(totalRow);

        // Function to update the total based on quantities and base prices
        function updateTotal() {
            let total = 0;
        
            rows.forEach((row) => {
                // Get the base price from the second <td> in the row
                const basePriceElement = row.querySelector("td:nth-child(2) .first_currency");
                
                // Only proceed if the base price element exists
                if (basePriceElement) {
                    const basePriceText = basePriceElement.textContent;
                    const basePrice = parseFloat(basePriceText.replace("€", "").trim());
        
                    // Get the quantity from the input field in the new column
                    const quantity = parseFloat(row.querySelector("td:last-child input").value) || 0;
        
                    // Calculate the subtotal for this row and add it to the total
                    total += basePrice * quantity;
                }
            });
        
            // Update the total display
            totalCell.textContent = `Total: €${total.toFixed(2)}`;
        }
        

        // Send a success response back to popup.js
        sendResponse({ status: "success" });
    }
});
