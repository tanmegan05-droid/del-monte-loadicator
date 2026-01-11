// Ship stability calculation functions
class Loadicator {
    constructor(draft, kg) {
        this.draft = draft;
        this.kg = kg;
        
        // Simplified ship parameters (can be adjusted for specific vessels)
        // These are representative values for a typical cargo vessel
        this.lengthBP = 150; // Length between perpendiculars (m)
        this.breadth = 23; // Breadth molded (m)
        this.blockCoefficient = 0.70; // Block coefficient
        this.waterplaneCoefficientArea = 0.85; // Waterplane area coefficient
    }

    // Calculate displacement based on draft
    calculateDisplacement() {
        // Displacement = Volume * Density of water
        // Volume approximation using block coefficient
        const volume = this.lengthBP * this.breadth * this.draft * this.blockCoefficient;
        const seaWaterDensity = 1.025; // tonnes per cubic meter
        const displacement = volume * seaWaterDensity;
        
        return displacement;
    }

    // Calculate KB (vertical center of buoyancy)
    calculateKB() {
        // Simplified formula for KB
        // For ship forms, KB is approximately at draft/2 for rectangular sections
        // Using more realistic formula: KB ≈ 0.53 * draft for ship forms
        return 0.53 * this.draft;
    }

    // Calculate BM (metacentric radius)
    calculateBM() {
        // BM = I / V
        // I = moment of inertia of waterplane area
        // V = volume of displacement
        
        const waterplaneArea = this.lengthBP * this.breadth * this.waterplaneCoefficientArea;
        const momentOfInertia = (this.lengthBP * Math.pow(this.breadth, 3)) / 12 * this.waterplaneCoefficientArea;
        const volume = this.lengthBP * this.breadth * this.draft * this.blockCoefficient;
        
        const BM = momentOfInertia / volume;
        return BM;
    }

    // Calculate KM (height of metacenter above keel)
    calculateKM() {
        const KB = this.calculateKB();
        const BM = this.calculateBM();
        return KB + BM;
    }

    // Calculate GM (metacentric height)
    calculateGM() {
        const KM = this.calculateKM();
        const GM = KM - this.kg;
        return GM;
    }

    // Calculate GZ (righting lever) for a given heel angle
    calculateGZ(heelAngle) {
        // GZ = GM * sin(θ) - (1/2) * (BM/draft) * sin(θ)^2 * tan(θ)
        // For small angles, GZ ≈ GM * sin(θ)
        // For larger angles, using more complete formula
        
        const angleRad = heelAngle * Math.PI / 180;
        const GM = this.calculateGM();
        
        if (Math.abs(heelAngle) < 15) {
            // For small angles, simple formula
            return GM * Math.sin(angleRad);
        } else {
            // For larger angles, more complex formula
            // Using simplified wall-sided formula
            const BM = this.calculateBM();
            const gz = GM * Math.sin(angleRad) - 
                      (BM / (2 * this.draft)) * Math.pow(Math.sin(angleRad), 2) * Math.tan(angleRad);
            return gz;
        }
    }

    // Generate GZ curve data points
    generateGZCurve() {
        const dataPoints = [];
        
        // Generate points from 0 to 60 degrees in 5-degree increments
        for (let angle = 0; angle <= 60; angle += 5) {
            const gz = this.calculateGZ(angle);
            dataPoints.push({
                angle: angle,
                gz: gz
            });
        }
        
        return dataPoints;
    }
}

// Chart instance
let gzChart = null;

// Form submission handler
document.getElementById('loadicatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get input values
    const draft = parseFloat(document.getElementById('draft').value);
    const kg = parseFloat(document.getElementById('kg').value);
    
    // Validate inputs
    if (isNaN(draft) || isNaN(kg) || draft <= 0 || kg <= 0) {
        alert('Please enter valid positive numbers for draft and KG.');
        return;
    }
    
    // Create loadicator instance
    const loadicator = new Loadicator(draft, kg);
    
    // Calculate displacement
    const displacement = loadicator.calculateDisplacement();
    
    // Generate GZ curve data
    const gzData = loadicator.generateGZCurve();
    
    // Display results
    displayResults(displacement, gzData);
});

function displayResults(displacement, gzData) {
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    
    // Display displacement
    document.getElementById('displacement').textContent = 
        displacement.toFixed(2) + ' tonnes';
    
    // Update GZ data table
    updateGZTable(gzData);
    
    // Update GZ chart
    updateGZChart(gzData);
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

function updateGZTable(gzData) {
    const tbody = document.getElementById('gzDataBody');
    tbody.innerHTML = '';
    
    gzData.forEach(point => {
        const row = document.createElement('tr');
        
        const angleCell = document.createElement('td');
        angleCell.textContent = point.angle.toFixed(1);
        
        const gzCell = document.createElement('td');
        gzCell.textContent = point.gz.toFixed(3);
        
        row.appendChild(angleCell);
        row.appendChild(gzCell);
        tbody.appendChild(row);
    });
}

function updateGZChart(gzData) {
    const ctx = document.getElementById('gzChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (gzChart) {
        gzChart.destroy();
    }
    
    // Extract data for chart
    const labels = gzData.map(point => point.angle);
    const values = gzData.map(point => point.gz);
    
    // Create new chart
    gzChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'GZ (m)',
                data: values,
                borderColor: 'rgb(33, 150, 243)',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgb(33, 150, 243)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'GZ Curve - Righting Lever vs Heel Angle',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return 'GZ: ' + context.parsed.y.toFixed(3) + ' m';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Heel Angle (degrees)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'GZ - Righting Lever (m)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}
