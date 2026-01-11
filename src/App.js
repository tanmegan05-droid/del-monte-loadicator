import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [draft, setDraft] = useState('');
  const [draftUnit, setDraftUnit] = useState('meters');
  const [kg, setKg] = useState('');
  const [stabilityData, setStabilityData] = useState([]);
  const [knData, setKnData] = useState({ heelAngles: [], data: [] });
  const [displacement, setDisplacement] = useState(null);
  const [gzData, setGzData] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Load Excel files on component mount
  useEffect(() => {
    loadExcelFiles();
  }, []);

  const loadExcelFiles = async () => {
    try {
      // Load stability data from JSON (converted from Stability.xlsx)
      const stabilityResponse = await fetch(process.env.PUBLIC_URL + '/stability-data.json');
      const stabilityData = await stabilityResponse.json();
      setStabilityData(stabilityData);

      // Load KN curve data from JSON (converted from extracted_data 2 copy.xlsx)
      const knResponse = await fetch(process.env.PUBLIC_URL + '/kn-curve-data.json');
      const knData = await knResponse.json();
      setKnData(knData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data files:', error);
      setLoading(false);
      alert('Error loading data files. Please ensure the JSON files are in the public folder.');
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (!draft || isNaN(draft)) {
      newErrors.draft = 'Please enter a valid draft value';
    } else {
      const draftValue = parseFloat(draft);
      if (draftUnit === 'meters' && (draftValue < 0 || draftValue > 50)) {
        newErrors.draft = 'Draft should be between 0 and 50 meters';
      } else if (draftUnit === 'feet' && (draftValue < 0 || draftValue > 164)) {
        newErrors.draft = 'Draft should be between 0 and 164 feet';
      }
    }
    
    if (!kg || isNaN(kg)) {
      newErrors.kg = 'Please enter a valid KG value';
    } else {
      const kgValue = parseFloat(kg);
      if (kgValue < 0 || kgValue > 100) {
        newErrors.kg = 'KG should be between 0 and 100 meters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const interpolateDisplacement = (draftValue) => {
    if (stabilityData.length === 0) return null;

    // Find the two data points to interpolate between
    let lowerPoint = null;
    let upperPoint = null;

    for (let i = 0; i < stabilityData.length; i++) {
      if (stabilityData[i].draft <= draftValue) {
        lowerPoint = stabilityData[i];
      }
      if (stabilityData[i].draft >= draftValue && !upperPoint) {
        upperPoint = stabilityData[i];
        break;
      }
    }

    if (!lowerPoint && upperPoint) {
      return upperPoint.displacement;
    }
    if (lowerPoint && !upperPoint) {
      return lowerPoint.displacement;
    }
    if (!lowerPoint && !upperPoint) {
      return null;
    }

    // Linear interpolation
    if (lowerPoint.draft === upperPoint.draft) {
      return lowerPoint.displacement;
    }

    const ratio = (draftValue - lowerPoint.draft) / (upperPoint.draft - lowerPoint.draft);
    return lowerPoint.displacement + ratio * (upperPoint.displacement - lowerPoint.displacement);
  };

  const calculateGZ = () => {
    if (!validateInputs()) return;

    let draftValue = parseFloat(draft);
    
    // Convert feet to meters if necessary
    if (draftUnit === 'feet') {
      draftValue = draftValue * 0.3048;
    }

    // Calculate displacement
    const calculatedDisplacement = interpolateDisplacement(draftValue);
    setDisplacement(calculatedDisplacement);

    if (!calculatedDisplacement || knData.data.length === 0) {
      alert('Unable to calculate GZ curve. Please check your inputs.');
      return;
    }

    // Find the two displacement rows to interpolate between
    let lowerRow = null;
    let upperRow = null;

    for (let i = 0; i < knData.data.length; i++) {
      if (knData.data[i].displacement <= calculatedDisplacement) {
        lowerRow = knData.data[i];
      }
      if (knData.data[i].displacement >= calculatedDisplacement && !upperRow) {
        upperRow = knData.data[i];
        break;
      }
    }

    // Handle edge cases
    if (!lowerRow && upperRow) {
      lowerRow = upperRow;
    }
    if (lowerRow && !upperRow) {
      upperRow = lowerRow;
    }

    // Interpolate KN values for each heel angle
    const kgValue = parseFloat(kg);
    const gzCurve = knData.heelAngles.map((heelAngle, index) => {
      let knValue;
      
      if (lowerRow.displacement === upperRow.displacement) {
        knValue = lowerRow.knValues[index];
      } else {
        // Linear interpolation
        const ratio = (calculatedDisplacement - lowerRow.displacement) / 
                     (upperRow.displacement - lowerRow.displacement);
        knValue = lowerRow.knValues[index] + 
                  ratio * (upperRow.knValues[index] - lowerRow.knValues[index]);
      }
      
      // Calculate GZ: GZ = KN - KG * sin(heel angle)
      const heelAngleRad = (heelAngle * Math.PI) / 180;
      const gz = knValue - kgValue * Math.sin(heelAngleRad);
      
      return {
        heelAngle: heelAngle,
        gz: gz
      };
    });

    setGzData(gzCurve);
  };

  const exportToCSV = () => {
    if (gzData.length === 0) {
      alert('Please calculate the GZ curve first');
      return;
    }

    let csvContent = 'Heel Angle (degrees),GZ (meters)\n';
    gzData.forEach(point => {
      csvContent += `${point.heelAngle},${point.gz.toFixed(4)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gz-curve-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (gzData.length === 0) {
      alert('Please calculate the GZ curve first');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Del Monte Loadicator - GZ Curve Report', 14, 20);
    
    // Add input parameters
    doc.setFontSize(12);
    doc.text(`Draft: ${draft} ${draftUnit}`, 14, 35);
    doc.text(`KG (Vertical Center of Gravity): ${kg} meters`, 14, 42);
    if (displacement !== null) {
      doc.text(`Displacement: ${displacement.toFixed(2)} tonnes`, 14, 49);
    }
    
    // Add table of GZ data
    autoTable(doc, {
      startY: 60,
      head: [['Heel Angle (degrees)', 'GZ (meters)']],
      body: gzData.map(point => [
        point.heelAngle.toFixed(2),
        point.gz.toFixed(4)
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save('gz-curve-report.pdf');
  };

  const chartData = {
    labels: gzData.map(point => point.heelAngle.toFixed(1)),
    datasets: [
      {
        label: 'GZ Curve (meters)',
        data: gzData.map(point => point.gz),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'GZ Curve - Righting Arm vs Heel Angle',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Heel Angle (degrees)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'GZ (meters)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading data files...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>Del Monte Loadicator</h1>
          <p>Calculate displacement and GZ curves for vessel stability</p>
        </header>

        <div className="input-section">
          <h2>Input Parameters</h2>
          <div className="form-group">
            <label htmlFor="draft">Draft:</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Enter draft value"
                step="0.01"
              />
              <select
                value={draftUnit}
                onChange={(e) => setDraftUnit(e.target.value)}
                className="unit-selector"
              >
                <option value="meters">Meters</option>
                <option value="feet">Feet</option>
              </select>
            </div>
            {errors.draft && <span className="error">{errors.draft}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="kg">KG (Vertical Center of Gravity):</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="kg"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="Enter KG value"
                step="0.01"
              />
              <span className="unit-label">meters</span>
            </div>
            {errors.kg && <span className="error">{errors.kg}</span>}
          </div>

          <button className="calculate-btn" onClick={calculateGZ}>
            Calculate GZ Curve
          </button>
        </div>

        {displacement !== null && (
          <div className="results-section">
            <h2>Results</h2>
            <div className="displacement-result">
              <h3>Displacement: {displacement.toFixed(2)} tonnes</h3>
            </div>

            {gzData.length > 0 && (
              <>
                <div className="chart-container">
                  <Line data={chartData} options={chartOptions} />
                </div>

                <div className="data-table">
                  <h3>GZ Curve Data Points</h3>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Heel Angle (degrees)</th>
                          <th>GZ (meters)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gzData.map((point, index) => (
                          <tr key={index}>
                            <td>{point.heelAngle.toFixed(2)}</td>
                            <td>{point.gz.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="export-buttons">
                  <button className="export-btn csv" onClick={exportToCSV}>
                    Export to CSV
                  </button>
                  <button className="export-btn pdf" onClick={exportToPDF}>
                    Export to PDF
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
