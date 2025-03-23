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

// Function to check if user is on track with their savings goals - with mystical language
function checkSavingsProgress(monthlySavingsTarget) {
    // Get the monthly median spending from localStorage
    const medianSpending = parseFloat(localStorage.getItem('monthlyMedianSpending') || '0');
    
    // Get annual income for additional context
    const savedData = JSON.parse(localStorage.getItem('financialData')) || [];
    if (savedData.length === 0) return "The crystal orb awaits your financial essence...";
    
    const latestData = savedData[savedData.length - 1];
    const monthlyIncome = parseInt(latestData.annualIncome) / 12;
    
    // Calculate what percentage of monthly income the savings target represents
    const savingsPercentage = (monthlySavingsTarget / monthlyIncome) * 100;
    
    // Calculate what percentage of monthly income the median spending represents
    const spendingPercentage = (medianSpending / monthlyIncome) * 100;
    
    // Check if user is on track based on their spending patterns - with mystical language
    if (medianSpending === 0) {
        return "The celestial signs cannot yet read your spending patterns. Visit the Dashboard to reveal your financial aura.";
    } else if (monthlySavingsTarget > monthlyIncome) {
        return "The stars show your desires exceed your mortal resources. Consider realigning your cosmic journey.";
    } else if (medianSpending + monthlySavingsTarget > monthlyIncome * 0.9) {
        return "⚠️ The mystic energies reveal tension in your financial constellation. Your path leaves little room for fate's unexpected turns.";
    } else if (spendingPercentage > 70) {
        return "⚠️ The crystal shows your treasures flow freely ("+spendingPercentage.toFixed(0)+"% of your wealth). The spirits warn of challenges in your quest.";
    } else if (savingsPercentage > 40) {
        return "🔮 The moon illuminates an ambitious journey ("+savingsPercentage.toFixed(0)+"% of your resources). With discipline, the stars shall align in your favor.";
    } else {
        return "✨ The mystic energies are in harmony! Your chosen path appears blessed by the prosperity spirits.";
    }
}

// Enhanced function to calculate fortune message with mystical theme
function calculateFortuneMessage(income, retirementYear, targetSavings) {
    const savingsGoal = parseInt(targetSavings);
    const annualIncome = parseInt(income);
    const currentYear = new Date().getFullYear();
    const yearsUntilRetirement = parseInt(retirementYear) - currentYear;
    
    // Array of mystical fortune messages
    const fortuneMessages = {
        ambitious: [
            "The crystal reveals a grand vision that requires more celestial energy than your current path provides. The spirits whisper of seeking additional streams of prosperity.",
            "The mystic waters show an ambitious journey. The celestial alignment suggests multiple paths of fortune must converge for your desire to manifest.",
            "The ancient runes show your ambition reaches to the stars. Your destiny will require the blessing of multiple prosperity sources to realize such grand visions.",
            "The crystal ball swirls with visions of your desired abundance. The spirits counsel that additional magical channels of wealth must be found to reach such heights."
        ],
        longTerm: [
            "The wise owl sees your early preparations. Your patient journey through life's seasons will be rewarded with golden sunsets and abundant treasure.",
            "The ancient spirits smile upon your foresight. Time is the magic that will multiply your treasures into a magnificent constellation of wealth.",
            "The crystal ball shows a clear path to prosperity. Your early wisdom plants seeds that will grow into a forest of abundance in the cosmic cycles to come.",
            "The celestial bodies align in your favor. Your patience will transform modest offerings into magnificent wealth as the moon completes its many cycles."
        ],
        midTerm: [
            "The mystic winds favor your journey. Focus your energies on vessels that multiply your treasures swiftly in the seasons ahead.",
            "The enchanted compass points to opportunities hidden in plain sight. Seek investments blessed by the prosperity spirits before the next solstice.",
            "The crystal shows neither storm nor clear skies. Your path requires balance between risk and caution as you navigate the celestial currents.",
            "The moon illuminates a path that requires swift but measured steps. Diversify your magical investments to please the varied spirits of fortune."
        ],
        shortTerm: [
            "The hourglass reveals limited sands, but powerful magic still exists. Focus on high-yield mystical investments blessed by fortune's swift hand.",
            "The ancient runes speak of concentrated efforts. Your determination can still manifest abundant rewards if you follow the brightest stars.",
            "The crystal reveals that aggressive magical investments may be needed. Consult with financial wizards for guidance through this accelerated journey.",
            "Time's waters flow quickly, but the spirits suggest all is not lost. Bold actions today create tomorrow's treasures, even as the cosmic clock ticks forward."
        ]
    };
    
    // Randomly select a message based on conditions
    let category;
    if (savingsGoal / annualIncome > 15) {
        category = 'ambitious';
    } else if (yearsUntilRetirement > 20) {
        category = 'longTerm';
    } else if (yearsUntilRetirement > 10) {
        category = 'midTerm';
    } else {
        category = 'shortTerm';
    }
    
    const messages = fortuneMessages[category];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
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
            <span class="result-label">The Crystal's Vision:</span>
            <span id="savings-progress" class="result-value">The crystal awaits your essence...</span>
        `;
        
        // Insert before the fortune-result div
        const fortuneResultDiv = document.querySelector('.fortune-result');
        resultContainer.insertBefore(savingsProgressDiv, fortuneResultDiv);
    }
    
    // Add mystical glow animation to crystal ball
    const crystalBall = document.querySelector('.crystal-ball');
    if (crystalBall) {
        crystalBall.classList.add('idle-glow');
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
    
    // Add mystical effect
    animateCrystalBall('pulse');
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

// Function to animate the crystal ball
function animateCrystalBall(effect) {
    const crystalBall = document.querySelector('.crystal-ball');
    const crystalImage = document.querySelector('.crystal-image');
    
    if (!crystalBall) return;
    
    if (effect === 'pulse') {
        // Add quick pulse effect
        crystalBall.classList.add('quick-pulse');
        setTimeout(() => {
            crystalBall.classList.remove('quick-pulse');
        }, 1000);
    } else if (effect === 'reveal') {
        // Add more dramatic effect for fortune reveal
        crystalBall.classList.add('fortune-reveal');
        
        // Also animate the image inside
        if (crystalImage) {
            crystalImage.classList.add('image-reveal');
            setTimeout(() => {
                crystalImage.classList.remove('image-reveal');
            }, 3000);
        }
        
        setTimeout(() => {
            crystalBall.classList.remove('fortune-reveal');
        }, 3000);
    }
}

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

// Display themed success message instead of alert
function showMysticalMessage(message) {
    // Check if notification element exists
    let notification = document.getElementById('mystical-notification');
    
    // Create it if it doesn't exist
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'mystical-notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after delay
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

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
    
    // Play mystical effect
    animateCrystalBall('reveal');
    
    // Display themed success message
    showMysticalMessage("✨ The crystal has absorbed your financial essence! ✨");
    
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
        showMysticalMessage("The crystal orb needs your financial essence first. Please share your information.");
        return;
    }
    
    // Add mystical animation to crystal ball
    animateCrystalBall('reveal');
    
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
    
    // Update the modal with the current data - using mystical language
    document.getElementById('result-date').textContent = `${formattedDate} (Moon's ${dateSubmitted.getDate()}th cycle)`;
    document.getElementById('result-income').textContent = '$' + Number(latestData.annualIncome).toLocaleString() + ' celestial treasures';
    document.getElementById('result-year').textContent = `${latestData.retirementYear} (${yearsUntilRetirement} cosmic cycles hence)`;
    document.getElementById('result-savings').textContent = '$' + Number(latestData.targetSavings).toLocaleString() + ' mystic wealth';
    document.getElementById('result-monthly').textContent = '$' + monthlySavingsNeeded.toLocaleString(undefined, {maximumFractionDigits: 2}) + ' lunar offerings';
    document.getElementById('result-fortune').textContent = calculateFortuneMessage(latestData.annualIncome, latestData.retirementYear, latestData.targetSavings);
    
    // Update the mystical title for the modal
    document.querySelector('#update-modal h2').textContent = "The Crystal Ball Reveals Your Destiny";
    
    // Update the savings progress status
    if (document.getElementById('savings-progress')) {
        document.getElementById('savings-progress').textContent = savingsProgressStatus;
    }
    
    // Show the update modal with a short delay for effect
    setTimeout(() => {
        updateModal.style.display = "block";
    }, 800);
});