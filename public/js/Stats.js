// Chart configuration
let chart;
let data = {};

/**
 * Process MongoDB transaction data into chart format
 * @param {Array} transactions - Array of transaction objects from MongoDB
 * @return {Object} Processed data in the format needed for the chart
 */
function processTransactionsFromMongoDB(transactions) {
    console.log("Processing MongoDB transactions:", transactions);

    const result = {
        week: { 
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
            values: [0, 0, 0, 0, 0, 0, 0] 
        },
        month: { 
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], 
            values: [0, 0, 0, 0] 
        },
        year: { 
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
            values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] 
        }
    };
            
    transactions.forEach(transaction => {
        try {
            // Parse the date (DD-MMM-YY format)
            const [day, month, year] = transaction.date.split('-');
            const fullYear = '20' + year;
            const date = new Date(`${month} ${day}, ${fullYear}`);

            // Get amount from either withdrawals or deposits
            let amountTotal = 0;
            let amountW = 0;
            let amountD = 0;
            
            // Check withdrawals first
            if (transaction.withdrawals && transaction.withdrawals !== '00.00') {
                // Remove commas and convert to number
                amountW = parseFloat(transaction.withdrawals.replace(/,/g, ''));
                console.log(`Found withdrawal amount: ${amountW} for date: ${transaction.date}`);
            }
            
            // If no withdrawal, check deposits
            if (amountD === 0 && transaction.deposits && transaction.deposits !== '00.00') {
                // Remove commas and convert to number
                amountD = parseFloat(transaction.deposits.replace(/,/g, ''));
                console.log(`Found deposit amount: ${amountD} for date: ${transaction.date}`);
            }

            amountTotal = amountD - amountW

            // Update weekly data
            const dayOfWeek = date.getDay();
            const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            result.week.values[adjustedDayOfWeek] += amountD - amountW;
            console.log(`Added ${amountTotal} to day ${adjustedDayOfWeek} (${result.week.labels[adjustedDayOfWeek]})`);

            // Update monthly data
            const weekOfMonth = Math.min(3, Math.floor((parseInt(day) - 1) / 7));
            result.month.values[weekOfMonth] += amountD - amountW;
            console.log(`Added ${amountTotal} to week ${weekOfMonth + 1}`);

            // Update yearly data
            const monthIndex = date.getMonth();
            result.year.values[monthIndex] += amountD - amountW;
            console.log(`Added ${amountTotal} to month ${monthIndex} (${result.year.labels[monthIndex]})`);

        } catch (error) {
            console.error("Error processing transaction:", error, transaction);
        }
    });
    
    // Log final totals
    console.log("Final weekly totals:", result.week.values);
    console.log("Final monthly totals:", result.month.values);
    console.log("Final yearly totals:", result.year.values);
    
    return result;
}

function generateFallbackData() {
    console.log("Generating fallback data");
    return {
        day: {
            labels: ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
            values: [0, 0, 4.99, 12.50, 24.75, 8.99, 35.40, 42.15]
        },
        week: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            values: [45.20, 28.75, 63.40, 52.18, 89.95, 124.50, 37.80]
        },
        month: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            values: [285.65, 342.18, 276.90, 304.25]
        },
        year: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            values: [1245.80, 1138.42, 1352.16, 1287.35, 1425.68, 1532.90, 1628.45, 1594.20, 1375.42, 1289.65, 1485.75, 1832.50]
        }
    };
}

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

function loadJSONData() {
    console.log("1. Starting loadJSONData");
    const timeSelector = document.getElementById('timeSelector').value;
    let endpoint = '/transactions'; // Changed to always use the main endpoint
    
    console.log("2. Fetching from endpoint:", endpoint);

    fetch(endpoint)
        .then(response => {
            console.log("3. Got response:", response.status);
            if (!response.ok) {
                if (response.status === 401) {
                    // User is not authenticated, redirect to login
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Database response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(transactions => {
            console.log("4. Received transactions:", transactions?.length);
            if (!transactions || transactions.length === 0) {
                console.warn("No transactions found, using fallback data");
                data = generateFallbackData();
            } else {
                // The transactions are already filtered by user on the server side
                data = processTransactionsFromMongoDB(transactions);
            }
            console.log("5. Processed data:", data);
            updateChartDisplay();
            
            // Always calculate and store monthly median for Fortune Teller
            storeMonthlyMedianForFortune();
        })
        .catch(error => {
            console.error('Error loading from database:', error);
            data = generateFallbackData();
            updateChartDisplay();
            
            // Calculate monthly median even with fallback data
            storeMonthlyMedianForFortune();
        });
}

// Function to calculate and store monthly median regardless of current view
function storeMonthlyMedianForFortune() {
    if (data && data.month && data.month.values) {
        const monthlyStats = calculateStats(data.month.values);
        const monthlyMedian = monthlyStats.median;
        
        // Store monthly median specifically for Fortune Teller
        localStorage.setItem('monthlyMedianSpending', monthlyMedian.toFixed(2));
        console.log("Monthly median spending saved for Fortune Teller:", monthlyMedian.toFixed(2));
    }
}

function calculateStats(values) {
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    const highest = Math.max(...values);
    const total = sum;
    const median = calculateMedian(values);
            
    return {
        average,
        highest,
        total,
        median
    };
}

function updateStatsDisplay(stats) {
    document.getElementById('averageSpending').textContent = '$' + stats.average.toFixed(2);
    document.getElementById('highestSpending').textContent = '$' + stats.highest.toFixed(2);
    document.getElementById('totalSpending').textContent = '$' + stats.total.toFixed(2);
    
    // Get the current time period
    const selectedPeriod = document.getElementById('timeSelector').value;
    
    // Store the median spending based on period
    if (selectedPeriod === 'week') {
        // Store weekly median spending specifically for Moneygotchi
        localStorage.setItem('weeklyMedianSpending', stats.median.toFixed(2));
        console.log("Weekly median spending saved:", stats.median.toFixed(2));
        
        // Dispatch an event to notify Moneygotchi that data has changed
        try {
            const event = new CustomEvent('weeklyDataUpdated');
            document.dispatchEvent(event);
            console.log("Weekly data update event dispatched");
        } catch (error) {
            console.error("Error dispatching event:", error);
        }
    }
    
    // For backward compatibility - keep the general medianSpending
    localStorage.setItem('medianSpending', stats.median.toFixed(2));
    console.log(`${selectedPeriod} median spending saved to localStorage:`, stats.median.toFixed(2));
}

function updateChartDisplay() {
    console.log("6. Starting updateChartDisplay");
    const selectedPeriod = document.getElementById('timeSelector').value;
    console.log("7. Selected period:", selectedPeriod);
    console.log("8. Current data:", data);
    
    if (!chart) {
        console.log("9. No chart exists, initializing...");
        initChart();
        return;
    }

    const titleText = selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1) + 'ly Spending';
    chart.options.plugins.title.text = titleText;
    
    console.log("10. Updating chart with:", {
        labels: data[selectedPeriod].labels,
        values: data[selectedPeriod].values
    });
    
    chart.data.labels = data[selectedPeriod].labels;
    chart.data.datasets[0].data = data[selectedPeriod].values;
    
    const stats = calculateStats(data[selectedPeriod].values);
    updateStatsDisplay(stats);
    
    chart.update();
    console.log("11. Chart update complete");
}

function initChart() {
    console.log("12. Starting initChart");
    const ctx = document.getElementById('dataChart').getContext('2d');
    if (!ctx) {
        console.error("Could not get chart context");
        return;
    }
            
    const initialPeriod = 'week';
    console.log("13. Initial data:", data[initialPeriod]);
    
    const initialStats = calculateStats(data[initialPeriod].values);
    updateStatsDisplay(initialStats);
            
    const averageLinePlugin = {
        id: 'averageLine',
        afterDatasetsDraw(chart, args, options) {
            const { ctx, chartArea: { top, bottom, left, right }, scales: { y } } = chart;
                    
            const values = chart.data.datasets[0].data;
            const average = values.reduce((acc, val) => acc + val, 0) / values.length;
                    
            const yPos = y.getPixelForValue(average);
                    
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(left, yPos);
            ctx.lineTo(right, yPos);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
            ctx.setLineDash([6, 6]);
            ctx.stroke();
                    
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('Average: $' + average.toFixed(2), right, yPos - 5);
            ctx.restore();
        }
    };
            
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data[initialPeriod].labels,
            datasets: [{
                label: 'Spending',
                data: data[initialPeriod].values,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
                pointHoverBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        },
                        font: {
                            size: 14,
                            weight: '500'
                        },
                        padding: 10,
                        color: '#666'
                    },
                    border: {
                        dash: [4, 4]
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 14,
                            weight: '500'
                        },
                        padding: 10,
                        color: '#666'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Weekly Spending',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    },
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 15,
                    cornerRadius: 6,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '$' + context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            elements: {
                line: {
                    tension: 0.4
                }
            },
            layout: {
                padding: {
                    top: 20,
                    right: 25,
                    bottom: 10,
                    left: 10
                }
            }
        },
        plugins: [averageLinePlugin]
    });
}

document.getElementById('timeSelector').addEventListener('change', loadJSONData);

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("14. DOM Content Loaded");
    loadJSONData();
});