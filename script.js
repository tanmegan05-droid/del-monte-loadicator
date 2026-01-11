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
        const momentOfInertia = ((this.lengthBP * Math.pow(this.breadth, 3)) / 12) * this.waterplaneCoefficientArea;
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
let canvas = null;
let ctx = null;

// Form submission handler
document.getElementById('loadicatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get input values
    const draft = parseFloat(document.getElementById('draft').value);
    const kg = parseFloat(document.getElementById('kg').value);
    
    // Validate inputs
    if (isNaN(draft) || isNaN(kg) || draft <= 0 || kg < 0) {
        alert('Please enter valid numbers: draft must be positive and KG must be non-negative.');
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
    canvas = document.getElementById('gzChart');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    const container = canvas.parentElement;
    canvas.width = container.clientWidth - 40;
    canvas.height = 350;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw chart
    drawChart(gzData);
}

function drawChart(gzData) {
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Find min and max values
    const maxAngle = Math.max(...gzData.map(p => p.angle));
    const minGZ = Math.min(...gzData.map(p => p.gz), 0);
    const maxGZ = Math.max(...gzData.map(p => p.gz));
    const gzRange = maxGZ - minGZ;
    
    // Add some padding to the range
    const yMin = minGZ - gzRange * 0.1;
    const yMax = maxGZ + gzRange * 0.1;
    const yRange = yMax - yMin;
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (angles)
    for (let i = 0; i <= 6; i++) {
        const x = padding + (i / 6) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
    }
    
    // Horizontal grid lines (GZ values)
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
    
    // Draw zero line if needed
    if (yMin < 0 && yMax > 0) {
        const zeroY = padding + chartHeight - ((0 - yMin) / yRange) * chartHeight;
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, zeroY);
        ctx.lineTo(padding + chartWidth, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw curve
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    gzData.forEach((point, index) => {
        const x = padding + (point.angle / maxAngle) * chartWidth;
        const y = padding + chartHeight - ((point.gz - yMin) / yRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#2196F3';
    gzData.forEach(point => {
        const x = padding + (point.angle / maxAngle) * chartWidth;
        const y = padding + chartHeight - ((point.gz - yMin) / yRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis labels (angles)
    for (let i = 0; i <= 6; i++) {
        const angle = (i / 6) * maxAngle;
        const x = padding + (i / 6) * chartWidth;
        ctx.fillText(angle.toFixed(0) + '°', x, canvas.height - padding + 20);
    }
    
    // Y-axis labels (GZ values)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = yMin + (i / 5) * yRange;
        const y = padding + chartHeight - (i / 5) * chartHeight;
        ctx.fillText(value.toFixed(2), padding - 10, y + 4);
    }
    
    // Draw axis titles
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    // X-axis title
    ctx.fillText('Heel Angle (degrees)', canvas.width / 2, canvas.height - 10);
    
    // Y-axis title
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('GZ - Righting Lever (m)', 0, 0);
    ctx.restore();
    
    // Chart title
    ctx.font = 'bold 16px Arial';
    ctx.fillText('GZ Curve - Righting Lever vs Heel Angle', canvas.width / 2, 25);
}
