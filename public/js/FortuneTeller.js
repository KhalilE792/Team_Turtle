// Global variables
let savingGoal;
let weeklySavings = 100;
const result = document.getElementById("result");

// Function to calculate retirement years
function getYears() {
    savingGoal = prompt("How much do you want to save by retirement?");
    if(!isNaN(savingGoal) && savingGoal > 0) {
        result.innerText = "You can retire in " + calculateTime(parseInt(savingGoal)) + " years.";
    }
}

// Calculate time based on saving goal
function calculateTime(savingGoal) {
    return Math.floor((savingGoal/weeklySavings)/52);
}

// Calculate median of an array of values
function calculateMedian(values) {
    // Create a copy and sort the array
    const sortedValues = [...values].sort((a, b) => a - b);
    
    const middle = Math.floor(sortedValues.length / 2);
    
    if (sortedValues.length % 2 === 0) {
        // If even length, average the two middle values
        return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
    } else {
        // If odd length, return the middle value
        return sortedValues[middle];
    }
}

// Function to check if user is on track with their savings goals
function checkSavingsProgress(monthlySavingsTarget) {
    // Get the median spending from localStorage
    const medianSpending = parseFloat(localStorage.getItem('medianSpending') || '0');
    
    // Get annual income for additional context
    const savedData = JSON.parse(localStorage.getItem('financialData')) || [];
    if (savedData.length === 0) return "No data available";
    
    const latestData = savedData[savedData.length - 1];
    const monthlyIncome = parseInt(latestData.annualIncome) / 12;
    
    // Calculate what percentage of monthly income the savings target represents
    const savingsPercentage = (monthlySavingsTarget / monthlyIncome) * 100;
    
    // Calculate what percentage of monthly income the median spending represents
    const spendingPercentage = (medianSpending / monthlyIncome) * 100;
    
    // Check if user is on track based on their spending patterns
    if (medianSpending === 0) {
        return "No spending data available yet. Visit the Dashboard to generate data.";
    } else if (monthlySavingsTarget > monthlyIncome) {
        return "Your savings target exceeds your monthly income. Consider adjusting your goals or timeline.";
    } else if (medianSpending + monthlySavingsTarget > monthlyIncome * 0.9) {
        return "⚠️ CAUTION: Your typical spending plus savings target leaves little buffer in your budget.";
    } else if (spendingPercentage > 70) {
        return "⚠️ Your typical spending is high ("+spendingPercentage.toFixed(0)+"% of income). You may struggle to meet your savings goal.";
    } else if (savingsPercentage > 40) {
        return "🔍 Your savings target is ambitious ("+savingsPercentage.toFixed(0)+"% of income), but possible with discipline.";
    } else {
        return "✅ Based on your spending patterns, your savings goal appears achievable.";
    }
}

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

// EVENT LISTENERS

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
    
    // Add the savings progress element to the update modal if it doesn't exist
    const resultContainer = document.querySelector('.result-container');
    if (resultContainer && !document.getElementById('savings-progress-container')) {
        const savingsProgressDiv = document.createElement('div');
        savingsProgressDiv.id = 'savings-progress-container';
        savingsProgressDiv.className = 'result-group highlighted';
        savingsProgressDiv.innerHTML = `
            <span class="result-label">Savings Progress:</span>
            <span id="savings-progress" class="result-value">No data available</span>
        `;
        
        // Insert before the fortune-result div
        const fortuneResultDiv = document.querySelector('.fortune-result');
        resultContainer.insertBefore(savingsProgressDiv, fortuneResultDiv);
    }
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
    
    // Get the savings progress status based on median spending data from dashboard
    const savingsProgressStatus = checkSavingsProgress(monthlySavingsNeeded);
    
    // Update the modal with the current data
    document.getElementById('result-date').textContent = formattedDate;
    document.getElementById('result-income').textContent = '$' + Number(latestData.annualIncome).toLocaleString();
    document.getElementById('result-year').textContent = `${latestData.retirementYear} (${yearsUntilRetirement} years from now)`;
    document.getElementById('result-savings').textContent = '$' + Number(latestData.targetSavings).toLocaleString();
    document.getElementById('result-monthly').textContent = '$' + monthlySavingsNeeded.toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('result-fortune').textContent = calculateFortuneMessage(latestData.annualIncome, latestData.retirementYear, latestData.targetSavings);
    
    // Update the savings progress status
    if (document.getElementById('savings-progress')) {
        document.getElementById('savings-progress').textContent = savingsProgressStatus;
    }
    
    // Show the update modal
    updateModal.style.display = "block";
});