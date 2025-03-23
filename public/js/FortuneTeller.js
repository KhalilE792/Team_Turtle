// Fortune patterns based on spending habits
const fortunePatterns = {
    highSpending: [
        "I sense a need for financial restraint in your future. Consider creating a budget.",
        "The stars suggest it's time to review your spending habits.",
        "A period of saving approaches. Embrace it for future prosperity."
    ],
    moderateSpending: [
        "Your balanced approach to finances will bring rewards.",
        "Continue your mindful spending, and opportunities will arise.",
        "Your financial wisdom is growing. Stay on this path."
    ],
    lowSpending: [
        "Don't let fear hold you back. Some calculated risks may benefit you.",
        "A worthy investment opportunity may present itself soon.",
        "Your frugal nature serves you well, but remember to invest in yourself."
    ]
};

// Initialize fortune history
let fortuneHistory = [];

// Function to analyze spending patterns from recent transactions
async function analyzeSpendingPattern() {
    try {
        // Fetch last week's transactions
        const response = await fetch('/transactions/week');
        const transactions = await response.json();
        
        // Calculate total spending
        let totalSpending = transactions.reduce((total, trans) => {
            const withdrawal = parseFloat(trans.withdrawals.replace(/,/g, '')) || 0;
            return total + withdrawal;
        }, 0);

        // Determine spending pattern
        if (totalSpending > 1000) {
            return 'highSpending';
        } else if (totalSpending > 500) {
            return 'moderateSpending';
        } else {
            return 'lowSpending';
        }
    } catch (error) {
        console.error('Error analyzing spending:', error);
        return 'moderateSpending'; // Default fallback
    }
}

// Function to generate a fortune
async function generateFortune() {
    const spendingPattern = await analyzeSpendingPattern();
    const fortunes = fortunePatterns[spendingPattern];
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    return fortunes[randomIndex];
}

// Function to animate the crystal ball
function animateCrystalBall() {
    const crystalBall = document.querySelector('.crystal-ball');
    crystalBall.classList.add('shake');
    
    // Remove the animation class after it completes
    setTimeout(() => {
        crystalBall.classList.remove('shake');
    }, 500);
}

// Function to update fortune history
function updateFortuneHistory(fortune) {
    fortuneHistory.unshift({
        fortune: fortune,
        timestamp: new Date().toLocaleString()
    });
    
    // Keep only last 5 fortunes
    fortuneHistory = fortuneHistory.slice(0, 5);
    
    // Update the display
    const historyContainer = document.getElementById('fortuneHistory');
    historyContainer.innerHTML = fortuneHistory
        .map(item => `
            <div class="history-item">
                <small>${item.timestamp}</small><br>
                ${item.fortune}
            </div>
        `)
        .join('');
}

// Event listener for the fortune button
document.getElementById('getFortune').addEventListener('click', async () => {
    const fortuneText = document.getElementById('fortuneText');
    const button = document.getElementById('getFortune');
    
    // Disable button during animation
    button.disabled = true;
    
    // Show loading state
    fortuneText.textContent = "Reading the financial energies...";
    
    // Animate crystal ball
    animateCrystalBall();
    
    // Generate fortune with a delay for effect
    setTimeout(async () => {
        const fortune = await generateFortune();
        fortuneText.textContent = fortune;
        updateFortuneHistory(fortune);
        button.disabled = false;
    }, 1000);
});

// Initialize with a default message
document.addEventListener('DOMContentLoaded', () => {
    const fortuneText = document.getElementById('fortuneText');
    fortuneText.textContent = "Ask about your financial future...";
});
