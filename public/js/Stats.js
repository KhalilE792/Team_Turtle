// Chart configuration
let chart;
let data = {};

// All your existing JavaScript functions from Stats.html
function processTransactionsFromMongoDB(transactions) {
    // ... existing code ...
}

function generateFallbackData() {
    // ... existing code ...
}

function loadJSONData() {
    const timeSelector = document.getElementById('timeSelector').value;
    let endpoint;
    
    switch(timeSelector) {
        case 'week':
            endpoint = '/transactions/week';
            break;
        case 'month':
            const date = new Date();
            const month = date.toLocaleString('en', { month: 'short' });
            const year = date.getFullYear();
            endpoint = `/transactions/month/${month}/${year}`;
            break;
        case 'year':
            const currentYear = new Date().getFullYear();
            endpoint = `/transactions/year/${currentYear}`;
            break;
        default:
            endpoint = '/transactions';
    }

    // Make sure to use the full URL path
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(transactions => {
            // ... rest of your code
        })
        .catch(error => {
            console.error('Error:', error);
            // ... error handling
        });
}

// ... rest of your functions ...

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadJSONData();
}); 