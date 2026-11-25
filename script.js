
// ======================================
// HOUSEHOLD APPLIANCE DATABASE
// ======================================

const applianceList = {
    "Ceiling Fan": 75,
    "LED Bulb": 9,
    "Tube Light": 40,
    "Television": 100,
    "Refrigerator": 200,
    "Washing Machine": 500,
    "Air Conditioner": 1500,
    "Microwave Oven": 1200,
    "Laptop": 65,
    "Desktop Computer": 200,
    "Water Heater": 2000,
    "Water Pump": 750,
    "Electric Iron": 1000,
    "Mixer Grinder": 500,
    "Electric Cooker": 1000,
    "Dishwasher": 1800,
    "Electric Kettle": 1500,
    "Room Heater": 2000
};

let chart = null;
let applianceCount = 0;
let dailyData = {};

// ======================================
// MONTH INITIALIZATION
// ======================================

const monthInput = document.getElementById("month");
const dayInput = document.getElementById("day");

function getCurrentMonth() {
    const now = new Date();

    return now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0");
}

monthInput.value = getCurrentMonth();

function storageKey() {
    return "householdElectricity_" + monthInput.value;
}

function loadMonthData() {
    try {
        dailyData = JSON.parse(
            localStorage.getItem(storageKey()) || "{}"
        );
    } catch (error) {
        dailyData = {};
        alert("Unable to load saved monthly data.");
    }
}

// ======================================
// GENERATE DAY DROPDOWN
// ======================================

function updateDays() {

    if (!monthInput.value) return;

    const [year, month] = monthInput.value.split("-").map(Number);

    const numberOfDays = new Date(year, month, 0).getDate();

    dayInput.innerHTML = "";

    for (let i = 1; i <= numberOfDays; i++) {

        const option = document.createElement("option");

        option.value = i;
        option.textContent = "Day " + i;

        dayInput.appendChild(option);
    }

    loadMonthData();
    clearAppliances();
    renderSavedDay();
}

monthInput.addEventListener("change", updateDays);

dayInput.addEventListener("change", function() {
    clearAppliances();
    renderSavedDay();
});

// ======================================
// ADD APPLIANCE
// ======================================

function addAppliance(data = null) {

    if (applianceCount >= 10) {
        alert("Maximum 10 appliances allowed per day.");
        return;
    }

    applianceCount++;

    const container =
        document.getElementById("applianceContainer");

    const card = document.createElement("div");

    card.className = "appliance";

    const heading = document.createElement("h3");
    heading.textContent = "Appliance " + applianceCount;
    card.appendChild(heading);

    // Appliance dropdown
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Select Appliance";

    const select = document.createElement("select");
    select.className = "applianceName";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = "Choose Appliance";

    select.appendChild(firstOption);

    Object.keys(applianceList).forEach(name => {

        const option = document.createElement("option");

        option.value = name;
        option.textContent = name;

        select.appendChild(option);
    });

    card.appendChild(nameLabel);
    card.appendChild(select);

    // Power rating
    const wattLabel = document.createElement("label");
    wattLabel.textContent = "Power Rating (Watts)";

    const watts = document.createElement("input");
    watts.type = "number";
    watts.className = "watts";
    watts.min = "0";
    watts.step = "any";
    watts.placeholder = "Enter watts";

    card.appendChild(wattLabel);
    card.appendChild(watts);

    // Quantity
    const quantityLabel = document.createElement("label");
    quantityLabel.textContent = "Number of Appliances";

    const quantity = document.createElement("input");
    quantity.type = "number";
    quantity.className = "quantity";
    quantity.min = "1";
    quantity.step = "1";
    quantity.value = "1";

    card.appendChild(quantityLabel);
    card.appendChild(quantity);

    // Usage hours
    const hoursLabel = document.createElement("label");
    hoursLabel.textContent = "Usage Hours Per Day";

    const hours = document.createElement("input");
    hours.type = "number";
    hours.className = "hours";
    hours.min = "0";
    hours.max = "24";
    hours.step = "0.1";
    hours.placeholder = "Enter hours";

    card.appendChild(hoursLabel);
    card.appendChild(hours);

    // Automatically fill watts
    select.addEventListener("change", function() {
        watts.value = applianceList[this.value] || "";
    });

    // Remove button
    const remove = document.createElement("button");

    remove.type = "button";
    remove.textContent = "Remove Appliance";
    remove.className = "remove-btn";

    remove.addEventListener("click", function() {
        card.remove();
        applianceCount--;
        renumberAppliances();
        updateAddButton();
    });

    card.appendChild(remove);

    container.appendChild(card);

    // Restore previously saved details
    if (data) {
        select.value = data.name;
        watts.value = data.watts;
        quantity.value = data.quantity;
        hours.value = data.hours;
    }

    updateAddButton();
}

// ======================================
// CLEAR AND RENUMBER APPLIANCES
// ======================================

function clearAppliances() {

    document.getElementById("applianceContainer").innerHTML = "";

    applianceCount = 0;

    updateAddButton();
}

function renumberAppliances() {

    const cards = document.querySelectorAll(".appliance");

    cards.forEach((card, index) => {
        card.querySelector("h3").textContent =
            "Appliance " + (index + 1);
    });
}

function updateAddButton() {

    const button = document.getElementById("addBtn");

    button.disabled = applianceCount >= 10;

    button.textContent = applianceCount >= 10
        ? "Maximum 10 Appliances Reached"
        : "+ Add Appliance";
}

// ======================================
// CALCULATE DAILY CONSUMPTION
// ======================================

function calculateDaily() {

    const cards = document.querySelectorAll(".appliance");

    if (cards.length === 0 || cards.length > 10) {
        alert("Please add between 1 and 10 appliances.");
        return null;
    }

    const appliances = [];

    let totalUnits = 0;

    const selectedNames = [];

    for (const card of cards) {

        const name = card.querySelector(".applianceName").value;

        const watts = Number(card.querySelector(".watts").value);

        const quantity = Number(card.querySelector(".quantity").value);

        const hours = Number(card.querySelector(".hours").value);

        if (!name) {
            alert("Please select every appliance.");
            return null;
        }

        if (
            !Number.isFinite(watts) ||
            !Number.isFinite(quantity) ||
            !Number.isFinite(hours) ||
            watts <= 0 ||
            quantity <= 0 ||
            !Number.isInteger(quantity) ||
            hours < 0 ||
            hours > 24
        ) {
            alert("Enter valid watts, quantity and usage hours for " + name);
            return null;
        }

        if (selectedNames.includes(name)) {
            alert("Select each appliance only once per day: " + name);
            return null;
        }

        selectedNames.push(name);

        // Daily units = Watts × Quantity × Hours / 1000
        const units = (watts * quantity * hours) / 1000;

        appliances.push({
            name,
            watts,
            quantity,
            hours,
            units
        });

        totalUnits += units;
    }

    return {
        appliances,
        totalUnits
    };
}

// ======================================
// SAVE DAILY DATA
// ======================================

function saveDay() {

    if (!monthInput.value) {
        alert("Please select a month.");
        return;
    }

    const result = calculateDaily();

    if (!result) return;

    const day = dayInput.value;

    const rate = Number(document.getElementById("rate").value);

    if (!Number.isFinite(rate) || rate < 0) {
        alert("Enter a valid electricity price.");
        return;
    }

    const units = result.totalUnits;

    const cost = units * rate;

    dailyData[day] = {
        appliances: result.appliances,
        units: units,
        cost: cost,
        rate: rate
    };

    try {
        localStorage.setItem(
            storageKey(),
            JSON.stringify(dailyData)
        );
    } catch (error) {
        alert("Unable to save data. Browser storage may be full.");
        return;
    }

    displayDailyResult(day);

    generateMonthlyReport();

    alert("Day " + day + " consumption saved successfully!");
}

// ======================================
// DISPLAY DAILY RESULTS
// ======================================

function displayDailyResult(day) {

    const record = dailyData[day];

    if (!record) return;

    let output = "<h3>Day " + day + " Report</h3>";

    record.appliances.forEach(a => {

        output += `
            <div class="result-card">
                <strong>${a.name}</strong><br>
                Power: ${a.watts} W<br>
                Quantity: ${a.quantity}<br>
                Usage: ${a.hours} hours<br>
                Consumption: ${a.units.toFixed(3)} kWh
            </div>
        `;
    });

    output += `
        <hr>
        <h3>Total Daily Consumption</h3>
        ${record.units.toFixed(3)} kWh
        <h3>Daily Electricity Cost</h3>
        ₹${record.cost.toFixed(2)}
    `;

    document.getElementById("dailyResults").innerHTML = output;
}

// ======================================
// RESTORE SAVED DAY
// ======================================

function renderSavedDay() {

    const day = dayInput.value;

    if (!day) return;

    const record = dailyData[day];

    const resultBox = document.getElementById("dailyResults");

    if (record) {

        record.appliances.forEach(a => addAppliance(a));

        displayDailyResult(day);

    } else {

        resultBox.textContent =
            "No data saved for this day. Enter appliance details.";
    }
}

// ======================================
// GENERATE MONTHLY REPORT
// ======================================

function generateMonthlyReport() {

    if (!monthInput.value) return;

    const [year, month] = monthInput.value.split("-").map(Number);

    const days = new Date(year, month, 0).getDate();

    const labels = [];

    const consumption = [];

    let totalUnits = 0;
    let totalCost = 0;
    let recordedDays = 0;

    let highest = -1;
    let lowest = Infinity;

    let highestDay = 0;
    let lowestDay = 0;

    let highestDayUnits = 0;
    let lowestDayUnits = 0;

    for (let i = 1; i <= days; i++) {

        labels.push("Day " + i);

        const record = dailyData[i];

        if (record) {

            const units = Number(record.units) || 0;

            consumption.push(units);

            totalUnits += units;
            totalCost += Number(record.cost) || 0;

            recordedDays++;

            if (units > highest) {
                highest = units;
                highestDay = i;
                highestDayUnits = units;
            }

            if (units < lowest) {
                lowest = units;
                lowestDay = i;
                lowestDayUnits = units;
            }

        } else {

            // Missing days are displayed as gaps, not assumed zero use
            consumption.push(null);
        }
    }

    const average = recordedDays
        ? totalUnits / recordedDays
        : 0;

    const output = `
        <div class="summary-grid">

            <div class="summary-card">
                Recorded Days
                <strong>${recordedDays}/${days}</strong>
            </div>

            <div class="summary-card">
                Monthly Consumption
                <strong>${totalUnits.toFixed(2)} kWh</strong>
            </div>

            <div class="summary-card">
                Monthly Electricity Cost
                <strong>₹${totalCost.toFixed(2)}</strong>
            </div>

            <div class="summary-card">
                Average Daily Usage
                <strong>${average.toFixed(2)} kWh</strong>
            </div>

            <div class="summary-card">
                Highest Consumption
                <strong>${highestDay ? "Day " + highestDay : "N/A"}</strong>
                ${highestDay ? highestDayUnits.toFixed(2) + " kWh" : ""}
            </div>

            <div class="summary-card">
                Lowest Consumption
                <strong>${lowestDay ? "Day " + lowestDay : "N/A"}</strong>
                ${lowestDay ? lowestDayUnits.toFixed(2) + " kWh" : ""}
            </div>

        </div>

        <h3>Daily Consumption Details</h3>

        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Units (kWh)</th>
                    <th>Cost (₹)</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>
                ${Array.from({length: days}, (_, index) => {

                    const day = index + 1;
                    const record = dailyData[day];

                    return `
                        <tr>
                            <td>${day}</td>
                            <td>${record ? record.units.toFixed(2) : "-"}</td>
                            <td>${record ? record.cost.toFixed(2) : "-"}</td>
                            <td>${record ? "Saved" : "Not entered"}</td>
                        </tr>
                    `;
                }).join("")}
            </tbody>
        </table>
    `;

    document.getElementById("monthlyResults").innerHTML = output;

    generateGraph(labels, consumption);

    generateTips(
        average,
        highestDayUnits,
        totalUnits,
        recordedDays
    );
}

// ======================================
// MONTHLY GRAPH
// ======================================

function generateGraph(labels, consumption) {

    if (typeof Chart === "undefined") {
        alert("Chart.js could not load. Check your internet connection.");
        return;
    }

    const ctx = document.getElementById("myChart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Daily Electricity Consumption (kWh)",

                data: consumption,

                borderColor: "#087e8b",

                backgroundColor: "rgba(8, 126, 139, 0.15)",

                borderWidth: 3,

                pointRadius: 4,

                pointBackgroundColor: "#16a085",

                tension: 0.3,

                fill: true,

                spanGaps: false

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {

                title: {
                    display: true,
                    text: "Daily Electricity Consumption Variation"
                },

                legend: {
                    display: true,
                    position: "bottom"
                }

            },

            scales: {

                x: {
                    title: {
                        display: true,
                        text: "Days of the Month"
                    }
                },

                y: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text: "Electricity Consumption (kWh)"
                    }
                }

            }

        }

    });
}

// ======================================
// ELECTRICITY SAVING SUGGESTIONS
// ======================================

function generateTips(average, highest, total, recordedDays) {

    const box = document.getElementById("tips");

    if (!recordedDays) {
        box.textContent = "Save daily consumption data to receive suggestions.";
        return;
    }

    let tips = [];

    tips.push(
        "Switch off lights and fans when they are not required."
    );

    tips.push(
        "Use LED bulbs instead of traditional high-power bulbs."
    );

    tips.push(
        "Avoid keeping electrical appliances on standby."
    );

    if (highest > average * 1.5 && average > 0) {

        tips.push(
            "Your highest usage day is significantly above your average. Check which appliances were used on that day."
        );
    }

    if (average > 10) {

        tips.push(
            "Your recorded average is above 10 units per day. Review high-power appliances such as ACs and water heaters."
        );

    } else {

        tips.push(
            "Continue monitoring your daily consumption to maintain efficient electricity use."
        );

    }

    box.innerHTML = tips.map(tip =>
        `<div class="result-card">💡 ${tip}</div>`
    ).join("");
}

// ======================================
// START APPLICATION
// ======================================

updateDays();

