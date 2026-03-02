// Global variables
let isLoggedIn = false; 
let predictionChartInstance; 

// Tab navigation functions
function openTab(event, tabId) {
    // Restrict access to specific features if not logged in
    if ((tabId === 'insight' || tabId === 'prediction' || tabId === 'disease-tab') && !isLoggedIn) {
         alert("Please log in to access this section.");
         return; 
     }

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// Update username display
function updateUsernameDisplay(username) {
    const accountUsername = document.getElementById('account-username');
    if (username) {
        accountUsername.textContent = username;
        accountUsername.style.display = 'block';
    } else {
        accountUsername.textContent = '';
        accountUsername.style.display = 'none';
    }
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Set default tab
    document.getElementById("about").classList.add("active");
    
    // Category selection handler (Matches app.py COMMODITY_PRICE_RANGES)
    document.getElementById('category').addEventListener('change', function() {
        const category = this.value;
        const varietySelect = document.getElementById('variety');
        const varietySection = document.getElementById('variety-section');
        varietySelect.innerHTML = '';

        let items = [];
        if (category === 'pulses') {
            items = ["Arhar (Tur/Red Gram)(Whole)","Bengal Gram (Gram)(Whole)","Bengal Gram Dal (Chana Dal)",
                     "Black Gram (Urd Beans)(Whole)","Black Gram Dal (Urd Dal)","Green Gram Dal (Moong Dal)",
                     "Kabuli Chana (Chickpeas-White)","Kulthi (Horse Gram)","Moath Dal"];
        } else if (category === 'vegetables') {
            items = ["Ashgourd","Broad Beans","Bitter Gourd","Bottle Gourd","Brinjal","Cabbage","Capsicum",
                     "Carrot","Cluster Beans","Coriander (Leaves)","Cauliflower","Drumstick","Green Chilli",
                     "Onion","Potato","Pumpkin","Raddish","Snakeguard","Sweet Potato","Tomato"];
        }

        if (items.length > 0) {
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item; // Backend uses .title(), so keep proper casing
                option.textContent = item;
                varietySelect.appendChild(option);
            });
            varietySection.style.display = 'block';
        } else {
            varietySection.style.display = 'none';
        }
    });

    // Prediction Handler
    document.getElementById('getPrediction').addEventListener('click', function() {
        const selectedCategory = document.getElementById('category').value;
        const selectedVariety = document.getElementById('variety').value;
        const predictionTable = document.getElementById('predictionTable');

        if (!selectedCategory || !selectedVariety) {
            alert("Please select category and variety!");
            return;
        }

        // Use local backend or specific environment URL
        fetch("/predict", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: selectedCategory, variety: selectedVariety })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            predictionTable.innerHTML = "<tr><th>Date</th><th>Min Price</th><th>Max Price</th><th>Predicted Modal Price</th><th>Price Per kg</th></tr>";
            const labels = [];
            const predictedPrices = [];
            
            data.weekly_predictions.forEach(pred => {
                predictionTable.innerHTML += `<tr><td>${pred.Date}</td><td>₹${pred.Min_Price}</td><td>₹${pred.Max_Price}</td><td>₹${pred.Predicted_Modal_Price}</td><td>₹${pred.Price_Per_kg}</td></tr>`;
                labels.push(pred.Date);
                predictedPrices.push(pred.Predicted_Modal_Price);
            });

            updateChart(labels, predictedPrices);
        })
        .catch(err => alert("Error: " + err.message));
    });

    // Authentication Form Logic
    const authForm = document.getElementById("auth-form");
    const emailField = document.getElementById("email");
    const toggleText = document.getElementById("toggle-form");

    authForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const email = emailField.value;
        const isSignup = !emailField.classList.contains("hidden");
        
        const endpoint = isSignup ? "/signup" : "/login";

        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, ...(isSignup && { email }) })
        })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
            if (!ok) return alert(data.error);
            
            alert(data.message);
            if (!isSignup) {
                isLoggedIn = true;
                updateUsernameDisplay(username);
                openTab(null, 'insight');
            } else {
                location.reload(); // Simple reset after signup
            }
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        isLoggedIn = false;
        fetch("/logout").then(() => {
            updateUsernameDisplay('');
            alert('Logged out.');
            location.reload();
        });
    });
});

// Helper: Chart Update
function updateChart(labels, dataPoints) {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Predicted Modal Price',
            data: dataPoints,
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.2)',
            fill: true
        }]
    };

    if (predictionChartInstance) {
        predictionChartInstance.data = chartData;
        predictionChartInstance.update();
    } else {
        predictionChartInstance = new Chart(ctx, { type: 'line', data: chartData });
    }
}