
        // Clear form fields when page loads
        window.addEventListener('load', function() {
            document.getElementById('finance-form').reset();
            
            // Extra step to ensure fields are cleared (for stubborn browsers)
            document.getElementById('annual-income').value = '';
            document.getElementById('retirement-year').value = '';
            document.getElementById('target-savings').value = '';
            
            // Set default year value to 10 years from now
            const defaultYear = new Date().getFullYear() + 10;
            document.getElementById('retirement-year').placeholder = `e.g., ${defaultYear}`;
        });
        
        // Modal functionality
        const infoModal = document.getElementById("info-modal");
        const updateModal = document.getElementById("update-modal");
        const infoButton = document.getElementById("info-button");
        const updateButton = document.getElementById("update-button");
        const closeButtons = document.querySelectorAll(".close-button");
        const closeUpdateButton = document.getElementById("close-update");
        
        // Open info modal when Information button is clicked
        infoButton.addEventListener("click", function() {
            // Clear form every time modal is opened
            document.getElementById('finance-form').reset();
            infoModal.style.display = "block";
        });
        
        // Close both modals when X is clicked
        closeButtons.forEach(button => {
            button.addEventListener("click", function() {
                infoModal.style.display = "none";
                updateModal.style.display = "none";
            });
        });
        
        // Close update modal when Close button is clicked
        closeUpdateButton.addEventListener("click", function() {
            updateModal.style.display = "none";
        });
        
        // Close modals when clicking outside of them
        window.addEventListener("click", function(event) {
            if (event.target === infoModal) {
                infoModal.style.display = "none";
            }
            if (event.target === updateModal) {
                updateModal.style.display = "none";
            }
        });
        
        // Spinner buttons functionality
        document.querySelectorAll('.spinner-up').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent form submission
                const input = this.closest('.input-with-spinner').querySelector('input');
                input.value = (parseInt(input.value) || 0) + 1;
                input.dispatchEvent(new Event('change'));
            });
        });
        
        document.querySelectorAll('.spinner-down').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent form submission
                const input = this.closest('.input-with-spinner').querySelector('input');
                const currentValue = parseInt(input.value) || 0;
                if (currentValue > 0) {
                    input.value = currentValue - 1;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });
        
        // Handle form submission - Store data in localStorage
        document.getElementById("finance-form").addEventListener("submit", function(event) {
            event.preventDefault();
            
            // Get form values
            const income = document.getElementById("annual-income").value;
            const retirementYear = document.getElementById("retirement-year").value;
            const targetSavings = document.getElementById("target-savings").value;
            
            // Create financial data object
            const financialData = {
                annualIncome: income,
                retirementYear: retirementYear,
                targetSavings: targetSavings,
                dateSubmitted: new Date().toISOString()
            };
            
            // Get existing data from localStorage or initialize empty array
            let savedData = JSON.parse(localStorage.getItem('financialData')) || [];
            
            // Add new data to the array
            savedData.push(financialData);
            
            // Save updated array back to localStorage
            localStorage.setItem('financialData', JSON.stringify(savedData));
            
            // Display success message
            alert("Your financial information has been saved!");
            
            // Reset the form
            document.getElementById('finance-form').reset();
            
            // Close the modal
            infoModal.style.display = "none";
        });

        // Update button functionality - Retrieve and display data from localStorage
        document.getElementById("update-button").addEventListener("click", function() {
            // Get data from localStorage
            const savedData = JSON.parse(localStorage.getItem('financialData')) || [];
            
            if (savedData.length === 0) {
                alert("No financial data found. Please submit your information first.");
                return;
            }
            
            // Get the most recent entry
            const latestData = savedData[savedData.length - 1];
            
            // Format date for display
            const dateSubmitted = new Date(latestData.dateSubmitted);
            const formattedDate = dateSubmitted.toLocaleDateString();
            
            // Calculate years until retirement
            const currentYear = new Date().getFullYear();
            const yearsUntilRetirement = latestData.retirementYear - currentYear;
            
            // Calculate monthly savings needed
            const monthsUntilRetirement = yearsUntilRetirement * 12;
            let monthlySavingsNeeded = 0;
            
            if (monthsUntilRetirement > 0) {
                monthlySavingsNeeded = parseInt(latestData.targetSavings) / monthsUntilRetirement;
            } else {
                monthlySavingsNeeded = parseInt(latestData.targetSavings); // If already at or past retirement year
            }
            
            // Update the modal with the current data
            document.getElementById('result-date').textContent = formattedDate;
            document.getElementById('result-income').textContent = '$' + Number(latestData.annualIncome).toLocaleString();
            document.getElementById('result-year').textContent = `${latestData.retirementYear} (${yearsUntilRetirement} years from now)`;
            document.getElementById('result-savings').textContent = '$' + Number(latestData.targetSavings).toLocaleString();
            document.getElementById('result-monthly').textContent = '$' + monthlySavingsNeeded.toLocaleString(undefined, {maximumFractionDigits: 2});
            document.getElementById('result-fortune').textContent = calculateFortuneMessage(latestData.annualIncome, latestData.retirementYear, latestData.targetSavings);
            
            // Show the update modal
            updateModal.style.display = "block";
        });

        // Helper function to calculate fortune message
        function calculateFortuneMessage(income, retirementYear, targetSavings) {
            const savingsGoal = parseInt(targetSavings);
            const annualIncome = parseInt(income);
            const currentYear = new Date().getFullYear();
            const yearsUntilRetirement = parseInt(retirementYear) - currentYear;
            
            if (savingsGoal / annualIncome > 20) {
                return "The stars suggest you may need additional income sources to reach your goal.";
            } else if (yearsUntilRetirement > 20) {
                return "Early planning brings abundant rewards. Your path to financial freedom is clear.";
            } else {
                return "It's never too late to secure your future. Focus on high-yield investments.";
            }
        }